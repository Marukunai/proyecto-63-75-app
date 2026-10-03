import React, { lazy, Suspense, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useLiveQuery } from 'dexie-react-hooks';
import { Layout } from './components/layout/Layout';
import { DashboardView } from './views/DashboardView';
import { HabitsView } from './views/HabitsView';
import { WeightView } from './views/WeightView';
import { WorkoutView } from './views/WorkoutView';
import { CalendarView } from './views/CalendarView';
import { NutritionView } from './views/NutritionView';
import { SleepView } from './views/SleepView';
import { ProgressView } from './views/ProgressView';
import { ProjectsView } from './views/ProjectsView';
import { JournalView } from './views/JournalView';
import { JapanModeView } from './views/JapanModeView';
import { db, seedInitialData, switchAccountDatabase } from './db';

const SettingsView = lazy(() => import('./views/SettingsView').then((module) => ({ default: module.SettingsView })));

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [dbRevision, setDbRevision] = useState(0);
  const appSettings = useLiveQuery(() => db.appSettings.get('app'), [dbRevision]);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      let signedInUser: User | null = null;
      const hasSupabaseConfig = window.localStorage.getItem('SUPABASE_URL') && window.localStorage.getItem('SUPABASE_ANON_KEY');
      if (hasSupabaseConfig) {
        try {
          const { getSupabaseClient } = await import('./services/supabaseClient');
          const client = getSupabaseClient();
          if (client) {
            const { data, error } = await client.auth.getSession();
            if (error) throw error;
            signedInUser = data.session?.user ?? null;
          }
        } catch (error) {
          console.error('No se pudo recuperar la sesión de Supabase:', error);
        }
      }

      await switchAccountDatabase(signedInUser?.id ?? null);
      if (signedInUser) await seedInitialData();
      if (!isMounted) return;

      setCurrentUserId(signedInUser?.id ?? null);
      setDbRevision((revision) => revision + 1);
      setDbError(false);
      setIsDbReady(true);
    };

    initialize().catch((error) => {
      console.error('No se pudo inicializar la base local:', error);
      if (isMounted) setDbError(true);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    let isActive = true;
    let intervalId: number | undefined;

    const syncWhenReady = async () => {
      if (!isActive || !navigator.onLine || document.visibilityState === 'hidden') return;
      try {
        const [{ getSupabaseClient }, { syncLocalData }] = await Promise.all([
          import('./services/supabaseClient'),
          import('./services/syncService'),
        ]);
        const client = getSupabaseClient();
        if (!client) return;
        const { data } = await client.auth.getSession();
        if (data.session?.user.id === currentUserId) await syncLocalData(client, currentUserId);
      } catch (error) {
        console.error('No se pudo sincronizar en segundo plano:', error);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') void syncWhenReady();
    };

    void syncWhenReady();
    intervalId = window.setInterval(() => void syncWhenReady(), 60_000);
    window.addEventListener('online', syncWhenReady);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      isActive = false;
      if (intervalId !== undefined) window.clearInterval(intervalId);
      window.removeEventListener('online', syncWhenReady);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [currentUserId]);

  const handleAccountChange = async (user: User | null) => {
    await switchAccountDatabase(user?.id ?? null);
    if (user) await seedInitialData();
    setCurrentUserId(user?.id ?? null);
    setDbRevision((revision) => revision + 1);
    setActiveTab('dashboard');
  };

  if (!isDbReady) {
    return (
      <div className="min-h-screen w-full bg-[#090d16] flex flex-col items-center justify-center px-6 text-center text-slate-400 text-xs">
        {dbError ? (
          <>
            <p className="text-sm text-slate-200">No se pudieron cargar los datos de esta cuenta.</p>
            <button onClick={() => window.location.reload()} className="mt-5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100">Volver a intentar</button>
          </>
        ) : 'Preparando tu espacio personal…'}
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div data-theme="dark" className="min-h-screen bg-[#090d16] px-4 py-8 text-slate-100">
        <div className="mx-auto w-full max-w-xl pt-8">
          <Suspense fallback={<p className="text-center text-xs text-slate-500">Cargando acceso…</p>}>
            <SettingsView standalone onAccountChange={handleAccountChange} />
          </Suspense>
        </div>
      </div>
    );
  }

  const enabledModules = appSettings?.enabledModules ?? ['habits', 'workout', 'nutrition', 'sleep', 'journal', 'calendar'];
  const renderView = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView showWeightWidget={appSettings?.showWeightWidget ?? false} />;
      case 'habits': return <HabitsView />;
      case 'calendar': return <CalendarView />;
      case 'projects': return <ProjectsView />;
      case 'journal': return <JournalView />;
      case 'workout': return <WorkoutView />;
      case 'nutrition': return <NutritionView />;
      case 'sleep': return <SleepView />;
      case 'progress': return <ProgressView />;
      case 'weight': return <WeightView />;
      case 'travel': return <JapanModeView tripName={appSettings?.travelName ?? 'Viaje'} />;
      case 'settings': return <SettingsView onAccountChange={handleAccountChange} />;
      default: return <DashboardView showWeightWidget={appSettings?.showWeightWidget ?? false} />;
    }
  };

  return (
    <div data-theme={appSettings?.theme ?? 'dark'} className="min-h-screen">
      <Layout activeTab={activeTab} setActiveTab={setActiveTab} enabledModules={enabledModules}>
        <Suspense fallback={<div className="py-10 text-center text-xs text-slate-500">Cargando pantalla…</div>}>
          {renderView()}
        </Suspense>
      </Layout>
    </div>
  );
};

export default App;
