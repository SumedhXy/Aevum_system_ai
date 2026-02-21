import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ChevronRight, Search, Filter, Clock, Activity, RefreshCw } from 'lucide-react';
import { Project } from '../types';

interface DashboardProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
  onCreateProject: (project: Partial<Project>) => void;
}

export default function Dashboard({ projects, onSelectProject, onCreateProject }: DashboardProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newProblem, setNewProblem] = useState('');
  const [newUsers, setNewUsers] = useState('');
  const [newTech, setNewTech] = useState('');
  const [newRepo, setNewRepo] = useState('');
  const [newStructure, setNewStructure] = useState('');
  const [newReadme, setNewReadme] = useState('');
  const [newCommitActivity, setNewCommitActivity] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  const fetchRepoInfo = async () => {
    if (!newRepo) return;
    setIsFetching(true);
    try {
      const res = await fetch(`/api/github/info?url=${encodeURIComponent(newRepo)}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      
      if (data.name) setNewName(data.name);
      if (data.description) setNewDesc(data.description);
      if (data.technology) setNewTech(data.technology);
      if (data.structure) setNewStructure(data.structure);
      if (data.readme) setNewReadme(data.readme);
      if (data.commitActivity) setNewCommitActivity(data.commitActivity);
    } catch (err) {
      console.error("GitHub fetch error:", err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newDesc) {
      onCreateProject({
        name: newName,
        description: newDesc,
        problem: newProblem,
        target_users: newUsers,
        technology: newTech,
        repo_link: newRepo,
        project_structure: newStructure,
        readme: newReadme,
        commit_activity: newCommitActivity
      });
      setNewName('');
      setNewDesc('');
      setNewProblem('');
      setNewUsers('');
      setNewTech('');
      setNewRepo('');
      setNewStructure('');
      setNewReadme('');
      setNewCommitActivity('');
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-bold uppercase tracking-tighter">Project Incubator</h2>
          <p className="font-mono text-xs opacity-50 uppercase tracking-widest mt-1">Active Visions: {projects.length}</p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="p-2 border border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] transition-all rounded-sm"
            title="Force System Sync"
          >
            <RefreshCw size={18} />
          </button>
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
            <input 
              type="text" 
              placeholder="Search Visions..." 
              className="bg-transparent border border-[#141414] pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#141414] w-64"
            />
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-[#141414] text-[#E4E3E0] px-6 py-2 rounded-sm text-sm font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            New Vision
          </button>
        </div>
      </div>

      {isCreating && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-2 border-[#141414] p-8 bg-white/50 backdrop-blur-sm"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-widest opacity-50">Vision Name</label>
              <input 
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Aevum Refinery"
                className="w-full bg-transparent border-b border-[#141414] py-2 text-2xl font-bold focus:outline-none placeholder:opacity-20"
              />
            </div>
            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-widest opacity-50">Core Problem</label>
              <input 
                value={newProblem}
                onChange={(e) => setNewProblem(e.target.value)}
                placeholder="What is the silent killer you're solving?"
                className="w-full bg-transparent border-b border-[#141414] py-2 text-sm focus:outline-none placeholder:opacity-20"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase tracking-widest opacity-50">Target Users</label>
                <input 
                  value={newUsers}
                  onChange={(e) => setNewUsers(e.target.value)}
                  placeholder="Students, Founders, etc."
                  className="w-full bg-transparent border-b border-[#141414] py-2 text-sm focus:outline-none placeholder:opacity-20"
                />
              </div>
              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase tracking-widest opacity-50">Technology Stack</label>
                <input 
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  placeholder="AI, Blockchain, etc."
                  className="w-full bg-transparent border-b border-[#141414] py-2 text-sm focus:outline-none placeholder:opacity-20"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase tracking-widest opacity-50">GitHub Link</label>
                <div className="flex gap-2">
                  <input 
                    value={newRepo}
                    onChange={(e) => setNewRepo(e.target.value)}
                    placeholder="github.com/user/repo"
                    className="flex-1 bg-transparent border-b border-[#141414] py-2 text-sm focus:outline-none placeholder:opacity-20"
                  />
                  <button 
                    type="button"
                    onClick={fetchRepoInfo}
                    disabled={isFetching || !newRepo}
                    className="px-3 py-1 border border-[#141414] text-[10px] font-bold uppercase tracking-widest hover:bg-[#141414] hover:text-[#E4E3E0] transition-all disabled:opacity-30"
                  >
                    {isFetching ? "..." : "Fetch"}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase tracking-widest opacity-50">Project Structure</label>
                <input 
                  value={newStructure}
                  onChange={(e) => setNewStructure(e.target.value)}
                  placeholder="frontend, backend, model, etc."
                  className="w-full bg-transparent border-b border-[#141414] py-2 text-sm focus:outline-none placeholder:opacity-20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-widest opacity-50">Vision Description</label>
              <textarea 
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Describe your proposed solution in detail..."
                className="w-full bg-transparent border border-[#141414] p-4 h-24 focus:outline-none focus:ring-1 focus:ring-[#141414] resize-none placeholder:opacity-20"
              />
            </div>
            <div className="flex justify-end gap-4">
              <button 
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-6 py-2 text-sm font-bold uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-[#141414] text-[#E4E3E0] px-8 py-2 rounded-sm text-sm font-bold uppercase tracking-widest hover:scale-105 transition-all"
              >
                Initialize Refinery
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {projects.length === 0 ? (
          <div className="border border-dashed border-[#141414] p-20 text-center opacity-30">
            <p className="font-mono text-sm uppercase tracking-widest">No visions found. Start by creating a new one.</p>
          </div>
        ) : (
          projects.map((project) => (
            <motion.div
              key={project.id}
              layoutId={project.id}
              onClick={() => onSelectProject(project.id)}
              className="group border border-[#141414] p-6 flex items-center justify-between cursor-pointer hover:bg-[#141414] hover:text-[#E4E3E0] transition-all"
            >
              <div className="flex items-center gap-8">
                <div className="w-12 h-12 border border-current flex items-center justify-center font-mono text-lg font-bold">
                  {project.survival_score}%
                </div>
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight">{project.name}</h3>
                  <div className="flex items-center gap-4 mt-1 opacity-50 font-mono text-[10px] uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Clock size={12} /> {new Date(project.created_at).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Activity size={12} /> {project.status}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="hidden md:flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div 
                      key={i} 
                      className={`w-1.5 h-6 border border-current ${i <= (project.survival_score / 25) ? 'bg-current' : 'opacity-20'}`} 
                    />
                  ))}
                </div>
                <ChevronRight className="group-hover:translate-x-2 transition-transform" />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
