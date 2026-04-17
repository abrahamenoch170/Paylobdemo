import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import multer from 'multer';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  // Use ADC or service account credentials if necessary. Fallback to default dummy for now if running local without service account
  try {
     admin.initializeApp({
        projectId: 'paylob-app' // We enforce a known mock projectId or use ADC via default FIREBASE_CONFIG
     });
  } catch (e) {}
}

// API Route Handlers
import { aiRouter } from './src/server/routes/ai';
import { uploadRouter } from './src/server/routes/upload';
import { documentsRouter } from './src/server/routes/documents';
import { emailRouter } from './src/server/routes/email';
import { webhookRouter } from './src/server/routes/webhooks';
import { paymentsRouter } from './src/server/routes/payments';
import { skillsRouter } from './src/server/routes/skills';
import { signatureRouter } from './src/server/routes/signature';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON middleware except for webhooks needing raw bodies, and uploads using multer
  app.use('/api/webhooks', express.raw({ type: 'application/json' }));
  app.use(express.json());
  
  // Custom API routes
  app.use('/api/ai', aiRouter);
  app.use('/api/upload', uploadRouter);
  app.use('/api/documents', documentsRouter);
  app.use('/api/email', emailRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api/skills', skillsRouter);
  app.use('/api/signature', signatureRouter);
  app.use('/api/webhooks', webhookRouter);

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
