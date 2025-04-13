import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertRoomSchema, 
  insertPaymentSchema, 
  insertExpenseSchema,
  insertSettingSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to get users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Room routes
  app.get("/api/rooms", async (req, res) => {
    try {
      const rooms = await storage.getAllRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: "Failed to get rooms" });
    }
  });

  app.get("/api/rooms/:id", async (req, res) => {
    try {
      const room = await storage.getRoom(parseInt(req.params.id));
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      res.json(room);
    } catch (error) {
      res.status(500).json({ message: "Failed to get room" });
    }
  });

  app.get("/api/rooms/number/:roomNumber", async (req, res) => {
    try {
      const room = await storage.getRoomByNumber(req.params.roomNumber);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      res.json(room);
    } catch (error) {
      res.status(500).json({ message: "Failed to get room" });
    }
  });

  app.post("/api/rooms", async (req, res) => {
    try {
      const roomData = insertRoomSchema.parse(req.body);
      const room = await storage.createRoom(roomData);
      res.status(201).json(room);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid room data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create room" });
    }
  });

  app.put("/api/rooms/:id", async (req, res) => {
    try {
      const roomData = insertRoomSchema.partial().parse(req.body);
      const room = await storage.updateRoom(parseInt(req.params.id), roomData);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      res.json(room);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid room data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update room" });
    }
  });

  // Payment routes
  app.get("/api/payments", async (req, res) => {
    try {
      const payments = await storage.getAllPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to get payments" });
    }
  });

  app.get("/api/payments/:id", async (req, res) => {
    try {
      const payment = await storage.getPayment(parseInt(req.params.id));
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.json(payment);
    } catch (error) {
      res.status(500).json({ message: "Failed to get payment" });
    }
  });

  app.get("/api/payments/room/:roomNumber", async (req, res) => {
    try {
      const payments = await storage.getPaymentsByRoomNumber(req.params.roomNumber);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to get payments" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      res.status(201).json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid payment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  app.put("/api/payments/:id", async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.partial().parse(req.body);
      const payment = await storage.updatePayment(parseInt(req.params.id), paymentData);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid payment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update payment" });
    }
  });

  // Expense routes
  app.get("/api/expenses", async (req, res) => {
    try {
      const expenses = await storage.getAllExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to get expenses" });
    }
  });

  app.get("/api/expenses/:id", async (req, res) => {
    try {
      const expense = await storage.getExpense(parseInt(req.params.id));
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.json(expense);
    } catch (error) {
      res.status(500).json({ message: "Failed to get expense" });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const expenseData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(expenseData);
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid expense data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to get settings" });
    }
  });

  app.get("/api/settings/:key", async (req, res) => {
    try {
      const setting = await storage.getSetting(req.params.key);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to get setting" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const settingData = insertSettingSchema.parse(req.body);
      const setting = await storage.createOrUpdateSetting(settingData);
      res.status(201).json(setting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid setting data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create/update setting" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get dashboard stats" });
    }
  });

  return httpServer;
}
