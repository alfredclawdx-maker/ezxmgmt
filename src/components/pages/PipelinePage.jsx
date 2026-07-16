import { GoldPipeline } from '../pipeline.jsx';

export function PipelinePage({ leads, setLeads, company, onLogout }) {
  return (
    <GoldPipeline
      company={company}
      onLogout={onLogout}
      leads={leads}
      setLeads={setLeads}
    />
  );
}
