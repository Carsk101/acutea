# Acutea - Gradebook Management System

A modern, responsive web application for managing grades, students, and classes. Built with React, Vite, and Supabase.

## Features

- **Dashboard Overview** - View statistics, recent activity, and system status at a glance
- **Class Management** - Create and organize classes with term details
- **Student Enrollment** - Add and manage students, assign them to classes
- **Grade Categories** - Set up customizable grading categories (homework, quizzes, exams, etc.)
- **Assignment Grading** - Enter and manage grades with automatic calculations
- **Student Progress** - View individual student grade reports and progress tracking
- **Authentication** - Secure login system powered by Supabase Auth
- **Responsive Design** - Works on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend:** React 19, React Router 7, Vite
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **Styling:** Custom CSS with CSS variables
- **Build Tool:** Vite
- **Linting:** ESLint

## Quick Start

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Supabase account

### Setup

1. Clone the repository:
```bash
git clone https://github.com/Carsk101/acutea.git
cd acutea
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your Supabase credentials:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Database Setup

This app requires the following Supabase tables:
- `classes` - Class information
- `students` - Student records with class associations
- `categories` - Grading categories with weights
- `assignments` - Assignment details linked to classes and categories
- `grades` - Student grades linked to assignments

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Project Structure

```
├── src/
│   ├── components/     # Reusable UI components (Auth, Layout, etc.)
│   ├── pages/          # Page components (Dashboard, Classes, etc.)
│   ├── lib/            # Utility functions (Supabase client)
│   ├── assets/         # Static assets
│   ├── App.jsx         # Main app component with routes
│   └── main.jsx        # Entry point
├── public/             # Public static files
├── index.html          # HTML entry point
└── vite.config.js      # Vite configuration
```

## Pages

- **Dashboard** - Overview stats and quick actions
- **Classes** - Manage classes and enrolled students
- **Categories** - Configure grading categories and weights
- **Grading** - Enter and edit student grades
- **Student Grades** - View individual student progress reports
- **Privacy Policy / Terms** - Legal pages

## Deployment

The app is configured for Firebase Hosting deployment:

```bash
npm run build
firebase deploy
```

Or deploy to any static hosting service (Netlify, Vercel, etc.) from the `dist/` folder.

## License

Private project - all rights reserved.
