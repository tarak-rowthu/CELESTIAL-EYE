import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';

export async function getSearchHistory(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user?.id;
  try {
    const history = await prisma.searchHistory.findMany({ where: { userId }, orderBy: { searchedAt: 'desc' }, take: 50 });
    res.json(history);
  } catch (err) { next(err); }
}

export async function addSearchHistory(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user?.id;
  const { query, latitude, longitude } = req.body;
  if (!query || latitude == null || longitude == null) {
    return res.status(400).json({ error: 'query, latitude, longitude required' });
  }
  try {
    const entry = await prisma.searchHistory.create({ data: { userId, query, latitude, longitude } });
    res.status(201).json(entry);
  } catch (err) { next(err); }
}

export async function clearSearchHistory(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user?.id;
  try {
    await prisma.searchHistory.deleteMany({ where: { userId } });
    res.sendStatus(204);
  } catch (err) { next(err); }
}
