import React, { useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { getLocalDateString } from '../utils/dates';
import { Star, Plus, Check } from 'lucide-react';
import { SleepLog } from '../types';
import { RowActions, EditingBanner, confirmDelete, scrollIntoViewSmooth } from '../components/shared/EditControls';

export const SleepView: React.FC = () => {
  const sleepLogs = useLiveQuery(() => db.sleepLogs.orderBy('date').reverse().toArray());

  const [hours, setHours] = useState('');
  const [quality, setQuality] = useState<number>(4);
  const [hadMelatonin, setHadMelatonin] = useState(false);
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingDate, setEditingDate] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const resetForm = () => {
    setEditingId(null);
    setHours('');
    setQuality(4);
    setHadMelatonin(false);
    setNotes('');
  };

  const startEditing = (log: SleepLog) => {
    setEditingId(log.id ?? null);
    setEditingDate(log.date);
    setHours(String(log.hoursSlept));
    setQuality(log.quality);
    setHadMelatonin(!!log.hadMelatonin);
    setNotes(log.notes ?? '');
    scrollIntoViewSmooth(formRef.current);
  };

  const deleteSleep = async (log: SleepLog) => {
    if (!log.id || !confirmDelete('este registro de sueño')) return;
    await db.sleepLogs.delete(log.id);
    if (editingId === log.id) resetForm();
  };

  const addSleep = async (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(hours);
    if (!h || h <= 0) return;

    const values = {
      hoursSlept: h,
      quality: quality as SleepLog['quality'],
      hadMelatonin,
      notes: notes.trim() || undefined,
    };

    if (editingId) {
      if (!editingDate) return;
      await db.sleepLogs.update(editingId, { ...values, date: editingDate });
      resetForm();
      return;
    }

    await db.sleepLogs.add({ date: getLocalDateString(), ...values });

    setHours('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100">Sueño & Descanso</h2>
        <p className="text-xs text-slate-400">Registra tus horas de descanso y observa tendencias para afianzar tu rutina nocturna.</p>
      </div>

      <form ref={formRef} onSubmit={addSleep} className="scroll-mt-4 p-4 bg-[#0d1424] border border-slate-800 rounded-2xl space-y-4">
        {editingId && <EditingBanner date={editingDate} onDateChange={setEditingDate} onCancel={resetForm} />}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="number"
            step="0.5"
            placeholder="Horas dormidas (ej: 8)"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Calidad:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setQuality(star)}
                className={`p-1.5 rounded-lg border transition-all ${
                  quality >= star
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'bg-slate-900 text-slate-600 border-slate-800'
                }`}
              >
                <Star size={14} fill={quality >= star ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={hadMelatonin}
              onChange={(e) => setHadMelatonin(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
            />
            Tomé melatonina
          </label>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Notas (ej: Leí 20 min antes de dormir, sin pantallas)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
          />
          <button
            type="submit"
            className="flex shrink-0 items-center gap-2 bg-indigo-500 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs hover:bg-indigo-400 transition-colors"
          >
            {editingId ? <><Check size={16} /> Guardar</> : <><Plus size={16} /> Registrar</>}
          </button>
        </div>
      </form>

      {/* Histórico de Sueño */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Histórico de Descanso</h3>
        {sleepLogs?.map((log) => (
          <div key={log.id} className={`flex items-center justify-between gap-3 p-3.5 bg-[#0d1424] border rounded-xl ${editingId === log.id ? 'border-amber-500/50' : 'border-slate-800'}`}>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-200">{log.hoursSlept} horas</span>
                <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                  <Star size={10} fill="currentColor" /> {log.quality}/5
                </span>
                {log.hadMelatonin && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Melatonina
                  </span>
                )}
              </div>
              {log.notes && <p className="text-[11px] text-slate-400 mt-1">{log.notes}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <span className="text-[11px] text-slate-500">{log.date}</span>
              <RowActions label="registro de sueño" onEdit={() => startEditing(log)} onDelete={() => void deleteSleep(log)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
