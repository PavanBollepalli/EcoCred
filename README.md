# EcoCred - Gamified Environmental Education Platform

<p align="center">
  <img src="public/svg-logo.svg" alt="EcoCred Logo" width="120" />
</p>

<p align="center">
  <strong>AI-Powered Environmental Education Platform for Students and Schools</strong>
</p>

<p align="center">
  <a href="https://github.com/EcoCred/ecocred">
    <img src="https://img.shields.io/badge/Version-2.0.0-green?style=flat-square" alt="Version" />
  </a>
  <a href="https://nextjs.org">
    <img src="https://img.shields.io/badge/Framework-Next.js_14-blue?style=flat-square" alt="Next.js" />
  </a>
  <a href="https://www.mongodb.com">
    <img src="https://img.shields.io/badge/Database-MongoDB-brightgreen?style=flat-square" alt="MongoDB" />
  </a>
  <a href="https://typescriptlang.org">
    <img src="https://img.shields.io/badge/Language-TypeScript-blue?style=flat-square" alt="TypeScript" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="License" />
  </a>
</p>

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [System Architecture](#system-architecture)
5. [Database Schema](#database-schema)
6. [Project Structure](#project-structure)
7. [User Roles & Workflows](#user-roles--workflows)
8. [API Endpoints](#api-endpoints)
9. [Getting Started](#getting-started)
10. [Environment Configuration](#environment-configuration)
11. [Features In Depth](#features-in-depth)
12. [Gamification System](#gamification-system)
13. [AI Verification System](#ai-verification-system)
14. [Deployment](#deployment)
15. [Contributing](#contributing)
16. [License](#license)
17. [Support & Contact](#support--contact)

---

## Project Overview

**EcoCred** is a comprehensive, AI-powered, gamified environmental education platform designed to empower students and schools to take meaningful climate action. The platform creates a verifiable ecosystem where environmental tasks are tracked, validated using AI computer vision, and rewarded with "EcoPoints."

### Mission

To bridge the gap between learning about climate change and taking real action by:
- Providing interactive educational content
- Verifying real-world environmental actions through AI
- Encouraging sustained engagement through gamification
- Providing schools with measurable impact data

### Target Audience

- **Students**: Primary and secondary school students (ages 10-18)
- **Teachers**: Educators managing environmental education programs
- **Schools**: Institutions looking to track and improve environmental impact
- **Administrators**: System administrators managing platform operations

---

## Key Features

### 🤖 AI-Verified Impact
- **Automated Validation**: Uses YOLOv8 and ResNet50 models for image analysis
- **Smart Feedback**: Instant analysis of uploaded proof photos with confidence scores
- **Fraud Prevention**: Detects duplicate submissions and irrelevant images
- **Multi-Object Detection**: Identifies trees, waste items, solar panels, water features, etc.

### 🎮 Advanced Gamification
- **EcoPoints Engine**: Points awarded based on task difficulty, category, and environmental impact
- **Dynamic Badges**: Achievements like "Tree Planter," "Waste Warrior," "Energy Saver," "Water Guardian"
- **Level System**: Progression through levels based on total points earned
- **Streak Tracking**: Daily login rewards and streak bonuses for consistent participation
- **Leaderboards**: Class, School, and Global rankings

### 🏫 School Management
- **Teacher Dashboard**: Review flagged submissions, manage class rosters, create content
- **Admin Dashboard**: School management, user management, analytics, system settings
- **Impact Reports**: Track total waste saved, trees planted, energy conserved
- **Multi-School Support**: College code-based multi-tenancy for multiple schools

### 📚 Educational Content
- **Interactive Lessons**: Teacher-created lessons with quizzes and progress tracking
- **Assessments**: AI-generated quizzes on environmental topics
- **Educational Games**: Interactive games teaching conservation concepts

### 📅 Events & Calendar
- **Seasonal Events**: Special events with unique rewards and challenges
- **Calendar System**: Event scheduling, deadlines, and reminders
- **Announcements**: School-wide and platform-wide announcements

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.2.16 | React framework with App Router |
| React | 18.x | UI library |
| TypeScript | 5.x | Type-safe development |
| Tailwind CSS | 4.1.9 | Utility-first CSS framework |
| Shadcn UI | Latest | Component library built on Radix UI |
| Framer Motion | 12.31.0 | Animation library |
| GSAP | 3.14.2 | Advanced animations |
| Lucide React | 0.454.0 | Icon library |
| Recharts | 2.15.4 | Charting library |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime environment |
| MongoDB | 6.x | Primary database |
| Mongoose | 8.18.1 | ODM for MongoDB |
| MinIO | 8.0.6 | S3-compatible object storage |

### AI Service (Separate)
| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | Latest | Python web framework |
| PyTorch | Latest | ML framework |
| Ultralytics YOLOv8 | Latest | Object detection |
| Pillow | Latest | Image processing |

### Development Tools
| Technology | Purpose |
|------------|---------|
| ESLint | Code linting |
| Prettier | Code formatting |
| Vercel | Deployment platform |

---

## System Architecture

### Overview

EcoCred follows a modern **microservices-inspired architecture** that separates the interactive Next.js frontend from the Python-based AI processing layer.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │
│  │   Student   │  │   Teacher   │  │    Admin    │  │    Public       │    │
│  │   Portal    │  │   Portal    │  │   Portal    │  │    Landing      │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER (Next.js)                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     Next.js 14 App Router                             │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │   │
│  │  │  Users   │ │  Tasks   │ │Lessons   │ │Assess-   │ │ Games   │ │   │
│  │  │  API     │ │   API    │ │   API    │ │ments API │ │   API   │ │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └─────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
┌─────────────────────────┐ ┌─────────────┐ ┌─────────────────────────────┐
│      MONGODB ATLAS      │ │   MINIO     │ │    AI SERVICE (FastAPI)     │
│      (Data Store)       │ │  (Files)    │ │    (Image Analysis)        │
│  ┌───────────────────┐  │ │             │ │  ┌────────────────────────┐ │
│  │ • users           │  │ │ • Task      │ │  │ • YOLOv8 Detection      │ │
│  │ • tasks           │  │ │   Images   │ │  │ • ResNet Classification │ │
│  │ • submissions     │  │ │ • Profile  │ │  │ • Image Validation      │ │
│  │ • lessons         │  │ │   Pictures │ │  └────────────────────────┘ │
│  │ • badges           │  │ │ • Lesson  │ │                             │
│  │ • assessments     │  │ │   Covers  │ │                             │
│  │ • schools         │  │ └───────────┘ │                             │
│  └───────────────────┘  └───────────────┘                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

#### Frontend (Next.js 14)
- **Landing Page**: Public marketing page with statistics and features
- **Student Portal**: Dashboard for completing tasks, viewing lessons, playing games
- **Teacher Portal**: Content management, submission review, student oversight
- **Admin Portal**: System-wide management and analytics
- **Authentication**: Login, signup, password reset flows

#### Backend (Next.js API Routes)
- **User Management**: Authentication, profile management
- **Task Management**: CRUD operations for environmental tasks
- **Submission Handling**: Evidence upload, status tracking
- **Content Management**: Lessons, assessments, badges
- **Points System**: Transaction ledger, reward calculations
- **Analytics**: Aggregated statistics and reports

#### AI Service (FastAPI)
- **Image Analysis**: Process submitted evidence images
- **Object Detection**: Identify environmental objects (trees, waste, etc.)
- **Confidence Scoring**: Generate ML confidence percentages
- **Fraud Detection**: Flag suspicious submissions

---

## Database Schema

### MongoDB Collections

#### Users Collection
```typescript
{
  _id: ObjectId,
  id: string,                    // Unique identifier (timestamp + random)
  email: string,
  name: string,
  role: "student" | "teacher" | "admin",
  school: string,
  collegeCode: string,            // Multi-tenancy identifier
  ecoPoints: number,             // Total points earned
  badges: string[],              // Array of badge IDs
  streak: number,                // Consecutive days active
  joinedAt: string,              // ISO timestamp
  completedLessons: string[],    // Lesson IDs completed
  lessonProgress: {              // Per-lesson progress
    [lessonId]: {
      lessonId: string,
      completed: boolean,
      progress: number,
      completedAt: string,
      pointsEarned: number
    }
  },
  profilePicture?: string,
  bio?: string,
  level?: number,
  lastLogin?: string,
  lastDailyReward?: string       // Last reward claim date (YYYY-MM-DD)
}
```

#### Tasks Collection
```typescript
{
  _id: ObjectId,
  id: string,
  title: string,
  description: string,
  category: "planting" | "waste" | "energy" | "water",
  points: number,
  createdBy: string,              // Teacher/Admin ID
  collegeCode: string,
  createdAt: string
}
```

#### Submissions Collection
```typescript
{
  _id: ObjectId,
  id: string,
  taskId: string,
  studentId: string,
  collegeCode: string,
  evidence: string,              // URL to uploaded image
  location?: string,             // Optional location string
  description?: string,          // Student notes
  status: "pending" | "approved" | "rejected",
  submittedAt: string,
  reviewedAt?: string,
  reviewedBy?: string,
  comments?: string,
  mlConfidence?: number,         // AI confidence percentage
  aiDetectedObjects?: string[],  // Objects detected by AI
  aiReasoning?: string           // AI analysis description
}
```

#### Lessons Collection
```typescript
{
  _id: ObjectId,
  id: string,
  title: string,
  description: string,
  category: "planting" | "waste" | "energy" | "water" | "aptitude" | "general",
  collegeCode: string,
  icon: string,                  // Lucide icon name
  coverImage: string,
  duration: string,
  points: number,
  content: {
    introduction: string,
    sections: [
      { title: string, content: string[] }
    ],
    tips: string[],
    quiz: [
      {
        question: string,
        options: string[],
        correct: number
      }
    ]
  },
  createdBy: string,
  schoolId?: string,
  isActive: boolean,
  createdAt: string,
  updatedAt: string
}
```

#### Badges Collection
```typescript
{
  _id: ObjectId,
  id: string,
  name: string,
  description: string,
  icon: string,                  // Lucide icon name
  color: string,                 // Tailwind color class
  requirement: {
    type: "points" | "tasks" | "lessons" | "streak" | "category_tasks",
    value: number,
    category?: "planting" | "waste" | "energy" | "water"
  },
  createdBy: string,
  schoolId?: string,
  collegeCode?: string,
  isActive: boolean,
  createdAt: string,
  updatedAt?: string
}
```

#### Assessments Collection
```typescript
{
  _id: ObjectId,
  id: string,
  title: string,
  topic: string,
  description: string,
  category: "planting" | "waste" | "energy" | "water",
  collegeCode: string,
  questions: [
    {
      id: string,
      question: string,
      type: 'mcq' | 'short_answer',
      options?: string[],
      correctAnswer: string | number,
      explanation: string,
      points: number
    }
  ],
  totalPoints: number,
  badgeName: string,
  createdBy: string,
  schoolId?: string,
  status: 'active' | 'draft' | 'archived',
  difficulty: 'easy' | 'medium' | 'hard',
  timeLimit: number,
  isActive: boolean,
  createdAt: string,
  updatedAt: string
}
```

#### Schools Collection
```typescript
{
  _id: ObjectId,
  id: string,
  name: string,
  location: string,
  description?: string,
  isActive: boolean,
  createdAt: string,
  updatedAt: string
}
```

#### Calendar Events Collection
```typescript
{
  _id: ObjectId,
  id: string,
  title: string,
  description?: string,
  startDate: string,
  endDate: string,
  type: "deadline" | "event" | "holiday" | "seasonal",
  isAllDay: boolean,
  schoolId?: string,
  collegeCode: string,
  createdBy: string,
  createdAt: string
}
```

#### Seasonal Events Collection
```typescript
{
  _id: ObjectId,
  id: string,
  name: string,
  description: string,
  startDate: string,
  endDate: string,
  rewards: {
    points: number,
    badges: string[],
    specialItems: string[]
  },
  isActive: boolean,
  collegeCode: string,
  createdAt: string
}
```

#### Announcements Collection
```typescript
{
  _id: ObjectId,
  id: string,
  title: string,
  message: string,
  authorId: string,
  authorName: string,
  schoolId?: string,
  targetAudience: "all" | "students" | "teachers" | "specific_school",
  priority: "low" | "medium" | "high",
  isActive: boolean,
  createdAt: string,
  expiresAt?: string
}
```

#### Points Ledger Collection
```typescript
{
  _id: ObjectId,
  id: string,
  userId: string,
  points: number,
  source: 'daily_login' | 'game' | 'assessment' | 'task' | 'lesson' | 'admin_adjustment',
  sourceId?: string,
  timestamp: string,
  metadata?: Record<string, any>
}
```

#### Assessment Attempts Collection
```typescript
{
  _id: ObjectId,
  id: string,
  userId: string,
  assessmentId: string,
  answers: Record<string, string>,
  score: number,
  maxScore: number,
  completedAt: string,
  pointsEarned: number,
  badgeAwarded?: boolean
}
```

#### Game Completions Collection
```typescript
{
  _id: ObjectId,
  id: string,
  userId: string,
  gameId: string,
  score: number,
  completedAt: string,
  pointsEarned: number
}
```

#### Event Logs Collection
```typescript
{
  _id: ObjectId,
  id: string,
  userId: string,
  eventType: 'daily_login' | 'game_completed' | 'assessment_completed' | 'task_approved' | 'lesson_completed',
  eventData: Record<string, any>,
  timestamp: string
}
```

---

## Project Structure

```
SIH-2025/
├── app/                          # Next.js App Router pages
│   ├── api/                      # API Routes
│   │   ├── users/                # User management endpoints
│   │   ├── tasks/                # Task management endpoints
│   │   ├── submissions/          # Submission handling
│   │   ├── lessons/              # Lesson management
│   │   ├── assessments/          # Assessment system
│   │   ├── badges/               # Badge management
│   │   ├── schools/              # School management
│   │   ├── calendar/             # Calendar events
│   │   ├── seasonal-events/      # Seasonal campaigns
│   │   ├── announcements/        # Announcements
│   │   ├── points/               # Points ledger
│   │   ├── games/                # Game system
│   │   ├── analyze-image/        # AI image analysis
│   │   ├── upload/               # File upload handling
│   │   ├── stats/                # Statistics endpoints
│   │   ├── init/                 # Database initialization
│   │   └── wipe-data/            # Data management
│   ├── login/                    # Login page
│   ├── signup/                   # Registration page
│   ├── forgot-password/          # Password recovery
│   ├── student/                  # Student portal
│   │   ├── page.tsx              # Student dashboard
│   │   ├── task/[id]/            # Task detail & submission
│   │   ├── lesson/[id]/          # Lesson viewer
│   │   ├── games/                # Games listing
│   │   ├── games/[gameId]/      # Individual game
│   │   ├── assessments/          # Assessment listing
│   │   └── assessments/[id]/     # Assessment taking
│   ├── teacher/                  # Teacher portal
│   │   ├── page.tsx              # Teacher dashboard
│   │   ├── create-task/          # Task creation
│   │   ├── create-lesson/        # Lesson creation
│   │   ├── create-assessment/   # Assessment creation
│   │   ├── create-badge/         # Badge creation
│   │   └── assessments/          # Assessment management
│   ├── admin/                    # Admin portal
│   │   └── page.tsx              # Admin dashboard
│   ├── profile/                  # User profile page
│   ├── about/                    # About page
│   ├── gallery/                  # Image gallery
│   ├── layout.tsx               # Root layout
│   └── page.tsx                  # Landing page
│
├── components/                   # React components
│   ├── auth/                    # Authentication components
│   │   ├── login-form.tsx
│   │   ├── signup-form.tsx
│   │   ├── forgot-password-form.tsx
│   │   └── auth-guard.tsx        # Role-based access control
│   ├── ui/                      # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── tabs.tsx
│   │   ├── progress.tsx
│   │   └── ... (30+ UI components)
│   ├── games/                   # Game components
│   │   ├── GameContainer.tsx
│   │   ├── WaterConservationGame.tsx
│   │   ├── EnergyConservationGame.tsx
│   │   ├── WasteSegregationGame.tsx
│   │   └── PollutionCleanupGame.tsx
│   ├── gamification/            # Gamification components
│   │   └── badge-system.tsx
│   ├── teacher/                 # Teacher-specific components
│   │   └── assessments-manager.tsx
│   ├── celebrations/            # Celebration effects
│   │   ├── achievement-popup.tsx
│   │   ├── daily-login-reward.tsx
│   │   └── confetti.tsx
│   ├── navigation.tsx           # Main navigation
│   ├── footer.tsx               # Footer component
│   ├── calendar.tsx             # Calendar component
│   ├── seasonal-events.tsx      # Event display
│   ├── announcements.tsx        # Announcements display
│   ├── leaderboard.tsx          # Rankings display
│   ├── notification-center.tsx  # Notifications
│   ├── progress-tracker.tsx     # Progress visualization
│   ├── interactive-map.tsx      # Impact map
│   ├── chat-widget.tsx          # AI chat assistant
│   ├── galaxy.tsx               # Animated background
│   ├── avatar.tsx               # User avatar
│   ├── student-profile.tsx      # Student profile card
│   ├── school-select.tsx        # School selection
│   ├── school-data-list.tsx     # School data display
│   └── image-upload.tsx         # Image upload component
│
├── lib/                         # Core libraries
│   ├── types.ts                 # TypeScript interfaces
│   ├── database.ts              # MongoDB operations
│   ├── storage-api.ts           # API client functions
│   ├── mongodb.ts               # MongoDB connection
│   ├── minio.ts                 # MinIO file storage
│   └── utils.ts                 # Utility functions
│
├── hooks/                       # Custom React hooks
│   └── use-badge-checker.ts     # Badge achievement monitoring
│
├── public/                      # Static assets
│   ├── uploads/                 # User-uploaded files
│   │   └── task-images/         # Task submission images
│   ├── *.jpg, *.png, *.svg      # Static images
│   └── favicon.ico              # Site favicon
│
├── styles/                      # Global styles
│   └── globals.css              # Global CSS
│
├── .env.local                   # Environment variables
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── tailwind.config.ts           # Tailwind config
├── postcss.config.mjs           # PostCSS config
└── README.md                    # This file
```

---

## User Roles & Workflows

### Student Workflow

1. **Registration**: Sign up with email, school selection, role = "student"
2. **Dashboard**: View points, streak, tasks, and progress
3. **Learning**: Browse and complete interactive lessons
4. **Tasks**: Select environmental tasks, complete actions, upload proof
5. **AI Review**: Wait for AI verification (automatic) + teacher review
6. **Rewards**: Earn points, badges, level up
7. **Engagement**: Play educational games, take assessments, join events
8. **Competition**: Check leaderboard, compete with peers

### Teacher Workflow

1. **Registration**: Sign up with school credentials, role = "teacher"
2. **Dashboard**: Overview of students, submissions, pending reviews
3. **Content Creation**: Create tasks, lessons, assessments, badges
4. **Review**: Verify student submissions, approve/reject with feedback
5. **Analytics**: View class performance, engagement metrics
6. **Management**: Manage calendar, announcements, seasonal events

### Admin Workflow

1. **Dashboard**: System-wide overview and statistics
2. **School Management**: Create, update, delete schools
3. **User Management**: View, filter, delete users
4. **Analytics**: Deep dive into platform metrics
5. **Data Management**: Wipe data, system maintenance

---

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Users API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users (optional: `?collegeCode=CODE`) |
| POST | `/users` | Create new user |
| GET | `/users/user` | Get current user (`?userId=ID`) |
| GET | `/users/[id]` | Get user by ID |
| DELETE | `/users/[id]` | Delete user |

### Tasks API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Get all tasks (optional: `?collegeCode=CODE`) |
| POST | `/tasks` | Create new task |
| GET | `/tasks?taskId=ID` | Get specific task |

### Submissions API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/submissions` | Get all submissions |
| POST | `/submissions` | Create submission |
| GET | `/submissions?studentId=ID` | Get by student |
| GET | `/submissions?taskId=ID` | Get by task |
| DELETE | `/submissions/[id]` | Delete submission |

### Lessons API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/lessons/manage` | Get all lessons |
| POST | `/lessons/manage` | Create lesson |
| PUT | `/lessons/manage` | Update lesson |
| DELETE | `/lessons/manage?lessonId=ID` | Delete lesson |

### Assessments API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/assessments` | Get all assessments |
| POST | `/assessments` | Create assessment |
| PUT | `/assessments` | Update assessment |
| DELETE | `/assessments?id=ID` | Delete assessment |
| POST | `/assessments/attempt` | Submit assessment attempt |
| POST | `/assessments/generate` | AI-generate assessment |

### Badges API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/badges` | Get all badges |
| POST | `/badges` | Create badge |
| DELETE | `/badges?id=ID` | Delete badge |

### Schools API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/schools` | Get all schools |
| POST | `/schools` | Create school |
| PUT | `/schools/[id]` | Update school |
| DELETE | `/schools/[id]` | Delete school |

### Calendar API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/calendar` | Get calendar events |
| POST | `/calendar` | Create event |

### Seasonal Events API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/seasonal-events` | Get all events |
| POST | `/seasonal-events` | Create event |
| PUT | `/seasonal-events/[id]` | Update event |
| DELETE | `/seasonal-events/[id]` | Delete event |

### Points API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/points?userId=ID&action=ledger` | Get points history |
| GET | `/points?userId=ID&action=summary` | Get points summary |
| POST | `/daily-login` | Claim daily reward |

### Stats API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Get global statistics |
| POST | `/stats` | Update global statistics |

### Image API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analyze-image` | Analyze image with AI |
| POST | `/upload` | Upload file to storage |

---

## Getting Started

### Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 18+ | Required for Next.js |
| npm/pnpm | Latest | Package manager |
| MongoDB | 6.0+ | Local or Atlas |
| MinIO | Latest | Optional for production |

### Installation Steps

#### 1. Clone the Repository
```bash
git clone https://github.com/your-org/ecocred.git
cd ecocred
```

#### 2. Install Dependencies
```bash
npm install
# or with pnpm
pnpm install
```

#### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/ecocred
# or for MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecocred

# MinIO/S3 Storage
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=ecocred
MINIO_USE_SSL=false

# AI Service (optional - for production)
AI_SERVICE_URL=http://localhost:8000

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

#### 5. (Optional) Start AI Service
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## Environment Configuration

### Required Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/ecocred` |
| `MINIO_ENDPOINT` | MinIO server endpoint | `localhost:9000` |
| `MINIO_ACCESS_KEY` | MinIO access key | `minioadmin` |
| `MINIO_SECRET_KEY` | MinIO secret key | `minioadmin` |
| `MINIO_BUCKET_NAME` | MinIO bucket name | `ecocred` |
| `MINIO_USE_SSL` | Use SSL for MinIO | `false` |
| `AI_SERVICE_URL` | AI service endpoint | `http://localhost:8000` |

### Optional Configuration

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Public URL for the app |
| `VERCEL_URL` | Auto-set by Vercel |
| `NODE_ENV` | Environment (development/production) |

---

## Features In Depth

### 1. Authentication System

- **Email-based registration** with school selection
- **Role-based access control** (student, teacher, admin)
- **Password reset** via OTP
- **Session management** using sessionStorage
- **Multi-tenancy** via college codes derived from email/school

### 2. Task System

- **Four task categories**: planting, waste, energy, water
- **Point values** set by teachers
- **Evidence upload** with AI analysis
- **Status tracking**: pending → approved/rejected
- **Teacher review workflow** with feedback

### 3. Lesson System

- **Teacher-created content** with rich formatting
- **Structured sections** with tips
- **Interactive quizzes** with scoring
- **Progress tracking** per student
- **Points rewards** on completion

### 4. Assessment System

- **AI-generated quizzes** on environmental topics
- **Multiple question types**: MCQ, short answer
- **Timed assessments** with difficulty levels
- **Badge rewards** for completion
- **Detailed analytics** for teachers

### 5. Gamification System

#### Points System
- Task completion: 10-50 points (varies by difficulty)
- Lesson completion: 20-30 points
- Assessment passing: 15-40 points
- Game completion: 10-25 points
- Daily login: 5 points (+ streak bonus)

#### Badge System
| Badge | Requirement |
|-------|-------------|
| First Step | Complete first task |
| Eco Warrior | Earn 100+ points |
| Tree Planter | 3+ planting tasks |
| Waste Warrior | 3+ waste tasks |
| Energy Saver | 3+ energy tasks |
| Water Guardian | 3+ water tasks |
| Streak Master | 7+ day streak |
| Environmental Champion | 500+ points |
| Green Champion | 2+ lessons |

#### Level System
- Level 1: 0-49 points
- Level 2: 50-99 points
- Level 3: 100-199 points
- Level 4: 200-349 points
- Level 5: 350-499 points
- Level 6: 500-699 points
- Level 7: 700-899 points
- Level 8: 900-1099 points
- Level 9: 1100-1299 points
- Level 10: 1300+ points

### 6. Educational Games

- **Water Conservation Game**: Learn water-saving techniques
- **Energy Conservation Game**: Understand energy efficiency
- **Waste Segregation Game**: Practice proper waste sorting
- **Pollution Cleanup Game**: Clean up environmental hazards

Each game includes:
- Multiple difficulty levels
- Score tracking
- Points rewards
- Badge unlocking

### 7. AI Verification System

The AI service analyzes submitted images using:
1. **YOLOv8** for object detection
2. **ResNet50** for image classification
3. **Confidence scoring** (0-100%)
4. **Object labeling** (detected items)
5. **Reasoning generation** (analysis description)

### 8. Calendar & Events

- **Event types**: deadlines, events, holidays, seasonal
- **Recurring events** support
- **School-specific** or global events
- **Reminder display** in dashboard

### 9. Seasonal Events

- **Time-limited campaigns** with special rewards
- **Bonus points** during event periods
- **Exclusive badges** for participants
- **Leaderboard boosts** during events

---

## Gamification System

### Points Earning Chart

| Action | Points | Source |
|--------|--------|--------|
| Complete Planting Task | 25 | Task |
| Complete Waste Task | 20 | Task |
| Complete Energy Task | 15 | Task |
| Complete Water Task | 20 | Task |
| Complete Lesson | 25 | Lesson |
| Pass Assessment | 30 | Assessment |
| Complete Game | 15 | Game |
| Daily Login | 5 (+streak) | Daily |
| Teacher Review (approve) | N/A | Task |

### Badge Progression

```
Level 1: Newcomer (0 points)
    ↓
Level 2: Eco Starter (50 points)
    ↓
Level 3: Green Trainee (100 points)
    ↓
Level 4: Nature Friend (200 points)
    ↓
Level 5: Eco Warrior (350 points)
    ↓
Level 6: Green Champion (500 points)
    ↓
Level 7: Environmental Hero (700 points)
    ↓
Level 8: Climate Champion (900 points)
    ↓
Level 9: Planet Guardian (1100 points)
    ↓
Level 10: Earth Savior (1300 points)
```

### Streak System

- **Daily login** required to maintain streak
- **Streak breaks** if a day is missed
- **Bonus points** for longer streaks:
  - 7+ days: +10 bonus
  - 14+ days: +20 bonus
  - 30+ days: +50 bonus

---

## AI Verification System

### How It Works

1. **Student uploads** evidence photo
2. **Image sent to AI service** for analysis
3. **YOLOv8 detects objects** in image
4. **ResNet50 classifies** the scene
5. **Confidence score generated** (0-100%)
6. **Detected objects listed** in response
7. **Reasoning provided** for transparency

### Analysis Response Format

```json
{
  "success": true,
  "confidence": 95.5,
  "detectedObjects": ["tree", "soil", "plant"],
  "reasoning": "The image shows a healthy young tree with visible soil and proper planting depth. The tree appears to be in an appropriate outdoor setting."
}
```

### Verification Rules

| Confidence | Action |
|-------------|--------|
| 80%+ | Auto-approve (teacher verification still required) |
| 50-79% | Flag for manual review |
| <50% | Reject with feedback |

---

## Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Add environment variables
   - Deploy

3. **MongoDB Atlas Setup**
   - Create free cluster
   - Get connection string
   - Add to Vercel environment

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment-Specific Configurations

| Environment | MongoDB | MinIO | Notes |
|-------------|---------|-------|-------|
| Development | Local | Local | Debug enabled |
| Staging | Atlas (free) | Local | Production-like |
| Production | Atlas (paid) | AWS S3 | Full optimization |

---

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Coding Standards

- Use **TypeScript** for all new code
- Follow **ESLint** rules (enforced on commit)
- Write **tests** for new features
- Update **documentation** for API changes

### Issue Reporting

- Use GitHub Issues for bug reports
- Use feature templates for new features
- Include reproduction steps for bugs

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## Support & Contact

### Documentation
- [API Documentation](API_DOCUMENTATION.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)

### Community
- **Discord**: [Join our community](https://discord.gg/ecocred)
- **Twitter**: [@EcoCredOfficial](https://twitter.com/EcoCredOfficial)

### Support
- **Email**: support@ecocred.org
- **FAQ**: Visit our [FAQ page](https://ecocred.org/faq)

---

## Acknowledgments

- [Next.js](https://nextjs.org) - React framework
- [MongoDB](https://www.mongodb.com) - Database
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Shadcn UI](https://ui.shadcn.com) - UI components
- [YOLOv8](https://github.com/ultralytics/ultralytics) - Object detection
- [Lucide](https://lucide.dev) - Icons

---

<p align="center">
  <strong>Built with 💚 for the Environment</strong>
</p>

<p align="center">
  © 2025 EcoCred. All rights reserved.
</p>