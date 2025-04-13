import { pgTable, text, serial, integer, boolean, timestamp, jsonb, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("resident"),
  roomNumber: text("room_number"),
  phoneNumber: text("phone_number"),
  preferredLanguage: text("preferred_language").default("en"),
  upiId: text("upi_id"),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

// Rooms table
export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  roomNumber: text("room_number").notNull().unique(),
  residentId: text("resident_id"),
  residentName: text("resident_name"),
  contactNumber: text("contact_number"),
  monthlyFee: numeric("monthly_fee").notNull().default("1500"),
  totalDue: numeric("total_due").default("0"),
  dueDate: timestamp("due_date"),
  lastPaymentDate: timestamp("last_payment_date"),
  paymentsHistory: jsonb("payments_history"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertRoomSchema = createInsertSchema(rooms).omit({
  id: true,
  createdAt: true
});

// Payments table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  roomNumber: text("room_number").notNull(),
  amount: numeric("amount").notNull(),
  date: timestamp("date").notNull(),
  method: text("method").notNull(),
  status: text("status").notNull().default("pending"),
  receiptURL: text("receipt_url"),
  notes: text("notes"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true
});

// Expenses table
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  amount: numeric("amount").notNull(),
  category: text("category").notNull(),
  date: timestamp("date").notNull(),
  description: text("description"),
  receiptURL: text("receipt_url"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true
});

// Settings table
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Room = typeof rooms.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
