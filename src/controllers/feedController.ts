import { Request, Response } from 'express';
import { getDb } from '../config/db';

export async function getFeed(req: Request, res: Response) {
  try {
    const db = await getDb();
    const items = await db.all('SELECT * FROM feed_items ORDER BY created_at DESC');
    
    // Map db camelcase naming conventions to what frontend expects
    const formattedItems = items.map(item => ({
      id: item.id,
      name: item.name,
      handle: item.handle,
      description: item.description,
      videoUrl: item.video_url,
      likes: item.likes,
      comments: item.comments,
      founderAvatar: item.founder_avatar
    }));

    return res.status(200).json(formattedItems);
  } catch (error: any) {
    console.error('Get feed error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function likeFeedItem(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'like' or 'unlike'

    const db = await getDb();
    
    // Check if feed item exists
    const feedItem = await db.get('SELECT * FROM feed_items WHERE id = ?', id);
    if (!feedItem) {
      return res.status(404).json({ error: 'Feed item not found' });
    }

    const modifier = action === 'unlike' ? -1 : 1;
    const newLikes = Math.max(0, feedItem.likes + modifier);

    await db.run('UPDATE feed_items SET likes = ? WHERE id = ?', newLikes, id);

    return res.status(200).json({ id, likes: newLikes });
  } catch (error: any) {
    console.error('Like feed item error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
