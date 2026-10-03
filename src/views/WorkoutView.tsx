import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Exercise } from '../types';
import { getLocalDateString } from '../utils/dates';
import { Dumbbell, Plus, Trash2, Pencil, Trophy } from 'lucide-react';

export const WorkoutView: React.FC = () => {
  const exercises = useLiveQuery(() => db.exercises.toArray());
  const workoutLogs = useLiveQuery(() => db.workoutLogs.orderBy('date').reverse().toArray());
  const personalRecords = useLiveQuery(() => db.personalRecords.orderBy('date').reverse().toArray());

  const [selectedEx, setSelectedEx] = useState('');
  const [reps, setReps] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseCategory, setExerciseCategory] = useState<Exercise['category']>('Pecho');
  const [equipmentRequired, setEquipmentRequired] = useState('Ninguno');
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [recordExerciseId, setRecordExerciseId] = useState('');
  const [recordValue, setRecordValue] = useState('');
  const [recordNotes, setRecordNotes] = useState('');

  const addSet = async (e: React.FormEvent) => {
    e.preventDefault();
    const repetitions = Number(reps);
    const additionalWeight = weightKg ? Number(weightKg) : undefined;
    if (!selectedEx || !Number.isInteger(repetitions) || repetitions <= 0) return;
    if (additionalWeight !== undefined && (!Number.isFinite(additionalWeight) || additionalWeight < 0)) return;

    const todayStr = getLocalDateString();
    
    await db.workoutLogs.add({
      date: todayStr,
      exerciseId: selectedEx,
      sets: [{ reps: repetitions, weightKg: additionalWeight }]
    });

    setReps('');
    setWeightKg('');
  };

  const saveExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseName.trim()) return;
    const exercise: Exercise = {
      id: editingExerciseId ?? crypto.randomUUID(),
      name: exerciseName.trim(),
      category: exerciseCategory,
      equipmentRequired: equipmentRequired.trim() || 'Ninguno',
    };
    await db.exercises.put(exercise);
    setExerciseName('');
    setEquipmentRequired('Ninguno');
    setEditingExerciseId(null);
  };

  const startEditingExercise = (exercise: Exercise) => {
    setEditingExerciseId(exercise.id);
    setExerciseName(exercise.name);
    setExerciseCategory(exercise.category);
    setEquipmentRequired(exercise.equipmentRequired);
  };

  const deleteExercise = async (exercise: Exercise) => {
    const [workoutCount, recordCount] = await Promise.all([
      db.workoutLogs.where('exerciseId').equals(exercise.id).count(),
      db.personalRecords.where('exerciseId').equals(exercise.id).count(),
    ]);
    if (workoutCount || recordCount) {
      alert('No se puede eliminar: este ejercicio tiene entrenamientos o récords guardados. Puedes editarlo en su lugar.');
      return;
    }
    if (window.confirm(`¿Eliminar el ejercicio «${exercise.name}»?`)) {
      await db.exercises.delete(exercise.id);
      if (selectedEx === exercise.id) setSelectedEx('');
      if (editingExerciseId === exercise.id) {
        setEditingExerciseId(null);
        setExerciseName('');
      }
    }
  };

  const addPersonalRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordExerciseId || !recordValue.trim()) return;
    await db.personalRecords.add({
      exerciseId: recordExerciseId,
      recordValue: recordValue.trim(),
      date: getLocalDateString(),
      notes: recordNotes.trim() || undefined,
    });
    setRecordValue('');
    setRecordNotes('');
  };

  const categories: Exercise['category'][] = [
    'Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps', 'Piernas', 'Glúteos', 'Core', 'Movilidad', 'Postura',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100">Entrenamiento en Casa</h2>
        <p className="text-xs text-slate-400">Registra series, gestiona ejercicios y guarda tus récords personales.</p>
      </div>

      <form onSubmit={addSet} className="p-4 bg-[#0d1424] border border-slate-800 rounded-2xl space-y-3">
        <select
          value={selectedEx}
          onChange={(e) => setSelectedEx(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
        >
          <option value="">Selecciona ejercicio...</option>
          {exercises?.map((ex) => (
            <option key={ex.id} value={ex.id}>{ex.name} ({ex.category})</option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-3 sm:flex">
          <input
            type="number"
            min="1"
            step="1"
            placeholder="Repeticiones"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
          />
          <input
            type="number"
            min="0"
            step="0.1"
            placeholder="Mochila / Peso (kg)"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
          />
          <button
            type="submit"
            className="col-span-2 flex shrink-0 items-center justify-center gap-2 bg-cyan-500 text-slate-950 font-semibold px-4 py-2.5 rounded-xl text-xs hover:bg-cyan-400 transition-colors"
          >
            <Plus size={16} /> Serie
          </button>
        </div>
      </form>

      {exercises?.length === 0 && (
        <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200">
          No hay ejercicios en el catálogo todavía. Añade uno en el apartado de gestión.
        </p>
      )}

      {selectedEx && exercises?.find((exercise) => exercise.id === selectedEx)?.equipmentRequired !== 'Ninguno' && (
        <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200">
          Comprueba que tienes y puedes usar con seguridad el material indicado para este ejercicio.
        </p>
      )}

      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Registro de Series Recientes</h3>
        {workoutLogs?.map((log) => {
          const ex = exercises?.find((e) => e.id === log.exerciseId);
          return (
            <div key={log.id} className="flex items-center justify-between p-3.5 bg-[#0d1424] border border-slate-800 rounded-xl">
              <div>
                <span className="text-xs font-bold text-slate-200 block">{ex?.name || 'Ejercicio'}</span>
                <span className="text-[11px] text-cyan-400">
                  {log.sets[0]?.reps} reps {log.sets[0]?.weightKg ? `(${log.sets[0].weightKg} kg mochila)` : ''}
                </span>
              </div>
              <span className="text-[11px] text-slate-500">{log.date}</span>
            </div>
          );
        })}
      </div>

      <section className="p-4 bg-[#0d1424] border border-slate-800 rounded-2xl space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">{editingExerciseId ? 'Editar ejercicio' : 'Gestionar ejercicios'}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Indica el material necesario. No añadas cargas o apoyos inestables.</p>
        </div>
        <form onSubmit={saveExercise} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            required
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            placeholder="Nombre del ejercicio"
            className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100"
          />
          <select value={exerciseCategory} onChange={(e) => setExerciseCategory(e.target.value as Exercise['category'])} className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100">
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <input
            value={equipmentRequired}
            onChange={(e) => setEquipmentRequired(e.target.value)}
            placeholder="Material necesario (o Ninguno)"
            className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100"
          />
          <div className="flex gap-2">
            <button type="submit" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950">
              <Plus size={15} /> {editingExerciseId ? 'Guardar cambios' : 'Añadir ejercicio'}
            </button>
            {editingExerciseId && <button type="button" onClick={() => { setEditingExerciseId(null); setExerciseName(''); setEquipmentRequired('Ninguno'); }} className="rounded-xl border border-slate-700 px-3 text-xs text-slate-300">Cancelar</button>}
          </div>
        </form>
        <div className="space-y-2">
          {exercises?.map((exercise) => (
            <div key={exercise.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-200">{exercise.name} <span className="text-slate-500">· {exercise.category}</span></p>
                <p className="text-[10px] text-slate-500">Material: {exercise.equipmentRequired}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button type="button" onClick={() => startEditingExercise(exercise)} aria-label={`Editar ${exercise.name}`} className="rounded-lg p-2 text-slate-400 hover:text-cyan-300"><Pencil size={14} /></button>
                <button type="button" onClick={() => void deleteExercise(exercise)} aria-label={`Eliminar ${exercise.name}`} className="rounded-lg p-2 text-slate-400 hover:text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="p-4 bg-[#0d1424] border border-slate-800 rounded-2xl space-y-3">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2"><Trophy size={16} className="text-amber-400" /> Récord personal</h3>
        <form onSubmit={addPersonalRecord} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select required value={recordExerciseId} onChange={(e) => setRecordExerciseId(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100">
            <option value="">Selecciona ejercicio…</option>
            {exercises?.map((exercise) => <option key={exercise.id} value={exercise.id}>{exercise.name}</option>)}
          </select>
          <input required value={recordValue} onChange={(e) => setRecordValue(e.target.value)} placeholder="Récord (p. ej. 20 reps o 8 kg)" className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100" />
          <button type="submit" className="rounded-xl bg-amber-400 px-4 py-2 text-xs font-semibold text-slate-950">Guardar récord</button>
          <input value={recordNotes} onChange={(e) => setRecordNotes(e.target.value)} placeholder="Nota opcional" className="sm:col-span-3 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100" />
        </form>
        <div className="space-y-2">
          {personalRecords?.map((record) => (
            <div key={record.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-3">
              <div>
                <p className="text-xs text-slate-200">{exercises?.find((exercise) => exercise.id === record.exerciseId)?.name ?? 'Ejercicio eliminado'}: <strong className="text-amber-300">{record.recordValue}</strong></p>
                {record.notes && <p className="mt-1 text-[10px] text-slate-500">{record.notes}</p>}
              </div>
              <time className="shrink-0 text-[10px] text-slate-500">{record.date}</time>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
