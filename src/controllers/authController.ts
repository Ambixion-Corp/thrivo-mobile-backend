import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../config/db';

export async function signup(req: Request, res: Response) {
  try {
    const { email, password, role, name } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    const db = await getDb();
    
    // Check if user already exists
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', email);
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = `user_${Math.random().toString(36).substr(2, 9)}`;
    const userName = name || email.split('@')[0];

    // Insert user
    await db.run(
      'INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)',
      userId,
      email,
      passwordHash,
      userName,
      role
    );

    // Create JWT
    const secret = process.env.JWT_SECRET || 'super_secret_thrivo_key_2026';
    const token = jwt.sign({ id: userId, email, role }, secret, { expiresIn: '7d' });

    return res.status(201).json({
      token,
      user: { id: userId, email, role, name: userName }
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = await getDb();
    
    // Find user
    const user = await db.get('SELECT * FROM users WHERE email = ?', email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create JWT
    const secret = process.env.JWT_SECRET || 'super_secret_thrivo_key_2026';
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, secret, { expiresIn: '7d' });

    return res.status(200).json({
      token,
      user: { id: user.id, email: user.email, role: user.role, name: user.name }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
