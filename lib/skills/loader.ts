import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface Skill {
  name: string;
  description: string;
  parameters: any;
  execute: (args: any) => Promise<any>;
}

export interface Skill {
  name: string;
  description: string;
  parameters: any;
  execute: (args: any) => Promise<any>;
}

export async function loadAllSkills(): Promise<Skill[]> {
  const skillsDir = path.join(process.cwd(), 'ai_skills');
  const skills: Skill[] = [];

  // Mock implementation scan
  const skillFolders = ['pdf/compress', 'pdf/merge', 'platform/create_project'];

  for (const folder of skillFolders) {
    const name = folder.split('/').pop()!;
    skills.push({
      name,
      description: `Task: ${name}`,
      parameters: {},
      execute: async (args: any) => {
        // Dynamic import logic using actual API endpoints
        const endpoint = folder.startsWith('pdf') 
          ? `/api/documents/pdf/${name}` 
          : `/api/platform/${name}`;
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}${endpoint}`, {
          method: 'POST',
          body: JSON.stringify(args)
        });
        return await response.json();
      }
    });
  }
  return skills;
}
