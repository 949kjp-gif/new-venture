import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ── Guests ───────────────────────────────────────────────────────────────────

export const guests = pgTable("guests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  plusOne: boolean("plus_one").notNull().default(false),
  rsvp: text("rsvp").notNull().default("pending"),
  dietary: text("dietary").notNull().default(""),
  table: text("table_assignment").notNull().default(""),
  side: text("side").notNull().default("both"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertGuestSchema = createInsertSchema(guests).omit({
  id: true,
  userId: true,
  createdAt: true,
});
export type InsertGuest = z.infer<typeof insertGuestSchema>;
export type Guest = typeof guests.$inferSelect;

// ── Vendors ──────────────────────────────────────────────────────────────────

export const vendors = pgTable("vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  vendorName: text("vendor_name").notNull().default(""),
  contactName: text("contact_name").notNull().default(""),
  email: text("email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  status: text("status").notNull().default("searching"),
  depositAmount: text("deposit_amount").notNull().default(""),
  depositDue: text("deposit_due").notNull().default(""),
  finalAmount: text("final_amount").notNull().default(""),
  finalDue: text("final_due").notNull().default(""),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  userId: true,
  createdAt: true,
});
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendors.$inferSelect;

// ── Notes ────────────────────────────────────────────────────────────────────

export const notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull().default(""),
  content: text("content").notNull().default(""),
  tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;

// ── Milestones ───────────────────────────────────────────────────────────────

export const milestones = pgTable("milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  timeframe: text("timeframe").notNull(),
  done: boolean("done").notNull().default(false),
  targetDate: text("target_date"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertMilestoneSchema = createInsertSchema(milestones).omit({
  id: true,
  userId: true,
});
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;
export type Milestone = typeof milestones.$inferSelect;

// ── Planning Tasks ────────────────────────────────────────────────────────────

export const planningTasks = pgTable("planning_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category").notNull().default("General"),
  dueDate: text("due_date").notNull().default(""),
  assignee: text("assignee").notNull().default("self"),
  status: text("status").notNull().default("not_started"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPlanningTaskSchema = createInsertSchema(planningTasks).omit({
  id: true,
  userId: true,
  createdAt: true,
});
export type InsertPlanningTask = z.infer<typeof insertPlanningTaskSchema>;
export type PlanningTask = typeof planningTasks.$inferSelect;

// ── Payment Timeline ──────────────────────────────────────────────────────────

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  label: text("label").notNull(),
  amount: text("amount").notNull(),
  paid: boolean("paid").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  userId: true,
  createdAt: true,
});
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// ── Budget ───────────────────────────────────────────────────────────────────

export const budget = pgTable("budget", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  totalBudget: integer("total_budget").notNull().default(65000),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Budget = typeof budget.$inferSelect;

// ── Budget Categories ─────────────────────────────────────────────────────────

export const budgetCategories = pgTable("budget_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  target: integer("target").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertBudgetCategorySchema = createInsertSchema(budgetCategories).omit({
  id: true,
  userId: true,
});
export type InsertBudgetCategory = z.infer<typeof insertBudgetCategorySchema>;
export type BudgetCategory = typeof budgetCategories.$inferSelect;

// ── Budget Items ──────────────────────────────────────────────────────────────

export const budgetItems = pgTable("budget_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").notNull().references(() => budgetCategories.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  cost: integer("cost").notNull().default(0),
  paid: boolean("paid").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBudgetItemSchema = createInsertSchema(budgetItems).omit({
  id: true,
  userId: true,
  createdAt: true,
});
export type InsertBudgetItem = z.infer<typeof insertBudgetItemSchema>;
export type BudgetItem = typeof budgetItems.$inferSelect;
