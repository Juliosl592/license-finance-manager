import { 
  User, InsertUser, FinancingTerm, InsertFinancingTerm, 
  HourPackage, InsertHourPackage, Quote, InsertQuote 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
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
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private financingTerms: Map<number, FinancingTerm>;
  private hourPackages: Map<number, HourPackage>;
  private quotes: Map<number, Quote>;
  private currentUserId: number;
  private currentFinancingTermId: number;
  private currentHourPackageId: number;
  private currentQuoteId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.financingTerms = new Map();
    this.hourPackages = new Map();
    this.quotes = new Map();
    this.currentUserId = 1;
    this.currentFinancingTermId = 1;
    this.currentHourPackageId = 1;
    this.currentQuoteId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });

    // Seed initial admin user
    this.createUser({
      username: "admin@example.com",
      password: "admin123",
      name: "Administrator",
      company: "Sistema de Cotización",
      isAdmin: true
    });

    // Seed financing terms
    this.createFinancingTerm({ months: 12, rate: 12.5 });
    this.createFinancingTerm({ months: 24, rate: 14.0 });
    this.createFinancingTerm({ months: 36, rate: 15.5 });
    this.createFinancingTerm({ months: 48, rate: 16.8 });

    // Seed hour packages
    this.createHourPackage({ name: "Básico", hours: 40, price: 2000000 });
    this.createHourPackage({ name: "Estándar", hours: 80, price: 3800000 });
    this.createHourPackage({ name: "Profesional", hours: 120, price: 5400000 });
    this.createHourPackage({ name: "Empresarial", hours: 200, price: 8500000 });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async toggleUserAdmin(id: number): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    user.isAdmin = !user.isAdmin;
    this.users.set(id, user);
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
  }

  // Financing terms methods
  async getAllFinancingTerms(): Promise<FinancingTerm[]> {
    return Array.from(this.financingTerms.values());
  }

  async createFinancingTerm(term: InsertFinancingTerm): Promise<FinancingTerm> {
    const id = this.currentFinancingTermId++;
    const financingTerm: FinancingTerm = { ...term, id };
    this.financingTerms.set(id, financingTerm);
    return financingTerm;
  }

  async deleteFinancingTerm(id: number): Promise<void> {
    this.financingTerms.delete(id);
  }

  // Hour packages methods
  async getAllHourPackages(): Promise<HourPackage[]> {
    return Array.from(this.hourPackages.values());
  }

  async createHourPackage(pkg: InsertHourPackage): Promise<HourPackage> {
    const id = this.currentHourPackageId++;
    const hourPackage: HourPackage = { ...pkg, id };
    this.hourPackages.set(id, hourPackage);
    return hourPackage;
  }

  async deleteHourPackage(id: number): Promise<void> {
    this.hourPackages.delete(id);
  }

  // Quotes methods
  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const id = this.currentQuoteId++;
    const now = new Date();
    const quote: Quote = { ...insertQuote, id, createdAt: now };
    this.quotes.set(id, quote);
    return quote;
  }

  async getQuotesByUserId(userId: number): Promise<Quote[]> {
    return Array.from(this.quotes.values()).filter(
      (quote) => quote.userId === userId
    );
  }

  async getAllQuotes(): Promise<Quote[]> {
    return Array.from(this.quotes.values());
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
    const allQuotes = Array.from(this.quotes.values());
    const allUsers = Array.from(this.users.values());
    
    // Calculate active users (users that have created quotes)
    const activeUserIds = new Set(allQuotes.map(quote => quote.userId));
    const activeUsers = activeUserIds.size;
    
    // Calculate monthly quotes
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const monthlyQuotes = allQuotes.filter(quote => quote.createdAt >= oneMonthAgo).length;
    
    // Calculate user statistics
    const userQuoteCounts = new Map<number, number>();
    const userLastActivities = new Map<number, Date>();
    
    allQuotes.forEach(quote => {
      // Count quotes per user
      const currentCount = userQuoteCounts.get(quote.userId) || 0;
      userQuoteCounts.set(quote.userId, currentCount + 1);
      
      // Track last activity
      const lastActivity = userLastActivities.get(quote.userId);
      if (!lastActivity || quote.createdAt > lastActivity) {
        userLastActivities.set(quote.userId, quote.createdAt);
      }
    });
    
    const userStats = allUsers
      .filter(user => userQuoteCounts.has(user.id))
      .map(user => ({
        name: user.name,
        company: user.company,
        quoteCount: userQuoteCounts.get(user.id) || 0,
        lastActivity: (userLastActivities.get(user.id) || new Date()).toISOString().split('T')[0],
      }))
      .sort((a, b) => b.quoteCount - a.quoteCount); // Sort by quote count (descending)
    
    return {
      totalQuotes: allQuotes.length,
      activeUsers,
      monthlyQuotes,
      userStats,
    };
  }
}

export const storage = new MemStorage();
