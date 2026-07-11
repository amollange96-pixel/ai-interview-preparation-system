# AI Interview Preparation System

An intelligent interview coach that conducts mock interviews, analyzes candidate responses using ML/NLP, and generates personalized performance feedback — combining speech recognition, NLP, and full-stack development into a single practical application.

## Overview

This system lets a candidate select a job role and interview type (HR, Technical, or Aptitude), answer questions via voice or text, and receive an AI-generated performance report covering technical relevance, communication, grammar, confidence, and keyword match.

## Features

### Candidate Module
- Login/Signup
- Select interview type: HR, Technical, Aptitude
- Select job role: Software Engineer, Data Analyst, AI/ML Engineer, etc.
- Take a mock interview (voice or text responses)
- View a detailed performance report

### AI Evaluation
- Speech-to-text conversion (voice answers)
- Grammar analysis
- Keyword matching against ideal answers
- Confidence scoring (optional: facial expression / voice features)
- Sentiment analysis
- Speaking speed analysis
- Combined overall interview score

### Admin Module
- Add/edit interview questions
- Manage users
- View interview statistics
- Export reports

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Tailwind CSS |
| Backend | FastAPI (or Flask) |
| Database | PostgreSQL (or MongoDB) |
| ML/NLP | Python, Scikit-learn, Transformers, Sentence Transformers |
| Speech | OpenAI Whisper |
| Vision (optional) | OpenCV, MediaPipe |

## Machine Learning Components

| Feature | ML Technique |
|---|---|
| Text similarity | Sentence Transformers / BERT embeddings |
| Answer scoring | Cosine similarity |
| Sentiment analysis | DistilBERT or RoBERTa |
| Grammar checking | LanguageTool (or equivalent) |
| Job role classification | Random Forest / BERT |
| Speech-to-text | Whisper |
| Emotion detection (optional) | CNN |
| Face confidence (optional) | MediaPipe + CNN |

## System Workflow

1. User signs in.
2. Selects interview type and job role.
3. AI presents a question.
4. User responds via voice or text.
5. Voice is transcribed to text (if applicable).
6. ML models evaluate the response (similarity, sentiment, grammar, speed, optional confidence).
7. A score and detailed feedback are generated per question.
8. Process repeats for all questions in the session.
9. A final report summarizes strengths and areas for improvement.

## ML Pipeline

1. Collect interview questions and reference answers.
2. Clean and preprocess text.
3. Convert reference and candidate answers into embeddings via Sentence Transformers.
4. Score similarity using cosine similarity.
5. Run sentiment analysis on the response.
6. Analyze grammar and fluency.
7. Combine sub-scores into a weighted overall interview rating.

## Sample Output

```
Interview Score: 87/100
Technical Knowledge: 90%
Communication: 85%
Grammar: 92%
Confidence: 80%
Keyword Match: 88%

Suggestions:
- Give more structured answers.
- Include practical examples.
- Reduce filler words.
```

## Project Structure

```
ai-interview-system/
├── frontend/                 # React + Tailwind app
│   ├── src/
│   │   ├── components/       # Login, RoleSelector, InterviewSession, ReportView, AdminDashboard
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
├── backend/                  # FastAPI/Flask app
│   ├── app/
│   │   ├── routes/           # auth, questions, sessions, answers, reports, admin
│   │   ├── models/           # DB schemas (SQLAlchemy / Pydantic)
│   │   ├── services/         # business logic
│   │   └── main.py
│   └── requirements.txt
├── ml/                        # ML pipeline services
│   ├── speech_to_text.py     # Whisper integration
│   ├── embeddings.py         # Sentence Transformers + cosine similarity
│   ├── sentiment.py          # DistilBERT/RoBERTa sentiment
│   ├── grammar_check.py      # LanguageTool integration
│   ├── scoring.py            # weighted score aggregation
│   └── role_classifier.py    # optional job role classification
├── data/
│   └── questions_seed.json   # sample question bank
└── README.md
```

## Database Schema (high level)

- **Users** — id, name, email, password_hash, role (candidate/admin)
- **Questions** — id, question_text, ideal_answer, required_keywords, difficulty, job_role, interview_type
- **InterviewSessions** — id, user_id, job_role, interview_type, started_at, completed_at
- **SessionAnswers** — id, session_id, question_id, raw_text, transcribed_text, similarity_score, sentiment_score, grammar_score, keyword_score, confidence_score
- **Reports** — id, session_id, overall_score, category_scores (JSON), suggestions

## Scoring Formula

```
Interview Score = (Technical Knowledge × 0.35)
                 + (Communication × 0.25)
                 + (Grammar × 0.20)
                 + (Confidence × 0.20)
```
(Weights are adjustable in `ml/scoring.py`.)

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+ (or MongoDB 6+)

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
Create a `.env` file in `backend/` with:
```
DATABASE_URL=postgresql://user:password@localhost:5432/interview_db
JWT_SECRET=your_secret_key
WHISPER_MODEL=base
```

## Roadmap / Advanced Features
- [ ] Adaptive questions based on previous answers
- [ ] AI-generated follow-up questions
- [ ] Coding interview mode with automatic code evaluation
- [ ] Resume upload with tailored questions
- [ ] Job description upload for role-specific interviews
- [ ] Personalized learning plan after each interview
- [ ] Progress-tracking dashboard across sessions

## Skills Demonstrated
Machine Learning · Natural Language Processing (NLP) · Speech Recognition · Python · FastAPI/Flask · React · Model Evaluation · Database Design · API Development

## License
Add your preferred license here (e.g., MIT).

