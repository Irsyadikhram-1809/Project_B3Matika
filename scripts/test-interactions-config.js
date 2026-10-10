import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const apiKeyStr = process.env.GEMINI_API_KEY || '';
  const key = apiKeyStr.split(',')[0].trim();
  const ai = new GoogleGenAI({ apiKey: key });

  try {
    const stream = await ai.interactions.create({
      model: "gemini-3.8-flash", 
      system_instruction: "You are a math tutor.",
      input: "Satu tambah satu"
    });

    console.log("Response interaction");
  } catch (err) {
    console.error("Error:", err.status, err.name);
    console.error(err.message);
  }
}
run();
