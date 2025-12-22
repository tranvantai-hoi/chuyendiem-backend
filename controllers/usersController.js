import pool from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const getAllUsers = async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.username, u.ho_ten, u.email, u.vai_tro, u.is_active, u.created_at, k.ten_khoa
      FROM users u
      LEFT JOIN khoa k ON u.khoa_id = k.id
      ORDER BY u.created_at DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT u.id, u.username, u.ho_ten, u.email, u.vai_tro, u.is_active, u.created_at, k.ten_khoa
      FROM users u
      LEFT JOIN khoa k ON u.khoa_id = k.id
      WHERE u.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { username, password, ho_ten, email, vai_tro, khoa_id } = req.body;
    
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (username, password_hash, ho_ten, email, vai_tro, khoa_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, ho_ten, email, vai_tro',
      [username, password_hash, ho_ten, email, vai_tro || 'user', khoa_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Username đã tồn tại' });
    }
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, ho_ten, email, vai_tro, khoa_id, is_active } = req.body;
    
    let query, params;
    if (password) {
      const password_hash = await bcrypt.hash(password, 10);
      query = 'UPDATE users SET username = $1, password_hash = $2, ho_ten = $3, email = $4, vai_tro = $5, khoa_id = $6, is_active = $7 WHERE id = $8 RETURNING id, username, ho_ten, email, vai_tro';
      params = [username, password_hash, ho_ten, email, vai_tro, khoa_id, is_active, id];
    } else {
      query = 'UPDATE users SET username = $1, ho_ten = $2, email = $3, vai_tro = $4, khoa_id = $5, is_active = $6 WHERE id = $7 RETURNING id, username, ho_ten, email, vai_tro';
      params = [username, ho_ten, email, vai_tro, khoa_id, is_active, id];
    }
    
    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Username đã tồn tại' });
    }
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }
    res.json({ message: 'Xóa user thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const result = await pool.query('SELECT * FROM users WHERE username = $1 AND is_active = true', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Username hoặc password không đúng' });
    }
    
    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      return res.status(401).json({ message: 'Username hoặc password không đúng' });
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, vai_tro: user.vai_tro },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        ho_ten: user.ho_ten,
        email: user.email,
        vai_tro: user.vai_tro,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

