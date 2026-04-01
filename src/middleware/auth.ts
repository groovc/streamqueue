import { Request, Response, NextFunction } from "express";
import { pool } from "../db";
import { User } from "../models/types";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Simple token-based auth middleware.
 * Expects header: Authorization: Bearer tok_xxx
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE api_token = $1",
      [token]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    req.user = result.rows[0] as User;
    next();
  } catch (err) {
    next(err);
  }
}
