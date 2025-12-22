import express from 'express';
import multer from 'multer';

// Controllers
import * as khoaController from '../controllers/khoaController.js';
import * as chuongTrinhController from '../controllers/chuongTrinhController.js';
import * as hocPhanController from '../controllers/hocPhanController.js';
import * as chuongTrinhHocPhanController from '../controllers/chuongTrinhHocPhanController.js';
import * as lopController from '../controllers/lopController.js';
import * as sinhVienController from '../controllers/sinhVienController.js';
import * as dotXetController from '../controllers/dotXetController.js';
import * as chuyenDiemController from '../controllers/chuyenDiemController.js';
import * as usersController from '../controllers/usersController.js';
import * as importController from '../controllers/importController.js';
import * as exportController from '../controllers/exportController.js';

// Middleware
import { authenticateToken, requireStaff, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Public routes (Authentication)
router.post('/auth/login', usersController.login);

// Protected routes
// Khoa routes
router.get('/khoa', authenticateToken, khoaController.getAllKhoa);
router.get('/khoa/:id', authenticateToken, khoaController.getKhoaById);
router.post('/khoa', authenticateToken, requireStaff, khoaController.createKhoa);
router.put('/khoa/:id', authenticateToken, requireStaff, khoaController.updateKhoa);
router.delete('/khoa/:id', authenticateToken, requireAdmin, khoaController.deleteKhoa);

// Chuong trinh routes
router.get('/chuong-trinh', authenticateToken, chuongTrinhController.getAllChuongTrinh);
router.get('/chuong-trinh/:id', authenticateToken, chuongTrinhController.getChuongTrinhById);
router.post('/chuong-trinh', authenticateToken, requireStaff, chuongTrinhController.createChuongTrinh);
router.put('/chuong-trinh/:id', authenticateToken, requireStaff, chuongTrinhController.updateChuongTrinh);
router.delete('/chuong-trinh/:id', authenticateToken, requireAdmin, chuongTrinhController.deleteChuongTrinh);

// Hoc phan routes
router.get('/hoc-phan', authenticateToken, hocPhanController.getAllHocPhan);
router.get('/hoc-phan/:id', authenticateToken, hocPhanController.getHocPhanById);
router.post('/hoc-phan', authenticateToken, requireStaff, hocPhanController.createHocPhan);
router.put('/hoc-phan/:id', authenticateToken, requireStaff, hocPhanController.updateHocPhan);
router.delete('/hoc-phan/:id', authenticateToken, requireAdmin, hocPhanController.deleteHocPhan);

// Chuong trinh hoc phan routes
router.get('/chuong-trinh-hoc-phan', authenticateToken, chuongTrinhHocPhanController.getAllChuongTrinhHocPhan);
router.get('/chuong-trinh-hoc-phan/chuong-trinh/:chuongTrinhId', authenticateToken, chuongTrinhHocPhanController.getByChuongTrinh);
router.post('/chuong-trinh-hoc-phan', authenticateToken, requireStaff, chuongTrinhHocPhanController.createChuongTrinhHocPhan);
router.delete('/chuong-trinh-hoc-phan/:id', authenticateToken, requireStaff, chuongTrinhHocPhanController.deleteChuongTrinhHocPhan);

// Lop routes
router.get('/lop', authenticateToken, lopController.getAllLop);
router.get('/lop/:id', authenticateToken, lopController.getLopById);
router.post('/lop', authenticateToken, requireStaff, lopController.createLop);
router.put('/lop/:id', authenticateToken, requireStaff, lopController.updateLop);
router.delete('/lop/:id', authenticateToken, requireAdmin, lopController.deleteLop);

// Sinh vien routes
router.get('/sinh-vien', authenticateToken, sinhVienController.getAllSinhVien);
router.get('/sinh-vien/search', authenticateToken, sinhVienController.getSinhVienByMaSV);
router.get('/sinh-vien/:id', authenticateToken, sinhVienController.getSinhVienById);
router.post('/sinh-vien', authenticateToken, requireStaff, sinhVienController.createSinhVien);
router.put('/sinh-vien/:id', authenticateToken, requireStaff, sinhVienController.updateSinhVien);
router.delete('/sinh-vien/:id', authenticateToken, requireAdmin, sinhVienController.deleteSinhVien);

// Dot xet routes
router.get('/dot-xet', authenticateToken, dotXetController.getAllDotXet);
router.get('/dot-xet/:id', authenticateToken, dotXetController.getDotXetById);
router.post('/dot-xet', authenticateToken, requireStaff, dotXetController.createDotXet);
router.put('/dot-xet/:id', authenticateToken, requireStaff, dotXetController.updateDotXet);
router.delete('/dot-xet/:id', authenticateToken, requireAdmin, dotXetController.deleteDotXet);

// Chuyen diem routes
router.get('/chuyen-diem', authenticateToken, chuyenDiemController.getAllChuyenDiem);
router.get('/chuyen-diem/dot-xet/:dotXetId', authenticateToken, chuyenDiemController.getChuyenDiemByDotXet);
router.get('/chuyen-diem/:id', authenticateToken, chuyenDiemController.getChuyenDiemById);
router.post('/chuyen-diem', authenticateToken, requireStaff, chuyenDiemController.createChuyenDiem);
router.put('/chuyen-diem/:id', authenticateToken, requireStaff, chuyenDiemController.updateChuyenDiem);
router.delete('/chuyen-diem/:id', authenticateToken, requireStaff, chuyenDiemController.deleteChuyenDiem);

// Users routes
router.get('/users', authenticateToken, requireAdmin, usersController.getAllUsers);
router.get('/users/:id', authenticateToken, requireAdmin, usersController.getUserById);
router.post('/users', authenticateToken, requireAdmin, usersController.createUser);
router.put('/users/:id', authenticateToken, requireAdmin, usersController.updateUser);
router.delete('/users/:id', authenticateToken, requireAdmin, usersController.deleteUser);

// Import routes
router.post('/import/sinh-vien', authenticateToken, requireStaff, upload.single('file'), importController.importSinhVien);
router.post('/import/hoc-phan', authenticateToken, requireStaff, upload.single('file'), importController.importHocPhan);
router.post('/import/chuyen-diem', authenticateToken, requireStaff, upload.single('file'), importController.importChuyenDiem);

// Export routes
router.get('/export/chuyen-diem/dot-xet/:dotXetId', authenticateToken, requireStaff, exportController.exportChuyenDiemByDotXet);

export default router;

