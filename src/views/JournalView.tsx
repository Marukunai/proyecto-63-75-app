import React, { useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Plus, Calendar, Check, Trash2 } from 'lucide-react';
import { JournalEntry, WeeklyReview } from '../types';
import { RowActions, EditingBanner, confirmDelete, scrollIntoViewSmooth } from '../components/shared/EditControls';
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

  // Edición
  const formRef = useRef<HTMLFormElement>(null);
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null);
  const [editingEntryDate, setEditingEntryDate] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editingReviewDate, setEditingReviewDate] = useState('');

  const resetDaily = () => {
    setEditingEntryId(null);
    setContent('');
  };

  const resetWeekly = () => {
    setEditingReviewId(null);
    setWentWell('');
    setWentWrong('');
    setLearned('');
    setPriority('');
  };

  const switchTab = (next: 'daily' | 'weekly') => {
    resetDaily();
    resetWeekly();
    setTab(next);
  };

  const startEditingEntry = (entry: JournalEntry) => {
    resetWeekly();
    setEditingEntryId(entry.id ?? null);
    setEditingEntryDate(entry.date);
    setContent(entry.content);
    setSelectedTag(entry.moodTags[0] || 'Salud');
    scrollIntoViewSmooth(formRef.current);
  };

  const deleteEntry = async (entry: JournalEntry, what = 'esta entrada del diario') => {
    if (!entry.id || !confirmDelete(what)) return;
    await db.journalEntries.delete(entry.id);
    if (editingEntryId === entry.id) resetDaily();
  };

  const startEditingReview = (review: WeeklyReview) => {
    resetDaily();
    setEditingReviewId(review.id ?? null);
    setEditingReviewDate(review.weekStartDate);
    setWentWell(review.whatWentWell);
    setWentWrong(review.whatWentWrong);
    setLearned(review.whatILearned);
    setPriority(review.nextWeekPriority);
    scrollIntoViewSmooth(formRef.current);
  };

  const deleteReview = async (review: WeeklyReview) => {
    if (!review.id || !confirmDelete('esta revisión semanal')) return;
    await db.weeklyReviews.delete(review.id);
    if (editingReviewId === review.id) resetWeekly();
  };

  const addDailyEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (editingEntryId) {
      if (!editingEntryDate) return;
      const original = journalEntries?.find((entry) => entry.id === editingEntryId);
      const otherTags = (original?.moodTags ?? []).slice(1);
      await db.journalEntries.update(editingEntryId, {
        date: editingEntryDate,
        content: content.trim(),
        moodTags: [selectedTag, ...otherTags],
      });
      resetDaily();
      return;
    }

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

    const values = {
      whatWentWell: wentWell.trim(),
      whatWentWrong: wentWrong.trim(),
      whatILearned: learned.trim(),
      nextWeekPriority: priority.trim(),
    };

    if (editingReviewId) {
      if (!editingReviewDate) return;
      // La revisión se agrupa por semana: cualquier día elegido se normaliza a su lunes.
      await db.weeklyReviews.update(editingReviewId, {
        ...values,
        weekStartDate: getWeekStartDate(new Date(`${editingReviewDate}T12:00:00`)),
      });
      resetWeekly();
      return;
    }

    await db.weeklyReviews.add({ weekStartDate: getWeekStartDate(new Date()), ...values });

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
          onClick={() => switchTab('daily')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            tab === 'daily'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          📖 Reflejo Diario
        </button>
        <button
          onClick={() => switchTab('weekly')}
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
        <form ref={formRef} onSubmit={addDailyEntry} className="scroll-mt-4 p-4 bg-[#0d1424] border border-slate-800 rounded-2xl space-y-3">
          {editingEntryId && <EditingBanner date={editingEntryDate} onDateChange={setEditingEntryDate} onCancel={resetDaily} />}
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
              {editingEntryId ? <><Check size={16} /> Guardar cambios</> : <><Plus size={16} /> Guardar Entrada</>}
            </button>
          </div>
        </form>
      ) : (
        <form ref={formRef} onSubmit={addWeeklyReview} className="scroll-mt-4 p-4 bg-[#0d1424] border border-slate-800 rounded-2xl space-y-3">
          {editingReviewId && <EditingBanner date={editingReviewDate} onDateChange={setEditingReviewDate} onCancel={resetWeekly} />}
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
            {editingReviewId ? <><Check size={16} /> Guardar cambios</> : <><Plus size={16} /> Guardar Revisión Semanal</>}
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
            <div key={entry.id} className={`p-4 bg-[#0d1424] border rounded-xl space-y-2 ${editingEntryId === entry.id ? 'border-amber-500/50' : 'border-slate-800'}`}>
              <div className="flex justify-between items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700 font-medium">
                  {entry.moodTags[0] || 'Diario'}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-500">{formatDate(entry.date)}</span>
                  <RowActions label="entrada" onEdit={() => startEditingEntry(entry)} onDelete={() => void deleteEntry(entry)} />
                </div>
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
                <div key={`review-${review.id}`} className={`p-4 bg-[#0d1424] border rounded-xl space-y-3 ${editingReviewId === review.id ? 'border-amber-500/50' : 'border-slate-800'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-cyan-400">
                      <Calendar size={14} />
                      <span className="text-[11px] font-semibold">
                        Semana del {formatDate(review.weekStartDate)}
                      </span>
                    </div>
                    <RowActions label="revisión semanal" onEdit={() => startEditingReview(review)} onDelete={() => void deleteReview(review)} />
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
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar size={14} />
                      <span className="text-[11px] font-semibold">Revisión anterior · {formatDate(entry.date)}</span>
                    </div>
                    <button type="button" onClick={() => void deleteEntry(entry, 'esta revisión anterior')} aria-label="Eliminar revisión anterior" className="rounded-lg p-2 text-slate-400 hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
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
