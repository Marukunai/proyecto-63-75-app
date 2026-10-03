import React from 'react';
import { Pencil, Trash2, X } from 'lucide-react';

/** Botones de editar / borrar para cada fila de un histórico. */
export const RowActions: React.FC<{ label: string; onEdit: () => void; onDelete: () => void }> = ({ label, onEdit, onDelete }) => (
  <div className="flex shrink-0 gap-1" onClick={(e) => e.stopPropagation()}>
    <button type="button" onClick={onEdit} aria-label={`Editar ${label}`} className="rounded-lg p-2 text-slate-400 hover:text-cyan-300">
      <Pencil size={14} />
    </button>
    <button type="button" onClick={onDelete} aria-label={`Eliminar ${label}`} className="rounded-lg p-2 text-slate-400 hover:text-red-400">
      <Trash2 size={14} />
    </button>
  </div>
);

/** Aviso que aparece encima del formulario mientras se edita un registro. */
export const EditingBanner: React.FC<{ date?: string; onDateChange?: (date: string) => void; onCancel: () => void }> = ({ date, onDateChange, onCancel }) => (
  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
    <span className="font-semibold">Editando registro</span>
    <div className="flex flex-wrap items-center gap-2">
      {date !== undefined && onDateChange && (
        <label className="flex items-center gap-2">
          Fecha
          <input
            type="date"
            required
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-100"
          />
        </label>
      )}
      <button type="button" onClick={onCancel} className="flex items-center gap-1 rounded-lg border border-amber-500/30 px-2 py-1 hover:bg-amber-500/10">
        <X size={12} /> Cancelar
      </button>
    </div>
  </div>
);

export const confirmDelete = (what: string) => window.confirm(`¿Eliminar ${what}? Esta acción no se puede deshacer.`);

export const scrollIntoViewSmooth = (element: HTMLElement | null) => {
  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
