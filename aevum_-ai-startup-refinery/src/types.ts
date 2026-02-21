export interface Project {
  id: string;
  name: string;
  description: string;
  problem?: string;
  target_users?: string;
  technology?: string;
  repo_link?: string;
  project_structure?: string;
  readme?: string;
  commit_activity?: string;
  status: 'draft' | 'refining' | 'completed';
  survival_score: number;
  created_at: string;
  market_analysis?: string;
  architect_report?: string;
  simulation_results?: string;
  decoder_feedback?: string;
  tech_tree?: string; // JSON string
  survival_report?: string; // JSON string
}

export interface TechTreeNode {
  name: string;
  description: string;
  status: 'locked' | 'unlocked' | 'completed';
  children?: TechTreeNode[];
}

export interface AgentState {
  isAnalyzing: boolean;
  progress: number;
  currentStep: string;
}

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
