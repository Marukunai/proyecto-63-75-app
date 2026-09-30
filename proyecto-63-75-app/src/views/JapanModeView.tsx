import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Compass, Footprints, Hotel, Plus } from 'lucide-react';

export const JapanModeView: React.FC = () => {
  const japanLogs = useLiveQuery(() => db.japanLogs.orderBy('date').reverse().toArray());

  const [date, setDate] = useState('2026-10-15');
  const [location, setLocation] = useState('Hong Kong');
  const [steps, setSteps] = useState('');
  const [notes, setNotes] = useState('');

  const addJapanLog = async (e: React.FormEvent) => {
    e.preventDefault();

    await db.japanLogs.add({
      date,
      location,
      stepsCount: steps ? parseInt(steps) : undefined,
      isTourismDay: true,
      isRestDay: false,
      notes: notes.trim() || undefined,
    });

    setSteps('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Banner Especial Japón */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/60 via-slate-900 to-slate-900 border border-red-500/30 space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🇭🇰 🇯🇵</span>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Modo Japón / Hong Kong (15–31 Oct 2026)</h2>
            <p className="text-xs text-slate-300">Modo de viaje: la prioridad es disfrutar del turismo y no perder el hábito sin culpas ni castigos.</p>
          </div>
        </div>
      </div>

      <form onSubmit={addJapanLog} className="p-4 bg-[#0d1424] border border-slate-800 rounded-2xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Ubicación (ej: Tokio / Kioto / Fuji)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
          />
        </div>

        <div className="flex gap-3">
          <input
            type="number"
            placeholder="Pasos recorridos (ej: 18500)"
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
          />
          <button
            type="submit"
            className="flex items-center gap-2 bg-red-500 text-slate-100 font-semibold px-4 py-2 rounded-xl text-xs hover:bg-red-600 transition-colors"
          >
            <Plus size={16} /> Registrar Día
          </button>
        </div>

        <input
          type="text"
          placeholder="Notas del día (ej: Rutina corta de 10 min en hotel o caminata intensa)..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
        />
      </form>

      {/* Histórico del Viaje */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Diario del Viaje</h3>
        {japanLogs?.map((log) => (
          <div key={log.id} className="p-3.5 bg-[#0d1424] border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-200">{log.location}</span>
                <span className="text-[10px] text-red-400 font-medium">({log.date})</span>
              </div>
              {log.notes && <p className="text-[11px] text-slate-400 mt-1">{log.notes}</p>}
            </div>
            {log.stepsCount && (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <Footprints size={14} /> {log.stepsCount.toLocaleString()} pasos
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};