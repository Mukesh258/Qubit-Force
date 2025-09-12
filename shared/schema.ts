import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json, integer, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  userType: varchar("user_type", { length: 20 }).notNull(), // 'citizen' or 'agency'
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  agencyName: varchar("agency_name", { length: 255 }), // for agency users
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
});

// Sessions table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  caseId: varchar("case_id", { length: 20 }).notNull().unique(), // New case ID field
  reportType: varchar("report_type", { length: 50 }).notNull(),
  urgencyLevel: varchar("urgency_level", { length: 20 }).notNull(),
  description: text("description").notNull(),
  location: text("location"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  encryptedData: text("encrypted_data").notNull(),
  quantumKeyId: varchar("quantum_key_id", { length: 100 }),
  blockchainHash: varchar("blockchain_hash", { length: 100 }),
  status: varchar("status", { length: 20 }).default("submitted"),
  submittedBy: varchar("submitted_by").references(() => users.id), // Optional user reference
  assignedTo: varchar("assigned_to").references(() => users.id), // Agency assignment
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  caseId: varchar("case_id", { length: 20 }).notNull(), // Use case ID instead of session ID
  reportId: varchar("report_id").references(() => reports.id),
  message: text("message").notNull(),
  encryptedMessage: text("encrypted_message").notNull(),
  senderId: varchar("sender_id").references(() => users.id),
  senderType: varchar("sender_type", { length: 20 }).notNull(), // 'citizen' or 'agency'
  isRead: boolean("is_read").default(false),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const quantumKeys = pgTable("quantum_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  keyData: text("key_data").notNull(),
  algorithm: varchar("algorithm", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
});

export const blockchainLogs = pgTable("blockchain_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reportId: varchar("report_id").references(() => reports.id),
  transactionHash: varchar("transaction_hash", { length: 100 }).notNull(),
  blockNumber: integer("block_number"),
  timestamp: timestamp("timestamp").defaultNow(),
  verified: boolean("verified").default(false),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isActive: true,
  createdAt: true,
  lastLoginAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  caseId: true,
  encryptedData: true,
  quantumKeyId: true,
  blockchainHash: true,
  status: true,
  submittedBy: true,
  assignedTo: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  encryptedMessage: true,
  senderId: true,
  isRead: true,
  timestamp: true,
});

export const insertQuantumKeySchema = createInsertSchema(quantumKeys).omit({
  id: true,
  createdAt: true,
  expiresAt: true,
  isActive: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type QuantumKey = typeof quantumKeys.$inferSelect;
export type InsertQuantumKey = z.infer<typeof insertQuantumKeySchema>;
export type BlockchainLog = typeof blockchainLogs.$inferSelect;

// Auth schemas
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  userType: z.enum(["citizen", "agency"]),
});

export const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
