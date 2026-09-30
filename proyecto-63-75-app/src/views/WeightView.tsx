import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Scale, Plus, TrendingUp } from 'lucide-react';

export const WeightView: React.FC = () => {
  const weightLogs = useLiveQuery(() => db.weightLogs.orderBy('date').reverse().toArray());
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  const addWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(weight);
    if (!val || val <= 0) return;

    await db.weightLogs.add({
      date: new Date().toISOString().split('T')[0],
      weightKg: val,
      notes: notes.trim() || undefined,
    });

    setWeight('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100">Registro de Peso y Tendencia</h2>
        <p className="text-xs text-slate-400">Pésate en ayunas por la mañana sin obsesionarte por las fluctuaciones diarias.</p>
      </div>

      <form onSubmit={addWeight} className="p-4 bg-[#0d1424] border border-slate-800 rounded-2xl space-y-3">
        <div className="flex gap-3">
          <input
            type="number"
            step="0.1"
            placeholder="Peso en kg (ej: 63.5)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            className="flex items-center gap-2 bg-emerald-500 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs hover:bg-emerald-400 transition-colors"
          >
            <Plus size={16} /> Registrar
          </button>
        </div>
        <input
          type="text"
          placeholder="Nota opcional (ej: Pesado en ayunas)..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
        />
      </form>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Histórico de Pesajes</h3>
        {weightLogs?.map((log) => (
          <div key={log.id} className="flex items-center justify-between p-3.5 bg-[#0d1424] border border-slate-800 rounded-xl">
            <div>
              <span className="text-xs font-bold text-slate-200">{log.weightKg} kg</span>
              {log.notes && <p className="text-[11px] text-slate-400 mt-0.5">{log.notes}</p>}
            </div>
            <span className="text-[11px] text-slate-500">{log.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};