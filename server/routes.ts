import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertFinancingTermSchema, insertHourPackageSchema, insertQuoteSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize the database with seed data if needed
  await storage.initializeDatabase();

  // Set up authentication routes
  setupAuth(app);

  // Financing terms endpoints
  app.get("/api/financing-terms", async (req, res) => {
    const terms = await storage.getAllFinancingTerms();
    res.json(terms);
  });

  app.post("/api/financing-terms", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const data = insertFinancingTermSchema.parse(req.body);
      const newTerm = await storage.createFinancingTerm(data);
      res.status(201).json(newTerm);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.delete("/api/financing-terms/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    await storage.deleteFinancingTerm(id);
    res.status(200).json({ message: "Term deleted" });
  });

  // Hour packages endpoints
  app.get("/api/hour-packages", async (req, res) => {
    const packages = await storage.getAllHourPackages();
    res.json(packages);
  });

  app.post("/api/hour-packages", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const data = insertHourPackageSchema.parse(req.body);
      const newPackage = await storage.createHourPackage(data);
      res.status(201).json(newPackage);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.delete("/api/hour-packages/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    await storage.deleteHourPackage(id);
    res.status(200).json({ message: "Package deleted" });
  });

  // Quotes endpoints
  app.post("/api/quotes", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const data = insertQuoteSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      const newQuote = await storage.createQuote(data);
      res.status(201).json(newQuote);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.get("/api/quotes", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.isAdmin) {
      const quotes = await storage.getAllQuotes();
      res.json(quotes);
    } else {
      const quotes = await storage.getQuotesByUserId(req.user.id);
      res.json(quotes);
    }
  });

  // User management (admin only)
  app.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.patch("/api/users/:id/toggle-admin", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const updatedUser = await storage.toggleUserAdmin(id);
    res.json(updatedUser);
  });

  app.delete("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      return res.status(400).json({ message: "Cannot delete yourself" });
    }

    await storage.deleteUser(id);
    res.status(200).json({ message: "User deleted" });
  });

  // Report statistics (admin only)
  app.get("/api/stats", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const stats = await storage.getStats();
    res.json(stats);
  });

  const httpServer = createServer(app);
  return httpServer;
}
