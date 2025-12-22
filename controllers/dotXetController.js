import pool from '../config/database.js';

export const getAllDotXet = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM dot_xet ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDotXetById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM dot_xet WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đợt xét' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDotXet = async (req, res) => {
  try {
    const { ten_dot, nam_hoc, hoc_ky, ngay_bat_dau, ngay_ket_thuc, trang_thai, mo_ta } = req.body;
    const result = await pool.query(
      'INSERT INTO dot_xet (ten_dot, nam_hoc, hoc_ky, ngay_bat_dau, ngay_ket_thuc, trang_thai, mo_ta) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [ten_dot, nam_hoc, hoc_ky, ngay_bat_dau, ngay_ket_thuc, trang_thai || 'draft', mo_ta]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDotXet = async (req, res) => {
  try {
    const { id } = req.params;
    const { ten_dot, nam_hoc, hoc_ky, ngay_bat_dau, ngay_ket_thuc, trang_thai, mo_ta } = req.body;
    const result = await pool.query(
      'UPDATE dot_xet SET ten_dot = $1, nam_hoc = $2, hoc_ky = $3, ngay_bat_dau = $4, ngay_ket_thuc = $5, trang_thai = $6, mo_ta = $7 WHERE id = $8 RETURNING *',
      [ten_dot, nam_hoc, hoc_ky, ngay_bat_dau, ngay_ket_thuc, trang_thai, mo_ta, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đợt xét' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDotXet = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM dot_xet WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đợt xét' });
    }
    res.json({ message: 'Xóa đợt xét thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

