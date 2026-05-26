import React from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Clock, 
  Flame, 
  CheckCircle2, 
  Star, 
  TrendingUp, 
  Sparkles, 
  BookOpen, 
  Zap, 
  Calendar 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { ZIP_LEVELS } from '../lib/zip-levels';

interface CompletionRecord {
  levelId: number;
  name: string;
  difficulty: 'fácil' | 'medio' | 'difícil';
  time: number;
  date: string;
}

export interface UserProgress {
  solvedLevels: { [key: number]: { stars: number; bestTime: number } };
  currentStreak: number;
  lastSolvedDate: string;
  streakFreezes: number;
  lastDailySolvedDate?: string;
  solveHistory?: CompletionRecord[];
}

interface PlayerStatsPanelProps {
  progress: UserProgress;
}

export default function PlayerStatsPanel({ progress }: PlayerStatsPanelProps) {
  // Aggregate statistics
  const getCompletionsByDifficulty = () => {
    const timesMap: { [key in 'fácil' | 'medio' | 'difícil']: number[] } = {
      fácil: [],
      medio: [],
      difícil: []
    };

    // 1. Gather from solveHistory
    if (progress.solveHistory) {
      progress.solveHistory.forEach(record => {
        if (timesMap[record.difficulty]) {
          timesMap[record.difficulty].push(record.time);
        }
      });
    }

    // 2. Add campaign levels mapped in solvedLevels that are NOT in solveHistory (to avoid duplicates)
    ZIP_LEVELS.forEach(lvl => {
      const solved = progress.solvedLevels[lvl.id];
      if (solved) {
        // Check if this level exists in history to prevent duplication
        const alreadyInHistory = progress.solveHistory?.some(h => h.levelId === lvl.id);
        if (!alreadyInHistory) {
          timesMap[lvl.difficulty].push(solved.bestTime);
        }
      }
    });

    return timesMap;
  };

  const timesMap = getCompletionsByDifficulty();

  // Helper calculation
  const getStatsForDifficulty = (diff: 'fácil' | 'medio' | 'difícil') => {
    const list = timesMap[diff];
    if (list.length === 0) {
      return { avg: 0, best: 0, count: 0 };
    }
    const sum = list.reduce((a, b) => a + b, 0);
    const avg = parseFloat((sum / list.length).toFixed(1));
    const best = Math.min(...list);
    return { avg, best, count: list.length };
  };

  const facilStats = getStatsForDifficulty('fácil');
  const medioStats = getStatsForDifficulty('medio');
  const dificilStats = getStatsForDifficulty('difícil');

  // Chart structured data
  const chartData = [
    { 
      name: 'Fácil', 
      avgTime: facilStats.avg, 
      bestTime: facilStats.best, 
      count: facilStats.count, 
      color: '#34d399', // Emerald-400
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20',
      bgColor: 'bg-emerald-950/10'
    },
    { 
      name: 'Medio', 
      avgTime: medioStats.avg, 
      bestTime: medioStats.best, 
      count: medioStats.count, 
      color: '#fbbf24', // Amber-400
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/20',
      bgColor: 'bg-amber-950/10'
    },
    { 
      name: 'Difícil', 
      avgTime: dificilStats.avg, 
      bestTime: dificilStats.best, 
      count: dificilStats.count, 
      color: '#f87171', // Rose-400
      textColor: 'text-rose-400',
      borderColor: 'border-rose-500/20',
      bgColor: 'bg-rose-950/10'
    }
  ];

  // Global total calculations
  const totalCompletedPuzzles = chartData.reduce((acc, curr) => acc + curr.count, 0);
  const campaignSolvedCount = Object.keys(progress.solvedLevels).filter(id => parseInt(id) < 88888).length;
  const proceduralSolvedCount = progress.solveHistory?.filter(h => h.levelId === 88888).length || 0;
  const dailySolvedCount = progress.solveHistory?.filter(h => h.levelId === 99999).length || 0;

  // Custom tooltips for Recharts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950/90 border border-indigo-500/35 backdrop-blur-md p-4 rounded-2xl shadow-2xl text-xs space-y-1.5 z-55">
          <p className="font-black text-white text-sm tracking-wide border-b border-indigo-500/10 pb-1 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            Dificultad {data.name}
          </p>
          <p className="text-slate-300 font-semibold pt-1">
            Velocidad Media: <span className="text-white font-bold text-sm ml-1">{data.avgTime > 0 ? `${data.avgTime}s` : 'Sin datos'}</span>
          </p>
          <p className="text-emerald-400 font-semibold">
            Récord Personal: <span className="text-white font-bold ml-1">{data.bestTime > 0 ? `${data.bestTime}s` : '—'}</span>
          </p>
          <p className="text-slate-400">
            Total Resuelta de veces: <span className="text-indigo-300 font-bold ml-1">{data.count} rompecabezas</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Fun achievement notes based on performance
  const getMotivationalInsight = () => {
    if (totalCompletedPuzzles === 0) {
      return {
        title: "Iniciando la Trayectoria",
        text: "Completa tus primeros desafíos de Zip para calibrar tus velocidades cognitivas y ver aquí tus visualizaciones en tiempo real."
      };
    }
    if (dificilStats.count > 0 && dificilStats.avg < 45) {
      return {
        title: "Navegante de Hyper-Velocidad",
         text: "Tus tiempos en dificultad Difícil son de élite. Consigues descifrar Caminos Hamiltonianos complejos a velocidades asombrosas."
      };
    }
    if (totalCompletedPuzzles > 15) {
      return {
        title: "Arquitecto de Patrones",
        text: "¡Gran volumen de juego! Estás entrenando tu cerebro para rastrear caminos y evitar obstáculos de forma subconsciente."
      };
    }
    return {
      title: "Constancia Mental",
      text: "La velocidad de resolución de Zip mejora de forma exponencial con la práctica. ¡Intenta superar tu racha diaria mañana!"
    };
  };

  const insight = getMotivationalInsight();

  // Pick up remaining recent history solves (max 5)
  const recentHistory = progress.solveHistory 
    ? [...progress.solveHistory].reverse().slice(0, 5) 
    : [];

  return (
    <div className="space-y-6 select-none" id="player-profile-stats">
      
      {/* Upper header section */}
      <div className="bg-gradient-to-r from-indigo-505/10 to-transparent p-5 rounded-2xl border border-indigo-500/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.06),transparent_60%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 animate-pulse" />
              Rendimiento y Telemetría
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">Estadísticas del Jugador</h2>
            <p className="text-xs text-slate-400 max-w-xl">
              Análisis dinámico de velocidades de resolución. Compara tus promedios por complejidad para evaluar tu agudeza heurística.
            </p>
          </div>

          <div className="flex gap-2 items-center">
            <span className="text-xs font-bold text-[#BBB] bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800/50 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              Racha: {progress.currentStreak} días
            </span>
            <span className="text-xs font-bold text-[#BBB] bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800/50 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Total: {totalCompletedPuzzles} resueltos
            </span>
          </div>
        </div>
      </div>

      {/* Grid of 3 difficulty statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {chartData.map((data) => {
          const isNoData = data.count === 0;
          return (
            <div 
              key={data.name} 
              className={`border backdrop-blur-md rounded-2xl p-5 shadow-lg relative overflow-hidden transition-all duration-350 hover:scale-[1.01] ${data.borderColor} ${data.bgColor}`}
            >
              {/* Diff decoration glow */}
              <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full opacity-$8 bg-current blur-2xl pointer-events-none" style={{ color: data.color, opacity: 0.08 }} />
              
              <div className="flex justify-between items-start">
                <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border bg-slate-950/40 relative z-10 ${data.textColor} ${data.borderColor}`}>
                  Dificultad {data.name}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-950/20 px-1.5 py-0.5 rounded">
                  {data.count} puzles
                </span>
              </div>

              <div className="mt-4 space-y-3 relative z-10">
                <div>
                  <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">TIEMPO PROMEDIO</p>
                  <p className="text-3xl font-black text-white tracking-tight mt-0.5 flex items-baseline gap-1">
                    {isNoData ? (
                      <span className="text-slate-600 text-lg font-bold">Sin datos</span>
                    ) : (
                      <>
                        {data.avgTime}
                        <span className="text-xs font-bold text-slate-400">segundos</span>
                      </>
                    )}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/40 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block tracking-wider">MÍNIMO RÉCORD</span>
                    <span className="text-[#E0E0E0] font-bold flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" /> 
                      {isNoData ? '—' : `${data.bestTime}s`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block tracking-wider">COMPLETADOS</span>
                    <span className="text-[#E0E0E0] font-bold flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" style={{ color: isNoData ? '#475569' : undefined }} /> 
                      {data.count} {data.count === 1 ? 'nivel' : 'niveles'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Bar Chart Panel */}
      <div className="bg-slate-950/45 border border-indigo-500/15 backdrop-blur-md rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-indigo-500/10 pb-4 mb-6">
          <div className="space-y-0.5">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-indigo-400" />
              Comparativa de Velocidades de Resolución
            </h3>
            <p className="text-xs text-slate-400">
              Histograma de tiempos medios de resolución. Menores valores representan mayor velocidad lógica.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-450 bg-slate-900/30 p-2 rounded-xl border border-indigo-950/40">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Fácil</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Medio</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span>Difícil</span>
            </div>
          </div>
        </div>

        {totalCompletedPuzzles === 0 ? (
          <div className="h-64 rounded-2xl border border-dashed border-indigo-950/60 bg-slate-950/20 flex flex-col items-center justify-center text-center p-6 space-y-2">
            <Clock className="w-10 h-10 text-indigo-500/40 animate-pulse" />
            <h4 className="font-bold text-[#E0E0E0] text-sm">Sin datos para graficar</h4>
            <p className="text-xs text-slate-500 max-w-sm">
              Cuando resuelvas un rompecabezas de cualquier dificultad (Campaña, Reto Diario o Forjador Infinito), aparecerá aquí tu gráfica de velocidad promedio.
            </p>
          </div>
        ) : (
          <div className="h-72 w-full pr-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={11}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={{ stroke: '#1e293b' }}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10}
                  fontWeight={500}
                  tickLine={false}
                  axisLine={false}
                  label={{ 
                    value: 'Segundos', 
                    angle: -90, 
                    position: 'insideLeft', 
                    style: { fill: '#64748b', fontSize: 10, fontWeight: 600, textAnchor: 'middle' } 
                  }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.04)' }} />
                <Bar 
                  dataKey="avgTime" 
                  radius={[8, 8, 0, 0]} 
                  barSize={55}
                  animationDuration={1200}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.avgTime > 0 ? entry.color : 'rgba(71, 85, 105, 0.15)'} 
                      stroke={entry.avgTime > 0 ? entry.color : 'rgba(71, 85, 105, 0.3)'}
                      strokeWidth={entry.avgTime > 0 ? 0 : 1}
                      fillOpacity={0.88}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Row of insights and history */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Insight & Category Distribution Card */}
        <div className="bg-slate-950/45 border border-indigo-500/15 backdrop-blur-md rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-indigo-500/10 pb-2.5">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin-slow" />
              Análisis Heurístico
            </h3>

            <div className="space-y-2 bg-[#0E1118] p-4 rounded-xl border border-indigo-500/10">
              <h4 className="font-extrabold text-indigo-400 text-xs flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-500" />
                {insight.title}
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed font-semibold">
                {insight.text}
              </p>
            </div>

            {/* Micro Breakdown info */}
            <div className="space-y-2.5 pt-1.5">
              <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">DISTRIBUCIÓN DE LOGROS</p>
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-900/40 border border-slate-800/50 p-2.5 rounded-xl">
                  <span className="text-slate-500 text-[10px] block">Campaña</span>
                  <span className="text-white font-bold text-sm block mt-0.5">{campaignSolvedCount}</span>
                </div>
                <div className="bg-slate-900/40 border border-slate-800/50 p-2.5 rounded-xl">
                  <span className="text-slate-500 text-[10px] block">Retos Diarios</span>
                  <span className="text-indigo-400 font-bold text-sm block mt-0.5">{dailySolvedCount}</span>
                </div>
                <div className="bg-slate-900/40 border border-slate-800/50 p-2.5 rounded-xl">
                  <span className="text-slate-500 text-[10px] block">Infinitos</span>
                  <span className="text-sky-400 font-bold text-sm block mt-0.5">{proceduralSolvedCount}</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 italic mt-6 font-medium">
            * Tus registros se guardan de forma local e inviolable en tu navegador.
          </p>
        </div>

        {/* Recent Solved History List Card */}
        <div className="bg-slate-950/45 border border-indigo-500/15 backdrop-blur-md rounded-2xl p-5 shadow-lg space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-indigo-500/10 pb-2.5">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            Historial de Resoluciones Recientes
          </h3>

          {recentHistory.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center p-4">
              <Calendar className="w-8 h-8 text-slate-700 mb-2" />
              <p className="text-xs text-slate-500">Aún no hay partidas completadas en tu historial.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentHistory.map((rec, idx) => {
                const badgeColor = rec.difficulty === 'fácil' 
                  ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40'
                  : rec.difficulty === 'medio'
                  ? 'bg-amber-950/40 text-amber-400 border border-amber-900/40'
                  : 'bg-rose-950/40 text-rose-400 border border-rose-900/40';

                return (
                  <div 
                    key={idx} 
                    className="bg-slate-900/20 hover:bg-slate-900/45 transition-colors duration-150 border border-indigo-950/30 p-2.5 rounded-xl flex items-center justify-between text-xs gap-3"
                  >
                    <div className="space-y-0.5 overflow-hidden">
                      <p className="font-extrabold text-[#E0E0E0] truncate max-w-[170px]" title={rec.name}>
                        {rec.name}
                      </p>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-600" />
                        {rec.date}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${badgeColor}`}>
                        {rec.difficulty}
                      </span>
                      <span className="font-mono bg-indigo-950/30 border border-indigo-900/30 text-indigo-300 font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-400" />
                        {rec.time}s
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
