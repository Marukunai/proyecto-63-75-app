import React from 'react';
import { 
  LayoutDashboard, Calendar, Dumbbell, Utensils, Scale, 
  CheckSquare, Moon, Activity, Code2, BookOpen, Compass, Settings 
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'habits', label: 'Hábitos', icon: CheckSquare },
    { id: 'projects', label: 'Proyectos', icon: Code2 },
    { id: 'journal', label: 'Diario', icon: BookOpen },
    { id: 'workout', label: 'Entrenar', icon: Dumbbell },
    { id: 'nutrition', label: 'Comidas', icon: Utensils },
    { id: 'sleep', label: 'Sueño', icon: Moon },
    { id: 'progress', label: 'Progreso', icon: Activity },
    { id: 'weight', label: 'Peso', icon: Scale },
    { id: 'japan', label: 'Japón 🇯🇵', icon: Compass },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <div className="flex h-screen w-full bg-[#090d16] text-slate-100 overflow-hidden">
      {/* Sidebar PC */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-[#0d1424] p-4">
        <div className="flex items-center gap-3 px-2 py-4 border-b border-slate-800/80 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 font-bold text-lg border border-cyan-500/20">
            63
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-base leading-tight">Proyecto 63→75+</h1>
            <p className="text-xs text-slate-400">Transformación 2026-2027</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto pb-20 md:pb-6">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-[#0d1424]">
          <span className="font-bold text-cyan-400 text-sm">63 → 75+ App</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Fase 4
          </span>
        </header>
        <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Bottom Navigation Móvil */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0d1424]/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-around px-1 z-50 overflow-x-auto">
        {navItems.slice(0, 4).concat(navItems.slice(-1)).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center min-w-[45px] h-full gap-1 ${
                isActive ? 'text-cyan-400 font-semibold' : 'text-slate-400'
              }`}
            >
              <Icon size={18} />
              <span className="text-[9px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};