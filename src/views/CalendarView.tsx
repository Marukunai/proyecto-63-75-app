import React, { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Scale,
  Utensils,
  Moon,
  BookOpen,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { db } from '../db';

const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const formatDateLong = (date: Date) => {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const isSameDay = (date: Date, dateString: string) => {
  return getLocalDateString(date) === dateString;
};

export const CalendarView: React.FC = () => {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [selectedDate, setSelectedDate] = useState(
    getLocalDateString(today)
  );

  const weightLogs = useLiveQuery(() => db.weightLogs.toArray(), []);
  const workoutLogs = useLiveQuery(() => db.workoutLogs.toArray(), []);
  const nutritionLogs = useLiveQuery(() => db.nutritionLogs.toArray(), []);
  const sleepLogs = useLiveQuery(() => db.sleepLogs.toArray(), []);
  const journalEntries = useLiveQuery(() => db.journalEntries.toArray(), []);
  const dailyLogs = useLiveQuery(() => db.dailyLogs.toArray(), []);
  const travelLogs = useLiveQuery(() => db.japanLogs.toArray(), []);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthName = currentMonth.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Convertimos domingo=0 a lunes=0
    const firstWeekday = (firstDay.getDay() + 6) % 7;

    const days: (Date | null)[] = [];

    for (let i = 0; i < firstWeekday; i++) {
      days.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  }, [year, month]);

  const goPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const goNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const goToday = () => {
    const now = new Date();

    setCurrentMonth(
      new Date(now.getFullYear(), now.getMonth(), 1)
    );

    setSelectedDate(getLocalDateString(now));
  };

  const selectedDateObject = new Date(`${selectedDate}T12:00:00`);

  const selectedWeight =
    weightLogs?.filter((log) => log.date === selectedDate) ?? [];

  const selectedWorkout =
    workoutLogs?.filter((log) => log.date === selectedDate) ?? [];

  const selectedNutrition =
    nutritionLogs?.filter((log) => log.date === selectedDate) ?? [];

  const selectedSleep =
    sleepLogs?.filter((log) => log.date === selectedDate) ?? [];

  const selectedJournal =
    journalEntries?.filter((entry) => entry.date === selectedDate) ?? [];

  const selectedDailyLog =
    dailyLogs?.find((log) => log.date === selectedDate);

  const hasData = (dateString: string) => {
    return {
      weight:
        weightLogs?.some((log) => log.date === dateString) ?? false,

      workout:
        workoutLogs?.some((log) => log.date === dateString) ?? false,

      nutrition:
        nutritionLogs?.some((log) => log.date === dateString) ?? false,

      sleep:
        sleepLogs?.some((log) => log.date === dateString) ?? false,

      journal:
        journalEntries?.some((entry) => entry.date === dateString) ?? false,

      habits:
        dailyLogs?.some(
          (log) =>
            log.date === dateString &&
            log.completedHabits.length > 0
        ) ?? false,
    };
  };

  return (
    <div className="space-y-6">

      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="text-cyan-400" size={22} />

            <h2 className="text-xl font-bold text-slate-100">
              Calendario
            </h2>
          </div>

          <p className="text-xs text-slate-400 mt-1">
            Consulta y revisa todo lo que has hecho cada día.
          </p>
        </div>

        <button
          onClick={goToday}
          className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
        >
          Hoy
        </button>
      </div>

      {/* CALENDARIO */}
      <div className="bg-[#0d1424] border border-slate-800 rounded-2xl overflow-hidden">

        {/* HEADER MES */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">

          <button
            onClick={goPreviousMonth}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>

          <h3 className="text-sm font-bold text-slate-100 capitalize">
            {monthName}
          </h3>

          <button
            onClick={goNextMonth}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronRight size={18} />
          </button>

        </div>

        {/* DÍAS SEMANA */}
        <div className="grid grid-cols-7 border-b border-slate-800">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
            <div
              key={day}
              className="py-3 text-center text-[10px] font-semibold text-slate-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* GRID */}
        <div className="grid grid-cols-7">

          {calendarDays.map((date, index) => {

            if (!date) {
              return (
                <div
                  key={`empty-${index}`}
                  className="min-h-[90px] border-r border-b border-slate-800/60 bg-slate-950/20"
                />
              );
            }

            const dateString = getLocalDateString(date);
            const data = hasData(dateString);

            const selected = selectedDate === dateString;
            const todayDate = isSameDay(
              date,
              getLocalDateString(today)
            );

            const hasTravel = travelLogs?.some((log) => log.date === dateString) ?? false;

            return (
              <button
                key={dateString}
                onClick={() => setSelectedDate(dateString)}
                className={`
                  min-h-[90px] p-2 text-left border-r border-b border-slate-800/60
                  transition-all relative
                  ${selected
                    ? 'bg-cyan-500/10 ring-1 ring-inset ring-cyan-500/50'
                    : 'hover:bg-slate-800/40'
                  }
                `}
              >

                {/* NÚMERO */}
                <div className="flex items-center justify-between">

                  <span
                    className={`
                      flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold
                      ${todayDate
                        ? 'bg-cyan-500 text-slate-950'
                        : selected
                          ? 'text-cyan-400'
                          : 'text-slate-300'
                      }
                    `}
                  >
                    {date.getDate()}
                  </span>

                  {hasTravel && <span className="text-[10px] text-cyan-400">Viaje</span>}

                </div>

                {/* INDICADORES */}
                <div className="flex flex-wrap gap-1 mt-3">

                  {data.weight && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  )}

                  {data.workout && (
                    <span className="w-2 h-2 rounded-full bg-orange-400" />
                  )}

                  {data.nutrition && (
                    <span className="w-2 h-2 rounded-full bg-yellow-400" />
                  )}

                  {data.sleep && (
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                  )}

                  {data.habits && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  )}

                  {data.journal && (
                    <span className="w-2 h-2 rounded-full bg-pink-400" />
                  )}

                </div>

              </button>
            );
          })}

        </div>

        {/* LEYENDA */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 p-4 border-t border-slate-800">

          <Legend
            color="bg-emerald-400"
            label="Peso"
          />

          <Legend
            color="bg-orange-400"
            label="Entrenamiento"
          />

          <Legend
            color="bg-yellow-400"
            label="Comidas"
          />

          <Legend
            color="bg-purple-400"
            label="Sueño"
          />

          <Legend
            color="bg-cyan-400"
            label="Hábitos"
          />

          <Legend
            color="bg-pink-400"
            label="Diario"
          />

        </div>

      </div>

      {/* DETALLE DEL DÍA */}
      <div className="bg-[#0d1424] border border-slate-800 rounded-2xl p-5 space-y-5">

        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Día seleccionado
          </p>

          <h3 className="text-lg font-bold text-slate-100 capitalize mt-1">
            {formatDateLong(selectedDateObject)}
          </h3>
        </div>

        {travelLogs?.some((log) => log.date === selectedDate) && <p className="text-xs text-cyan-400">Hay un registro de viaje para este día.</p>}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

          <SummaryCard
            icon={<Scale size={16} />}
            label="Peso"
            value={
              selectedWeight.length > 0
                ? `${selectedWeight[selectedWeight.length - 1].weightKg} kg`
                : 'Sin registro'
            }
          />

          <SummaryCard
            icon={<Dumbbell size={16} />}
            label="Entrenamiento"
            value={
              selectedWorkout.length > 0
                ? `${selectedWorkout.length} registro${selectedWorkout.length !== 1 ? 's' : ''
                }`
                : 'Sin registro'
            }
          />

          <SummaryCard
            icon={<Utensils size={16} />}
            label="Comidas"
            value={
              selectedNutrition.length > 0
                ? `${selectedNutrition.length} comida${selectedNutrition.length !== 1 ? 's' : ''
                }`
                : 'Sin registro'
            }
          />

          <SummaryCard
            icon={<Moon size={16} />}
            label="Sueño"
            value={
              selectedSleep.length > 0
                ? `${selectedSleep[selectedSleep.length - 1].hoursSlept} h`
                : 'Sin registro'
            }
          />

          <SummaryCard
            icon={<BookOpen size={16} />}
            label="Diario"
            value={
              selectedJournal.length > 0
                ? `${selectedJournal.length} entrada${selectedJournal.length !== 1 ? 's' : ''
                }`
                : 'Sin registro'
            }
          />

          <SummaryCard
            icon={
              selectedDailyLog?.completedHabits.length
                ? <CheckCircle2 size={16} />
                : <Circle size={16} />
            }
            label="Hábitos"
            value={
              selectedDailyLog
                ? `${selectedDailyLog.completedHabits.length} completados`
                : 'Sin registro'
            }
          />

        </div>

        {/* ESTADO */}
        {selectedDailyLog && (
          <div className="pt-4 border-t border-slate-800">

            <div className="flex items-center justify-between">

              <span className="text-xs text-slate-400">
                Estado del día
              </span>

              <span
                className={`
                  text-[10px] px-2.5 py-1 rounded-full border
                  ${selectedDailyLog.isMinimumMode
                    ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }
                `}
              >
                {selectedDailyLog.isMinimumMode
                  ? 'Modo mínimo'
                  : 'Día normal'}
              </span>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};

interface LegendProps {
  color: string;
  label: string;
}

const Legend: React.FC<LegendProps> = ({
  color,
  label,
}) => (
  <div className="flex items-center gap-2">
    <span className={`w-2 h-2 rounded-full ${color}`} />

    <span className="text-[10px] text-slate-500">
      {label}
    </span>
  </div>
);

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  icon,
  label,
  value,
}) => (
  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">

    <div className="flex items-center gap-2 text-cyan-400 mb-2">
      {icon}

      <span className="text-[10px] text-slate-500">
        {label}
      </span>
    </div>

    <p className="text-xs font-semibold text-slate-200">
      {value}
    </p>

  </div>
);
