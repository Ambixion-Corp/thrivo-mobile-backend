import { getDb } from '../config/db';

export async function initDb() {
  const db = await getDb();

  // Create Users Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      password_hash TEXT,
      name TEXT,
      role TEXT CHECK(role IN ('founder', 'investor', 'creator', 'consumer')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Feed Items Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS feed_items (
      id TEXT PRIMARY KEY,
      name TEXT,
      handle TEXT,
      description TEXT,
      video_url TEXT,
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      founder_avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Deals Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS deals (
      id TEXT PRIMARY KEY,
      name TEXT,
      category TEXT,
      stage TEXT,
      description TEXT,
      raising TEXT,
      valuation TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed default feed items if empty
  const feedCount = await db.get('SELECT COUNT(*) as count FROM feed_items');
  if (feedCount.count === 0) {
    await db.run(
      `INSERT INTO feed_items (id, name, handle, description, video_url, likes, comments, founder_avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      '1',
      'Founder',
      '@Founder0',
      'Building the future of sustainable architecture. We use AI to optimize material usage, cutting waste by 30%.',
      'https://images.unsplash.com/photo-1541888079634-9134a652e008?auto=format&fit=crop&w=800&q=80',
      1174,
      39,
      'https://i.pravatar.cc/150?img=11'
    );

    await db.run(
      `INSERT INTO feed_items (id, name, handle, description, video_url, likes, comments, founder_avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      '2',
      'Sarah',
      '@SarahTech',
      'Revolutionizing remote work with our new virtual collaboration platform. Say goodbye to zoom fatigue.',
      'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80',
      892,
      12,
      'https://i.pravatar.cc/150?img=5'
    );
  }

  // Seed default deals if empty
  const dealCount = await db.get('SELECT COUNT(*) as count FROM deals');
  if (dealCount.count === 0) {
    await db.run(
      `INSERT INTO deals (id, name, category, stage, description, raising, valuation, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      '1',
      'Quantum Metrics',
      'SaaS / Analytics',
      'Series A',
      'AI-driven predictive analytics for enterprise supply chains. Currently generating $120k MRR with 140% YoY growth.',
      '$4M',
      '$20M',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'
    );
  }
}
