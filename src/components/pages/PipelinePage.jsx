import { GoldPipeline } from '../pipeline.jsx';

export function PipelinePage({ leads, setLeads, company }) {
  return (
    <div className="min-h-full rounded-2xl overflow-hidden" style={{ border: '1px solid #2C2C2E' }}>
      <GoldPipeline company={company} leads={leads} setLeads={setLeads} />
    </div>
  );
}
