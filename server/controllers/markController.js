const pool = require('../config/db');

// Helper – compute grade
const getGrade = (score) => {
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
};

const getAll = async (req, res, next) => {
  try {
    const { student_id, subject_id, term_id, class_id } = req.query;
    let sql = `SELECT m.*, s.name AS student_name, sub.name AS subject_name,
                      t.name AS term_name, c.name AS class_name, u.name AS teacher_name
               FROM marks m
               JOIN students s   ON m.student_id  = s.id
               JOIN subjects sub ON m.subject_id  = sub.id
               JOIN terms t      ON m.term_id     = t.id
               JOIN classes c    ON s.class_id    = c.id
               LEFT JOIN users u ON m.entered_by  = u.id
               WHERE 1=1`;
    const params = [];

    if (student_id) { sql += ' AND m.student_id = ?';  params.push(student_id); }
    if (subject_id) { sql += ' AND m.subject_id = ?';  params.push(subject_id); }
    if (term_id)    { sql += ' AND m.term_id = ?';     params.push(term_id); }
    if (class_id)   { sql += ' AND s.class_id = ?';    params.push(class_id); }

    sql += ' ORDER BY s.name, sub.name';
    const [rows] = await pool.query(sql, params);
    res.json(rows.map(r => ({ ...r, grade: getGrade(r.score) })));
  } catch (err) {
    next(err);
  }
};

const upsert = async (req, res, next) => {
  try {
    const { student_id, subject_id, term_id, score } = req.body;
    if (!student_id || !subject_id || !term_id || score === undefined) {
      return res.status(400).json({ message: 'student_id, subject_id, term_id, score are required' });
    }
    if (score < 0 || score > 100) {
      return res.status(400).json({ message: 'Score must be between 0 and 100' });
    }

    const entered_by = req.user.id;

    await pool.query(
      `INSERT INTO marks (student_id, subject_id, term_id, score, entered_by)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE score = VALUES(score), entered_by = VALUES(entered_by)`,
      [student_id, subject_id, term_id, score, entered_by]
    );

    // Fetch the saved row
    const [rows] = await pool.query(
      `SELECT m.*, s.name AS student_name, sub.name AS subject_name, t.name AS term_name
       FROM marks m
       JOIN students s   ON m.student_id = s.id
       JOIN subjects sub ON m.subject_id = sub.id
       JOIN terms t      ON m.term_id    = t.id
       WHERE m.student_id=? AND m.subject_id=? AND m.term_id=?`,
      [student_id, subject_id, term_id]
    );
    const mark = { ...rows[0], grade: getGrade(rows[0].score) };

    // Emit Socket.IO event
    const io = req.app.get('io');
    if (io) io.emit('marksUpdated', mark);

    res.status(201).json(mark);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM marks WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Mark not found' });
    res.json({ message: 'Mark deleted' });
  } catch (err) {
    next(err);
  }
};

// ── Terms ─────────────────────────────────────────
const getTerms = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM terms ORDER BY year DESC, term_number');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

const createTerm = async (req, res, next) => {
  try {
    const { name, year, term_number, is_active } = req.body;
    if (!name || !year || !term_number) {
      return res.status(400).json({ message: 'name, year, term_number are required' });
    }
    const [result] = await pool.query(
      'INSERT INTO terms (name, year, term_number, is_active) VALUES (?, ?, ?, ?)',
      [name, year, term_number, is_active ? 1 : 0]
    );
    res.status(201).json({ id: result.insertId, name, year, term_number, is_active: !!is_active });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, upsert, remove, getTerms, createTerm, getGrade };
