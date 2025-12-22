import pool from '../config/database.js';

export const getAllHocPhan = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hoc_phan ORDER BY ma_hoc_phan');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHocPhanById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM hoc_phan WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy học phần' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createHocPhan = async (req, res) => {
  try {
    const { ma_hoc_phan, ten_hoc_phan, so_tin_chi, mo_ta } = req.body;
    const result = await pool.query(
      'INSERT INTO hoc_phan (ma_hoc_phan, ten_hoc_phan, so_tin_chi, mo_ta) VALUES ($1, $2, $3, $4) RETURNING *',
      [ma_hoc_phan, ten_hoc_phan, so_tin_chi, mo_ta]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Mã học phần đã tồn tại' });
    }
    res.status(500).json({ message: error.message });
  }
};

export const updateHocPhan = async (req, res) => {
  try {
    const { id } = req.params;
    const { ma_hoc_phan, ten_hoc_phan, so_tin_chi, mo_ta } = req.body;
    const result = await pool.query(
      'UPDATE hoc_phan SET ma_hoc_phan = $1, ten_hoc_phan = $2, so_tin_chi = $3, mo_ta = $4 WHERE id = $5 RETURNING *',
      [ma_hoc_phan, ten_hoc_phan, so_tin_chi, mo_ta, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy học phần' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Mã học phần đã tồn tại' });
    }
    res.status(500).json({ message: error.message });
  }
};

export const deleteHocPhan = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM hoc_phan WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy học phần' });
    }
    res.json({ message: 'Xóa học phần thành công' });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({ message: 'Không thể xóa học phần vì còn dữ liệu liên quan' });
    }
    res.status(500).json({ message: error.message });
  }
};

