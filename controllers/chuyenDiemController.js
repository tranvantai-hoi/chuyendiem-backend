import pool from '../config/database.js';
import { validateCreditTransfer } from '../services/validationService.js';

export const getAllChuyenDiem = async (req, res) => {
  try {
    const query = `
      SELECT cdt.*, 
             dx.ten_dot, 
             sv.ma_sinh_vien, sv.ho_ten as ten_sinh_vien,
             hp_goc.ma_hoc_phan as ma_hp_goc_ref, hp_goc.ten_hoc_phan as ten_hp_goc_ref,
             hp_chuyen.ma_hoc_phan as ma_hp_chuyen_ref, hp_chuyen.ten_hoc_phan as ten_hp_chuyen_ref
      FROM chuyen_diem_chi_tiet cdt
      LEFT JOIN dot_xet dx ON cdt.dot_xet_id = dx.id
      LEFT JOIN sinh_vien sv ON cdt.sinh_vien_id = sv.id
      LEFT JOIN hoc_phan hp_goc ON cdt.hoc_phan_goc_id = hp_goc.id
      LEFT JOIN hoc_phan hp_chuyen ON cdt.hoc_phan_chuyen_id = hp_chuyen.id
      ORDER BY cdt.created_at DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getChuyenDiemByDotXet = async (req, res) => {
  try {
    const { dotXetId } = req.params;
    const query = `
      SELECT cdt.*, 
             sv.ma_sinh_vien, sv.ho_ten as ten_sinh_vien,
             hp_goc.ma_hoc_phan as ma_hp_goc_ref, hp_goc.ten_hoc_phan as ten_hp_goc_ref, hp_goc.so_tin_chi as so_tc_goc_ref,
             hp_chuyen.ma_hoc_phan as ma_hp_chuyen_ref, hp_chuyen.ten_hoc_phan as ten_hp_chuyen_ref, hp_chuyen.so_tin_chi as so_tc_chuyen_ref
      FROM chuyen_diem_chi_tiet cdt
      LEFT JOIN sinh_vien sv ON cdt.sinh_vien_id = sv.id
      LEFT JOIN hoc_phan hp_goc ON cdt.hoc_phan_goc_id = hp_goc.id
      LEFT JOIN hoc_phan hp_chuyen ON cdt.hoc_phan_chuyen_id = hp_chuyen.id
      WHERE cdt.dot_xet_id = $1
      ORDER BY sv.ma_sinh_vien
    `;
    const result = await pool.query(query, [dotXetId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getChuyenDiemById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT cdt.*, 
             dx.ten_dot, 
             sv.ma_sinh_vien, sv.ho_ten as ten_sinh_vien,
             hp_goc.ma_hoc_phan as ma_hp_goc_ref, hp_goc.ten_hoc_phan as ten_hp_goc_ref,
             hp_chuyen.ma_hoc_phan as ma_hp_chuyen_ref, hp_chuyen.ten_hoc_phan as ten_hp_chuyen_ref
      FROM chuyen_diem_chi_tiet cdt
      LEFT JOIN dot_xet dx ON cdt.dot_xet_id = dx.id
      LEFT JOIN sinh_vien sv ON cdt.sinh_vien_id = sv.id
      LEFT JOIN hoc_phan hp_goc ON cdt.hoc_phan_goc_id = hp_goc.id
      LEFT JOIN hoc_phan hp_chuyen ON cdt.hoc_phan_chuyen_id = hp_chuyen.id
      WHERE cdt.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bản ghi chuyển điểm' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createChuyenDiem = async (req, res) => {
  try {
    const {
      dot_xet_id,
      sinh_vien_id,
      hoc_phan_goc_id,
      ma_hoc_phan_goc,
      ten_hoc_phan_goc,
      so_tin_chi_goc,
      hoc_phan_chuyen_id,
      ma_hoc_phan_chuyen,
      ten_hoc_phan_chuyen,
      so_tin_chi_chuyen,
      diem_chuyen,
      ghi_chu,
      trang_thai,
    } = req.body;

    // Validate credit transfer
    const validation = await validateCreditTransfer(
      {
        ma_hoc_phan_chuyen,
        ten_hoc_phan_chuyen,
        so_tin_chi_chuyen,
      },
      sinh_vien_id
    );

    const result = await pool.query(
      `INSERT INTO chuyen_diem_chi_tiet (
        dot_xet_id, sinh_vien_id, hoc_phan_goc_id, ma_hoc_phan_goc, ten_hoc_phan_goc, so_tin_chi_goc,
        hoc_phan_chuyen_id, ma_hoc_phan_chuyen, ten_hoc_phan_chuyen, so_tin_chi_chuyen,
        diem_chuyen, ghi_chu, trang_thai,
        kiem_tra_hoc_phan, loi_sai_ten_hoc_phan, loi_sai_so_tin_chi, thong_bao_loi
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
      [
        dot_xet_id,
        sinh_vien_id,
        hoc_phan_goc_id,
        ma_hoc_phan_goc,
        ten_hoc_phan_goc,
        so_tin_chi_goc,
        hoc_phan_chuyen_id,
        ma_hoc_phan_chuyen,
        ten_hoc_phan_chuyen,
        so_tin_chi_chuyen,
        diem_chuyen,
        ghi_chu,
        trang_thai || 'pending',
        validation.kiemTraHocPhan,
        validation.loiSaiTenHocPhan,
        validation.loiSaiSoTinChi,
        validation.errors.join('; '),
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateChuyenDiem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      dot_xet_id,
      sinh_vien_id,
      hoc_phan_goc_id,
      ma_hoc_phan_goc,
      ten_hoc_phan_goc,
      so_tin_chi_goc,
      hoc_phan_chuyen_id,
      ma_hoc_phan_chuyen,
      ten_hoc_phan_chuyen,
      so_tin_chi_chuyen,
      diem_chuyen,
      ghi_chu,
      trang_thai,
    } = req.body;

    // Validate credit transfer
    const validation = await validateCreditTransfer(
      {
        ma_hoc_phan_chuyen,
        ten_hoc_phan_chuyen,
        so_tin_chi_chuyen,
      },
      sinh_vien_id
    );

    const result = await pool.query(
      `UPDATE chuyen_diem_chi_tiet SET 
        dot_xet_id = $1, sinh_vien_id = $2, hoc_phan_goc_id = $3, ma_hoc_phan_goc = $4, 
        ten_hoc_phan_goc = $5, so_tin_chi_goc = $6, hoc_phan_chuyen_id = $7, 
        ma_hoc_phan_chuyen = $8, ten_hoc_phan_chuyen = $9, so_tin_chi_chuyen = $10,
        diem_chuyen = $11, ghi_chu = $12, trang_thai = $13,
        kiem_tra_hoc_phan = $14, loi_sai_ten_hoc_phan = $15, loi_sai_so_tin_chi = $16, thong_bao_loi = $17
      WHERE id = $18 RETURNING *`,
      [
        dot_xet_id,
        sinh_vien_id,
        hoc_phan_goc_id,
        ma_hoc_phan_goc,
        ten_hoc_phan_goc,
        so_tin_chi_goc,
        hoc_phan_chuyen_id,
        ma_hoc_phan_chuyen,
        ten_hoc_phan_chuyen,
        so_tin_chi_chuyen,
        diem_chuyen,
        ghi_chu,
        trang_thai,
        validation.kiemTraHocPhan,
        validation.loiSaiTenHocPhan,
        validation.loiSaiSoTinChi,
        validation.errors.join('; '),
        id,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bản ghi chuyển điểm' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteChuyenDiem = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM chuyen_diem_chi_tiet WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bản ghi chuyển điểm' });
    }
    res.json({ message: 'Xóa bản ghi chuyển điểm thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

