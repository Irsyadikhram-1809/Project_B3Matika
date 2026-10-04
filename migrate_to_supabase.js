import { createClient } from '@supabase/supabase-js';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Set SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY di file .env terlebih dahulu!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log("Membuka database SQLite lokal...");
  const db = await open({
    filename: './database/database.sqlite',
    driver: sqlite3.Database
  });

  try {
    // 1. Migrate Topics
    console.log("Migrating Topics...");
    const topics = await db.all('SELECT id, grade, title, content, created_at FROM topics');
    if (topics.length > 0) {
      const { error } = await supabase.from('topics').upsert(topics);
      if (error) console.error("Error topics:", error.message);
      else console.log(`✓ ${topics.length} topics migrated`);
    }

    // 2. Migrate Questions
    console.log("Migrating Questions...");
    // Di Laravel kolom text dan difficulty, kita harus mapping ke schema Supabase kita (body dan points)
    const questions = await db.all('SELECT id, topic_id, text as body, options, answer, difficulty as points, created_at FROM questions');
    if (questions.length > 0) {
      // parse JSON
      const parsedQs = questions.map(q => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
        answer: typeof q.answer === 'string' ? JSON.parse(q.answer) : q.answer,
      }));
      const { error } = await supabase.from('questions').upsert(parsedQs);
      if (error) console.error("Error questions:", error.message);
      else console.log(`✓ ${questions.length} questions migrated`);
    }

    // 3. Migrate Puzzles
    console.log("Migrating Puzzles...");
    const puzzles = await db.all('SELECT id, type, title, description, data, solution, points, created_at FROM puzzles');
    if (puzzles.length > 0) {
      const parsedPuzzles = puzzles.map(p => ({
        ...p,
        data: typeof p.data === 'string' ? JSON.parse(p.data) : p.data,
        solution: typeof p.solution === 'string' ? JSON.parse(p.solution) : p.solution,
      }));
      const { error } = await supabase.from('puzzles').upsert(parsedPuzzles);
      if (error) console.error("Error puzzles:", error.message);
      else console.log(`✓ ${puzzles.length} puzzles migrated`);
    }

    console.log("✅ Migrasi selesai!");
  } catch (err) {
    console.error("Terjadi error selama migrasi:", err);
  } finally {
    await db.close();
  }
}

migrate();
