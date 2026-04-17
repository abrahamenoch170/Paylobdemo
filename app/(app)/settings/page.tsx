'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface Repo {
  id: number;
  full_name: string;
}

export default function SettingsPage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selected, setSelected] = useState('');
  const [inviteUser, setInviteUser] = useState('');
  const [status, setStatus] = useState('');

  const connectGithub = async () => {
    const res = await fetch('/api/github/oauth/start');
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  const loadRepos = async () => {
    const res = await fetch('/api/github/repos');
    const data = await res.json();
    setRepos((data.repos || []).map((r: Repo) => ({ id: r.id, full_name: r.full_name })));
  };

  useEffect(() => {
    loadRepos();
  }, []);

  const invite = async () => {
    if (!selected || !inviteUser) return;
    const [owner, repo] = selected.split('/');
    const res = await fetch('/api/github/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ owner, repo, username: inviteUser }),
    });
    setStatus(res.ok ? 'Invite sent' : 'Invite failed');
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Security & Integrations</h1>
        <p className="text-sm text-[#8B8680]">Manage GitHub integration and collaborator access.</p>
      </div>

      <div className="bg-white border rounded-xl p-4 space-y-4">
        <h2 className="font-semibold">GitHub Integration</h2>
        <Button onClick={connectGithub}>Connect GitHub</Button>
        <Button variant="secondary" onClick={loadRepos}>Refresh Repos</Button>

        <select className="w-full border p-2 rounded" value={selected} onChange={(e) => setSelected(e.target.value)}>
          <option value="">Select repository</option>
          {repos.map((repo) => (
            <option key={repo.id} value={repo.full_name}>{repo.full_name}</option>
          ))}
        </select>

        <div className="flex gap-2">
          <input
            value={inviteUser}
            onChange={(e) => setInviteUser(e.target.value)}
            placeholder="GitHub username"
            className="flex-1 border p-2 rounded"
          />
          <Button onClick={invite}>Invite collaborator</Button>
        </div>
        {status && <p className="text-sm text-[#8B8680]">{status}</p>}
      </div>
    </div>
  );
}
