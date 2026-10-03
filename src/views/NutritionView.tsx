import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { getLocalDateString } from '../utils/dates';
import { Utensils, Plus, Flame, Lightbulb } from 'lucide-react';

export const NutritionView: React.FC = () => {
  const todayStr = getLocalDateString();
  const todayMeals = useLiveQuery(() => db.nutritionLogs.where('date').equals(todayStr).toArray());

  const [mealName, setMealName] = useState('Comida');
  const [description, setDescription] = useState('');
  const [protein, setProtein] = useState('');
  const [calories, setCalories] = useState('');

  const addMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    await db.nutritionLogs.add({
      date: todayStr,
      mealName,
      description: description.trim(),
      approxProteinGrams: protein ? parseInt(protein) : undefined,
      approxCalories: calories ? parseInt(calories) : undefined,
    });

    setDescription('');
    setProtein('');
    setCalories('');
  };

  const quickIdeas = [
    { title: 'Batido Densidad Calórica', desc: 'Leche + Plátano + 2 cucharadas de crema de cacahuete + Copos de avena' },
    { title: 'Snack Media Mañana', desc: 'Puñado generoso de frutos secos (nueces/almendras) + Plátano + Chocolate negro' },
    { title: 'Arroz/Patatas + Proteína', desc: 'Añadir un chorro generoso de aceite de oliva virgen extra tras cocinar' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100">Alimentación & Nutrición</h2>
        <p className="text-xs text-slate-400">Registra lo que comes y añade calorías/proteína de forma aproximada sin obsesiones.</p>
      </div>

      {/* Sugerencias para aumento progresivo */}
      <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 space-y-3">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
          <Lightbulb size={16} />
          <span>Ideas para aumentar ingesta calórica fácil (sin volúmenes enormes)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {quickIdeas.map((idea, idx) => (
            <div key={idx} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
              <span className="font-semibold text-slate-200 block mb-1">{idea.title}</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">{idea.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Formulario de registro */}
      <form onSubmit={addMeal} className="p-4 bg-[#0d1424] border border-slate-800 rounded-2xl space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
          >
            <option value="Desayuno">Desayuno</option>
            <option value="Media Mañana">Media Mañana</option>
            <option value="Comida">Comida</option>
            <option value="Merienda">Merienda</option>
            <option value="Cena">Cena</option>
            <option value="Snack / Recena">Snack / Recena</option>
          </select>
          <input
            type="text"
            placeholder="¿Qué has comido? (ej: Dorada con patatas o batido de avena)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex gap-3">
          <input
            type="number"
            placeholder="Proteína approx (g)"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Calorías approx (kcal)"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
          />
          <button
            type="submit"
            className="flex items-center gap-2 bg-cyan-500 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs hover:bg-cyan-400 transition-colors"
          >
            <Plus size={16} /> Añadir
          </button>
        </div>
      </form>

      {/* Registro de Comidas de Hoy */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Comidas Registradas Hoy</h3>
        {todayMeals?.length === 0 && (
          <p className="text-xs text-slate-500 italic">No has registrado ninguna comida para hoy aún.</p>
        )}
        {todayMeals?.map((meal) => (
          <div key={meal.id} className="flex items-center justify-between p-3.5 bg-[#0d1424] border border-slate-800 rounded-xl">
            <div>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">{meal.mealName}</span>
              <p className="text-xs font-medium text-slate-200 mt-0.5">{meal.description}</p>
            </div>
            <div className="text-right text-[11px] text-slate-400">
              {meal.approxProteinGrams && <span className="block font-semibold text-emerald-400">{meal.approxProteinGrams}g pro</span>}
              {meal.approxCalories && <span>{meal.approxCalories} kcal</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
