import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { User } from '../src/types';

// Tokens are self-contained so they survive server restarts and page refreshes.
interface SessionTokenPayload {
  userId: string;
  expiresAt: number;
}

class TokenManager {
  createToken(userId: string): string {
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours validity
    const payload: SessionTokenPayload = { userId, expiresAt };
    return 'jwt_' + Buffer.from(JSON.stringify(payload)).toString('base64url');
  }

  getUserByToken(token: string): User | undefined {
    if (!token.startsWith('jwt_')) {
      return undefined;
    }

    try {
      const rawPayload = token.slice(4);
      const decoded = JSON.parse(Buffer.from(rawPayload, 'base64url').toString('utf8')) as SessionTokenPayload;

      if (!decoded?.userId || !decoded?.expiresAt) {
        return undefined;
      }

      if (Date.now() > decoded.expiresAt) {
        return undefined;
      }

      return db.getUserById(decoded.userId);
    } catch {
      return undefined;
    }
  }

  invalidateToken(_token: string) {
    // Stateless tokens do not need server-side invalidation bookkeeping.
  }
}

export const tokenManager = new TokenManager();

// Extend the Express Request type to include the authenticated user
export interface AuthenticatedRequest extends Request {
  user?: User;
}

/**
 * Middleware to authenticate requests via Bearer token
 */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Missing token.' });
    return;
  }

  const user = tokenManager.getUserByToken(token);
  if (!user) {
    res.status(403).json({ error: 'Invalid or expired authentication token.' });
    return;
  }

  req.user = user;
  next();
}

/**
 * Middleware to restrict routes to admin users only
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  authenticateToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Admin access required. Access denied.' });
    }
  });
}
