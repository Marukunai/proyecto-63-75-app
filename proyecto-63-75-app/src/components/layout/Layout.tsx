import React, { useState } from 'react';
import { 
  LayoutDashboard, Calendar, Dumbbell, Utensils, Scale, 
  CheckSquare, Moon, Activity, Code2, BookOpen, Compass, Settings, MoreHorizontal, X 
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard, category: 'Principal' },
    { id: 'habits', label: 'Hábitos', icon: CheckSquare, category: 'Principal' },
    { id: 'workout', label: 'Entrenar', icon: Dumbbell, category: 'Cuerpo' },
    { id: 'nutrition', label: 'Comidas', icon: Utensils, category: 'Cuerpo' },
    { id: 'weight', label: 'Peso', icon: Scale, category: 'Cuerpo' },
    { id: 'progress', label: 'Progreso', icon: Activity, category: 'Cuerpo' },
    { id: 'sleep', label: 'Sueño', icon: Moon, category: 'Mente' },
    { id: 'projects', label: 'Proyectos', icon: Code2, category: 'Vida' },
    { id: 'journal', label: 'Diario', icon: BookOpen, category: 'Mente' },
    { id: 'japan', label: 'Japón 🇯🇵', icon: Compass, category: 'Especial' },
    { id: 'calendar', label: 'Calendario', icon: Calendar, category: 'Principal' },
    { id: 'settings', label: 'Ajustes', icon: Settings, category: 'Sistema' },
  ];

  const primaryMobileItems = navItems.slice(0, 4); // Inicio, Hábitos, Entrenar, Comidas

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-[#090d16] text-slate-100 overflow-hidden">
      {/* Sidebar para PC */}
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

        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
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
      <main className="flex-1 flex flex-col h-full overflow-y-auto pb-24 md:pb-6">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-[#0d1424]">
          <span className="font-bold text-cyan-400 text-sm">63 → 75+ App</span>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            PWA Móvil
          </span>
        </header>
        <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Modal Desplegable Móvil "Más Menú" */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end animate-fadeIn">
          <div className="bg-[#0d1424] border-t border-slate-800 rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-200">Todas las Pantallas</h3>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-100 bg-slate-800/60 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 font-semibold'
                        : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Icon size={20} className="mb-1.5" />
                    <span className="text-[11px] text-center leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Móvil Estándar (4 Accesos Directos + Botón "Más") */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0d1424]/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-around px-2 z-40">
        {primaryMobileItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 ${
                isActive ? 'text-cyan-400 font-semibold' : 'text-slate-400'
              }`}
            >
              <Icon size={18} />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}

        {/* Botón para desplegar las 11 opciones */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 ${
            isMobileMenuOpen ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <MoreHorizontal size={18} />
          <span className="text-[10px]">Más</span>
        </button>
      </nav>
    </div>
  );
};