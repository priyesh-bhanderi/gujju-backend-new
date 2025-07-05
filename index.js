import express from 'express';
import index from './routers/index.js';
import auth from './routers/auth.js';
import categories from './routers/categories.js';
import dotenv from 'dotenv';
import cors from 'cors'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*', // Allow requests from this origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow these HTTP methods
  allowedHeaders: ['Content-Type'], // Allow these headers
}));

// Middleware
app.use(express.json());

app.use('/', index);
app.use('/api/auth', auth);
app.use('/api/categories', categories);


// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

