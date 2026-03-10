import express from 'express';
import { createServer as createViteServer } from 'vite';
import db from './src/db.js';
import crypto from 'crypto';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Get all samples
  app.get('/api/samples', (req, res) => {
    try {
      const samples = db.prepare('SELECT * FROM samples ORDER BY received_at DESC').all();
      res.json(samples);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch samples' });
    }
  });

  // Create a new sample
  app.post('/api/samples', (req, res) => {
    const { patient_id, sample_type, test_ordered, priority_level } = req.body;
    const id = `SMP-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const status = 'Accessioning';
    
    const days = priority_level > 50 ? 2 : 14;
    const expected_completion = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

    try {
      const stmt = db.prepare(`
        INSERT INTO samples (id, patient_id, sample_type, test_ordered, priority_level, status, expected_completion)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, patient_id, sample_type, test_ordered, priority_level, status, expected_completion);
      
      const logStmt = db.prepare(`
        INSERT INTO logs (id, sample_id, stage, action, operator_id)
        VALUES (?, ?, ?, ?, ?)
      `);
      logStmt.run(crypto.randomUUID(), id, 'Accessioning', 'Started', 'System');

      res.status(201).json({ id, status, expected_completion });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create sample' });
    }
  });

  // Update sample status
  app.patch('/api/samples/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, operator_id, equipment_id } = req.body;

    try {
      db.prepare('UPDATE samples SET status = ? WHERE id = ?').run(status, id);
      
      const logStmt = db.prepare(`
        INSERT INTO logs (id, sample_id, stage, action, operator_id, equipment_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      logStmt.run(crypto.randomUUID(), id, status, 'Started', operator_id || 'System', equipment_id || null);

      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update status' });
    }
  });

  // Get sample logs
  app.get('/api/samples/:id/logs', (req, res) => {
    const { id } = req.params;
    try {
      const logs = db.prepare('SELECT * FROM logs WHERE sample_id = ? ORDER BY timestamp DESC').all(id);
      res.json(logs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch logs' });
    }
  });

  // Get alerts (Mock AI Anomaly Detection)
  app.get('/api/alerts', (req, res) => {
    try {
      const alerts = db.prepare(`
        SELECT id, status, priority_level, expected_completion 
        FROM samples 
        WHERE status != 'Dispatch' AND priority_level >= 80
      `).all() as any[];
      
      const formattedAlerts = alerts.map(a => ({
        id: crypto.randomUUID(),
        sample_id: a.id,
        message: `High priority sample ${a.id} is currently at ${a.status}. Monitor closely.`,
        level: 'Red',
        timestamp: new Date().toISOString()
      }));

      res.json(formattedAlerts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
