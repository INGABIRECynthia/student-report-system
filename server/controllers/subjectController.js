const pool = require('../config/db');

// ── Classes ──────────────────────────────────────
const getAllClasses = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM classes ORDER BY name');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

const createClass = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Class name is required' });
    const [result] = await pool.query(
      'INSERT INTO classes (name, description) VALUES (?, ?)',
      [name, description || null]
    );
    res.status(201).json({ id: result.insertId, name, description });
  } catch (err) {
    next(err);
  }
};

const deleteClass = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM classes WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Class not found' });
    res.json({ message: 'Class deleted' });
  } catch (err) {
    next(err);
  }
};

// ── Subjects ──────────────────────────────────────
const getAllSubjects = async (req, res, next) => {
  try {
    const { class_id } = req.query;
    let sql = `SELECT sub.*, c.name AS class_name, u.name AS teacher_name
               FROM subjects sub
               JOIN classes c ON sub.class_id = c.id
               LEFT JOIN users u ON sub.teacher_id = u.id
               WHERE 1=1`;
    const params = [];
    if (class_id) {
      sql += ' AND sub.class_id = ?';
      params.push(class_id);
    }
    sql += ' ORDER BY c.name, sub.name';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

const createSubject = async (req, res, next) => {
  try {
    const { name, code, class_id, teacher_id } = req.body;
    if (!name || !class_id) {
      return res.status(400).json({ message: 'Name and class_id are required' });
    }
    const [result] = await pool.query(
      'INSERT INTO subjects (name, code, class_id, teacher_id) VALUES (?, ?, ?, ?)',
      [name, code || null, class_id, teacher_id || null]
    );
    res.status(201).json({ id: result.insertId, name, code, class_id, teacher_id });
  } catch (err) {
    next(err);
  }
};

const updateSubject = async (req, res, next) => {
  try {
    const { name, code, class_id, teacher_id } = req.body;
    const [result] = await pool.query(
      'UPDATE subjects SET name=?, code=?, class_id=?, teacher_id=? WHERE id=?',
      [name, code || null, class_id, teacher_id || null, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Subject not found' });
    res.json({ id: req.params.id, name, code, class_id, teacher_id });
  } catch (err) {
    next(err);
  }
};

const deleteSubject = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM subjects WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Subject not found' });
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllClasses, createClass, deleteClass,
  getAllSubjects, createSubject, updateSubject, deleteSubject,
};
