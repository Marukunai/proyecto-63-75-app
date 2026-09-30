import React, { useState } from 'react';
import { exportDataToJSON, importDataFromJSON } from '../services/dataExport';
import { saveSupabaseConfig } from '../services/supabaseClient';
import { Download, Upload, Cloud, RefreshCw, CheckCircle, ShieldCheck } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [supabaseUrl, setSupabaseUrl] = useState(localStorage.getItem('SUPABASE_URL') || '');
  const [supabaseKey, setSupabaseKey] = useState(localStorage.getItem('SUPABASE_ANON_KEY') || '');
  const [statusMsg, setStatusMsg] = useState('');

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseKey.trim()) return;

    saveSupabaseConfig(supabaseUrl.trim(), supabaseKey.trim());
    setStatusMsg('Configuración de Supabase guardada correctamente.');
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ok = await importDataFromJSON(file);
    if (ok) {
      alert('¡Copia de seguridad restaurada con éxito!');
      window.location.reload();
    } else {
      alert('Error al leer el archivo de copia de seguridad.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100">Ajustes, Copia de Seguridad & Nube</h2>
        <p className="text-xs text-slate-400">Gestiona tus datos, sincronización multi-dispositivo y privacidad.</p>
      </div>

      {/* Nube y Supabase */}
      <form onSubmit={handleSaveConfig} className="p-5 bg-[#0d1424] border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
          <Cloud size={18} />
          <span>Sincronización Cloud (Supabase)</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Introduce la URL y Anon Key de tu proyecto gratuito en Supabase para sincronizar PC y móvil automáticamente.
        </p>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Supabase Project URL (https://xyz.supabase.co)"
            value={supabaseUrl}
            onChange={(e) => setSupabaseUrl(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          />
          <input
            type="password"
            placeholder="Supabase Anon Key"
            value={supabaseKey}
            onChange={(e) => setSupabaseKey(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-cyan-500 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs hover:bg-cyan-400 transition-colors w-full sm:w-auto"
        >
          <RefreshCw size={14} /> Guardar Conexión Cloud
        </button>

        {statusMsg && (
          <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 mt-2">
            <CheckCircle size={14} /> {statusMsg}
          </p>
        )}
      </form>

      {/* Copia de Seguridad Local */}
      <div className="p-5 bg-[#0d1424] border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
          <ShieldCheck size={18} />
          <span>Copias de Seguridad Locales (JSON)</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Exporta todos tus datos a un archivo local de respaldo en tu equipo o restaura una copia guardada previamente.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={exportDataToJSON}
            className="flex items-center justify-center gap-2 bg-slate-800 border border-slate-700 text-slate-200 font-semibold px-4 py-2.5 rounded-xl text-xs hover:bg-slate-700 transition-colors"
          >
            <Download size={16} /> Descargar Backup (JSON)
          </button>

          <label className="flex items-center justify-center gap-2 bg-slate-800 border border-slate-700 text-slate-200 font-semibold px-4 py-2.5 rounded-xl text-xs hover:bg-slate-700 transition-colors cursor-pointer">
            <Upload size={16} /> Restaurar Backup
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};