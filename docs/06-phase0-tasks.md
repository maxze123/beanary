# Phase 0 Task List

**Format:** CSV-compatible for Trello, Notion, Linear, or other kanban imports  
**Owner:** Solo Founder (non-AI tasks only)

---

## CSV Export

```csv
Title,Description,List,Labels,Estimate
"Read and approve 01-technical-approach.md","Review TDD workflow, CI/CD pipeline, multi-agent coordination strategy. Flag any concerns.",Backlog,docs;review,15min
"Read and approve 02-tech-stack.md","Review PWA decision, React/Vite stack, project structure. Confirm no objections.",Backlog,docs;review,15min
"Read and approve 03-data-models.md","Review Bean and Shot types, database schema, validation rules. Confirm data model is complete.",Backlog,docs;review,20min
"Read and approve 04-feature-milestones.md","Review milestone sequence, dependencies, acceptance criteria. Confirm scope is correct.",Backlog,docs;review,20min
"Read and approve 05-design-system.md","Review colors, typography, component specs. Confirm visual direction.",Backlog,docs;review,20min
"Create GitHub account (if needed)","Set up GitHub account for repository hosting.",Backlog,setup,10min
"Create GitHub repository","Create private repo named 'espresso-dial-in' or similar. Initialize with README.",Backlog,setup,10min
"Set up GitHub Projects board","Create kanban board with columns: Backlog, In Progress, Review, Done.",Backlog,setup,15min
"Install VS Code or Cursor","Install code editor. Cursor recommended for AI-assisted development.",Backlog,setup,15min
"Install Node.js","Install Node.js LTS (v20+) via nodejs.org or nvm.",Backlog,setup,15min
"Install Git","Install Git if not already present. Configure username and email.",Backlog,setup,10min
"Clone repository locally","Clone the GitHub repo to local machine.",Backlog,setup,5min
"Create project folder structure","Create /docs folder and copy all spec documents into repo.",Backlog,setup,10min
"Commit spec documents to repo","Add all 5 spec documents to /docs and push to GitHub.",Backlog,setup,10min
"Design app icon (simple sketch)","Sketch 2-3 simple icon concepts. Can be hand-drawn or basic digital.",Backlog,design,30min
"Create app icon (final)","Create final icon at 512x512. Can use Figma, Canva, or commission.",Backlog,design,1hr
"Export app icons (all sizes)","Export 192x192, 512x512, 180x180, 167x167, 152x152, 32x32 favicon.",Backlog,design,20min
"Write beta tester recruitment post","Draft Reddit/Discord post explaining the app, what testers get, what you need from them.",Backlog,recruiting,30min
"Identify target communities","List 5-10 espresso subreddits, Discord servers, or forums for recruitment.",Backlog,recruiting,20min
"Create beta signup form","Simple Google Form or Tally form: name, email, espresso setup, how often they dial in.",Backlog,recruiting,20min
"Define agent task: M0 Project Setup","Write clear instructions for AI agent to initialize Vite+React+TypeScript project with all tooling.",Backlog,agent-prep,30min
"Define agent task: M1 Shared Types","Write clear instructions for AI agent to create all TypeScript types from data models doc.",Backlog,agent-prep,20min
"Define agent task: M2 Data Layer","Write clear instructions for AI agent to implement Dexie database and repositories.",Backlog,agent-prep,30min
"Define agent task: M3 UI Shell","Write clear instructions for AI agent to create layout, navigation, and shared components.",Backlog,agent-prep,30min
"Define agent task: M4 Bean Library","Write clear instructions for AI agent to build bean library feature end-to-end.",Backlog,agent-prep,30min
"Define agent task: M5 Shot Logging","Write clear instructions for AI agent to build shot logging and dial-in flow.",Backlog,agent-prep,30min
"Define agent task: M6 Guidance Engine","Write clear instructions for AI agent to implement rule-based suggestions.",Backlog,agent-prep,20min
"Define agent task: M7 Polish & PWA","Write clear instructions for AI agent to finalize PWA config, settings page, polish.",Backlog,agent-prep,20min
"Execute M0 with AI agent","Run AI agent on M0 task. Review output, request fixes, merge when passing.",Backlog,build,1hr
"Review M0 output","Verify: dev server runs, build works, tests run, linting works, CI pipeline triggers.",Backlog,review,20min
"Execute M1 with AI agent","Run AI agent on M1 task (types). Review and merge.",Backlog,build,30min
"Execute M2 with AI agent","Run AI agent on M2 task (data layer). Review and merge.",Backlog,build,1hr
"Execute M3 with AI agent","Run AI agent on M3 task (UI shell). Review and merge.",Backlog,build,1hr
"Review M1-M3 integration","Verify all three milestones work together. Run full test suite.",Backlog,review,30min
"Execute M4 with AI agent","Run AI agent on M4 task (bean library). Review and merge.",Backlog,build,2hr
"Manual test: Bean Library","Add beans, edit, delete. Verify persistence. Check empty states.",Backlog,testing,20min
"Execute M5 with AI agent","Run AI agent on M5 task (shot logging). Review and merge.",Backlog,build,2hr
"Manual test: Shot Logging","Log shots, verify calculations, test mark as dialed flow.",Backlog,testing,20min
"Execute M6 with AI agent","Run AI agent on M6 task (guidance). Review and merge.",Backlog,build,1hr
"Manual test: Guidance Engine","Verify all rule paths produce correct suggestions.",Backlog,testing,15min
"Execute M7 with AI agent","Run AI agent on M7 task (PWA polish). Review and merge.",Backlog,build,1hr
"Test PWA install on iOS","Add to home screen via Safari. Verify icon, splash, offline.",Backlog,testing,15min
"Test PWA install on Android","Add to home screen via Chrome. Verify icon, splash, offline.",Backlog,testing,15min
"Run Lighthouse audit","Check Performance, Accessibility, Best Practices, PWA scores. Target 90+.",Backlog,testing,15min
"Fix Lighthouse issues","Address any scores below 90.",Backlog,build,1hr
"Deploy to GitHub Pages","Configure GitHub Pages deployment. Verify live URL works.",Backlog,deploy,30min
"Test deployed version","Full manual test on deployed URL. Both iOS and Android.",Backlog,testing,20min
"Post recruitment message","Post to identified communities. Include signup form link.",Backlog,recruiting,30min
"Follow up on signups","Review responses, select 20-30 testers, send confirmation.",Backlog,recruiting,30min
"Send beta invites","Email testers with: app URL, quick start guide, feedback form link.",Backlog,recruiting,30min
"Create feedback form","Google Form or Tally: ease of use, friction points, feature requests, NPS.",Backlog,recruiting,20min
"Create 2-week check-in survey","Short survey: still using? how many bags? what almost made you stop?",Backlog,recruiting,15min
"Schedule check-in calls","Offer optional 15min calls to willing testers. Schedule 5-10.",Backlog,recruiting,20min
"Monitor beta usage (week 1)","Check: are people logging? returning? any crash reports?",Backlog,monitoring,30min
"Send 2-week check-in survey","Email survey to all testers.",Backlog,monitoring,10min
"Conduct check-in calls","Run scheduled calls. Take notes on friction, requests, sentiment.",Backlog,monitoring,2hr
"Monitor beta usage (week 3-4)","Check retention, shots per user, bags per user metrics.",Backlog,monitoring,30min
"Collect final feedback","Send final survey or request last thoughts from testers.",Backlog,monitoring,20min
"Analyze beta results","Compile: retention %, shots/week, bags/user, qualitative themes.",Backlog,analysis,1hr
"Write Phase 0 retrospective","Document: what worked, what didn't, key learnings, go/no-go recommendation.",Backlog,analysis,1hr
"Make go/no-go decision","Based on success criteria: proceed to Phase 1, pivot, or stop.",Backlog,decision,30min
```

---

## Task Breakdown by Category

### 📄 Documentation Review (5 tasks)
Review and approve all spec documents before starting development.

### 🔧 Setup (9 tasks)
Local development environment and repository setup.

### 🎨 Design (3 tasks)
App icon creation and export.

### 👥 Recruiting (6 tasks)
Beta tester recruitment and onboarding.

### 🤖 Agent Prep (8 tasks)
Write clear task definitions for AI coding assistants.

### 🔨 Build (9 tasks)
Execute development milestones with AI agents.

### ✅ Review & Testing (10 tasks)
Review AI output and manual testing.

### 🚀 Deploy (1 task)
Ship to production (GitHub Pages).

### 📊 Monitoring & Analysis (7 tasks)
Track beta usage and analyze results.

### 🎯 Decision (1 task)
Final go/no-go based on Phase 0 results.

---

## Suggested Kanban Columns

| Column | Purpose |
|--------|---------|
| **Backlog** | All tasks start here |
| **This Week** | Tasks planned for current week |
| **In Progress** | Currently working on |
| **Blocked** | Waiting on something |
| **Review** | Needs verification or approval |
| **Done** | Completed |

---

## Labels

| Label | Color | Usage |
|-------|-------|-------|
| `docs` | Blue | Documentation tasks |
| `setup` | Gray | Environment setup |
| `design` | Purple | Design tasks |
| `recruiting` | Green | Beta tester tasks |
| `agent-prep` | Orange | AI agent task definitions |
| `build` | Red | Development execution |
| `review` | Yellow | Review and QA |
| `testing` | Teal | Manual testing |
| `deploy` | Pink | Deployment |
| `monitoring` | Cyan | Usage tracking |
| `analysis` | Indigo | Data analysis |
| `decision` | Black | Key decisions |

---

## Recommended Order

**Week 1: Foundation**
1. Review all docs
2. Setup (GitHub, editor, Node, Git)
3. Design app icon
4. Start writing agent task definitions

**Week 2: Agent Prep + Recruiting**
1. Finish agent task definitions
2. Write recruitment post
3. Create signup form
4. Post to communities

**Week 3: Build M0-M3**
1. Execute M0, M1, M2, M3 with agents
2. Review integration

**Week 4: Build M4-M7**
1. Execute M4, M5, M6, M7 with agents
2. Manual testing throughout

**Week 5: Polish + Deploy**
1. Lighthouse audit and fixes
2. Deploy to GitHub Pages
3. Final testing

**Week 6: Beta Launch**
1. Send beta invites
2. Begin monitoring

**Weeks 7-9: Beta Period**
1. Monitor usage
2. Check-in surveys and calls
3. Collect feedback

**Week 10: Analysis + Decision**
1. Analyze results
2. Write retrospective
3. Go/no-go decision

---

## Import Instructions

### Trello
1. Copy CSV content above
2. Go to Trello board → Menu → More → Print and Export → Import
3. Or use a CSV-to-Trello tool

### Notion
1. Create a new database
2. Import CSV
3. Convert to Board view
4. Set up Labels as multi-select property

### Linear
1. Go to Settings → Import
2. Upload CSV
3. Map columns to Linear fields

### GitHub Projects
1. Create new Project (Board view)
2. Manually add items (no direct CSV import)
3. Or use GitHub CLI / API for bulk creation

---

## Notes

- Time estimates are rough—actual time will vary
- Agent tasks may need multiple iterations
- Build tasks depend on agent quality—budget extra time for fixes
- Recruiting can run parallel to development
- Don't skip manual testing—AI-generated code needs verification
