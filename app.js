// app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files like CSS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connect to MongoDB (local, no auth for dev)
mongoose.connect('mongodb://localhost:27017/quizvibe_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Models
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

const questionSchema = new mongoose.Schema({
  questionId: { type: String, unique: true, required: true },
  text: { type: String, required: true },
  type: { type: String, enum: ['mcq', 'discussion'], required: true },
  options: { type: [String], default: [] },
  correctAnswer: { type: String, default: null },
  rubric: { type: String, default: null }
});
const Question = mongoose.model('Question', questionSchema);

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  examId: { type: String, default: 'final-exam-1' },
  answers: [{
    questionId: { type: String, required: true },
    answer: { type: String, required: true },
    grade: { type: Number, default: null },
    feedback: { type: String, default: null }
  }],
  totalScore: { type: Number, default: null },
  gradedAt: { type: Date, default: null }
});
submissionSchema.index({ userId: 1, examId: 1 });
const Submission = mongoose.model('Submission', submissionSchema);

// Middleware for auth
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).send('Access denied');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-for-dev');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send('Invalid token');
  }
};

// Routes
// Register (for dev; pre-create users)
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashed });
  await user.save();
  res.send('User registered');
});

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(400).send('Invalid credentials');
  }
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'default-secret-for-dev', { expiresIn: '1h' });
  res.json({ token });
});

// Import questions from CSV on startup
async function importQuestionsFromCSV() {
  const results = [];
  fs.createReadStream('questions.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      for (const q of results) {
        await Question.findOneAndUpdate(
          { questionId: q.id },
          {
            text: q.question,
            type: q.type || 'mcq',
            options: [q.option1, q.option2, q.option3, q.option4].filter(Boolean),
            correctAnswer: q.correct_answer,
            rubric: q.rubric || null
          },
          { upsert: true }
        );
      }
      console.log('Questions imported/updated');
    });
}
importQuestionsFromCSV();

// Serve exam page (protected)
app.get('/exam', authMiddleware, async (req, res) => {
  const questions = await Question.find({});
  res.render('exam', { questions, branding: "Professor Brown's Secret Lab" });
});

// Submit answers
app.post('/submit', authMiddleware, async (req, res) => {
  const { examId = 'final-exam-1', answers } = req.body;
  const submission = new Submission({
    userId: req.user._id,
    examId,
    answers
  });
  await submission.save();
  res.send('Answers submitted');
});

// Student performance view
app.get('/my-performance', authMiddleware, async (req, res) => {
  const submissions = await Submission.find({ userId: req.user._id }).select('-__v');
  res.render('performance', { submissions, branding: "Professor Brown's Secret Lab" });
});

// Login page (simple form)
app.get('/login', (req, res) => {
  res.render('login', { branding: "Professor Brown's Secret Lab" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
