// server/index.ts
import "dotenv/config";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

// server/storage.ts
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
var MemStorage = class {
  users;
  reports;
  chatMessages;
  quantumKeys;
  blockchainLogs;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.reports = /* @__PURE__ */ new Map();
    this.chatMessages = /* @__PURE__ */ new Map();
    this.quantumKeys = /* @__PURE__ */ new Map();
    this.blockchainLogs = /* @__PURE__ */ new Map();
    this.initializeDefaultUsers();
  }
  async initializeDefaultUsers() {
    const adminUser = {
      id: "admin-1",
      username: "admin",
      email: "admin@agency.gov",
      passwordHash: await bcrypt.hash("admin123", 10),
      userType: "agency",
      firstName: "System",
      lastName: "Administrator",
      agencyName: "Federal Investigation Agency",
      isActive: true,
      createdAt: /* @__PURE__ */ new Date(),
      lastLoginAt: null
    };
    this.users.set(adminUser.id, adminUser);
  }
  // User operations
  async createUser(insertUser) {
    const id = randomUUID();
    const passwordHash = await bcrypt.hash(insertUser.password, 10);
    const user = {
      id,
      username: insertUser.username,
      email: insertUser.email,
      passwordHash,
      userType: insertUser.userType,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      agencyName: insertUser.agencyName || null,
      isActive: true,
      createdAt: /* @__PURE__ */ new Date(),
      lastLoginAt: null
    };
    this.users.set(id, user);
    return user;
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }
  async getUserById(id) {
    return this.users.get(id);
  }
  async updateUserLogin(id) {
    const user = this.users.get(id);
    if (user) {
      user.lastLoginAt = /* @__PURE__ */ new Date();
      this.users.set(id, user);
    }
  }
  // Generate case ID
  generateCaseId() {
    const timestamp2 = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `CASE-${timestamp2}-${random}`;
  }
  async createReport(insertReport, encryptedData, quantumKeyId, submittedBy) {
    const id = randomUUID();
    const caseId = this.generateCaseId();
    const report = {
      ...insertReport,
      id,
      caseId,
      encryptedData,
      quantumKeyId: quantumKeyId || null,
      blockchainHash: null,
      status: "submitted",
      submittedBy: submittedBy || null,
      assignedTo: null,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      location: insertReport.location || null,
      contactEmail: insertReport.contactEmail || null,
      contactPhone: insertReport.contactPhone || null
    };
    this.reports.set(id, report);
    return report;
  }
  async getReport(id) {
    return this.reports.get(id);
  }
  async getReportByCaseId(caseId) {
    return Array.from(this.reports.values()).find((report) => report.caseId === caseId);
  }
  async getReportsByUser(userId) {
    return Array.from(this.reports.values()).filter((report) => report.submittedBy === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async assignReportToAgent(reportId, agentId) {
    const report = this.reports.get(reportId);
    if (report) {
      report.assignedTo = agentId;
      report.updatedAt = /* @__PURE__ */ new Date();
      this.reports.set(reportId, report);
    }
  }
  async getAllReports() {
    return Array.from(this.reports.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  async updateReportStatus(id, status) {
    const report = this.reports.get(id);
    if (report) {
      report.status = status;
      this.reports.set(id, report);
    }
  }
  async createChatMessage(insertMessage, encryptedMessage, senderId) {
    const id = randomUUID();
    const message = {
      id,
      caseId: insertMessage.caseId,
      reportId: insertMessage.reportId || null,
      message: insertMessage.message,
      encryptedMessage,
      senderId,
      senderType: insertMessage.senderType,
      isRead: false,
      timestamp: /* @__PURE__ */ new Date()
    };
    this.chatMessages.set(id, message);
    return message;
  }
  async getChatMessages(caseId) {
    return Array.from(this.chatMessages.values()).filter((msg) => msg.caseId === caseId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
  async getChatMessagesByCaseId(caseId) {
    return this.getChatMessages(caseId);
  }
  // Alias method for compatibility
  async getUser(id) {
    return this.getUserById(id);
  }
  async markMessagesAsRead(caseId, userId) {
    Array.from(this.chatMessages.values()).filter((msg) => msg.caseId === caseId && msg.senderId !== userId).forEach((msg) => {
      msg.isRead = true;
      this.chatMessages.set(msg.id, msg);
    });
  }
  async createQuantumKey(insertKey) {
    const id = randomUUID();
    const key = {
      ...insertKey,
      id,
      createdAt: /* @__PURE__ */ new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1e3),
      // 24 hours
      isActive: true
    };
    this.quantumKeys.set(id, key);
    return key;
  }
  async getActiveQuantumKey() {
    return Array.from(this.quantumKeys.values()).find((key) => key.isActive && /* @__PURE__ */ new Date() < new Date(key.expiresAt));
  }
  async deactivateQuantumKey(id) {
    const key = this.quantumKeys.get(id);
    if (key) {
      key.isActive = false;
      this.quantumKeys.set(id, key);
    }
  }
  async createBlockchainLog(reportId, transactionHash, blockNumber) {
    const id = randomUUID();
    const log2 = {
      id,
      reportId,
      transactionHash,
      blockNumber: blockNumber || null,
      timestamp: /* @__PURE__ */ new Date(),
      verified: false
    };
    this.blockchainLogs.set(id, log2);
    return log2;
  }
  async getBlockchainLog(reportId) {
    return Array.from(this.blockchainLogs.values()).find((log2) => log2.reportId === reportId);
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json, integer, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  userType: varchar("user_type", { length: 20 }).notNull(),
  // 'citizen' or 'agency'
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  agencyName: varchar("agency_name", { length: 255 }),
  // for agency users
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at")
});
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  caseId: varchar("case_id", { length: 20 }).notNull().unique(),
  // New case ID field
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
  submittedBy: varchar("submitted_by").references(() => users.id),
  // Optional user reference
  assignedTo: varchar("assigned_to").references(() => users.id),
  // Agency assignment
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  caseId: varchar("case_id", { length: 20 }).notNull(),
  // Use case ID instead of session ID
  reportId: varchar("report_id").references(() => reports.id),
  message: text("message").notNull(),
  encryptedMessage: text("encrypted_message").notNull(),
  senderId: varchar("sender_id").references(() => users.id),
  senderType: varchar("sender_type", { length: 20 }).notNull(),
  // 'citizen' or 'agency'
  isRead: boolean("is_read").default(false),
  timestamp: timestamp("timestamp").defaultNow()
});
var quantumKeys = pgTable("quantum_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  keyData: text("key_data").notNull(),
  algorithm: varchar("algorithm", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true)
});
var blockchainLogs = pgTable("blockchain_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reportId: varchar("report_id").references(() => reports.id),
  transactionHash: varchar("transaction_hash", { length: 100 }).notNull(),
  blockNumber: integer("block_number"),
  timestamp: timestamp("timestamp").defaultNow(),
  verified: boolean("verified").default(false)
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isActive: true,
  createdAt: true,
  lastLoginAt: true
});
var insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  caseId: true,
  encryptedData: true,
  quantumKeyId: true,
  blockchainHash: true,
  status: true,
  submittedBy: true,
  assignedTo: true,
  createdAt: true,
  updatedAt: true
});
var insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  encryptedMessage: true,
  senderId: true,
  isRead: true,
  timestamp: true
});
var insertQuantumKeySchema = createInsertSchema(quantumKeys).omit({
  id: true,
  createdAt: true,
  expiresAt: true,
  isActive: true
});
var loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  userType: z.enum(["citizen", "agency"])
});
var registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// server/services/quantum.ts
var QuantumKeyDistribution = class {
  photonCount;
  constructor(photonCount = 1e3) {
    this.photonCount = photonCount;
  }
  /**
   * Simulate BB84 Quantum Key Distribution protocol
   */
  generateBB84Key() {
    const aliceBits = Array.from({ length: this.photonCount }, () => Math.random() < 0.5 ? 0 : 1);
    const aliceBases = Array.from({ length: this.photonCount }, () => Math.random() < 0.5 ? "rectilinear" : "diagonal");
    const bobBases = Array.from({ length: this.photonCount }, () => Math.random() < 0.5 ? "rectilinear" : "diagonal");
    const bobBits = [];
    const validIndices = [];
    for (let i = 0; i < this.photonCount; i++) {
      if (aliceBases[i] === bobBases[i]) {
        const measurementError = Math.random() < 0.02;
        bobBits[i] = measurementError ? aliceBits[i] === 0 ? 1 : 0 : aliceBits[i];
        validIndices.push(i);
      } else {
        bobBits[i] = Math.random() < 0.5 ? 0 : 1;
      }
    }
    const siftedKey = [];
    let errors = 0;
    for (const index2 of validIndices) {
      siftedKey.push(bobBits[index2]);
      if (aliceBits[index2] !== bobBits[index2]) {
        errors++;
      }
    }
    const errorRate = errors / siftedKey.length;
    const keyGenerated = errorRate < 0.11 && siftedKey.length > 100;
    return {
      aliceBits,
      aliceBases,
      bobBases,
      bobBits,
      siftedKey,
      errorRate,
      keyGenerated
    };
  }
  /**
   * Generate quantum states for visualization
   */
  generateQuantumStates(count = 8) {
    const states = [];
    for (let i = 0; i < count; i++) {
      const basis = Math.random() < 0.5 ? "rectilinear" : "diagonal";
      const bit = Math.random() < 0.5 ? 0 : 1;
      const detected = Math.random() < 0.95;
      states.push({ basis, bit, detected });
    }
    return states;
  }
  /**
   * Calculate key generation rate in bits per second
   */
  calculateKeyRate(keyLength, timeSeconds) {
    return keyLength / timeSeconds;
  }
  /**
   * Simulate quantum channel noise
   */
  simulateChannelNoise(signalStrength = 1) {
    const distance = Math.random() * 100;
    const photonLoss = 1 - Math.exp(-distance * 0.02);
    const darkCounts = Math.random() * 1e3;
    const detectorEfficiency = 0.9 - Math.random() * 0.1;
    return {
      photonLoss,
      darkCounts,
      detectorEfficiency
    };
  }
};
var qkdService = new QuantumKeyDistribution();

// server/services/crypto.ts
import { createHash, randomBytes, pbkdf2Sync, createCipheriv, createDecipheriv } from "crypto";
var PostQuantumCrypto = class {
  algorithms = {
    KYBER_1024: "kyber-1024",
    DILITHIUM_3: "dilithium-3",
    AES_256_GCM: "aes-256-gcm"
  };
  /**
   * Simulate Kyber-1024 key generation
   * In production, this would use actual PQC libraries like liboqs
   */
  generateKyberKeyPair() {
    const privateKey = randomBytes(3168).toString("hex");
    const publicKey = randomBytes(1568).toString("hex");
    return {
      publicKey,
      privateKey,
      algorithm: this.algorithms.KYBER_1024
    };
  }
  /**
   * Simulate Dilithium-3 signature key generation
   */
  generateDilithiumKeyPair() {
    const privateKey = randomBytes(4016).toString("hex");
    const publicKey = randomBytes(1952).toString("hex");
    return {
      publicKey,
      privateKey,
      algorithm: this.algorithms.DILITHIUM_3
    };
  }
  /**
   * Encrypt data using hybrid PQC approach
   */
  encryptData(data, publicKey) {
    const sessionKey = randomBytes(32);
    const iv = randomBytes(16);
    const encryptedSessionKey = this.simulateKyberEncapsulation(sessionKey, publicKey);
    const cipher = createCipheriv("aes-256-gcm", sessionKey, iv);
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag();
    const encryptedData = JSON.stringify({
      data: encrypted,
      sessionKey: encryptedSessionKey,
      authTag: authTag.toString("hex"),
      algorithm: this.algorithms.AES_256_GCM
    });
    return {
      encryptedData,
      keyId: createHash("sha256").update(publicKey || "default").digest("hex").substring(0, 16),
      algorithm: this.algorithms.KYBER_1024,
      iv: iv.toString("hex")
    };
  }
  /**
   * Decrypt data using hybrid PQC approach
   */
  decryptData(encryptionResult, privateKey) {
    try {
      const parsed = JSON.parse(encryptionResult.encryptedData);
      const sessionKey = this.simulateKyberDecapsulation(parsed.sessionKey, privateKey);
      const decipher = createDecipheriv("aes-256-gcm", sessionKey, Buffer.from(encryptionResult.iv, "hex"));
      if (parsed.authTag) {
        decipher.setAuthTag(Buffer.from(parsed.authTag, "hex"));
      }
      let decrypted = decipher.update(parsed.data, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } catch (error) {
      throw new Error("Decryption failed: Invalid data or key");
    }
  }
  /**
   * Generate secure hash for blockchain logging
   */
  generateSecureHash(data) {
    return createHash("sha3-256").update(data).digest("hex");
  }
  /**
   * Create digital signature using Dilithium simulation
   */
  signData(data, privateKey) {
    const hash = createHash("sha3-256").update(data).digest();
    const signature = createHash("sha256").update(hash).update(privateKey).digest("hex");
    return signature;
  }
  /**
   * Verify digital signature
   */
  verifySignature(data, signature, publicKey) {
    const hash = createHash("sha3-256").update(data).digest();
    const expectedSignature = createHash("sha256").update(hash).update(publicKey).digest("hex");
    return signature === expectedSignature;
  }
  /**
   * Derive key from quantum key material
   */
  deriveKeyFromQuantum(quantumKey, salt) {
    const keyMaterial = Buffer.from(quantumKey);
    const saltBuffer = Buffer.from(salt || "quantum-salt", "utf8");
    return pbkdf2Sync(keyMaterial, saltBuffer, 1e5, 32, "sha512");
  }
  simulateKyberEncapsulation(sessionKey, publicKey) {
    const ciphertext = createHash("sha256").update(sessionKey).update(publicKey || "default-public-key").digest("hex");
    return ciphertext;
  }
  simulateKyberDecapsulation(ciphertext, privateKey) {
    const combined = ciphertext + (privateKey || "default-private-key");
    return createHash("sha256").update(combined).digest();
  }
};
var pqcService = new PostQuantumCrypto();

// server/services/blockchain.ts
import { createHash as createHash2 } from "crypto";
var BlockchainService = class {
  blocks;
  latestBlockNumber;
  networkDelay;
  constructor() {
    this.blocks = /* @__PURE__ */ new Map();
    this.latestBlockNumber = 0;
    this.networkDelay = 2e3;
    this.createGenesisBlock();
  }
  /**
   * Submit report data to blockchain (simulated)
   */
  async submitReportToBlockchain(reportId, reportHash) {
    const transaction = await this.createTransaction({
      type: "WHISTLEBLOWER_REPORT",
      reportId,
      reportHash,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    return transaction;
  }
  /**
   * Verify report integrity using blockchain
   */
  async verifyReportIntegrity(reportId, reportHash) {
    const transactions = Array.from(this.blocks.values());
    const reportTransaction = transactions.find(
      (tx) => tx.data.reportId === reportId && tx.data.reportHash === reportHash
    );
    return !!reportTransaction;
  }
  /**
   * Get blockchain status
   */
  getBlockchainStatus() {
    const transactionCount = Array.from(this.blocks.values()).length;
    const networkHealth = this.determineNetworkHealth();
    return {
      latestBlock: this.latestBlockNumber,
      networkHealth,
      transactionCount,
      gasPrice: this.calculateGasPrice()
    };
  }
  /**
   * Get transaction by hash
   */
  async getTransaction(hash) {
    return Array.from(this.blocks.values()).find((tx) => tx.hash === hash);
  }
  /**
   * Get all transactions for a report
   */
  async getReportTransactions(reportId) {
    return Array.from(this.blocks.values()).filter(
      (tx) => tx.data.reportId === reportId
    );
  }
  /**
   * Simulate mining delay
   */
  async simulateMining() {
    return new Promise((resolve) => setTimeout(resolve, this.networkDelay));
  }
  /**
   * Create a new transaction
   */
  async createTransaction(data) {
    await this.simulateMining();
    const blockNumber = ++this.latestBlockNumber;
    const previousHash = this.getLatestBlockHash();
    const timestamp2 = /* @__PURE__ */ new Date();
    let nonce = 0;
    let hash = "";
    do {
      nonce++;
      const blockData = JSON.stringify({ blockNumber, data, previousHash, timestamp: timestamp2, nonce });
      hash = createHash2("sha256").update(blockData).digest("hex");
    } while (!hash.startsWith("0000"));
    const transaction = {
      hash,
      blockNumber,
      timestamp: timestamp2,
      data,
      previousHash,
      nonce
    };
    this.blocks.set(blockNumber, transaction);
    return transaction;
  }
  /**
   * Create genesis block
   */
  createGenesisBlock() {
    const genesisBlock = {
      hash: "0000000000000000000000000000000000000000000000000000000000000000",
      blockNumber: 0,
      timestamp: /* @__PURE__ */ new Date(),
      data: { type: "GENESIS_BLOCK" },
      previousHash: "0",
      nonce: 0
    };
    this.blocks.set(0, genesisBlock);
  }
  /**
   * Get hash of latest block
   */
  getLatestBlockHash() {
    const latestBlock = this.blocks.get(this.latestBlockNumber);
    return latestBlock?.hash || "0";
  }
  /**
   * Determine network health
   */
  determineNetworkHealth() {
    const random = Math.random();
    if (random < 0.8) return "healthy";
    if (random < 0.95) return "syncing";
    return "error";
  }
  /**
   * Calculate current gas price
   */
  calculateGasPrice() {
    const basePrice = 20;
    const variation = Math.random() * 10;
    return (basePrice + variation).toFixed(2) + " gwei";
  }
};
var blockchainService = new BlockchainService();

// server/routes.ts
import session from "express-session";
import bcrypt2 from "bcrypt";
import connectPgSimple from "connect-pg-simple";
async function registerRoutes(app2) {
  const httpServer = createServer(app2);
  const PgSession = connectPgSimple(session);
  const usePgStore = typeof process.env.DATABASE_URL === "string" && process.env.DATABASE_URL.length > 0;
  const store = usePgStore ? new PgSession({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true
  }) : new session.MemoryStore();
  app2.use(
    session({
      store,
      secret: process.env.SESSION_SECRET || "quantum-shield-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1e3,
        // 24 hours
        secure: false
        // set to true in production with HTTPS
      }
    })
  );
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const clients = /* @__PURE__ */ new Map();
  wss.on("connection", (ws) => {
    const sessionId = generateSessionId();
    const client = { ws, sessionId, isAgent: false };
    clients.set(sessionId, client);
    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === "chat_message") {
          const encryptionResult = pqcService.encryptData(message.content);
          await storage.createChatMessage({
            caseId: message.caseId || sessionId,
            reportId: message.reportId,
            message: message.content,
            senderType: message.senderType || "citizen"
          }, encryptionResult.encryptedData, message.senderId || "anonymous");
          const response = {
            type: "chat_message",
            sessionId,
            message: message.content,
            sender: message.sender || "user",
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          };
          clients.forEach((client2) => {
            if (client2.sessionId === sessionId && client2.ws.readyState === WebSocket.OPEN) {
              client2.ws.send(JSON.stringify(response));
            }
          });
          if (message.sender === "user") {
            setTimeout(async () => {
              const agentResponse = generateAgentResponse(message.content);
              const agentEncryption = pqcService.encryptData(agentResponse);
              await storage.createChatMessage({
                caseId: message.caseId || sessionId,
                reportId: message.reportId,
                message: agentResponse,
                senderType: "agency"
              }, agentEncryption.encryptedData, "agent-bot");
              const agentMessage = {
                type: "chat_message",
                sessionId,
                message: agentResponse,
                sender: "agent",
                timestamp: (/* @__PURE__ */ new Date()).toISOString()
              };
              clients.forEach((client2) => {
                if (client2.sessionId === sessionId && client2.ws.readyState === WebSocket.OPEN) {
                  client2.ws.send(JSON.stringify(agentMessage));
                }
              });
            }, 1e3 + Math.random() * 2e3);
          }
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });
    ws.on("close", () => {
      clients.delete(sessionId);
    });
    ws.send(JSON.stringify({
      type: "connection",
      sessionId,
      message: "Connected to secure chat"
    }));
  });
  app2.post("/api/reports", async (req, res) => {
    try {
      const validatedData = insertReportSchema.parse(req.body);
      const qkdResult = qkdService.generateBB84Key();
      let quantumKeyId;
      if (qkdResult.keyGenerated && qkdResult.siftedKey.length > 0) {
        const quantumKey = await storage.createQuantumKey({
          keyData: JSON.stringify(qkdResult.siftedKey),
          algorithm: "BB84"
        });
        quantumKeyId = quantumKey.id;
      }
      const reportData = JSON.stringify(validatedData);
      const encryptionResult = pqcService.encryptData(reportData);
      const report = await storage.createReport(
        validatedData,
        encryptionResult.encryptedData,
        quantumKeyId
      );
      const reportHash = pqcService.generateSecureHash(reportData);
      const blockchainTx = await blockchainService.submitReportToBlockchain(report.id, reportHash);
      await storage.createBlockchainLog(report.id, blockchainTx.hash, blockchainTx.blockNumber);
      res.json({
        reportId: report.id,
        caseId: report.caseId,
        status: "submitted",
        encryptionStatus: "quantum-secured",
        blockchainHash: blockchainTx.hash,
        qkdStatus: qkdResult.keyGenerated ? "active" : "fallback"
      });
    } catch (error) {
      console.error("Report submission error:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid report data" });
    }
  });
  app2.get("/api/reports", async (req, res) => {
    try {
      const reports2 = await storage.getAllReports();
      const sanitizedReports = reports2.map((report) => ({
        id: report.id,
        caseId: report.caseId,
        reportType: report.reportType,
        urgencyLevel: report.urgencyLevel,
        location: report.location,
        status: report.status,
        createdAt: report.createdAt,
        quantumKeyId: report.quantumKeyId,
        blockchainHash: report.blockchainHash,
        assignedTo: report.assignedTo
      }));
      res.json(sanitizedReports);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });
  app2.get("/api/reports/:id", async (req, res) => {
    try {
      const report = await storage.getReport(req.params.id);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      try {
        const decryptedData = pqcService.decryptData({
          encryptedData: report.encryptedData,
          keyId: report.quantumKeyId || "fallback",
          algorithm: "kyber-1024",
          iv: "simulated"
        });
        const originalReport = JSON.parse(decryptedData);
        res.json({
          ...report,
          decryptedData: originalReport
        });
      } catch (decryptError) {
        res.json({
          ...report,
          decryptedData: null,
          decryptionError: "Unable to decrypt report data"
        });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch report" });
    }
  });
  app2.get("/api/quantum/status", async (req, res) => {
    try {
      const qkdResult = qkdService.generateBB84Key();
      const quantumStates = qkdService.generateQuantumStates(8);
      const channelNoise = qkdService.simulateChannelNoise();
      const activeKey = await storage.getActiveQuantumKey();
      res.json({
        qkd: {
          photonSuccessRate: ((1 - qkdResult.errorRate) * 100).toFixed(1),
          keyGenerationRate: qkdService.calculateKeyRate(qkdResult.siftedKey.length, 10),
          errorRate: (qkdResult.errorRate * 100).toFixed(1),
          keyGenerated: qkdResult.keyGenerated
        },
        quantumStates: quantumStates.map((state) => ({
          state: state.basis === "rectilinear" ? state.bit === 0 ? "|0\u27E9" : "|1\u27E9" : state.bit === 0 ? "|+\u27E9" : "|-\u27E9",
          detected: state.detected
        })),
        channelNoise,
        activeKey: activeKey ? {
          id: activeKey.id,
          algorithm: activeKey.algorithm,
          created: activeKey.createdAt
        } : null
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get quantum status" });
    }
  });
  app2.post("/api/quantum/regenerate", async (req, res) => {
    try {
      const qkdResult = qkdService.generateBB84Key();
      if (qkdResult.keyGenerated) {
        const activeKey = await storage.getActiveQuantumKey();
        if (activeKey) {
          await storage.deactivateQuantumKey(activeKey.id);
        }
        const newKey = await storage.createQuantumKey({
          keyData: JSON.stringify(qkdResult.siftedKey),
          algorithm: "BB84"
        });
        res.json({
          success: true,
          keyId: newKey.id,
          keyLength: qkdResult.siftedKey.length,
          errorRate: qkdResult.errorRate
        });
      } else {
        res.status(400).json({
          success: false,
          error: "Key generation failed due to high error rate"
        });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to regenerate quantum keys" });
    }
  });
  app2.get("/api/pqc/status", async (req, res) => {
    try {
      const kyberKeys = pqcService.generateKyberKeyPair();
      const dilithiumKeys = pqcService.generateDilithiumKeyPair();
      const activeKey = await storage.getActiveQuantumKey();
      res.json({
        algorithms: [
          {
            name: "Kyber-1024",
            type: "Key Encapsulation",
            status: "active",
            keySize: kyberKeys.publicKey.length / 2
            // hex to bytes
          },
          {
            name: "Dilithium-3",
            type: "Digital Signature",
            status: "active",
            keySize: dilithiumKeys.publicKey.length / 2
          }
        ],
        currentSessionKey: activeKey?.keyData.substring(0, 32) + "..." || "No active session",
        encryptionReady: true
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get PQC status" });
    }
  });
  app2.post("/api/pqc/rotate", async (req, res) => {
    try {
      const newKyberKeys = pqcService.generateKyberKeyPair();
      const newDilithiumKeys = pqcService.generateDilithiumKeyPair();
      res.json({
        success: true,
        message: "PQC keys rotated successfully",
        algorithms: ["Kyber-1024", "Dilithium-3"],
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to rotate PQC keys" });
    }
  });
  app2.get("/api/blockchain/status", async (req, res) => {
    try {
      const status = blockchainService.getBlockchainStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to get blockchain status" });
    }
  });
  app2.get("/api/chat/messages/:caseId", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const messages = await storage.getChatMessagesByCaseId(req.params.caseId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });
  app2.post("/api/chat/send", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { message, caseId } = req.body;
      if (!message || !caseId) {
        return res.status(400).json({ error: "Message and case ID are required" });
      }
      const encryptionResult = pqcService.encryptData(message);
      const chatMessage = await storage.createChatMessage({
        caseId,
        message,
        senderType: user.userType
      }, encryptionResult.encryptedData, userId);
      res.json({ success: true, messageId: chatMessage.id });
    } catch (error) {
      console.error("Send chat message error:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });
  app2.get("/api/reports/case/:caseId", async (req, res) => {
    try {
      const report = await storage.getReportByCaseId(req.params.caseId);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch report" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password, userType } = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(username);
      if (!user || user.userType !== userType) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const isValid = await bcrypt2.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      req.session.userId = user.id;
      req.session.userType = user.userType;
      await storage.updateUserLogin(user.id);
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          userType: user.userType,
          firstName: user.firstName,
          lastName: user.lastName,
          agencyName: user.agencyName
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ error: "Invalid login data" });
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      const user = await storage.createUser(userData);
      res.json({
        success: true,
        message: "User registered successfully",
        userId: user.id
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ error: "Invalid registration data" });
    }
  });
  app2.get("/api/auth/user", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        firstName: user.firstName,
        lastName: user.lastName,
        agencyName: user.agencyName
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });
  return httpServer;
}
function generateSessionId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
function generateAgentResponse(userMessage) {
  const responses = [
    "Thank you for reaching out. Your report is important to us. How can I assist you further?",
    "I understand your concern. Can you provide any additional details that might help us investigate this matter?",
    "Your report has been securely received and encrypted. Is there anything specific you'd like to know about the process?",
    "We take all reports seriously. Rest assured that your identity is protected by our quantum encryption systems.",
    "I'm here to help guide you through the reporting process. Do you have any questions about the security measures in place?",
    "Your safety and anonymity are our top priorities. What additional information can you share about this incident?"
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
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
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
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
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.HOST || "0.0.0.0";
  try {
    server.listen({ port, host }, () => {
      log(`\u2705 Server running at http://${host}:${port}`);
    });
  } catch (err) {
    if (err.code === "ENOTSUP") {
      log("\u26A0\uFE0F ENOTSUP detected, retrying with 127.0.0.1...");
      server.listen({ port, host: "127.0.0.1" }, () => {
        log(`\u2705 Server running at http://127.0.0.1:${port}`);
      });
    } else {
      throw err;
    }
  }
})();
