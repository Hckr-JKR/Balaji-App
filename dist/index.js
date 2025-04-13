// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  rooms;
  payments;
  expenses;
  settings;
  userCurrentId = 1;
  roomCurrentId = 1;
  paymentCurrentId = 1;
  expenseCurrentId = 1;
  settingCurrentId = 1;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.rooms = /* @__PURE__ */ new Map();
    this.payments = /* @__PURE__ */ new Map();
    this.expenses = /* @__PURE__ */ new Map();
    this.settings = /* @__PURE__ */ new Map();
    this.createUser({
      username: "admin",
      password: "admin123",
      name: "Admin User",
      email: "admin@balajiapt.com",
      role: "admin",
      preferredLanguage: "en",
      notificationsEnabled: true
    });
    this.seedRooms();
  }
  // Seed some initial rooms
  seedRooms() {
    const currentDate = /* @__PURE__ */ new Date();
    const dueDate = /* @__PURE__ */ new Date();
    dueDate.setDate(15);
    const rooms2 = [
      { roomNumber: "101", residentName: "Anil Kumar", contactNumber: "+91 98765 43210", monthlyFee: "1500", totalDue: "0", dueDate },
      { roomNumber: "102", residentName: "Rahul Sharma", contactNumber: "+91 87654 32109", monthlyFee: "1500", totalDue: "1500", dueDate },
      { roomNumber: "201", residentName: "Priya Patel", contactNumber: "+91 76543 21098", monthlyFee: "1500", totalDue: "1500", dueDate },
      { roomNumber: "202", residentName: "Suresh Kumar", contactNumber: "+91 65432 10987", monthlyFee: "1500", totalDue: "0", dueDate }
    ];
    rooms2.forEach((room) => {
      this.createRoom(room);
    });
  }
  // User methods
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  async getAllUsers() {
    return Array.from(this.users.values());
  }
  async createUser(insertUser) {
    const id = this.userCurrentId++;
    const createdAt = /* @__PURE__ */ new Date();
    const user = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  async updateUser(id, userData) {
    const user = this.users.get(id);
    if (!user) return void 0;
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  // Room methods
  async getRoom(id) {
    return this.rooms.get(id);
  }
  async getRoomByNumber(roomNumber) {
    return Array.from(this.rooms.values()).find(
      (room) => room.roomNumber === roomNumber
    );
  }
  async getAllRooms() {
    return Array.from(this.rooms.values());
  }
  async createRoom(insertRoom) {
    const id = this.roomCurrentId++;
    const createdAt = /* @__PURE__ */ new Date();
    const room = {
      ...insertRoom,
      id,
      createdAt,
      paymentsHistory: insertRoom.paymentsHistory || []
    };
    this.rooms.set(id, room);
    return room;
  }
  async updateRoom(id, roomData) {
    const room = this.rooms.get(id);
    if (!room) return void 0;
    const updatedRoom = { ...room, ...roomData };
    this.rooms.set(id, updatedRoom);
    return updatedRoom;
  }
  // Payment methods
  async getPayment(id) {
    return this.payments.get(id);
  }
  async getAllPayments() {
    return Array.from(this.payments.values());
  }
  async getPaymentsByRoomNumber(roomNumber) {
    return Array.from(this.payments.values()).filter(
      (payment) => payment.roomNumber === roomNumber
    );
  }
  async createPayment(insertPayment) {
    const id = this.paymentCurrentId++;
    const createdAt = /* @__PURE__ */ new Date();
    const payment = { ...insertPayment, id, createdAt };
    this.payments.set(id, payment);
    const room = Array.from(this.rooms.values()).find(
      (room2) => room2.roomNumber === insertPayment.roomNumber
    );
    if (room) {
      const roomId = room.id;
      const paymentHistory = room.paymentsHistory || [];
      paymentHistory.push({
        id,
        amount: insertPayment.amount,
        date: insertPayment.date,
        method: insertPayment.method,
        status: insertPayment.status,
        receiptURL: insertPayment.receiptURL
      });
      const updatedRoom = {
        ...room,
        paymentsHistory: paymentHistory,
        lastPaymentDate: insertPayment.date
      };
      if (insertPayment.status === "completed") {
        const currentDue = parseFloat(room.totalDue.toString() || "0");
        const paymentAmount = parseFloat(insertPayment.amount.toString() || "0");
        updatedRoom.totalDue = Math.max(0, currentDue - paymentAmount).toString();
      }
      this.rooms.set(roomId, updatedRoom);
    }
    return payment;
  }
  async updatePayment(id, paymentData) {
    const payment = this.payments.get(id);
    if (!payment) return void 0;
    const updatedPayment = { ...payment, ...paymentData };
    this.payments.set(id, updatedPayment);
    if (payment.status !== "completed" && updatedPayment.status === "completed") {
      const room = Array.from(this.rooms.values()).find(
        (room2) => room2.roomNumber === payment.roomNumber
      );
      if (room) {
        const roomId = room.id;
        const currentDue = parseFloat(room.totalDue.toString() || "0");
        const paymentAmount = parseFloat(payment.amount.toString() || "0");
        const updatedRoom = {
          ...room,
          totalDue: Math.max(0, currentDue - paymentAmount).toString()
        };
        this.rooms.set(roomId, updatedRoom);
      }
    }
    return updatedPayment;
  }
  // Expense methods
  async getExpense(id) {
    return this.expenses.get(id);
  }
  async getAllExpenses() {
    return Array.from(this.expenses.values());
  }
  async createExpense(insertExpense) {
    const id = this.expenseCurrentId++;
    const createdAt = /* @__PURE__ */ new Date();
    const expense = { ...insertExpense, id, createdAt };
    this.expenses.set(id, expense);
    return expense;
  }
  async updateExpense(id, expenseData) {
    const expense = this.expenses.get(id);
    if (!expense) return void 0;
    const updatedExpense = { ...expense, ...expenseData };
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }
  // Settings methods
  async getSetting(key) {
    return this.settings.get(key);
  }
  async getAllSettings() {
    return Array.from(this.settings.values());
  }
  async createOrUpdateSetting(insertSetting) {
    const existingSetting = Array.from(this.settings.values()).find(
      (setting) => setting.key === insertSetting.key
    );
    if (existingSetting) {
      const updatedSetting = {
        ...existingSetting,
        value: insertSetting.value,
        updatedAt: /* @__PURE__ */ new Date()
      };
      this.settings.set(insertSetting.key, updatedSetting);
      return updatedSetting;
    } else {
      const id = this.settingCurrentId++;
      const updatedAt = /* @__PURE__ */ new Date();
      const setting = { ...insertSetting, id, updatedAt };
      this.settings.set(insertSetting.key, setting);
      return setting;
    }
  }
  // Dashboard stats
  async getDashboardStats() {
    const rooms2 = Array.from(this.rooms.values());
    const payments2 = Array.from(this.payments.values());
    const expenses2 = Array.from(this.expenses.values());
    const totalCollected = payments2.filter((payment) => payment.status === "completed").reduce((sum, payment) => sum + parseFloat(payment.amount.toString() || "0"), 0);
    const totalExpenses = expenses2.reduce((sum, expense) => sum + parseFloat(expense.amount.toString() || "0"), 0);
    const currentBalance = totalCollected - totalExpenses;
    const pendingDues = rooms2.reduce((sum, room) => sum + parseFloat(room.totalDue.toString() || "0"), 0);
    const pendingRooms = rooms2.filter((room) => parseFloat(room.totalDue.toString() || "0") > 0).length;
    const pendingPayments = rooms2.filter((room) => parseFloat(room.totalDue.toString() || "0") > 0).map((room) => ({
      roomNumber: room.roomNumber,
      resident: room.residentName,
      amount: parseFloat(room.totalDue.toString() || "0"),
      dueDate: room.dueDate,
      status: new Date(room.dueDate) < /* @__PURE__ */ new Date() ? "overdue" : "pending"
    })).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 5);
    const recentExpenses = [...expenses2].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4).map((expense) => ({
      id: expense.id,
      title: expense.title,
      amount: parseFloat(expense.amount.toString() || "0"),
      category: expense.category,
      date: expense.date
    }));
    return {
      totalCollected,
      totalExpenses,
      currentBalance,
      pendingDues,
      pendingRooms,
      pendingPayments,
      recentExpenses
    };
  }
};
var storage = new MemStorage();

// server/routes.ts
import { z } from "zod";

// shared/schema.ts
import { pgTable, text, serial, boolean, timestamp, jsonb, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
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
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var rooms = pgTable("rooms", {
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
var insertRoomSchema = createInsertSchema(rooms).omit({
  id: true,
  createdAt: true
});
var payments = pgTable("payments", {
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
var insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true
});
var expenses = pgTable("expenses", {
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
var insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true
});
var settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true
});

// server/routes.ts
async function registerRoutes(app2) {
  const httpServer = createServer(app2);
  app2.get("/api/users", async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      res.json(users2);
    } catch (error) {
      res.status(500).json({ message: "Failed to get users" });
    }
  });
  app2.get("/api/users/:id", async (req, res) => {
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
  app2.post("/api/users", async (req, res) => {
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
  app2.get("/api/rooms", async (req, res) => {
    try {
      const rooms2 = await storage.getAllRooms();
      res.json(rooms2);
    } catch (error) {
      res.status(500).json({ message: "Failed to get rooms" });
    }
  });
  app2.get("/api/rooms/:id", async (req, res) => {
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
  app2.get("/api/rooms/number/:roomNumber", async (req, res) => {
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
  app2.post("/api/rooms", async (req, res) => {
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
  app2.put("/api/rooms/:id", async (req, res) => {
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
  app2.get("/api/payments", async (req, res) => {
    try {
      const payments2 = await storage.getAllPayments();
      res.json(payments2);
    } catch (error) {
      res.status(500).json({ message: "Failed to get payments" });
    }
  });
  app2.get("/api/payments/:id", async (req, res) => {
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
  app2.get("/api/payments/room/:roomNumber", async (req, res) => {
    try {
      const payments2 = await storage.getPaymentsByRoomNumber(req.params.roomNumber);
      res.json(payments2);
    } catch (error) {
      res.status(500).json({ message: "Failed to get payments" });
    }
  });
  app2.post("/api/payments", async (req, res) => {
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
  app2.put("/api/payments/:id", async (req, res) => {
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
  app2.get("/api/expenses", async (req, res) => {
    try {
      const expenses2 = await storage.getAllExpenses();
      res.json(expenses2);
    } catch (error) {
      res.status(500).json({ message: "Failed to get expenses" });
    }
  });
  app2.get("/api/expenses/:id", async (req, res) => {
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
  app2.post("/api/expenses", async (req, res) => {
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
  app2.get("/api/settings", async (req, res) => {
    try {
      const settings2 = await storage.getAllSettings();
      res.json(settings2);
    } catch (error) {
      res.status(500).json({ message: "Failed to get settings" });
    }
  });
  app2.get("/api/settings/:key", async (req, res) => {
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
  app2.post("/api/settings", async (req, res) => {
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
  app2.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get dashboard stats" });
    }
  });
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
