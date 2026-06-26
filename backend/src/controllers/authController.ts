// backend/src/controllers/authController.ts
import type { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { name, email, password } = req.body as {
    name?: string; email?: string; password?: string;
  };
  if (!name || !email || !password) {
    res.status(400).json({ error: 'name, email, and password are required.' });
    return;
  }
  try {
    const user = await authService.registerUser(name, email, password);
    const tokens = await authService.loginUser(email, password);
    res.status(201).json({ user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required.' });
    return;
  }
  try {
    const tokens = await authService.loginUser(email, password);
    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: tokens.user,
    });
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { token } = req.body as { token?: string };
  if (!token) {
    res.status(400).json({ error: 'token is required.' });
    return;
  }
  try {
    const newTokens = await authService.refreshAccessToken(token);
    res.json(newTokens);
  } catch (err) {
    next(err);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { token } = req.body as { token?: string };
  if (!token) {
    res.status(400).json({ error: 'token is required.' });
    return;
  }
  try {
    await authService.revokeRefreshToken(token);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

export async function profile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const userId = (req as Request & { user?: { id: string } }).user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Unauthenticated.' });
    return;
  }
  try {
    const user = await authService.getUserById(userId);
    if (!user) { res.status(404).json({ error: 'User not found.' }); return; }
    res.json(user);
  } catch (err) {
    next(err);
  }
}
