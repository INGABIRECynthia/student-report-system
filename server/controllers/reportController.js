const pool = require('../config/db');
const { getGrade } = require('./markController');

// GET /reports/student/:studentId?term_id=...
const getStudentReport = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { term_id } = req.query;

    // Student info
    const [students] = await pool.query(
      `SELECT s.*, c.name AS class_name FROM students s JOIN classes c ON s.class_id = c.id WHERE s.id = ?`,
      [studentId]
    );
    if (!students.length) return res.status(404).json({ message: 'Student not found' });
    const student = students[0];

    // Build marks query
    let sql = `SELECT m.score, sub.name AS subject_name, sub.code, t.name AS term_name, t.id AS term_id
               FROM marks m
               JOIN subjects sub ON m.subject_id = sub.id
               JOIN terms t ON m.term_id = t.id
               WHERE m.student_id = ?`;
    const params = [studentId];
    if (term_id) {
      sql += ' AND m.term_id = ?';
      params.push(term_id);
    }
    sql += ' ORDER BY t.year, t.term_number, sub.name';

    const [marks] = await pool.query(sql, params);

    const subjects = marks.map(m => ({
      subject: m.subject_name,
      code: m.code,
      score: parseFloat(m.score),
      grade: getGrade(m.score),
      term: m.term_name,
      term_id: m.term_id,
    }));

    const total = subjects.reduce((s, m) => s + m.score, 0);
    const average = subjects.length ? parseFloat((total / subjects.length).toFixed(2)) : 0;
    const overallGrade = getGrade(average);

    const report = {
      student,
      subjects,
      total: parseFloat(total.toFixed(2)),
      average,
      overallGrade,
      subjectCount: subjects.length,
    };

    // Emit socket event
    const io = req.app.get('io');
    if (io) io.emit('newReportGenerated', { studentId, studentName: student.name });

    res.json(report);
  } catch (err) {
    next(err);
  }
};

// GET /reports/class/:classId?term_id=...
const getClassReport = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { term_id } = req.query;

    let sql = `SELECT s.id AS student_id, s.name AS student_name,
                      AVG(m.score) AS average, SUM(m.score) AS total,
                      COUNT(m.id) AS subject_count
               FROM students s
               LEFT JOIN marks m ON m.student_id = s.id
               WHERE s.class_id = ?`;
    const params = [classId];
    if (term_id) {
      sql += ' AND m.term_id = ?';
      params.push(term_id);
    }
    sql += ' GROUP BY s.id ORDER BY average DESC';

    const [rows] = await pool.query(sql, params);
    const report = rows.map(r => ({
      ...r,
      average: r.average ? parseFloat(parseFloat(r.average).toFixed(2)) : 0,
      total: r.total ? parseFloat(parseFloat(r.total).toFixed(2)) : 0,
      grade: getGrade(r.average || 0),
    }));

    res.json(report);
  } catch (err) {
    next(err);
  }
};

// GET /reports/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const [[{ totalStudents }]] = await pool.query('SELECT COUNT(*) AS totalStudents FROM students');
    const [[{ totalTeachers }]] = await pool.query('SELECT COUNT(*) AS totalTeachers FROM users WHERE role = "teacher"');
    const [[{ totalSubjects }]] = await pool.query('SELECT COUNT(*) AS totalSubjects FROM subjects');
    const [[{ avgScore }]] = await pool.query('SELECT AVG(score) AS avgScore FROM marks');

    // Top 5 students by average
    const [topStudents] = await pool.query(
      `SELECT s.id, s.name, c.name AS class_name, AVG(m.score) AS average
       FROM students s
       JOIN classes c ON s.class_id = c.id
       LEFT JOIN marks m ON m.student_id = s.id
       GROUP BY s.id
       ORDER BY average DESC
       LIMIT 5`
    );

    // Recent marks
    const [recentMarks] = await pool.query(
      `SELECT m.*, s.name AS student_name, sub.name AS subject_name, t.name AS term_name
       FROM marks m
       JOIN students s ON m.student_id = s.id
       JOIN subjects sub ON m.subject_id = sub.id
       JOIN terms t ON m.term_id = t.id
       ORDER BY m.updated_at DESC
       LIMIT 10`
    );

    // Performance by class
    const [classSummary] = await pool.query(
      `SELECT c.name AS class_name, AVG(m.score) AS average, COUNT(DISTINCT s.id) AS student_count
       FROM classes c
       JOIN students s ON s.class_id = c.id
       LEFT JOIN marks m ON m.student_id = s.id
       GROUP BY c.id
       ORDER BY c.name`
    );

    res.json({
      stats: {
        totalStudents,
        totalTeachers,
        totalSubjects,
        avgScore: avgScore ? parseFloat(parseFloat(avgScore).toFixed(2)) : 0,
      },
      topStudents: topStudents.map(s => ({
        ...s,
        average: s.average ? parseFloat(parseFloat(s.average).toFixed(2)) : 0,
        grade: getGrade(s.average || 0),
      })),
      recentMarks: recentMarks.map(m => ({ ...m, grade: getGrade(m.score) })),
      classSummary: classSummary.map(c => ({
        ...c,
        average: c.average ? parseFloat(parseFloat(c.average).toFixed(2)) : 0,
      })),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStudentReport, getClassReport, getDashboard };
