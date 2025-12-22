import pool from '../config/database.js';

export const getAllChuongTrinh = async (req, res) => {
  try {
    const query = `
      SELECT ct.*, k.ten_khoa 
      FROM chuong_trinh ct
      LEFT JOIN khoa k ON ct.khoa_id = k.id
      ORDER BY ct.ma_chuong_trinh
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getChuongTrinhById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT ct.*, k.ten_khoa 
      FROM chuong_trinh ct
      LEFT JOIN khoa k ON ct.khoa_id = k.id
      WHERE ct.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy chương trình' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createChuongTrinh = async (req, res) => {
  try {
    const { ma_chuong_trinh, ten_chuong_trinh, khoa_id, mo_ta } = req.body;
    const result = await pool.query(
      'INSERT INTO chuong_trinh (ma_chuong_trinh, ten_chuong_trinh, khoa_id, mo_ta) VALUES ($1, $2, $3, $4) RETURNING *',
      [ma_chuong_trinh, ten_chuong_trinh, khoa_id, mo_ta]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Mã chương trình đã tồn tại' });
    }
    if (error.code === '23503') {
      return res.status(400).json({ message: 'Khoa không tồn tại' });
    }
    res.status(500).json({ message: error.message });
  }
};

export const updateChuongTrinh = async (req, res) => {
  try {
    const { id } = req.params;
    const { ma_chuong_trinh, ten_chuong_trinh, khoa_id, mo_ta } = req.body;
    const result = await pool.query(
      'UPDATE chuong_trinh SET ma_chuong_trinh = $1, ten_chuong_trinh = $2, khoa_id = $3, mo_ta = $4 WHERE id = $5 RETURNING *',
      [ma_chuong_trinh, ten_chuong_trinh, khoa_id, mo_ta, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy chương trình' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Mã chương trình đã tồn tại' });
    }
    res.status(500).json({ message: error.message });
  }
};

export const deleteChuongTrinh = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM chuong_trinh WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy chương trình' });
    }
    res.json({ message: 'Xóa chương trình thành công' });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({ message: 'Không thể xóa chương trình vì còn dữ liệu liên quan' });
    }
    res.status(500).json({ message: error.message });
  }
};

