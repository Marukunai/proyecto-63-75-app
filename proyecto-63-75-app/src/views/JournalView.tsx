import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { BookOpen, Plus, Calendar } from 'lucide-react';
import { getLocalDateString } from '../utils/dates';

const getWeekStartDate = (date: Date) => {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const daysSinceMonday = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - daysSinceMonday);
  return getLocalDateString(monday);
};

const formatDate = (dateString: string) =>
  new Date(`${dateString}T12:00:00`).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export const JournalView: React.FC = () => {
  const [tab, setTab] = useState<'daily' | 'weekly'>('daily');
  const journalEntries = useLiveQuery(() => db.journalEntries.orderBy('date').reverse().toArray());
  const weeklyReviews = useLiveQuery(() => db.weeklyReviews.orderBy('weekStartDate').reverse().toArray());
  const legacyWeeklyEntries = journalEntries?.filter((entry) => entry.moodTags.includes('Revisión Semanal')) ?? [];

  // Estado diario
  const [content, setContent] = useState('');
  const [selectedTag, setSelectedTag] = useState('Salud');

  // Estado semanal
  const [wentWell, setWentWell] = useState('');
  const [wentWrong, setWentWrong] = useState('');
  const [learned, setLearned] = useState('');
  const [priority, setPriority] = useState('');

  const addDailyEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    await db.journalEntries.add({
      date: getLocalDateString(),
      content: content.trim(),
      moodTags: [selectedTag],
    });

    setContent('');
  };

  const addWeeklyReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wentWell.trim() || !priority.trim()) return;

    await db.weeklyReviews.add({
      weekStartDate: getWeekStartDate(new Date()),
      whatWentWell: wentWell.trim(),
      whatWentWrong: wentWrong.trim(),
      whatILearned: learned.trim(),
      nextWeekPriority: priority.trim(),
    });

    setWentWell('');
    setWentWrong('');
    setLearned('');
    setPriority('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100">Diario & Reflexión Personal</h2>
        <p className="text-xs text-slate-400">Espacio privado e íntimo para vaciar la mente y realizar las revisiones semanales.</p>
      </div>

      <div className="flex gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
        <button
          onClick={() => setTab('daily')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            tab === 'daily'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          📖 Reflejo Diario
        </button>
        <button
          onClick={() => setTab('weekly')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            tab === 'weekly'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          📊 Revisión Semanal (Domingos)
        </button>
      </div>

      {tab === 'daily' ? (
        <form onSubmit={addDailyEntry} className="p-4 bg-[#0d1424] border border-slate-800 rounded-2xl space-y-3">
          <textarea
            rows={4}
            placeholder="¿Cómo te sientes hoy? ¿Qué te preocupa o qué has conseguido?..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none w-full sm:w-auto"
            >
              <option value="Salud">Salud / Físico</option>
              <option value="Emociones">Emociones / Mente</option>
              <option value="Trabajo">Programación / Proyectos</option>
              <option value="Familia">Familia / Amigos</option>
            </select>

            <button
              type="submit"
              className="flex items-center gap-2 bg-cyan-500 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs hover:bg-cyan-400 transition-colors w-full sm:w-auto justify-center"
            >
              <Plus size={16} /> Guardar Entrada
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={addWeeklyReview} className="p-4 bg-[#0d1424] border border-slate-800 rounded-2xl space-y-3">
          <input
            type="text"
            placeholder="1. ¿Qué hice bien esta semana?"
            value={wentWell}
            onChange={(e) => setWentWell(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none"
          />
          <input
            type="text"
            placeholder="2. ¿Qué salió mal o se puede mejorar?"
            value={wentWrong}
            onChange={(e) => setWentWrong(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none"
          />
          <input
            type="text"
            placeholder="3. ¿Qué he aprendido de mí mismo?"
            value={learned}
            onChange={(e) => setLearned(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none"
          />
          <input
            type="text"
            placeholder="4. ¿Cuál es mi prioridad principal de la próxima semana?"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none"
          />

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs hover:bg-emerald-400 transition-colors"
          >
            <Plus size={16} /> Guardar Revisión Semanal
          </button>
        </form>
      )}

      {/* Entradas Guardadas */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          {tab === 'daily' ? 'Entradas anteriores' : 'Revisiones anteriores'}
        </h3>

        {tab === 'daily' ? (
          journalEntries?.filter((entry) => !entry.moodTags.includes('Revisión Semanal')).length ? journalEntries
            .filter((entry) => !entry.moodTags.includes('Revisión Semanal')).map((entry) => (
            <div key={entry.id} className="p-4 bg-[#0d1424] border border-slate-800 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700 font-medium">
                  {entry.moodTags[0] || 'Diario'}
                </span>
                <span className="text-[11px] text-slate-500">{formatDate(entry.date)}</span>
              </div>
              <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{entry.content}</p>
            </div>
          )) : (
            <p className="p-4 bg-[#0d1424] border border-slate-800 rounded-xl text-xs text-slate-500">
              Todavía no hay entradas diarias.
            </p>
          )
        ) : (
          weeklyReviews?.length || legacyWeeklyEntries.length ? (
            <>
              {weeklyReviews?.map((review) => (
                <div key={`review-${review.id}`} className="p-4 bg-[#0d1424] border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Calendar size={14} />
                    <span className="text-[11px] font-semibold">
                      Semana del {formatDate(review.weekStartDate)}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-300">
                    <p><span className="text-slate-500">Qué fue bien:</span> {review.whatWentWell}</p>
                    <p><span className="text-slate-500">Qué se puede mejorar:</span> {review.whatWentWrong || '—'}</p>
                    <p><span className="text-slate-500">Qué aprendí:</span> {review.whatILearned || '—'}</p>
                    <p><span className="text-slate-500">Prioridad de la próxima semana:</span> {review.nextWeekPriority}</p>
                  </div>
                </div>
              ))}
              {legacyWeeklyEntries.map((entry) => (
                <div key={`legacy-${entry.id}`} className="p-4 bg-[#0d1424] border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar size={14} />
                    <span className="text-[11px] font-semibold">Revisión anterior · {formatDate(entry.date)}</span>
                  </div>
                  <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{entry.content}</p>
                </div>
              ))}
            </>
          ) : (
            <p className="p-4 bg-[#0d1424] border border-slate-800 rounded-xl text-xs text-slate-500">
              Todavía no hay revisiones semanales guardadas.
            </p>
          )
        )}
      </div>
    </div>
  );
};
