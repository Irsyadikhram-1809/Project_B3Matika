import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const apiKeyStr = process.env.GEMINI_API_KEY || '';
  const apiKeys = apiKeyStr.split(',').map(k => k.trim()).filter(k => k);
  
  if (apiKeys.length === 0) return;
  const key = apiKeys[0];
  const ai = new GoogleGenAI({ apiKey: key });

  try {
    const stream = await ai.interactions.create({
      model: "gemini-3.8-flash", 
      input: "Satu tambah satu",
      stream: true,
    });

    let fullText = "";
    
    for await (const chunk of stream) {
      if (chunk.event_type === 'step.delta') {
         if (!fullText) {
             console.log("FIRST DELTA CHUNK:", JSON.stringify(chunk, null, 2));
         }
         if (chunk.delta?.type === 'text') {
             fullText += chunk.delta.text;
         }
      }
    }
    console.log(`Final text snippet: ${fullText}`);
  } catch (err) {
    console.error("Error:", err.status, err.name);
    console.error(err.message);
  }
}
run();
