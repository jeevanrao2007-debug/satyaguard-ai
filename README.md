# 🛡️ SatyaGuard AI

> **AI-Powered Multimodal Cybersecurity Intelligence Platform**

SatyaGuard AI is a production-ready cybersecurity platform that detects scams, phishing attempts, manipulated media, and social engineering attacks across **text, images, and audio** using Google's **Gemini AI**. The platform provides explainable AI analysis, secure forensic reporting, audit logging, historical analytics, and a trusted knowledge base to help users identify digital threats in real time.

---

## 🌐 Live Demo

**Application:**  
https://satyaguard-ai-206436926864.asia-south1.run.app/

---

# 📌 Overview

Cybercrime is rapidly evolving through fake messages, forged payment screenshots, manipulated voice recordings, and AI-generated content.

SatyaGuard AI provides a unified security platform capable of analyzing multiple content types using advanced AI reasoning and forensic techniques.

The platform is designed for:

- 👤 General Users
- 🏦 Financial Institutions
- 🏢 Enterprises
- 👮 Cyber Crime Investigation Teams
- 🎓 Researchers
- 🛡️ Security Analysts

---

# ✨ Features

## 📝 Text Threat Detection

- Scam Detection
- Phishing Analysis
- Social Engineering Detection
- Fraud Classification
- Explainable AI reasoning
- Risk scoring

---

## 🖼 Image Forensics

- Fake Screenshot Detection
- Payment Receipt Analysis
- QR Code Scam Identification
- Manipulation Detection
- Visual Threat Assessment

---

## 🎙 Audio Intelligence

- Voice Scam Analysis
- Impersonation Detection
- AI-generated Speech Indicators
- Social Engineering Detection
- Confidence Scoring

---

## 📊 Analytics Dashboard

- Live Scan Statistics
- Threat Distribution
- Severity Analysis
- Daily Scan Trends
- Threat Category Visualization
- Confidence Metrics

---

## 📜 Audit Logs

Every completed scan is securely stored with:

- Timestamp
- Scan Type
- Risk Score
- Confidence
- Threat Category
- AI Explanation
- Recommendations

---

## 📚 Trusted Knowledge Base

Semantic AI-powered search across cybersecurity advisories including:

- Banking Scams
- Digital Fraud
- Cybercrime Alerts
- Security Awareness
- Best Practices

---

## 🔒 Security

- Secure backend processing
- Firestore persistence
- Environment variable protection
- API key isolation
- Production deployment on Google Cloud Run

---

# 🏗 System Architecture

```
                 User
                   │
                   ▼
        React + Vite Frontend
                   │
                   ▼
          Express Backend API
                   │
     ┌─────────────┼──────────────┐
     │             │              │
     ▼             ▼              ▼
 Gemini AI     Firestore      Knowledge Base
     │             │              │
     └─────────────┼──────────────┘
                   │
                   ▼
           Threat Intelligence
                   │
                   ▼
            Analytics Dashboard
```

---

# ⚙ Tech Stack

## Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Lucide Icons

---

## Backend

- Node.js
- Express.js
- TypeScript
- Firebase Admin SDK

---

## AI

- Google Gemini AI
- Gemini 2.5 Flash
- Gemini Embedding

---

## Database

- Google Firestore

---

## Cloud

- Google Cloud Run
- Google Cloud Build

---

# 🚀 Deployment

The application is deployed as a **monolithic full-stack application** on **Google Cloud Run**.

Frontend and backend are served by a single Express server.

---

# 📂 Project Structure

```
satyaguard-ai
│
├── src/
│   ├── components/
│   ├── assets/
│   ├── types.ts
│   └── App.tsx
│
├── server/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   └── config/
│
├── dist/
├── Dockerfile
├── cloudbuild.yaml
├── package.json
└── README.md
```

---

# 🛠 Installation

Clone the repository

```bash
git clone https://github.com/jeevanrao2007-debug/satyaguard-ai.git
```

Navigate into the project

```bash
cd satyaguard-ai
```

Install dependencies

```bash
npm install
```

Create a `.env` file.

```env
GEMINI_API_KEY=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
GOOGLE_CLOUD_PROJECT=
PORT=3000
NODE_ENV=development
```

Start the development server

```bash
npm run dev
```

Build

```bash
npm run build
```

Type check

```bash
npx tsc --noEmit
```

---

# 📸 Screenshots

> Add screenshots of:

- Landing Page
- Threat Scanner
- Image Analysis
- Audio Analysis
- Analytics Dashboard
- Audit Logs
- Knowledge Base

---

# 🔐 Privacy & Security

SatyaGuard AI does **not** expose API keys or credentials in the frontend.

Sensitive configuration is handled through environment variables.

Production deployments should use Google Cloud environment variables or Secret Manager.

---

# 🎯 Use Cases

- Detect fraudulent payment screenshots
- Identify phishing messages
- Analyze suspicious voice recordings
- Educate users about cyber threats
- Assist cybercrime investigations
- Enterprise security awareness

---

# 🌟 Future Enhancements

- OCR-based document analysis
- Browser Extension
- Email Threat Detection
- WhatsApp Scam Detection
- Deepfake Video Analysis
- Multi-language Support
- Real-time Threat Intelligence Feed

---

# 👨‍💻 Author

**Jeevan Rao**

AI • Full Stack Development • Cybersecurity • Cloud Computing

GitHub:
https://github.com/jeevanrao2007-debug

---

# 📄 License

This project is intended for educational, research, and hackathon purposes.
