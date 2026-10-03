import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { ProjectTask } from '../types';
import { CheckCircle2, Clock, Plus, Trash2 } from 'lucide-react';

export const ProjectsView: React.FC = () => {
  const settings = useLiveQuery(() => db.appSettings.get('app'));
  const projects = settings?.projects ?? [];
  const [activeProject, setActiveProject] = useState('');
  const [newProject, setNewProject] = useState('');
  const [title, setTitle] = useState('');
  const [timeSpent, setTimeSpent] = useState('');
  const tasks = useLiveQuery(() => activeProject ? db.projectTasks.where('projectId').equals(activeProject).toArray() : Promise.resolve([] as ProjectTask[]), [activeProject]);

  const saveProjects = (next: string[]) => db.appSettings.put({
    id: 'app', theme: settings?.theme ?? 'dark', enabledModules: settings?.enabledModules ?? [],
    showWeightWidget: settings?.showWeightWidget ?? false, travelName: settings?.travelName ?? 'Viaje', projects: next,
  });

  const addProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newProject.trim();
    if (!name || projects.includes(name)) return;
    await saveProjects([...projects, name]);
    setActiveProject(name);
    setNewProject('');
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !activeProject) return;
    await db.projectTasks.add({ projectId: activeProject, title: title.trim(), status: 'backlog', timeSpentMinutes: timeSpent ? Number(timeSpent) : undefined });
    setTitle(''); setTimeSpent('');
  };

  const removeProject = async () => {
    if (!activeProject || !window.confirm(`¿Eliminar “${activeProject}” y sus tareas?`)) return;
    await db.transaction('rw', db.projectTasks, db.appSettings, async () => {
      await db.projectTasks.where('projectId').equals(activeProject).delete();
      await saveProjects(projects.filter((project) => project !== activeProject));
    });
    setActiveProject('');
  };

  const toggleTask = async (id?: number, status?: string) => {
    if (id) await db.projectTasks.update(id, { status: status === 'completed' ? 'in_progress' : 'completed' });
  };

  return <div className="space-y-6">
    <div><h2 className="text-xl font-bold text-slate-100">Proyectos personales</h2><p className="text-xs text-slate-400">Crea los proyectos que quieras organizar y añade tareas a cada uno.</p></div>
    <form onSubmit={addProject} className="flex gap-2">
      <input value={newProject} onChange={(e) => setNewProject(e.target.value)} placeholder="Nombre de un proyecto" className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100" />
      <button className="flex items-center gap-2 bg-cyan-500 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs"><Plus size={16} /> Añadir proyecto</button>
    </form>
    {!projects.length ? <p className="text-xs text-slate-400">Aún no tienes proyectos. Puedes añadir trabajo, estudios, una afición o cualquier otro objetivo.</p> : <>
      <div className="flex flex-wrap gap-2">{projects.map((project) => <button key={project} onClick={() => setActiveProject(project)} className={`px-4 py-2 rounded-lg text-xs font-semibold ${activeProject === project ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>{project}</button>)}</div>
      {activeProject && <>
        <form onSubmit={addTask} className="p-4 bg-[#0d1424] border border-slate-800 rounded-2xl space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`Nueva tarea para ${activeProject}`} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100" />
          <div className="flex gap-2"><input type="number" min="0" placeholder="Minutos (opcional)" value={timeSpent} onChange={(e) => setTimeSpent(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100" /><button className="flex items-center gap-2 bg-cyan-500 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs"><Plus size={16} /> Crear tarea</button></div>
        </form>
        {tasks?.map((task) => <div key={task.id} onClick={() => void toggleTask(task.id, task.status)} className="flex items-center justify-between p-3.5 rounded-xl border cursor-pointer bg-[#0d1424] border-slate-800 text-slate-200">
          <span className={`flex items-center gap-3 text-xs ${task.status === 'completed' ? 'line-through text-slate-500' : ''}`}><CheckCircle2 size={18} />{task.title}</span>
          {!!task.timeSpentMinutes && <span className="text-[11px] text-slate-500 flex items-center gap-1"><Clock size={12} />{task.timeSpentMinutes} min</span>}
        </div>)}
        <button onClick={() => void removeProject()} className="text-xs text-rose-400 flex items-center gap-2"><Trash2 size={14} /> Eliminar proyecto y tareas</button>
      </>}
    </>}
  </div>;
};
