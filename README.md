# Agente Criador de Skill (v4 - Pro Edition)

**Versão:** 4.0  
**Status:** Production Ready  
**Criadora:** Ana Retore (THE COSMO)

---

## Novidades na v4

### 🟢 #1: Cleanup Automático do Cache

✅ Remove automaticamente missões com +30 dias  
✅ Arquiva em `archived-missions.json`  
✅ Mantém cache leve e performático  
✅ Executa silenciosamente na inicialização

### 🟢 #2: Versionamento Incremental

✅ Detecta se skill já existe  
✅ Cria automaticamente v2.0, v3.0, etc  
✅ Mantém histórico de versões  
✅ Nomeia pastas com sufixo `-v2`, `-v3`

### 🟢 #3: Tags Customizadas

✅ Adiciona tags opcionais à skill  
✅ Salva em frontmatter YAML  
✅ Inclui no package.json (se executável)  
✅ Útil para categorização e busca

### 🟢 #4: Push Automático para GitHub

✅ Detecta se é repositório Git  
✅ Faz commit automático com mensagem  
✅ Faz push pro branch atual  
✅ Retorna link direto do SKILL.md no GitHub  
✅ Exibe repositório e arquivo salvo

### 🟢 #5: Exportação de Skills para VPS

✅ Empacota skill completa em JSON  
✅ Inclui todos os arquivos e estrutura  
✅ Salva em `_exports/` com timestamp  
✅ Pronto para upload ou CI/CD

---

## Como Usar

### Modo Interativo (Recomendado)

```bash
node agente-criador-skill-v4.js
```

**Fluxo:**

1. Responde as 7 perguntas de missão
2. (Novo) Adiciona tags opcionais
3. (Novo) Adiciona projeto opcionalmente
4. Agente escolhe arquitetura
5. (Novo) Skill é criada com versionamento automático
6. (Novo) Pacote é exportado para `_exports/`

```
╔════════════════════════════════════════════════════════════════╗
║                  AGENTE CRIADOR DE SKILL                      ║
║                     v4 - Pro Edition                          ║
╚════════════════════════════════════════════════════════════════╝

📋 Você tem 2 missão(ões) salva(s):

   1. cliente-para-roteiro-vida (30/04/2026)
   2. preco-para-alerta (29/04/2026)

🔄 Quer reutilizar uma anterior? (número ou Enter para nova):
> Enter (nova missão)

🎯 Qual é sua MISSÃO?
> Diagnosticar cliente e estruturar roadmap pessoal

... (5 perguntas mais)

🏷️  Tags customizadas? (ex: plano-a, automacao, diagnostico)
> diagnostico, roadmap, plano-a

📁 Nome do projeto (ex: Portal Reset, TOM, ASTRA)?
> Consultoria Plano A

⏳ Analisando sua MISSÃO...

✅ SKILL CRIADA COM SUCESSO!

📦 Nome: cliente-para-roadmap-vida
🏗️  Arquitetura: MODULAR
💡 Lógica: Transforma cliente novo em roadmap executável

👤 Metadados:
   • Criadora: Ana Retore
   • Organização: THE COSMO
   • Data: 30/04/2026
   • Versão: 1.0
   • Tags: diagnostico, roadmap, plano-a
   • Projeto: Consultoria Plano A

📂 Localização: C:\Users\Ana\skills\user\cliente-para-roadmap-vida

📤 Pacote exportado: C:\Users\Ana\skills\user\..\_exports\cliente-para-roadmap-vida-2026-04-30.json
```

### Modo Batch (Automação)

```bash
node agente-criador-skill-v4.js --batch config.json
```

**arquivo `config.json`:**

```json
{
  "mission": "Diagnosticar cliente",
  "context": "Plano A",
  "result": "Roteiro de vida",
  "execution": "Consultora",
  "frequency": "Recorrente",
  "integrations": "Nenhuma",
  "complexity": "Complexa",
  "tags": "diagnostico, roadmap, plano-a",
  "projectName": "Consultoria Plano A"
}
```

Tags e projectName são **opcionais** em batch.

---

## GitHub Automático (v4)

### O que Acontece

Quando uma skill é criada e o projeto está em um repositório Git:

1. **Stage & Commit** — Todos os arquivos são commitados automaticamente
2. **Push** — Branch atual recebe o push
3. **Links** — Repositório e arquivo MD são retornados

### Fluxo

```
✅ SKILL CRIADA COM SUCESSO!

📤 Fazendo push para GitHub...

🔗 GitHub Automático

📚 Repositório:
   https://github.com/seu-usuario/seu-repo

📄 SKILL.md (salvo em):
   https://github.com/seu-usuario/seu-repo/blob/main/skills/user/skill-name/SKILL.md

🌿 Branch: main
```

### O Que É Salvo no Git

```
Mensagem de commit: chore: add skill cliente-para-roteiro-vida (30/04/2026)

Arquivos commitados:
├── skills/user/cliente-para-roteiro-vida/
│   ├── SKILL.md
│   └── references/
│       ├── astrologia.md
│       ├── human-design.md
│       └── examples/
│           ├── roteiro-1.md
│           └── roteiro-2.md
└── .agente-criador-skill/cached-missions.json (atualizado)
```

### Se Não For Git

Se o projeto não estiver em um repositório Git:

```
⚠️  Não é um repositório Git. Push para GitHub pulado.
```

Neste caso, a skill é criada normalmente, mas sem commit/push.

---

## Cache Management (v4)

### Localização

- **Windows**: `C:\Users\[seu-usuario]\.agente-criador-skill\`
  - `cached-missions.json` (ativo)
  - `archived-missions.json` (arquivado)
- **macOS/Linux**: `$HOME/.agente-criador-skill/`

### Limpeza Automática

- **Retenção:** 30 dias
- **Trigger:** Executa automaticamente na inicialização
- **Ação:** Move missões antigas para `archived-missions.json`
- **Mensagem:** `🗂️  2 missão(ões) arquivada(s) automaticamente.`

### O Que É Salvo

Cada missão contém:

- ID único
- Nome da skill
- 7 respostas (mission, context, result, etc)
- Tags (se adicionadas)
- Nome do projeto (se informado)
- Data de criação
- Data de arquivamento (se movida)

---

## Versionamento de Skills (v4)

### Fluxo

```
Primeira criação:
skill-name/ → versão 1.0

Segunda criação da mesma skill:
skill-name-v2/ → versão 2.0

Terceira criação:
skill-name-v3/ → versão 3.0
```

### No SKILL.md

```yaml
---
name: cliente-para-roteiro-vida
version: 2.0
---
```

### No package.json (se executável)

```json
{
  "name": "cliente-para-roteiro-vida",
  "version": "2.0",
  ...
}
```

### Histórico

Todas as versões coexistem:

```
skills/user/
├── cliente-para-roteiro-vida/
│   └── SKILL.md (v1.0)
├── cliente-para-roteiro-vida-v2/
│   └── SKILL.md (v2.0)
└── cliente-para-roteiro-vida-v3/
    └── SKILL.md (v3.0)
```

---

## Tags e Metadata (v4)

### No SKILL.md

```yaml
---
name: cliente-para-roadmap-vida
tags: diagnostico, roadmap, plano-a
project: Consultoria Plano A
---
```

### Usado Para

- Categorização e busca
- Contexto de origem
- Identificação de projeto
- Histórico e rastreabilidade

### Exemplo de Tags

- `plano-a` — Relacionado à Consultoria Plano A
- `tom` — Relacionado ao TOM
- `automacao` — Scripts/executáveis
- `diagnostico` — Ferramentas de avaliação
- `portal-reset` — Relacionado ao Portal Reset

---

## Exportação de Skills (v4)

### Processo

1. Skill é criada em `skills/user/skill-name/`
2. Agente lê todos os arquivos recursivamente
3. Cria pacote JSON em `_exports/skill-name-YYYY-MM-DD.json`
4. Pronto para upload, Git, ou CI/CD

### Estrutura do Pacote

```json
{
  "skill": "cliente-para-roadmap-vida",
  "exported_at": "2026-04-30T14:23:45.123Z",
  "creator": "Ana Retore",
  "organization": "THE COSMO",
  "files": {
    "SKILL.md": "# Cliente Para Roadmap...",
    "references/astrologia.md": "# Astrologia...",
    "references/examples/roteiro-1.md": "# Exemplo 1..."
  }
}
```

### Casos de Uso

- **Backup automático** — arquivo JSON completo
- **Distribuição** — compartilhar skill via arquivo
- **CI/CD** — upload automático para VPS
- **Versionamento** — guardar snapshots por data
- **Restauração** — importar de um pacote anterior

### Localização

```
skills/user/
├── cliente-para-roteiro-vida/
└── _exports/
    └── cliente-para-roteiro-vida-2026-04-30.json
```

---

## Exemplos

### Exemplo 1: Criar Nova Skill (Interativo)

```bash
$ node agente-criador-skill-v4.js

🎯 Qual é sua MISSÃO?
> Diagnosticar cliente com astrologia

🌍 Em qual CONTEXTO?
> Plano A - Mapa + Astrologia

... (mais 5 perguntas)

🏷️  Tags customizadas?
> diagnostico, astrologia, plano-a

📁 Nome do projeto?
> Consultoria Plano A

⏳ Analisando...

✅ SKILL CRIADA COM SUCESSO!
📦 Nome: cliente-astrologia-diagnostico
🏗️  Arquitetura: MODULAR
📂 Localização: C:\Users\Ana\skills\user\cliente-astrologia-diagnostico
📤 Pacote exportado: C:\Users\Ana\skills\user\_exports\cliente-astrologia-diagnostico-2026-04-30.json
```

### Exemplo 2: Recriar Mesma Skill (Versionamento)

```bash
$ node agente-criador-skill-v4.js

📋 Você tem 1 missão(ões) salva(s):
   1. cliente-astrologia-diagnostico (30/04/2026)

🔄 Quer reutilizar uma anterior? (número ou Enter para nova):
> 1

⏳ Carregando: cliente-astrologia-diagnostico...

✅ SKILL CRIADA COM SUCESSO!
📦 Nome: cliente-astrologia-diagnostico
🏗️  Arquitetura: MODULAR
📂 Localização: C:\Users\Ana\skills\user\cliente-astrologia-diagnostico-v2
📤 Pacote exportado: ...\cliente-astrologia-diagnostico-2026-04-30.json
```

### Exemplo 3: Batch Mode (Automação)

```bash
# Criar arquivo de config com tags
cat > skill-config.json << EOF
{
  "mission": "Monitorar métricas de performance",
  "context": "TOM - Pipeline de conteúdo",
  "result": "Dashboard com alertas",
  "execution": "Sistema automático",
  "frequency": "Contínuo",
  "integrations": "TOM API, Telegram",
  "complexity": "Complexa",
  "tags": "tom, automacao, monitoramento",
  "projectName": "TOM v2.0"
}
EOF

# Executar
node agente-criador-skill-v4.js --batch skill-config.json

# Resultado
✅ SKILL CRIADA COM SUCESSO!
📦 Nome: metricas-para-alerta
🏗️  Arquitetura: MCP
📂 Localização: C:\Users\Ana\skills\user\metricas-para-alerta
📤 Pacote exportado: ...\metricas-para-alerta-2026-04-30.json
```

### Exemplo 4: CI/CD Pipeline

```bash
#!/bin/bash

CONFIG="skill-config.json"
SKILLS_DIR="$HOME/skills/user"
EXPORT_DIR="$SKILLS_DIR/_exports"

# Gerar skill
node agente-criador-skill-v4.js --batch $CONFIG

if [ $? -eq 0 ]; then
  # Fazer commit
  cd $SKILLS_DIR
  git add .
  git commit -m "New skill from batch: $(date +%Y-%m-%d)"

  # Fazer push
  git push origin main

  # Enviar pacote para VPS
  scp $EXPORT_DIR/*.json user@vps.example.com:/skills/

  echo "✅ Skill criada e deployada com sucesso!"
fi
```

---

## Comparação de Versões

| Recurso                 | v1  | v2  | v3  | v4  |
| ----------------------- | --- | --- | --- | --- |
| Conversacional          | ✅  | ✅  | ✅  | ✅  |
| Detecção automática     | ✅  | ✅  | ✅  | ✅  |
| Assinatura criador      | ❌  | ✅  | ✅  | ✅  |
| Paths dinâmicos         | ❌  | ✅  | ✅  | ✅  |
| Model atualizado        | ❌  | ✅  | ✅  | ✅  |
| Validação input         | ❌  | ✅  | ✅  | ✅  |
| Metadata completa       | ❌  | ✅  | ✅  | ✅  |
| Handlers úteis          | ❌  | ✅  | ✅  | ✅  |
| Cache de missões        | ❌  | ❌  | ✅  | ✅  |
| Batch mode              | ❌  | ❌  | ✅  | ✅  |
| **Cleanup automático**      | ❌  | ❌  | ❌  | ✅  |
| **Versionamento**           | ❌  | ❌  | ❌  | ✅  |
| **Tags customizadas**       | ❌  | ❌  | ❌  | ✅  |
| **Push automático GitHub**  | ❌  | ❌  | ❌  | ✅  |
| **Exportação para VPS**     | ❌  | ❌  | ❌  | ✅  |

---

## Instalação v4

```bash
# 1. Copie o arquivo v4
cp agente-criador-skill-v4.js ~/seu-projeto/agente-criador-skill.js

# 2. Configure API key
export ANTHROPIC_API_KEY="sua-chave"

# 3. Use como quiser
node agente-criador-skill.js              # Interativo
node agente-criador-skill.js --batch config.json  # Batch
```

---

## Status de Implementação

✅ Assinatura + Metadata  
✅ Paths Dinâmicos  
✅ Model Atualizado  
✅ Validação de Input  
✅ Metadata Completa  
✅ Handlers MCP Úteis  
✅ README Corrigido  
✅ Cache de Respostas  
✅ Modo Batch  
✅ **Cleanup Automático (v4)**  
✅ **Versionamento Incremental (v4)**  
✅ **Tags Customizadas (v4)**  
✅ **Exportação para VPS (v4)**

---

## Próximos Passos (v5+)

- [ ] Webhook para triggers automáticos
- [ ] Dashboard web para gerenciar skills
- [ ] Integração com Git automática
- [ ] Sincronização com Biblioteca (API)
- [ ] Validação de credenciais MCP antes de criar handler
- [ ] Suporte a templates customizados

---

**Versão:** 4.0 (Pro Edition)  
**Criadora:** Ana Retore (THE COSMO)  
**Data:** Abril 2026  
**Status:** Pronto para Produção
