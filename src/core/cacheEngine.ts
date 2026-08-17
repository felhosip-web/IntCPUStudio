import {
  AddressBreakdown,
  CacheAccessResult,
  CacheBenchmarkPreset,
  CacheConfig,
  CacheLine,
  CachePlacementPolicy,
  CacheSet,
  CacheSimulatorState,
  CacheStats,
  MissType,
} from '../types/cache';

export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  addressBits: 16,
  totalSizeBytes: 256,
  blockSizeBytes: 16,
  associativity: 2, // 2-Way by default
  placement: 'SET_ASSOCIATIVE_2',
  replacement: 'LRU',
  writePolicy: 'WRITE_BACK',
  writeAllocate: 'WRITE_ALLOCATE',
  hitLatencyCycles: 1,
  missPenaltyCycles: 20,
};

export const calculateAddressBreakdown = (
  address: number,
  config: CacheConfig
): AddressBreakdown => {
  const numBlocks = Math.max(1, Math.floor(config.totalSizeBytes / config.blockSizeBytes));
  const numSets =
    config.placement === 'DIRECT_MAPPED'
      ? numBlocks
      : config.placement === 'FULLY_ASSOCIATIVE'
      ? 1
      : Math.max(1, Math.floor(numBlocks / config.associativity));

  const offsetBits = Math.round(Math.log2(config.blockSizeBytes));
  const indexBits = config.placement === 'FULLY_ASSOCIATIVE' ? 0 : Math.round(Math.log2(numSets));
  const tagBits = Math.max(0, config.addressBits - indexBits - offsetBits);

  const blockOffset = address & ((1 << offsetBits) - 1);
  const setIndex = indexBits > 0 ? (address >> offsetBits) & ((1 << indexBits) - 1) : 0;
  const tag = address >> (offsetBits + indexBits);

  const toBin = (val: number, bits: number) => (val >>> 0).toString(2).padStart(bits, '0');

  return {
    address,
    tag,
    setIndex,
    blockOffset,
    tagBits,
    indexBits,
    offsetBits,
    tagBinary: toBin(tag, tagBits),
    indexBinary: indexBits > 0 ? toBin(setIndex, indexBits) : '—',
    offsetBinary: toBin(blockOffset, offsetBits),
  };
};

export const createInitialCacheState = (config: CacheConfig = DEFAULT_CACHE_CONFIG): CacheSimulatorState => {
  const numBlocks = Math.max(1, Math.floor(config.totalSizeBytes / config.blockSizeBytes));
  const numSets =
    config.placement === 'DIRECT_MAPPED'
      ? numBlocks
      : config.placement === 'FULLY_ASSOCIATIVE'
      ? 1
      : Math.max(1, Math.floor(numBlocks / config.associativity));

  const waysPerSet =
    config.placement === 'DIRECT_MAPPED'
      ? 1
      : config.placement === 'FULLY_ASSOCIATIVE'
      ? numBlocks
      : config.associativity;

  const sets: CacheSet[] = [];
  for (let s = 0; s < numSets; s++) {
    const lines: CacheLine[] = [];
    for (let w = 0; w < waysPerSet; w++) {
      lines.push({
        valid: false,
        dirty: false,
        tag: 0,
        data: new Array(config.blockSizeBytes).fill(0),
        age: 0,
        lastAccessCycle: 0,
      });
    }
    sets.push({ setIndex: s, lines });
  }

  const mainMemory = new Uint8Array(65536);
  // Seed sample initial values in memory
  for (let i = 0; i < mainMemory.length; i++) {
    mainMemory[i] = (i * 7 + 13) & 0xff;
  }

  const initialStats: CacheStats = {
    totalAccesses: 0,
    readAccesses: 0,
    writeAccesses: 0,
    hits: 0,
    misses: 0,
    compulsoryMisses: 0,
    capacityMisses: 0,
    conflictMisses: 0,
    evictions: 0,
    dirtyEvictionsWrittenBack: 0,
    hitRate: 0,
    missRate: 0,
    averageMemoryAccessTime: config.hitLatencyCycles,
    totalCycles: 0,
  };

  return {
    config,
    sets,
    stats: initialStats,
    lastAccess: null,
    accessHistory: [],
    mainMemory,
  };
};

export const accessCache = (
  state: CacheSimulatorState,
  address: number,
  isWrite: boolean,
  writeValue?: number
): CacheSimulatorState => {
  const cleanAddr = address & 0xffff;
  const breakdown = calculateAddressBreakdown(cleanAddr, state.config);
  const { setIndex, tag, blockOffset } = breakdown;
  const config = state.config;

  const newSets = state.sets.map((s) => ({
    ...s,
    lines: s.lines.map((l) => ({ ...l, data: [...l.data] })),
  }));
  const newMemory = new Uint8Array(state.mainMemory);
  const targetSet = newSets[setIndex] || newSets[0];

  let isHit = false;
  let hitWay = -1;
  let missType: MissType = 'NONE';
  let evicted = false;
  let evictedDirty = false;
  let evictedTag: number | undefined;
  let cyclesTaken = config.hitLatencyCycles;

  // 1. Search for matching valid tag
  for (let w = 0; w < targetSet.lines.length; w++) {
    const line = targetSet.lines[w];
    if (line.valid && line.tag === tag) {
      isHit = true;
      hitWay = w;
      break;
    }
  }

  const totalAccessNum = state.stats.totalAccesses + 1;

  if (isHit && hitWay >= 0) {
    const line = targetSet.lines[hitWay];
    line.lastAccessCycle = totalAccessNum;
    // Increase age of other lines for LRU
    targetSet.lines.forEach((l, idx) => {
      if (idx !== hitWay) l.age += 1;
      else l.age = 0;
    });

    if (isWrite && writeValue !== undefined) {
      line.data[blockOffset] = writeValue & 0xff;
      if (config.writePolicy === 'WRITE_BACK') {
        line.dirty = true;
      } else {
        // Write-Through to memory immediately
        newMemory[cleanAddr] = writeValue & 0xff;
        cyclesTaken += config.missPenaltyCycles; // Write buffer latency
      }
    }
  } else {
    // MISS HANDLING
    cyclesTaken += config.missPenaltyCycles;

    // Determine Miss Type (Compulsory / Capacity / Conflict)
    const hasEmptySlot = targetSet.lines.some((l) => !l.valid);
    const allCacheLinesValid = newSets.every((s) => s.lines.every((l) => l.valid));

    if (hasEmptySlot) {
      missType = 'COMPULSORY';
    } else if (allCacheLinesValid) {
      missType = 'CAPACITY';
    } else {
      missType = 'CONFLICT';
    }

    if (isWrite && config.writeAllocate === 'NO_WRITE_ALLOCATE') {
      // No-Write-Allocate: bypass cache, write directly to RAM
      if (writeValue !== undefined) {
        newMemory[cleanAddr] = writeValue & 0xff;
      }
    } else {
      // Find victim line
      let victimWay = targetSet.lines.findIndex((l) => !l.valid);

      if (victimWay === -1) {
        // Must evict an existing line
        evicted = true;
        if (config.replacement === 'LRU') {
          let maxAge = -1;
          victimWay = 0;
          targetSet.lines.forEach((l, idx) => {
            if (l.age > maxAge) {
              maxAge = l.age;
              victimWay = idx;
            }
          });
        } else if (config.replacement === 'FIFO') {
          let oldestCycle = Infinity;
          victimWay = 0;
          targetSet.lines.forEach((l, idx) => {
            if (l.lastAccessCycle < oldestCycle) {
              oldestCycle = l.lastAccessCycle;
              victimWay = idx;
            }
          });
        } else {
          victimWay = Math.floor(Math.random() * targetSet.lines.length);
        }

        const victimLine = targetSet.lines[victimWay];
        evictedDirty = victimLine.dirty;
        evictedTag = victimLine.tag;

        // If dirty line evicted in Write-Back mode, write back block to RAM
        if (victimLine.dirty && config.writePolicy === 'WRITE_BACK') {
          const evictedBaseAddr =
            (victimLine.tag << (breakdown.indexBits + breakdown.offsetBits)) |
            (setIndex << breakdown.offsetBits);
          for (let b = 0; b < config.blockSizeBytes; b++) {
            newMemory[evictedBaseAddr + b] = victimLine.data[b];
          }
          cyclesTaken += config.missPenaltyCycles; // Extra writeback penalty
        }
      }

      // Fetch new block from memory
      const blockBaseAddr = cleanAddr & ~(config.blockSizeBytes - 1);
      const newBlockData: number[] = [];
      for (let b = 0; b < config.blockSizeBytes; b++) {
        newBlockData.push(newMemory[blockBaseAddr + b] || 0);
      }

      if (isWrite && writeValue !== undefined) {
        newBlockData[blockOffset] = writeValue & 0xff;
      }

      targetSet.lines[victimWay] = {
        valid: true,
        dirty: isWrite && config.writePolicy === 'WRITE_BACK',
        tag,
        data: newBlockData,
        age: 0,
        lastAccessCycle: totalAccessNum,
      };

      // Age others
      targetSet.lines.forEach((l, idx) => {
        if (idx !== victimWay) l.age += 1;
      });
    }
  }

  const toHex = (n: number, w = 4) => `0x${(n >>> 0).toString(16).toUpperCase().padStart(w, '0')}`;

  const explanationHu = isHit
    ? `✅ CACHE TALÁLAT (HIT) a Set #${setIndex}, Way #${hitWay} blokkban! Cím: ${toHex(cleanAddr)}, Tag: ${toHex(tag, 2)}. Nincs memória-késleltetés.`
    : `❌ CACHE HIÁNY (${missType} MISS)! Cím: ${toHex(cleanAddr)}, Tag: ${toHex(tag, 2)}, Set #${setIndex}. Blokk betöltve a DRAM-ból (+${config.missPenaltyCycles} ciklus).${
        evicted ? ` [Kilökés: Tag ${toHex(evictedTag ?? 0, 2)}${evictedDirty ? ' (Piszkos visszaírás DRAM-ba!)' : ''}]` : ''
      }`;

  const explanationEn = isHit
    ? `✅ CACHE HIT at Set #${setIndex}, Way #${hitWay}! Addr: ${toHex(cleanAddr)}, Tag: ${toHex(tag, 2)}. No memory latency.`
    : `❌ CACHE MISS (${missType})! Addr: ${toHex(cleanAddr)}, Tag: ${toHex(tag, 2)}, Set #${setIndex}. Block fetched from DRAM (+${config.missPenaltyCycles} cycles).${
        evicted ? ` [Eviction: Tag ${toHex(evictedTag ?? 0, 2)}${evictedDirty ? ' (Dirty writeback to DRAM)' : ''}]` : ''
      }`;

  const result: CacheAccessResult = {
    address: cleanAddr,
    isWrite,
    writeValue,
    isHit,
    hitWay: isHit ? hitWay : undefined,
    missType,
    evicted,
    evictedDirty,
    evictedTag,
    cyclesTaken,
    explanationHu,
    explanationEn,
  };

  const totalAccesses = state.stats.totalAccesses + 1;
  const readAccesses = state.stats.readAccesses + (isWrite ? 0 : 1);
  const writeAccesses = state.stats.writeAccesses + (isWrite ? 1 : 0);
  const hits = state.stats.hits + (isHit ? 1 : 0);
  const misses = state.stats.misses + (isHit ? 0 : 1);
  const compulsoryMisses = state.stats.compulsoryMisses + (missType === 'COMPULSORY' ? 1 : 0);
  const capacityMisses = state.stats.capacityMisses + (missType === 'CAPACITY' ? 1 : 0);
  const conflictMisses = state.stats.conflictMisses + (missType === 'CONFLICT' ? 1 : 0);
  const evictions = state.stats.evictions + (evicted ? 1 : 0);
  const dirtyEvictions = state.stats.dirtyEvictionsWrittenBack + (evictedDirty ? 1 : 0);
  const totalCycles = state.stats.totalCycles + cyclesTaken;

  const hitRate = totalAccesses > 0 ? (hits / totalAccesses) * 100 : 0;
  const missRate = totalAccesses > 0 ? (misses / totalAccesses) * 100 : 0;
  const amat = config.hitLatencyCycles + (missRate / 100) * config.missPenaltyCycles;

  const newStats: CacheStats = {
    totalAccesses,
    readAccesses,
    writeAccesses,
    hits,
    misses,
    compulsoryMisses,
    capacityMisses,
    conflictMisses,
    evictions,
    dirtyEvictionsWrittenBack: dirtyEvictions,
    hitRate: Number(hitRate.toFixed(1)),
    missRate: Number(missRate.toFixed(1)),
    averageMemoryAccessTime: Number(amat.toFixed(2)),
    totalCycles,
  };

  return {
    ...state,
    sets: newSets,
    mainMemory: newMemory,
    stats: newStats,
    lastAccess: result,
    accessHistory: [result, ...state.accessHistory.slice(0, 19)],
  };
};

export const CACHE_BENCHMARKS: CacheBenchmarkPreset[] = [
  {
    id: 'spatial_sequential',
    titleHu: '1. Szekvenciális Tömb Bejárás (Magas Térbeli Lokalitás)',
    titleEn: '1. Sequential Array Traversal (High Spatial Locality)',
    descHu: '16 bájtos lépésekkel egymás melletti bájtok olvasása. Minden 16 bájtra csak 1 miss esik, 93.7%-os hit rate!',
    descEn: 'Reads adjacent bytes sequentially. With 16-byte blocks, only 1 miss occurs per 16 accesses (93.7% hit rate)!',
    patternType: 'SEQUENTIAL',
    addresses: Array.from({ length: 32 }, (_, i) => ({ address: 0x1000 + i, isWrite: false })),
  },
  {
    id: 'temporal_loop',
    titleHu: '2. Ciklusos Változó Olvasás/Írás (Magas Időbeli Lokalitás)',
    titleEn: '2. Temporal Loop Accumulator (High Temporal Locality)',
    descHu: 'Ugyanazon 4 cím ismételt olvasása és felülírása egy ciklusban. Az első betöltés után 100% hit rate.',
    descEn: 'Repeated read and write to the same 4 loop variables. After cold start, achieves 100% cache hits.',
    patternType: 'TEMPORAL_LOOP',
    addresses: [
      { address: 0x2000, isWrite: false },
      { address: 0x2001, isWrite: true, value: 42 },
      { address: 0x2002, isWrite: false },
      { address: 0x2000, isWrite: false },
      { address: 0x2001, isWrite: true, value: 43 },
      { address: 0x2002, isWrite: false },
      { address: 0x2000, isWrite: false },
      { address: 0x2001, isWrite: true, value: 44 },
    ],
  },
  {
    id: 'matrix_strided_conflict',
    titleHu: '3. Oszlop-folytonos Mátrix Lépésköz (Cache Ütközések & Trashing)',
    titleEn: '3. Strided Column-Major Traversal (Conflict Thrashing)',
    descHu: 'Nagy lépésközű címek olvasása (pl. 256 bájtos stride), amelyek ugyanarra a Cache Set-re képeződnek le. Súlyos konfliktus miss-ek!',
    descEn: 'Large strided accesses (e.g. 256B strides) that map to the exact same cache set, causing severe conflict thrashing.',
    patternType: 'STRIDED',
    addresses: [
      { address: 0x0000, isWrite: false },
      { address: 0x0100, isWrite: false },
      { address: 0x0200, isWrite: false },
      { address: 0x0300, isWrite: false },
      { address: 0x0000, isWrite: false },
      { address: 0x0100, isWrite: false },
      { address: 0x0200, isWrite: false },
      { address: 0x0300, isWrite: false },
    ],
  },
];
