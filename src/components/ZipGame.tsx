import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Flame, 
  Snowflake, 
  RotateCcw, 
  Lightbulb, 
  ArrowLeft, 
  Play, 
  CheckCircle2, 
  Star, 
  Trash2, 
  HelpCircle, 
  BookOpen, 
  Undo2, 
  Clock, 
  ChevronRight, 
  X,
  Sparkles,
  ChevronLeft,
  Calendar,
  Volume2,
  VolumeX
} from 'lucide-react';
import { ZIP_LEVELS, ZipLevel } from '../lib/zip-levels';
import { CosmicCanvasBackground } from './CosmicCanvasBackground';
import PlayerStatsPanel from './PlayerStatsPanel';

// ================= AMBIENT RECONSTRUTIVE GRAPHICS & SYNTHESIZER =================
let audioCtx: AudioContext | null = null;
let isAudioSynthMuted = false;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

const playCosmicTone = (frequency: number, type: OscillatorType = 'sine', duration = 0.4, gainValue = 0.12) => {
  if (isAudioSynthMuted) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    // Smooth attack and soft exponential release for cosmic resonance
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(gainValue, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration + 0.15);
  } catch (e) {
    console.warn("Audio Context error", e);
  }
};

const playMoveSound = (index: number) => {
  // G major pentatonic ambient chime series
  const notes = [196.00, 220.00, 246.94, 293.66, 329.63, 392.00, 440.00, 493.88, 587.33, 659.25, 783.99, 880.00];
  const f = notes[index % notes.length] * (1 + Math.floor(index / notes.length) * 0.5);
  playCosmicTone(f, 'sine', 0.4, 0.12);
};

const playUndoSound = () => {
  if (isAudioSynthMuted) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {}
};

const playWinSound = () => {
  if (isAudioSynthMuted) return;
  try {
    const arpeggio = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    arpeggio.forEach((f, i) => {
      setTimeout(() => {
        if (isAudioSynthMuted) return;
        playCosmicTone(f, 'sine', 0.65, 0.08);
      }, i * 75);
    });
  } catch (e) {}
};

const playErrorSound = () => {
  if (isAudioSynthMuted) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(70, ctx.currentTime + 0.12);
    
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.22);
  } catch (e) {}
};

const playHintSound = () => {
  if (isAudioSynthMuted) return;
  try {
    const notes = [440.00, 554.37, 659.25, 880.00];
    notes.forEach((f, i) => {
      setTimeout(() => {
        if (isAudioSynthMuted) return;
        playCosmicTone(f, 'sine', 0.6, 0.05);
      }, i * 60);
    });
  } catch (e) {}
};

// ================= SEEDABLE RAND & HAMILTONIAN CARVER GENERATOR =================
function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

export function generateRandomZipLevel(
  id: number,
  name: string,
  difficulty: 'fácil' | 'medio' | 'difícil',
  seedValue?: string
): ZipLevel {
  const seedNum = seedValue 
    ? Array.from(seedValue).reduce((acc, char) => acc + char.charCodeAt(0), 0) 
    : Math.floor(Math.random() * 1000000);
  const rand = mulberry32(seedNum);
  
  let width = 4;
  let height = 4;
  let desiredLength = 10;
  let maxNumbersCount = 3;
  
  if (difficulty === 'fácil') {
    const isFive = rand() > 0.5;
    width = 4;
    height = isFive ? 5 : 4;
    desiredLength = isFive ? Math.floor(rand() * 4) + 12 : Math.floor(rand() * 3) + 10; // 12-15 or 10-12 cells
    maxNumbersCount = isFive ? 3 : 2; // numbers 1-3 or 1-2
  } else if (difficulty === 'medio') {
    const isSix = rand() > 0.5;
    width = 5;
    height = isSix ? 6 : 5;
    desiredLength = isSix ? Math.floor(rand() * 5) + 19 : Math.floor(rand() * 4) + 15; // 19-23 or 15-18 cells
    maxNumbersCount = isSix ? 4 : 3; // 1-4 or 1-3
  } else {
    // 'difícil' levels reach 6x6, 6x7, 7x6, or 7x7!
    const roll = rand();
    if (roll < 0.25) {
      width = 6;
      height = 6;
      desiredLength = Math.floor(rand() * 5) + 24; // 24 to 28 cells
      maxNumbersCount = 4;
    } else if (roll < 0.5) {
      width = 6;
      height = 7;
      desiredLength = Math.floor(rand() * 6) + 28; // 28 to 33 cells
      maxNumbersCount = 5;
    } else if (roll < 0.75) {
      width = 7;
      height = 6;
      desiredLength = Math.floor(rand() * 6) + 28; // 28 to 33 cells
      maxNumbersCount = 5;
    } else {
      width = 7;
      height = 7;
      desiredLength = Math.floor(rand() * 7) + 34; // 34 to 40 cells
      maxNumbersCount = 6;
    }
  }
  
  let path: [number, number][] = [];
  const visited = Array.from({ length: height }, () => Array(width).fill(false));
  
  function carve(r: number, c: number, depth: number): boolean {
    path.push([r, c]);
    visited[r][c] = true;
    
    if (depth === desiredLength) {
      return true;
    }
    
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1]
    ];
    for (let i = directions.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const temp = directions[i];
      directions[i] = directions[j];
      directions[j] = temp;
    }
    
    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < height && nc >= 0 && nc < width && !visited[nr][nc]) {
        if (carve(nr, nc, depth + 1)) return true;
      }
    }
    
    path.pop();
    visited[r][c] = false;
    return false;
  }
  
  let success = false;
  let attempts = 0;
  while (!success && attempts < 300) {
    const startR = Math.floor(rand() * height);
    const startC = Math.floor(rand() * width);
    path = [];
    for (let r = 0; r < height; r++) visited[r].fill(false);
    
    if (carve(startR, startC, 1)) {
      success = true;
    }
    attempts++;
    
    // If we are struggling to carve, slightly reduce desiredLength to increase density/wiggle room
    if (attempts === 150 && desiredLength > 12) {
      desiredLength = Math.max(10, Math.floor(desiredLength * 0.85));
    }
  }
  
  if (!success) {
    // Bulletproof dynamic snake path fallback of exact requested dimensions!
    path = [];
    for (let r = 0; r < height; r++) {
      if (r % 2 === 0) {
        for (let c = 0; c < width; c++) {
          path.push([r, c]);
        }
      } else {
        for (let c = width - 1; c >= 0; c--) {
          path.push([r, c]);
        }
      }
    }
    success = true;
  }
  
  const grid: { type: 'empty' | 'obstacle' | 'number'; numberValue?: number; }[][] = Array.from({ length: height }, () => 
    Array.from({ length: width }, () => ({ type: 'obstacle' as const }))
  );
  
  path.forEach(([r, c]) => {
    grid[r][c] = { type: 'empty' as const };
  });
  
  // Start number is 1
  const [sR, sC] = path[0];
  grid[sR][sC] = { type: 'number' as const, numberValue: 1 };
  
  // Place other sequence markers evenly along the carved route
  const actualNumbers = maxNumbersCount;
  const numInterval = Math.floor((path.length - 1) / (actualNumbers - 1));
  
  for (let i = 2; i <= actualNumbers; i++) {
    const targetIdx = (i === actualNumbers) ? path.length - 1 : (i - 1) * numInterval;
    const clampIdx = Math.min(path.length - 1, Math.max(1, targetIdx));
    const [pR, pC] = path[clampIdx];
    grid[pR][pC] = { type: 'number' as const, numberValue: i };
  }
  
  return {
    id,
    name,
    difficulty,
    width,
    height,
    grid,
    solution: path
  };
}

export const getDailyLevel = (dateStr: string): ZipLevel => {
  const d = new Date(dateStr);
  const day = d.getDate();
  const diffs: ('fácil' | 'medio' | 'difícil')[] = ['fácil', 'medio', 'difícil'];
  const difficulty = diffs[day % 3]; // Easy/Med/Hard rotating daily
  
  return generateRandomZipLevel(
    99999,
    `Reto Diario - ${d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    difficulty,
    "daily-zip-" + dateStr
  );
};

interface UserProgress {
  solvedLevels: { [key: number]: { stars: number; bestTime: number } };
  currentStreak: number;
  lastSolvedDate: string; // YYYY-MM-DD
  streakFreezes: number;
  lastDailySolvedDate?: string;
  solveHistory?: {
    levelId: number;
    name: string;
    difficulty: 'fácil' | 'medio' | 'difícil';
    time: number;
    date: string;
  }[];
}

const LOCAL_STORAGE_KEY = 'zip_puzzle_user_progress';

export default function ZipGame() {
  // Game States
  const [progress, setProgress] = useState<UserProgress>({
    solvedLevels: {},
    currentStreak: 0,
    lastSolvedDate: '',
    streakFreezes: 2,
    lastDailySolvedDate: ''
  });

  const [currentLevel, setCurrentLevel] = useState<ZipLevel | null>(null);
  const [activeTab, setActiveTab] = useState<'levels' | 'fácil' | 'medio' | 'difícil' | 'stats'>('levels');
  const [showTutorial, setShowTutorial] = useState(false);
  const [userPath, setUserPath] = useState<[number, number][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [levelSolved, setLevelSolved] = useState(false);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [hintCell, setHintCell] = useState<[number, number] | null>(null);
  const [showDivergenceMsg, setShowDivergenceMsg] = useState(false);
  const [starRating, setStarRating] = useState(3);
  const [celebrationConfetti, setCelebrationConfetti] = useState<{
    id: number;
    startX: number;
    startY: number;
    color: string;
    size: number;
    shape: 'star' | 'circle' | 'sparkle' | 'ring' | 'ribbon';
    duration: number;
    delay: number;
    swayDirs: number[];
    glow: boolean;
  }[]>([]);
  
  // Ambient Sound & Twilight Cosmic stars states
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('zip_sound_muted') === 'true';
    }
    return false;
  });
  const [stars, setStars] = useState<{ id: number; rX: number; rY: number; size: number; delay: number }[]>([]);

  // Refs for Touch and Move logic
  const gridRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync showSuccessCard and levelSolved state with a delayed timer
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (levelSolved) {
      timeoutId = setTimeout(() => {
        setShowSuccessCard(true);
      }, 1800);
    } else {
      setShowSuccessCard(false);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [levelSolved]);

  // Twinkle generator and audio sync
  useEffect(() => {
    isAudioSynthMuted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const arr = [];
    for (let i = 0; i < 45; i++) {
      arr.push({
        id: i,
        rX: Math.random() * 100,
        rY: Math.random() * 100,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 5
      });
    }
    setStars(arr);
  }, []);

  // Load user progress
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProgress({
          solvedLevels: parsed.solvedLevels || {},
          currentStreak: parsed.currentStreak || 0,
          lastSolvedDate: parsed.lastSolvedDate || '',
          streakFreezes: typeof parsed.streakFreezes === 'number' ? parsed.streakFreezes : 2,
          lastDailySolvedDate: parsed.lastDailySolvedDate || '',
          solveHistory: parsed.solveHistory || []
        });
      } catch (e) {
        console.error("Error loading progress", e);
      }
    } else {
      // First-time users
      setShowTutorial(true);
    }
  }, []);

  // Save progress helper
  const saveProgress = (updated: UserProgress) => {
    setProgress(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  };

  // Reset all stats / level progress
  const handleResetAllData = () => {
    if (window.confirm("¿Seguro que quieres borrar todo tu progreso, estadísticas y racha?")) {
      const reset: UserProgress = {
        solvedLevels: {},
        currentStreak: 0,
        lastSolvedDate: '',
        streakFreezes: 2,
        lastDailySolvedDate: '',
        solveHistory: []
      };
      saveProgress(reset);
      setCurrentLevel(null);
      setActiveTab('levels');
    }
  };

  // Timer logic
  useEffect(() => {
    if (isTimerActive && !levelSolved) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerActive, levelSolved]);

  // Streak verification logic on mount or day change
  useEffect(() => {
    if (progress.lastSolvedDate) {
      const todayStr = getLocalDateString(new Date());
      const yesterdayStr = getLocalDateString(getRelativeDate(-1));
      
      if (progress.lastSolvedDate !== todayStr && progress.lastSolvedDate !== yesterdayStr) {
        // Streak is broken because user missed yesterday! Let's check for streak freeze.
        if (progress.streakFreezes > 0) {
          // Auto-apply freeze!
          const unusedDays = getDaysBetween(progress.lastSolvedDate, todayStr) - 1;
          const freezesToUse = Math.min(unusedDays, progress.streakFreezes);
          
          if (freezesToUse > 0) {
            const updated: UserProgress = {
              ...progress,
              streakFreezes: progress.streakFreezes - freezesToUse,
              lastSolvedDate: yesterdayStr // Maintain streak as of yesterday
            };
            saveProgress(updated);
          } else {
            const updated: UserProgress = {
              ...progress,
              currentStreak: 0
            };
            saveProgress(updated);
          }
        } else {
          const updated: UserProgress = {
            ...progress,
            currentStreak: 0
          };
          saveProgress(updated);
        }
      }
    }
  }, [progress.lastSolvedDate]);

  // Start a Level
  const handleStartLevel = (level: ZipLevel) => {
    setCurrentLevel(level);
    setUserPath([]);
    // Find coordinate of "1"
    let startRow = -1;
    let startCol = -1;
    for (let r = 0; r < level.height; r++) {
      for (let c = 0; c < level.width; c++) {
        const cell = level.grid[r][c];
        if (cell.type === 'number' && cell.numberValue === 1) {
          startRow = r;
          startCol = c;
          break;
        }
      }
      if (startRow !== -1) break;
    }

    if (startRow !== -1) {
      setUserPath([[startRow, startCol]]);
    }
    setTimer(0);
    setIsTimerActive(true);
    setLevelSolved(false);
    setHintCell(null);
    setShowDivergenceMsg(false);
  };

  const handleStartDailyLevel = () => {
    const todayStr = getLocalDateString(new Date());
    const dailyLvl = getDailyLevel(todayStr);
    handleStartLevel(dailyLvl);
  };

  const handleStartRandomLevel = (difficulty: 'fácil' | 'medio' | 'difícil') => {
    const randomId = 88888;
    const rndTitle = `Forjado Cósmico (${difficulty.toUpperCase()})`;
    const generated = generateRandomZipLevel(randomId, rndTitle, difficulty);
    handleStartLevel(generated);
  };

  // Grid Info Calculations
  const getWalkableCount = (level: ZipLevel): number => {
    let count = 0;
    for (let r = 0; r < level.height; r++) {
      for (let c = 0; c < level.width; c++) {
        if (level.grid[r][c].type !== 'obstacle') {
          count++;
        }
      }
    }
    return count;
  };

  // Trace validation
  const handleCellEnter = (r: number, c: number) => {
    if (!currentLevel || levelSolved) return;

    // Check if cell is obstacle
    const cell = currentLevel.grid[r][c];
    if (cell.type === 'obstacle') {
      playErrorSound();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(40);
      }
      return;
    }

    // Is drawing active? Check if we have path
    if (userPath.length === 0) {
      // Must start on 1
      if (cell.type === 'number' && cell.numberValue === 1) {
        setUserPath([[r, c]]);
        playMoveSound(0);
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(8);
        }
      }
      return;
    }

    const [lastR, lastC] = userPath[userPath.length - 1];

    // Click same as last cell - no-op
    if (lastR === r && lastC === c) return;

    // Check if drawing backtracking to the previous element
    if (userPath.length > 1) {
      const [prevR, prevC] = userPath[userPath.length - 2];
      if (prevR === r && prevC === c) {
        // Backtrack! Remove the last element
        setUserPath(prev => prev.slice(0, -1));
        setHintCell(null);
        playUndoSound();
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(12);
        }
        return;
      }
    }

    // Check if entering a cell already in path (not second to last)
    const existsIndex = userPath.findIndex(([pr, pc]) => pr === r && pc === c);
    if (existsIndex !== -1) {
      // Truncate path to this cell for super-satisfying redraws!
      setUserPath(prev => prev.slice(0, existsIndex + 1));
      setHintCell(null);
      playUndoSound();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(12);
      }
      return;
    }

    // Check adjacent bounds
    const rowDiff = Math.abs(lastR - r);
    const colDiff = Math.abs(lastC - c);
    if (rowDiff + colDiff !== 1) {
      // Not adjacent - error feedback
      playErrorSound();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(40);
      }
      return;
    }

    // Sequenced Number Lock verification
    if (cell.type === 'number' && cell.numberValue) {
      const val = cell.numberValue;
      // Get highest number value currently in path
      let maxInPath = 1;
      userPath.forEach(([pr, pc]) => {
        const pcCell = currentLevel.grid[pr][pc];
        if (pcCell.type === 'number' && pcCell.numberValue) {
          maxInPath = Math.max(maxInPath, pcCell.numberValue);
        }
      });

      // To step on number 'val', it must be exactly 'maxInPath + 1'
      if (val !== maxInPath + 1) {
        // Out of order! Play blocker error chime
        playErrorSound();
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(40);
        }
        return;
      }
    }

    // All checks pass! Add cell to path
    const updatedPath = [...userPath, [r, c] as [number, number]];
    setUserPath(updatedPath);
    setHintCell(null);
    setShowDivergenceMsg(false);
    
    // Play satisfying scale interval chime
    playMoveSound(updatedPath.length - 1);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(8);
    }

    // Check if solved
    checkVictory(updatedPath);
  };

  const checkVictory = (path: [number, number][]) => {
    if (!currentLevel) return;

    const totalWalkable = getWalkableCount(currentLevel);
    if (path.length === totalWalkable) {
      // Needs to end at the highest number in this level
      let highestNum = 1;
      for (let r = 0; r < currentLevel.height; r++) {
        for (let c = 0; c < currentLevel.width; c++) {
          const cell = currentLevel.grid[r][c];
          if (cell.type === 'number' && cell.numberValue) {
            highestNum = Math.max(highestNum, cell.numberValue);
          }
        }
      }

      // Last cell in path
      const [lastR, lastC] = path[path.length - 1];
      const lastCell = currentLevel.grid[lastR][lastC];
      if (lastCell.type === 'number' && lastCell.numberValue === highestNum) {
        // WINNER!
        handleLevelVictory();
      }
    }
  };

  // Convert time to rating
  const calculateStars = (level: ZipLevel, seconds: number): number => {
    // Standard target times in seconds
    let target3 = 10; // Fácil Under 10s
    let target2 = 25; // Fácil Under 25s
    
    if (level.difficulty === 'medio') {
      target3 = 20;
      target2 = 50;
    } else if (level.difficulty === 'difícil') {
      target3 = 40;
      target2 = 90;
    }

    if (seconds <= target3) return 3;
    if (seconds <= target2) return 2;
    return 1;
  };

  const handleLevelVictory = () => {
    if (!currentLevel) return;
    setLevelSolved(true);
    setIsTimerActive(false);
    playWinSound(); // Play major cosmic victory tone
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([15, 30, 15]);
    }

    const stars = calculateStars(currentLevel, timer);
    setStarRating(stars);

    // Update LocalStorage progress
    const todayStr = getLocalDateString(new Date());
    const yesterdayStr = getLocalDateString(getRelativeDate(-1));
    let newStreak = progress.currentStreak;

    if (progress.lastSolvedDate !== todayStr) {
      if (progress.lastSolvedDate === yesterdayStr || progress.currentStreak === 0) {
        newStreak += 1;
      } else {
        // Streak is preserved or reset by the initial check, keep it up
        newStreak += 1;
      }
    }

    // Earn streak freezes: +1 freeze for every 5 unique levels solved
    const alreadySolvedCount = Object.keys(progress.solvedLevels).length;
    const isNewSolve = !progress.solvedLevels[currentLevel.id];
    let newFreezes = progress.streakFreezes;

    if (isNewSolve) {
      const newlySolvedCount = alreadySolvedCount + 1;
      if (newlySolvedCount % 5 === 0) {
        newFreezes += 1;
      }
    }

    const previousBest = progress.solvedLevels[currentLevel.id];
    const bestTime = previousBest ? Math.min(previousBest.bestTime, timer) : timer;
    const bestStars = previousBest ? Math.max(previousBest.stars, stars) : stars;

    let isDailyCompleted = progress.lastDailySolvedDate === todayStr;
    if (currentLevel.id === 99999) {
      isDailyCompleted = true;
    }

    const updated: UserProgress = {
      solvedLevels: {
        ...progress.solvedLevels,
        [currentLevel.id]: { stars: bestStars, bestTime }
      },
      currentStreak: newStreak,
      lastSolvedDate: todayStr,
      streakFreezes: newFreezes,
      lastDailySolvedDate: isDailyCompleted ? todayStr : (progress.lastDailySolvedDate || ''),
      solveHistory: [
        ...(progress.solveHistory || []),
        {
          levelId: currentLevel.id,
          name: currentLevel.name,
          difficulty: currentLevel.difficulty,
          time: timer,
          date: todayStr
        }
      ]
    };

    saveProgress(updated);
    generateConfetti();
  };

  const generateConfetti = () => {
    const arr: {
      id: number;
      startX: number;
      startY: number;
      color: string;
      size: number;
      shape: 'star' | 'circle' | 'sparkle' | 'ring' | 'ribbon';
      duration: number;
      delay: number;
      swayDirs: number[];
      glow: boolean;
    }[] = [];

    const colors = [
      '#6366f1', // Galactic Indigo/Violet
      '#a855f7', // Cosmic Purple
      '#ec4899', // Nebula Pink
      '#22d3ee', // Supernova Cyan
      '#34d399', // Aurora Green
      '#f59e0b', // Stellar Amber Gold
      '#fcfcfc'  // Celestial White
    ];

    const shapes: ('star' | 'circle' | 'sparkle' | 'ring' | 'ribbon')[] = [
      'star', 'circle', 'sparkle', 'ring', 'ribbon'
    ];

    // Generate balanced mix of 80 aesthetic cosmic particles
    for (let i = 0; i < 85; i++) {
      const startX = Math.random() * 100; // random spawn horizontally across full viewport %
      const swayLimit = Math.random() * 12 + 4; // amount of side-to-side drift (vw)
      const swayDirection = Math.random() > 0.5 ? 1 : -1;

      arr.push({
        id: i,
        startX: startX,
        startY: Math.random() * -30 - 10, // high-altitude spawn to ease into vision
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 11 + 6, // sizes between 6px and 17px
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        duration: Math.random() * 2.8 + 2.4, // duration of the fall: 2.4s to 5.2s (feels very ethereal and gentle)
        delay: Math.random() * 0.5, // staggered launch times
        // A series of coordinates to build a beautiful sinus sway path keyframes
        swayDirs: [
          0,
          swayDirection * swayLimit * 0.35,
          -swayDirection * swayLimit * 0.2,
          swayDirection * swayLimit * 0.75,
          -swayDirection * swayLimit * 0.1,
          swayDirection * swayLimit * 0.4
        ],
        glow: Math.random() > 0.6
      });
    }
    setCelebrationConfetti(arr);
  };

  // PC Drawing Events
  const handleMouseDown = (r: number, c: number) => {
    if (levelSolved) return;
    // Set drawing true
    setIsDrawing(true);

    const cell = currentLevel?.grid[r][c];
    if (userPath.length === 0 && cell?.type === 'number' && cell.numberValue === 1) {
      setUserPath([[r, c]]);
    } else {
      // Just step on it
      handleCellEnter(r, c);
    }
  };

  const handleMouseEnter = (r: number, c: number) => {
    if (isDrawing) {
      handleCellEnter(r, c);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  // Mobile Drawing Events via touch tracking using client coordinates
  const handleTouchStart = (e: React.TouchEvent, r: number, c: number) => {
    if (levelSolved) return;
    setIsDrawing(true);
    const cell = currentLevel?.grid[r][c];
    if (userPath.length === 0 && cell?.type === 'number' && cell.numberValue === 1) {
      setUserPath([[r, c]]);
    } else {
      handleCellEnter(r, c);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDrawing || levelSolved) return;
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element) {
      const rowAttr = element.getAttribute("data-row");
      const colAttr = element.getAttribute("data-col");
      if (rowAttr !== null && colAttr !== null) {
        const r = parseInt(rowAttr, 10);
        const c = parseInt(colAttr, 10);
        handleCellEnter(r, c);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDrawing(false);
  };

  // Global mouse up safety
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDrawing(false);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  // Back / Reset functions
  const handleUndo = () => {
    if (userPath.length > 1) {
      setUserPath(prev => prev.slice(0, -1));
      setHintCell(null);
      setShowDivergenceMsg(false);
      playUndoSound();
    }
  };

  const handleResetLevel = () => {
    if (!currentLevel) return;
    // Find coordinate of "1"
    let startRow = -1;
    let startCol = -1;
    for (let r = 0; r < currentLevel.height; r++) {
      for (let c = 0; c < currentLevel.width; c++) {
        const cell = currentLevel.grid[r][c];
        if (cell.type === 'number' && cell.numberValue === 1) {
          startRow = r;
          startCol = c;
          break;
        }
      }
      if (startRow !== -1) break;
    }
    if (startRow !== -1) {
      setUserPath([[startRow, startCol]]);
    } else {
      setUserPath([]);
    }
    setTimer(0);
    setLevelSolved(false);
    setHintCell(null);
    setShowDivergenceMsg(false);
    setIsTimerActive(true);
    playUndoSound();
  };

  // intelligent Snap & Hint System
  const handleGetHint = () => {
    if (!currentLevel || levelSolved) return;

    const sol = currentLevel.solution;
    if (!sol || sol.length === 0) return;

    // Check where user's path diverges from pre-calculated solution
    let matchingLength = 0;
    for (let i = 0; i < userPath.length; i++) {
      if (i >= sol.length) break;
      if (userPath[i][0] === sol[i][0] && userPath[i][1] === sol[i][1]) {
        matchingLength++;
      } else {
        break;
      }
    }

    if (matchingLength < userPath.length) {
      // Divergence found! Auto truncate path to the last matching cell and highlight the next step!
      setShowDivergenceMsg(true);
      setTimeout(() => setShowDivergenceMsg(false), 2500);
      
      const newPath = userPath.slice(0, Math.max(1, matchingLength));
      setUserPath(newPath);
      playErrorSound();

      // Highlight the next right cell
      const nextStepIndex = Math.max(1, matchingLength);
      if (nextStepIndex < sol.length) {
        setHintCell(sol[nextStepIndex]);
      }
    } else {
      // User path is perfect prefix of solution.
      // Highlight the very next cell
      const nextStepIndex = userPath.length;
      if (nextStepIndex < sol.length) {
        setHintCell(sol[nextStepIndex]);
        playHintSound();
      }
    }
  };

  // Keyboard Navigation Controls
  useEffect(() => {
    if (!currentLevel || levelSolved) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // Undo on Backspace or U
      if (key === 'backspace' || key === 'u') {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Restart on R
      if (key === 'r') {
        e.preventDefault();
        handleResetLevel();
        return;
      }

      // Hint on H
      if (key === 'h') {
        e.preventDefault();
        handleGetHint();
        return;
      }

      // Movement keys (WASD / Arrows)
      let dr = 0;
      let dc = 0;

      if (key === 'arrowup' || key === 'w') {
        dr = -1;
      } else if (key === 'arrowdown' || key === 's') {
        dr = 1;
      } else if (key === 'arrowleft' || key === 'a') {
        dc = -1;
      } else if (key === 'arrowright' || key === 'd') {
        dc = 1;
      }

      if (dr !== 0 || dc !== 0) {
        e.preventDefault();
        if (userPath.length > 0) {
          const [lastR, lastC] = userPath[userPath.length - 1];
          const targetR = lastR + dr;
          const targetC = lastC + dc;

          // Check grid boundaries
          if (
            targetR >= 0 &&
            targetR < currentLevel.height &&
            targetC >= 0 &&
            targetC < currentLevel.width
          ) {
            handleCellEnter(targetR, targetC);
          } else {
            playErrorSound();
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate(40);
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentLevel, levelSolved, userPath]);

  // Helper date conversions
  const getLocalDateString = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getRelativeDate = (offsetDays: number): Date => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d;
  };

  const getDaysBetween = (dateStr1: string, dateStr2: string): number => {
    const d1 = new Date(dateStr1);
    const d2 = new Date(dateStr2);
    const diffMs = d2.getTime() - d1.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  };

  const formatTime = (sec: number): string => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  // Level selector list filtering
  const filteredLevels = ZIP_LEVELS.filter(lvl => {
    if (activeTab === 'stats') return false;
    if (activeTab === 'levels') return true;
    return lvl.difficulty === activeTab;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-[#E0E0E0] font-sans antialiased selection:bg-indigo-500/30 selection:text-white pb-12 relative overflow-hidden transition-all duration-300">
      
      {/* COSMIC CANVAS BACKGROUND WITH JOINING CONSTELLATIONS & FLOATING STAR DUST */}
      <CosmicCanvasBackground />

      {/* ADDITIONAL ATMOSPHERIC DEEP SPACE GLOWS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute -top-60 -left-60 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[40%] right-[-200px] w-[450px] h-[450px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '11s' }} />
        <div className="absolute bottom-[-150px] left-[20%] w-[550px] h-[550px] bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDuration: '14s' }} />
      </div>

      {/* HEADER BANNER */}
      <header className="sticky top-0 z-40 bg-[#0E1015]/90 border-b border-slate-800/60 shadow-md backdrop-blur-md relative z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 font-extrabold tracking-widest text-xl leading-none flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
              Z
            </span>
            <div>
              <h1 id="app-title" className="text-xl font-bold tracking-tight text-white leading-tight flex items-center gap-1.5">
                Zip
                <span className="text-[10px] uppercase font-bold tracking-widest bg-indigo-950/40 px-2 py-0.5 rounded text-indigo-400 border border-indigo-900/30">
                  CÓSMICO
                </span>
              </h1>
            </div>
          </div>

          {/* User Progress Stats Header widget */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-700/50 px-2.5 py-1.5 rounded-lg text-amber-500" title="Racha activa de juego">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
              <span className="text-sm font-semibold tracking-tight">{progress.currentStreak} d</span>
            </div>

            <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-700/50 px-2.5 py-1.5 rounded-lg text-sky-400" title="Congeladores de racha disponibles (Ganas 1 por cada 5 niveles completados)">
              <Snowflake className="w-4 h-4 text-sky-400 animate-spin-slow" />
              <span className="text-sm font-semibold tracking-tight">{progress.streakFreezes}</span>
            </div>

            {/* Audio Toggle button */}
            <button
              onClick={() => setIsMuted(prev => {
                const n = !prev;
                localStorage.setItem('zip_sound_muted', String(n));
                return n;
              })}
              className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800/80 text-slate-300 border border-slate-700/50 transition-all duration-150 flex items-center justify-center cursor-pointer"
              title={isMuted ? "Activar sintetizador de sonidos cósmicos" : "Silenciar sonidos"}
            >
              {isMuted ? <VolumeX className="w-4.5 h-4.5 text-rose-400" /> : <Volume2 className="w-4.5 h-4.5 text-emerald-400" />}
            </button>

            <button 
              onClick={() => setShowTutorial(true)} 
              className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800/80 text-slate-300 border border-slate-700/50 transition-colors duration-150 cursor-pointer" 
              title="Guía de reglas de Zip"
            >
              <HelpCircle className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* BODY WRAPPER */}
      <main className="max-w-4xl mx-auto px-4 mt-8 relative z-10">
        {!currentLevel ? (
          /* ================= LEVEL MENU VIEW ================= */
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Quick Greeting & Game Introduction Card */}
            <div className="bg-slate-950/40 backdrop-blur-md text-white rounded-2xl p-6 border border-indigo-500/20 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[0_4px_30px_rgba(99,102,241,0.06)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.12),transparent_60%)] pointer-events-none" />
              <div className="space-y-2 relative z-10 max-w-lg">
                <span className="text-xs uppercase font-extrabold text-indigo-400 tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  Puzles Diarios y Desafíos Cósmicos
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-white">Completa la cuadrícula sin levantar el dedo</h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Trazarás una línea continua comenzando en el número <strong>1</strong>, pasando por todas las casillas en blanco exactamente una vez, para conectar los números ascendentes de forma segura.
                </p>
              </div>
              <button 
                onClick={() => setShowTutorial(true)}
                className="relative z-10 shrink-0 flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:brightness-110 duration-155 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-lg shadow-indigo-500/25 cursor-pointer active:scale-95 transition-all"
              >
                <BookOpen className="w-4 h-4" />
                Reglas y Líneas
              </button>
            </div>

            {/* ================= BENTO COSMIC CHALLENGES PANEL ================= */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
              {/* Daily Challenge Card */}
              {(() => {
                const todayStr = getLocalDateString(new Date());
                const isDailyCompletedToday = progress.lastDailySolvedDate === todayStr;
                const dLevel = getDailyLevel(todayStr);
                
                return (
                  <div className="relative overflow-hidden rounded-2xl border border-indigo-550/25 bg-slate-950/45 backdrop-blur-md p-6 shadow-2xl flex flex-col justify-between group transition-all duration-300 hover:border-indigo-500/40 hover:shadow-[0_0_25px_rgba(99,102,241,0.12)]">
                    {/* Glowing cosmic nebula backdrop */}
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-36 h-36 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-300" />
                    
                    <div className="space-y-3 relative z-10">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 bg-indigo-950/40 border border-indigo-900/40 px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Reto Diario
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-amber-950/40 text-amber-400 border border-amber-900/40">
                          {dLevel.difficulty}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-white leading-tight">
                        {dLevel.name}
                      </h3>
                      
                      <p className="text-indigo-200/70 text-xs leading-relaxed">
                        Completa el reto cósmico del día generado para alimentar tu racha. ¡Todos los navegantes se enfrentan al mismo mapa estelar hoy!
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-indigo-500/15 flex flex-col gap-4 relative z-10">
                      <div className="flex items-center justify-between">
                        <div>
                          {isDailyCompletedToday ? (
                            <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-xs bg-emerald-950/40 py-1.5 px-3 rounded-lg border border-emerald-500/20">
                              <CheckCircle2 className="w-4 h-4 text-emerald-450" />
                              Completado Hoy
                            </div>
                          ) : (
                            <span className="text-xs text-indigo-300 font-medium">Recompensa: +1 Racha 🔥</span>
                          )}
                        </div>
                        
                        <button
                          onClick={handleStartDailyLevel}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:brightness-110 active:scale-95 duration-150 shadow-md shadow-indigo-500/20 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          {isDailyCompletedToday ? 'Repetir Desafío' : 'Jugar Reto'}
                        </button>
                      </div>

                      {/* Exclusive Infinite Mode Access After Daily Completion */}
                      {isDailyCompletedToday && (
                        <div className="pt-3.5 border-t border-indigo-500/10 space-y-2.5">
                          <p className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                            ¡Acceso a Forja Infinita!
                          </p>
                          <p className="text-slate-400 text-[11px] leading-relaxed">
                            Has completado el mapa de hoy. Sigue desafiando tu mente con puzles aleatorios ilimitados y resolubles:
                          </p>
                          <div className="grid grid-cols-3 gap-2 pt-1">
                            {(['fácil', 'medio', 'difícil'] as const).map(diff => (
                              <button
                                key={diff}
                                onClick={() => handleStartRandomLevel(diff)}
                                className="py-2 px-1 rounded-xl text-[10px] uppercase font-bold text-white border transition-all cursor-pointer bg-slate-950/30 flex flex-col items-center justify-center gap-0.5 hover:bg-sky-950/30 hover:border-sky-500/50 border-slate-800/80 active:scale-95"
                              >
                                <span className={
                                  diff === 'fácil' ? 'text-emerald-400' : diff === 'medio' ? 'text-amber-400' : 'text-rose-400'
                                }>
                                  {diff}
                                </span>
                                <span className="text-[7.5px] text-slate-500 font-normal lowercase tracking-normal">
                                  {diff === 'fácil' ? '4x4 o 4x5' : diff === 'medio' ? '5x5 o 5x6' : '6x6 o 7x7'}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Infinite Procedural Generator Card */}
              <div className="relative overflow-hidden rounded-2xl border border-sky-500/25 bg-slate-950/45 backdrop-blur-md p-6 shadow-2xl flex flex-col justify-between group transition-all duration-300 hover:border-sky-500/40 hover:shadow-[0_0_25px_rgba(34,211,238,0.12)]">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-36 h-36 rounded-full bg-sky-500/10 blur-2xl pointer-events-none group-hover:bg-sky-500/20 transition-all duration-300" />
                
                <div className="space-y-3 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-sky-400 bg-sky-950/40 border border-sky-900/50 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-spin-slow" />
                      Forjador Cósmico
                    </span>
                    <span className="text-[9px] uppercase font-semibold text-slate-500 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800">
                      ILIMITADO
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white leading-tight">
                    Puzles Aleatorios Infinitos
                  </h3>
                  
                  <p className="text-sky-200/70 text-xs leading-relaxed">
                    ¿Te diste un paseo por todos los niveles? El forjador utiliza un algoritmo para tallar cuadrículas de Zip 100% válidas y resolubles.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/70 space-y-2 relative z-10">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    Selecciona dificultad para forjar en el acto:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['fácil', 'medio', 'difícil'] as const).map(diff => (
                      <button
                        key={diff}
                        onClick={() => handleStartRandomLevel(diff)}
                        className="py-1.5 px-1 rounded-lg text-[10px] uppercase font-extrabold tracking-wider text-white border transition-all cursor-pointer bg-slate-950/40 flex flex-col items-center justify-center gap-0.5 hover:bg-sky-950/30 hover:border-sky-500/50 border-slate-800 active:scale-95"
                      >
                        <span className={
                          diff === 'fácil' ? 'text-emerald-400' : diff === 'medio' ? 'text-amber-400' : 'text-rose-400'
                        }>
                          {diff}
                        </span>
                        <span className="text-[8px] text-slate-500 font-normal lowercase tracking-normal">
                          {diff === 'fácil' ? '4x4 o 4x5' : diff === 'medio' ? '5x5 o 5x6' : '6x6 o 7x7'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Level Statistics Panel */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-950/45 border border-indigo-500/15 backdrop-blur-md rounded-2xl p-4 shadow-md">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completados</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {Object.keys(progress.solvedLevels).length} / {ZIP_LEVELS.length}
                </p>
              </div>
              <div className="bg-slate-950/45 border border-indigo-500/15 backdrop-blur-md rounded-2xl p-4 shadow-md">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Porcentaje</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {Math.round((Object.keys(progress.solvedLevels).length / ZIP_LEVELS.length) * 100)}%
                </p>
              </div>
              <div className="bg-slate-950/45 border border-indigo-500/15 backdrop-blur-md rounded-2xl p-4 shadow-md">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Racha Histórica</p>
                <p className="text-2xl font-bold text-amber-500 mt-1 flex items-center gap-1">
                  <Flame className="w-5 h-5 text-amber-500 fill-amber-500 inline" />
                  {progress.currentStreak}
                </p>
              </div>
              <div className="bg-slate-950/45 border border-indigo-500/15 backdrop-blur-md rounded-2xl p-4 shadow-md flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Congela-Rachas</p>
                </div>
                <p className="text-2xl font-bold text-indigo-400 mt-1">
                  {progress.streakFreezes}
                </p>
              </div>
            </div>

            {/* Level difficulty tabs filtering */}
            <div className="flex border-b border-indigo-950/60 flex-wrap overflow-x-auto gap-0.5">
              {(['levels', 'fácil', 'medio', 'difícil', 'stats'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-5 text-sm font-semibold border-b-2 capitalize transition-all duration-155 -mb-px outline-none cursor-pointer rounded-t-lg flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-indigo-400 text-indigo-400 bg-indigo-500/5'
                      : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab === 'levels' ? 'Todos los Niveles' : tab === 'stats' ? 'Estadísticas 📊' : tab}
                </button>
              ))}
            </div>

            {/* Level selector grid / statistics panel display */}
            {activeTab === 'stats' ? (
              <PlayerStatsPanel progress={progress} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredLevels.map((lvl) => {
                  const isSolved = !!progress.solvedLevels[lvl.id];
                  const stats = progress.solvedLevels[lvl.id];
                  
                  return (
                    <div
                      key={lvl.id}
                      onClick={() => handleStartLevel(lvl)}
                      className={`relative bg-slate-950/40 backdrop-blur-md border rounded-2xl p-5 shadow-inner hover:shadow-[0_0_20px_rgba(99,102,241,0.1)] cursor-pointer transition-all duration-200 group overflow-hidden hover:scale-[1.02] ${
                        isSolved 
                          ? 'border-emerald-500/30 bg-emerald-950/5 hover:border-emerald-500/50' 
                          : 'border-indigo-500/10 hover:border-indigo-400/30'
                      }`}
                    >
                      {/* Corner badge solved indicator */}
                      {isSolved && (
                        <div className="absolute top-0 right-0 bg-emerald-600 text-white px-2 py-1 rounded-bl-lg">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold tracking-wider text-slate-500">
                            Nivel {lvl.id}
                          </span>
                          <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                            lvl.difficulty === 'fácil' 
                              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40'
                              : lvl.difficulty === 'medio'
                              ? 'bg-amber-950/40 text-amber-400 border border-amber-900/40'
                              : 'bg-rose-950/40 text-rose-400 border border-rose-900/40'
                          }`}>
                            {lvl.difficulty}
                          </span>
                        </div>

                        <h3 className="text-base font-semibold text-[#E0E0E0] group-hover:text-indigo-400 transition-colors duration-150">
                          {lvl.name}
                        </h3>

                        <div className="flex items-center justify-between pt-1 border-t border-indigo-500/10 text-xs text-slate-400">
                          <span>
                            {lvl.width}x{lvl.height} • {getWalkableCount(lvl)} celdas
                          </span>
                          {isSolved && stats && (
                            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{formatTime(stats.bestTime)}</span>
                            </div>
                          )}
                        </div>

                        {/* Display earned stars */}
                        {isSolved && stats && (
                          <div className="flex items-center gap-1 pt-1.5">
                            {[1, 2, 3].map((val) => (
                              <Star
                                key={val}
                                className={`w-3.5 h-3.5 ${
                                  val <= stats.stars 
                                    ? 'text-amber-400 fill-amber-400' 
                                    : 'text-slate-700'
                                  }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-6 border-t border-[#2C2C2C] flex justify-between items-center">
              <p className="text-xs text-slate-500">
                Resuelve diariamente un rompecabezas de Zip para consolidar tu racha.
              </p>
              <button
                onClick={handleResetAllData}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-rose-950/20 transition-colors duration-150 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Borrar Datos
              </button>
            </div>
          </motion.div>
        ) : (
          /* ================= GAMEPLAY ARENA VIEW ================= */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col lg:flex-row gap-8 items-start justify-center"
          >
            {/* Main Game Interface Left Column */}
            <div className="w-full lg:max-w-xl space-y-5">
              
              {/* Top breadcrumbs / nav */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentLevel(null)}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white group cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 duration-150" />
                  Inicio
                </button>
                <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-[#999]">
                  <span>Nivel {currentLevel.id}</span>
                  <span>•</span>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                    currentLevel.difficulty === 'fácil' 
                      ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40'
                      : currentLevel.difficulty === 'medio'
                      ? 'bg-amber-950/40 text-amber-400 border border-amber-900/40'
                      : 'bg-rose-950/40 text-rose-400 border border-rose-900/40'
                  }`}>
                    {currentLevel.difficulty}
                  </span>
                </div>
              </div>

              {/* Level Info Header Card */}
              <div className="bg-slate-950/40 backdrop-blur-md border border-indigo-500/15 rounded-2xl p-5 shadow-lg relative">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-white">{currentLevel.name}</h2>
                    <p className="text-slate-400 text-sm">
                      Dibuja arrastrando sobre la cuadrícula. Conecta los números en orden ascendente (1, 2, 3...) visitando todas las celdas blancas exactamente una vez.
                    </p>
                  </div>

                  <div className="bg-indigo-950/40 border border-indigo-500/30 px-3 py-2 rounded-xl flex items-center gap-2 text-indigo-400 select-none">
                    <Clock className="w-4 h-4 text-indigo-400 animate-pulse" />
                    <span className="font-mono font-bold text-base tracking-tight leading-none min-w-[36px] text-white">
                      {formatTime(timer)}
                    </span>
                  </div>
                </div>

                {/* Star rating hints / goals times */}
                <div className="mt-4 pt-3 border-t border-indigo-500/10 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500 items-center justify-between">
                  <span>
                    Objetivo: {getWalkableCount(currentLevel)} celdas transitables
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 3★: 
                      {currentLevel.difficulty === 'fácil' ? ' <10s' : currentLevel.difficulty === 'medio' ? ' <20s' : ' <40s'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> 2★: 
                      {currentLevel.difficulty === 'fácil' ? ' <25s' : currentLevel.difficulty === 'medio' ? ' <50s' : ' <90s'}
                    </span>
                  </div>
                </div>
              </div>

              {/* THE GRID CONTAINER CARD */}
              <div className="bg-slate-950/45 border border-indigo-500/20 backdrop-blur-md rounded-3xl p-6 shadow-xl overflow-hidden select-none bg-radial-dots">
                
                {/* Core interactive grid space */}
                <div 
                  ref={gridRef}
                  className="relative aspect-square w-full mx-auto max-w-[420px]"
                  style={{ touchAction: 'none' }} // crucial for drag drawing on mobile
                >
                  
                  {/* Absolute responsive SVG Line Overlay */}
                  <div className="absolute inset-0 pointer-events-none z-20">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 1000">
                      
                      <defs>
                        <linearGradient id="cosmicPathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#6366f1" /> {/* Indigo */}
                          <stop offset="50%" stopColor="#a855f7" stopOpacity="0.85" /> {/* Purple */}
                          <stop offset="100%" stopColor="#22d3ee" /> {/* Cyan */}
                        </linearGradient>
                        <radialGradient id="headPulse" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#22d3ee" stopOpacity="1" />
                          <stop offset="60%" stopColor="#6366f1" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                        </radialGradient>
                      </defs>

                      {/* Active line path traced */}
                      {userPath.length > 0 && (() => {
                        const cellW = 1000 / currentLevel.width;
                        const cellH = 1000 / currentLevel.height;
                        const points = userPath.map(([r, c]) => ({
                          x: (c + 0.5) * cellW,
                          y: (r + 0.5) * cellH
                        }));
                        let dStr = `M ${points[0].x} ${points[0].y}`;
                        for (let i = 1; i < points.length; i++) {
                          dStr += ` L ${points[i].x} ${points[i].y}`;
                        }
                        
                        return (
                          <>
                            {/* Inner line */}
                            <path 
                              d={dStr} 
                              fill="none" 
                              stroke="url(#cosmicPathGradient)" 
                              strokeWidth={cellW * 0.16} 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              className="opacity-95 duration-75"
                            />
                            {/* Outer glow trace */}
                            <path 
                              d={dStr} 
                              fill="none" 
                              stroke="url(#cosmicPathGradient)" 
                              strokeWidth={cellW * 0.3} 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              className="opacity-25"
                              style={{ filter: 'blur(4px)' }}
                            />
                          </>
                        );
                      })()}

                      {/* Head of drawing trace pulse */}
                      {userPath.length > 0 && (() => {
                        const cellW = 1000 / currentLevel.width;
                        const cellH = 1000 / currentLevel.height;
                        const [lr, lc] = userPath[userPath.length - 1];
                        return (
                          <g>
                            <circle 
                              cx={(lc + 0.5) * cellW} 
                              cy={(lr + 0.5) * cellH} 
                              r={cellW * 0.14} 
                              fill="url(#headPulse)"
                            />
                            <circle 
                              cx={(lc + 0.5) * cellW} 
                              cy={(lr + 0.5) * cellH} 
                              r={cellW * 0.22} 
                              fill="none" 
                              stroke="#22d3ee" 
                              strokeWidth={2}
                              className="animate-ping opacity-70"
                            />
                          </g>
                        );
                      })()}
                    </svg>
                  </div>

                  {/* HTML Grid Grid Nodes layout */}
                  <div 
                    className="w-full h-full grid gap-2 shadow-inner"
                    style={{
                      gridTemplateColumns: `repeat(${currentLevel.width}, minmax(0, 1fr))`,
                      gridTemplateRows: `repeat(${currentLevel.height}, minmax(0, 1fr))`
                    }}
                  >
                    {currentLevel.grid.map((row, r) => 
                      row.map((cell, c) => {
                        const isVisited = userPath.some(([pr, pc]) => pr === r && pc === c);
                        const isHead = userPath.length > 0 && userPath[userPath.length - 1][0] === r && userPath[userPath.length - 1][1] === c;
                        const isHinted = hintCell !== null && hintCell[0] === r && hintCell[1] === c;
                        
                        // Render cell variables
                        let classes = "rounded-2xl transition-all duration-200 relative flex items-center justify-center font-bold outline-none cursor-pointer text-lg leading-none select-none ";
                        
                        if (cell.type === 'obstacle') {
                          classes += "bg-slate-950/75 border border-indigo-950/40 text-slate-700 shadow-xs cursor-not-allowed opacity-30";
                        } else if (cell.type === 'number') {
                          // Standard number tile
                          if (isVisited) {
                            classes += "bg-indigo-500/20 text-white shadow-[0_0_15px_rgba(99,102,241,0.25)] border-2 border-indigo-400";
                          } else {
                            // Highlights next sequence in play
                            classes += "bg-slate-900/60 border-2 border-indigo-500/25 text-indigo-300 hover:scale-[1.03] hover:border-indigo-400 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)]";
                          }
                        } else {
                          // Empty cell
                          if (isVisited) {
                            classes += "bg-indigo-500/15 border-2 border-indigo-500/30 text-white shadow-[0_0_10px_rgba(99,102,241,0.1)]";
                          } else {
                            classes += "bg-slate-900/15 border border-indigo-500/10 hover:border-indigo-500/25 hover:scale-[1.02] hover:bg-slate-900/35 text-slate-500";
                          }
                        }

                        // Apply pulse styling for hinted cell
                        if (isHinted) {
                          classes += " ring-4 ring-cyan-400/60 animate-pulse scale-[1.03] border-cyan-400";
                        }

                        return (
                          <div
                            key={`${r}-${c}`}
                            data-row={r}
                            data-col={c}
                            onMouseDown={() => handleMouseDown(r, c)}
                            onMouseEnter={() => handleMouseEnter(r, c)}
                            onTouchStart={(e) => handleTouchStart(e, r, c)}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                            className={classes}
                            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                          >
                            {/* Visual cell decoration */}
                            {cell.type === 'obstacle' ? (
                              <div className="absolute inset-2 bg-black/60 rounded-lg border border-indigo-950/30 opacity-40" />
                            ) : cell.type === 'number' ? (
                              <span className="relative z-10 select-none text-xl font-extrabold tracking-tight">
                                {cell.numberValue}
                              </span>
                            ) : (
                              // Small dot for transitables
                              !isVisited && <div className="w-2 h-2 rounded-full bg-slate-700 transition-transform duration-150 group-hover:scale-125" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Glass board satisfaction victory overlay */}
                  <AnimatePresence>
                    {levelSolved && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ 
                          opacity: [0, 1, 1, 0.95, 0], 
                          scale: [0.98, 1, 1.01, 1.02, 1.05] 
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ 
                          duration: 2.2, 
                          times: [0, 0.08, 0.5, 0.75, 1],
                          ease: "easeInOut" 
                        }}
                        className="absolute -inset-3.5 z-40 rounded-[28px] bg-white/10 border-2 border-white/40 shadow-[0_0_50px_rgba(99,102,241,0.35),inset_0_0_30px_rgba(255,255,255,0.4)] backdrop-blur-[14px] flex flex-col items-center justify-center overflow-hidden pointer-events-none"
                      >
                        {/* Shimmering glass specular glare lines */}
                        <motion.div 
                          initial={{ left: '-120%', top: '-120%' }}
                          animate={{ left: '120%', top: '120%' }}
                          transition={{ duration: 1.6, ease: "easeInOut", delay: 0.05 }}
                          className="absolute w-[200%] h-[200%] bg-gradient-to-r from-transparent via-white/55 to-transparent skew-x-30 pointer-events-none"
                        />

                        {/* Ambient crystalline particles radiating from center */}
                        <div className="absolute inset-0 bg-radial-[circle_at_center,rgba(255,255,255,0.18),transparent_70%]" />

                        {/* Beautiful vector-styled translucent success pulse */}
                        <motion.div
                          initial={{ scale: 0.75, opacity: 0 }}
                          animate={{ scale: [0.75, 1.1, 1], opacity: [0, 1, 0.9] }}
                          transition={{ duration: 0.85, ease: "easeOut", delay: 0.15 }}
                          className="flex flex-col items-center justify-center space-y-3 relative z-10"
                        >
                          <div className="w-16 h-16 rounded-full bg-indigo-500/25 border border-white/60 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.4)] animate-pulse">
                            <Sparkles className="w-8 h-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.85)] animate-spin-slow" />
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-cyan-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                            Tablero Sincronizado
                          </span>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>

                {/* Snap error message when divergence is cleared during hints */}
                <AnimatePresence>
                  {showDivergenceMsg && (
                    <motion.p 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-rose-600 text-center font-semibold mt-3"
                    >
                      ⚠️ Tu camino ha divergido. Se ha retrocedido hasta el último paso válido de la solución.
                    </motion.p>
                  )}
                </AnimatePresence>

              </div>

              {/* ACTION COMMANDS BAR */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleResetLevel}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900/40 border border-indigo-500/10 hover:bg-slate-800/60 duration-150 text-[#BBB] hover:text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  <RotateCcw className="w-4 h-4 text-indigo-400" />
                  Reiniciar
                </button>
                <button
                  onClick={handleUndo}
                  disabled={userPath.length <= 1}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900/40 border border-indigo-500/10 hover:bg-slate-800/60 disabled:opacity-20 duration-150 text-[#BBB] hover:text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-xs cursor-pointer disabled:cursor-not-allowed active:scale-95 transition-all"
                >
                  <Undo2 className="w-4 h-4 text-indigo-400" />
                  Deshacer
                </button>
                <button
                  onClick={handleGetHint}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 duration-150 text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-md shadow-indigo-500/20 cursor-pointer active:scale-95 transition-all"
                >
                  <Lightbulb className="w-4 h-4 text-white fill-amber-300 animate-bounce" />
                  Pista
                </button>
              </div>

            </div>

            {/* Side dashboard for stats & levels explorer screen */}
            <div className="w-full lg:w-72 bg-slate-950/45 backdrop-blur-md border border-indigo-500/15 rounded-2xl p-5 shadow-lg space-y-4 lg:sticky lg:top-24">
              <h3 className="font-bold text-white text-sm border-b border-indigo-500/10 pb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-indigo-400" />
                Explorador de Niveles
              </h3>

              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {ZIP_LEVELS.filter(l => l.difficulty === currentLevel.difficulty).map(lvl => {
                  const isSolved = !!progress.solvedLevels[lvl.id];
                  const isActive = lvl.id === currentLevel.id;
                  
                  return (
                    <button
                      key={lvl.id}
                      onClick={() => handleStartLevel(lvl)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-all duration-150 cursor-pointer ${
                        isActive
                          ? 'border-indigo-500 bg-indigo-600/40 text-white font-semibold shadow-inner'
                          : isSolved
                          ? 'border-indigo-500/10 bg-emerald-950/5 hover:bg-emerald-950/15 text-slate-300'
                          : 'border-indigo-500/10 bg-slate-900/10 hover:bg-slate-900/40 text-slate-400'
                      }`}
                    >
                      <span className="truncate max-w-[130px]" title={lvl.name}>
                        {lvl.name}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isSolved && <CheckCircle2 className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-500'}`} />}
                        <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                          isActive 
                            ? 'bg-indigo-700 text-white' 
                            : 'bg-slate-950/60 border border-indigo-950/30 text-slate-400'
                        }`}>
                          {lvl.width}x{lvl.height}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-indigo-550/10 space-y-1">
                <button
                  onClick={() => setCurrentLevel(null)}
                  className="w-full text-center text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/20 py-2 rounded-lg font-semibold block transition-colors duration-155 cursor-pointer"
                >
                  Regresar al Selector de Niveles
                </button>
              </div>
            </div>

            {/* VICTORY OVERLAY AND CELEBRATION MODAL */}
            <AnimatePresence>
              {showSuccessCard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  {/* Backdrop */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setCurrentLevel(null)}
                    className="absolute inset-0 bg-black/85 backdrop-blur-sm" 
                  />

                  {/* Confetti Animation Effect Elements */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-50">
                    {celebrationConfetti.map(cf => {
                      const style: React.CSSProperties = {
                        backgroundColor: cf.shape === 'ring' ? 'transparent' : cf.color,
                        width: `${cf.size}px`,
                        height: `${cf.shape === 'ribbon' ? cf.size * 2.2 : cf.size}px`,
                        opacity: 0.9,
                        boxShadow: cf.glow ? `0 0 12px ${cf.color}` : 'none',
                        border: cf.shape === 'ring' ? `2px solid ${cf.color}` : 'none',
                        clipPath: cf.shape === 'star'
                          ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
                          : cf.shape === 'sparkle'
                          ? 'polygon(50% 0%, 64% 36%, 100% 50%, 64% 64%, 50% 100%, 36% 64%, 0% 50%, 36% 36%)'
                          : undefined
                      };

                      return (
                        <motion.div
                          key={cf.id}
                          initial={{ 
                            x: `${cf.startX}vw`, 
                            y: `${cf.startY}vh`, 
                            rotate: 0,
                            rotateX: 0,
                            rotateY: 0,
                            scale: 0 
                          }}
                          animate={{ 
                            y: '115vh', 
                            x: cf.swayDirs.map(offset => `${cf.startX + offset}vw`),
                            rotate: 1080 * (cf.id % 2 === 0 ? 1 : -1),
                            rotateX: 360 * (cf.id % 3 === 0 ? 1 : -1),
                            rotateY: 720 * (cf.id % 4 === 0 ? 1 : -1),
                            scale: [0, 1, 1, 0.75],
                            opacity: [0, 0.95, 0.85, 0]
                          }}
                          transition={{ 
                            duration: cf.duration, 
                            delay: cf.delay, 
                            y: { ease: 'linear' }, // Steady gravity fallback
                            x: { ease: 'easeInOut' }, // Smooth sinusoid swaying limits
                            rotate: { ease: 'linear' },
                            rotateX: { ease: 'linear' },
                            rotateY: { ease: 'linear' },
                            scale: { ease: 'easeOut' },
                            opacity: { ease: 'easeOut' }
                          }}
                          style={style}
                          className={`absolute ${cf.shape === 'circle' ? 'rounded-full' : cf.shape === 'ribbon' ? 'rounded-sm' : ''}`}
                        />
                      );
                    })}
                  </div>

                  {/* Modal card content */}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 15 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 15 }}
                    className="relative z-10 w-full max-w-sm bg-slate-950/65 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-indigo-500/25 text-center space-y-6"
                  >
                    <div className="mx-auto w-16 h-16 rounded-full bg-emerald-950/40 border border-emerald-900/40 flex items-center justify-center text-emerald-400 animate-pulse">
                      <Trophy className="w-8 h-8 text-emerald-400" />
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-900/45">
                        ¡Completado!
                      </span>
                      <h3 className="text-xl font-extrabold text-white pt-2">
                        {currentLevel.name}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        ¡Has completado toda la cuadrícula y conectado los números perfectamente!
                      </p>
                    </div>

                    {/* Display Animated Stars Earned */}
                    <div className="flex justify-center items-center gap-2 py-3 bg-indigo-950/20 backdrop-blur-md rounded-2xl border border-indigo-500/15">
                      {[1, 2, 3].map((starIdx) => (
                        <motion.div
                          key={starIdx}
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.1 * starIdx, type: "spring", stiffness: 150 }}
                        >
                          <Star 
                            className={`w-8 h-8 ${
                              starIdx <= starRating 
                                ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' 
                                : 'text-slate-800'
                            }`} 
                          />
                        </motion.div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-400 border-t border-b border-indigo-500/10 py-3.5">
                      <div className="border-r border-indigo-500/10 space-y-0.5">
                        <p className="uppercase tracking-wider text-[10px] text-slate-500">TÚ TIEMPO</p>
                        <p className="text-base font-bold text-white">{formatTime(timer)}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="uppercase tracking-wider text-[10px] text-slate-500">RACHA DIARIA</p>
                        <p className="text-base font-bold text-amber-500 flex items-center justify-center gap-1">
                          <Flame className="w-4 h-4 fill-amber-500 text-amber-500" /> 
                          {progress.currentStreak} días
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {currentLevel.id < ZIP_LEVELS.length ? (
                        <button
                          onClick={() => handleStartLevel(ZIP_LEVELS[currentLevel.id])} // index level 0 is id 1, so ZIP_LEVELS[currentLevel.id] represents level id+1
                          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:brightness-110 duration-155 text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-500/20 cursor-pointer active:scale-95 transition-all"
                        >
                          Siguiente Nivel
                          <ChevronRight className="w-4 h-4 animate-bounce-horizontal" />
                        </button>
                      ) : currentLevel.id === 99999 ? (
                        <div className="text-center">
                          <p className="text-xs text-emerald-400 font-bold bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/20">
                            🤩 ¡Reto del Día Superado con Éxito!
                          </p>
                        </div>
                      ) : currentLevel.id === 88888 ? (
                        <div className="text-center">
                          <p className="text-xs text-sky-400 font-bold bg-sky-950/40 p-2.5 rounded-xl border border-sky-500/20">
                            🌀 ¡Nivel Aleatorio Forjado Resuelto!
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-indigo-400 font-bold bg-indigo-950/20 p-2.5 rounded-xl border border-indigo-500/20">
                          🏆 ¡Has completado todos los niveles de Zip! Eres un maestro lógico.
                        </p>
                      )}

                      {/* Endless/Infinite Forger Section */}
                      <div className="bg-slate-950/60 border border-indigo-500/15 rounded-2xl p-4 space-y-3 text-left">
                        <p className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-widest flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                          Forja Infinita de Puzles:
                        </p>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                          Sigue jugando sin límites con tableros 100% resolubles tallados en tiempo real:
                        </p>
                        <div className="grid grid-cols-3 gap-2 pt-1">
                          {(['fácil', 'medio', 'difícil'] as const).map(diff => (
                            <button
                              key={diff}
                              onClick={() => {
                                handleStartRandomLevel(diff);
                              }}
                              className="py-2.5 px-1 rounded-xl text-[10px] uppercase font-black tracking-wider text-white border transition-all cursor-pointer bg-slate-900/40 flex flex-col items-center justify-center gap-0.5 hover:bg-sky-950/45 hover:border-sky-500/50 border-indigo-950/30 active:scale-95"
                            >
                              <span className={
                                diff === 'fácil' ? 'text-emerald-400' : diff === 'medio' ? 'text-amber-400' : 'text-rose-400'
                              }>
                                {diff}
                              </span>
                              <span className="text-[7.5px] text-slate-500 font-normal lowercase tracking-normal">
                                {diff === 'fácil' ? '4x4 o 4x5' : diff === 'medio' ? '5x5 o 5x6' : '6x6 o 7x7'}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => setCurrentLevel(null)}
                        className="w-full hover:bg-indigo-950/25 duration-150 text-[#BBB] hover:text-white font-semibold text-sm py-2.5 rounded-xl border border-transparent cursor-pointer active:scale-95 transition-all text-center"
                      >
                        Regresar a Seleccionar Niveles
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </main>

      {/* DETAILED TUTORIAL ONBOARDING SCREEN MODAL */}
      <AnimatePresence>
        {showTutorial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTutorial(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm" 
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-md bg-slate-950/65 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-indigo-500/25 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-indigo-500/10 pb-3">
                <span className="text-xs font-extrabold uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/15 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Aprende a Jugar
                </span>
                <button 
                  onClick={() => setShowTutorial(false)}
                  className="p-1 rounded-lg hover:bg-indigo-950/30 text-slate-400 hover:text-white cursor-pointer active:scale-95 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                <p>
                  <strong>Zip</strong> es un adictivo juego de deducción lógica fácil de aprender, pero difícil de amaestrar. Tu meta es trazar una línea continua que visite todas las celdas de la cuadrícula respetando las siguientes condiciones:
                </p>

                <div className="space-y-3 bg-indigo-950/10 backdrop-blur-md p-4 rounded-2xl border border-indigo-500/15 font-semibold text-slate-350">
                  <div className="flex gap-2.5">
                    <span className="text-indigo-400 font-bold">1.</span>
                    <p>La línea debe comenzar imperativamente en la celda marcada con el número <strong>1</strong>.</p>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="text-indigo-400 font-bold">2.</span>
                    <p>Debes desplazarte solo de forma ortogonal (arriba, abajo, izquierda, derecha) entre celdas adyacentes libres.</p>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="text-indigo-400 font-bold">3.</span>
                    <p>Las celdas negras representadas por <kbd className="bg-black border border-indigo-900/30 rounded px-1.5 py-0.5 font-mono text-[9px] text-[#E0E0E0]">#</kbd> son obstáculos infranqueables que no debes visitar.</p>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="text-indigo-400 font-bold">4.</span>
                    <p>Conecta obligatoriamente todos los números de la cuadrícula en estricto orden ascendente, es decir: 1 luego 2, luego 3... hasta alcanzar el número final.</p>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="text-indigo-400 font-bold">5.</span>
                    <p>Para triunfar, debes completar el <strong>Camino Hamiltoniano</strong>: se tienen que visitar absolutamente todas las celdas blancas transitables de la cuadrícula exactamente una vez.</p>
                  </div>
                </div>

                <div className="space-y-2 bg-indigo-950/20 backdrop-blur-md p-3.5 rounded-2xl border border-indigo-500/15">
                  <h4 className="font-bold text-indigo-400 text-xs flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                    Pistas Inteligentes y Auto-Corrección:
                  </h4>
                  <p className="text-slate-300 text-[11px] leading-snug">
                    ¿Te perdiste o te trancaste? Usa la opción <strong>"Pista"</strong> en cualquier momento. El juego analizará tu trazado y retrocederá de forma automática hasta el punto de la cuadrícula donde te equivocaste, resaltando con un halo/anillo el siguiente casillero correcto.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowTutorial(false)}
                className="w-full bg-gradient-to-r from-indigo-500 to-indigo-650 hover:brightness-110 duration-155 text-white font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-indigo-500/20 cursor-pointer active:scale-95 transition-all"
              >
                ¡Entendido, a Jugar!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
