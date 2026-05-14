# ⚖️ BiasBench

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.9+-blue?style=flat&logo=python)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **An AI forensics laboratory to simultaneously prompt, compare, and evaluate multiple LLMs for hidden biases using a localized Judge AI.**

BiasBench is a full-stack platform designed to help users investigate how different large language models respond to the same prompt under identical conditions. It enables side-by-side comparison of multiple LLM outputs and uses a dedicated Judge AI to evaluate tone, subjectivity, alignment, and possible bias patterns in real time.

Whether the prompt is controversial, technical, political, or ethically sensitive, BiasBench helps surface how model architecture, provider-level safeguards, and response style differ across systems. The result is a practical forensic workspace for auditing model behavior instead of relying on isolated impressions.

---

## ✨ Key Features

- **Multi-Model Routing:** Send one prompt to multiple models at the same time through the OpenRouter API, enabling fast and consistent cross-model comparison.
- **Judge AI Evaluation:** A dedicated evaluation layer reviews generated responses and produces a structured forensics report with metrics such as **Subjectivity Score** and **Agreement Rate**.
- **Cinematic & Fast Modes:** Choose between a dramatic streaming experience that renders answers character-by-character or a fast mode that instantly shows the completed output.
- **The Vault:** Every prompt, model response, and Judge verdict is stored locally in SQLite for later review and historical analysis.
- **Markdown Export:** Export any completed audit as a clean `.md` report for sharing, archiving, or publication.
- **Premium UI:** Built with a polished frosted-glass interface using Next.js and Tailwind CSS, with responsive layouts, syntax highlighting, floating controls, and dark mode aesthetics.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js, React, Tailwind CSS, Lucide Icons, React-Markdown |
| **Backend** | Python, FastAPI, Uvicorn, Asyncio |
| **Database** | SQLite, SQLAlchemy |
| **AI Integration** | OpenRouter API |
| **Deployment** | Vercel (frontend), Render (backend) |

---

## 🧠 How It Works

BiasBench follows a simple but powerful audit pipeline:

1. The user enters a prompt and selects multiple target LLMs.
2. The backend dispatches the same input to each selected model through OpenRouter.
3. Responses are streamed or returned in fast mode to the frontend.
4. A localized Judge AI reads all returned outputs and evaluates them comparatively.
5. The system stores the full interaction in SQLite for future retrieval.
6. The user can review, compare, and export the audit report in Markdown format.

This architecture makes BiasBench useful for:
- Bias detection experiments
- Safety filter comparison
- Prompt behavior benchmarking
- AI transparency research
- Educational demonstrations of model variance

---

## 📁 Project Structure

```bash
biasbench/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   └── database/
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── app/
│   ├── components/
│   ├── public/
│   ├── package.json
│   └── .env.local
└── README.md
```

> The exact folder structure may vary slightly depending on how the project is organized, but the frontend and backend are intended to remain cleanly separated.

---

## 🚀 Quick Start Guide

### Prerequisites

Make sure the following are installed before starting:

- [Node.js](https://nodejs.org/) version 18 or higher
- [Python](https://www.python.org/) version 3.9 or higher
- An [OpenRouter API key](https://openrouter.ai/)

---

## 1. Clone the Repository

```bash
git clone https://github.com/yourusername/biasbench.git
cd biasbench
```

---

## 2. Set Up the Python Backend

Open a terminal and move into the backend directory:

```bash
cd backend
```

Create and activate a virtual environment:

```bash
# macOS / Linux
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside the `backend` folder and add your OpenRouter key:

```env
OPENROUTER_API_KEY="your_openrouter_api_key_here"
```

Start the FastAPI development server:

```bash
uvicorn app.main:app --reload
```

If your `main.py` is placed directly inside `backend/`, use:

```bash
uvicorn main:app --reload
```

Once started, the backend will typically run at:

```bash
http://localhost:8000
```

On first launch, the local SQLite database file (for example, `biasbench.db`) will be created automatically.

---

## 3. Set Up the Next.js Frontend

Open a new terminal and move into the frontend directory:

```bash
cd frontend
```

Install Node dependencies:

```bash
npm install
```

If you are running everything locally, make sure your frontend API requests point to the backend server:

```bash
http://127.0.0.1:8000
```

This may be configured through:
- `.env.local`
- hardcoded fetch URLs in files such as `page.tsx`
- component files such as `sidebar.tsx`

Start the frontend development server:

```bash
npm run dev
```

The frontend should now be available at:

```bash
http://localhost:3000
```

---

## 4. Run Your First Audit

1. Open `http://localhost:3000` in your browser.
2. Select the models you want to compare.
3. Enter a controversial, complex, or technical prompt.
4. Click **Audit**.
5. Watch the responses stream in and review the Judge AI verdict.

This gives you an immediate side-by-side look at how different LLMs interpret and answer the same input.

---

## ⚙️ Environment Variables

### Backend `.env`

```env
OPENROUTER_API_KEY="your_openrouter_api_key_here"
```

### Frontend `.env.local` (optional example)

```env
NEXT_PUBLIC_API_BASE_URL="http://127.0.0.1:8000"
```

> Using environment variables for API base URLs is cleaner and more scalable than hardcoding endpoints inside components.

---

## 🔍 Example Use Cases

BiasBench can be used for a wide range of workflows:

- Comparing political or social prompt responses across LLMs
- Evaluating whether safety filters over-block technical content
- Auditing model neutrality in ethically sensitive scenarios
- Measuring consistency across open and closed model families
- Building a dataset of prompt-response-verdict records for future analysis
- Demonstrating bias evaluation concepts in classrooms, research demos, or portfolios

---

## 🧪 Future Improvements

Some strong next-step enhancements for BiasBench could include:

- user authentication and private audit history
- prompt templates for benchmark categories
- model latency tracking and cost estimation
- richer Judge AI scoring dimensions
- charts for historical bias trends
- CSV and PDF export support
- tagging, search, and filtering in The Vault
- team collaboration and shared audits

---

## 🤝 Contributing

Contributions are welcome.

If you want to improve BiasBench, you can:
- open an issue for bugs or feature requests
- submit a pull request with enhancements
- improve UI polish, evaluation logic, or export tooling
- expand model support and benchmarking depth

When contributing, keep changes focused, documented, and easy to review.

---

## 👨‍💻 Author

**Pratik Parihar**
## ⭐ Final Note

BiasBench is not just a prompt playground. It is a forensic evaluation environment built to help users inspect how language models differ in judgment, framing, safety behavior, and hidden subjectivity. In a world where AI systems increasingly shape information access, tools like BiasBench make comparison visible, structured, and actionable.
