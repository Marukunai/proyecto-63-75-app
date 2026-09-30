import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Code2, Plus, Brain, CheckCircle2, Clock } from 'lucide-react';

export const ProjectsView: React.FC = () => {
  const [activeProject, setActiveProject] = useState<'poker' | 'kaizo'>('poker');
  const tasks = useLiveQuery(() => db.projectTasks.where('projectId').equals(activeProject).toArray(), [activeProject]);

  const [title, setTitle] = useState('');
  const [usedFirstAttempt, setUsedFirstAttempt] = useState(true);
  const [timeSpent, setTimeSpent] = useState('');

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await db.projectTasks.add({
      projectId: activeProject,
      title: title.trim(),
      status: 'backlog',
      timeSpentMinutes: timeSpent ? parseInt(timeSpent) : undefined,
      usedFirstAttemptWithoutAI: usedFirstAttempt,
    });

    setTitle('');
    setTimeSpent('');
  };

  const toggleTaskStatus = async (id?: number, currentStatus?: string) => {
    if (!id) return;
    const nextStatus = currentStatus === 'completed' ? 'in_progress' : 'completed';
    await db.projectTasks.update(id, { status: nextStatus });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100">Proyectos Personales</h2>
        <p className="text-xs text-slate-400">Organiza Poker Online y KaizoBankKunai midiendo tu autonomía en programación.</p>
      </div>

      {/* Selector de Proyecto */}
      <div className="flex gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
        <button
          onClick={() => setActiveProject('poker')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeProject === 'poker'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          ♠️ Poker Online
        </button>
        <button
          onClick={() => setActiveProject('kaizo')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeProject === 'kaizo'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🏦 KaizoBankKunai (con Aymane)
        </button>
      </div>

      {/* Módulo "Intento Primero" */}
      <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 space-y-2">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
          <Brain size={16} />
          <span>Hábito: "Intento Primero" (Autonomía)</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Intenta resolver el problema por tu cuenta antes de solicitar ayuda a la IA. La meta no es evitar la IA, sino usarla como herramienta sin perder tu capacidad lógica.
        </p>
      </div>

      {/* Formulario de Tarea */}
      <form onSubmit={addTask} className="p-4 bg-[#0d1424] border border-slate-800 rounded-2xl space-y-3">
        <input
          type="text"
          placeholder="Nombre de la tarea / función a implementar..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={usedFirstAttempt}
              onChange={(e) => setUsedFirstAttempt(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
            />
            Intentado primero por mí mismo
          </label>

          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="number"
              placeholder="Minutos dedicados"
              value={timeSpent}
              onChange={(e) => setTimeSpent(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none w-36"
            />
            <button
              type="submit"
              className="flex items-center gap-2 bg-cyan-500 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs hover:bg-cyan-400 transition-colors"
            >
              <Plus size={16} /> Crear
            </button>
          </div>
        </div>
      </form>

      {/* Lista de Tareas */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tareas del Proyecto</h3>
        {tasks?.map((t) => (
          <div
            key={t.id}
            onClick={() => toggleTaskStatus(t.id, t.status)}
            className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
              t.status === 'completed'
                ? 'bg-slate-900/40 border-slate-800/80 text-slate-500 line-through'
                : 'bg-[#0d1424] border-slate-800 text-slate-200 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 size={18} className={t.status === 'completed' ? 'text-emerald-500' : 'text-slate-600'} />
              <div>
                <span className="text-xs font-medium block">{t.title}</span>
                {t.usedFirstAttemptWithoutAI && (
                  <span className="text-[9px] text-indigo-400 font-semibold">🧠 Intento autónomo</span>
                )}
              </div>
            </div>
            {t.timeSpentMinutes && (
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Clock size={12} /> {t.timeSpentMinutes} min
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};