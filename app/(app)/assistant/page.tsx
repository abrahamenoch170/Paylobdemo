'use client';

import { AiPanel } from '@/components/ai/ai-panel';

export default function AssistantPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">AI Assistant</h1>
      <AiPanel projectId="assistant-demo-project" />
    </div>
  );
}
