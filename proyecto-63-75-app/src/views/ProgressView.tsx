import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { getLocalDateString } from '../utils/dates';
import { Ruler, Plus, TrendingUp } from 'lucide-react';

export const ProgressView: React.FC = () => {
  const bodyLogs = useLiveQuery(() => db.bodyMeasurements.orderBy('date').reverse().toArray());

  const [biceps, setBiceps] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');

  const addMeasurements = async (e: React.FormEvent) => {
    e.preventDefault();

    await db.bodyMeasurements.add({
      date: getLocalDateString(),
      bicepsCm: biceps ? parseFloat(biceps) : undefined,
      chestCm: chest ? parseFloat(chest) : undefined,
      waistCm: waist ? parseFloat(waist) : undefined,
    });

    setBiceps('');
    setChest('');
    setWaist('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100">Progreso Físico & Medidas</h2>
        <p className="text-xs text-slate-400">Registra perímetros corporales cada 2-4 semanas para observar cambios en masa muscular.</p>
      </div>

      <form onSubmit={addMeasurements} className="p-4 bg-[#0d1424] border border-slate-800 rounded-2xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="number"
            step="0.5"
            placeholder="Bíceps (cm)"
            value={biceps}
            onChange={(e) => setBiceps(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
          />
          <input
            type="number"
            step="0.5"
            placeholder="Pecho (cm)"
            value={chest}
            onChange={(e) => setChest(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
          />
          <input
            type="number"
            step="0.5"
            placeholder="Cintura (cm)"
            value={waist}
            onChange={(e) => setWaist(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs hover:bg-emerald-400 transition-colors"
        >
          <Plus size={16} /> Guardar Medidas
        </button>
      </form>

      {/* Histórico de Medidas */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Histórico de Medidas</h3>
        {bodyLogs?.map((log) => (
          <div key={log.id} className="p-3.5 bg-[#0d1424] border border-slate-800 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-cyan-400">{log.date}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-slate-300">
              {log.bicepsCm && <div>Bíceps: <strong>{log.bicepsCm} cm</strong></div>}
              {log.chestCm && <div>Pecho: <strong>{log.chestCm} cm</strong></div>}
              {log.waistCm && <div>Cintura: <strong>{log.waistCm} cm</strong></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
