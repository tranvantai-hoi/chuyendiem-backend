# Backend API - Hệ thống Chuyển điểm

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Tạo database và chạy schema:
```bash
createdb credit_transfer_db
psql -d credit_transfer_db -f database/schema.sql
```

3. Tạo file `.env` từ `.env.example` và cấu hình

4. Chạy server:
```bash
npm run dev  # Development
npm start    # Production
```

## API Documentation

Base URL: `http://localhost:3000/api`

### Authentication
- `POST /auth/login` - Đăng nhập (public)

### Protected Routes
Tất cả routes khác cần Bearer token trong header:
```
Authorization: Bearer <token>
```

### Tạo user đầu tiên

Sử dụng SQL để tạo user admin:
```sql
-- Hash password "admin123"
INSERT INTO users (username, password_hash, ho_ten, vai_tro) 
VALUES ('admin', '$2a$10$...', 'Administrator', 'admin');
```

Hoặc dùng script:
```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('admin123', 10);
console.log(hash);
```

