import pool from '../config/database.js';

export const getAllChuongTrinhHocPhan = async (req, res) => {
  try {
    const query = `
      SELECT cthp.*, ct.ma_chuong_trinh, ct.ten_chuong_trinh, hp.ma_hoc_phan, hp.ten_hoc_phan, hp.so_tin_chi
      FROM chuong_trinh_hoc_phan cthp
      LEFT JOIN chuong_trinh ct ON cthp.chuong_trinh_id = ct.id
      LEFT JOIN hoc_phan hp ON cthp.hoc_phan_id = hp.id
      ORDER BY ct.ma_chuong_trinh, cthp.hoc_ky
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getByChuongTrinh = async (req, res) => {
  try {
    const { chuongTrinhId } = req.params;
    const query = `
      SELECT cthp.*, hp.ma_hoc_phan, hp.ten_hoc_phan, hp.so_tin_chi
      FROM chuong_trinh_hoc_phan cthp
      LEFT JOIN hoc_phan hp ON cthp.hoc_phan_id = hp.id
      WHERE cthp.chuong_trinh_id = $1
      ORDER BY cthp.hoc_ky
    `;
    const result = await pool.query(query, [chuongTrinhId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createChuongTrinhHocPhan = async (req, res) => {
  try {
    const { chuong_trinh_id, hoc_phan_id, hoc_ky } = req.body;
    const result = await pool.query(
      'INSERT INTO chuong_trinh_hoc_phan (chuong_trinh_id, hoc_phan_id, hoc_ky) VALUES ($1, $2, $3) RETURNING *',
      [chuong_trinh_id, hoc_phan_id, hoc_ky]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Học phần đã tồn tại trong chương trình' });
    }
    if (error.code === '23503') {
      return res.status(400).json({ message: 'Chương trình hoặc học phần không tồn tại' });
    }
    res.status(500).json({ message: error.message });
  }
};

export const deleteChuongTrinhHocPhan = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM chuong_trinh_hoc_phan WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bản ghi' });
    }
    res.json({ message: 'Xóa thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

