// Client-side quantum utilities for visualization and state management

export interface QuantumState {
  basis: 'rectilinear' | 'diagonal';
  bit: 0 | 1;
  state: string;
  detected: boolean;
  probability: number;
}

export interface BB84Visualization {
  aliceBits: number[];
  aliceBases: string[];
  bobBases: string[];
  photonStates: QuantumState[];
  siftedKeyLength: number;
  errorRate: number;
}

/**
 * Generate quantum states for visualization
 */
export function generateQuantumStates(count: number = 8): QuantumState[] {
  const states: QuantumState[] = [];
  
  for (let i = 0; i < count; i++) {
    const basis = Math.random() < 0.5 ? 'rectilinear' : 'diagonal';
    const bit = Math.random() < 0.5 ? 0 : 1;
    const detected = Math.random() < 0.95; // 95% detection rate
    const probability = 0.5 + (Math.random() - 0.5) * 0.4; // 0.3 to 0.7
    
    let state: string;
    if (basis === 'rectilinear') {
      state = bit === 0 ? '|0⟩' : '|1⟩';
    } else {
      state = bit === 0 ? '|+⟩' : '|-⟩';
    }
    
    states.push({ basis, bit, state, detected, probability });
  }
  
  return states;
}

/**
 * Simulate BB84 protocol for visualization
 */
export function simulateBB84Protocol(photonCount: number = 100): BB84Visualization {
  const aliceBits: number[] = [];
  const aliceBases: string[] = [];
  const bobBases: string[] = [];
  const photonStates: QuantumState[] = [];
  
  for (let i = 0; i < photonCount; i++) {
    const aliceBit = Math.random() < 0.5 ? 0 : 1;
    const aliceBasis = Math.random() < 0.5 ? 'rectilinear' : 'diagonal';
    const bobBasis = Math.random() < 0.5 ? 'rectilinear' : 'diagonal';
    
    aliceBits.push(aliceBit);
    aliceBases.push(aliceBasis);
    bobBases.push(bobBasis);
    
    // Create photon state
    const detected = Math.random() < 0.95;
    const probability = aliceBasis === bobBasis ? 0.95 : 0.5;
    
    let state: string;
    if (aliceBasis === 'rectilinear') {
      state = aliceBit === 0 ? '|0⟩' : '|1⟩';
    } else {
      state = aliceBit === 0 ? '|+⟩' : '|-⟩';
    }
    
    photonStates.push({
      basis: aliceBasis,
      bit: aliceBit,
      state,
      detected,
      probability
    });
  }
  
  // Calculate sifted key length (only matching bases)
  let siftedKeyLength = 0;
  let errors = 0;
  
  for (let i = 0; i < photonCount; i++) {
    if (aliceBases[i] === bobBases[i] && photonStates[i].detected) {
      siftedKeyLength++;
      // Small probability of measurement error
      if (Math.random() < 0.02) {
        errors++;
      }
    }
  }
  
  const errorRate = siftedKeyLength > 0 ? errors / siftedKeyLength : 0;
  
  return {
    aliceBits,
    aliceBases,
    bobBases,
    photonStates: photonStates.slice(0, 8), // Show only first 8 for visualization
    siftedKeyLength,
    errorRate
  };
}

/**
 * Calculate quantum channel metrics
 */
export function calculateChannelMetrics() {
  const distance = Math.random() * 100; // km
  const photonLoss = 1 - Math.exp(-distance * 0.02); // 0.02 dB/km
  const darkCounts = Math.random() * 1000;
  const detectorEfficiency = 0.85 + Math.random() * 0.1; // 85-95%
  
  return {
    distance: distance.toFixed(1),
    photonLoss: (photonLoss * 100).toFixed(1),
    darkCounts: Math.round(darkCounts),
    detectorEfficiency: (detectorEfficiency * 100).toFixed(1)
  };
}

/**
 * Generate quantum entanglement visualization
 */
export function generateEntanglementPairs(count: number = 4): Array<{
  particle1: string;
  particle2: string;
  entangled: boolean;
  correlation: number;
}> {
  const pairs = [];
  
  for (let i = 0; i < count; i++) {
    const entangled = Math.random() < 0.9;
    const correlation = entangled ? 0.9 + Math.random() * 0.1 : Math.random() * 0.5;
    
    const state1 = Math.random() < 0.5 ? '↑' : '↓';
    const state2 = entangled ? (state1 === '↑' ? '↓' : '↑') : (Math.random() < 0.5 ? '↑' : '↓');
    
    pairs.push({
      particle1: state1,
      particle2: state2,
      entangled,
      correlation
    });
  }
  
  return pairs;
}

/**
 * Validate quantum state consistency
 */
export function validateQuantumState(state: QuantumState): boolean {
  // Check if state representation matches basis and bit
  if (state.basis === 'rectilinear') {
    return (state.bit === 0 && state.state === '|0⟩') || 
           (state.bit === 1 && state.state === '|1⟩');
  } else {
    return (state.bit === 0 && state.state === '|+⟩') || 
           (state.bit === 1 && state.state === '|-⟩');
  }
}

/**
 * Calculate key generation rate
 */
export function calculateKeyGenerationRate(
  siftedKeyLength: number,
  timeSeconds: number,
  errorRate: number
): number {
  // Apply error correction and privacy amplification overhead
  const correctionOverhead = 1.2; // 20% overhead for error correction
  const privacyAmplificationFactor = 0.8; // 20% reduction for privacy amplification
  
  const effectiveKeyLength = siftedKeyLength * privacyAmplificationFactor / correctionOverhead;
  return effectiveKeyLength / timeSeconds;
}

/**
 * Generate random quantum measurement basis
 */
export function generateRandomBasis(): 'rectilinear' | 'diagonal' {
  return Math.random() < 0.5 ? 'rectilinear' : 'diagonal';
}

/**
 * Generate secure quantum random number
 */
export function generateQuantumRandomBit(): 0 | 1 {
  // In a real implementation, this would use quantum randomness
  // For simulation, we use cryptographically secure random
  const array = new Uint8Array(1);
  crypto.getRandomValues(array);
  return array[0] % 2 as 0 | 1;
}

/**
 * Simulate quantum decoherence over time
 */
export function simulateDecoherence(
  initialFidelity: number,
  timeMs: number,
  decoherenceRate: number = 0.001
): number {
  return initialFidelity * Math.exp(-decoherenceRate * timeMs);
}
