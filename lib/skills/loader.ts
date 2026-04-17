import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface Skill {
  name: string;
  description: string;
  parameters: any;
  execute: (args: any) => Promise<any>;
}

export async function loadAllSkills(): Promise<Skill[]> {
  const skillsDir = path.join(process.cwd(), 'ai_skills');
  const skills: Skill[] = [];

  function scanDir(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        scanDir(filePath);
      } else if (file === 'SKILL.md') {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data, content } = matter(fileContent);
        skills.push({
          name: data.name,
          description: data.description,
          parameters: data.parameters,
          execute: async (args: any) => {
            // Implementation mapping would go here, or dynamic import
            console.log(`Executing skill ${data.name} with args`, args);
            return { result: 'Skill executed' };
          }
        });
      }
    }
  }

  scanDir(skillsDir);
  return skills;
}
