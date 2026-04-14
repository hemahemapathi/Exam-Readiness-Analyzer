import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import studySessionRoutes from './routes/studySessionRoutes.js';
import examRoutes from './routes/examRoutes.js';
import studyGroupRoutes from './routes/studyGroupRoutes.js';
import practiceTestRoutes from './routes/practiceTestRoutes.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://examreadinesspredictor.netlify.app'
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/study-sessions', studySessionRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/study-groups', studyGroupRoutes);
app.use('/api/practice-tests', practiceTestRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Exam Readiness Predictor API is running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      subjects: '/api/subjects',
      sessions: '/api/study-sessions',
      exams: '/api/exams',
      groups: '/api/study-groups',
      tests: '/api/practice-tests'
    }
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Exam Readiness Predictor API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
