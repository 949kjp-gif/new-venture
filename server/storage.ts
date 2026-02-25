import { randomUUID } from "crypto";
import {
  type User, type InsertUser,
  type Guest, type InsertGuest,
  type Vendor, type InsertVendor,
  type Note, type InsertNote,
  type Milestone, type InsertMilestone,
  type PlanningTask, type InsertPlanningTask,
  type Payment, type InsertPayment,
  type Budget,
  type BudgetCategory, type InsertBudgetCategory,
  type BudgetItem, type InsertBudgetItem,
} from "@shared/schema";

// ── Interface ────────────────────────────────────────────────────────────────

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Guests
  getGuests(userId: string): Promise<Guest[]>;
  createGuest(userId: string, guest: InsertGuest): Promise<Guest>;
  updateGuest(id: string, userId: string, data: Partial<InsertGuest>): Promise<Guest | undefined>;
  deleteGuest(id: string, userId: string): Promise<boolean>;

  // Vendors
  getVendors(userId: string): Promise<Vendor[]>;
  createVendor(userId: string, vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: string, userId: string, data: Partial<InsertVendor>): Promise<Vendor | undefined>;
  deleteVendor(id: string, userId: string): Promise<boolean>;

  // Notes
  getNotes(userId: string): Promise<Note[]>;
  createNote(userId: string, note: InsertNote): Promise<Note>;
  updateNote(id: string, userId: string, data: Partial<InsertNote> & { updatedAt?: Date }): Promise<Note | undefined>;
  deleteNote(id: string, userId: string): Promise<boolean>;

  // Milestones
  getMilestones(userId: string): Promise<Milestone[]>;
  createMilestone(userId: string, milestone: InsertMilestone): Promise<Milestone>;
  createMilestones(userId: string, milestones: InsertMilestone[]): Promise<Milestone[]>;
  updateMilestone(id: string, userId: string, data: Partial<InsertMilestone>): Promise<Milestone | undefined>;
  deleteMilestone(id: string, userId: string): Promise<boolean>;

  // Planning Tasks
  getPlanningTasks(userId: string): Promise<PlanningTask[]>;
  createPlanningTask(userId: string, task: InsertPlanningTask): Promise<PlanningTask>;
  updatePlanningTask(id: string, userId: string, data: Partial<InsertPlanningTask>): Promise<PlanningTask | undefined>;
  deletePlanningTask(id: string, userId: string): Promise<boolean>;

  // Payments
  getPayments(userId: string): Promise<Payment[]>;
  createPayment(userId: string, payment: InsertPayment): Promise<Payment>;
  createPayments(userId: string, payments: InsertPayment[]): Promise<Payment[]>;
  updatePayment(id: string, userId: string, data: Partial<InsertPayment>): Promise<Payment | undefined>;
  deletePayment(id: string, userId: string): Promise<boolean>;

  // Budget
  getBudget(userId: string): Promise<Budget | undefined>;
  upsertBudget(userId: string, totalBudget: number): Promise<Budget>;

  // Budget Categories
  getBudgetCategories(userId: string): Promise<BudgetCategory[]>;
  createBudgetCategory(userId: string, category: InsertBudgetCategory): Promise<BudgetCategory>;
  createBudgetCategories(userId: string, categories: InsertBudgetCategory[]): Promise<BudgetCategory[]>;
  updateBudgetCategory(id: string, userId: string, data: Partial<InsertBudgetCategory>): Promise<BudgetCategory | undefined>;
  deleteBudgetCategory(id: string, userId: string): Promise<boolean>;

  // Budget Items
  getBudgetItems(userId: string): Promise<BudgetItem[]>;
  getBudgetItemsByCategory(categoryId: string, userId: string): Promise<BudgetItem[]>;
  createBudgetItem(userId: string, item: InsertBudgetItem): Promise<BudgetItem>;
  updateBudgetItem(id: string, userId: string, data: Partial<InsertBudgetItem>): Promise<BudgetItem | undefined>;
  deleteBudgetItem(id: string, userId: string): Promise<boolean>;
}

// ── MemStorage ────────────────────────────────────────────────────────────────

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private guests: Map<string, Guest> = new Map();
  private vendors: Map<string, Vendor> = new Map();
  private notes: Map<string, Note> = new Map();
  private milestones: Map<string, Milestone> = new Map();
  private planningTasks: Map<string, PlanningTask> = new Map();
  private payments: Map<string, Payment> = new Map();
  private budgets: Map<string, Budget> = new Map(); // keyed by userId
  private budgetCategories: Map<string, BudgetCategory> = new Map();
  private budgetItems: Map<string, BudgetItem> = new Map();

  // ── Users ──────────────────────────────────────────────────────────────────

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // ── Guests ─────────────────────────────────────────────────────────────────

  async getGuests(userId: string): Promise<Guest[]> {
    return Array.from(this.guests.values())
      .filter((g) => g.userId === userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createGuest(userId: string, data: InsertGuest): Promise<Guest> {
    const id = randomUUID();
    const guest: Guest = {
      id,
      userId,
      name: data.name,
      plusOne: data.plusOne ?? false,
      rsvp: data.rsvp ?? "pending",
      dietary: data.dietary ?? "",
      table: data.table ?? "",
      side: data.side ?? "both",
      notes: data.notes ?? "",
      createdAt: new Date(),
    };
    this.guests.set(id, guest);
    return guest;
  }

  async updateGuest(id: string, userId: string, data: Partial<InsertGuest>): Promise<Guest | undefined> {
    const guest = this.guests.get(id);
    if (!guest || guest.userId !== userId) return undefined;
    const updated = { ...guest, ...data };
    this.guests.set(id, updated);
    return updated;
  }

  async deleteGuest(id: string, userId: string): Promise<boolean> {
    const guest = this.guests.get(id);
    if (!guest || guest.userId !== userId) return false;
    return this.guests.delete(id);
  }

  // ── Vendors ────────────────────────────────────────────────────────────────

  async getVendors(userId: string): Promise<Vendor[]> {
    return Array.from(this.vendors.values())
      .filter((v) => v.userId === userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createVendor(userId: string, data: InsertVendor): Promise<Vendor> {
    const id = randomUUID();
    const vendor: Vendor = {
      id,
      userId,
      category: data.category,
      vendorName: data.vendorName ?? "",
      contactName: data.contactName ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
      status: data.status ?? "searching",
      depositAmount: data.depositAmount ?? "",
      depositDue: data.depositDue ?? "",
      finalAmount: data.finalAmount ?? "",
      finalDue: data.finalDue ?? "",
      notes: data.notes ?? "",
      createdAt: new Date(),
    };
    this.vendors.set(id, vendor);
    return vendor;
  }

  async updateVendor(id: string, userId: string, data: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const vendor = this.vendors.get(id);
    if (!vendor || vendor.userId !== userId) return undefined;
    const updated = { ...vendor, ...data };
    this.vendors.set(id, updated);
    return updated;
  }

  async deleteVendor(id: string, userId: string): Promise<boolean> {
    const vendor = this.vendors.get(id);
    if (!vendor || vendor.userId !== userId) return false;
    return this.vendors.delete(id);
  }

  // ── Notes ──────────────────────────────────────────────────────────────────

  async getNotes(userId: string): Promise<Note[]> {
    return Array.from(this.notes.values())
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async createNote(userId: string, data: InsertNote): Promise<Note> {
    const id = randomUUID();
    const now = new Date();
    const note: Note = {
      id,
      userId,
      title: data.title ?? "",
      content: data.content ?? "",
      tags: data.tags ?? [],
      createdAt: now,
      updatedAt: now,
    };
    this.notes.set(id, note);
    return note;
  }

  async updateNote(id: string, userId: string, data: Partial<InsertNote> & { updatedAt?: Date }): Promise<Note | undefined> {
    const note = this.notes.get(id);
    if (!note || note.userId !== userId) return undefined;
    const updated: Note = {
      ...note,
      ...data,
      updatedAt: data.updatedAt ?? new Date(),
    };
    this.notes.set(id, updated);
    return updated;
  }

  async deleteNote(id: string, userId: string): Promise<boolean> {
    const note = this.notes.get(id);
    if (!note || note.userId !== userId) return false;
    return this.notes.delete(id);
  }

  // ── Milestones ─────────────────────────────────────────────────────────────

  async getMilestones(userId: string): Promise<Milestone[]> {
    return Array.from(this.milestones.values())
      .filter((m) => m.userId === userId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async createMilestone(userId: string, data: InsertMilestone): Promise<Milestone> {
    const id = randomUUID();
    const milestone: Milestone = {
      id,
      userId,
      label: data.label,
      timeframe: data.timeframe,
      done: data.done ?? false,
      targetDate: data.targetDate ?? null,
      sortOrder: data.sortOrder ?? 0,
    };
    this.milestones.set(id, milestone);
    return milestone;
  }

  async createMilestones(userId: string, items: InsertMilestone[]): Promise<Milestone[]> {
    return Promise.all(items.map((m) => this.createMilestone(userId, m)));
  }

  async updateMilestone(id: string, userId: string, data: Partial<InsertMilestone>): Promise<Milestone | undefined> {
    const milestone = this.milestones.get(id);
    if (!milestone || milestone.userId !== userId) return undefined;
    const updated = { ...milestone, ...data };
    this.milestones.set(id, updated);
    return updated;
  }

  async deleteMilestone(id: string, userId: string): Promise<boolean> {
    const milestone = this.milestones.get(id);
    if (!milestone || milestone.userId !== userId) return false;
    return this.milestones.delete(id);
  }

  // ── Planning Tasks ─────────────────────────────────────────────────────────

  async getPlanningTasks(userId: string): Promise<PlanningTask[]> {
    return Array.from(this.planningTasks.values())
      .filter((t) => t.userId === userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createPlanningTask(userId: string, data: InsertPlanningTask): Promise<PlanningTask> {
    const id = randomUUID();
    const task: PlanningTask = {
      id,
      userId,
      name: data.name,
      category: data.category ?? "General",
      dueDate: data.dueDate ?? "",
      assignee: data.assignee ?? "self",
      status: data.status ?? "not_started",
      createdAt: new Date(),
    };
    this.planningTasks.set(id, task);
    return task;
  }

  async updatePlanningTask(id: string, userId: string, data: Partial<InsertPlanningTask>): Promise<PlanningTask | undefined> {
    const task = this.planningTasks.get(id);
    if (!task || task.userId !== userId) return undefined;
    const updated = { ...task, ...data };
    this.planningTasks.set(id, updated);
    return updated;
  }

  async deletePlanningTask(id: string, userId: string): Promise<boolean> {
    const task = this.planningTasks.get(id);
    if (!task || task.userId !== userId) return false;
    return this.planningTasks.delete(id);
  }

  // ── Payments ───────────────────────────────────────────────────────────────

  async getPayments(userId: string): Promise<Payment[]> {
    return Array.from(this.payments.values())
      .filter((p) => p.userId === userId)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createPayment(userId: string, data: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const payment: Payment = {
      id,
      userId,
      date: data.date,
      label: data.label,
      amount: data.amount,
      paid: data.paid ?? false,
      sortOrder: data.sortOrder ?? 0,
      createdAt: new Date(),
    };
    this.payments.set(id, payment);
    return payment;
  }

  async createPayments(userId: string, items: InsertPayment[]): Promise<Payment[]> {
    return Promise.all(items.map((p) => this.createPayment(userId, p)));
  }

  async updatePayment(id: string, userId: string, data: Partial<InsertPayment>): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment || payment.userId !== userId) return undefined;
    const updated = { ...payment, ...data };
    this.payments.set(id, updated);
    return updated;
  }

  async deletePayment(id: string, userId: string): Promise<boolean> {
    const payment = this.payments.get(id);
    if (!payment || payment.userId !== userId) return false;
    return this.payments.delete(id);
  }

  // ── Budget ─────────────────────────────────────────────────────────────────

  async getBudget(userId: string): Promise<Budget | undefined> {
    return this.budgets.get(userId);
  }

  async upsertBudget(userId: string, totalBudget: number): Promise<Budget> {
    const existing = this.budgets.get(userId);
    const b: Budget = {
      id: existing?.id ?? randomUUID(),
      userId,
      totalBudget,
      updatedAt: new Date(),
    };
    this.budgets.set(userId, b);
    return b;
  }

  // ── Budget Categories ──────────────────────────────────────────────────────

  async getBudgetCategories(userId: string): Promise<BudgetCategory[]> {
    return Array.from(this.budgetCategories.values())
      .filter((c) => c.userId === userId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async createBudgetCategory(userId: string, data: InsertBudgetCategory): Promise<BudgetCategory> {
    const id = randomUUID();
    const cat: BudgetCategory = {
      id,
      userId,
      name: data.name,
      target: data.target ?? 0,
      sortOrder: data.sortOrder ?? 0,
    };
    this.budgetCategories.set(id, cat);
    return cat;
  }

  async createBudgetCategories(userId: string, items: InsertBudgetCategory[]): Promise<BudgetCategory[]> {
    return Promise.all(items.map((c) => this.createBudgetCategory(userId, c)));
  }

  async updateBudgetCategory(id: string, userId: string, data: Partial<InsertBudgetCategory>): Promise<BudgetCategory | undefined> {
    const cat = this.budgetCategories.get(id);
    if (!cat || cat.userId !== userId) return undefined;
    const updated = { ...cat, ...data };
    this.budgetCategories.set(id, updated);
    return updated;
  }

  async deleteBudgetCategory(id: string, userId: string): Promise<boolean> {
    const cat = this.budgetCategories.get(id);
    if (!cat || cat.userId !== userId) return false;
    // Also delete associated items
    for (const [itemId, item] of Array.from(this.budgetItems.entries())) {
      if (item.categoryId === id) this.budgetItems.delete(itemId);
    }
    return this.budgetCategories.delete(id);
  }

  // ── Budget Items ───────────────────────────────────────────────────────────

  async getBudgetItems(userId: string): Promise<BudgetItem[]> {
    return Array.from(this.budgetItems.values())
      .filter((i) => i.userId === userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getBudgetItemsByCategory(categoryId: string, userId: string): Promise<BudgetItem[]> {
    return Array.from(this.budgetItems.values())
      .filter((i) => i.categoryId === categoryId && i.userId === userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createBudgetItem(userId: string, data: InsertBudgetItem): Promise<BudgetItem> {
    const id = randomUUID();
    const item: BudgetItem = {
      id,
      categoryId: data.categoryId,
      userId,
      name: data.name,
      cost: data.cost ?? 0,
      paid: data.paid ?? false,
      createdAt: new Date(),
    };
    this.budgetItems.set(id, item);
    return item;
  }

  async updateBudgetItem(id: string, userId: string, data: Partial<InsertBudgetItem>): Promise<BudgetItem | undefined> {
    const item = this.budgetItems.get(id);
    if (!item || item.userId !== userId) return undefined;
    const updated = { ...item, ...data };
    this.budgetItems.set(id, updated);
    return updated;
  }

  async deleteBudgetItem(id: string, userId: string): Promise<boolean> {
    const item = this.budgetItems.get(id);
    if (!item || item.userId !== userId) return false;
    return this.budgetItems.delete(id);
  }
}

export const storage = new MemStorage();
