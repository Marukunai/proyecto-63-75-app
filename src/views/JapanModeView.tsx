import React, { useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { getLocalDateString } from '../utils/dates';
import { Check, Compass, Footprints, Plus } from 'lucide-react';
import { JapanDayLog } from '../types';
import { RowActions, EditingBanner, confirmDelete, scrollIntoViewSmooth } from '../components/shared/EditControls';

export const JapanModeView: React.FC<{ tripName?: string }> = ({ tripName = 'Viaje' }) => {
  const logs = useLiveQuery(() => db.japanLogs.orderBy('date').reverse().toArray());
  const [date, setDate] = useState(() => getLocalDateString());
  const [location, setLocation] = useState('');
  const [steps, setSteps] = useState('');
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const resetForm = () => {
    setEditingId(null);
    setDate(getLocalDateString());
    setLocation('');
    setSteps('');
    setNotes('');
  };

  const startEditing = (log: JapanDayLog) => {
    setEditingId(log.id ?? null);
    setDate(log.date);
    setLocation(log.location);
    setSteps(log.stepsCount !== undefined ? String(log.stepsCount) : '');
    setNotes(log.notes ?? '');
    scrollIntoViewSmooth(formRef.current);
  };

  const deleteLog = async (log: JapanDayLog) => {
    if (!log.id || !confirmDelete('este registro del viaje')) return;
    await db.japanLogs.delete(log.id);
    if (editingId === log.id) resetForm();
  };

  const addLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim() || !date) return;
    if (editingId) {
      await db.japanLogs.update(editingId, { date, location: location.trim(), stepsCount: steps ? Number(steps) : undefined, notes: notes.trim() || undefined });
      resetForm();
      return;
    }
    await db.japanLogs.add({ date, tripName, location: location.trim(), stepsCount: steps ? Number(steps) : undefined, isTourismDay: true, isRestDay: false, notes: notes.trim() || undefined });
    setSteps(''); setNotes('');
  };

  return <div className="space-y-6">
    <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/50 via-slate-900 to-slate-900 border border-cyan-500/20 space-y-2">
      <div className="flex items-center gap-3"><Compass className="text-cyan-400" size={26} /><div><h2 className="text-lg font-bold text-slate-100">{tripName}</h2><p className="text-xs text-slate-300">Guarda recuerdos, lugares y actividad de tu viaje.</p></div></div>
    </div>
    <form ref={formRef} onSubmit={addLog} className="scroll-mt-4 p-4 bg-[#0d1424] border border-slate-800 rounded-2xl space-y-3">
      {editingId && <EditingBanner onCancel={resetForm} />}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100" />
        <input required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Lugar o actividad" className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100" />
      </div>
      <div className="flex gap-3"><input type="number" min="0" placeholder="Pasos (opcional)" value={steps} onChange={(e) => setSteps(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100" /><button className="flex shrink-0 items-center gap-2 bg-cyan-500 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs">{editingId ? <Check size={16} /> : <Plus size={16} />} Guardar</button></div>
      <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas del día" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100" />
    </form>
    <div className="space-y-2"><h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Diario de {tripName}</h3>
      {logs?.map((log) => <div key={log.id} className={`p-3.5 bg-[#0d1424] border rounded-xl flex items-center justify-between gap-3 ${editingId === log.id ? 'border-amber-500/50' : 'border-slate-800'}`}><div className="min-w-0"><div className="flex items-center gap-2"><span className="text-xs font-bold text-slate-200">{log.location}</span><span className="text-[10px] text-cyan-400">{log.date}</span>{log.tripName && <span className="text-[10px] text-slate-500">· {log.tripName}</span>}</div>{log.notes && <p className="text-[11px] text-slate-400 mt-1">{log.notes}</p>}</div><div className="flex shrink-0 items-center gap-1">{log.stepsCount ? <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1"><Footprints size={14} />{log.stepsCount.toLocaleString()} pasos</span> : null}<RowActions label="registro del viaje" onEdit={() => startEditing(log)} onDelete={() => void deleteLog(log)} /></div></div>)}
    </div>
  </div>;
};
