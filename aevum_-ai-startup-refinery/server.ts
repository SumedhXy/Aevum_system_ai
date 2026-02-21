import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("aevum.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    problem TEXT,
    target_users TEXT,
    technology TEXT,
    repo_link TEXT,
    project_structure TEXT,
    readme TEXT,
    commit_activity TEXT,
    status TEXT DEFAULT 'draft',
    survival_score INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    market_analysis TEXT,
    architect_report TEXT,
    simulation_results TEXT,
    decoder_feedback TEXT,
    tech_tree TEXT,
    survival_report TEXT
  )
`);

// Migration: Ensure new columns exist for existing databases
const columns = [
  { name: 'market_analysis', type: 'TEXT' },
  { name: 'architect_report', type: 'TEXT' },
  { name: 'simulation_results', type: 'TEXT' },
  { name: 'decoder_feedback', type: 'TEXT' },
  { name: 'tech_tree', type: 'TEXT' },
  { name: 'survival_report', type: 'TEXT' }
];

for (const col of columns) {
  try {
    db.exec(`ALTER TABLE projects ADD COLUMN ${col.name} ${col.type}`);
    console.log(`Added column ${col.name} to projects table`);
  } catch (err: any) {
    if (!err.message.includes('duplicate column name')) {
      console.error(`Error adding column ${col.name}:`, err.message);
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get("/api/test-update/:id", (req, res) => {
    const id = req.params.id;
    const testData = {
      status: 'completed',
      survival_score: 85,
      market_analysis: JSON.stringify({ market_score: 8, innovation_score: 9, verdict: "Test Verdict", target_users: ["Test User"], competitors: ["Test Comp"], risks: ["Test Risk"], labels: ["Test"] }),
      architect_report: JSON.stringify({ tech_stack_detected: ["React"], architecture_score: 8, missing_components: [], scalability_risks: [], security_risks: [], improvements: [], maturity_level: "MVP", techTree: { name: "Test", children: [] } }),
      simulation_results: JSON.stringify([{ persona: "Test Persona", reaction: "Test Reaction", frictionPoints: [], score: 8 }]),
      decoder_feedback: JSON.stringify({ rootCause: "Test Cause", fixes: ["Test Fix"], skillGaps: [] }),
      tech_tree: JSON.stringify({ name: "Test", children: [] }),
      survival_report: JSON.stringify({ survival_score: 85, risk_level: "Low", project_potential: "High", key_weaknesses: [], evolution_roadmap: [] })
    };
    
    const updates: string[] = [];
    const values: any[] = [];
    Object.entries(testData).forEach(([key, value]) => {
      updates.push(`${key} = ?`);
      values.push(value);
    });
    values.push(id);
    
    db.prepare(`UPDATE projects SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    res.json({ success: true, message: "Project updated with test data" });
  });

  // API Routes
  app.get("/api/projects", (req, res) => {
    const projects = db.prepare("SELECT * FROM projects ORDER BY created_at DESC").all();
    res.json(projects);
  });

  app.get("/api/projects/:id", (req, res) => {
    console.log(`GET request for project ${req.params.id}`);
    const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(req.params.id);
    if (!project) {
      console.warn(`Project ${req.params.id} not found`);
      return res.status(404).json({ error: "Project not found" });
    }
    res.json(project);
  });

  app.post("/api/projects", (req, res) => {
    const fields = [
      'id', 'name', 'description', 'problem', 'target_users', 'technology', 
      'repo_link', 'project_structure', 'readme', 'commit_activity',
      'status', 'survival_score', 'market_analysis', 'architect_report',
      'simulation_results', 'decoder_feedback', 'tech_tree', 'survival_report'
    ];
    
    const providedFields = Object.keys(req.body).filter(f => fields.includes(f));
    const placeholders = providedFields.map(() => "?").join(", ");
    const columns = providedFields.join(", ");
    const values = providedFields.map(f => req.body[f]);

    const stmt = db.prepare(`INSERT INTO projects (${columns}) VALUES (${placeholders})`);
    stmt.run(...values);
    res.status(201).json({ id: req.body.id, name: req.body.name });
  });

  app.patch("/api/projects/:id", (req, res) => {
    console.log(`PATCH request for project ${req.params.id}`);
    const { 
      status, 
      survival_score, 
      market_analysis, 
      architect_report, 
      simulation_results, 
      decoder_feedback,
      tech_tree,
      survival_report
    } = req.body;
    
    console.log(`Status: ${status}, Score: ${survival_score}`);
    
    const updates: string[] = [];
    const values: any[] = [];

    if (status !== undefined) { updates.push("status = ?"); values.push(status); }
    if (survival_score !== undefined) { updates.push("survival_score = ?"); values.push(survival_score); }
    if (market_analysis !== undefined) { updates.push("market_analysis = ?"); values.push(market_analysis); }
    if (architect_report !== undefined) { updates.push("architect_report = ?"); values.push(architect_report); }
    if (simulation_results !== undefined) { updates.push("simulation_results = ?"); values.push(simulation_results); }
    if (decoder_feedback !== undefined) { updates.push("decoder_feedback = ?"); values.push(decoder_feedback); }
    if (tech_tree !== undefined) { updates.push("tech_tree = ?"); values.push(tech_tree); }
    if (survival_report !== undefined) { updates.push("survival_report = ?"); values.push(survival_report); }

    if (updates.length === 0) return res.status(400).json({ error: "No updates provided" });

    values.push(req.params.id);
    const stmt = db.prepare(`UPDATE projects SET ${updates.join(", ")} WHERE id = ?`);
    stmt.run(...values);
    res.json({ success: true });
  });

  app.delete("/api/projects/:id", (req, res) => {
    db.prepare("DELETE FROM projects WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/github/info", async (req, res) => {
    const repoUrl = req.query.url as string;
    if (!repoUrl) return res.status(400).json({ error: "URL is required" });

    try {
      // Extract owner and repo from URL
      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) return res.status(400).json({ error: "Invalid GitHub URL" });

      const [_, owner, repo] = match;
      const apiUrl = `https://api.github.com/repos/${owner}/${repo.replace(/\.git$/, "")}`;
      
      const response = await fetch(apiUrl, {
        headers: { 'User-Agent': 'Aevum-Refinery' }
      });

      if (!response.ok) throw new Error("Failed to fetch from GitHub");

      const data = await response.json();
      
      // Get languages
      const langRes = await fetch(`${apiUrl}/languages`, {
        headers: { 'User-Agent': 'Aevum-Refinery' }
      });
      const languages = langRes.ok ? await langRes.json() : {};

      // Get README
      const readmeRes = await fetch(`${apiUrl}/readme`, {
        headers: { 
          'User-Agent': 'Aevum-Refinery',
          'Accept': 'application/vnd.github.v3.raw'
        }
      });
      const readme = readmeRes.ok ? await readmeRes.text() : "";

      // Get File Structure (top level)
      const treeRes = await fetch(`${apiUrl}/contents`, {
        headers: { 'User-Agent': 'Aevum-Refinery' }
      });
      const contents = treeRes.ok ? await treeRes.json() : [];
      const structure = Array.isArray(contents) 
        ? contents.map((f: any) => `${f.type === 'dir' ? '[DIR] ' : ''}${f.name}`).join(", ")
        : "";

      // Get Commit Activity (last 30 days summary)
      const commitsRes = await fetch(`${apiUrl}/commits?per_page=10`, {
        headers: { 'User-Agent': 'Aevum-Refinery' }
      });
      const commits = commitsRes.ok ? await commitsRes.json() : [];
      const commitActivity = Array.isArray(commits) 
        ? `Last ${commits.length} commits: ` + commits.map((c: any) => c.commit.message.split('\n')[0]).join(" | ")
        : "";

      res.json({
        name: data.name,
        description: data.description,
        technology: Object.keys(languages).join(", "),
        stars: data.stargazers_count,
        forks: data.forks_count,
        language: data.language,
        readme: readme.slice(0, 5000), // Limit README size
        structure: structure,
        commitActivity: commitActivity
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to extract repository info" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
