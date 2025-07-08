import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import index from './routers/index.js';
import auth from './routers/auth.js';
import projects from './routers/projects.js';
import apis from './routers/apis.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ CORS must be first
app.use(cors({
  origin: '*', // Or whatever frontend you use
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// ✅ Static assets
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// ✅ Routes
app.use('/', index);
app.use('/api/auth', auth);
app.use('/api/projects', projects);
app.use('/api/all', apis);

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
