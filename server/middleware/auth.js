import session from "express-session";
import SqliteStoreFactory from "better-sqlite3-session-store";
import { db } from "../db.js";
import { logger } from "../lib/logger.js";

const SqliteStore = SqliteStoreFactory(session);
const SESSION_TTL_MS = 10 * 60 * 1000;

// express-session owns cookie issuance/parsing and the session lifecycle;
// the SQLite store just persists `req.session` data across server restarts
// in its own `sessions` table (separate from our app tables in db.js).
export const sessionMiddleware = session({
  store: new SqliteStore({ client: db, expired: { clear: true, intervalMs: 15 * 60 * 1000 } }),
  secret: process.env.SESSION_SECRET ?? "dev-only-secret-change-me",
  name: "session_token",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: SESSION_TTL_MS, httpOnly: true, sameSite: "lax" }
});

// Applied to every /api route except auth. express-session has already
// parsed the cookie into req.session by this point; we just check it
// carries a logged-in user.
export function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    logger.warn("rejected unauthenticated request", { path: req.path });
    return res.status(401).json({ error: "Not authenticated" });
  }
  req.userId = req.session.userId;
  next();
}
