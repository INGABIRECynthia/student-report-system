-- Student Reports Management System - Database Schema
-- MySQL

CREATE DATABASE IF NOT EXISTS student_report_system;
USE student_report_system;

-- ─────────────────────────────────────────────
-- Table: users
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120)  NOT NULL,
  email       VARCHAR(191)  NOT NULL,
  password    VARCHAR(255)  NOT NULL,
  role        ENUM('admin','teacher','student') NOT NULL DEFAULT 'teacher',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────
-- Table: classes
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS classes (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(80) NOT NULL,
  description VARCHAR(255),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_classes_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────
-- Table: students
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  gender        ENUM('male','female','other') NOT NULL,
  date_of_birth DATE NOT NULL,
  class_id      INT UNSIGNED NOT NULL,
  user_id       INT UNSIGNED,          -- optional link to a user account
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_students_class  (class_id),
  INDEX idx_students_user   (user_id),
  FOREIGN KEY (class_id) REFERENCES classes (id) ON DELETE RESTRICT,
  FOREIGN KEY (user_id)  REFERENCES users   (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────
-- Table: subjects
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subjects (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  code        VARCHAR(20),
  class_id    INT UNSIGNED NOT NULL,
  teacher_id  INT UNSIGNED,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_subjects_class   (class_id),
  INDEX idx_subjects_teacher (teacher_id),
  UNIQUE KEY uq_subject_class (name, class_id),
  FOREIGN KEY (class_id)   REFERENCES classes (id) ON DELETE RESTRICT,
  FOREIGN KEY (teacher_id) REFERENCES users   (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────
-- Table: terms
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS terms (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(60)  NOT NULL,   -- e.g. "Term 1 2024"
  year        YEAR         NOT NULL,
  term_number TINYINT      NOT NULL,   -- 1, 2, 3
  is_active   BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_term (year, term_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────
-- Table: marks
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS marks (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id  INT UNSIGNED NOT NULL,
  subject_id  INT UNSIGNED NOT NULL,
  term_id     INT UNSIGNED NOT NULL,
  score       DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  entered_by  INT UNSIGNED,            -- teacher user id
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_marks_student (student_id),
  INDEX idx_marks_subject (subject_id),
  INDEX idx_marks_term    (term_id),
  UNIQUE KEY uq_mark (student_id, subject_id, term_id),
  FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE,
  FOREIGN KEY (term_id)    REFERENCES terms    (id) ON DELETE CASCADE,
  FOREIGN KEY (entered_by) REFERENCES users    (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────
-- Seed data
-- ─────────────────────────────────────────────

-- Admin user  (password: Admin@123)
INSERT INTO users (name, email, password, role) VALUES
('Admin User',   'admin@school.com',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'admin'),
('Jane Teacher', 'teacher@school.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'teacher');

-- Classes
INSERT INTO classes (name, description) VALUES
('Form 1', 'First year secondary'),
('Form 2', 'Second year secondary'),
('Form 3', 'Third year secondary');

-- Students
INSERT INTO students (name, gender, date_of_birth, class_id) VALUES
('Alice Mutoni',  'female', '2010-03-15', 1),
('Bob Nkurunziza','male',   '2010-07-22', 1),
('Carol Uwase',   'female', '2009-11-08', 2),
('David Habimana','male',   '2009-05-30', 2),
('Eve Ingabire',  'female', '2008-09-14', 3);

-- Subjects
INSERT INTO subjects (name, code, class_id, teacher_id) VALUES
('Mathematics',  'MATH', 1, 2),
('English',      'ENG',  1, 2),
('Science',      'SCI',  1, 2),
('Mathematics',  'MATH', 2, 2),
('English',      'ENG',  2, 2),
('History',      'HIST', 2, 2),
('Mathematics',  'MATH', 3, 2),
('Chemistry',    'CHEM', 3, 2);

-- Terms
INSERT INTO terms (name, year, term_number, is_active) VALUES
('Term 1 2024', 2024, 1, FALSE),
('Term 2 2024', 2024, 2, FALSE),
('Term 1 2025', 2025, 1, TRUE);

-- Sample marks (Term 1 2024, Form 1)
INSERT INTO marks (student_id, subject_id, term_id, score, entered_by) VALUES
(1, 1, 1, 85.00, 2),
(1, 2, 1, 78.00, 2),
(1, 3, 1, 92.00, 2),
(2, 1, 1, 65.00, 2),
(2, 2, 1, 70.00, 2),
(2, 3, 1, 55.00, 2);
