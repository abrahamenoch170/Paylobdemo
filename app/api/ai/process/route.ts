import { NextResponse } from 'next/server';
import { loadAllSkills } from '@/lib/skills/loader';

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();
    const skills = await loadAllSkills();
    
    const tools = skills.map(skill => ({
      type: 'function',
      function: {
        name: skill.name,
        description: skill.description,
        parameters: skill.parameters
      }
    }));

    const chatMessages = [...messages];
    if (context) {
       chatMessages.unshift({
         role: 'system',
         content: `Current application context: ${JSON.stringify(context)}. You are an assistant helping the user navigate these contexts.`
       });
    }

    const requestBody: any = {
      model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3-8b-instruct:free',
      messages: chatMessages,
    };

    if (tools.length > 0) {
      requestBody.tools = tools;
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    const data = await response.json();
    
    const message = data?.choices?.[0]?.message;
    if (message?.tool_calls && message.tool_calls.length > 0) {
       const toolCall = message.tool_calls[0];
       const functionName = toolCall.function.name;
       const args = JSON.parse(toolCall.function.arguments || '{}');
       
       const matchedSkill = skills.find(s => s.name === functionName);
       if (matchedSkill) {
          const result = await matchedSkill.execute({ ...args, _context: context });
          
          return NextResponse.json({
             choices: [{
               message: {
                 role: 'assistant',
                 content: `Okay, I've processed that. Result: ${result.message}`
               }
             }]
          });
       }
    }

    return NextResponse.json(data);
  } catch(error: any) {
    console.error('AI Error:', error);
    return NextResponse.json({ error: 'Internal server error processing AI' }, { status: 500 });
  }
}
