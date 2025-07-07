import express from 'express';
import index from './routers/index.js';
import auth from './routers/auth.js';
import projects from './routers/projects.js';
import dotenv from 'dotenv';
import cors from 'cors';
import apis from './routers/apis.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// app.use(cors({
//   origin: '*', 
//   methods: ['GET', 'POST', 'PUT', 'DELETE'], 
//   allowedHeaders: ['Content-Type'],
// }));

// Middleware
app.use(express.json());

app.use('/', index);
app.use('/api/auth', auth);
app.use('/api/projects', projects);
app.use('/api/all', apis);


// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

