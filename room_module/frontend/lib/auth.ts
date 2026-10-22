import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const SALT = 'iitgn_salt_2024';
const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

export type User = {
  username: string;
  passwordHash: string;
  role: 'admin' | 'guest';
};

function ensureUsersFile() {
  const dir = path.dirname(USERS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    // Default admin: username=admin, password=admin123
    const defaultAdmin: User = {
      username: 'admin',
      passwordHash: hashPassword('admin123'),
      role: 'admin',
    };
    fs.writeFileSync(USERS_FILE, JSON.stringify([defaultAdmin], null, 2));
  }
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + SALT).digest('hex');
}

export function getUsers(): User[] {
  ensureUsersFile();
  const raw = fs.readFileSync(USERS_FILE, 'utf-8');
  return JSON.parse(raw) as User[];
}

export function saveUsers(users: User[]) {
  ensureUsersFile();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

export function findUser(username: string): User | undefined {
  return getUsers().find((u) => u.username.toLowerCase() === username.toLowerCase());
}

export function verifyPassword(username: string, password: string): User | null {
  const user = findUser(username);
  if (!user) return null;
  if (user.passwordHash === hashPassword(password)) return user;
  return null;
}

export function addAdmin(username: string, password: string): { ok: boolean; error?: string } {
  const users = getUsers();
  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    return { ok: false, error: 'Username already exists' };
  }
  if (username.trim().length < 3) {
    return { ok: false, error: 'Username must be at least 3 characters' };
  }
  if (password.length < 6) {
    return { ok: false, error: 'Password must be at least 6 characters' };
  }
  users.push({
    username: username.trim(),
    passwordHash: hashPassword(password),
    role: 'admin',
  });
  saveUsers(users);
  return { ok: true };
}
