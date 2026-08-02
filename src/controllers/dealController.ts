import { Request, Response } from 'express';
import { getDb } from '../config/db';

export async function getDeals(req: Request, res: Response) {
  try {
    const db = await getDb();
    const deals = await db.all('SELECT * FROM deals ORDER BY created_at DESC');

    const formattedDeals = deals.map(deal => ({
      id: deal.id,
      name: deal.name,
      category: deal.category,
      stage: deal.stage,
      description: deal.description,
      raising: deal.raising,
      valuation: deal.valuation,
      imageUrl: deal.image_url
    }));

    return res.status(200).json(formattedDeals);
  } catch (error: any) {
    console.error('Get deals error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function requestIntro(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const db = await getDb();

    const deal = await db.get('SELECT * FROM deals WHERE id = ?', id);
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Success response indicating request has been received
    return res.status(200).json({
      success: true,
      message: `Introduction request successfully sent for ${deal.name}.`
    });
  } catch (error: any) {
    console.error('Request intro error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
