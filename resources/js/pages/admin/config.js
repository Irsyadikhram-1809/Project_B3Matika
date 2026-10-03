// Konfigurasi tampilan CRUD admin: kolom tabel dan tipe field formulir per resource.
export const RESOURCES = {
  topics: { label: 'Materi', cols: ['id', 'grade', 'title'], fields: { grade: 'number', title: 'text', content: 'textarea' } },
  questions: { label: 'Soal', cols: ['id', 'topic_id', 'text'], fields: { topic_id: 'number', text: 'textarea', options: 'lines', answer: 'number', difficulty: 'number', explanation: 'textarea' } },
  puzzles: { label: 'Puzzle', cols: ['id', 'type', 'title'], fields: { type: 'text', title: 'text', description: 'textarea', data: 'json', solution: 'json', points: 'number' } },
};
