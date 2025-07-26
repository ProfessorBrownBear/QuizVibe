QuizVibe: Professor Brown's Secret Lab Testing System

Overview

QuizVibe is a web-based testing application designed for Professor Brown's Secret Lab, built for managing and delivering exams to students. This phase 1 MVP runs locally on your laptop, using Node.js, Express.js, and MongoDB (local, no authentication for development). Students log in to take exams, submit answers, and view their performance. Questions are loaded from a CSV file, and the system is optimized for future integration with an AI grader using the ChatGPT 3.5 Turbo API. The app uses a MongoDB schema designed for MCQ and discussion question grading, with fields for AI-generated grades and feedback.

Features

Student Authentication: Simple username/password login with JWT (no security for dev; to be added later).

Exam Delivery: Students access a web-based exam with MCQ and discussion questions loaded from questions.csv.

Performance View: Students see only their own submissions, grades, and feedback via /my-performance.

MongoDB Storage: Stores users, questions, and submissions locally (mongodb://localhost:27017/quizvibe_db).

Branding: Styled as "Professor Brown's Secret Lab" with placeholder logo and green-themed UI.

AI-Ready Schema: Questions include rubric for AI grading; submissions store grade and feedback.

Prerequisites

Node.js: v20+ (download from nodejs.org).

MongoDB Community Edition: Install locally (download from mongodb.com).

Run mongod to start the MongoDB server (default: port 27017, no auth for dev).

Code Editor: VS Code recommended.

Browser: For accessing the app (http://localhost:3000).

Installation

Clone or Create Project:

mkdir quizvibe && cd quizvibe
npm init -y
npm install express mongoose csv-parser ejs bcryptjs jsonwebtoken dotenv


Set Up Files:

Copy app.js, questions.csv, and folder structure (views/, public/) as provided.
Create .env:

PORT=3000
JWT_SECRET=default-secret-for-dev

MongoDB:
Ensure MongoDB is running (mongod in a terminal).
No setup needed for DB; app.js creates quizvibe_db automatically.

Directory Structure:

quizvibe/
├── public/
│   ├── styles.css
│   └── placeholder-logo.jpg  # Create empty file or replace
├── views/
│   ├── login.ejs
│   ├── exam.ejs
│   ├── performance.ejs
├── app.js
├── questions.csv
├── package.json
└── .env

Usage


Start MongoDB:

Run mongod (Windows: ensure service is running; macOS/Linux: mongod --config /usr/local/etc/mongod.conf).

Run App:

node app.js

Access at http://localhost:3000/login.

Create Users:

Use Postman or a script to POST to /register:

POST http://localhost:3000/register
Content-Type: application/json
{ "username": "student1", "password": "pass123" }



Alternatively, insert users via MongoDB shell:

use quizvibe_db
db.users.insertOne({ username: "student1", password: "$2a$10$..." }) // Use bcrypt to hash


Take Exam:

Log in at /login to get a JWT.

Access /exam to answer questions.

Submit answers; view results at /my-performance.

Questions:

Edit questions.csv to add questions (format: id,question,type,option1,option2,option3,option4,correct_answer,rubric).

App imports CSV to MongoDB on startup.

Development Notes

Security: No DB or JWT security in MVP (dev phase). Add MongoDB auth and HTTPS for production.

Future AI Grading:

Schema supports grade and feedback for AI integration (e.g., ChatGPT 3.5 Turbo).

Plan: Create grader.js to query submissions, call OpenAI API, and update grades/feedback.

###MongoDB Atlas Migration:

Create a free Atlas cluster, update .env with MONGO_URI=mongodb+srv://....

Branding: Replace public/placeholder-logo.jpg with a real logo for Professor Brown's Secret Lab.

Troubleshooting

MongoDB Connection: Ensure mongod is running (mongo shell: db.test.insertOne({test:1})).

CSV Errors: Check questions.csv format; ensure no missing commas or quotes.

JWT Issues: If token expires (1h), re-login via /login.

Logs: Check console for errors (e.g., MongoDB connection, CSV parsing).

Next Steps (Phase 2)

Add MongoDB authentication.

Implement grader.js with ChatGPT 3.5 Turbo API for grading.

Enhance UI with dynamic question types (e.g., file uploads).

Deploy to cloud (MongoDB Atlas, hosting).
