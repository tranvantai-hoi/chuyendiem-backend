import pool from '../config/database.js';

/**
 * Validate if a course belongs to a program
 */
export const validateCourseInProgram = async (maHocPhan, chuongTrinhId) => {
  try {
    const query = `
      SELECT cthp.*, hp.ma_hoc_phan, hp.ten_hoc_phan, hp.so_tin_chi
      FROM chuong_trinh_hoc_phan cthp
      JOIN hoc_phan hp ON cthp.hoc_phan_id = hp.id
      WHERE hp.ma_hoc_phan = $1 AND cthp.chuong_trinh_id = $2
    `;
    const result = await pool.query(query, [maHocPhan, chuongTrinhId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    throw new Error(`Error validating course: ${error.message}`);
  }
};

/**
 * Validate course details (name and credits)
 */
export const validateCourseDetails = async (maHocPhan, tenHocPhan, soTinChi) => {
  try {
    const query = 'SELECT * FROM hoc_phan WHERE ma_hoc_phan = $1';
    const result = await pool.query(query, [maHocPhan]);
    
    if (result.rows.length === 0) {
      return {
        isValid: false,
        errors: [`Không tìm thấy học phần với mã: ${maHocPhan}`],
      };
    }

    const course = result.rows[0];
    const errors = [];

    if (tenHocPhan && course.ten_hoc_phan && course.ten_hoc_phan.toLowerCase() !== tenHocPhan.toLowerCase()) {
      errors.push(`Sai tên học phần: "${tenHocPhan}" (đúng là: "${course.ten_hoc_phan}")`);
    }

    if (soTinChi !== null && soTinChi !== undefined && course.so_tin_chi !== parseInt(soTinChi)) {
      errors.push(`Sai số tín chỉ: ${soTinChi} (đúng là: ${course.so_tin_chi})`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      course,
    };
  } catch (error) {
    throw new Error(`Error validating course details: ${error.message}`);
  }
};

/**
 * Validate credit transfer entry
 */
export const validateCreditTransfer = async (transferData, sinhVienId) => {
  try {
    // Get student's program
    const studentQuery = 'SELECT chuong_trinh_id FROM sinh_vien WHERE id = $1';
    const studentResult = await pool.query(studentQuery, [sinhVienId]);
    
    if (studentResult.rows.length === 0) {
      return {
        isValid: false,
        errors: ['Không tìm thấy sinh viên'],
      };
    }

    const chuongTrinhId = studentResult.rows[0].chuong_trinh_id;
    if (!chuongTrinhId) {
      return {
        isValid: false,
        errors: ['Sinh viên chưa có chương trình học'],
      };
    }

    const errors = [];
    let kiemTraHocPhan = false;
    let loiSaiTenHocPhan = false;
    let loiSaiSoTinChi = false;

    // Validate target course (hoc_phan_chuyen)
    if (transferData.ma_hoc_phan_chuyen) {
      const courseValidation = await validateCourseDetails(
        transferData.ma_hoc_phan_chuyen,
        transferData.ten_hoc_phan_chuyen || '',
        transferData.so_tin_chi_chuyen || 0
      );

      if (!courseValidation.isValid) {
        errors.push(...courseValidation.errors);
        loiSaiTenHocPhan = courseValidation.errors.some(e => e.includes('tên học phần'));
        loiSaiSoTinChi = courseValidation.errors.some(e => e.includes('tín chỉ'));
      }

      // Check if course belongs to program
      const programValidation = await validateCourseInProgram(
        transferData.ma_hoc_phan_chuyen,
        chuongTrinhId
      );

      if (programValidation) {
        kiemTraHocPhan = true;
      } else {
        errors.push(`Học phần ${transferData.ma_hoc_phan_chuyen} không thuộc chương trình học của sinh viên`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      kiemTraHocPhan,
      loiSaiTenHocPhan,
      loiSaiSoTinChi,
    };
  } catch (error) {
    throw new Error(`Error validating credit transfer: ${error.message}`);
  }
};

