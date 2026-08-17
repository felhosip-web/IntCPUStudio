export type CachePlacementPolicy =
  | 'DIRECT_MAPPED'
  | 'SET_ASSOCIATIVE_2'
  | 'SET_ASSOCIATIVE_4'
  | 'SET_ASSOCIATIVE_8'
  | 'FULLY_ASSOCIATIVE';

export type CacheReplacementPolicy = 'LRU' | 'FIFO' | 'RANDOM';

export type CacheWritePolicy = 'WRITE_THROUGH' | 'WRITE_BACK';

export type CacheWriteAllocatePolicy = 'WRITE_ALLOCATE' | 'NO_WRITE_ALLOCATE';

export interface CacheLine {
  valid: boolean;
  dirty: boolean;
  tag: number;
  data: number[]; // Block size in bytes
  age: number; // For LRU / FIFO
  lastAccessCycle: number;
}

export interface CacheSet {
  setIndex: number;
  lines: CacheLine[];
}

export interface CacheConfig {
  addressBits: number; // e.g. 16-bit or 32-bit
  totalSizeBytes: number; // e.g. 256 bytes, 1KB, 4KB
  blockSizeBytes: number; // e.g. 4 bytes, 8 bytes, 16 bytes
  associativity: number; // 1 = Direct, 2, 4, 8, or total sets
  placement: CachePlacementPolicy;
  replacement: CacheReplacementPolicy;
  writePolicy: CacheWritePolicy;
  writeAllocate: CacheWriteAllocatePolicy;
  hitLatencyCycles: number; // e.g. 1 cycle
  missPenaltyCycles: number; // e.g. 20 cycles
}

export interface AddressBreakdown {
  address: number;
  tag: number;
  setIndex: number;
  blockOffset: number;
  tagBits: number;
  indexBits: number;
  offsetBits: number;
  tagBinary: string;
  indexBinary: string;
  offsetBinary: string;
}

export type MissType = 'NONE' | 'COMPULSORY' | 'CAPACITY' | 'CONFLICT';

export interface CacheAccessResult {
  address: number;
  isWrite: boolean;
  writeValue?: number;
  isHit: boolean;
  hitWay?: number;
  missType: MissType;
  evicted: boolean;
  evictedDirty: boolean;
  evictedTag?: number;
  cyclesTaken: number;
  explanationHu: string;
  explanationEn: string;
}

export interface CacheStats {
  totalAccesses: number;
  readAccesses: number;
  writeAccesses: number;
  hits: number;
  misses: number;
  compulsoryMisses: number;
  capacityMisses: number;
  conflictMisses: number;
  evictions: number;
  dirtyEvictionsWrittenBack: number;
  hitRate: number; // 0 to 100 %
  missRate: number; // 0 to 100 %
  averageMemoryAccessTime: number; // AMAT in cycles
  totalCycles: number;
}

export interface CacheSimulatorState {
  config: CacheConfig;
  sets: CacheSet[];
  stats: CacheStats;
  lastAccess: CacheAccessResult | null;
  accessHistory: CacheAccessResult[];
  mainMemory: Uint8Array; // 64KB simulated DRAM
}

export interface CacheBenchmarkPreset {
  id: string;
  titleHu: string;
  titleEn: string;
  descHu: string;
  descEn: string;
  patternType: 'SEQUENTIAL' | 'STRIDED' | 'TEMPORAL_LOOP' | 'MATRIX_TRANSPOSE' | 'RANDOM';
  addresses: { address: number; isWrite: boolean; value?: number }[];
}
