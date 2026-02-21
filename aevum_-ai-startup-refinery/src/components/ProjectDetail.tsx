import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Zap, Target, Shield, Users, Cpu, 
  Play, RefreshCw, CheckCircle2, AlertTriangle,
  TrendingUp, BarChart3, Binary, Rocket
} from 'lucide-react';
import { Project } from '../types';
import { 
  marketIntelligenceAgent, 
  architectAgent, 
  syntheticUserLab, 
  rejectionDecoder,
  survivalEngineAgent
} from '../services/gemini';
import TechTree from './TechTree';
import SurvivalScore from './SurvivalScore';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
  onUpdate: () => void;
}

type Tab = 'overview' | 'market' | 'architect' | 'users' | 'decoder' | 'survival';

export default function ProjectDetail({ projectId, onBack, onUpdate }: ProjectDetailProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isRefining, setIsRefining] = useState(false);
  const [refineryStep, setRefineryStep] = useState('');

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to fetch project');
      }
      const data = await res.json();
      console.log('Fetched project data:', data);
      setProject(data);
    } catch (err: any) {
      console.error('Fetch project error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!project) return;
    setIsRefining(true);
    
    try {
      // Parallelize independent agents for speed
      setRefineryStep('Analyzing Market, Architecture & Users...');
      const [market, architect, users] = await Promise.all([
        marketIntelligenceAgent(project),
        architectAgent(project),
        syntheticUserLab(project.name, project.description)
      ]);
      
      // Final synthesis
      setRefineryStep('Synthesizing Final Strategic Roadmap...');
      const [decoder, survivalReport] = await Promise.all([
        rejectionDecoder([...(architect.scalability_risks || []), ...(architect.security_risks || [])].join(', ') || "Initial prototype phase"),
        survivalEngineAgent(market, architect)
      ]);

      console.log('Refinery Results:', { market, architect, users, decoder, survivalReport });

      // Calculate Survival Score (using the engine's score)
      const survivalScore = survivalReport.survival_score || 0;

      // Update Backend with timeout
      const updateController = new AbortController();
      const updateTimeout = setTimeout(() => updateController.abort(), 10000);

      try {
        const updatePayload = {
          status: 'completed',
          survival_score: survivalScore,
          market_analysis: JSON.stringify(market),
          architect_report: JSON.stringify(architect),
          simulation_results: JSON.stringify(users),
          decoder_feedback: JSON.stringify(decoder),
          tech_tree: JSON.stringify(architect.techTree),
          survival_report: JSON.stringify(survivalReport)
        };
        console.log('Updating backend with:', updatePayload);

        const updateRes = await fetch(`/api/projects/${projectId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          signal: updateController.signal,
          body: JSON.stringify(updatePayload)
        });

        if (!updateRes.ok) {
          throw new Error(`Backend update failed: ${updateRes.statusText}`);
        }
      } finally {
        clearTimeout(updateTimeout);
      }

      console.log('Fetching updated project data...');
      await fetchProject();
      onUpdate();
      console.log('Refinery process complete.');
    } catch (err) {
      console.error('Refinery failed', err);
      alert('The refinery encountered an error or timed out. Please try again.');
    } finally {
      setIsRefining(false);
      setRefineryStep('');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 opacity-50">
        <RefreshCw className="animate-spin" size={32} />
        <p className="font-mono text-xs uppercase tracking-widest">Synchronizing Vision Data...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 border border-dashed border-red-500/30 p-12 text-center">
        <AlertTriangle className="text-red-500" size={32} />
        <h3 className="text-xl font-bold uppercase tracking-tight">Vision Sync Failed</h3>
        <p className="text-sm opacity-60 max-w-md">{error || 'The requested vision could not be located in the refinery database.'}</p>
        <button 
          onClick={onBack}
          className="mt-4 bg-[#141414] text-[#E4E3E0] px-6 py-2 rounded-sm text-xs font-bold uppercase tracking-widest"
        >
          Return to Incubator
        </button>
      </div>
    );
  }

  const parseJSON = (data: string | undefined | null, defaultValue: any = null) => {
    if (!data) return defaultValue;
    try {
      const parsed = JSON.parse(data);
      // If it's an empty object or array, treat as null for UI purposes if that's the default
      if (typeof parsed === 'object' && parsed !== null) {
        if (Object.keys(parsed).length === 0) return defaultValue;
        if (Array.isArray(parsed) && parsed.length === 0) return defaultValue;
      }
      return parsed;
    } catch (e) {
      console.error('Failed to parse JSON:', data, e);
      return defaultValue;
    }
  };

  const marketData = parseJSON(project.market_analysis);
  const architectData = parseJSON(project.architect_report);
  const userData = parseJSON(project.simulation_results);
  const decoderData = parseJSON(project.decoder_feedback);
  const techTreeData = parseJSON(project.tech_tree);
  const survivalData = parseJSON(project.survival_report);

  return (
    <div className="space-y-8">
      {/* Debug Data Panel (Collapsed by default) */}
      <div className="flex gap-2 mb-4">
        <details className="flex-1 bg-black text-[8px] text-green-400 p-2 font-mono rounded opacity-50 hover:opacity-100 transition-opacity">
          <summary className="cursor-pointer uppercase tracking-widest">Raw Vision Data</summary>
          <pre className="mt-2 overflow-auto max-h-40">
            {JSON.stringify(project, null, 2)}
          </pre>
        </details>
        <button 
          onClick={async () => {
            if (confirm('Inject test data into this project?')) {
              await fetch(`/api/test-update/${projectId}`);
              fetchProject();
              onUpdate();
            }
          }}
          className="bg-red-900/20 text-red-500 border border-red-500/30 px-3 py-1 text-[8px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
        >
          Inject Test Data
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors rounded-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-bold uppercase tracking-tighter">{project.name}</h2>
            <p className="font-mono text-[10px] uppercase tracking-widest opacity-50">ID: {project.id} • Status: {project.status}</p>
          </div>
        </div>

        <button 
          onClick={handleRefine}
          disabled={isRefining}
          className="bg-[#141414] text-[#E4E3E0] px-8 py-3 rounded-sm text-sm font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRefining ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
          {isRefining ? 'Refining...' : 'Start Refinery'}
        </button>
      </div>

      {isRefining && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#141414] text-[#E4E3E0] p-4 font-mono text-xs uppercase tracking-widest flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {refineryStep}
          </div>
          <div className="opacity-50">Agent Sync Active</div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#141414] overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'market', label: 'Market Intel', icon: Target },
          { id: 'architect', label: 'Architect', icon: Shield },
          { id: 'users', label: 'User Lab', icon: Users },
          { id: 'decoder', label: 'Decoder', icon: Cpu },
          { id: 'survival', label: 'Survival Engine', icon: Rocket }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-[#141414] opacity-100' 
                : 'border-transparent opacity-40 hover:opacity-100'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white/50 p-8 border border-[#141414]">
                  <h3 className="font-mono text-[10px] uppercase tracking-widest opacity-50 mb-4">Project Vision</h3>
                  <p className="text-xl leading-relaxed mb-6">{project.description}</p>
                  
                  {survivalData?.project_potential && (
                    <div className="border-t border-[#141414] pt-6 mb-6">
                      <h4 className="font-mono text-[10px] uppercase tracking-widest opacity-50 mb-2">Strategic Potential</h4>
                      <p className="text-lg font-serif italic opacity-90">"{survivalData.project_potential}"</p>
                    </div>
                  )}

                  {marketData?.verdict && (
                    <div className="border-t border-[#141414] pt-6">
                      <h4 className="font-mono text-[10px] uppercase tracking-widest opacity-50 mb-2">Refinery Verdict</h4>
                      <p className="text-sm italic opacity-80">"{marketData.verdict}"</p>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="border border-[#141414] p-6">
                    <h3 className="font-bold uppercase tracking-tight mb-4 flex items-center gap-2">
                      <Target className="text-blue-600" size={18} />
                      Target Market
                    </h3>
                    <ul className="space-y-2 text-sm opacity-70">
                      {marketData?.target_users?.slice(0, 3).map((u: string, i: number) => (
                        <li key={i}>• {u}</li>
                      )) || <li className="italic">Awaiting analysis...</li>}
                    </ul>
                  </div>
                  <div className="border border-[#141414] p-6">
                    <h3 className="font-bold uppercase tracking-tight mb-4 flex items-center gap-2">
                      <AlertTriangle className="text-amber-600" size={18} />
                      Survival Risks
                    </h3>
                    <ul className="space-y-2 text-sm opacity-70">
                      {architectData?.scalability_risks?.slice(0, 3).map((r: string, i: number) => (
                        <li key={i}>• {r}</li>
                      )) || <li className="italic">Awaiting analysis...</li>}
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="border border-[#141414] p-8 text-center">
                  <h3 className="font-mono text-[10px] uppercase tracking-widest opacity-50 mb-4">Survival Score</h3>
                  <div className="relative inline-block mb-4">
                    <SurvivalScore score={project.survival_score} />
                  </div>
                  {survivalData?.risk_level && (
                    <div className="mt-4 pt-4 border-t border-[#141414]/10">
                      <span className="font-mono text-[10px] uppercase tracking-widest opacity-50 block mb-1">Risk Level</span>
                      <span className={`text-sm font-bold uppercase tracking-widest ${
                        survivalData.risk_level === 'Low' ? 'text-green-600' : 
                        survivalData.risk_level === 'Medium' ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {survivalData.risk_level}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="bg-[#141414] text-[#E4E3E0] p-6">
                  <h3 className="font-bold uppercase tracking-tight mb-4 flex items-center gap-2">
                    <Zap size={18} />
                    Refinery Status
                  </h3>
                  <div className="space-y-4 font-mono text-[10px] uppercase tracking-widest">
                    <div className="flex justify-between">
                      <span>Market Intel</span>
                      <span className={marketData?.market_score !== undefined ? 'text-green-400' : 'text-amber-400'}>
                        {marketData?.market_score !== undefined ? 'VERIFIED' : 'PENDING'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Architecture</span>
                      <span className={architectData?.architecture_score !== undefined ? 'text-green-400' : 'text-amber-400'}>
                        {architectData?.architecture_score !== undefined ? 'SCANNED' : 'PENDING'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>User Simulation</span>
                      <span className={userData?.length > 0 ? 'text-green-400' : 'text-amber-400'}>
                        {userData?.length > 0 ? 'COMPLETED' : 'PENDING'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'market' && (
            <motion.div 
              key="market"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {!marketData ? (
                <div className="p-20 text-center opacity-30 border border-dashed border-[#141414]">
                  <p className="font-mono text-sm uppercase tracking-widest">Run the refinery to generate market intelligence.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="border border-[#141414] p-8">
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="text-2xl font-bold uppercase tracking-tighter">Market Intelligence</h3>
                        <div className="flex flex-wrap gap-2 justify-end">
                          {marketData.labels?.map((l: string, i: number) => (
                            <span key={i} className="bg-[#141414] text-[#E4E3E0] px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest">
                              {l}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                          <label className="font-mono text-[10px] uppercase tracking-widest opacity-50 block mb-2">Market Demand</label>
                          <div className="flex items-end gap-2">
                            <span className="text-4xl font-black leading-none">{marketData.market_score}</span>
                            <span className="text-sm opacity-50 font-bold">/ 10</span>
                          </div>
                        </div>
                        <div>
                          <label className="font-mono text-[10px] uppercase tracking-widest opacity-50 block mb-2">Innovation</label>
                          <div className="flex items-end gap-2">
                            <span className="text-4xl font-black leading-none">{marketData.innovation_score}</span>
                            <span className="text-sm opacity-50 font-bold">/ 10</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm opacity-70 leading-relaxed border-t border-[#141414] pt-6">{marketData.verdict}</p>
                    </div>
                    
                    <div className="border border-[#141414] p-8">
                      <h3 className="text-lg font-bold uppercase tracking-tight mb-4 flex items-center gap-2">
                        <Users size={18} />
                        Target Users
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {marketData.target_users?.map((u: string, i: number) => (
                          <span key={i} className="border border-[#141414] px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                            {u}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="border border-[#141414] p-8">
                      <h3 className="text-lg font-bold uppercase tracking-tight mb-4 flex items-center gap-2">
                        <BarChart3 size={18} />
                        Competitors
                      </h3>
                      <ul className="space-y-4">
                        {marketData.competitors?.map((c: string, i: number) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 bg-[#141414] rounded-full mt-1.5" />
                            <span className="text-sm opacity-80">{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="border border-[#141414] p-8 bg-amber-50">
                      <h3 className="text-lg font-bold uppercase tracking-tight mb-4 flex items-center gap-2">
                        <AlertTriangle size={18} />
                        Main Risks
                      </h3>
                      <ul className="space-y-4">
                        {marketData.risks?.map((r: string, i: number) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5" />
                            <span className="text-sm opacity-80">{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'architect' && (
            <motion.div 
              key="architect"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {!architectData ? (
                <div className="p-20 text-center opacity-30 border border-dashed border-[#141414]">
                  <p className="font-mono text-sm uppercase tracking-widest">Run the refinery to scan architecture risks.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <div className="border border-[#141414] p-8 min-h-[500px] relative overflow-hidden">
                      <h3 className="text-2xl font-bold uppercase tracking-tighter mb-8">Evolution Tech-Tree</h3>
                      <TechTree data={techTreeData} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="border border-[#141414] p-8">
                        <h3 className="text-lg font-bold uppercase tracking-tight mb-4 flex items-center gap-2">
                          <Binary size={18} />
                          Tech Stack Detected
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {architectData.tech_stack_detected?.map((t: string, i: number) => (
                            <span key={i} className="bg-[#141414] text-[#E4E3E0] px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="border border-[#141414] p-8">
                        <h3 className="text-lg font-bold uppercase tracking-tight mb-4 flex items-center gap-2">
                          <Zap size={18} />
                          Improvements
                        </h3>
                        <ul className="space-y-2">
                          {architectData.improvements?.map((imp: string, i: number) => (
                            <li key={i} className="text-xs flex items-start gap-2">
                              <span className="text-green-600">•</span>
                              {imp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="border border-[#141414] p-8">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold uppercase tracking-tight">Architecture</h3>
                        <span className="bg-[#141414] text-[#E4E3E0] px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest">
                          {architectData.maturity_level}
                        </span>
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="text-5xl font-black leading-none">{architectData.architecture_score}</span>
                        <span className="text-sm opacity-50 font-bold">/ 10</span>
                      </div>
                    </div>
                    
                    <div className="border border-[#141414] p-8 bg-amber-50">
                      <h3 className="text-lg font-bold uppercase tracking-tight mb-4 flex items-center gap-2">
                        <Shield size={18} />
                        Risk Scan
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-mono text-[10px] uppercase tracking-widest opacity-50 mb-2">Scalability</h4>
                          <ul className="space-y-2">
                            {architectData.scalability_risks?.map((r: string, i: number) => (
                              <li key={i} className="text-xs border-l-2 border-amber-500 pl-3 py-0.5">{r}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-mono text-[10px] uppercase tracking-widest opacity-50 mb-2">Security</h4>
                          <ul className="space-y-2">
                            {architectData.security_risks?.map((r: string, i: number) => (
                              <li key={i} className="text-xs border-l-2 border-red-500 pl-3 py-0.5">{r}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-mono text-[10px] uppercase tracking-widest opacity-50 mb-2">Missing Components</h4>
                          <ul className="space-y-2">
                            {architectData.missing_components?.map((c: string, i: number) => (
                              <li key={i} className="text-xs border-l-2 border-blue-500 pl-3 py-0.5">{c}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div 
              key="users"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {!userData ? (
                <div className="p-20 text-center opacity-30 border border-dashed border-[#141414]">
                  <p className="font-mono text-sm uppercase tracking-widest">Run the refinery to simulate user personas.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {userData.map((u: any, i: number) => (
                    <div key={i} className="border border-[#141414] p-8 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-[#141414] text-[#E4E3E0] flex items-center justify-center rounded-full">
                          <Users size={24} />
                        </div>
                        <div className="text-2xl font-black">{u.score}/10</div>
                      </div>
                      <h4 className="text-xl font-bold uppercase tracking-tight mb-2">{u.persona}</h4>
                      <p className="text-sm italic opacity-70 mb-6">"{u.reaction}"</p>
                      <div className="mt-auto space-y-4">
                        <h5 className="font-mono text-[10px] uppercase tracking-widest opacity-50">Friction Points</h5>
                        <ul className="space-y-2">
                          {u.frictionPoints.map((f: string, j: number) => (
                            <li key={j} className="text-xs flex items-start gap-2">
                              <span className="text-amber-600">•</span>
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'decoder' && (
            <motion.div 
              key="decoder"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {!decoderData ? (
                <div className="p-20 text-center opacity-30 border border-dashed border-[#141414]">
                  <p className="font-mono text-sm uppercase tracking-widest">Run the refinery to decode failure points.</p>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto space-y-12">
                  <div className="text-center space-y-4">
                    <h3 className="text-5xl font-bold uppercase tracking-tighter">The Rejection Decoder</h3>
                    <p className="font-mono text-xs opacity-50 uppercase tracking-widest">Turning "No" into a Scalable "How-To"</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <h4 className="font-bold uppercase tracking-tight flex items-center gap-2">
                          <AlertTriangle className="text-amber-600" size={18} />
                          Root Cause Analysis
                        </h4>
                        <p className="text-lg leading-relaxed opacity-80">{decoderData.rootCause}</p>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-bold uppercase tracking-tight flex items-center gap-2">
                          <Binary className="text-blue-600" size={18} />
                          Skill Gaps to Bridge
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {decoderData.skillGaps.map((s: string, i: number) => (
                            <span key={i} className="border border-[#141414] px-4 py-2 text-xs font-bold uppercase tracking-widest">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-[#141414] text-[#E4E3E0] p-8 space-y-6">
                      <h4 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                        <CheckCircle2 className="text-green-400" size={20} />
                        Actionable Fixes
                      </h4>
                      <ul className="space-y-6">
                        {decoderData.fixes.map((f: string, i: number) => (
                          <li key={i} className="flex gap-4">
                            <span className="font-mono text-xs opacity-50">0{i+1}</span>
                            <span className="text-sm leading-relaxed">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'survival' && (
            <motion.div 
              key="survival"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-12"
            >
              {!survivalData ? (
                <div className="p-20 text-center opacity-30 border border-dashed border-[#141414]">
                  <p className="font-mono text-sm uppercase tracking-widest">Run the refinery to generate the final survival roadmap.</p>
                </div>
              ) : (
                <div className="max-w-5xl mx-auto space-y-12">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-[#141414] pb-12">
                    <div className="text-center md:text-left space-y-2">
                      <h3 className="text-6xl font-black uppercase tracking-tighter">Survival Engine</h3>
                      <p className="font-mono text-sm opacity-50 uppercase tracking-widest">Final Strategic Decision Module</p>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <span className="block font-mono text-[10px] uppercase tracking-widest opacity-50 mb-1">Risk Level</span>
                        <span className={`text-xl font-bold uppercase tracking-widest ${
                          survivalData.risk_level === 'Low' ? 'text-green-600' : 
                          survivalData.risk_level === 'Medium' ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {survivalData.risk_level}
                        </span>
                      </div>
                      <div className="w-px h-12 bg-[#141414] opacity-20" />
                      <div className="text-center">
                        <span className="block font-mono text-[10px] uppercase tracking-widest opacity-50 mb-1">Survival Probability</span>
                        <span className="text-4xl font-black">{survivalData.survival_score}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="md:col-span-2 space-y-12">
                      <section className="space-y-4">
                        <h4 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-2">
                          <Rocket className="text-blue-600" size={24} />
                          Project Potential
                        </h4>
                        <p className="text-xl leading-relaxed opacity-80 font-serif italic">
                          "{survivalData.project_potential}"
                        </p>
                      </section>

                      <section className="space-y-6">
                        <h4 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                          <TrendingUp className="text-green-600" size={20} />
                          Evolution Roadmap
                        </h4>
                        <div className="space-y-4">
                          {survivalData.evolution_roadmap?.map((step: string, i: number) => (
                            <div key={i} className="flex gap-6 items-start group">
                              <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full border-2 border-[#141414] flex items-center justify-center font-mono text-xs font-bold group-hover:bg-[#141414] group-hover:text-[#E4E3E0] transition-colors">
                                  {i + 1}
                                </div>
                                {i < survivalData.evolution_roadmap.length - 1 && (
                                  <div className="w-0.5 h-12 bg-[#141414] opacity-10 my-2" />
                                )}
                              </div>
                              <div className="pt-1">
                                <p className="text-lg font-medium opacity-90">{step}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>

                    <div className="space-y-8">
                      <div className="bg-[#141414] text-[#E4E3E0] p-8 space-y-6">
                        <h4 className="text-lg font-bold uppercase tracking-tight flex items-center gap-2">
                          <Shield size={20} />
                          Key Weaknesses
                        </h4>
                        <ul className="space-y-4">
                          {survivalData.key_weaknesses?.map((w: string, i: number) => (
                            <li key={i} className="flex gap-3 items-start">
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2" />
                              <span className="text-sm opacity-80 leading-relaxed">{w}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="border border-[#141414] p-8 space-y-4">
                        <h4 className="font-mono text-[10px] uppercase tracking-widest opacity-50">Scoring Model</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between text-xs">
                            <span>Market Demand</span>
                            <span className="font-bold">40%</span>
                          </div>
                          <div className="w-full h-1 bg-[#141414]/10">
                            <div className="h-full bg-[#141414]" style={{ width: '40%' }} />
                          </div>
                          <div className="flex justify-between text-xs pt-2">
                            <span>Architecture</span>
                            <span className="font-bold">40%</span>
                          </div>
                          <div className="w-full h-1 bg-[#141414]/10">
                            <div className="h-full bg-[#141414]" style={{ width: '40%' }} />
                          </div>
                          <div className="flex justify-between text-xs pt-2">
                            <span>Innovation</span>
                            <span className="font-bold">20%</span>
                          </div>
                          <div className="w-full h-1 bg-[#141414]/10">
                            <div className="h-full bg-[#141414]" style={{ width: '20%' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
