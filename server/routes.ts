import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { storage } from "./storage";
import { hashPassword } from "./auth";
import { insertUserSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // GET /api/user — return current user or 401
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    return res.json(req.user);
  });

  // POST /api/register — create account and log in
  app.post("/api/register", async (req, res, next) => {
    try {
      const parsed = insertUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
      }
      const { username, password } = parsed.data;

      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const user = await storage.createUser({
        username,
        password: await hashPassword(password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(201).json(user);
      });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/login — authenticate with passport local
  app.post("/api/login", (req, res, next) => {
    passport.authenticate(
      "local",
      (err: unknown, user: Express.User | false, info: { message: string } | undefined) => {
        if (err) return next(err);
        if (!user) {
          return res.status(401).json({ message: info?.message || "Invalid credentials" });
        }
        req.login(user, (err) => {
          if (err) return next(err);
          return res.json(user);
        });
      }
    )(req, res, next);
  });

  // POST /api/logout
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      return res.json({ ok: true });
    });
  });

  return httpServer;
}
