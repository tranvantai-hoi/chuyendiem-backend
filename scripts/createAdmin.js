import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    const username = process.argv[2] || 'admin';
    const password = process.argv[3] || 'admin123';
    const ho_ten = process.argv[4] || 'Administrator';

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (username, password_hash, ho_ten, vai_tro) VALUES ($1, $2, $3, $4) RETURNING id, username, ho_ten',
      [username, password_hash, ho_ten, 'admin']
    );

    console.log('Admin user created successfully:');
    console.log(`Username: ${result.rows[0].username}`);
    console.log(`Password: ${password}`);
    console.log(`Name: ${result.rows[0].ho_ten}`);

    process.exit(0);
  } catch (error) {
    if (error.code === '23505') {
      console.error('Error: Username already exists');
    } else {
      console.error('Error creating admin user:', error.message);
    }
    process.exit(1);
  }
};

createAdmin();

