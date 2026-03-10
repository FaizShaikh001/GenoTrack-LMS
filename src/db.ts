import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../lims.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS samples (
    id TEXT PRIMARY KEY,
    patient_id TEXT,
    sample_type TEXT,
    test_ordered TEXT,
    priority_level INTEGER,
    status TEXT,
    received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expected_completion DATETIME,
    actual_completion DATETIME
  );

  CREATE TABLE IF NOT EXISTS logs (
    id TEXT PRIMARY KEY,
    sample_id TEXT,
    stage TEXT,
    action TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    operator_id TEXT,
    equipment_id TEXT,
    FOREIGN KEY(sample_id) REFERENCES samples(id)
  );
`);

// Insert some mock data if empty
const count = db.prepare('SELECT COUNT(*) as count FROM samples').get() as { count: number };
if (count.count === 0) {
  const insertSample = db.prepare(`
    INSERT INTO samples (id, patient_id, sample_type, test_ordered, priority_level, status, expected_completion)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const now = new Date();
  const future = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const urgentFuture = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

  insertSample.run('SMP-A1B2C3D4', 'PAT-001', 'Blood', 'Clinical WES', 10, 'Accessioning', future.toISOString());
  insertSample.run('SMP-E5F6G7H8', 'PAT-002', 'Saliva', 'Targeted Panel', 50, 'DNA Extraction', future.toISOString());
  insertSample.run('SMP-I9J0K1L2', 'PAT-003', 'Blood', 'NICU Rapid WGS', 100, 'Sequencing', urgentFuture.toISOString());
  insertSample.run('SMP-M3N4O5P6', 'PAT-004', 'FFPE', 'Oncology Panel', 80, 'Library Prep', future.toISOString());
}

export default db;
