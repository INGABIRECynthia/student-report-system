# 🎓 Student Reports Management System

A production-ready full-stack web application for managing student academic records and generating report cards.

**Tech Stack:** React · Node.js/Express · MySQL · Socket.IO · Tailwind CSS

---

## 📦 Project Structure

```
student-report-system/
├── client/          # React frontend (Tailwind CSS + Recharts + Socket.IO)
├── server/          # Express backend (JWT auth, MVC, Socket.IO)
└── database/        # MySQL schema + seed data
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8+
- npm or yarn

### 1. Database Setup

```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend Setup

```bash
cd server
cp .env.example .env
# Edit .env with your database credentials and JWT secret
npm install
npm run dev   # or npm start for production
```

The API server starts on **http://localhost:5000**

### 3. Frontend Setup

```bash
cd client
# Optional: set REACT_APP_API_URL in .env if backend is not on localhost:5000
npm install
npm start
```

The React app opens on **http://localhost:3000**

---

## 🔑 Default Credentials

| Role    | Email                  | Password   |
|---------|------------------------|------------|
| Admin   | admin@school.com       | password   |
| Teacher | teacher@school.com     | password   |

> **Note:** The seed passwords in `schema.sql` use bcrypt hash for `"password"`. Update them in production.

---

## 🌐 API Reference

### Authentication

| Method | Endpoint           | Auth | Description         |
|--------|--------------------|------|---------------------|
| POST   | /api/auth/login    | ❌   | Login               |
| POST   | /api/auth/register | Admin | Register user      |
| GET    | /api/auth/me       | ✅   | Get current user    |

### Students

| Method | Endpoint           | Auth     | Description         |
|--------|--------------------|----------|---------------------|
| GET    | /api/students      | ✅       | List all students   |
| GET    | /api/students/:id  | ✅       | Get student         |
| POST   | /api/students      | Admin/Teacher | Add student  |
| PUT    | /api/students/:id  | Admin/Teacher | Update student|
| DELETE | /api/students/:id  | Admin    | Delete student      |

### Subjects & Classes

| Method | Endpoint                | Auth  | Description       |
|--------|-------------------------|-------|-------------------|
| GET    | /api/subjects           | ✅    | List subjects     |
| POST   | /api/subjects           | Admin/Teacher | Add subject |
| PUT    | /api/subjects/:id       | Admin/Teacher | Update    |
| DELETE | /api/subjects/:id       | Admin | Delete subject    |
| GET    | /api/subjects/classes   | ✅    | List classes      |
| POST   | /api/subjects/classes   | Admin | Add class         |

### Marks

| Method | Endpoint        | Auth         | Description          |
|--------|-----------------|--------------|----------------------|
| GET    | /api/marks      | ✅           | List marks (filtered)|
| POST   | /api/marks      | Admin/Teacher | Upsert mark         |
| DELETE | /api/marks/:id  | Admin        | Delete mark          |
| GET    | /api/marks/terms| ✅           | List terms           |
| POST   | /api/marks/terms| Admin        | Create term          |

### Reports

| Method | Endpoint                    | Auth | Description            |
|--------|-----------------------------|------|------------------------|
| GET    | /api/reports/dashboard      | ✅   | Dashboard stats        |
| GET    | /api/reports/student/:id    | ✅   | Student report card    |
| GET    | /api/reports/class/:classId | ✅   | Class performance      |

Query params: `?term_id=1` (optional filter by term)

---

## 📡 Socket.IO Events

| Event               | Direction      | Payload                                   |
|---------------------|----------------|-------------------------------------------|
| `marksUpdated`      | Server → Client| Mark object with student/subject info     |
| `newReportGenerated`| Server → Client| `{ studentId, studentName }`              |

Events are emitted automatically when marks are saved or a report is generated via the API.

---

## 🧠 Grade System

| Score Range | Grade |
|-------------|-------|
| 80 – 100    | A     |
| 70 – 79     | B     |
| 60 – 69     | C     |
| 50 – 59     | D     |
| Below 50    | F     |

Average = Total marks ÷ Number of subjects

---

## 🗄️ Database Schema

Tables: `users`, `classes`, `students`, `subjects`, `terms`, `marks`

See [`database/schema.sql`](database/schema.sql) for the full schema with indexes and foreign keys.

---

## 🎨 UI Features

- **Dashboard** – stat cards, performance charts (bar/radar), top students, recent marks
- **Students** – searchable/filterable table with add/edit/delete modals
- **Subjects** – manage subjects and classes per term
- **Marks Entry** – inline form with student/subject/term selectors; live marks table
- **Reports** – student report card (with radar chart) and class ranking table
- **Real-time** – toast notifications when marks are updated or reports generated
- **Responsive** – collapsible sidebar on mobile, scrollable tables

---

## 🔧 Environment Variables

### Server (`server/.env`)
```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=student_report_system
JWT_SECRET=your_super_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

### Client (`client/.env` – optional)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## 🧪 Example API Request/Response

### Login
```http
POST /api/auth/login
Content-Type: application/json

{ "email": "admin@school.com", "password": "password" }
```
```json
{
  "token": "eyJhbGci...",
  "user": { "id": 1, "name": "Admin User", "email": "admin@school.com", "role": "admin" }
}
```

### Enter a Mark
```http
POST /api/marks
Authorization: Bearer <token>
Content-Type: application/json

{ "student_id": 1, "subject_id": 1, "term_id": 3, "score": 88 }
```
```json
{
  "id": 7,
  "student_name": "Alice Mutoni",
  "subject_name": "Mathematics",
  "term_name": "Term 1 2025",
  "score": "88.00",
  "grade": "A"
}
```

### Get Student Report
```http
GET /api/reports/student/1?term_id=1
Authorization: Bearer <token>
```
```json
{
  "student": { "id": 1, "name": "Alice Mutoni", "class_name": "Form 1", ... },
  "subjects": [
    { "subject": "English", "score": 78, "grade": "B" },
    { "subject": "Mathematics", "score": 85, "grade": "A" },
    { "subject": "Science", "score": 92, "grade": "A" }
  ],
  "total": 255,
  "average": 85,
  "overallGrade": "A",
  "subjectCount": 3
}
```
