import React, { useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Plus, Check } from 'lucide-react';
import { Habit } from '../types';
import { RowActions, EditingBanner, confirmDelete, scrollIntoViewSmooth } from '../components/shared/EditControls';

export const HabitsView: React.FC = () => {
  const habits = useLiveQuery(() => db.habits.toArray());
  const [newTitle, setNewTitle] = useState('');
  const [category, setCategory] = useState<Habit['category']>('Cuerpo');
  const [isMinimumModeAllowed, setIsMinimumModeAllowed] = useState(true);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const iconFor = (cat: Habit['category']) => (cat === 'Cuerpo' ? '🏋️' : cat === 'Trabajo' ? '💻' : '🧠');

  const resetForm = () => {
    setEditingHabit(null);
    setNewTitle('');
    setIsMinimumModeAllowed(true);
  };

  const startEditing = (habit: Habit) => {
    setEditingHabit(habit);
    setNewTitle(habit.title);
    setCategory(habit.category);
    setIsMinimumModeAllowed(habit.isMinimumModeAllowed);
    scrollIntoViewSmooth(formRef.current);
  };

  const addHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (editingHabit) {
      await db.habits.update(editingHabit.id, {
        title: newTitle.trim(),
        category,
        // Conserva el icono propio salvo que cambie la categoría.
        icon: category === editingHabit.category ? editingHabit.icon : iconFor(category),
        isMinimumModeAllowed,
      });
      resetForm();
      return;
    }

    await db.habits.add({
      id: Date.now().toString(),
      title: newTitle.trim(),
      category,
      icon: category === 'Cuerpo' ? '🏋️' : category === 'Trabajo' ? '💻' : '🧠',
      frequency: 'daily',
      isMinimumModeAllowed,
    });

    resetForm();
  };

  const deleteHabit = async (habit: Habit) => {
    if (!confirmDelete(`el hábito «${habit.title}»`)) return;
    await db.habits.delete(habit.id);
    if (editingHabit?.id === habit.id) resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Gestión de Hábitos</h2>
          <p className="text-xs text-slate-400">Configura tus rutinas diarias y semanales.</p>
        </div>
      </div>

      <form ref={formRef} onSubmit={addHabit} className="scroll-mt-4 space-y-3 p-4 bg-[#0d1424] border border-slate-800 rounded-2xl">
        {editingHabit && <EditingBanner onCancel={resetForm} />}
        <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Nuevo hábito (ej: Leer 15 mins)..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Habit['category'])}
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
          {editingHabit ? <><Check size={16} /> Guardar</> : <><Plus size={16} /> Añadir</>}
        </button>
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-300">
          <input type="checkbox" checked={isMinimumModeAllowed} onChange={(e) => setIsMinimumModeAllowed(e.target.checked)} />
          Mostrar también en Modo Mínimo (días difíciles)
        </label>
      </form>

      <div className="space-y-2">
        {habits?.map((h) => (
          <div key={h.id} className={`flex items-center justify-between gap-3 p-3.5 bg-[#0d1424] border rounded-xl ${editingHabit?.id === h.id ? 'border-amber-500/50' : 'border-slate-800'}`}>
            <div className="flex min-w-0 items-center gap-3">
              <span className="text-base">{h.icon}</span>
              <div>
                <span className="text-xs font-semibold text-slate-200 block">{h.title}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">{h.category}{!h.isMinimumModeAllowed && ' · fuera del Modo Mínimo'}</span>
              </div>
            </div>
            <RowActions label={`hábito ${h.title}`} onEdit={() => startEditing(h)} onDelete={() => void deleteHabit(h)} />
          </div>
        ))}
      </div>
    </div>
  );
};