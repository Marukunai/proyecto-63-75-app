import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Plus, CheckSquare, Trash2 } from 'lucide-react';

export const HabitsView: React.FC = () => {
  const habits = useLiveQuery(() => db.habits.toArray());
  const [newTitle, setNewTitle] = useState('');
  const [category, setCategory] = useState<'Cuerpo' | 'Mente' | 'Trabajo' | 'Vida' | 'Personal'>('Cuerpo');

  const addHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await db.habits.add({
      id: Date.now().toString(),
      title: newTitle.trim(),
      category,
      icon: category === 'Cuerpo' ? '🏋️' : category === 'Trabajo' ? '💻' : '🧠',
      frequency: 'daily',
      isMinimumModeAllowed: true,
    });

    setNewTitle('');
  };

  const deleteHabit = async (id: string) => {
    await db.habits.delete(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Gestión de Hábitos</h2>
          <p className="text-xs text-slate-400">Configura tus rutinas diarias y semanales.</p>
        </div>
      </div>

      <form onSubmit={addHabit} className="flex flex-col sm:flex-row gap-3 p-4 bg-[#0d1424] border border-slate-800 rounded-2xl">
        <input
          type="text"
          placeholder="Nuevo hábito (ej: Leer 15 mins)..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
          className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
        >
          <option value="Cuerpo">Cuerpo</option>
          <option value="Mente">Mente</option>
          <option value="Trabajo">Trabajo</option>
          <option value="Vida">Vida</option>
          <option value="Personal">Personal</option>
        </select>
        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-cyan-500 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs hover:bg-cyan-400 transition-colors"
        >
          <Plus size={16} /> Añadir
        </button>
      </form>

      <div className="space-y-2">
        {habits?.map((h) => (
          <div key={h.id} className="flex items-center justify-between p-3.5 bg-[#0d1424] border border-slate-800 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-base">{h.icon}</span>
              <div>
                <span className="text-xs font-semibold text-slate-200 block">{h.title}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">{h.category}</span>
              </div>
            </div>
            <button
              onClick={() => deleteHabit(h.id)}
              className="text-slate-500 hover:text-red-400 p-1 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};