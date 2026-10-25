package com.udaan.ai.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.udaan.ai.entity.AiInteraction;
import com.udaan.ai.repository.AiInteractionRepository;
import com.udaan.profile.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Component
public class GroqClient {

    private static final Logger log = LoggerFactory.getLogger(GroqClient.class);

    @Value("${groq.api.key:}")
    private String apiKey;

    @Value("${groq.api.url:https://api.groq.com/openai/v1/chat/completions}")
    private String apiUrl;

    @Value("${groq.api.model:openai/gpt-oss-120b}")
    private String defaultModel;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final AiInteractionRepository aiInteractionRepository;

    public GroqClient(ObjectMapper objectMapper, AiInteractionRepository aiInteractionRepository) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = objectMapper;
        this.aiInteractionRepository = aiInteractionRepository;
    }

    public String generateChatCompletion(String systemPrompt, String userPrompt, String module, String operationType, User user) {
        long startTime = System.currentTimeMillis();
        String activeKey = System.getenv("GROQ_API_KEY");
        if (activeKey == null || activeKey.isBlank()) {
            activeKey = this.apiKey;
        }
        if (activeKey == null || activeKey.isBlank() || activeKey.contains("your_groq_api_key")) {
            activeKey = readKeyFromDotenv();
        }

        if (activeKey == null || activeKey.isBlank() || activeKey.contains("your_groq_api_key")) {
            log.warn("Groq API key not configured. Using deterministic fallback for module: {}", module);
            recordInteraction(user, module, operationType, defaultModel, (int)(System.currentTimeMillis() - startTime), "FALLBACK", "No API key configured");
            return null; // Signals service to use deterministic rule-based output
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(activeKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", defaultModel);
            requestBody.put("temperature", 0.3);
            requestBody.put("max_tokens", 2048);

            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemPrompt));
            messages.add(Map.of("role", "user", "content", userPrompt));
            requestBody.put("messages", messages);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, entity, String.class);

            long duration = System.currentTimeMillis() - startTime;

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                String content = root.path("choices").get(0).path("message").path("content").asText();
                recordInteraction(user, module, operationType, defaultModel, (int) duration, "SUCCESS", null);
                return content;
            } else {
                recordInteraction(user, module, operationType, defaultModel, (int) duration, "ERROR", "HTTP " + response.getStatusCode());
                return null;
            }
        } catch (Exception ex) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Groq API invocation failed for operation [{}]: {}", operationType, ex.getMessage());
            recordInteraction(user, module, operationType, defaultModel, (int) duration, "ERROR", ex.getMessage());
            return null;
        }
    }

    public String extractJsonBlock(String raw) {
        if (raw == null) return null;
        raw = raw.trim();
        if (raw.contains("```json")) {
            int start = raw.indexOf("```json") + 7;
            int end = raw.indexOf("```", start);
            if (end != -1) {
                return raw.substring(start, end).trim();
            }
        } else if (raw.contains("```")) {
            int start = raw.indexOf("```") + 3;
            int end = raw.indexOf("```", start);
            if (end != -1) {
                return raw.substring(start, end).trim();
            }
        }

        // If not wrapped in markdown code blocks, find outer array [...] or object {...}
        int firstBracket = raw.indexOf('[');
        int firstBrace = raw.indexOf('{');
        if (firstBracket != -1 && (firstBrace == -1 || firstBracket < firstBrace)) {
            int lastBracket = raw.lastIndexOf(']');
            if (lastBracket > firstBracket) {
                return raw.substring(firstBracket, lastBracket + 1).trim();
            }
        } else if (firstBrace != -1) {
            int lastBrace = raw.lastIndexOf('}');
            if (lastBrace > firstBrace) {
                return raw.substring(firstBrace, lastBrace + 1).trim();
            }
        }

        return raw;
    }

    private String readKeyFromDotenv() {
        try {
            java.nio.file.Path[] candidates = {
                    java.nio.file.Paths.get(".env"),
                    java.nio.file.Paths.get("..", ".env"),
                    java.nio.file.Paths.get(System.getProperty("user.dir", "."), ".env"),
                    java.nio.file.Paths.get(System.getProperty("user.dir", "."), "..", ".env")
            };
            for (java.nio.file.Path p : candidates) {
                if (java.nio.file.Files.exists(p)) {
                    for (String line : java.nio.file.Files.readAllLines(p)) {
                        line = line.trim();
                        if (line.startsWith("GROQ_API_KEY=") && !line.startsWith("#")) {
                            String val = line.substring("GROQ_API_KEY=".length()).trim();
                            if (val.startsWith("\"") && val.endsWith("\"") && val.length() >= 2) {
                                val = val.substring(1, val.length() - 1);
                            }
                            if (val.startsWith("'") && val.endsWith("'") && val.length() >= 2) {
                                val = val.substring(1, val.length() - 1);
                            }
                            if (!val.isBlank() && !val.contains("your_groq_api_key")) {
                                return val;
                            }
                        }
                    }
                }
            }
        } catch (Exception ignored) {}
        return null;
    }

    private void recordInteraction(User user, String module, String operationType, String model, int duration, String status, String error) {
        try {
            AiInteraction interaction = new AiInteraction(user, module, operationType, model, duration, status);
            interaction.setErrorMessage(error);
            aiInteractionRepository.save(interaction);
        } catch (Exception e) {
            log.warn("Could not record AI interaction audit: {}", e.getMessage());
        }
    }
}
