-- Database Schema for Credit Transfer System
-- Drop tables if exist (for migration)
DROP TABLE IF EXISTS chuyen_diem_chi_tiet CASCADE;
DROP TABLE IF EXISTS dot_xet CASCADE;
DROP TABLE IF EXISTS sinh_vien CASCADE;
DROP TABLE IF EXISTS lop CASCADE;
DROP TABLE IF EXISTS chuong_trinh_hoc_phan CASCADE;
DROP TABLE IF EXISTS hoc_phan CASCADE;
DROP TABLE IF EXISTS chuong_trinh CASCADE;
DROP TABLE IF EXISTS khoa CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Table: khoa (Faculty/Department)
CREATE TABLE khoa (
    id SERIAL PRIMARY KEY,
    ma_khoa VARCHAR(20) UNIQUE NOT NULL,
    ten_khoa VARCHAR(255) NOT NULL,
    mo_ta TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: chuong_trinh (Program)
CREATE TABLE chuong_trinh (
    id SERIAL PRIMARY KEY,
    ma_chuong_trinh VARCHAR(50) UNIQUE NOT NULL,
    ten_chuong_trinh VARCHAR(255) NOT NULL,
    khoa_id INTEGER NOT NULL REFERENCES khoa(id) ON DELETE CASCADE,
    mo_ta TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: hoc_phan (Course/Subject)
CREATE TABLE hoc_phan (
    id SERIAL PRIMARY KEY,
    ma_hoc_phan VARCHAR(50) UNIQUE NOT NULL,
    ten_hoc_phan VARCHAR(255) NOT NULL,
    so_tin_chi INTEGER NOT NULL CHECK (so_tin_chi > 0),
    mo_ta TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: chuong_trinh_hoc_phan (Program-Course relationship)
CREATE TABLE chuong_trinh_hoc_phan (
    id SERIAL PRIMARY KEY,
    chuong_trinh_id INTEGER NOT NULL REFERENCES chuong_trinh(id) ON DELETE CASCADE,
    hoc_phan_id INTEGER NOT NULL REFERENCES hoc_phan(id) ON DELETE CASCADE,
    hoc_ky INTEGER CHECK (hoc_ky > 0),
    UNIQUE(chuong_trinh_id, hoc_phan_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: lop (Class)
CREATE TABLE lop (
    id SERIAL PRIMARY KEY,
    ma_lop VARCHAR(50) UNIQUE NOT NULL,
    ten_lop VARCHAR(255) NOT NULL,
    chuong_trinh_id INTEGER NOT NULL REFERENCES chuong_trinh(id) ON DELETE CASCADE,
    khoa_id INTEGER NOT NULL REFERENCES khoa(id) ON DELETE CASCADE,
    khoa_hoc VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: sinh_vien (Student)
CREATE TABLE sinh_vien (
    id SERIAL PRIMARY KEY,
    ma_sinh_vien VARCHAR(20) UNIQUE NOT NULL,
    ho_ten VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    so_dien_thoai VARCHAR(20),
    lop_id INTEGER REFERENCES lop(id) ON DELETE SET NULL,
    chuong_trinh_id INTEGER REFERENCES chuong_trinh(id) ON DELETE SET NULL,
    ngay_sinh DATE,
    gioi_tinh VARCHAR(10),
    dia_chi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: dot_xet (Evaluation Period)
CREATE TABLE dot_xet (
    id SERIAL PRIMARY KEY,
    ten_dot VARCHAR(255) NOT NULL,
    nam_hoc VARCHAR(20),
    hoc_ky VARCHAR(20),
    ngay_bat_dau DATE,
    ngay_ket_thuc DATE,
    trang_thai VARCHAR(20) DEFAULT 'draft' CHECK (trang_thai IN ('draft', 'open', 'closed')),
    mo_ta TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: chuyen_diem_chi_tiet (Credit Transfer Detail)
CREATE TABLE chuyen_diem_chi_tiet (
    id SERIAL PRIMARY KEY,
    dot_xet_id INTEGER NOT NULL REFERENCES dot_xet(id) ON DELETE CASCADE,
    sinh_vien_id INTEGER NOT NULL REFERENCES sinh_vien(id) ON DELETE CASCADE,
    hoc_phan_goc_id INTEGER REFERENCES hoc_phan(id) ON DELETE SET NULL,
    ma_hoc_phan_goc VARCHAR(50),
    ten_hoc_phan_goc VARCHAR(255),
    so_tin_chi_goc INTEGER,
    hoc_phan_chuyen_id INTEGER REFERENCES hoc_phan(id) ON DELETE SET NULL,
    ma_hoc_phan_chuyen VARCHAR(50),
    ten_hoc_phan_chuyen VARCHAR(255),
    so_tin_chi_chuyen INTEGER,
    diem_chuyen NUMERIC(4,2),
    ghi_chu TEXT,
    trang_thai VARCHAR(20) DEFAULT 'pending' CHECK (trang_thai IN ('pending', 'approved', 'rejected')),
    -- Validation fields
    kiem_tra_hoc_phan BOOLEAN DEFAULT false,
    loi_sai_ten_hoc_phan BOOLEAN DEFAULT false,
    loi_sai_so_tin_chi BOOLEAN DEFAULT false,
    thong_bao_loi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: users (System Users)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    ho_ten VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    vai_tro VARCHAR(20) DEFAULT 'user' CHECK (vai_tro IN ('admin', 'staff', 'user')),
    khoa_id INTEGER REFERENCES khoa(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_chuong_trinh_khoa ON chuong_trinh(khoa_id);
CREATE INDEX idx_chuong_trinh_hoc_phan_ct ON chuong_trinh_hoc_phan(chuong_trinh_id);
CREATE INDEX idx_chuong_trinh_hoc_phan_hp ON chuong_trinh_hoc_phan(hoc_phan_id);
CREATE INDEX idx_lop_ct ON lop(chuong_trinh_id);
CREATE INDEX idx_lop_khoa ON lop(khoa_id);
CREATE INDEX idx_sinh_vien_lop ON sinh_vien(lop_id);
CREATE INDEX idx_sinh_vien_ct ON sinh_vien(chuong_trinh_id);
CREATE INDEX idx_chuyen_diem_dot ON chuyen_diem_chi_tiet(dot_xet_id);
CREATE INDEX idx_chuyen_diem_sv ON chuyen_diem_chi_tiet(sinh_vien_id);
CREATE INDEX idx_chuyen_diem_hp_goc ON chuyen_diem_chi_tiet(hoc_phan_goc_id);
CREATE INDEX idx_chuyen_diem_hp_chuyen ON chuyen_diem_chi_tiet(hoc_phan_chuyen_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_khoa_updated_at BEFORE UPDATE ON khoa FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chuong_trinh_updated_at BEFORE UPDATE ON chuong_trinh FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hoc_phan_updated_at BEFORE UPDATE ON hoc_phan FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lop_updated_at BEFORE UPDATE ON lop FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sinh_vien_updated_at BEFORE UPDATE ON sinh_vien FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dot_xet_updated_at BEFORE UPDATE ON dot_xet FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chuyen_diem_chi_tiet_updated_at BEFORE UPDATE ON chuyen_diem_chi_tiet FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

