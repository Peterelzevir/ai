// /lib/db.js
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';

// Path ke file database
const DB_PATH = path.join(process.cwd(), 'data', 'users.json');

// Pastikan folder data ada
async function ensureDbExists() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    try {
      await fs.access(dataDir);
    } catch {
      // Folder tidak ada, buat folder
      await fs.mkdir(dataDir, { recursive: true });
    }
    
    try {
      await fs.access(DB_PATH);
    } catch {
      // File tidak ada, buat file kosong
      await fs.writeFile(DB_PATH, JSON.stringify([]));
    }
  } catch (error) {
    console.error('Error ensuring DB exists:', error);
  }
}

// Dapatkan semua user
export async function getUsers() {
  await ensureDbExists();
  
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
}

// Dapatkan user berdasarkan email
export async function getUserByEmail(email) {
  const users = await getUsers();
  return users.find(user => user.email.toLowerCase() === email.toLowerCase());
}

// Tambah user baru
export async function createUser(userData) {
  await ensureDbExists();
  
  const users = await getUsers();
  
  // Cek apakah email sudah ada
  if (users.some(user => user.email.toLowerCase() === userData.email.toLowerCase())) {
    throw new Error('Email sudah terdaftar');
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  // Buat user baru dengan ID unik
  const newUser = {
    id: `user_${Date.now()}`,
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };
  
  // Simpan user ke database
  users.push(newUser);
  await fs.writeFile(DB_PATH, JSON.stringify(users, null, 2));
  
  // Kembalikan user tanpa password
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
}

// Verifikasi kredensial user
export async function verifyCredentials(email, password) {
  const user = await getUserByEmail(email);
  
  if (!user) {
    return null;
  }
  
  // Verifikasi password
  const passwordMatch = await bcrypt.compare(password, user.password);
  
  if (!passwordMatch) {
    return null;
  }
  
  // Kembalikan user tanpa password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
