import { createHash } from 'crypto';

export interface BlockchainTransaction {
  hash: string;
  blockNumber: number;
  timestamp: Date;
  data: any;
  previousHash: string;
  nonce: number;
}

export interface BlockchainStatus {
  latestBlock: number;
  networkHealth: 'healthy' | 'syncing' | 'error';
  transactionCount: number;
  gasPrice: string;
}

export class BlockchainService {
  private blocks: Map<number, BlockchainTransaction>;
  private latestBlockNumber: number;
  private networkDelay: number;

  constructor() {
    this.blocks = new Map();
    this.latestBlockNumber = 0;
    this.networkDelay = 2000; // 2 second block time simulation
    
    // Create genesis block
    this.createGenesisBlock();
  }

  /**
   * Submit report data to blockchain (simulated)
   */
  async submitReportToBlockchain(reportId: string, reportHash: string): Promise<BlockchainTransaction> {
    const transaction = await this.createTransaction({
      type: 'WHISTLEBLOWER_REPORT',
      reportId,
      reportHash,
      timestamp: new Date().toISOString(),
    });

    return transaction;
  }

  /**
   * Verify report integrity using blockchain
   */
  async verifyReportIntegrity(reportId: string, reportHash: string): Promise<boolean> {
    const transactions = Array.from(this.blocks.values());
    const reportTransaction = transactions.find(tx => 
      tx.data.reportId === reportId && tx.data.reportHash === reportHash
    );

    return !!reportTransaction;
  }

  /**
   * Get blockchain status
   */
  getBlockchainStatus(): BlockchainStatus {
    const transactionCount = Array.from(this.blocks.values()).length;
    const networkHealth = this.determineNetworkHealth();

    return {
      latestBlock: this.latestBlockNumber,
      networkHealth,
      transactionCount,
      gasPrice: this.calculateGasPrice(),
    };
  }

  /**
   * Get transaction by hash
   */
  async getTransaction(hash: string): Promise<BlockchainTransaction | undefined> {
    return Array.from(this.blocks.values()).find(tx => tx.hash === hash);
  }

  /**
   * Get all transactions for a report
   */
  async getReportTransactions(reportId: string): Promise<BlockchainTransaction[]> {
    return Array.from(this.blocks.values()).filter(tx => 
      tx.data.reportId === reportId
    );
  }

  /**
   * Get all transactions (latest first)
   */
  async getAllTransactions(): Promise<BlockchainTransaction[]> {
    return Array.from(this.blocks.values())
      .filter(tx => tx.data?.type !== 'GENESIS_BLOCK')
      .sort((a, b) => b.blockNumber - a.blockNumber);
  }

  /**
   * Simulate mining delay
   */
  private async simulateMining(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, this.networkDelay));
  }

  /**
   * Create a new transaction
   */
  private async createTransaction(data: any): Promise<BlockchainTransaction> {
    await this.simulateMining();

    const blockNumber = ++this.latestBlockNumber;
    const previousHash = this.getLatestBlockHash();
    const timestamp = new Date();
    
    // Simple proof of work simulation
    let nonce = 0;
    let hash = '';
    do {
      nonce++;
      const blockData = JSON.stringify({ blockNumber, data, previousHash, timestamp, nonce });
      hash = createHash('sha256').update(blockData).digest('hex');
    } while (!hash.startsWith('0000')); // Simple difficulty target

    const transaction: BlockchainTransaction = {
      hash,
      blockNumber,
      timestamp,
      data,
      previousHash,
      nonce,
    };

    this.blocks.set(blockNumber, transaction);
    return transaction;
  }

  /**
   * Create genesis block
   */
  private createGenesisBlock(): void {
    const genesisBlock: BlockchainTransaction = {
      hash: '0000000000000000000000000000000000000000000000000000000000000000',
      blockNumber: 0,
      timestamp: new Date(),
      data: { type: 'GENESIS_BLOCK' },
      previousHash: '0',
      nonce: 0,
    };

    this.blocks.set(0, genesisBlock);
  }

  /**
   * Get hash of latest block
   */
  private getLatestBlockHash(): string {
    const latestBlock = this.blocks.get(this.latestBlockNumber);
    return latestBlock?.hash || '0';
  }

  /**
   * Determine network health
   */
  private determineNetworkHealth(): 'healthy' | 'syncing' | 'error' {
    // Simulate network conditions
    const random = Math.random();
    if (random < 0.8) return 'healthy';
    if (random < 0.95) return 'syncing';
    return 'error';
  }

  /**
   * Calculate current gas price
   */
  private calculateGasPrice(): string {
    // Simulate dynamic gas pricing
    const basePrice = 20; // gwei
    const variation = Math.random() * 10;
    return (basePrice + variation).toFixed(2) + ' gwei';
  }
}

export const blockchainService = new BlockchainService();
