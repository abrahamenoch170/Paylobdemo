import fs from 'fs/promises';
import path from 'path';

export interface Skill {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (args: Record<string, unknown>, authToken?: string) => Promise<unknown>;
}

async function discoverSkillNames(skillsRoot: string): Promise<string[]> {
  const names: string[] = [];
  const stacks = [skillsRoot];

  while (stacks.length) {
    const current = stacks.pop()!;
    const entries = await fs.readdir(current, { withFileTypes: true });
    const hasSkill = entries.some((e) => e.isFile() && e.name === 'SKILL.md');

    if (hasSkill) {
      names.push(path.basename(current));
      continue;
    }

    for (const entry of entries) {
      if (entry.isDirectory()) {
        stacks.push(path.join(current, entry.name));
      }
    }
  }

  return names;
}

function endpointForSkill(name: string) {
  switch (name) {
    case 'compress':
      return '/api/documents/pdf/compress';
    case 'merge':
      return '/api/documents/pdf/merge';
    case 'create_project':
      return '/api/platform/create_project';
    default:
      return `/api/skills/${name}`;
  }
}

export async function loadAllSkills(): Promise<Skill[]> {
  const skillsDir = path.join(process.cwd(), 'ai_skills');
  const discovered = await discoverSkillNames(skillsDir).catch(() => [] as string[]);
  const skillNames = Array.from(new Set([...discovered, 'create_project']));

  return skillNames.map((name) => ({
    name,
    description: `Task: ${name}`,
    parameters: {},
    execute: async (args: Record<string, unknown>, authToken?: string) => {
      const endpoint = endpointForSkill(name);
      const response = await fetch(`${process.env.APP_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(args),
      });

      if (!response.ok) {
        throw new Error(`Skill ${name} failed with status ${response.status}`);
      }

      return response.json();
    },
  }));
}
