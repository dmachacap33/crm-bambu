import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const BUILDERBOT_URL = process.env.BUILDERBOT_URL || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// Helper to pick assistant id by stage using env
function getAssistantIdForStage(stageId) {
  const map = {
    leads: process.env.ASST_LEADS,
    contactado: process.env.ASST_CONTACTADO,
    cotizacion: process.env.ASST_COTIZACION,
    cierre: process.env.ASST_CIERRE
  };
  return map[stageId] || process.env.ASST_LEADS;
}

// Try BuilderBot first (if provided), else OpenAI Responses API
export async function askAI({ message, threadId, stageId }) {
  const assistantId = getAssistantIdForStage(stageId);
  // Attempt: BuilderBot microservicio (you must run it separately)
  if (BUILDERBOT_URL) {
    try {
      const r = await fetch(`${BUILDERBOT_URL}/api/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assistantId, message, threadId })
      });
      if (r.ok) {
        const data = await r.json();
        if (data && data.answer) return data.answer;
      }
    } catch (e) {
      // continue to OpenAI fallback
    }
  }
  // Fallback simple call to OpenAI Responses API (streaming omitted)
  if (OPENAI_API_KEY) {
    try {
      const r = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4.1-mini',
          input: message,
        })
      });
      const data = await r.json();
      if (data && data.output && data.output[0]) {
        // New Responses API returns an array; normalize to text
        const chunk = data.output[0];
        if (chunk && chunk.content && chunk.content[0] && chunk.content[0].text) {
          return chunk.content[0].text;
        }
      }
    } catch(e){}
  }
  return "IA: (no configurada) Por favor configure BUILDERBOT_URL o OPENAI_API_KEY.";
}
