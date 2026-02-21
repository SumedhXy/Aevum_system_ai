import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, Target, Cpu, Users } from 'lucide-react';

interface LandingProps {
  onStart: () => void;
}

export default function Landing({ onStart }: LandingProps) {
  return (
    <div className="space-y-24">
      <div className="hidden">Landing Component Loaded</div>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 opacity-10">
          <div className="text-[30vw] font-black leading-none select-none tracking-tighter">AEVUM</div>
        </div>
        
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="font-mono text-xs uppercase tracking-[0.3em] opacity-60 mb-4 block">
              Autonomous Digital Incubator
            </span>
            <h1 className="text-7xl md:text-9xl font-bold tracking-tighter leading-[0.85] uppercase mb-8">
              Refine <br />
              <span className="italic font-serif font-light lowercase">Your</span> <br />
              Vision.
            </h1>
            <p className="text-xl md:text-2xl font-medium max-w-2xl mb-12 leading-relaxed opacity-80">
              Every other team pitches a product. We pitch a system that ensures every product has a 100% chance of evolving into a scalable, investor-ready success.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onStart}
                className="group relative bg-[#141414] text-[#E4E3E0] px-8 py-6 rounded-sm text-lg font-bold uppercase tracking-widest overflow-hidden transition-all hover:pr-12"
              >
                <span className="relative z-10 flex items-center gap-4">
                  Enter the Refinery
                  <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>

              <button 
                onClick={() => {
                  // This will be handled in App.tsx to create a demo project
                  const event = new CustomEvent('create-demo-project');
                  window.dispatchEvent(event);
                }}
                className="group border-2 border-[#141414] px-8 py-6 rounded-sm text-lg font-bold uppercase tracking-widest transition-all hover:bg-[#141414] hover:text-[#E4E3E0]"
              >
                Quick Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem Statement Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-1 border-y border-[#141414] bg-[#141414]">
        <div className="bg-[#E4E3E0] p-12 space-y-6">
          <div className="w-12 h-12 border border-[#141414] flex items-center justify-center font-mono font-bold">01</div>
          <h3 className="text-2xl font-bold uppercase tracking-tight">The Validation Gap</h3>
          <p className="opacity-70 leading-relaxed">Founders build in a vacuum. Aevum verifies ideas against real-time market trends before you waste a single hour.</p>
        </div>
        <div className="bg-[#E4E3E0] p-12 space-y-6">
          <div className="w-12 h-12 border border-[#141414] flex items-center justify-center font-mono font-bold">02</div>
          <h3 className="text-2xl font-bold uppercase tracking-tight">Architectural Blindness</h3>
          <p className="opacity-70 leading-relaxed">Detect "Survival Risks" early. Our Architect Agent scans your vision to ensure it scales beyond the prototype phase.</p>
        </div>
        <div className="bg-[#E4E3E0] p-12 space-y-6">
          <div className="w-12 h-12 border border-[#141414] flex items-center justify-center font-mono font-bold">03</div>
          <h3 className="text-2xl font-bold uppercase tracking-tight">The Feedback Silence</h3>
          <p className="opacity-70 leading-relaxed">Turn every "No" into a "How-To". The Rejection Decoder provides actionable roadmaps to fix skill gaps and product weaknesses.</p>
        </div>
      </section>

      {/* Agents Section */}
      <section className="space-y-12">
        <div className="flex justify-between items-end">
          <h2 className="text-5xl font-bold uppercase tracking-tighter">The Multi-Agent <br /> Refinery</h2>
          <div className="font-mono text-xs opacity-50 uppercase tracking-widest pb-2">System Architecture v1.0</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Target, name: "Market Intelligence", desc: "Real-time verification against trends and competitors." },
            { icon: Shield, name: "Architect Agent", desc: "Risk detection and Evolution Tech-Tree generation." },
            { icon: Users, name: "Synthetic User Lab", desc: "Smoke-test usability with diverse AI personas." },
            { icon: Cpu, name: "Rejection Decoder", desc: "Actionable roadmaps for every failure point." }
          ].map((agent, i) => (
            <div key={i} className="border border-[#141414] p-8 hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors group">
              <agent.icon className="w-8 h-8 mb-6 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold uppercase tracking-tight mb-2">{agent.name}</h4>
              <p className="text-sm opacity-70">{agent.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
