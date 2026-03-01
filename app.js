import express from 'express';
import connectDB from './config/database.js';
import dotenv from 'dotenv';
import cors from 'cors';
import { appRouter } from './routes/index.js';

dotenv.config();

const app = express();
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(
  {
    allowedHeaders: ['Content-Type', 'Authorization'],
    origin: '*',
    methods: 'GET,POST,PUT,DELETE, OPTIONS'
  }
));

app.get('/', (req, res) => {
  res.send('API Running');
});

app.use('/api/v1', appRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
