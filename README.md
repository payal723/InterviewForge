<div align="center">
  <br />
  <h1 align="center">🚀 PrepWise AI</h1>
  <h3 align="center">An AI-Powered Mock Interview Platform</h3>
  <br />
  <p align="center">
    Welcome to PrepWise! This platform, built by <strong>Payal</strong>, is designed to help you ace your job interviews using intelligent AI voice agents.
  </p>
  <br />
  
  <div>
    <img src="https://img.shields.io/badge/-Next.JS-black?style=for-the-badge&logoColor=white&logo=nextdotjs&color=black" alt="next.js" />
    <img src="https://img.shields.io/badge/-Vapi.ai-white?style=for-the-badge&logoColor=black&color=5dfeca" alt="vapi" />
    <img src="https://img.shields.io/badge/-Tailwind_CSS-black?style=for-the-badge&logoColor=white&logo=tailwindcss&color=06B6D4" alt="tailwindcss" />
    <img src="https://img.shields.io/badge/-Firebase-black?style=for-the-badge&logoColor=white&logo=firebase&color=F57C00" alt="firebase" />
    <img src="https://img.shields.io/badge/-Google_Gemini-blue?style=for-the-badge&logoColor=white&logo=google&color=4285F4" alt="google gemini" />
  </div>
</div>

## 📋 Table of Contents

1.  [🤖 Introduction](#-introduction)
2.  [⚙️ Tech Stack](#-tech-stack)
3.  [🔋 Features](#-features)
4.  [🤸 Quick Start](#-quick-start)

## 🤖 Introduction

PrepWise is a modern web application designed to help users prepare for job interviews through realistic, AI-driven mock interviews. Built with Next.js, Firebase, and TailwindCSS, this platform leverages Vapi's advanced voice agents and Google Gemini to provide a seamless and interactive preparation experience. This project was developed by **Payal** to showcase the integration of cutting-edge AI technologies into a practical, user-focused tool.

## ⚙️ Tech Stack

-   **Frontend:** Next.js, React, Tailwind CSS
-   **Backend & Database:** Next.js API Routes, Firebase (Firestore)
-   **Authentication:** Firebase Authentication
-   **AI Voice Agent:** Vapi AI
-   **Language Model:** Google Gemini
-   **UI Components:** shadcn/ui
-   **Schema Validation:** Zod

## 🔋 Features

-   🔐 **Secure Authentication**: Easy sign-up and sign-in using Firebase email/password authentication.
-   🎙️ **AI-Powered Interviews**: Generate and conduct realistic interviews with an intelligent AI voice agent.
-   📊 **Instant Feedback**: Receive detailed, constructive feedback on your performance immediately after the interview.
-   ✨ **Modern & Responsive UI**: A clean, intuitive, and fully responsive user interface built with TailwindCSS.
-   📈 **Personalized Dashboard**: Track your past interviews, review feedback, and monitor your progress.
-   🔄 **Retake Interviews**: Practice makes perfect! Retake any interview to improve your skills.

## 🤸 Quick Start

Follow these steps to set up the project locally on your machine.

**Prerequisites**

Make sure you have the following installed:
-   [Git](https://git-scm.com/)
-   [Node.js](https://nodejs.org/en) (v18 or later)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

**1. Clone the Repository**

```bash
git clone https://github.com/payal723/ai-mock-interviews.git
cd ai-mock-interviews

. Install Dependencies
npm install

ENV
# Vapi Credentials
NEXT_PUBLIC_VAPI_WEB_TOKEN=
NEXT_PUBLIC_VAPI_ASSISTANT_ID=

# Google Gemini API Key
GOOGLE_GENERATIVE_AI_API_KEY=

# Firebase Client-Side Config
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK (Server-Side)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type": "service_account", "project_id": "...", ...}'

Running the Project
npm run dev

<div align="center">
<p>Developed with ❤️ by Payal</p>
</div>
