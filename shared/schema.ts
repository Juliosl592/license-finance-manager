import { pgTable, text, serial, integer, boolean, real, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  company: text("company").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const financingTerms = pgTable("financing_terms", {
  id: serial("id").primaryKey(),
  months: integer("months").notNull(),
  rate: real("rate").notNull(),
});

export const hourPackages = pgTable("hour_packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  hours: integer("hours").notNull(),
  price: integer("price").notNull(),
});

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  licenseQty: integer("license_qty").notNull(),
  licensePrice: integer("license_price").notNull(),
  selectedLicenseOption: text("selected_license_option").notNull(),
  selectedHourOption: text("selected_hour_option").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  quotes: many(quotes),
}));

export const quotesRelations = relations(quotes, ({ one }) => ({
  user: one(users, {
    fields: [quotes.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertFinancingTermSchema = createInsertSchema(financingTerms).omit({
  id: true,
});

export const insertHourPackageSchema = createInsertSchema(hourPackages).omit({
  id: true,
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertFinancingTerm = z.infer<typeof insertFinancingTermSchema>;
export type FinancingTerm = typeof financingTerms.$inferSelect;

export type InsertHourPackage = z.infer<typeof insertHourPackageSchema>;
export type HourPackage = typeof hourPackages.$inferSelect;

export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotes.$inferSelect;

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginData = z.infer<typeof loginSchema>;
