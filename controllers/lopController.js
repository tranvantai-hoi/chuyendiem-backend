import pool from '../config/database.js';

export const getAllLop = async (req, res) => {
  try {
    const query = `
      SELECT l.*, ct.ma_chuong_trinh, ct.ten_chuong_trinh, k.ma_khoa, k.ten_khoa
      FROM lop l
      LEFT JOIN chuong_trinh ct ON l.chuong_trinh_id = ct.id
      LEFT JOIN khoa k ON l.khoa_id = k.id
      ORDER BY l.ma_lop
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLopById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT l.*, ct.ma_chuong_trinh, ct.ten_chuong_trinh, k.ma_khoa, k.ten_khoa
      FROM lop l
      LEFT JOIN chuong_trinh ct ON l.chuong_trinh_id = ct.id
      LEFT JOIN khoa k ON l.khoa_id = k.id
      WHERE l.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy lớp' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createLop = async (req, res) => {
  try {
    const { ma_lop, ten_lop, chuong_trinh_id, khoa_id, khoa_hoc } = req.body;
    const result = await pool.query(
      'INSERT INTO lop (ma_lop, ten_lop, chuong_trinh_id, khoa_id, khoa_hoc) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [ma_lop, ten_lop, chuong_trinh_id, khoa_id, khoa_hoc]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Mã lớp đã tồn tại' });
    }
    if (error.code === '23503') {
      return res.status(400).json({ message: 'Chương trình hoặc khoa không tồn tại' });
    }
    res.status(500).json({ message: error.message });
  }
};

export const updateLop = async (req, res) => {
  try {
    const { id } = req.params;
    const { ma_lop, ten_lop, chuong_trinh_id, khoa_id, khoa_hoc } = req.body;
    const result = await pool.query(
      'UPDATE lop SET ma_lop = $1, ten_lop = $2, chuong_trinh_id = $3, khoa_id = $4, khoa_hoc = $5 WHERE id = $6 RETURNING *',
      [ma_lop, ten_lop, chuong_trinh_id, khoa_id, khoa_hoc, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy lớp' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Mã lớp đã tồn tại' });
    }
    res.status(500).json({ message: error.message });
  }
};

export const deleteLop = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM lop WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy lớp' });
    }
    res.json({ message: 'Xóa lớp thành công' });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({ message: 'Không thể xóa lớp vì còn sinh viên' });
    }
    res.status(500).json({ message: error.message });
  }
};

