#!/usr/bin/env node

const readline = require("readline");
const fs = require("fs");
const path = require("path");
const https = require("https");
const os = require("os");

// Detectar SO e definir caminho dinamicamente
const getSkillsDir = () => {
  const platform = os.platform();
  const homeDir = os.homedir();

  if (platform === "win32") {
    return path.join(homeDir, "skills", "user");
  } else {
    return "/mnt/skills/user";
  }
};

// Cache directory
const getCacheDir = () => {
  const platform = os.platform();
  const homeDir = os.homedir();

  if (platform === "win32") {
    return path.join(homeDir, ".agente-criador-skill");
  } else {
    return path.join(homeDir, ".agente-criador-skill");
  }
};

const SKILLS_DIR = getSkillsDir();
const CACHE_DIR = getCacheDir();
const CACHE_FILE = path.join(CACHE_DIR, "cached-missions.json");
const ARCHIVE_FILE = path.join(CACHE_DIR, "archived-missions.json");
const CREATOR = "Ana Retore";
const ORGANIZATION = "THE COSMO";
const GENERATOR = "agente-criador-skill";
const CACHE_RETENTION_DAYS = 30;

// Garantir que cache dir existe
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      const trimmed = answer.trim();
      resolve(trimmed);
    });
  });
};

const validateInput = async (value, fieldName) => {
  if (!value || value.length === 0) {
    console.log(`\n⚠️  ${fieldName} não pode estar vazio. Tente novamente.`);
    return null;
  }
  return value;
};

// Cache Management
const loadCache = () => {
  if (fs.existsSync(CACHE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
    } catch (err) {
      return { missions: [] };
    }
  }
  return { missions: [] };
};

const loadArchive = () => {
  if (fs.existsSync(ARCHIVE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(ARCHIVE_FILE, "utf-8"));
    } catch (err) {
      return { archived: [] };
    }
  }
  return { archived: [] };
};

const saveCache = (cache) => {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
};

const saveArchive = (archive) => {
  fs.writeFileSync(ARCHIVE_FILE, JSON.stringify(archive, null, 2));
};

const cleanupOldMissions = () => {
  const cache = loadCache();
  const archive = loadArchive();
  const now = new Date();
  const cutoffDate = new Date(
    now.getTime() - CACHE_RETENTION_DAYS * 24 * 60 * 60 * 1000,
  );

  const active = [];
  cache.missions.forEach((m) => {
    const missionDate = new Date(m.created);
    if (missionDate >= cutoffDate) {
      active.push(m);
    } else {
      archive.archived.push({
        ...m,
        archived_at: new Date().toISOString(),
      });
    }
  });

  if (cache.missions.length !== active.length) {
    cache.missions = active;
    saveCache(cache);
    saveArchive(archive);
    return cache.missions.length - active.length;
  }
  return 0;
};

const addToCache = (missionName, responses) => {
  const cache = loadCache();
  cache.missions.push({
    id: Date.now(),
    name: missionName,
    responses,
    created: new Date().toISOString(),
  });
  saveCache(cache);
};

const listCachedMissions = () => {
  const cache = loadCache();
  return cache.missions;
};

const getCachedMission = (id) => {
  const cache = loadCache();
  return cache.missions.find((m) => m.id === parseInt(id));
};

// Versionamento de Skills
const getSkillVersion = (skillName) => {
  const skillDir = path.join(SKILLS_DIR, skillName);
  if (!fs.existsSync(skillDir)) {
    return "1.0";
  }

  // Procura skills com padrão nome-v2, nome-v3, etc
  const parent = SKILLS_DIR;
  const files = fs.readdirSync(parent);
  const versionedSkills = files.filter((f) => f.startsWith(skillName + "-v"));

  if (versionedSkills.length === 0) {
    return "2.0";
  }

  // Encontra a versão mais alta
  const versions = versionedSkills.map((f) => {
    const match = f.match(/-v(\d+)$/);
    return match ? parseInt(match[1]) : 0;
  });

  const maxVersion = Math.max(...versions);
  return `${maxVersion + 1}.0`;
};

const getNewSkillDir = (skillName) => {
  const baseDir = path.join(SKILLS_DIR, skillName);

  // Se não existe, usa o caminho normal
  if (!fs.existsSync(baseDir)) {
    return baseDir;
  }

  // Se existe, cria versão numerada
  const version = getSkillVersion(skillName);
  const versionedName = `${skillName}-v${version.split(".")[0]}`;
  return path.join(SKILLS_DIR, versionedName);
};

const logo = `
╔════════════════════════════════════════════════════════════════╗
║                  AGENTE CRIADOR DE SKILL                      ║
║                     v4 - Pro Edition                          ║
║                                                                ║
║  Se manda missão em Marte, dou foguete.                      ║
║  Se manda no fundo do mar, dou submarino.                    ║
╚════════════════════════════════════════════════════════════════╝
`;

const questions = [
  {
    key: "mission",
    prompt:
      "\n🎯 Qual é sua MISSÃO? (ex: diagnosticar cliente, monitorar preços, estruturar conteúdo)\n> ",
    description: "A missão",
  },
  {
    key: "context",
    prompt: "\n🌍 Em qual CONTEXTO? (ex: Plano A, TOM, viagem, clínica)\n> ",
    description: "O contexto",
  },
  {
    key: "result",
    prompt:
      "\n📊 Qual RESULTADO esperado? (ex: roteiro de vida, relatório, dashboard, alerta)\n> ",
    description: "O resultado",
  },
  {
    key: "execution",
    prompt:
      "\n⚙️  Quem/o que EXECUTA? (ex: humano consultora, algoritmo/IA, API, webhook)\n> ",
    description: "Quem executa",
  },
  {
    key: "frequency",
    prompt:
      "\n🔄 Qual FREQUÊNCIA? (ex: único, diário, semanal, contínuo, por demanda)\n> ",
    description: "A frequência",
  },
  {
    key: "integrations",
    prompt:
      "\n🔗 Precisa de INTEGRAÇÕES EXTERNAS? (ex: ASTRA, TOM, Telegram, API, banco de dados, nenhuma)\n> ",
    description: "As integrações",
  },
  {
    key: "complexity",
    prompt:
      "\n📚 Qual é a COMPLEXIDADE? (ex: simples, moderada, complexa com múltiplas camadas)\n> ",
    description: "A complexidade",
  },
];

const tagsQuestions = [
  {
    key: "tags",
    prompt:
      "\n🏷️  Tags customizadas? (ex: plano-a, automacao, diagnostico - separadas por vírgula, ou Enter para pular)\n> ",
    description: "Tags opcionais",
  },
  {
    key: "projectName",
    prompt:
      "\n📁 Nome do projeto (ex: Portal Reset, TOM, ASTRA - ou Enter para pular)?\n> ",
    description: "Projeto",
  },
];

const callClaude = (responses) => {
  return new Promise((resolve, reject) => {
    const prompt = `Você é um estrategista de Skills e arquiteto de sistemas.

Analise as RESPOSTAS abaixo de uma pessoa que quer criar uma Skill:

MISSÃO: ${responses.mission}
CONTEXTO: ${responses.context}
RESULTADO ESPERADO: ${responses.result}
EXECUÇÃO: ${responses.execution}
FREQUÊNCIA: ${responses.frequency}
INTEGRAÇÕES: ${responses.integrations}
COMPLEXIDADE: ${responses.complexity}

Com base nisso, DECIDA:

1. Qual ARQUITETURA é apropriada?
2. Qual NOME ESTRATÉGICO (problema → solução)?
3. Qual será a ESTRUTURA DE DIRETÓRIOS?
4. O que cada arquivo deve conter?

Responda APENAS em JSON (sem markdown, sem preamble):

{
  "architecture": "PADRÃO|MODULAR|EXECUTÁVEL|COMPOSTA|MCP",
  "architecture_reasoning": "Por que essa foi escolhida",
  "name": "nome-estrategico-em-kebab-case",
  "name_reasoning": "Por que esse nome para essa missão específica",
  "title": "Título descritivo",
  "description": "Descrição clara com triggers",
  "triggers": ["trigger1", "trigger2"],
  "content": "Instruções estruturadas (200-300 palavras)",
  "structure_explanation": "Explicação de como a estrutura foi pensada para servir essa missão",
  "files_to_create": ["SKILL.md", "references/...", "handlers/..."],
  "examples": [
    {
      "input": "Como usar",
      "expected_output": "O que vai sair"
    }
  ],
  "modular_structure": {
    "reference_files": ["arquivo1.md"],
    "example_files": ["caso1.md"]
  },
  "mcp_structure": {
    "integrations": ["ASTRA", "Telegram"]
  },
  "composite_structure": {
    "sub_skills": ["skill1", "skill2"]
  }
}

CRITÉRIO ESTRATÉGICO:

PADRÃO: Simples, linear, sem dependências externas
MODULAR: Metodologia complexa com múltiplas dimensões
EXECUTÁVEL: Automação, código, scripts
COMPOSTA: Pipeline de múltiplos passos
MCP: Integrations com serviços externos

Nome tem que COMUNICAR a missão. Não é técnico, é estratégico.`;

    const payload = JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      reject(new Error("ANTHROPIC_API_KEY não configurada"));
      return;
    }

    const options = {
      hostname: "api.anthropic.com",
      port: 443,
      path: "/v1/messages",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const response = JSON.parse(data);
          if (response.error)
            reject(new Error(`API: ${response.error.message}`));
          resolve(JSON.parse(response.content[0].text));
        } catch (err) {
          reject(new Error(`Parse: ${err.message}`));
        }
      });
    });

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
};

const createSkill = (skillData, customMetadata = {}) => {
  const skillDir = getNewSkillDir(skillData.name);

  if (!fs.existsSync(SKILLS_DIR)) {
    fs.mkdirSync(SKILLS_DIR, { recursive: true });
  }

  fs.mkdirSync(skillDir, { recursive: true });

  const createdAt = new Date().toISOString();
  const createdDate = new Date().toLocaleDateString("pt-BR");

  // Extrair versão do nome se existir
  let skillVersion = "1.0";
  const versionMatch = skillDir.match(/-v(\d+)$/);
  if (versionMatch) {
    skillVersion = `${versionMatch[1]}.0`;
  }

  const skillMd = `---
name: ${skillData.name}
description: ${skillData.description}
architecture: ${skillData.architecture}
creator: ${CREATOR}
organization: ${ORGANIZATION}
created_at: ${createdAt}
version: ${skillVersion}
generated_by: ${GENERATOR}
${customMetadata.tags ? `tags: ${customMetadata.tags}` : ""}
${customMetadata.projectName ? `project: ${customMetadata.projectName}` : ""}
---

# ${skillData.title}

**Nome Estratégico:** ${skillData.name}
**Lógica:** ${skillData.name_reasoning}
**Arquitetura:** ${skillData.architecture}
**Por que:** ${skillData.architecture_reasoning}

---

**📋 Metadados**
- **Criadora:** ${CREATOR}
- **Organização:** ${ORGANIZATION}
- **Criado em:** ${createdDate}
- **Versão:** ${skillVersion}
- **Arquitetura:** ${skillData.architecture}
- **Gerado por:** ${GENERATOR}
${customMetadata.tags ? `- **Tags:** ${customMetadata.tags}` : ""}
${customMetadata.projectName ? `- **Projeto:** ${customMetadata.projectName}` : ""}

---

## Missão

${skillData.structure_explanation}

## Como Funciona

${skillData.content}

## Exemplos

${skillData.examples
  .map(
    (ex, i) => `### Exemplo ${i + 1}

**Como Usar:**
\`\`\`
${ex.input}
\`\`\`

**Resultado:**
\`\`\`
${ex.expected_output}
\`\`\``,
  )
  .join("\n\n")}

## Triggers

${skillData.triggers.map((t) => `- ${t}`).join("\n")}
`;

  fs.writeFileSync(path.join(skillDir, "SKILL.md"), skillMd);

  if (skillData.architecture === "MODULAR") {
    const refDir = path.join(skillDir, "references");
    fs.mkdirSync(refDir, { recursive: true });

    skillData.modular_structure.reference_files?.forEach((file) => {
      fs.writeFileSync(
        path.join(refDir, file),
        `# ${file}\n\nCriado por: ${CREATOR} (${ORGANIZATION})\nData: ${createdDate}\n${customMetadata.projectName ? `Projeto: ${customMetadata.projectName}\n` : ""}`,
      );
    });

    if (skillData.modular_structure.example_files?.length > 0) {
      const exDir = path.join(refDir, "examples");
      fs.mkdirSync(exDir, { recursive: true });
      skillData.modular_structure.example_files.forEach((file) => {
        fs.writeFileSync(
          path.join(exDir, file),
          `# ${file}\n\nCriado por: ${CREATOR} (${ORGANIZATION})\nData: ${createdDate}\n${customMetadata.projectName ? `Projeto: ${customMetadata.projectName}\n` : ""}`,
        );
      });
    }
  }

  if (skillData.architecture === "EXECUTÁVEL") {
    fs.writeFileSync(
      path.join(skillDir, "index.js"),
      `#!/usr/bin/env node

/**
 * ${skillData.title}
 * Criado por: ${CREATOR} (${ORGANIZATION})
 * Data: ${createdDate}
 * Versão: ${skillVersion}
 ${customMetadata.projectName ? `* Projeto: ${customMetadata.projectName}` : ""}
 */

console.log('${skillData.title} - inicializado');
`,
    );
    fs.writeFileSync(
      path.join(skillDir, "package.json"),
      JSON.stringify(
        {
          name: skillData.name,
          version: skillVersion,
          description: skillData.title,
          author: CREATOR,
          organization: ORGANIZATION,
          created: createdDate,
          ...(customMetadata.projectName && {
            project: customMetadata.projectName,
          }),
          ...(customMetadata.tags && {
            tags: customMetadata.tags.split(",").map((t) => t.trim()),
          }),
          main: "index.js",
        },
        null,
        2,
      ),
    );
  }

  if (skillData.architecture === "COMPOSTA") {
    const subDir = path.join(skillDir, "_sub");
    fs.mkdirSync(subDir, { recursive: true });
    skillData.composite_structure.sub_skills?.forEach((sub) => {
      fs.writeFileSync(
        path.join(subDir, `${sub}.md`),
        `# ${sub}

[Conteúdo]

Criado por: ${CREATOR} (${ORGANIZATION})
Data: ${createdDate}
${customMetadata.projectName ? `Projeto: ${customMetadata.projectName}` : ""}
`,
      );
    });
  }

  if (skillData.architecture === "MCP") {
    const mcpDir = path.join(skillDir, "mcp");
    fs.mkdirSync(mcpDir, { recursive: true });

    fs.writeFileSync(
      path.join(mcpDir, "server.js"),
      `/**
 * MCP Server para ${skillData.title}
 * Criado por: ${CREATOR} (${ORGANIZATION})
 * Data: ${createdDate}
 */

const integrations = [
${skillData.mcp_structure.integrations?.map((i) => `  '${i}'`).join(",\n") || "  // adicione integrações aqui"}
];

module.exports = {
  integrations,
};
`,
    );

    const handDir = path.join(skillDir, "handlers");
    fs.mkdirSync(handDir, { recursive: true });

    skillData.mcp_structure.integrations?.forEach((int) => {
      const handlerName = int.toLowerCase().replace(/\s+/g, "-");
      const className = int.replace(/[^a-zA-Z0-9]/g, "");
      fs.writeFileSync(
        path.join(handDir, `${handlerName}-handler.js`),
        `/**
 * Handler para ${int}
 * Criado por: ${CREATOR} (${ORGANIZATION})
 * Data: ${createdDate}
 */

class ${className}Handler {
  constructor(config) {
    this.config = config;
    this.initialized = false;
  }

  async init() {
    this.initialized = true;
  }

  async execute(payload) {
    if (!this.initialized) await this.init();
    console.log('Executando ${int} com payload:', payload);
    return { success: true, data: null };
  }

  async validate() {
    return { connected: this.initialized, status: 'not-configured' };
  }

  async close() {
    this.initialized = false;
  }
}

module.exports = ${className}Handler;
`,
      );
    });
  }

  return skillDir;
};

// Export/Package Skills para VPS
const exportSkillPackage = async (skillDir, skillName) => {
  const exportDir = path.join(SKILLS_DIR, "..", "_exports");

  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().split("T")[0];
  const packageName = `${skillName}-${timestamp}.json`;
  const packagePath = path.join(exportDir, packageName);

  // Ler todos os arquivos da skill
  const skillFiles = {};
  const readDirRecursive = (dir, prefix = "") => {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const fullPath = path.join(dir, file);
      const relativePath = prefix ? `${prefix}/${file}` : file;

      if (fs.statSync(fullPath).isDirectory()) {
        readDirRecursive(fullPath, relativePath);
      } else {
        skillFiles[relativePath] = fs.readFileSync(fullPath, "utf-8");
      }
    });
  };

  readDirRecursive(skillDir);

  const packageData = {
    skill: skillName,
    exported_at: new Date().toISOString(),
    creator: CREATOR,
    organization: ORGANIZATION,
    files: skillFiles,
  };

  fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));
  return packagePath;
};

// GitHub Integration
const { spawn } = require("child_process");

const executeGitCommand = (command, cwd = process.cwd()) => {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(" ");
    const process = spawn(cmd, args, { cwd, stdio: "pipe" });

    let stdout = "";
    let stderr = "";

    process.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    process.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(stderr || stdout));
      }
    });
  });
};

const getGitRepoInfo = async (skillDir) => {
  try {
    const repoRoot = await executeGitCommand(
      "git rev-parse --show-toplevel",
      skillDir,
    );
    const remoteUrl = await executeGitCommand(
      "git config --get remote.origin.url",
      repoRoot,
    );
    const branch = await executeGitCommand(
      "git rev-parse --abbrev-ref HEAD",
      repoRoot,
    );

    return {
      root: repoRoot,
      url: remoteUrl,
      branch: branch,
      isRepo: true,
    };
  } catch (err) {
    return { isRepo: false };
  }
};

const pushSkillToGithub = async (skillDir, skillName) => {
  try {
    const gitInfo = await getGitRepoInfo(skillDir);

    if (!gitInfo.isRepo) {
      console.log(`\n⚠️  Não é um repositório Git. Push para GitHub pulado.\n`);
      return null;
    }

    console.log(`\n📤 Fazendo push para GitHub...\n`);

    // Stage
    await executeGitCommand(`git add .`, gitInfo.root);

    // Commit
    const commitMsg = `chore: add skill ${skillName} (${new Date().toLocaleDateString("pt-BR")})`;
    await executeGitCommand(`git commit -m "${commitMsg}"`, gitInfo.root);

    // Push
    await executeGitCommand(`git push origin ${gitInfo.branch}`, gitInfo.root);

    // Extrair link do repositório
    let repoUrl = gitInfo.url;
    if (repoUrl.endsWith(".git")) {
      repoUrl = repoUrl.slice(0, -4);
    }
    if (repoUrl.startsWith("git@")) {
      repoUrl = repoUrl.replace("git@github.com:", "https://github.com/");
    }

    const skillPathRelative = path.relative(gitInfo.root, skillDir);
    const skillMdPath = path
      .join(skillPathRelative, "SKILL.md")
      .replace(/\\/g, "/");
    const githubLink = `${repoUrl}/blob/${gitInfo.branch}/${skillMdPath}`;

    return {
      repository: repoUrl,
      branch: gitInfo.branch,
      skillMd: githubLink,
      skillPath: skillMdPath,
    };
  } catch (err) {
    console.log(`\n⚠️  Erro ao fazer push: ${err.message}\n`);
    return null;
  }
};

const displayGithubInfo = (githubInfo, skillDir) => {
  if (!githubInfo) return;

  console.log(`\n🔗 GitHub Automático\n`);
  console.log(`📚 Repositório:`);
  console.log(`   ${githubInfo.repository}\n`);
  console.log(`📄 SKILL.md (salvo em):`);
  console.log(`   ${githubInfo.skillMd}\n`);
  console.log(`🌿 Branch: ${githubInfo.branch}\n`);
};

// Batch Mode
const loadBatchConfig = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const config = JSON.parse(content);
    return config;
  } catch (err) {
    console.error(`❌ Erro ao ler arquivo batch: ${err.message}`);
    return null;
  }
};

(async () => {
  const args = process.argv.slice(2);

  // Cleanup automático de missões antigas
  const archivedCount = cleanupOldMissions();
  if (archivedCount > 0) {
    console.log(
      `\n🗂️  ${archivedCount} missão(ões) arquivada(s) automaticamente.\n`,
    );
  }

  // Batch Mode
  if (args.length > 0 && args[0] === "--batch" && args[1]) {
    const batchFile = args[1];
    const config = loadBatchConfig(batchFile);

    if (!config) {
      process.exit(1);
    }

    console.log(`\n📦 Modo Batch - Carregando de: ${batchFile}\n`);
    console.log(`⏳ Analisando missão...\n`);

    try {
      const skillData = await callClaude(config);
      const skillDir = createSkill(skillData, {
        tags: config.tags,
        projectName: config.projectName,
      });

      // Salvar no cache
      addToCache(skillData.name, config);

      console.log(`\n✅ SKILL CRIADA COM SUCESSO!\n`);
      console.log(`📦 Nome: ${skillData.name}`);
      console.log(`🏗️  Arquitetura: ${skillData.architecture}`);
      console.log(`📂 Localização: ${skillDir}\n`);

      // Exportar para VPS
      const packagePath = await exportSkillPackage(skillDir, skillData.name);
      console.log(`📤 Pacote exportado: ${packagePath}\n`);

      // Push para GitHub
      const githubInfo = await pushSkillToGithub(skillDir, skillData.name);
      displayGithubInfo(githubInfo, skillDir);

      rl.close();
    } catch (err) {
      console.error(`\n❌ Erro: ${err.message}\n`);
      process.exit(1);
    }
    return;
  }

  // Modo Interativo
  console.log(logo);

  const cache = loadCache();
  const cachedMissions = cache.missions;

  // Oferecer reutilizar missão anterior
  if (cachedMissions.length > 0) {
    console.log(
      `\n📋 Você tem ${cachedMissions.length} missão(ões) salva(s):\n`,
    );
    cachedMissions.forEach((m, i) => {
      console.log(
        `   ${i + 1}. ${m.name} (${new Date(m.created).toLocaleDateString("pt-BR")})`,
      );
    });

    const choice = await ask(
      "\n🔄 Quer reutilizar uma anterior? (número ou Enter para nova): ",
    );

    if (choice && !isNaN(choice)) {
      const idx = parseInt(choice) - 1;
      if (idx >= 0 && idx < cachedMissions.length) {
        const cached = cachedMissions[idx];
        console.log(`\n⏳ Carregando: ${cached.name}...\n`);

        try {
          const skillData = await callClaude(cached.responses);
          const skillDir = createSkill(skillData);

          console.log(`\n✅ SKILL CRIADA COM SUCESSO!\n`);
          console.log(`📦 Nome: ${skillData.name}`);
          console.log(`🏗️  Arquitetura: ${skillData.architecture}`);
          console.log(`📂 Localização: ${skillDir}\n`);

          const packagePath = await exportSkillPackage(
            skillDir,
            skillData.name,
          );
          console.log(`📤 Pacote exportado: ${packagePath}\n`);

          rl.close();
          return;
        } catch (err) {
          console.error(`\n❌ Erro: ${err.message}\n`);
          process.exit(1);
        }
      }
    }
  }

  // Nova missão
  const responses = {};

  for (const q of questions) {
    let answer = null;
    while (!answer) {
      answer = await ask(q.prompt);
      answer = await validateInput(answer, q.description);
    }
    responses[q.key] = answer;
  }

  // Tags customizadas
  const customMetadata = {};
  for (const q of tagsQuestions) {
    const answer = await ask(q.prompt);
    if (answer) {
      customMetadata[q.key] = answer;
    }
  }

  console.log("\n⏳ Analisando sua MISSÃO e escolhendo arquitetura...\n");

  try {
    const skillData = await callClaude(responses);
    const skillDir = createSkill(skillData, customMetadata);

    // Salvar no cache
    addToCache(skillData.name, responses);

    console.log(`\n✅ SKILL CRIADA COM SUCESSO!\n`);
    console.log(`📦 Nome: ${skillData.name}`);
    console.log(`🎯 Missão: ${responses.mission}`);
    console.log(`🏗️  Arquitetura: ${skillData.architecture}`);
    console.log(`💡 Lógica: ${skillData.name_reasoning}\n`);

    console.log(`👤 Metadados:`);
    console.log(`   • Criadora: ${CREATOR}`);
    console.log(`   • Organização: ${ORGANIZATION}`);
    console.log(`   • Data: ${new Date().toLocaleDateString("pt-BR")}`);

    // Extrair versão
    const versionMatch = skillDir.match(/-v(\d+)$/);
    const skillVersion = versionMatch ? `${versionMatch[1]}.0` : "1.0";
    console.log(`   • Versão: ${skillVersion}`);

    if (customMetadata.tags) {
      console.log(`   • Tags: ${customMetadata.tags}`);
    }
    if (customMetadata.projectName) {
      console.log(`   • Projeto: ${customMetadata.projectName}`);
    }
    console.log();

    console.log(`📂 Localização: ${skillDir}\n`);
    console.log(`📋 Estrutura criada:`);

    skillData.files_to_create.forEach((file) => {
      console.log(`   • ${file}`);
    });

    console.log(`\n🔧 Triggers:`);
    skillData.triggers.forEach((t) => console.log(`   • ${t}`));

    // Exportar para VPS
    const packagePath = await exportSkillPackage(skillDir, skillData.name);
    console.log(`\n📤 Pacote exportado: ${packagePath}`);

    console.log(`\n✨ Skill está pronta! Use em seus prompts normalmente.\n`);
  } catch (err) {
    console.error(`\n❌ Erro: ${err.message}\n`);
    process.exit(1);
  }

  rl.close();
})();
