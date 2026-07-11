<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AI Interview Preparation System</title>

<style>
*{
    margin:0;
    padding:0;
    box-sizing:border-box;
    font-family:Segoe UI,Arial,sans-serif;
}

body{
    background:#f5f7fb;
    color:#222;
    line-height:1.7;
}

.container{
    width:90%;
    max-width:1200px;
    margin:40px auto;
    background:#fff;
    padding:40px;
    border-radius:12px;
    box-shadow:0 10px 30px rgba(0,0,0,.08);
}

h1{
    color:#1d4ed8;
    margin-bottom:10px;
}

h2{
    color:#0f172a;
    margin-top:35px;
    margin-bottom:15px;
    border-left:5px solid #2563eb;
    padding-left:10px;
}

h3{
    margin-top:20px;
    color:#334155;
}

p{
    margin-bottom:15px;
}

ul,ol{
    margin-left:25px;
    margin-bottom:20px;
}

li{
    margin-bottom:8px;
}

table{
    width:100%;
    border-collapse:collapse;
    margin:20px 0;
}

table th{
    background:#2563eb;
    color:white;
    padding:12px;
}

table td{
    border:1px solid #ddd;
    padding:12px;
}

pre{
    background:#0f172a;
    color:#f8fafc;
    padding:18px;
    overflow:auto;
    border-radius:8px;
    margin:20px 0;
}

code{
    font-family:Consolas,monospace;
}

.badge{
    display:inline-block;
    background:#2563eb;
    color:white;
    padding:6px 14px;
    border-radius:20px;
    margin:5px;
    font-size:14px;
}

.section{
    margin-bottom:30px;
}

.footer{
    text-align:center;
    margin-top:40px;
    color:#666;
    font-size:14px;
}

@media(max-width:768px){

.container{
padding:20px;
}

table{
display:block;
overflow-x:auto;
}
}
</style>

</head>
<body>

<div class="container">

<h1>🎯 AI Interview Preparation System</h1>

<p>
An intelligent interview coach that conducts mock interviews, analyzes candidate
responses using ML/NLP, and generates personalized performance feedback —
combining speech recognition, NLP, and full-stack development into a single practical application.
</p>

<div class="section">
<h2>📖 Overview</h2>

<p>
This system lets a candidate select a job role and interview type (HR,
Technical, or Aptitude), answer questions via voice or text, and receive an
AI-generated performance report covering technical relevance,
communication, grammar, confidence, and keyword match.
</p>

</div>

<div class="section">

<h2>✨ Features</h2>

<h3>Candidate Module</h3>

<ul>
<li>Login / Signup</li>
<li>Select Interview Type (HR, Technical, Aptitude)</li>
<li>Select Job Role</li>
<li>Take Mock Interview (Voice or Text)</li>
<li>View Detailed Performance Report</li>
</ul>

<h3>AI Evaluation</h3>

<ul>
<li>Speech-to-Text Conversion</li>
<li>Grammar Analysis</li>
<li>Keyword Matching</li>
<li>Confidence Scoring</li>
<li>Sentiment Analysis</li>
<li>Speaking Speed Analysis</li>
<li>Overall Interview Score</li>
</ul>

<h3>Admin Module</h3>

<ul>
<li>Add/Edit Questions</li>
<li>Manage Users</li>
<li>Interview Statistics</li>
<li>Export Reports</li>
</ul>

</div>

<div class="section">

<h2>💻 Tech Stack</h2>

<table>

<tr>
<th>Layer</th>
<th>Technology</th>
</tr>

<tr>
<td>Frontend</td>
<td>React, Tailwind CSS</td>
</tr>

<tr>
<td>Backend</td>
<td>FastAPI / Flask</td>
</tr>

<tr>
<td>Database</td>
<td>PostgreSQL / MongoDB</td>
</tr>

<tr>
<td>ML / NLP</td>
<td>Python, Scikit-Learn, Transformers, Sentence Transformers</td>
</tr>

<tr>
<td>Speech</td>
<td>OpenAI Whisper</td>
</tr>

<tr>
<td>Vision</td>
<td>OpenCV, MediaPipe (Optional)</td>
</tr>

</table>

</div>

<div class="section">

<h2>🤖 Machine Learning Components</h2>

<table>

<tr>
<th>Feature</th>
<th>ML Technique</th>
</tr>

<tr>
<td>Text Similarity</td>
<td>Sentence Transformers / BERT</td>
</tr>

<tr>
<td>Answer Scoring</td>
<td>Cosine Similarity</td>
</tr>

<tr>
<td>Sentiment Analysis</td>
<td>DistilBERT / RoBERTa</td>
</tr>

<tr>
<td>Grammar Checking</td>
<td>LanguageTool</td>
</tr>

<tr>
<td>Job Role Classification</td>
<td>Random Forest / BERT</td>
</tr>

<tr>
<td>Speech Recognition</td>
<td>OpenAI Whisper</td>
</tr>

<tr>
<td>Emotion Detection</td>
<td>CNN (Optional)</td>
</tr>

<tr>
<td>Face Confidence</td>
<td>MediaPipe + CNN</td>
</tr>

</table>

</div>

<div class="section">

<h2>🔄 System Workflow</h2>

<ol>

<li>User signs in.</li>

<li>Selects interview type and job role.</li>

<li>AI asks a question.</li>

<li>User answers using voice or text.</li>

<li>Voice responses are converted into text.</li>

<li>ML evaluates similarity, grammar, confidence and sentiment.</li>

<li>Score & feedback generated.</li>

<li>Repeat until interview completes.</li>

<li>Final report is generated.</li>

</ol>

</div>

<div class="section">

<h2>🧠 ML Pipeline</h2>

<ol>

<li>Collect interview questions.</li>

<li>Clean and preprocess text.</li>

<li>Create embeddings using Sentence Transformers.</li>

<li>Compute cosine similarity.</li>

<li>Run sentiment analysis.</li>

<li>Analyze grammar.</li>

<li>Calculate weighted interview score.</li>

</ol>

</div>

<div class="section">

<h2>📊 Sample Output</h2>

<pre><code>Interview Score : 87 / 100

Technical Knowledge : 90%

Communication : 85%

Grammar : 92%

Confidence : 80%

Keyword Match : 88%

Suggestions

• Give more structured answers.

• Include practical examples.

• Reduce filler words.
</code></pre>

</div>

<div class="section">

<h2>📁 Project Structure</h2>

<pre><code>ai-interview-system/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── App.jsx
│
├── backend/
│   ├── app/
│   ├── routes/
│   ├── models/
│   ├── services/
│   └── main.py
│
├── ml/
│   ├── speech_to_text.py
│   ├── embeddings.py
│   ├── sentiment.py
│   ├── grammar_check.py
│   ├── scoring.py
│   └── role_classifier.py
│
├── data/
│   └── questions_seed.json
│
└── README.md
</code></pre>

</div>

<div class="section">

<h2>🗄 Database Schema</h2>

<ul>

<li><strong>Users</strong> – Candidate & Admin information</li>

<li><strong>Questions</strong> – Interview questions with ideal answers</li>

<li><strong>Interview Sessions</strong> – Stores interview details</li>

<li><strong>Session Answers</strong> – Candidate responses and scores</li>

<li><strong>Reports</strong> – Final performance reports</li>

</ul>

</div>

<div class="section">

<h2>📈 Interview Scoring Formula</h2>

<pre><code>Interview Score =
(Technical × 0.35)
+
(Communication × 0.25)
+
(Grammar × 0.20)
+
(Confidence × 0.20)
</code></pre>

</div>

<div class="section">

<h2>🚀 Getting Started</h2>

<h3>Prerequisites</h3>

<ul>

<li>Python 3.10+</li>

<li>Node.js 18+</li>

<li>PostgreSQL 14+</li>

</ul>

<h3>Backend Setup</h3>

<pre><code>cd backend

python -m venv venv

source venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload
</code></pre>

<h3>Frontend Setup</h3>

<pre><code>cd frontend

npm install

npm run dev
</code></pre>

<h3>Environment Variables</h3>

<pre><code>DATABASE_URL=postgresql://user:password@localhost:5432/interview_db

JWT_SECRET=your_secret_key

WHISPER_MODEL=base
</code></pre>

</div>

<div class="section">

<h2>🛣 Roadmap</h2>

<ul>

<li>Adaptive Interview Questions</li>

<li>AI Follow-up Questions</li>

<li>Coding Interview Mode</li>

<li>Resume Upload</li>

<li>Job Description Upload</li>

<li>Learning Plan Generator</li>

<li>Progress Dashboard</li>

</ul>

</div>

<div class="section">

<h2>🏆 Skills Demonstrated</h2>

<span class="badge">Machine Learning</span>
<span class="badge">NLP</span>
<span class="badge">Speech Recognition</span>
<span class="badge">FastAPI</span>
<span class="badge">React</span>
<span class="badge">Python</span>
<span class="badge">Database Design</span>
<span class="badge">API Development</span>

</div>

<div class="section">

<h2>📜 License</h2>

<p>MIT License (Recommended)</p>

</div>

<div class="footer">

Made with ❤️ for AI Interview Preparation System

</div>

</div>

</body>
</html>
