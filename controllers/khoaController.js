import pool from '../config/database.js';

export const getAllKhoa = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM khoa ORDER BY ma_khoa');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getKhoaById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM khoa WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy khoa' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createKhoa = async (req, res) => {
  try {
    const { ma_khoa, ten_khoa, mo_ta } = req.body;
    const result = await pool.query(
      'INSERT INTO khoa (ma_khoa, ten_khoa, mo_ta) VALUES ($1, $2, $3) RETURNING *',
      [ma_khoa, ten_khoa, mo_ta]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Mã khoa đã tồn tại' });
    }
    res.status(500).json({ message: error.message });
  }
};

export const updateKhoa = async (req, res) => {
  try {
    const { id } = req.params;
    const { ma_khoa, ten_khoa, mo_ta } = req.body;
    const result = await pool.query(
      'UPDATE khoa SET ma_khoa = $1, ten_khoa = $2, mo_ta = $3 WHERE id = $4 RETURNING *',
      [ma_khoa, ten_khoa, mo_ta, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy khoa' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Mã khoa đã tồn tại' });
    }
    res.status(500).json({ message: error.message });
  }
};

export const deleteKhoa = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM khoa WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy khoa' });
    }
    res.json({ message: 'Xóa khoa thành công' });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({ message: 'Không thể xóa khoa vì còn dữ liệu liên quan' });
    }
    res.status(500).json({ message: error.message });
  }
};

