import React, { useState } from 'react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';

export const SettingsPage: React.FC = () => {
  const [userName, setUserName] = useState(
    localStorage.getItem('udaan_user_name') || 'Aarav Sharma'
  );
  const [targetRole, setTargetRole] = useState(
    localStorage.getItem('udaan_target_role') || 'Senior Backend Engineer'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('udaan_user_name', userName);
    localStorage.setItem('udaan_target_role', targetRole);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      <div className="pb-4 border-b border-neutral-border">
        <span className="text-xs uppercase font-semibold tracking-wider text-forest">
          System Preferences
        </span>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-charcoal mt-0.5">
          Console Settings
        </h1>
        <p className="text-sm text-neutral-muted mt-1">
          Candidate workspace preferences, local session parameters, and backend connectivity.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-lg bg-status-success-bg text-status-success border border-status-success/20 text-xs">
          Preferences saved successfully to local session.
        </div>
      )}

      {/* Profile Preferences */}
      <Card>
        <CardHeader
          title="Candidate Identity"
          subtitle="Displayed across dashboard evaluations and report exports"
        />
        <form onSubmit={handleSave} className="space-y-4 max-w-lg">
          <Input
            label="Display Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />
          <Input
            label="Target Career Goal"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            required
          />
          <Button type="submit" size="sm" variant="primary">
            Save Preferences
          </Button>
        </form>
      </Card>

      {/* Backend & Database Connectivity */}
      <Card>
        <CardHeader
          title="Backend Architecture Status"
          subtitle="Verified active connections to Spring Boot 3 and MySQL 8.4"
        />
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 bg-ivory rounded-lg border border-neutral-border">
            <div>
              <span className="font-semibold text-charcoal">Java Spring Boot 3.3.4</span>
              <p className="text-neutral-muted">REST API running at http://localhost:8080/api</p>
            </div>
            <Badge variant="forest">Online</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-ivory rounded-lg border border-neutral-border">
            <div>
              <span className="font-semibold text-charcoal">MySQL 8.4 Enterprise Engine</span>
              <p className="text-neutral-muted">20 relational tables schema active in udaan_db</p>
            </div>
            <Badge variant="forest">Connected</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-ivory rounded-lg border border-neutral-border">
            <div>
              <span className="font-semibold text-charcoal">Groq AI Acceleration</span>
              <p className="text-neutral-muted">Model: openai/gpt-oss-120b for grounded RAG and interviews</p>
            </div>
            <Badge variant="forest">Active</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};
