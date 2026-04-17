import { NextResponse } from 'next/server';
import { loadAllSkills } from '@/lib/skills/loader';
import { GoogleGenAI } from '@google/genai'; // Assuming this as per instructions

export async function POST(req: Request) {
  const body = await req.json();
  const { messages, context } = body;
  const skills = await loadAllSkills();

  async function callOpenRouter(model: string) {
    return await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://paylob.xyz',
        'X-Title': 'Paylob'
      },
      body: JSON.stringify({
        model,
        messages,
        tools: skills.map(s => ({
          type: 'function',
          function: { name: s.name, description: s.description, parameters: s.parameters }
        }))
      })
    });
  }

  let response = await callOpenRouter('nvidia/nemotron-3-super-120b:free');
  if (!response.ok) {
    response = await callOpenRouter('openrouter/free');
  }

  const data = await response.json();
  return NextResponse.json(data);
}
