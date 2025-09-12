import { randomBytes } from 'crypto';

export interface QuantumState {
  basis: 'rectilinear' | 'diagonal';
  bit: 0 | 1;
  detected: boolean;
}

export interface BB84Result {
  aliceBits: number[];
  aliceBases: string[];
  bobBases: string[];
  bobBits: number[];
  siftedKey: number[];
  errorRate: number;
  keyGenerated: boolean;
}

export class QuantumKeyDistribution {
  private photonCount: number;
  
  constructor(photonCount: number = 1000) {
    this.photonCount = photonCount;
  }

  /**
   * Simulate BB84 Quantum Key Distribution protocol
   */
  generateBB84Key(): BB84Result {
    // Step 1: Alice generates random bits and bases
    const aliceBits = Array.from({ length: this.photonCount }, () => Math.random() < 0.5 ? 0 : 1);
    const aliceBases = Array.from({ length: this.photonCount }, () => Math.random() < 0.5 ? 'rectilinear' : 'diagonal');
    
    // Step 2: Bob chooses random bases for measurement
    const bobBases = Array.from({ length: this.photonCount }, () => Math.random() < 0.5 ? 'rectilinear' : 'diagonal');
    
    // Step 3: Bob measures photons (with quantum uncertainty)
    const bobBits: number[] = [];
    const validIndices: number[] = [];
    
    for (let i = 0; i < this.photonCount; i++) {
      if (aliceBases[i] === bobBases[i]) {
        // Same basis - measurement should be correct (with small error rate)
        const measurementError = Math.random() < 0.02; // 2% error rate
        bobBits[i] = measurementError ? (aliceBits[i] === 0 ? 1 : 0) : aliceBits[i];
        validIndices.push(i);
      } else {
        // Different basis - random result
        bobBits[i] = Math.random() < 0.5 ? 0 : 1;
      }
    }
    
    // Step 4: Sift key (keep only bits where bases matched)
    const siftedKey: number[] = [];
    let errors = 0;
    
    for (const index of validIndices) {
      siftedKey.push(bobBits[index]);
      if (aliceBits[index] !== bobBits[index]) {
        errors++;
      }
    }
    
    const errorRate = errors / siftedKey.length;
    const keyGenerated = errorRate < 0.11 && siftedKey.length > 100; // QBER threshold
    
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
  generateQuantumStates(count: number = 8): QuantumState[] {
    const states: QuantumState[] = [];
    
    for (let i = 0; i < count; i++) {
      const basis = Math.random() < 0.5 ? 'rectilinear' : 'diagonal';
      const bit = Math.random() < 0.5 ? 0 : 1;
      const detected = Math.random() < 0.95; // 95% detection rate
      
      states.push({ basis, bit, detected });
    }
    
    return states;
  }

  /**
   * Calculate key generation rate in bits per second
   */
  calculateKeyRate(keyLength: number, timeSeconds: number): number {
    return keyLength / timeSeconds;
  }

  /**
   * Simulate quantum channel noise
   */
  simulateChannelNoise(signalStrength: number = 1.0): {
    photonLoss: number;
    darkCounts: number;
    detectorEfficiency: number;
  } {
    const distance = Math.random() * 100; // km
    const photonLoss = 1 - Math.exp(-distance * 0.02); // 0.02 dB/km loss
    const darkCounts = Math.random() * 1000; // Dark counts per second
    const detectorEfficiency = 0.9 - (Math.random() * 0.1); // 80-90% efficiency
    
    return {
      photonLoss,
      darkCounts,
      detectorEfficiency
    };
  }
}

export const qkdService = new QuantumKeyDistribution();
