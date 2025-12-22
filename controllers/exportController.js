import pool from '../config/database.js';
import { generateExcel } from '../utils/excel.js';

/**
 * Export chuyen_diem_chi_tiet by dot_xet_id to Excel
 */
export const exportChuyenDiemByDotXet = async (req, res) => {
  try {
    const { dotXetId } = req.params;

    const query = `
      SELECT 
        sv.ma_sinh_vien,
        sv.ho_ten as ten_sinh_vien,
        cdt.ma_hoc_phan_goc,
        cdt.ten_hoc_phan_goc,
        cdt.so_tin_chi_goc,
        cdt.ma_hoc_phan_chuyen,
        cdt.ten_hoc_phan_chuyen,
        cdt.so_tin_chi_chuyen,
        cdt.diem_chuyen,
        cdt.trang_thai,
        cdt.kiem_tra_hoc_phan,
        cdt.loi_sai_ten_hoc_phan,
        cdt.loi_sai_so_tin_chi,
        cdt.thong_bao_loi,
        cdt.ghi_chu,
        dx.ten_dot
      FROM chuyen_diem_chi_tiet cdt
      LEFT JOIN sinh_vien sv ON cdt.sinh_vien_id = sv.id
      LEFT JOIN dot_xet dx ON cdt.dot_xet_id = dx.id
      WHERE cdt.dot_xet_id = $1
      ORDER BY sv.ma_sinh_vien
    `;

    const result = await pool.query(query, [dotXetId]);

    // Transform data for Excel
    const excelData = result.rows.map((row) => ({
      'Mã sinh viên': row.ma_sinh_vien,
      'Tên sinh viên': row.ten_sinh_vien,
      'Mã học phần gốc': row.ma_hoc_phan_goc,
      'Tên học phần gốc': row.ten_hoc_phan_goc,
      'Số tín chỉ gốc': row.so_tin_chi_goc,
      'Mã học phần chuyển': row.ma_hoc_phan_chuyen,
      'Tên học phần chuyển': row.ten_hoc_phan_chuyen,
      'Số tín chỉ chuyển': row.so_tin_chi_chuyen,
      'Điểm chuyển': row.diem_chuyen,
      'Trạng thái': row.trang_thai,
      'Kiểm tra học phần': row.kiem_tra_hoc_phan ? 'Đúng' : 'Sai',
      'Lỗi sai tên học phần': row.loi_sai_ten_hoc_phan ? 'Có' : 'Không',
      'Lỗi sai số tín chỉ': row.loi_sai_so_tin_chi ? 'Có' : 'Không',
      'Thông báo lỗi': row.thong_bao_loi,
      'Ghi chú': row.ghi_chu,
      'Đợt xét': row.ten_dot,
    }));

    const excelBuffer = generateExcel(excelData);

    // Get dot_xet name for filename
    const dotXetResult = await pool.query('SELECT ten_dot FROM dot_xet WHERE id = $1', [dotXetId]);
    const fileName = dotXetResult.rows.length > 0 
      ? `chuyen_diem_${dotXetResult.rows[0].ten_dot.replace(/\s+/g, '_')}.xlsx`
      : `chuyen_diem_dot_${dotXetId}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(excelBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

