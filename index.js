import express from 'express';
import index from './routers/index.js';
import auth from './routers/auth.js';
import projects from './routers/projects.js';
import dotenv from 'dotenv';
import cors from 'cors';
import apis from './routers/apis.js';
// import path from 'path'
// import { fileURLToPath } from 'url';

dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

app.use('/', index);
app.use('/api/auth', auth);
app.use('/api/projects', projects);
app.use('/api/all', apis);

// app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

