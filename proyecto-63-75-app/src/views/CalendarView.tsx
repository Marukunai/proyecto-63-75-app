import React from 'react';
import { Calendar as CalendarIcon, MapPin } from 'lucide-react';

export const CalendarView: React.FC = () => {
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
  const currentMonthStr = today.toLocaleDateString('es-ES', options);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100 capitalize">{currentMonthStr}</h2>
        <p className="text-xs text-slate-400">Planificación de entrenamientos, eventos y hábitos.</p>
      </div>

      {/* Evento Especial Japón */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🇯🇵</span>
          <div>
            <h3 className="text-xs font-bold text-slate-100">Evento Especial: Viaje Hong Kong / Japón</h3>
            <p className="text-[11px] text-slate-400">15 de Octubre - 31 de Octubre 2026</p>
          </div>
        </div>
        <span className="text-[10px] px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 font-semibold border border-red-500/30">
          Modo Japón
        </span>
      </div>

      <div className="p-5 bg-[#0d1424] border border-slate-800 rounded-2xl text-center text-xs text-slate-400 py-12">
        <CalendarIcon size={32} className="mx-auto mb-3 text-slate-600" />
        Vista de calendario integrada. En la Fase 2/3 se sincronizará automáticamente con marcas diarias de entrenamientos completados y viajes.
      </div>
    </div>
  );
};