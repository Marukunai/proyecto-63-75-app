import React, { useState, useEffect } from 'react';
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
import { seedInitialData } from './db';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    seedInitialData().then(() => {
      setIsDbReady(true);
    });
  }, []);

  if (!isDbReady) {
    return (
      <div className="h-screen w-full bg-[#090d16] flex items-center justify-center text-slate-400 text-xs">
        Cargando centro de control...
      </div>
    );
  }

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'habits':
        return <HabitsView />;
      case 'projects':
        return <ProjectsView />;
      case 'journal':
        return <JournalView />;
      case 'workout':
        return <WorkoutView />;
      case 'nutrition':
        return <NutritionView />;
      case 'sleep':
        return <SleepView />;
      case 'progress':
        return <ProgressView />;
      case 'weight':
        return <WeightView />;
      case 'japan':
        return <JapanModeView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderView()}
    </Layout>
  );
};

export default App;