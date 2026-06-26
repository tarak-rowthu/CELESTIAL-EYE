import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';

export async function getFavoriteLocations(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user?.id;
  try {
    const favorites = await prisma.favoriteLocation.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    res.json(favorites);
  } catch (err) { next(err); }
}

export async function addFavoriteLocation(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user?.id;
  const { label, latitude, longitude } = req.body;
  if (!label || latitude == null || longitude == null) {
    return res.status(400).json({ error: 'label, latitude, longitude required' });
  }
  try {
    const fav = await prisma.favoriteLocation.create({ data: { userId, label, latitude, longitude } });
    res.status(201).json(fav);
  } catch (err) { next(err); }
}

export async function deleteFavoriteLocation(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user?.id;
  const { id } = req.params;
  try {
    const existing = await prisma.favoriteLocation.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    await prisma.favoriteLocation.delete({ where: { id } });
    res.sendStatus(204);
  } catch (err) { next(err); }
}

export async function getFavoriteObjects(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user?.id;
  try {
    const favObjects = await prisma.favoriteObject.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    res.json(favObjects);
  } catch (err) { next(err); }
}

export async function addFavoriteObject(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user?.id;
  const { objectId, objectType } = req.body;
  if (!objectId || !objectType) {
    return res.status(400).json({ error: 'objectId and objectType required' });
  }
  try {
    const fav = await prisma.favoriteObject.create({ data: { userId, objectId, objectType } });
    res.status(201).json(fav);
  } catch (err) { next(err); }
}

export async function deleteFavoriteObject(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user?.id;
  const { id } = req.params;
  try {
    const existing = await prisma.favoriteObject.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    await prisma.favoriteObject.delete({ where: { id } });
    res.sendStatus(204);
  } catch (err) { next(err); }
}
