import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Dumbbell, Plus } from 'lucide-react';

export const WorkoutView: React.FC = () => {
  const exercises = useLiveQuery(() => db.exercises.toArray());
  const workoutLogs = useLiveQuery(() => db.workoutLogs.orderBy('date').reverse().toArray());

  const [selectedEx, setSelectedEx] = useState('');
  const [reps, setReps] = useState('');
  const [weightKg, setWeightKg] = useState('');

  const addSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEx || !reps) return;

    const todayStr = new Date().toISOString().split('T')[0];
    
    await db.workoutLogs.add({
      date: todayStr,
      exerciseId: selectedEx,
      sets: [{ reps: parseInt(reps), weightKg: weightKg ? parseFloat(weightKg) : undefined }]
    });

    setReps('');
    setWeightKg('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100">Entrenamiento en Casa</h2>
        <p className="text-xs text-slate-400">Rutinas con peso corporal, mochila y silla resistente.</p>
      </div>

      <form onSubmit={addSet} className="p-4 bg-[#0d1424] border border-slate-800 rounded-2xl space-y-3">
        <select
          value={selectedEx}
          onChange={(e) => setSelectedEx(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
        >
          <option value="">Selecciona ejercicio...</option>
          {exercises?.map((ex) => (
            <option key={ex.id} value={ex.id}>{ex.name} ({ex.category})</option>
          ))}
        </select>

        <div className="flex gap-3">
          <input
            type="number"
            placeholder="Repeticiones"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Mochila / Peso (kg)"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
          />
          <button
            type="submit"
            className="flex items-center gap-2 bg-cyan-500 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs hover:bg-cyan-400 transition-colors"
          >
            <Plus size={16} /> Serie
          </button>
        </div>
      </form>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Registro de Series Recientes</h3>
        {workoutLogs?.map((log) => {
          const ex = exercises?.find((e) => e.id === log.exerciseId);
          return (
            <div key={log.id} className="flex items-center justify-between p-3.5 bg-[#0d1424] border border-slate-800 rounded-xl">
              <div>
                <span className="text-xs font-bold text-slate-200 block">{ex?.name || 'Ejercicio'}</span>
                <span className="text-[11px] text-cyan-400">
                  {log.sets[0]?.reps} reps {log.sets[0]?.weightKg ? `(${log.sets[0].weightKg} kg mochila)` : ''}
                </span>
              </div>
              <span className="text-[11px] text-slate-500">{log.date}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};