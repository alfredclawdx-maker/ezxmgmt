# EZXMGMT — Lead Generation Pipeline

Three-layer app: animated loading screen → 7-digit passcode gate → high-ticket sales pipeline (Tampa home remodeling).

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:5173 — passcode is `0001001`.

## Deploy to Vercel
1. Push this folder to a GitHub repo.
2. In Vercel: New Project → import the repo. Framework preset: **Vite** (auto-detected). Build command `npm run build`, output `dist`.
3. Deploy. Done.

## Architecture
- `src/App.jsx` — state machine: loading → passcode → pipeline. Logout returns to passcode; loading never replays. Auth is deliberately not persisted.
- `src/components/` — LoadingScreen + SpecialText (glitch reveal), PasscodeGate, PipelineKanban, LeadCard, LeadModal, MetricsBar, ContractorLeaderboard, Modals (offer/lost/add-lead), ui atoms.
- `src/utils/` — scoringAlgorithm (quality score + win probability), contractorMatching, validation (stall detection), formatting, exporters (CSV/JSON).
- `src/data/` — contractorList, sampleLeads.
- `src/hooks/useLocalStorage.js` — debounced persistence for pipeline data only (`ezx_leads`).

## Notes
- Stage transitions enforce exit criteria (score ≥ 60 to qualify; contractor acceptance to advance; payment recorded on SOLD).
- Stall detection: OFFERED 24h+ = warning, 48h+ = urgent, with escalate-to-backup.
- The passcode is a client-side courtesy lock, not real security — do not store anything sensitive beyond lead data you already handle, and keep the deployed URL unlisted.
- Sample data seeds on first load; JSON export/import provides backup/restore.
