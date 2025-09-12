import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertReportSchema, insertChatMessageSchema, loginSchema, registerSchema } from "@shared/schema";
import { qkdService } from "./services/quantum";
import { pqcService } from "./services/crypto";
import { blockchainService } from "./services/blockchain";
import { z } from "zod";
import session from "express-session";
import bcrypt from "bcrypt";
import connectPgSimple from "connect-pg-simple";

interface WebSocketClient {
  ws: WebSocket;
  sessionId: string;
  isAgent: boolean;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Session configuration (fallback to in-memory if DATABASE_URL missing)
  const PgSession = connectPgSimple(session);
  const usePgStore = typeof process.env.DATABASE_URL === "string" && process.env.DATABASE_URL.length > 0;
  const store = usePgStore
    ? new PgSession({
        conString: process.env.DATABASE_URL as string,
        createTableIfMissing: true,
      })
    : new session.MemoryStore();

  app.use(
    session({
      store,
      secret: process.env.SESSION_SECRET || "quantum-shield-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: false, // set to true in production with HTTPS
      },
    })
  );
  
  // WebSocket server for secure chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Map<string, WebSocketClient>();

  // WebSocket connection handling
  wss.on('connection', (ws) => {
    const sessionId = generateSessionId();
    const client: WebSocketClient = { ws, sessionId, isAgent: false };
    clients.set(sessionId, client);

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'chat_message') {
          // Encrypt message
          const encryptionResult = pqcService.encryptData(message.content);
          
          // Store message
          await storage.createChatMessage({
            caseId: message.caseId || sessionId,
            reportId: message.reportId,
            message: message.content,
            senderType: message.senderType || 'citizen'
          }, encryptionResult.encryptedData, message.senderId || 'anonymous');

          // Broadcast to all clients in session
          const response = {
            type: 'chat_message',
            sessionId,
            message: message.content,
            sender: message.sender || 'user',
            timestamp: new Date().toISOString()
          };

          clients.forEach((client) => {
            if (client.sessionId === sessionId && client.ws.readyState === WebSocket.OPEN) {
              client.ws.send(JSON.stringify(response));
            }
          });

          // Simulate agent response
          if (message.sender === 'user') {
            setTimeout(async () => {
              const agentResponse = generateAgentResponse(message.content);
              const agentEncryption = pqcService.encryptData(agentResponse);
              
              await storage.createChatMessage({
                caseId: message.caseId || sessionId,
                reportId: message.reportId,
                message: agentResponse,
                senderType: 'agency'
              }, agentEncryption.encryptedData, 'agent-bot');

              const agentMessage = {
                type: 'chat_message',
                sessionId,
                message: agentResponse,
                sender: 'agent',
                timestamp: new Date().toISOString()
              };

              clients.forEach((client) => {
                if (client.sessionId === sessionId && client.ws.readyState === WebSocket.OPEN) {
                  client.ws.send(JSON.stringify(agentMessage));
                }
              });
            }, 1000 + Math.random() * 2000);
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      clients.delete(sessionId);
    });

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connection',
      sessionId,
      message: 'Connected to secure chat'
    }));
  });

  // API Routes

  // Submit anonymous report
  app.post("/api/reports", async (req, res) => {
    try {
      const validatedData = insertReportSchema.parse(req.body);
      const rawAttachments = (req.body as any)?.attachments;
      const attachments = Array.isArray(rawAttachments)
        ? rawAttachments
            .filter((a: any) => a && typeof a.name === "string")
            .map((a: any) => ({ name: String(a.name), size: Number(a.size || 0), type: String(a.type || "") }))
        : [];
      
      // Generate quantum key
      const qkdResult = qkdService.generateBB84Key();
      let quantumKeyId: string | undefined;
      
      if (qkdResult.keyGenerated && qkdResult.siftedKey.length > 0) {
        const quantumKey = await storage.createQuantumKey({
          keyData: JSON.stringify(qkdResult.siftedKey),
          algorithm: 'BB84'
        });
        quantumKeyId = quantumKey.id;
      }

      // Encrypt report data
      const reportData = JSON.stringify({ ...validatedData, attachments });
      const encryptionResult = pqcService.encryptData(reportData);
      
      // Create report
      const report = await storage.createReport(
        validatedData,
        encryptionResult.encryptedData,
        quantumKeyId
      );

      // Submit to blockchain
      const reportHash = pqcService.generateSecureHash(reportData);
      const blockchainTx = await blockchainService.submitReportToBlockchain(report.id, reportHash);
      
      // Create blockchain log
      await storage.createBlockchainLog(report.id, blockchainTx.hash, blockchainTx.blockNumber);
      // Update report with blockchain hash so UI shows 'Recorded'
      try {
        await storage.updateReportBlockchainHash(report.id, blockchainTx.hash);
      } catch {}

      res.json({
        reportId: report.id,
        caseId: report.caseId,
        status: "submitted",
        encryptionStatus: "quantum-secured",
        blockchainHash: blockchainTx.hash,
        qkdStatus: qkdResult.keyGenerated ? "active" : "fallback"
      });
    } catch (error) {
      console.error('Report submission error:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid report data" });
    }
  });

  // Get all reports (for dashboard)
  app.get("/api/reports", async (req, res) => {
    try {
      const reports = await storage.getAllReports();
      
      // Return sanitized reports (without encrypted data)
      const sanitizedReports = reports.map(report => ({
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

  // Get specific report details
  app.get("/api/reports/:id", async (req, res) => {
    try {
      const report = await storage.getReport(req.params.id);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }

      // For demo purposes, we'll return decrypted data
      // In production, this would require proper authorization
      try {
        const decryptedData = pqcService.decryptData({
          encryptedData: report.encryptedData,
          keyId: report.quantumKeyId || 'fallback',
          algorithm: 'kyber-1024',
          iv: 'simulated'
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

  // Get quantum status
  app.get("/api/quantum/status", async (req, res) => {
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
        quantumStates: quantumStates.map(state => ({
          state: state.basis === 'rectilinear' ? (state.bit === 0 ? '|0⟩' : '|1⟩') : (state.bit === 0 ? '|+⟩' : '|-⟩'),
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

  // Regenerate quantum keys
  app.post("/api/quantum/regenerate", async (req, res) => {
    try {
      const qkdResult = qkdService.generateBB84Key();
      
      if (qkdResult.keyGenerated) {
        // Deactivate old keys
        const activeKey = await storage.getActiveQuantumKey();
        if (activeKey) {
          await storage.deactivateQuantumKey(activeKey.id);
        }

        // Create new key
        const newKey = await storage.createQuantumKey({
          keyData: JSON.stringify(qkdResult.siftedKey),
          algorithm: 'BB84'
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

  // Get PQC status
  app.get("/api/pqc/status", async (req, res) => {
    try {
      const kyberKeys = pqcService.generateKyberKeyPair();
      const dilithiumKeys = pqcService.generateDilithiumKeyPair();
      const activeKey = await storage.getActiveQuantumKey();

      res.json({
        algorithms: [
          {
            name: 'Kyber-1024',
            type: 'Key Encapsulation',
            status: 'active',
            keySize: kyberKeys.publicKey.length / 2 // hex to bytes
          },
          {
            name: 'Dilithium-3',
            type: 'Digital Signature',
            status: 'active',
            keySize: dilithiumKeys.publicKey.length / 2
          }
        ],
        currentSessionKey: activeKey?.keyData.substring(0, 32) + '...' || 'No active session',
        encryptionReady: true
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get PQC status" });
    }
  });

  // Rotate PQC keys
  app.post("/api/pqc/rotate", async (req, res) => {
    try {
      const newKyberKeys = pqcService.generateKyberKeyPair();
      const newDilithiumKeys = pqcService.generateDilithiumKeyPair();

      // In a real implementation, you'd store these keys securely
      res.json({
        success: true,
        message: "PQC keys rotated successfully",
        algorithms: ['Kyber-1024', 'Dilithium-3'],
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to rotate PQC keys" });
    }
  });

  // Get blockchain status
  app.get("/api/blockchain/status", async (req, res) => {
    try {
      const status = blockchainService.getBlockchainStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to get blockchain status" });
    }
  });

  // Get all blockchain transactions (table data)
  app.get("/api/blockchain/transactions", async (_req, res) => {
    try {
      const txs = await blockchainService.getAllTransactions();
      res.json(txs);
    } catch (error) {
      res.status(500).json({ error: "Failed to get blockchain transactions" });
    }
  });

  // Chat routes
  app.get("/api/chat/messages/:caseId", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const messages = await storage.getChatMessagesByCaseId(req.params.caseId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/chat/send", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
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

      // Encrypt the message
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

  // Get report by case ID
  app.get("/api/reports/case/:caseId", async (req, res) => {
    try {
      const report = await storage.getReportByCaseId(req.params.caseId);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }

      try {
        const decryptedData = pqcService.decryptData({
          encryptedData: report.encryptedData,
          keyId: report.quantumKeyId || 'fallback',
          algorithm: 'kyber-1024',
          iv: 'simulated'
        });
        const originalReport = JSON.parse(decryptedData);
        return res.json({
          ...report,
          decryptedData: originalReport
        });
      } catch (decryptError) {
        return res.json({
          ...report,
          decryptedData: null,
          decryptionError: "Unable to decrypt report data"
        });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch report" });
    }
  });

  // Resolve a report
  app.post("/api/reports/:id/resolve", async (req, res) => {
    try {
      const report = await storage.getReport(req.params.id);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      await storage.updateReportStatus(report.id, "resolved");
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to resolve report" });
    }
  });

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password, userType } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.userType !== userType) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Store user in session
      (req.session as any).userId = user.id;
      (req.session as any).userType = user.userType;
      
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
      console.error('Login error:', error);
      res.status(400).json({ error: "Invalid login data" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      // Create user (password hashing is handled in storage)
      const user = await storage.createUser(userData);
      
      res.json({
        success: true,
        message: "User registered successfully",
        userId: user.id
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ error: "Invalid registration data" });
    }
  });

  app.get("/api/auth/user", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
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

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  return httpServer;
}

function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Authentication middleware
function requireAuth(req: any, res: any, next: any) {
  const userId = req.session?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

function requireAgency(req: any, res: any, next: any) {
  const userType = req.session?.userType;
  if (userType !== 'agency') {
    return res.status(403).json({ error: "Agency access required" });
  }
  next();
}

function generateAgentResponse(userMessage: string): string {
  const responses = [
    "Thank you for reaching out. Your report is important to us. How can I assist you further?",
    "I understand your concern. Can you provide any additional details that might help us investigate this matter?",
    "Your report has been securely received and encrypted. Is there anything specific you'd like to know about the process?",
    "We take all reports seriously. Rest assured that your identity is protected by our quantum encryption systems.",
    "I'm here to help guide you through the reporting process. Do you have any questions about the security measures in place?",
    "Your safety and anonymity are our top priorities. What additional information can you share about this incident?",
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}
