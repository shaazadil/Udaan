import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import type { DocumentNote, Tag } from '../../types';
import {
  IconSearch,
  IconPlus,
  IconTrash,
  IconSparkles,
  IconSend,
} from '../../components/brand/Icons';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input, Textarea } from '../../components/ui/Input';

interface AskResponse {
  answer: string;
  sourcesUsed: string[];
  confidenceScore: number;
}

interface RevisionQuestion {
  question: string;
  answerHint: string;
  difficulty: string;
}

export const KnowledgePage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentNote[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Mode: reading note, creating new note, or asking grounded AI
  const [activePane, setActivePane] = useState<'view' | 'create' | 'ask'>('view');

  // Create form
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('Database, Architecture');
  const [isSavingDoc, setIsSavingDoc] = useState(false);

  // Grounded Q&A
  const [userQuestion, setUserQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<AskResponse | null>(null);

  // Revision flashcards
  const [revisionCards, setRevisionCards] = useState<RevisionQuestion[]>([]);
  const [isGeneratingRevision, setIsGeneratingRevision] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [activeUserId, setActiveUserId] = useState<number>(() => Number(localStorage.getItem('udaan_user_id') || '1'));

  const fetchDocsAndTags = async (uid: number) => {
    setIsLoading(true);
    try {
      const [docs, tagsList] = await Promise.all([
        apiClient.get<DocumentNote[]>(`/knowledge/documents?userId=${uid}`),
        apiClient.get<Tag[]>('/knowledge/tags'),
      ]);
      setDocuments(docs);
      setTags(tagsList);
      if (docs.length > 0) {
        setSelectedDocId(docs[0].id);
      } else {
        setSelectedDocId(null);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocsAndTags(activeUserId);
    const handleUserChanged = () => {
      const newUid = Number(localStorage.getItem('udaan_user_id') || '1');
      setActiveUserId(newUid);
      fetchDocsAndTags(newUid);
    };
    window.addEventListener('udaan_user_changed', handleUserChanged);
    return () => window.removeEventListener('udaan_user_changed', handleUserChanged);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchDocsAndTags(activeUserId);
      return;
    }
    try {
      const results = await apiClient.get<DocumentNote[]>(
        `/knowledge/search?userId=${activeUserId}&query=${encodeURIComponent(searchQuery)}`
      );
      setDocuments(results);
      if (results.length > 0) {
        setSelectedDocId(results[0].id);
      }
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsSavingDoc(true);
    try {
      const tagArray = newTags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const saved = await apiClient.post<DocumentNote>(`/knowledge/documents?userId=${activeUserId}`, {
        title: newTitle.trim(),
        content: newContent.trim(),
        tagNames: tagArray,
      });

      setDocuments([saved, ...documents]);
      setSelectedDocId(saved.id);
      setNewTitle('');
      setNewContent('');
      setActivePane('view');
    } catch (err: any) {
      alert(`Failed to save note: ${err.message || 'Server error'}`);
    } finally {
      setIsSavingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId: number) => {
    if (!window.confirm('Are you sure you want to delete this technical note?')) return;

    try {
      await apiClient.delete(`/knowledge/documents/${docId}`);
      const updated = documents.filter((d) => d.id !== docId);
      setDocuments(updated);
      if (selectedDocId === docId) {
        setSelectedDocId(updated.length > 0 ? updated[0].id : null);
      }
    } catch (err: any) {
      alert(`Delete failed: ${err.message || 'Server error'}`);
    }
  };

  const handleAskQuestion = async () => {
    if (!userQuestion.trim()) return;

    setIsAsking(true);
    setAiAnswer(null);
    try {
      const response = await apiClient.post<AskResponse>(`/knowledge/ask?userId=${activeUserId}`, {
        question: userQuestion.trim(),
        topK: 3,
      });
      setAiAnswer(response);
    } catch (err: any) {
      alert(`Query failed: ${err.message || 'Server error'}`);
    } finally {
      setIsAsking(false);
    }
  };

  const handleGenerateRevision = async (docId: number) => {
    setIsGeneratingRevision(true);
    try {
      const questions = await apiClient.post<RevisionQuestion[]>(
        `/knowledge/revision-questions?userId=${activeUserId}&documentId=${docId}`
      );
      setRevisionCards(questions);
    } catch (err: any) {
      alert(`Failed to generate revision questions: ${err.message || 'Server error'}`);
    } finally {
      setIsGeneratingRevision(false);
    }
  };

  const getTagName = (t: any): string => {
    if (typeof t === 'string') return t;
    if (t && typeof t.name === 'string') return t.name;
    return '';
  };

  const selectedDoc = documents.find((d) => d.id === selectedDocId);

  // Filtered documents by tag
  const filteredDocs = selectedTag
    ? documents.filter((d) => d.tags?.some((t) => getTagName(t).toLowerCase() === selectedTag.toLowerCase()))
    : documents;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-border">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-forest">
            Module 4: Knowledge Intelligence
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-charcoal mt-0.5">
            Personal Knowledge Library &amp; Grounded RAG
          </h1>
          <p className="text-sm text-neutral-muted mt-1">
            Index engineering concepts, revision summaries, and query your notes with Groq AI citations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setActivePane('ask')}
            icon={<IconSparkles size={14} />}
          >
            Ask Grounded AI
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setActivePane('create')}
            icon={<IconPlus size={14} />}
          >
            New Technical Note
          </Button>
        </div>
      </div>

      {/* 3-Column Editorial Knowledge Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px]">
        {/* =====================================================================
            COLUMN 1: CATEGORIES & TAGS (Lg: 3 cols)
            ===================================================================== */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="p-4">
            {/* Search Input */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-ivory text-charcoal text-xs rounded-lg border border-neutral-border pl-8 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-forest"
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-muted">
                  <IconSearch size={14} />
                </span>
              </div>
            </form>

            {/* Tag Filter List */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-muted uppercase tracking-wider mb-2">
                <span>Tags ({tags.length})</span>
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="text-[11px] text-forest hover:underline capitalize"
                  >
                    Clear filter
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedTag(null)}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  selectedTag === null
                    ? 'bg-forest-surface text-forest font-semibold'
                    : 'text-neutral-muted hover:text-charcoal hover:bg-ivory'
                }`}
              >
                All Technical Notes ({documents.length})
              </button>

              {tags.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTag(t.name)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedTag === t.name
                      ? 'bg-forest-surface text-forest font-semibold'
                      : 'text-neutral-muted hover:text-charcoal hover:bg-ivory'
                  }`}
                >
                  <span>#{t.name}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Grounded Citation Notice */}
          <div className="p-3.5 bg-ivory rounded-xl border border-neutral-border text-xs text-neutral-muted leading-relaxed">
            <strong className="text-charcoal block mb-0.5">Strict Retrieval Grounding</strong>
            Answers generated by the knowledge assistant cite directly from your stored notes and chunks in MySQL. If relevant context is absent, the system states it honestly.
          </div>
        </div>

        {/* =====================================================================
            COLUMN 2: NOTES & RESOURCES LIST (Lg: 4 cols)
            ===================================================================== */}
        <div className="lg:col-span-4 space-y-2.5 overflow-y-auto max-h-[750px] pr-1">
          {isLoading && <div className="text-xs text-neutral-muted py-4 text-center">Loading technical notes...</div>}
          {!isLoading && filteredDocs.map((doc) => {
            const isSelected = selectedDocId === doc.id && activePane === 'view';
            return (
              <div
                key={doc.id}
                onClick={() => {
                  setSelectedDocId(doc.id);
                  setActivePane('view');
                  setRevisionCards([]);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'bg-white border-forest shadow-subtle'
                    : 'bg-white/80 border-neutral-border hover:bg-white hover:border-neutral-border-dark'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="text-sm font-semibold text-charcoal line-clamp-1">
                    {doc.title}
                  </h4>
                  <span className="text-[10px] text-neutral-muted font-mono flex-shrink-0">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-neutral-muted line-clamp-2 leading-relaxed mb-3">
                  {doc.content}
                </p>

                <div className="flex flex-wrap items-center gap-1">
                  {doc.tags?.map((t: any, idx: number) => (
                    <Badge key={t?.id || idx} variant="neutral" size="sm">
                      {getTagName(t)}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}

          {filteredDocs.length === 0 && (
            <div className="text-center py-10 text-xs text-neutral-muted bg-white rounded-xl border border-neutral-border p-4">
              No notes found matching your filter.
            </div>
          )}
        </div>

        {/* =====================================================================
            COLUMN 3: ACTIVE NOTE VIEW / EDITOR / AI QUERY PANE (Lg: 5 cols)
            ===================================================================== */}
        <div className="lg:col-span-5">
          {/* PANE: VIEW NOTE */}
          {activePane === 'view' && selectedDoc && (
            <Card variant="elevated" className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-border">
                  <div>
                    <span className="text-xs font-semibold text-forest uppercase tracking-wider">
                      Saved Note #{selectedDoc.id}
                    </span>
                    <h2 className="text-xl font-bold text-charcoal mt-0.5">
                      {selectedDoc.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => handleDeleteDocument(selectedDoc.id)}
                    className="text-neutral-muted hover:text-status-error p-1.5 rounded transition-colors"
                    title="Delete Note"
                  >
                    <IconTrash size={16} />
                  </button>
                </div>

                {/* Content body */}
                <div className="my-5 p-4 rounded-xl bg-ivory text-xs text-charcoal leading-relaxed whitespace-pre-wrap font-sans border border-neutral-border/60 max-h-[380px] overflow-y-auto">
                  {selectedDoc.content}
                </div>

                {/* Summary / Flashcard action */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex flex-wrap gap-1">
                    {selectedDoc.tags?.map((t: any, idx: number) => (
                      <Badge key={t?.id || idx} variant="forest" size="sm">
                        #{getTagName(t)}
                      </Badge>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    variant="secondary"
                    isLoading={isGeneratingRevision}
                    onClick={() => handleGenerateRevision(selectedDoc.id)}
                    icon={<IconSparkles size={14} />}
                  >
                    Generate Flashcards
                  </Button>
                </div>
              </div>

              {/* Revision Questions Display */}
              {revisionCards.length > 0 && (
                <div className="mt-6 pt-5 border-t border-neutral-border space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-forest font-mono">
                    Groq Revision Flashcards ({revisionCards.length})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {revisionCards.map((rc, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-lg border border-neutral-border text-xs">
                        <span className="font-semibold text-charcoal block mb-0.5">
                          Q{idx + 1}: {rc.question}
                        </span>
                        <span className="text-neutral-muted">Hint: {rc.answerHint}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* PANE: CREATE NEW NOTE */}
          {activePane === 'create' && (
            <Card variant="elevated">
              <CardHeader
                title="Create Technical Note"
                subtitle="Save and index knowledge chunks for Groq RAG retrieval"
              />
              <form onSubmit={handleCreateDocument} className="space-y-4">
                <Input
                  label="Note Title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Distributed Lock Patterns with Redis Redlock"
                  required
                />

                <Textarea
                  label="Content & Technical Explanation"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Record trade-offs, architecture patterns, code snippets, or interview insights..."
                  rows={8}
                  required
                />

                <Input
                  label="Tags (comma separated)"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Redis, Concurrency, Distributed"
                />

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setActivePane('view')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    variant="primary"
                    isLoading={isSavingDoc}
                  >
                    Save &amp; Index Note
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* PANE: ASK GROUNDED AI */}
          {activePane === 'ask' && (
            <Card variant="elevated">
              <CardHeader
                title="Grounded Technical Query"
                subtitle="Answers synthesized strictly using your personal notes library"
                action={
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setActivePane('view')}
                  >
                    Back to Notes
                  </Button>
                }
              />

              <div className="space-y-4">
                <Textarea
                  label="Ask a question about your saved notes"
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  placeholder="e.g. How does 2-phase commit compare with saga in distributed transactions?"
                  rows={3}
                />

                <Button
                  size="sm"
                  variant="primary"
                  isLoading={isAsking}
                  disabled={!userQuestion.trim()}
                  onClick={handleAskQuestion}
                  icon={<IconSend size={14} />}
                >
                  Query Knowledge Assistant
                </Button>

                {aiAnswer && (
                  <div className="mt-5 p-4 rounded-xl bg-ivory border border-forest/30 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-forest flex items-center gap-1.5">
                        <IconSparkles size={14} />
                        Grounded Synthesis
                      </span>
                      <span className="font-mono text-neutral-muted">
                        Confidence: {(aiAnswer.confidenceScore * 100).toFixed(0)}%
                      </span>
                    </div>

                    <p className="text-xs text-charcoal leading-relaxed whitespace-pre-line">
                      {aiAnswer.answer}
                    </p>

                    {aiAnswer.sourcesUsed && aiAnswer.sourcesUsed.length > 0 && (
                      <div className="pt-2 border-t border-neutral-border text-[11px] text-neutral-muted">
                        <span className="font-semibold block mb-0.5">References Retrieved:</span>
                        <ul className="list-disc list-inside">
                          {aiAnswer.sourcesUsed.map((src, i) => (
                            <li key={i}>{src}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
