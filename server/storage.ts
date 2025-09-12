import { type User, type InsertUser, type Report, type InsertReport, type ChatMessage, type InsertChatMessage, type QuantumKey, type InsertQuantumKey, type BlockchainLog } from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  updateUserLogin(id: string): Promise<void>;
  
  // Report operations
  createReport(report: InsertReport, encryptedData: string, quantumKeyId?: string, submittedBy?: string): Promise<Report>;
  getReport(id: string): Promise<Report | undefined>;
  getReportByCaseId(caseId: string): Promise<Report | undefined>;
  getAllReports(): Promise<Report[]>;
  getReportsByUser(userId: string): Promise<Report[]>;
  updateReportStatus(id: string, status: string): Promise<void>;
  updateReportBlockchainHash(id: string, blockchainHash: string): Promise<void>;
  assignReportToAgent(reportId: string, agentId: string): Promise<void>;
  
  // Chat operations
  createChatMessage(message: InsertChatMessage, encryptedMessage: string, senderId: string): Promise<ChatMessage>;
  getChatMessages(caseId: string): Promise<ChatMessage[]>;
  getChatMessagesByCaseId(caseId: string): Promise<ChatMessage[]>;
  markMessagesAsRead(caseId: string, userId: string): Promise<void>;
  
  // Alias methods for compatibility
  getUser(id: string): Promise<User | undefined>;
  
  // Quantum key operations
  createQuantumKey(key: InsertQuantumKey): Promise<QuantumKey>;
  getActiveQuantumKey(): Promise<QuantumKey | undefined>;
  deactivateQuantumKey(id: string): Promise<void>;
  
  // Blockchain operations
  createBlockchainLog(reportId: string, transactionHash: string, blockNumber?: number): Promise<BlockchainLog>;
  getBlockchainLog(reportId: string): Promise<BlockchainLog | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private reports: Map<string, Report>;
  private chatMessages: Map<string, ChatMessage>;
  private quantumKeys: Map<string, QuantumKey>;
  private blockchainLogs: Map<string, BlockchainLog>;

  constructor() {
    this.users = new Map();
    this.reports = new Map();
    this.chatMessages = new Map();
    this.quantumKeys = new Map();
    this.blockchainLogs = new Map();
    
    // Create default admin user
    this.initializeDefaultUsers();
  }

  private async initializeDefaultUsers() {
    const adminUser: User = {
      id: "admin-1",
      username: "admin",
      email: "admin@agency.gov",
      passwordHash: await bcrypt.hash("admin123", 10),
      userType: "agency",
      firstName: "System",
      lastName: "Administrator",
      agencyName: "Federal Investigation Agency",
      isActive: true,
      createdAt: new Date(),
      lastLoginAt: null,
    };
    this.users.set(adminUser.id, adminUser);

    // Demo citizen account
    const citizenUser: User = {
      id: "citizen-1",
      username: "citizen",
      email: "citizen@example.com",
      passwordHash: await bcrypt.hash("citizen123", 10),
      userType: "citizen",
      firstName: "Demo",
      lastName: "Citizen",
      agencyName: null,
      isActive: true,
      createdAt: new Date(),
      lastLoginAt: null,
    };
    this.users.set(citizenUser.id, citizenUser);
  }

  // User operations
  async createUser(insertUser: any): Promise<User> {
    const id = randomUUID();
    const passwordHash = await bcrypt.hash(insertUser.password, 10);
    const user: User = {
      id,
      username: insertUser.username,
      email: insertUser.email,
      passwordHash,
      userType: insertUser.userType,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      agencyName: insertUser.agencyName || null,
      isActive: true,
      createdAt: new Date(),
      lastLoginAt: null,
    };
    this.users.set(id, user);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async updateUserLogin(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.lastLoginAt = new Date();
      this.users.set(id, user);
    }
  }

  // Generate case ID
  private generateCaseId(): string {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `CASE-${timestamp}-${random}`;
  }

  async createReport(insertReport: InsertReport, encryptedData: string, quantumKeyId?: string, submittedBy?: string): Promise<Report> {
    const id = randomUUID();
    const caseId = this.generateCaseId();
    const report: Report = {
      ...insertReport,
      id,
      caseId,
      encryptedData,
      quantumKeyId: quantumKeyId || null,
      blockchainHash: null,
      status: "submitted",
      submittedBy: submittedBy || null,
      assignedTo: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      location: insertReport.location || null,
      contactEmail: insertReport.contactEmail || null,
      contactPhone: insertReport.contactPhone || null,
    };
    this.reports.set(id, report);
    return report;
  }

  async getReport(id: string): Promise<Report | undefined> {
    return this.reports.get(id);
  }

  async getReportByCaseId(caseId: string): Promise<Report | undefined> {
    return Array.from(this.reports.values()).find(report => report.caseId === caseId);
  }

  async getReportsByUser(userId: string): Promise<Report[]> {
    return Array.from(this.reports.values())
      .filter(report => report.submittedBy === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async assignReportToAgent(reportId: string, agentId: string): Promise<void> {
    const report = this.reports.get(reportId);
    if (report) {
      report.assignedTo = agentId;
      report.updatedAt = new Date();
      this.reports.set(reportId, report);
    }
  }

  async getAllReports(): Promise<Report[]> {
    return Array.from(this.reports.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async updateReportStatus(id: string, status: string): Promise<void> {
    const report = this.reports.get(id);
    if (report) {
      report.status = status;
      this.reports.set(id, report);
    }
  }

  async updateReportBlockchainHash(id: string, blockchainHash: string): Promise<void> {
    const report = this.reports.get(id);
    if (report) {
      report.blockchainHash = blockchainHash;
      this.reports.set(id, report);
    }
  }

  async createChatMessage(insertMessage: InsertChatMessage, encryptedMessage: string, senderId: string): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = {
      id,
      caseId: insertMessage.caseId,
      reportId: insertMessage.reportId || null,
      message: insertMessage.message,
      encryptedMessage,
      senderId,
      senderType: insertMessage.senderType,
      isRead: false,
      timestamp: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getChatMessages(caseId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.caseId === caseId)
      .sort((a, b) => new Date(a.timestamp!).getTime() - new Date(b.timestamp!).getTime());
  }

  async getChatMessagesByCaseId(caseId: string): Promise<ChatMessage[]> {
    return this.getChatMessages(caseId);
  }

  // Alias method for compatibility
  async getUser(id: string): Promise<User | undefined> {
    return this.getUserById(id);
  }

  async markMessagesAsRead(caseId: string, userId: string): Promise<void> {
    Array.from(this.chatMessages.values())
      .filter(msg => msg.caseId === caseId && msg.senderId !== userId)
      .forEach(msg => {
        msg.isRead = true;
        this.chatMessages.set(msg.id, msg);
      });
  }

  async createQuantumKey(insertKey: InsertQuantumKey): Promise<QuantumKey> {
    const id = randomUUID();
    const key: QuantumKey = {
      ...insertKey,
      id,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      isActive: true,
    };
    this.quantumKeys.set(id, key);
    return key;
  }

  async getActiveQuantumKey(): Promise<QuantumKey | undefined> {
    return Array.from(this.quantumKeys.values())
      .find(key => key.isActive && new Date() < new Date(key.expiresAt!));
  }

  async deactivateQuantumKey(id: string): Promise<void> {
    const key = this.quantumKeys.get(id);
    if (key) {
      key.isActive = false;
      this.quantumKeys.set(id, key);
    }
  }

  async createBlockchainLog(reportId: string, transactionHash: string, blockNumber?: number): Promise<BlockchainLog> {
    const id = randomUUID();
    const log: BlockchainLog = {
      id,
      reportId,
      transactionHash,
      blockNumber: blockNumber || null,
      timestamp: new Date(),
      verified: false,
    };
    this.blockchainLogs.set(id, log);
    return log;
  }

  async getBlockchainLog(reportId: string): Promise<BlockchainLog | undefined> {
    return Array.from(this.blockchainLogs.values())
      .find(log => log.reportId === reportId);
  }
}

export const storage = new MemStorage();
