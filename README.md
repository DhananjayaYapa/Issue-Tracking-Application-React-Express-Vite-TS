# Issue Tracker Backend API

A RESTful API for Issue Tracker application built with **Express.js** following MVC architecture.

## 🏗️ Architecture

This project follows the **MVC (Model-View-Controller)** pattern.:

```
issue-tracker-backend/
├── src/
│   ├── config/
│   │   └── database.js           # PostgreSQL connection pool
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication
│   │   ├── validation.js         # Request validation (express-validator)
│   │   └── errorHandler.js       # Centralized error handling
│   ├── modules/
│   │   ├── auth/                 # Authentication module
│   │   │   ├── authController.js # Business logic
│   │   │   ├── authModel.js      # Database queries
│   │   │   └── authRoutes.js     # API endpoints
│   │   └── issues/               # Issues module
│   │       ├── issueController.js
│   │       ├── issueModel.js
│   │       └── issueRoutes.js
│   ├── routes/
│   │   └── index.js              # Route aggregator
│   ├── shared/
│   │   ├── constants/
│   │   │   └── issueConstants.js # Status, Priority enums
│   │   └── utils/
│   │       ├── responseHelper.js # Standardized responses
│   │       └── exportHelper.js   # CSV/JSON export
│   └── server.js                 # Main entry point
├── db/
│   └── schema.sql                # Database schema
├── .env.example                  # Environment template
├── .env                          # Environment config (create from example)
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone and navigate:**
   ```bash
   cd issue-tracker-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Set up database:**
   ```bash
   # Create database first (in psql)
   createdb issue_tracker_db
   
   # Run schema
   psql -d issue_tracker_db -f db/schema.sql
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

The server will start at `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```