AbleShare – Collaborative Task Management Platform

AbleShare is a real-time collaborative task manager where users can create, assign, track and complete tasks with smooth UX, strong engineering structure, and reliable backend architecture.

Built with ❤️ using React (TypeScript), Node.js, Express, Prisma, PostgreSQL, Socket.io, Tailwind CSS.

✨ Core Features
👤 Authentication

Secure Login & Register

HTTP-Only Cookie Based Authentication

Protected Routes

Persistent Sessions

📝 Task Management

Create tasks

Assign tasks to self / others

Edit tasks

Delete tasks

👀 Task Views

Assigned to Me

Created by Me

Dashboard Overview

⚡ Real-Time Collaboration (Socket.io)

Live task updates

Instant notifications:

Task Assigned

Task Updated

Task Completed

🎯 Task Features

Priority (Low / Medium / High / Urgent)

Status (To-Do / In-Progress / Review / Completed)

Due Dates

Overdue Highlighting

Task Completion with tick animation

🎨 UI / UX

Fully Responsive

Clean Dashboard Layout

Sidebar Navigation

Elegant Panels

Smooth Interactions

🏗 Tech Stack
Frontend

React + TypeScript

React Router

React Hook Form + Zod

Axios

Tailwind CSS

React-Hot-Toast

Socket.io Client

Backend

Node.js + Express + TypeScript

Prisma ORM

PostgreSQL

JWT + Secure Cookies

Socket.io

Layered Architecture

Controllers

Services

Repositories

DTO + Validation

Middlewares

🗂 Architecture
AbleShare
│
├── backend
│   ├── src
│   │   ├── controllers
│   │   ├── services
│   │   ├── repositories
│   │   ├── middlewares
│   │   ├── routes
│   │   ├── prisma
│   │   └── socket
│
└── frontend
    ├── src
    │   ├── pages
    │   ├── components
    │   ├── context
    │   ├── api
    │   ├── hooks
    │   └── layout

⚙️ Environment Setup

▶️ Running the Project
1️⃣ Backend
cd backend
npm install
npx prisma migrate dev
npm run dev

2️⃣ Frontend
cd frontend
npm install
npm run dev

⚡ Real-Time System
Emits
task:created
task:updated
task:deleted
task:notification

Listens
task:notification

🧪 Testing

At least 3 unit tests are implemented for critical business logic (Task Service):

Task Creation

Status Update

Assignment Logic

📱 Responsive Design

Mobile First

Works on 🖥 Desktop / 📱 Mobile / 💻 Tablet

🚀 Deployment Ready

Environment Safe

Production Build Configured

Secure Cookies Enabled

Socket Ready for Cloud

❤️ Developer

Built passionately as part of a professional engineering challenge.
