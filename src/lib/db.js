import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';

// Path ke file database
const DB_PATH = path.join(process.cwd(), 'data', 'users.json');

// Pastikan folder data ada dengan error handling yang lebih baik
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
    return true;
  } catch (error) {
    console.error('Error ensuring DB exists:', error);
    throw new Error('Database initialization failed');
  }
}

// Baca database dengan error handling yang lebih baik
async function readDb() {
  await ensureDbExists();
  
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    // Handle file kosong
    if (!data || data.trim() === '') {
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users:', error);
    // Backup file rusak jika parsing error
    if (error instanceof SyntaxError) {
      try {
        const backup = `${DB_PATH}.backup.${Date.now()}`;
        const data = await fs.readFile(DB_PATH, 'utf8');
        await fs.writeFile(backup, data);
        console.error(`Corrupted DB backed up to ${backup}`);
        await fs.writeFile(DB_PATH, JSON.stringify([]));
      } catch (backupError) {
        console.error('Failed to backup corrupted DB:', backupError);
      }
    }
    return [];
  }
}

// Tulis database dengan atomic operation
async function writeDb(data) {
  await ensureDbExists();
  
  try {
    const tempPath = `${DB_PATH}.temp`;
    const jsonString = JSON.stringify(data, null, 2);
    
    // Tulis ke file temporary dulu
    await fs.writeFile(tempPath, jsonString);
    
    // Ganti file asli dengan atomic rename
    await fs.rename(tempPath, DB_PATH);
    
    return true;
  } catch (error) {
    console.error('Error writing users:', error);
    throw new Error('Failed to save user data');
  }
}

// Dapatkan semua user
export async function getUsers() {
  return await readDb();
}

// Dapatkan user berdasarkan email
export async function getUserByEmail(email) {
  if (!email) return null;
  
  try {
    const users = await readDb();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

// Tambah user baru
export async function createUser(userData) {
  if (!userData || !userData.email || !userData.password || !userData.name) {
    throw new Error('Data pengguna tidak lengkap');
  }
  
  try {
    const users = await readDb();
    
    // Cek apakah email sudah ada
    if (users.some(user => user.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('Email sudah terdaftar');
    }
    
    // Hash password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(userData.password, 10);
    } catch (hashError) {
      console.error('Password hashing failed:', hashError);
      throw new Error('Gagal memproses password');
    }
    
    // Buat user baru dengan ID unik
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };
    
    // Simpan user ke database
    users.push(newUser);
    await writeDb(users);
    
    // Kembalikan user tanpa password
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error; // Re-throw untuk ditangani oleh API route
  }
}

// Verifikasi kredensial user
export async function verifyCredentials(email, password) {
  try {
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
  } catch (error) {
    console.error('Error verifying credentials:', error);
    return null;
  }
}
