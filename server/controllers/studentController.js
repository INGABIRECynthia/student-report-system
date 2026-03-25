const pool = require('../config/db');

const getAll = async (req, res, next) => {
  try {
    const { class_id, search } = req.query;
    let sql = `SELECT s.*, c.name AS class_name
               FROM students s
               JOIN classes c ON s.class_id = c.id
               WHERE 1=1`;
    const params = [];

    if (class_id) {
      sql += ' AND s.class_id = ?';
      params.push(class_id);
    }
    if (search) {
      sql += ' AND s.name LIKE ?';
      params.push(`%${search}%`);
    }
    sql += ' ORDER BY s.name';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, c.name AS class_name
       FROM students s
       JOIN classes c ON s.class_id = c.id
       WHERE s.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Student not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, gender, date_of_birth, class_id } = req.body;
    if (!name || !gender || !date_of_birth || !class_id) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO students (name, gender, date_of_birth, class_id) VALUES (?, ?, ?, ?)',
      [name, gender, date_of_birth, class_id]
    );

    const [rows] = await pool.query(
      `SELECT s.*, c.name AS class_name FROM students s JOIN classes c ON s.class_id = c.id WHERE s.id = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { name, gender, date_of_birth, class_id } = req.body;
    await pool.query(
      'UPDATE students SET name=?, gender=?, date_of_birth=?, class_id=? WHERE id=?',
      [name, gender, date_of_birth, class_id, req.params.id]
    );

    const [rows] = await pool.query(
      `SELECT s.*, c.name AS class_name FROM students s JOIN classes c ON s.class_id = c.id WHERE s.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Student not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM students WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove };
