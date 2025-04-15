import { 
  User, InsertUser, FinancingTerm, InsertFinancingTerm, 
  HourPackage, InsertHourPackage, Quote, InsertQuote,
  users, financingTerms, hourPackages, quotes
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { eq, sql, count, desc, and, gte, gt } from "drizzle-orm";
import { pool } from "./db";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getAdminUsers(): Promise<User[]>;
  toggleUserAdmin(id: number): Promise<User>;
  deleteUser(id: number): Promise<void>;

  // Financing terms
  getAllFinancingTerms(): Promise<FinancingTerm[]>;
  createFinancingTerm(term: InsertFinancingTerm): Promise<FinancingTerm>;
  deleteFinancingTerm(id: number): Promise<void>;

  // Hour packages
  getAllHourPackages(): Promise<HourPackage[]>;
  createHourPackage(pkg: InsertHourPackage): Promise<HourPackage>;
  deleteHourPackage(id: number): Promise<void>;

  // Quotes
  createQuote(quote: InsertQuote): Promise<Quote>;
  getQuotesByUserId(userId: number): Promise<Quote[]>;
  getAllQuotes(): Promise<Quote[]>;

  // Statistics
  getStats(): Promise<{
    totalQuotes: number;
    activeUsers: number;
    monthlyQuotes: number;
    userStats: Array<{
      name: string;
      company: string;
      quoteCount: number;
      lastActivity: string;
    }>;
  }>;

  // Session store
  sessionStore: any; // Using any to avoid TypeScript errors with session.SessionStore
  
  // For database initialization
  initializeDatabase(): Promise<void>;
}

// Helper function to hash passwords
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  // Initialize the database with seed data if needed
  async initializeDatabase(): Promise<void> {
    // Check if there are any users
    const existingUsers = await db.select({ count: count() }).from(users);
    const userCount = existingUsers[0].count;

    // If no users exist, create admin user
    if (userCount === 0) {
      console.log("No users found. Creating admin user...");
      const hashedPassword = await hashPassword("admin123");
      
      await db.insert(users).values({
        username: "admin@example.com",
        password: hashedPassword,
        name: "Administrator",
        company: "Sistema de Cotización",
        isAdmin: true
      });
      console.log("Admin user created.");
    }

    // Check if financing terms exist
    const existingTerms = await db.select({ count: count() }).from(financingTerms);
    const termCount = existingTerms[0].count;

    // If no terms exist, create default ones
    if (termCount === 0) {
      console.log("No financing terms found. Creating default terms...");
      await db.insert(financingTerms).values([
        { months: 12, rate: 12.5 },
        { months: 24, rate: 14.0 },
        { months: 36, rate: 15.5 },
        { months: 48, rate: 16.8 }
      ]);
      console.log("Default financing terms created.");
    }

    // Check if hour packages exist
    const existingPackages = await db.select({ count: count() }).from(hourPackages);
    const packageCount = existingPackages[0].count;

    // If no packages exist, create default ones
    if (packageCount === 0) {
      console.log("No hour packages found. Creating default packages...");
      await db.insert(hourPackages).values([
        { name: "Básico", hours: 40, price: 2000000 },
        { name: "Estándar", hours: 80, price: 3800000 },
        { name: "Profesional", hours: 120, price: 5400000 },
        { name: "Empresarial", hours: 200, price: 8500000 }
      ]);
      console.log("Default hour packages created.");
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result.length > 0 ? result[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }
  
  async getAdminUsers(): Promise<User[]> {
    return db.select().from(users).where(eq(users.isAdmin, true));
  }

  async toggleUserAdmin(id: number): Promise<User> {
    const currentUser = await this.getUser(id);
    if (!currentUser) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const [updatedUser] = await db
      .update(users)
      .set({ isAdmin: !currentUser.isAdmin })
      .where(eq(users.id, id))
      .returning();
      
    return updatedUser;
  }

  async getUserQuotes(id: number): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(quotes)
      .where(eq(quotes.userId, id));
    return Number(result[0].count);
  }

  async deleteUser(id: number): Promise<{ hasQuotes: boolean }> {
    const quoteCount = await this.getUserQuotes(id);
    await db.update(users)
      .set({ isActive: false })
      .where(eq(users.id, id));
    return { hasQuotes: quoteCount > 0 };
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<void> {
    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, id));
  }

  // Financing terms methods
  async getAllFinancingTerms(): Promise<FinancingTerm[]> {
    return db.select().from(financingTerms);
  }

  async createFinancingTerm(term: InsertFinancingTerm): Promise<FinancingTerm> {
    const [financingTerm] = await db.insert(financingTerms).values(term).returning();
    return financingTerm;
  }

  async deleteFinancingTerm(id: number): Promise<void> {
    await db.delete(financingTerms).where(eq(financingTerms.id, id));
  }

  // Hour packages methods
  async getAllHourPackages(): Promise<HourPackage[]> {
    return db.select().from(hourPackages);
  }

  async createHourPackage(pkg: InsertHourPackage): Promise<HourPackage> {
    const [hourPackage] = await db.insert(hourPackages).values(pkg).returning();
    return hourPackage;
  }

  async deleteHourPackage(id: number): Promise<void> {
    await db.delete(hourPackages).where(eq(hourPackages.id, id));
  }

  // Quotes methods
  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const [quote] = await db.insert(quotes).values(insertQuote).returning();
    return quote;
  }

  async getQuotesByUserId(userId: number): Promise<Quote[]> {
    return db.select().from(quotes).where(eq(quotes.userId, userId));
  }

  async getAllQuotes(): Promise<Quote[]> {
    return db.select().from(quotes);
  }

  // Statistics methods
  async getStats(): Promise<{
    totalQuotes: number;
    activeUsers: number;
    monthlyQuotes: number;
    userStats: Array<{
      name: string;
      company: string;
      quoteCount: number;
      lastActivity: string;
    }>;
  }> {
    // Get total quotes count
    const totalQuotesResult = await db.select({ count: count() }).from(quotes);
    const totalQuotes = Number(totalQuotesResult[0].count) || 0;
    
    // Get active users count (users with at least one quote)
    const activeUsersQuery = sql`SELECT COUNT(DISTINCT user_id) as count FROM quotes`;
    const activeUsersResult = await db.execute(activeUsersQuery);
    const activeUsers = Number(activeUsersResult.rows[0]?.count) || 0;
    
    // Get monthly quotes count
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const monthlyQuotesResult = await db
      .select({ count: count() })
      .from(quotes)
      .where(gte(quotes.createdAt, oneMonthAgo));
    const monthlyQuotes = Number(monthlyQuotesResult[0].count) || 0;
    
    // Get user statistics
    const userStatsQuery = sql`
      SELECT 
        u.name, 
        u.company, 
        COUNT(q.id) as quote_count, 
        MAX(q.created_at::text) as last_activity
      FROM 
        users u
      LEFT JOIN 
        quotes q ON u.id = q.user_id
      GROUP BY 
        u.id
      HAVING 
        COUNT(q.id) > 0
      ORDER BY 
        COUNT(q.id) DESC
    `;
    
    const userStatsResult = await db.execute(userStatsQuery);
    const userStats = userStatsResult.rows.map(row => ({
      name: row.name as string,
      company: row.company as string,
      quoteCount: Number(row.quote_count) || 0,
      lastActivity: (row.last_activity as string || '').split('T')[0]
    }));
    
    return {
      totalQuotes,
      activeUsers,
      monthlyQuotes,
      userStats
    };
  }
}

export const storage = new DatabaseStorage();
