# AI Code Review Assistant

AI Code Review Assistant is a full-stack web application that automates code quality analysis using static analysis tools and AI-powered reviews. Users can review individual source files, scan complete projects, analyze GitHub repositories, and generate professional PDF reports from a single dashboard.

The application combines traditional static analysis with Google's Gemini AI to provide actionable feedback on code quality, maintainability, security, readability, and best practices.

---

# Features

## Authentication

- User Registration
- User Login
- JWT Authentication
- Protected Routes
- User Profile Management
- Change Password
- Delete Account

## Project Management

- Create Projects
- Edit Projects
- Delete Projects
- Search Projects
- Language Categorization
- Project Dashboard

## AI Code Review

- Single File Review
- ZIP Project Analysis
- GitHub Repository Analysis
- AI Generated Suggestions
- Code Quality Score
- Maintainability Analysis
- Security Recommendations
- Best Practice Recommendations

## Static Code Analysis

- ESLint Integration
- Error Detection
- Warning Detection
- Code Quality Metrics
- File Statistics

## Dashboard

- Project Statistics
- Total Reviews
- Average AI Score
- Language Distribution
- Recent Activity
- Review History
- Error & Warning Summary

## Analytics

- Review Trends
- Monthly Activity
- Language Distribution Chart
- Error vs Warning Analysis
- AI Score Distribution
- Performance Insights

## Reports

- Professional PDF Reports
- Downloadable Review Reports
- Static Analysis Summary
- AI Review Summary

## User Experience

- Responsive Design
- Dark / Light Theme
- Search Functionality
- Notifications
- Error Boundary
- 404 Page
- Loading States

---

# Supported Languages

- JavaScript
- TypeScript
- Python
- Java
- C
- C++
- C#
- PHP
- Go
- Ruby
- Kotlin
- Swift

---

# Tech Stack

## Frontend

- React.js
- Vite
- Tailwind CSS
- Framer Motion
- React Router DOM
- Axios
- Recharts
- Lucide React
- Sonner

## Backend

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Multer
- PDFKit

## Artificial Intelligence

- Google Gemini API

## Static Analysis

- ESLint

---

# Installation

## Clone Repository

```bash
git clone https://github.com/anni9901mish/AI-Code-Review-Assistant.git

cd AI-Code-Review-Assistant
```

## Backend Setup

```bash
cd backend

npm install
```

Create a `.env` file:

```env
PORT=5000

DATABASE_URL=YOUR_DATABASE_URL

JWT_SECRET=YOUR_SECRET_KEY

GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

Generate Prisma Client

```bash
npx prisma generate
```

Run Migrations

```bash
npx prisma migrate dev
```

Start Backend

```bash
npm run dev
```

## Frontend Setup

```bash
cd frontend

npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Start Frontend

```bash
npm run dev
```

---

# Project Workflow

1. Register or Login
2. Create a Project
3. Upload a source file, ZIP archive, or provide a GitHub repository URL
4. Static analysis is performed
5. AI reviews the submitted code using Gemini AI
6. Dashboard and Analytics are updated
7. Generate and download the PDF report

---

# Supported Analysis

- Single File Analysis
- ZIP Project Analysis
- GitHub Repository Analysis
- AI-Based Code Review
- Static Code Analysis
- PDF Report Generation

---

# Future Improvements

- Team Collaboration
- Pull Request Review
- Docker Support
- GitHub Actions Integration
- SonarQube Integration
- Security Vulnerability Scanner
- AI Chat Assistant
- Multi Repository Dashboard
- Email Notifications

---

# Author

**Animesh Mishra**

MCA Student | Full Stack Developer | AI Enthusiast

GitHub: https://github.com/anni9901mish

LinkedIn: https://www.linkedin.com/in/animeshmishra/

---

# License

This project is licensed under the MIT License.
