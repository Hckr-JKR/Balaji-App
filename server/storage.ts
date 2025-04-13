import { 
  users, type User, type InsertUser,
  rooms, type Room, type InsertRoom,
  payments, type Payment, type InsertPayment,
  expenses, type Expense, type InsertExpense,
  settings, type Setting, type InsertSetting
} from "@shared/schema";

// Define the storage interface with all required CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;

  // Room methods
  getRoom(id: number): Promise<Room | undefined>;
  getRoomByNumber(roomNumber: string): Promise<Room | undefined>;
  getAllRooms(): Promise<Room[]>;
  createRoom(room: InsertRoom): Promise<Room>;
  updateRoom(id: number, roomData: Partial<InsertRoom>): Promise<Room | undefined>;

  // Payment methods
  getPayment(id: number): Promise<Payment | undefined>;
  getAllPayments(): Promise<Payment[]>;
  getPaymentsByRoomNumber(roomNumber: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, paymentData: Partial<InsertPayment>): Promise<Payment | undefined>;

  // Expense methods
  getExpense(id: number): Promise<Expense | undefined>;
  getAllExpenses(): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expenseData: Partial<InsertExpense>): Promise<Expense | undefined>;

  // Settings methods
  getSetting(key: string): Promise<Setting | undefined>;
  getAllSettings(): Promise<Setting[]>;
  createOrUpdateSetting(setting: InsertSetting): Promise<Setting>;

  // Dashboard stats
  getDashboardStats(): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private rooms: Map<number, Room>;
  private payments: Map<number, Payment>;
  private expenses: Map<number, Expense>;
  private settings: Map<string, Setting>;
  
  private userCurrentId: number = 1;
  private roomCurrentId: number = 1;
  private paymentCurrentId: number = 1;
  private expenseCurrentId: number = 1;
  private settingCurrentId: number = 1;

  constructor() {
    this.users = new Map();
    this.rooms = new Map();
    this.payments = new Map();
    this.expenses = new Map();
    this.settings = new Map();

    // Initialize with sample admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      name: "Admin User",
      email: "admin@balajiapt.com",
      role: "admin",
      preferredLanguage: "en",
      notificationsEnabled: true
    });

    // Initialize with some sample rooms
    this.seedRooms();
  }

  // Seed some initial rooms
  private seedRooms() {
    const currentDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(15); // Set due date to 15th of current month
    
    const rooms = [
      { roomNumber: "101", residentName: "Anil Kumar", contactNumber: "+91 98765 43210", monthlyFee: "1500", totalDue: "0", dueDate },
      { roomNumber: "102", residentName: "Rahul Sharma", contactNumber: "+91 87654 32109", monthlyFee: "1500", totalDue: "1500", dueDate },
      { roomNumber: "201", residentName: "Priya Patel", contactNumber: "+91 76543 21098", monthlyFee: "1500", totalDue: "1500", dueDate },
      { roomNumber: "202", residentName: "Suresh Kumar", contactNumber: "+91 65432 10987", monthlyFee: "1500", totalDue: "0", dueDate }
    ];

    rooms.forEach(room => {
      this.createRoom(room as InsertRoom);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser: User = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Room methods
  async getRoom(id: number): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  async getRoomByNumber(roomNumber: string): Promise<Room | undefined> {
    return Array.from(this.rooms.values()).find(
      (room) => room.roomNumber === roomNumber
    );
  }

  async getAllRooms(): Promise<Room[]> {
    return Array.from(this.rooms.values());
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const id = this.roomCurrentId++;
    const createdAt = new Date();
    const room: Room = { 
      ...insertRoom, 
      id, 
      createdAt,
      paymentsHistory: insertRoom.paymentsHistory || []
    };
    this.rooms.set(id, room);
    return room;
  }

  async updateRoom(id: number, roomData: Partial<InsertRoom>): Promise<Room | undefined> {
    const room = this.rooms.get(id);
    if (!room) return undefined;

    const updatedRoom: Room = { ...room, ...roomData };
    this.rooms.set(id, updatedRoom);
    return updatedRoom;
  }

  // Payment methods
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getAllPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values());
  }

  async getPaymentsByRoomNumber(roomNumber: string): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      payment => payment.roomNumber === roomNumber
    );
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.paymentCurrentId++;
    const createdAt = new Date();
    const payment: Payment = { ...insertPayment, id, createdAt };
    this.payments.set(id, payment);

    // Update room payment history and total due
    const room = Array.from(this.rooms.values()).find(
      (room) => room.roomNumber === insertPayment.roomNumber
    );

    if (room) {
      const roomId = room.id;
      const paymentHistory = room.paymentsHistory || [];
      
      // Add payment to history
      paymentHistory.push({
        id,
        amount: insertPayment.amount,
        date: insertPayment.date,
        method: insertPayment.method,
        status: insertPayment.status,
        receiptURL: insertPayment.receiptURL
      });

      // Update room data
      const updatedRoom: Room = {
        ...room,
        paymentsHistory: paymentHistory,
        lastPaymentDate: insertPayment.date
      };

      // If payment is completed, reduce total due
      if (insertPayment.status === 'completed') {
        const currentDue = parseFloat(room.totalDue.toString() || '0');
        const paymentAmount = parseFloat(insertPayment.amount.toString() || '0');
        updatedRoom.totalDue = Math.max(0, currentDue - paymentAmount).toString();
      }

      this.rooms.set(roomId, updatedRoom);
    }

    return payment;
  }

  async updatePayment(id: number, paymentData: Partial<InsertPayment>): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;

    const updatedPayment: Payment = { ...payment, ...paymentData };
    this.payments.set(id, updatedPayment);

    // If status changed to completed, update room total due
    if (payment.status !== 'completed' && updatedPayment.status === 'completed') {
      const room = Array.from(this.rooms.values()).find(
        (room) => room.roomNumber === payment.roomNumber
      );

      if (room) {
        const roomId = room.id;
        const currentDue = parseFloat(room.totalDue.toString() || '0');
        const paymentAmount = parseFloat(payment.amount.toString() || '0');
        
        const updatedRoom: Room = {
          ...room,
          totalDue: Math.max(0, currentDue - paymentAmount).toString()
        };

        this.rooms.set(roomId, updatedRoom);
      }
    }

    return updatedPayment;
  }

  // Expense methods
  async getExpense(id: number): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }

  async getAllExpenses(): Promise<Expense[]> {
    return Array.from(this.expenses.values());
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = this.expenseCurrentId++;
    const createdAt = new Date();
    const expense: Expense = { ...insertExpense, id, createdAt };
    this.expenses.set(id, expense);
    return expense;
  }

  async updateExpense(id: number, expenseData: Partial<InsertExpense>): Promise<Expense | undefined> {
    const expense = this.expenses.get(id);
    if (!expense) return undefined;

    const updatedExpense: Expense = { ...expense, ...expenseData };
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }

  // Settings methods
  async getSetting(key: string): Promise<Setting | undefined> {
    return this.settings.get(key);
  }

  async getAllSettings(): Promise<Setting[]> {
    return Array.from(this.settings.values());
  }

  async createOrUpdateSetting(insertSetting: InsertSetting): Promise<Setting> {
    const existingSetting = Array.from(this.settings.values()).find(
      setting => setting.key === insertSetting.key
    );

    if (existingSetting) {
      const updatedSetting: Setting = {
        ...existingSetting,
        value: insertSetting.value,
        updatedAt: new Date()
      };
      this.settings.set(insertSetting.key, updatedSetting);
      return updatedSetting;
    } else {
      const id = this.settingCurrentId++;
      const updatedAt = new Date();
      const setting: Setting = { ...insertSetting, id, updatedAt };
      this.settings.set(insertSetting.key, setting);
      return setting;
    }
  }

  // Dashboard stats
  async getDashboardStats(): Promise<any> {
    const rooms = Array.from(this.rooms.values());
    const payments = Array.from(this.payments.values());
    const expenses = Array.from(this.expenses.values());

    // Calculate total collected
    const totalCollected = payments
      .filter(payment => payment.status === 'completed')
      .reduce((sum, payment) => sum + parseFloat(payment.amount.toString() || '0'), 0);

    // Calculate total expenses
    const totalExpenses = expenses
      .reduce((sum, expense) => sum + parseFloat(expense.amount.toString() || '0'), 0);

    // Calculate current balance
    const currentBalance = totalCollected - totalExpenses;

    // Calculate pending dues
    const pendingDues = rooms
      .reduce((sum, room) => sum + parseFloat(room.totalDue.toString() || '0'), 0);

    // Count rooms with pending dues
    const pendingRooms = rooms.filter(room => parseFloat(room.totalDue.toString() || '0') > 0).length;

    // Get pending payments
    const pendingPayments = rooms
      .filter(room => parseFloat(room.totalDue.toString() || '0') > 0)
      .map(room => ({
        roomNumber: room.roomNumber,
        resident: room.residentName,
        amount: parseFloat(room.totalDue.toString() || '0'),
        dueDate: room.dueDate,
        status: new Date(room.dueDate) < new Date() ? "overdue" : "pending"
      }))
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5); // Limit to 5 results

    // Get recent expenses
    const recentExpenses = [...expenses]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4)
      .map(expense => ({
        id: expense.id,
        title: expense.title,
        amount: parseFloat(expense.amount.toString() || '0'),
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
}

export const storage = new MemStorage();
