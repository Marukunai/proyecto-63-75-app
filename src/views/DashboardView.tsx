import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { getLocalDateString } from '../utils/dates';
import { HeartPulse, CheckCircle2, Circle, Flame, ArrowUpRight, ShieldAlert } from 'lucide-react';

interface DashboardViewProps {
  showWeightWidget?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ showWeightWidget = false }) => {
  const profile = useLiveQuery(() => db.profile.toCollection().first());
  const habits = useLiveQuery(() => db.habits.toArray());
  const todayStr = getLocalDateString();

  const todayLog = useLiveQuery(() => db.dailyLogs.get(todayStr));
  const latestWeight = useLiveQuery(() => db.weightLogs.orderBy('date').reverse().first());

  const [isMinMode, setIsMinMode] = useState<boolean>(false);

  useEffect(() => {
    if (todayLog) {
      setIsMinMode(todayLog.isMinimumMode);
    }
  }, [todayLog]);

  const toggleMinimumMode = async () => {
    const nextState = !isMinMode;
    setIsMinMode(nextState);

    await db.dailyLogs.put({
      date: todayStr,
      isMinimumMode: nextState,
      completedHabits: todayLog?.completedHabits || [],
    });
  };

  const toggleHabit = async (habitId: string) => {
    const currentCompleted = todayLog?.completedHabits || [];
    const updated = currentCompleted.includes(habitId)
      ? currentCompleted.filter(id => id !== habitId)
      : [...currentCompleted, habitId];

    await db.dailyLogs.put({
      date: todayStr,
      isMinimumMode: isMinMode,
      completedHabits: updated,
    });
  };

  const currentW = latestWeight?.weightKg ?? profile?.initialWeight;
  const initialW = profile?.initialWeight;
  const targetW = profile?.targetWeight;
  const canShowProgress = currentW !== undefined && initialW !== undefined && targetW !== undefined && targetW > initialW;
  const progressPercent = canShowProgress
    ? Math.min(100, Math.max(0, ((currentW - initialW) / (targetW - initialW)) * 100))
    : 0;

  const activeHabits = habits?.filter(h => !isMinMode || h.isMinimumModeAllowed) || [];

  return (
    <div className="space-y-6">
      {/* Banner de Bienvenida y Selector Modo Mínimo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800/80 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Hola{profile?.name ? `, ${profile.name}` : ''} 👋</h2>
          <p className="text-xs text-slate-400 mt-1">{profile?.currentPhase || 'Tu espacio para cuidar de ti, a tu ritmo.'}</p>
        </div>

        <button
          onClick={toggleMinimumMode}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
            isMinMode
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600'
          }`}
        >
          <ShieldAlert size={16} className={isMinMode ? 'text-amber-400' : 'text-slate-400'} />
          {isMinMode ? 'Modo Mínimo Activo (Día Difícil)' : 'Activar Modo Mínimo'}
        </button>
      </div>

      {isMinMode && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs leading-relaxed">
          <strong>Modo Mínimo Activado:</strong> Hoy no se busca la perfección. Mantente hidratado, come de forma suficiente y descansa. Las tareas no esenciales quedan pausadas sin castigos.
        </div>
      )}

      {/* Tarjeta opcional de peso: no muestra datos personales hasta activarla */}
      {showWeightWidget && <div className="p-5 rounded-2xl bg-[#0d1424] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
            <Flame size={18} className="text-cyan-400" />
            <span>Evolución de Peso Corporal</span>
          </div>
          <span className="text-xs text-slate-400">{targetW ? `Objetivo: ${targetW} kg` : 'Objetivo sin configurar'}</span>
        </div>

        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-extrabold text-slate-100">{currentW !== undefined ? `${currentW} kg` : 'Sin registro'}</span>
          {currentW !== undefined && initialW !== undefined && (
            <span className="text-xs text-emerald-400 font-medium flex items-center">{currentW - initialW >= 0 ? '+' : ''}{(currentW - initialW).toFixed(1)} kg</span>
          )}
        </div>

        {/* Barra de Progreso */}
        <div className="space-y-1.5">
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, progressPercent)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 font-medium">
            <span>Inicio: {initialW ? `${initialW} kg` : '—'}</span>
            <span>Meta: {targetW ? `${targetW} kg` : '—'}</span>
          </div>
        </div>
      </div>}

      {/* Lista de Hábitos del Día */}
      <div className="p-5 rounded-2xl bg-[#0d1424] border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <HeartPulse size={18} className="text-emerald-400" />
          <span>Hábitos para Hoy {isMinMode && '(Versión Mínima)'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {activeHabits.map((habit) => {
            const isCompleted = todayLog?.completedHabits?.includes(habit.id);
            return (
              <div
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isCompleted
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{habit.icon}</span>
                  <span className="text-xs font-medium">{habit.title}</span>
                </div>
                {isCompleted ? (
                  <CheckCircle2 size={18} className="text-emerald-400" />
                ) : (
                  <Circle size={18} className="text-slate-600" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
