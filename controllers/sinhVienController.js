import pool from '../config/database.js';

export const getAllSinhVien = async (req, res) => {
  try {
    const query = `
      SELECT sv.*, l.ma_lop, l.ten_lop, ct.ma_chuong_trinh, ct.ten_chuong_trinh
      FROM sinh_vien sv
      LEFT JOIN lop l ON sv.lop_id = l.id
      LEFT JOIN chuong_trinh ct ON sv.chuong_trinh_id = ct.id
      ORDER BY sv.ma_sinh_vien
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSinhVienById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT sv.*, l.ma_lop, l.ten_lop, ct.ma_chuong_trinh, ct.ten_chuong_trinh
      FROM sinh_vien sv
      LEFT JOIN lop l ON sv.lop_id = l.id
      LEFT JOIN chuong_trinh ct ON sv.chuong_trinh_id = ct.id
      WHERE sv.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSinhVienByMaSV = async (req, res) => {
  try {
    const { maSV } = req.query;
    const query = `
      SELECT sv.*, l.ma_lop, l.ten_lop, ct.ma_chuong_trinh, ct.ten_chuong_trinh
      FROM sinh_vien sv
      LEFT JOIN lop l ON sv.lop_id = l.id
      LEFT JOIN chuong_trinh ct ON sv.chuong_trinh_id = ct.id
      WHERE sv.ma_sinh_vien = $1
    `;
    const result = await pool.query(query, [maSV]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSinhVien = async (req, res) => {
  try {
    const {
      ma_sinh_vien,
      ho_ten,
      email,
      so_dien_thoai,
      lop_id,
      chuong_trinh_id,
      ngay_sinh,
      gioi_tinh,
      dia_chi,
    } = req.body;
    const result = await pool.query(
      `INSERT INTO sinh_vien (ma_sinh_vien, ho_ten, email, so_dien_thoai, lop_id, chuong_trinh_id, ngay_sinh, gioi_tinh, dia_chi) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [ma_sinh_vien, ho_ten, email, so_dien_thoai, lop_id, chuong_trinh_id, ngay_sinh, gioi_tinh, dia_chi]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Mã sinh viên đã tồn tại' });
    }
    res.status(500).json({ message: error.message });
  }
};

export const updateSinhVien = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      ma_sinh_vien,
      ho_ten,
      email,
      so_dien_thoai,
      lop_id,
      chuong_trinh_id,
      ngay_sinh,
      gioi_tinh,
      dia_chi,
    } = req.body;
    const result = await pool.query(
      `UPDATE sinh_vien SET ma_sinh_vien = $1, ho_ten = $2, email = $3, so_dien_thoai = $4, 
       lop_id = $5, chuong_trinh_id = $6, ngay_sinh = $7, gioi_tinh = $8, dia_chi = $9 
       WHERE id = $10 RETURNING *`,
      [ma_sinh_vien, ho_ten, email, so_dien_thoai, lop_id, chuong_trinh_id, ngay_sinh, gioi_tinh, dia_chi, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Mã sinh viên đã tồn tại' });
    }
    res.status(500).json({ message: error.message });
  }
};

export const deleteSinhVien = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM sinh_vien WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
    }
    res.json({ message: 'Xóa sinh viên thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

