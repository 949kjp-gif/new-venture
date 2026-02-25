import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { storage } from "./storage";
import { hashPassword } from "./auth";
import {
  insertUserSchema,
  insertGuestSchema,
  insertVendorSchema,
  insertNoteSchema,
  insertMilestoneSchema,
  insertPlanningTaskSchema,
  insertPaymentSchema,
  insertBudgetCategorySchema,
  insertBudgetItemSchema,
} from "@shared/schema";
import { z } from "zod";

// ── Auth guard ───────────────────────────────────────────────────────────────

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

function userId(req: Request): string {
  return (req.user as { id: string }).id;
}

function pid(req: Request): string {
  return String(req.params["id"]);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ── Auth ────────────────────────────────────────────────────────────────────

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    return res.json(req.user);
  });

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

  app.post("/api/login", (req, res, next) => {
    passport.authenticate(
      "local",
      (err: unknown, user: Express.User | false, info: { message: string } | undefined) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ message: info?.message || "Invalid credentials" });
        req.login(user, (err) => {
          if (err) return next(err);
          return res.json(user);
        });
      }
    )(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      return res.json({ ok: true });
    });
  });

  // ── Guests ──────────────────────────────────────────────────────────────────

  app.get("/api/guests", requireAuth, async (req, res, next) => {
    try {
      const guests = await storage.getGuests(userId(req));
      res.json(guests);
    } catch (err) { next(err); }
  });

  app.post("/api/guests", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertGuestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
      }
      const guest = await storage.createGuest(userId(req), parsed.data);
      res.status(201).json(guest);
    } catch (err) { next(err); }
  });

  app.put("/api/guests/:id", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertGuestSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
      }
      const guest = await storage.updateGuest(pid(req), userId(req), parsed.data);
      if (!guest) return res.status(404).json({ message: "Guest not found" });
      res.json(guest);
    } catch (err) { next(err); }
  });

  app.delete("/api/guests/:id", requireAuth, async (req, res, next) => {
    try {
      const ok = await storage.deleteGuest(pid(req), userId(req));
      if (!ok) return res.status(404).json({ message: "Guest not found" });
      res.json({ ok: true });
    } catch (err) { next(err); }
  });

  // ── Vendors ─────────────────────────────────────────────────────────────────

  app.get("/api/vendors", requireAuth, async (req, res, next) => {
    try {
      const vendors = await storage.getVendors(userId(req));
      res.json(vendors);
    } catch (err) { next(err); }
  });

  app.post("/api/vendors", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertVendorSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
      }
      const vendor = await storage.createVendor(userId(req), parsed.data);
      res.status(201).json(vendor);
    } catch (err) { next(err); }
  });

  app.put("/api/vendors/:id", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertVendorSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
      }
      const vendor = await storage.updateVendor(pid(req), userId(req), parsed.data);
      if (!vendor) return res.status(404).json({ message: "Vendor not found" });
      res.json(vendor);
    } catch (err) { next(err); }
  });

  app.delete("/api/vendors/:id", requireAuth, async (req, res, next) => {
    try {
      const ok = await storage.deleteVendor(pid(req), userId(req));
      if (!ok) return res.status(404).json({ message: "Vendor not found" });
      res.json({ ok: true });
    } catch (err) { next(err); }
  });

  // ── Notes ───────────────────────────────────────────────────────────────────

  app.get("/api/notes", requireAuth, async (req, res, next) => {
    try {
      const notes = await storage.getNotes(userId(req));
      res.json(notes);
    } catch (err) { next(err); }
  });

  app.post("/api/notes", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertNoteSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
      }
      const note = await storage.createNote(userId(req), parsed.data);
      res.status(201).json(note);
    } catch (err) { next(err); }
  });

  app.put("/api/notes/:id", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertNoteSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
      }
      const note = await storage.updateNote(pid(req), userId(req), {
        ...parsed.data,
        updatedAt: new Date(),
      });
      if (!note) return res.status(404).json({ message: "Note not found" });
      res.json(note);
    } catch (err) { next(err); }
  });

  app.delete("/api/notes/:id", requireAuth, async (req, res, next) => {
    try {
      const ok = await storage.deleteNote(pid(req), userId(req));
      if (!ok) return res.status(404).json({ message: "Note not found" });
      res.json({ ok: true });
    } catch (err) { next(err); }
  });

  // ── Milestones ──────────────────────────────────────────────────────────────

  app.get("/api/milestones", requireAuth, async (req, res, next) => {
    try {
      const ms = await storage.getMilestones(userId(req));
      res.json(ms);
    } catch (err) { next(err); }
  });

  // POST /api/milestones — create one or many (array for bulk seed)
  app.post("/api/milestones", requireAuth, async (req, res, next) => {
    try {
      if (Array.isArray(req.body)) {
        const parsed = z.array(insertMilestoneSchema).safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({ message: parsed.error.issues[0].message });
        }
        const ms = await storage.createMilestones(userId(req), parsed.data);
        return res.status(201).json(ms);
      }
      const parsed = insertMilestoneSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
      }
      const ms = await storage.createMilestone(userId(req), parsed.data);
      res.status(201).json(ms);
    } catch (err) { next(err); }
  });

  app.patch("/api/milestones/:id", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertMilestoneSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
      }
      const ms = await storage.updateMilestone(pid(req), userId(req), parsed.data);
      if (!ms) return res.status(404).json({ message: "Milestone not found" });
      res.json(ms);
    } catch (err) { next(err); }
  });

  app.delete("/api/milestones/:id", requireAuth, async (req, res, next) => {
    try {
      const ok = await storage.deleteMilestone(pid(req), userId(req));
      if (!ok) return res.status(404).json({ message: "Milestone not found" });
      res.json({ ok: true });
    } catch (err) { next(err); }
  });

  // ── Planning Tasks ──────────────────────────────────────────────────────────

  app.get("/api/planning-tasks", requireAuth, async (req, res, next) => {
    try {
      const tasks = await storage.getPlanningTasks(userId(req));
      res.json(tasks);
    } catch (err) { next(err); }
  });

  app.post("/api/planning-tasks", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertPlanningTaskSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
      }
      const task = await storage.createPlanningTask(userId(req), parsed.data);
      res.status(201).json(task);
    } catch (err) { next(err); }
  });

  app.put("/api/planning-tasks/:id", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertPlanningTaskSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
      }
      const task = await storage.updatePlanningTask(pid(req), userId(req), parsed.data);
      if (!task) return res.status(404).json({ message: "Task not found" });
      res.json(task);
    } catch (err) { next(err); }
  });

  app.delete("/api/planning-tasks/:id", requireAuth, async (req, res, next) => {
    try {
      const ok = await storage.deletePlanningTask(pid(req), userId(req));
      if (!ok) return res.status(404).json({ message: "Task not found" });
      res.json({ ok: true });
    } catch (err) { next(err); }
  });

  // ── Payment Timeline ────────────────────────────────────────────────────────

  app.get("/api/payments", requireAuth, async (req, res, next) => {
    try {
      const payments = await storage.getPayments(userId(req));
      res.json(payments);
    } catch (err) { next(err); }
  });

  // POST /api/payments — create one or many (array for bulk seed)
  app.post("/api/payments", requireAuth, async (req, res, next) => {
    try {
      if (Array.isArray(req.body)) {
        const parsed = z.array(insertPaymentSchema).safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({ message: parsed.error.issues[0].message });
        }
        const ps = await storage.createPayments(userId(req), parsed.data);
        return res.status(201).json(ps);
      }
      const parsed = insertPaymentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
      }
      const p = await storage.createPayment(userId(req), parsed.data);
      res.status(201).json(p);
    } catch (err) { next(err); }
  });

  app.put("/api/payments/:id", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertPaymentSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
      }
      const p = await storage.updatePayment(pid(req), userId(req), parsed.data);
      if (!p) return res.status(404).json({ message: "Payment not found" });
      res.json(p);
    } catch (err) { next(err); }
  });

  app.delete("/api/payments/:id", requireAuth, async (req, res, next) => {
    try {
      const ok = await storage.deletePayment(pid(req), userId(req));
      if (!ok) return res.status(404).json({ message: "Payment not found" });
      res.json({ ok: true });
    } catch (err) { next(err); }
  });

  // ── Budget ──────────────────────────────────────────────────────────────────

  app.get("/api/budget", requireAuth, async (req, res, next) => {
    try {
      const b = await storage.getBudget(userId(req));
      res.json(b ?? { totalBudget: 65000 });
    } catch (err) { next(err); }
  });

  app.put("/api/budget", requireAuth, async (req, res, next) => {
    try {
      const schema = z.object({ totalBudget: z.number().int().positive() });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
      }
      const b = await storage.upsertBudget(userId(req), parsed.data.totalBudget);
      res.json(b);
    } catch (err) { next(err); }
  });

  // ── Budget Categories ───────────────────────────────────────────────────────

  app.get("/api/budget/categories", requireAuth, async (req, res, next) => {
    try {
      const cats = await storage.getBudgetCategories(userId(req));
      res.json(cats);
    } catch (err) { next(err); }
  });

  // POST /api/budget/categories — create one or many (array for bulk seed)
  app.post("/api/budget/categories", requireAuth, async (req, res, next) => {
    try {
      if (Array.isArray(req.body)) {
        const parsed = z.array(insertBudgetCategorySchema).safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({ message: parsed.error.issues[0].message });
        }
        const cats = await storage.createBudgetCategories(userId(req), parsed.data);
        return res.status(201).json(cats);
      }
      const parsed = insertBudgetCategorySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
      }
      const cat = await storage.createBudgetCategory(userId(req), parsed.data);
      res.status(201).json(cat);
    } catch (err) { next(err); }
  });

  app.put("/api/budget/categories/:id", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertBudgetCategorySchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
      }
      const cat = await storage.updateBudgetCategory(pid(req), userId(req), parsed.data);
      if (!cat) return res.status(404).json({ message: "Category not found" });
      res.json(cat);
    } catch (err) { next(err); }
  });

  app.delete("/api/budget/categories/:id", requireAuth, async (req, res, next) => {
    try {
      const ok = await storage.deleteBudgetCategory(pid(req), userId(req));
      if (!ok) return res.status(404).json({ message: "Category not found" });
      res.json({ ok: true });
    } catch (err) { next(err); }
  });

  // ── Budget Items ────────────────────────────────────────────────────────────

  app.get("/api/budget/items", requireAuth, async (req, res, next) => {
    try {
      const items = await storage.getBudgetItems(userId(req));
      res.json(items);
    } catch (err) { next(err); }
  });

  app.post("/api/budget/items", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertBudgetItemSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
      }
      // Verify the category belongs to this user
      const cats = await storage.getBudgetCategories(userId(req));
      const catExists = cats.some((c) => c.id === parsed.data.categoryId);
      if (!catExists) {
        return res.status(400).json({ message: "Category not found" });
      }
      const item = await storage.createBudgetItem(userId(req), parsed.data);
      res.status(201).json(item);
    } catch (err) { next(err); }
  });

  app.put("/api/budget/items/:id", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertBudgetItemSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
      }
      const item = await storage.updateBudgetItem(pid(req), userId(req), parsed.data);
      if (!item) return res.status(404).json({ message: "Budget item not found" });
      res.json(item);
    } catch (err) { next(err); }
  });

  app.delete("/api/budget/items/:id", requireAuth, async (req, res, next) => {
    try {
      const ok = await storage.deleteBudgetItem(pid(req), userId(req));
      if (!ok) return res.status(404).json({ message: "Budget item not found" });
      res.json({ ok: true });
    } catch (err) { next(err); }
  });

  return httpServer;
}
