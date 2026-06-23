# AI Tutor

AI Tutor is a full-stack web application for CBSE Class 10 Mathematics self evaluation. It uses a conversational chat interface where a student uploads the NCERT Mathematics textbook PDF, submits a question, submits an answer, and receives strict CBSE-style feedback generated from the uploaded textbook context.

The system is designed to reduce hallucinations by creating a temporary in-memory knowledge base from the uploaded NCERT PDF and restricting evaluation to the retrieved textbook context.

## Project Title

**AI Tutor - CBSE Class 10 Mathematics Self Evaluation System**

## Key Features

- Chat-style workflow instead of a traditional form.
- NCERT Mathematics textbook PDF upload.
- Temporary session-based knowledge base with no database.
- PDF text extraction using `pdf-parse`.
- OCR support for question images and handwritten answer images using `Tesseract.js`.
- Lightweight in-memory RAG.
- Keyword-based retrieval from uploaded textbook chunks.
- Strict CBSE examiner prompt for answer evaluation.
- LLM support through Groq Llama 3.3 or Google Gemini.
- Validates that uploaded PDFs look like NCERT Class 10 Mathematics content.
- Rejects invalid questions and answers such as greetings, random text, or unrelated input.
- Responsive React UI for desktop, tablet, and mobile.
- Blue-and-white gradient theme with a conversational card layout.
- Deployment-ready configuration for Vercel frontend and Render backend.

## How It Works

1. The user uploads an NCERT Class 10 Mathematics textbook PDF.
2. The backend extracts text from the PDF.
3. The backend validates that the PDF appears to be NCERT/Class 10/Mathematics content.
4. The extracted text is chunked into a temporary in-memory knowledge base.
5. The user submits a mathematics question as text or image.
6. If an image is uploaded, OCR extracts the question text.
7. The backend validates that the question is meaningful mathematics input and matches the uploaded textbook context.
8. The user submits an answer as text or image.
9. If an image is uploaded, OCR extracts the answer text.
10. The backend validates that the answer contains meaningful mathematical work.
11. Relevant textbook chunks are retrieved using keyword search.
12. The strict CBSE evaluation prompt is sent to the configured LLM.
13. The frontend displays marks, grade, feedback, missing points, and suggestions.

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Axios
- Lucide React icons

### Backend

- Node.js
- Express.js
- Multer
- pdf-parse
- Tesseract.js
- dotenv
- helmet
- cors

### LLM Providers

- Groq Llama 3.3
- Google Gemini

### RAG

- In-memory text chunks
- Keyword scoring
- No vector database
- No Pinecone
- No database required

## Folder Structure

```text
AI-Tutor/
  client/
    src/
      components/
      lib/
      App.jsx
      main.jsx
      styles.css
    package.json
    vercel.json
  server/
    src/
      middleware/
      routes/
      services/
      utils/
      server.js
    package.json
  render.yaml
  package.json
  README.md
```

## Backend Validation

The backend includes guardrails before evaluation:

- Rejects PDFs with too little readable text.
- Rejects unrelated PDFs such as story books or notes.
- Checks for NCERT, Class 10, Mathematics, chapter, exercise, example, theorem, and mathematics-related signals.
- Rejects invalid questions such as `hi`, `how are you`, `test`, `sdfs`, or non-mathematical text.
- Rejects invalid answers such as `a1`, random strings, greetings, or answers with no mathematical signal.
- Rejects questions that do not retrieve relevant context from the uploaded textbook.

These checks are heuristic and are meant to prevent obvious misuse before calling the LLM.

## Evaluation Prompt Behavior

The LLM is instructed to behave as a strict CBSE Class 10 Mathematics examiner and return only JSON:

```json
{
  "marks": "number (e.g., 3/5)",
  "grade": "A/B/C/D/F",
  "feedback": "Detailed strict evaluation explaining errors and correctness",
  "missing_points": ["List of missing concepts or steps"],
  "suggestions": ["Specific improvements required"]
}
```

The prompt enforces:

- Use only provided NCERT context.
- Do not use external knowledge.
- State insufficient context when required.
- Evaluate step-by-step correctness.
- Penalize missing steps, incorrect reasoning, lack of justification, and incomplete answers.
- Do not award full marks unless all steps and reasoning are correct.
- Assign zero marks for irrelevant or incorrect answers.

## Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/iamVishnuP/AI-Tutor.git
cd AI-Tutor
```

### 2. Install Dependencies

```bash
npm run install:all
```

### 3. Configure Backend Environment

Create a backend environment file:

```bash
cd server
cp .env.example .env
```

For Groq:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
```

For Gemini:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
```

### 4. Configure Frontend Environment

Create a frontend environment file:

```bash
cd ../client
cp .env.example .env
```

Use:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 5. Run the App

Run the backend:

```bash
npm run dev:server
```

Run the frontend in another terminal:

```bash
npm run dev:client
```

Open:

```text
http://localhost:5173
```

## API Endpoints

### Health Check

```http
GET /api/health
```

### Upload Textbook PDF

```http
POST /api/pdf
```

Multipart field:

- `pdf`: NCERT Class 10 Mathematics PDF

### Submit Question

```http
POST /api/question
```

Multipart fields:

- `sessionId`
- `questionText` optional
- `image` optional question image

### Evaluate Answer

```http
POST /api/evaluate
```

Multipart fields:

- `sessionId`
- `answerText` optional
- `image` optional answer image

## Deployment

### Deploy Backend on Render

1. Create a new Render Web Service.
2. Connect this GitHub repository.
3. Set root directory to `server`.
4. Set build command:

```bash
npm install
```

5. Set start command:

```bash
npm start
```

6. Add environment variables:

```env
CLIENT_ORIGIN=https://your-vercel-app.vercel.app
LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
```

For Gemini, use:

```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
```

### Deploy Frontend on Vercel

1. Import this GitHub repository into Vercel.
2. Set root directory to `client`.
3. Select Vite as the framework.
4. Set build command:

```bash
npm run build
```

5. Set output directory:

```text
dist
```

6. Add environment variable:

```env
VITE_API_BASE_URL=https://your-render-backend-url.onrender.com/api
```

## Scripts

From the root folder:

```bash
npm run install:all
npm run dev:server
npm run dev:client
npm run build:client
npm run start:server
```

From `client`:

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

From `server`:

```bash
npm run dev
npm start
npm run lint
```

## Limitations

- The app uses keyword retrieval, not semantic embeddings.
- OCR quality depends on image clarity and handwriting quality.
- LLM evaluation is AI-assisted and should not be treated as an official CBSE score.
- PDF validation uses practical heuristics and may need tuning for scanned or unusual textbook PDFs.
- Session data is stored in memory and expires automatically.

## License

This project is for educational use.
