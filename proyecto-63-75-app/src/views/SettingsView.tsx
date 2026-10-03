import React, { useEffect, useState } from 'react';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { exportDataToJSON, importDataFromJSON } from '../services/dataExport';
import { getSupabaseClient, isServiceRoleKey, saveSupabaseConfig } from '../services/supabaseClient';
import { syncLocalData } from '../services/syncService';
import { importLegacyDataIntoCurrentAccount } from '../db';
import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Download, Upload, Cloud, ShieldCheck, RefreshCw, LogOut } from 'lucide-react';

interface SettingsViewProps {
  standalone?: boolean;
  onAccountChange?: (user: User | null) => void | Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ standalone = false, onAccountChange }) => {
  const [supabaseUrl, setSupabaseUrl] = useState(() => window.localStorage.getItem('SUPABASE_URL') || '');
  const [supabaseKey, setSupabaseKey] = useState(() => window.localStorage.getItem('SUPABASE_ANON_KEY') || '');
  const [client, setClient] = useState<SupabaseClient | null>(() => getSupabaseClient());
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState(() => isServiceRoleKey(window.localStorage.getItem('SUPABASE_ANON_KEY') || '')
    ? 'La clave guardada es de servidor y no se puede usar en el navegador. Sustitúyela por la anon public o publishable key.'
    : '');
  const [isBusy, setIsBusy] = useState(false);
  const appSettings = useLiveQuery(() => user ? db.appSettings.get('app') : undefined, [user?.id]);
  const profile = useLiveQuery(() => user ? db.profile.toCollection().first() : undefined, [user?.id]);

  const updateSettings = async (changes: Partial<NonNullable<typeof appSettings>>) => {
    if (!user) return;
    await db.appSettings.put({
      id: 'app', theme: appSettings?.theme ?? 'dark', enabledModules: appSettings?.enabledModules ?? ['habits', 'workout', 'nutrition', 'sleep', 'journal', 'calendar'],
      showWeightWidget: appSettings?.showWeightWidget ?? false, travelName: appSettings?.travelName ?? 'Viaje', projects: appSettings?.projects ?? [], ...changes,
    });
  };

  const toggleModule = (id: string) => {
    const enabled = appSettings?.enabledModules ?? ['habits', 'workout', 'nutrition', 'sleep', 'journal', 'calendar'];
    void updateSettings({ enabledModules: enabled.includes(id) ? enabled.filter((item) => item !== id) : [...enabled, id] });
  };

  const saveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const values = new FormData(e.currentTarget);
    await db.profile.put({
      id: profile?.id ?? 1, name: String(values.get('profileName') || '').trim() || 'Mi espacio',
      initialWeight: Number(values.get('initialWeight')) || undefined, targetWeight: Number(values.get('targetWeight')) || undefined,
      height: Number(values.get('height')) || undefined, currentPhase: String(values.get('currentPhase') || '').trim() || undefined,
    });
    setStatusMsg('Perfil guardado en tu cuenta.');
  };

  useEffect(() => {
    if (!client) return;
    let active = true;
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null);
    });

    client.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setStatusMsg(error.message);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        void runSync(client, data.session.user.id);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [client]);

  const runSync = async (activeClient = client, userId = user?.id) => {
    if (!activeClient || !userId || isBusy) return;
    setIsBusy(true);
    setStatusMsg('Sincronizando datos…');
    try {
      const result = await syncLocalData(activeClient, userId);
      setStatusMsg(`Sincronización completada. ${result.downloaded} cambios recibidos y ${result.uploaded} enviados.`);
    } catch (error) {
      console.error('Error al sincronizar con Supabase:', error);
      setStatusMsg(error instanceof Error ? error.message : 'No se pudo sincronizar. Revisa la configuración y el SQL de Supabase.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = supabaseUrl.trim().replace(/\/$/, '');
    const trimmedKey = supabaseKey.trim();
    try {
      const parsedUrl = new URL(trimmedUrl);
      if (parsedUrl.protocol !== 'https:' && parsedUrl.hostname !== 'localhost') {
        setStatusMsg('La URL del proyecto debe usar HTTPS.');
        return;
      }
      if (!trimmedKey) {
        setStatusMsg('Añade la anon public key o publishable key del proyecto.');
        return;
      }
      if (isServiceRoleKey(trimmedKey)) {
        setStatusMsg('Esa parece ser una service_role/secret key. No la pongas en la app; usa la anon public o publishable key.');
        return;
      }
      saveSupabaseConfig(trimmedUrl, trimmedKey);
      setClient(getSupabaseClient(trimmedUrl, trimmedKey));
      setStatusMsg('Configuración guardada en este dispositivo. Ahora inicia sesión o crea tu cuenta.');
    } catch {
      setStatusMsg('La URL no parece válida. Copia la Project URL desde Supabase.');
    }
  };

  const handleAuth = async (mode: 'sign-in' | 'sign-up') => {
    if (!client || !email.includes('@') || password.length < 8) return;
    setIsBusy(true);
    setStatusMsg(mode === 'sign-in' ? 'Iniciando sesión…' : 'Creando cuenta…');
    try {
      const result = mode === 'sign-in'
        ? await client.auth.signInWithPassword({ email: email.trim(), password })
        : await client.auth.signUp({ email: email.trim(), password });
      if (result.error) throw result.error;

      if (result.data.session && result.data.user) {
        setUser(result.data.user);
        window.localStorage.setItem('SUPABASE_USER_ID', result.data.user.id);
        await onAccountChange?.(result.data.user);
        setStatusMsg('Cuenta conectada. Sincronizando tus datos…');
        await runSync(client, result.data.user.id);
      } else {
        setStatusMsg('Cuenta creada. Confirma el correo y vuelve para iniciar sesión.');
      }
      setPassword('');
    } catch (error) {
      setStatusMsg(error instanceof Error ? error.message : 'No se pudo completar el acceso.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleSignOut = async () => {
    if (!client) return;
    const { error } = await client.auth.signOut();
    if (error) setStatusMsg(error.message);
    else {
      setUser(null);
      window.localStorage.removeItem('SUPABASE_USER_ID');
      await onAccountChange?.(null);
      setStatusMsg('Sesión cerrada. Los datos locales siguen guardados en este dispositivo.');
    }
  };

  const importPreviousLocalData = async () => {
    if (!window.confirm('Esto transferirá los datos antiguos de este dispositivo a la cuenta actual y los quitará del almacenamiento compartido anterior. ¿Quieres continuar?')) return;
    setIsBusy(true);
    try {
      const count = await importLegacyDataIntoCurrentAccount();
      setStatusMsg(count
        ? `Se transfirieron ${count} registros a esta cuenta. Sincronizando…`
        : 'No se encontraron datos antiguos para transferir.');
      if (count && user) await runSync(client, user.id);
    } catch (error) {
      setStatusMsg(error instanceof Error ? error.message : 'No se pudieron transferir los datos antiguos.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ok = await importDataFromJSON(file);
    if (ok) {
      alert('¡Copia de seguridad restaurada con éxito!');
      window.location.reload();
    } else {
      alert('No se pudo restaurar el archivo. Comprueba que sea una copia JSON válida.');
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100">{standalone ? 'Tu cuenta personal' : 'Ajustes, sincronización y copias'}</h2>
        <p className="text-xs text-slate-400">{standalone ? 'Crea una cuenta o inicia sesión para guardar tus datos de forma privada.' : 'Sincroniza tus registros entre dispositivos y conserva una copia local.'}</p>
      </div>

      <section className="p-5 bg-[#0d1424] border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
          <Cloud size={18} />
          <span>Sincronización segura con Supabase</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Usa la misma cuenta en cada dispositivo. La clave pública identifica el proyecto; tu sesión y las políticas RLS protegen tus datos.
        </p>

        <form onSubmit={handleSaveConfig} className="space-y-3">
          <label className="block text-[11px] text-slate-400">
            Project URL <span className="text-slate-500">(Supabase → Project Settings → API)</span>
            <input
              type="url"
              required
              placeholder="https://tu-proyecto.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </label>
          <label className="block text-[11px] text-slate-400">
            Anon public key / publishable key
            <input
              type="password"
              required
              autoComplete="off"
              placeholder="Pega aquí la clave pública del proyecto"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </label>
          <button type="submit" className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400">
            Guardar configuración
          </button>
        </form>

        {!user ? (
          <div className="border-t border-slate-800 pt-4 space-y-3">
            <p className="text-xs font-semibold text-slate-300">Inicia sesión o crea tu cuenta</p>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="Tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
            <input
              type="password"
              required
              minLength={8}
              autoComplete="current-password"
              placeholder="Contraseña (mínimo 8 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
            <div className="flex flex-col sm:flex-row gap-2">
              <button type="button" disabled={!client || isBusy || !email.includes('@') || password.length < 8} onClick={() => void handleAuth('sign-in')} className="rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-semibold text-slate-950 disabled:opacity-40">
                Iniciar sesión y sincronizar
              </button>
              <button type="button" disabled={!client || isBusy || !email.includes('@') || password.length < 8} onClick={() => void handleAuth('sign-up')} className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 disabled:opacity-40">
                Crear cuenta
              </button>
            </div>
          </div>
        ) : (
          <div className="border-t border-slate-800 pt-4 space-y-3">
            <p className="text-xs text-slate-300">Sesión iniciada como <strong>{user.email}</strong></p>
            <button type="button" disabled={isBusy} onClick={() => void importPreviousLocalData()} className="block rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-left text-xs text-slate-300 disabled:opacity-40">
              Transferir los datos antiguos de este dispositivo a esta cuenta
            </button>
            <div className="flex flex-col sm:flex-row gap-2">
              <button type="button" disabled={isBusy} onClick={() => void runSync()} className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-semibold text-slate-950 disabled:opacity-40">
                <RefreshCw size={14} className={isBusy ? 'animate-spin' : ''} /> Sincronizar ahora
              </button>
              <button type="button" disabled={isBusy} onClick={() => void handleSignOut()} className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 disabled:opacity-40">
                <LogOut size={14} /> Cerrar sesión
              </button>
            </div>
          </div>
        )}

        {statusMsg && <p role="status" className="text-xs text-cyan-300">{statusMsg}</p>}
      </section>

      {user && <section className="p-5 bg-[#0d1424] border border-slate-800 rounded-2xl space-y-5">
        <div><h3 className="text-sm font-semibold text-slate-100">Personaliza tu espacio</h3><p className="text-xs text-slate-400 mt-1">Estas preferencias y tu perfil se guardan dentro de tu cuenta.</p></div>
        <label className="block text-xs text-slate-300">Tema
          <select value={appSettings?.theme ?? 'dark'} onChange={(e) => void updateSettings({ theme: e.target.value as 'dark' | 'warm' | 'light' })} className="mt-1 block w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100">
            <option value="dark">Oscuro</option><option value="warm">Cálido</option><option value="light">Claro</option>
          </select>
        </label>
        <div className="grid sm:grid-cols-2 gap-2">{[
          ['habits', 'Hábitos'], ['workout', 'Entrenar'], ['nutrition', 'Comidas'], ['sleep', 'Sueño'], ['journal', 'Diario'], ['calendar', 'Calendario'],
          ['weight', 'Seguimiento de peso'], ['progress', 'Progreso'], ['travel', 'Viajes'], ['projects', 'Proyectos'],
        ].map(([id, label]) => <label key={id} className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={(appSettings?.enabledModules ?? ['habits', 'workout', 'nutrition', 'sleep', 'journal', 'calendar']).includes(id)} onChange={() => toggleModule(id)} />{label}</label>)}</div>
        {(appSettings?.enabledModules ?? []).includes('weight') && <label className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={appSettings?.showWeightWidget ?? false} onChange={(e) => void updateSettings({ showWeightWidget: e.target.checked })} />Mostrar mi peso en Inicio</label>}
        {(appSettings?.enabledModules ?? []).includes('travel') && <label className="block text-xs text-slate-300">Nombre de la sección de viajes<input value={appSettings?.travelName ?? 'Viaje'} onChange={(e) => void updateSettings({ travelName: e.target.value || 'Viaje' })} className="mt-1 block w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100" /></label>}
        <form key={profile?.id ?? 'profile-form'} onSubmit={(e) => void saveProfile(e)} className="space-y-3 border-t border-slate-800 pt-4">
          <p className="text-xs font-semibold text-slate-300">Mi perfil y mis datos de peso</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <input name="profileName" defaultValue={profile?.name ?? ''} placeholder="Cómo quieres llamar a tu espacio" className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100" />
            <input name="currentPhase" defaultValue={profile?.currentPhase ?? ''} placeholder="Fase u objetivo actual (opcional)" className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100" />
            <input name="initialWeight" type="number" step="0.1" defaultValue={profile?.initialWeight ?? ''} placeholder="Peso inicial (kg)" className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100" />
            <input name="targetWeight" type="number" step="0.1" defaultValue={profile?.targetWeight ?? ''} placeholder="Peso objetivo (kg)" className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100" />
            <input name="height" type="number" step="0.1" defaultValue={profile?.height ?? ''} placeholder="Altura (cm, opcional)" className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100" />
          </div>
          <button className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200">Guardar perfil</button>
        </form>
      </section>}

      {!standalone && <section className="p-5 bg-[#0d1424] border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
          <ShieldCheck size={18} />
          <span>Copia de seguridad JSON</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Exporta o restaura tus registros locales. La copia incluye perfil, ejercicios, récords, revisiones y registros del viaje.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => void exportDataToJSON()} className="flex items-center justify-center gap-2 bg-slate-800 border border-slate-700 text-slate-200 font-semibold px-4 py-2.5 rounded-xl text-xs hover:bg-slate-700">
            <Download size={16} /> Descargar backup
          </button>
          <label className="flex items-center justify-center gap-2 bg-slate-800 border border-slate-700 text-slate-200 font-semibold px-4 py-2.5 rounded-xl text-xs hover:bg-slate-700 cursor-pointer">
            <Upload size={16} /> Restaurar backup
            <input type="file" accept=".json,application/json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </section>}
    </div>
  );
};
