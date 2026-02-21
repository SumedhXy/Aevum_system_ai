import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, LayoutDashboard, Plus, ChevronRight, Activity, Zap, Users, ShieldAlert, History } from 'lucide-react';
import { Project } from './types';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import ProjectDetail from './components/ProjectDetail';

export default function App() {
  const [view, setView] = useState<'landing' | 'dashboard' | 'project'>('landing');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  useEffect(() => {
    console.log('App mounted, checking API key and fetching projects...');
    checkApiKey();
    fetchProjects();

    const handleDemo = () => {
      console.log('Demo project requested');
      handleCreateProject({
        name: "Aevum Refinery",
        description: "An autonomous digital incubator that evolves ideas into scalable, investor-ready successes using multi-agent AI refinery stages.",
        problem: "Founders build in a vacuum without real-time architectural or market validation.",
        target_users: "Startup Founders, Hackathon Participants, Venture Capitalists",
        technology: "React, Express, SQLite, Gemini AI, Tailwind CSS",
        repo_link: "https://github.com/aevum/refinery",
        status: 'completed',
        survival_score: 88,
        market_analysis: JSON.stringify({ 
          market_score: 9, 
          innovation_score: 8, 
          verdict: "High potential in the 'AI for AI' infrastructure space. Strong demand for automated architectural validation.", 
          target_users: ["Solo Founders", "Hackathon Teams", "VC Analysts"], 
          competitors: ["Manual Consulting", "Static Analysis Tools"], 
          risks: ["High dependency on LLM accuracy", "Market education required"], 
          labels: ["High Potential", "Infrastructure"] 
        }),
        architect_report: JSON.stringify({ 
          tech_stack_detected: ["React", "Express", "SQLite", "Vite"], 
          architecture_score: 9, 
          missing_components: ["Redis for caching", "Prometheus for monitoring"], 
          scalability_risks: ["Single instance database", "LLM latency"], 
          security_risks: ["API Key exposure", "Input injection"], 
          improvements: ["Add unit tests", "Implement rate limiting"], 
          maturity_level: "MVP Level", 
          techTree: { 
            name: "Aevum Refinery", 
            children: [
              { name: "Frontend", description: "React + Tailwind" },
              { name: "Backend", description: "Express + SQLite" },
              { name: "AI Layer", description: "Gemini Multi-Agent" }
            ] 
          } 
        }),
        simulation_results: JSON.stringify([
          { persona: "The Skeptical Founder", reaction: "Impressive depth, but can I trust the architectural advice?", frictionPoints: ["Trust", "Accuracy"], score: 7 },
          { persona: "The Speed-Runner", reaction: "Exactly what I need for hackathons. Saves me 4 hours of planning.", frictionPoints: ["None"], score: 10 },
          { persona: "The VC Associate", reaction: "Great for initial screening of technical depth.", frictionPoints: ["Customization"], score: 9 }
        ]),
        decoder_feedback: JSON.stringify({ 
          rootCause: "Market adoption friction due to perceived AI hallucinations in technical advice.", 
          fixes: ["Implement 'Source of Truth' grounding", "Add human-in-the-loop review option"], 
          skillGaps: ["Advanced Prompt Engineering", "Cybersecurity Audit"] 
        }),
        tech_tree: JSON.stringify({ 
          name: "Aevum Refinery", 
          children: [
            { name: "Phase 1: MVP", description: "Core multi-agent refinery" },
            { name: "Phase 2: Scale", description: "Multi-user collaboration" },
            { name: "Phase 3: Autonomy", description: "Self-healing architecture" }
          ] 
        }),
        survival_report: JSON.stringify({ 
          survival_score: 88, 
          risk_level: "Low", 
          project_potential: "Significant. Addresses a clear pain point in the startup lifecycle with a novel technical approach.", 
          key_weaknesses: ["Niche market initially", "High operational costs"], 
          evolution_roadmap: ["Integrate with GitHub Actions", "Add real-time market data feeds"] 
        })
      });
    };

    window.addEventListener('create-demo-project', handleDemo);
    return () => window.removeEventListener('create-demo-project', handleDemo);
  }, []);

  const checkApiKey = async () => {
    // Check if key is in process.env (via Vite define)
    const envKey = process.env.GEMINI_API_KEY;
    if (envKey && envKey !== "") {
      console.log('API Key found in environment');
      setHasApiKey(true);
      return;
    }

    console.log('API Key missing in environment, checking platform selector...');
    // Check if platform key selection is available
    try {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const selected = await window.aistudio.hasSelectedApiKey();
        console.log('Platform key selection status:', selected);
        setHasApiKey(selected);
      } else {
        console.warn('AI Studio platform API not detected');
        setHasApiKey(false);
      }
    } catch (err) {
      console.error('Error checking API key status:', err);
      setHasApiKey(false);
    }
  };

  const handleOpenKeySelector = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true); // Assume success as per guidelines
      window.location.reload(); // Reload to ensure new key is picked up
    }
  };

  const fetchProjects = async () => {
    try {
      console.log('Fetching projects from API...');
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const data = await res.json();
      console.log('Projects fetched successfully:', data.length, 'projects found');
      setProjects(data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  };

  const handleCreateProject = async (projectData: Partial<Project>) => {
    const id = Math.random().toString(36).substring(2, 9);
    console.log('Creating new project:', id, projectData.name);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...projectData })
      });
      if (!res.ok) throw new Error(`Create failed: ${res.status}`);
      console.log('Project created on server, refreshing list...');
      await fetchProjects();
      console.log('Switching to project view:', id);
      setSelectedProjectId(id);
      setView('project');
    } catch (err) {
      console.error('Failed to create project', err);
    }
  };

  const handleSelectProject = (id: string) => {
    console.log('Selecting project:', id);
    setSelectedProjectId(id);
    setView('project');
  };

  useEffect(() => {
    console.log('Current View:', view);
  }, [view]);

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* API Key Warning */}
      {!hasApiKey && (
        <div className="bg-amber-500 text-black py-2 px-6 text-[10px] font-bold uppercase tracking-widest flex justify-between items-center">
          <span>Warning: Gemini API Key is missing. AI Refinery will be inactive.</span>
          <button 
            onClick={handleOpenKeySelector}
            className="bg-black text-white px-3 py-1 rounded-sm hover:scale-105 transition-transform"
          >
            Select API Key
          </button>
        </div>
      )}

      {/* Debug Overlay (Hidden by default, toggle with Ctrl+Shift+D) */}
      <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none">
        <div className="bg-black/90 text-[10px] text-green-400 p-4 font-mono rounded-lg border border-green-500/30 max-w-xs shadow-2xl">
          <div className="flex justify-between mb-2 border-b border-green-500/20 pb-1">
            <span>SYSTEM MONITOR</span>
            <span className="animate-pulse">●</span>
          </div>
          <div className="space-y-1">
            <p>VIEW: {view}</p>
            <p>PROJECTS: {projects.length}</p>
            <p>SELECTED_ID: {selectedProjectId || 'NULL'}</p>
            <p>API_KEY: {process.env.GEMINI_API_KEY ? 'PRESENT' : 'MISSING'}</p>
            <p>ENV: {process.env.NODE_ENV}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-black text-white text-[8px] py-1 px-6 font-mono uppercase tracking-[0.3em] flex justify-between">
        <span>System Status: Operational</span>
        <span>Refinery v1.0.4</span>
      </div>
      <nav className="border-b border-[#141414] px-6 py-4 flex justify-between items-center sticky top-0 bg-[#E4E3E0]/80 backdrop-blur-sm z-50">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setView('landing')}
        >
          <div className="w-8 h-8 bg-[#141414] flex items-center justify-center rounded-sm group-hover:rotate-12 transition-transform">
            <Zap className="text-[#E4E3E0] w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tighter uppercase">Aevum</span>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setView('dashboard')}
            className={`flex items-center gap-2 text-sm font-medium uppercase tracking-wider transition-opacity ${view === 'dashboard' ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
          >
            <LayoutDashboard size={18} />
            Incubator
          </button>
          <button 
            onClick={() => {
              setSelectedProjectId(null);
              setView('dashboard');
            }}
            className="bg-[#141414] text-[#E4E3E0] px-4 py-2 rounded-sm text-sm font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            New Vision
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Landing onStart={() => setView('dashboard')} />
            </motion.div>
          )}

          {view === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Dashboard 
                projects={projects} 
                onSelectProject={handleSelectProject}
                onCreateProject={handleCreateProject}
              />
            </motion.div>
          )}

          {view === 'project' && selectedProjectId && (
            <motion.div
              key="project"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
            >
              <ProjectDetail 
                projectId={selectedProjectId} 
                onBack={() => setView('dashboard')}
                onUpdate={fetchProjects}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#141414] mt-24 py-12 px-6 opacity-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <h3 className="font-bold uppercase tracking-tighter text-2xl">Aevum Refinery</h3>
            <p className="font-mono text-xs mt-2 max-w-xs">
              Autonomous Digital Incubator. Evolving human vision through multi-agent synthetic intelligence.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-12 font-mono text-[10px] uppercase tracking-widest">
            <div className="flex flex-col gap-2">
              <span className="opacity-50">System Status</span>
              <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                All Agents Online
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="opacity-50">Version</span>
              <span>v1.0.4-beta</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
