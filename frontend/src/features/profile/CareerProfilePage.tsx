import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import type { UserProfile, UserSkill } from '../../types';
import {
  IconEdit,
} from '../../components/brand/Icons';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input, Textarea } from '../../components/ui/Input';

export const CareerProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');

  const [activeUserId, setActiveUserId] = useState<number>(() => Number(localStorage.getItem('udaan_user_id') || '1'));

  const loadProfile = async (uid: number) => {
    setIsLoading(true);
    try {
      const [user, skillsList] = await Promise.all([
        apiClient.get<UserProfile>(`/profile?userId=${uid}`),
        apiClient.get<UserSkill[]>(`/skills/profile?userId=${uid}`),
      ]);
      setProfile(user);
      setSkills(skillsList);

      setName(user.name);
      setTargetRole(user.targetRole);
      setEducation(user.education || 'B.Tech / B.E. in Computer Science & Engineering');
      setExperience(user.experienceSummary || `Demonstrated projects, software engineering skills, and system architecture for ${user.targetRole || 'Software Engineer'}.`);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile(activeUserId);
    const handleUserChanged = () => {
      const newUid = Number(localStorage.getItem('udaan_user_id') || '1');
      setActiveUserId(newUid);
      loadProfile(newUid);
    };
    window.addEventListener('udaan_user_changed', handleUserChanged);
    return () => window.removeEventListener('udaan_user_changed', handleUserChanged);
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await apiClient.put<UserProfile>(`/profile?userId=${activeUserId}`, {
        name,
        targetRole,
        education,
        experienceSummary: experience,
      });
      setProfile(updated);
      localStorage.setItem('udaan_user_name', updated.name);
      localStorage.setItem('udaan_target_role', updated.targetRole);
      window.dispatchEvent(new Event('udaan_user_changed'));
      setIsEditing(false);
    } catch (err: any) {
      alert(`Save failed: ${err.message || 'Server error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-border">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-forest">
            Candidate Credentials
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-charcoal mt-0.5">
            Verified Career Profile
          </h1>
          <p className="text-sm text-neutral-muted mt-1">
            Central identity record integrating verified evidence sources from resumes, mock interviews, and project builds.
          </p>
        </div>

        <Button
          size="sm"
          variant={isEditing ? 'outline' : 'primary'}
          onClick={() => setIsEditing(!isEditing)}
          icon={<IconEdit size={14} />}
        >
          {isEditing ? 'Cancel Editing' : 'Edit Profile'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Profile Card & Summary */}
        <div className="lg:col-span-5 space-y-6">
          <Card variant="elevated">
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <Input
                  label="Candidate Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Target Career Role"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  required
                />
                <Input
                  label="Education / Degree"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                />
                <Textarea
                  label="Experience Summary"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  rows={4}
                />
                <Button
                  type="submit"
                  size="md"
                  variant="primary"
                  isLoading={isSaving}
                  className="w-full justify-center"
                >
                  Save Profile Updates
                </Button>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-forest text-white flex items-center justify-center text-xl font-bold uppercase shadow-subtle">
                    {profile?.name?.slice(0, 2) || 'AS'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-charcoal">{profile?.name}</h2>
                    <p className="text-xs text-forest font-semibold">{profile?.targetRole}</p>
                    <p className="text-xs text-neutral-muted">{profile?.email}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-border space-y-3 text-xs">
                  <div>
                    <span className="text-neutral-muted uppercase tracking-wider font-semibold block mb-1">
                      Education
                    </span>
                    <p className="text-charcoal font-medium">
                      {profile?.education || 'B.Tech in Computer Science'}
                    </p>
                  </div>

                  <div>
                    <span className="text-neutral-muted uppercase tracking-wider font-semibold block mb-1">
                      Experience Background
                    </span>
                    <p className="text-neutral-muted leading-relaxed">
                      {profile?.experienceSummary || '2+ years developing backend services.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Academic RDBMS Integrity Note */}
          <div className="p-4 bg-ivory rounded-xl border border-neutral-border text-xs text-neutral-muted leading-relaxed">
            <strong className="text-charcoal block mb-1 font-semibold">
              Evidence Source Disambiguation
            </strong>
            UDAAN distinguishes between self-reported skills, resume-extracted competencies, and mock interview performance. These data points provide calibrated preparation guidance.
          </div>
        </div>

        {/* Right Column: Evidence-Backed Skill Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader
              title="Evidence-Backed Competencies"
              subtitle="Categorized by verification source in MySQL"
            />

            <div className="space-y-3">
              {isLoading && <div className="text-xs text-neutral-muted py-4">Loading verified competencies...</div>}
              {!isLoading && skills.map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 bg-ivory rounded-xl border border-neutral-border flex items-center justify-between hover:bg-ivory-warm transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-charcoal">{s.skillName}</h4>
                      <Badge
                        variant={
                          s.proficiencyLevel === 'ADVANCED'
                            ? 'forest'
                            : s.proficiencyLevel === 'INTERMEDIATE'
                            ? 'saffron'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {s.proficiencyLevel}
                      </Badge>
                    </div>
                    <div className="text-xs text-neutral-muted mt-0.5 flex items-center gap-2">
                      <span>Category: {s.category}</span>
                      <span>·</span>
                      <span className="font-mono text-charcoal font-medium">
                        Source: {s.evidenceSource}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-neutral-muted block">Confidence</span>
                    <span className="font-mono text-sm font-bold text-forest">
                      {(s.confidenceLevel * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
