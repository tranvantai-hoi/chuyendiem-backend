import pool from '../config/database.js';
import { parseExcel, processInChunks } from '../utils/excel.js';
import { validateCreditTransfer } from '../services/validationService.js';

const CHUNK_SIZE = 100;

/**
 * Import students from Excel
 * Expected columns: ma_sinh_vien, ho_ten, email, so_dien_thoai, ma_lop, ngay_sinh, gioi_tinh, dia_chi
 */
export const importSinhVien = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file được upload' });
    }

    const data = parseExcel(req.file.buffer);
    const results = {
      success: 0,
      errors: [],
    };

    const processor = async (chunk) => {
      for (const row of chunk) {
        try {
          // Get lop_id from ma_lop
          let lop_id = null;
          if (row.ma_lop) {
            const lopResult = await pool.query('SELECT id FROM lop WHERE ma_lop = $1', [row.ma_lop]);
            if (lopResult.rows.length > 0) {
              lop_id = lopResult.rows[0].id;
              // Get chuong_trinh_id from lop
              const lopInfo = await pool.query('SELECT chuong_trinh_id FROM lop WHERE id = $1', [lop_id]);
              if (lopInfo.rows.length > 0) {
                const chuong_trinh_id = lopInfo.rows[0].chuong_trinh_id;
                await pool.query(
                  `INSERT INTO sinh_vien (ma_sinh_vien, ho_ten, email, so_dien_thoai, lop_id, chuong_trinh_id, ngay_sinh, gioi_tinh, dia_chi)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                   ON CONFLICT (ma_sinh_vien) DO UPDATE SET
                     ho_ten = EXCLUDED.ho_ten,
                     email = EXCLUDED.email,
                     so_dien_thoai = EXCLUDED.so_dien_thoai,
                     lop_id = EXCLUDED.lop_id,
                     chuong_trinh_id = EXCLUDED.chuong_trinh_id,
                     ngay_sinh = EXCLUDED.ngay_sinh,
                     gioi_tinh = EXCLUDED.gioi_tinh,
                     dia_chi = EXCLUDED.dia_chi`,
                  [
                    row.ma_sinh_vien,
                    row.ho_ten,
                    row.email || null,
                    row.so_dien_thoai || null,
                    lop_id,
                    chuong_trinh_id || null,
                    row.ngay_sinh ? new Date(row.ngay_sinh) : null,
                    row.gioi_tinh || null,
                    row.dia_chi || null,
                  ]
                );
                results.success++;
              } else {
                results.errors.push({ row: row.ma_sinh_vien, error: 'Không tìm thấy chương trình từ lớp' });
              }
            } else {
              results.errors.push({ row: row.ma_sinh_vien, error: `Không tìm thấy lớp: ${row.ma_lop}` });
            }
          } else {
            results.errors.push({ row: row.ma_sinh_vien, error: 'Thiếu mã lớp' });
          }
        } catch (error) {
          results.errors.push({ row: row.ma_sinh_vien || 'unknown', error: error.message });
        }
      }
    };

    await processInChunks(data, CHUNK_SIZE, processor);

    res.json({
      message: `Import thành công ${results.success} sinh viên`,
      success: results.success,
      errors: results.errors,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Import hoc_phan from Excel
 * Expected columns: ma_hoc_phan, ten_hoc_phan, so_tin_chi, mo_ta
 */
export const importHocPhan = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file được upload' });
    }

    const data = parseExcel(req.file.buffer);
    const results = {
      success: 0,
      errors: [],
    };

    const processor = async (chunk) => {
      for (const row of chunk) {
        try {
          await pool.query(
            `INSERT INTO hoc_phan (ma_hoc_phan, ten_hoc_phan, so_tin_chi, mo_ta)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (ma_hoc_phan) DO UPDATE SET
               ten_hoc_phan = EXCLUDED.ten_hoc_phan,
               so_tin_chi = EXCLUDED.so_tin_chi,
               mo_ta = EXCLUDED.mo_ta`,
            [row.ma_hoc_phan, row.ten_hoc_phan, parseInt(row.so_tin_chi), row.mo_ta || null]
          );
          results.success++;
        } catch (error) {
          results.errors.push({ row: row.ma_hoc_phan || 'unknown', error: error.message });
        }
      }
    };

    await processInChunks(data, CHUNK_SIZE, processor);

    res.json({
      message: `Import thành công ${results.success} học phần`,
      success: results.success,
      errors: results.errors,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Import chuyen_diem from Excel
 * Expected columns: ma_sinh_vien, ma_hoc_phan_goc, ten_hoc_phan_goc, so_tin_chi_goc,
 *                   ma_hoc_phan_chuyen, ten_hoc_phan_chuyen, so_tin_chi_chuyen, diem_chuyen
 */
export const importChuyenDiem = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file được upload' });
    }

    const { dot_xet_id } = req.body;
    if (!dot_xet_id) {
      return res.status(400).json({ message: 'Thiếu dot_xet_id' });
    }

    const data = parseExcel(req.file.buffer);
    const results = {
      success: 0,
      errors: [],
    };

    const processor = async (chunk) => {
      for (const row of chunk) {
        try {
          // Get sinh_vien_id
          const svResult = await pool.query('SELECT id FROM sinh_vien WHERE ma_sinh_vien = $1', [row.ma_sinh_vien]);
          if (svResult.rows.length === 0) {
            results.errors.push({ row: row.ma_sinh_vien, error: 'Không tìm thấy sinh viên' });
            continue;
          }
          const sinh_vien_id = svResult.rows[0].id;

          // Get hoc_phan_goc_id
          let hoc_phan_goc_id = null;
          if (row.ma_hoc_phan_goc) {
            const hpGocResult = await pool.query('SELECT id FROM hoc_phan WHERE ma_hoc_phan = $1', [row.ma_hoc_phan_goc]);
            if (hpGocResult.rows.length > 0) {
              hoc_phan_goc_id = hpGocResult.rows[0].id;
            }
          }

          // Get hoc_phan_chuyen_id
          let hoc_phan_chuyen_id = null;
          if (row.ma_hoc_phan_chuyen) {
            const hpChuyenResult = await pool.query('SELECT id FROM hoc_phan WHERE ma_hoc_phan = $1', [row.ma_hoc_phan_chuyen]);
            if (hpChuyenResult.rows.length > 0) {
              hoc_phan_chuyen_id = hpChuyenResult.rows[0].id;
            }
          }

          // Validate credit transfer
          const validation = await validateCreditTransfer(
            {
              ma_hoc_phan_chuyen: row.ma_hoc_phan_chuyen,
              ten_hoc_phan_chuyen: row.ten_hoc_phan_chuyen,
              so_tin_chi_chuyen: row.so_tin_chi_chuyen,
            },
            sinh_vien_id
          );

          await pool.query(
            `INSERT INTO chuyen_diem_chi_tiet (
              dot_xet_id, sinh_vien_id, hoc_phan_goc_id, ma_hoc_phan_goc, ten_hoc_phan_goc, so_tin_chi_goc,
              hoc_phan_chuyen_id, ma_hoc_phan_chuyen, ten_hoc_phan_chuyen, so_tin_chi_chuyen,
              diem_chuyen, kiem_tra_hoc_phan, loi_sai_ten_hoc_phan, loi_sai_so_tin_chi, thong_bao_loi
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
            [
              dot_xet_id,
              sinh_vien_id,
              hoc_phan_goc_id,
              row.ma_hoc_phan_goc || null,
              row.ten_hoc_phan_goc || null,
              row.so_tin_chi_goc ? parseInt(row.so_tin_chi_goc) : null,
              hoc_phan_chuyen_id,
              row.ma_hoc_phan_chuyen || null,
              row.ten_hoc_phan_chuyen || null,
              row.so_tin_chi_chuyen ? parseInt(row.so_tin_chi_chuyen) : null,
              row.diem_chuyen ? parseFloat(row.diem_chuyen) : null,
              validation.kiemTraHocPhan,
              validation.loiSaiTenHocPhan,
              validation.loiSaiSoTinChi,
              validation.errors.join('; '),
            ]
          );
          results.success++;
        } catch (error) {
          results.errors.push({ row: row.ma_sinh_vien || 'unknown', error: error.message });
        }
      }
    };

    await processInChunks(data, CHUNK_SIZE, processor);

    res.json({
      message: `Import thành công ${results.success} bản ghi chuyển điểm`,
      success: results.success,
      errors: results.errors,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

