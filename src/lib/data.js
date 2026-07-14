import { store, uid, HOUR } from "./core.js";

/* ==SECTION:COMPANYDATA== */
const seedLeads = {};
function seedLead(companyId, overrides) {
  const lead = {
    id: `lead_${uid()}`,
    name: "", category: "", value: 0, phone: "", email: "",
    source: "Website", stage: "NEW",
    createdAt: new Date(Date.now() - 3 * HOUR).toISOString(),
    stageEnteredAt: new Date(Date.now() - 3 * HOUR).toISOString(),
    notes: "", lost: false,
    activities: [],
    ...overrides,
  };
  lead.activities = [{ t: lead.createdAt, msg: "Lead created" }, ...(overrides.activities || [])];
  (seedLeads[companyId] = seedLeads[companyId] || []).push(lead);
  return lead;
}
export const SEED_COMPANIES = [
  { id: "co_tampa", name: "Tampa Remodels", industry: "Home remodeling" },
  { id: "co_fit", name: "Elite Fitness Studios", industry: "Fitness" },
];
const ago = (h) => new Date(Date.now() - h * HOUR).toISOString();
seedLead("co_tampa", { name: "John Smith", category: "Kitchen", value: 12500, phone: "+1-813-555-0123", email: "john@example.com", source: "Google Ads", stage: "NEW", createdAt: ago(0.1), stageEnteredAt: ago(0.1) });
seedLead("co_tampa", { name: "Brightway HOA", category: "General", value: 8750, phone: "+1-813-555-0188", source: "Referral", stage: "NEW", createdAt: ago(0.5), stageEnteredAt: ago(0.5) });
seedLead("co_tampa", { name: "Summit Partners", category: "Kitchen", value: 15000, source: "Website", stage: "NEW", createdAt: ago(1), stageEnteredAt: ago(1) });
seedLead("co_tampa", { name: "Maria Alvarez", category: "Bathroom", value: 10000, phone: "+1-813-555-0142", source: "Google Ads", stage: "CONTACTED", createdAt: ago(9), stageEnteredAt: ago(1) });
seedLead("co_tampa", { name: "Pinnacle Group", category: "Kitchen", value: 18600, source: "Referral", stage: "CONTACTED", createdAt: ago(20), stageEnteredAt: ago(2) });
seedLead("co_tampa", { name: "Lumen Estates", category: "Whole home", value: 22000, source: "Website", stage: "QUALIFIED", createdAt: ago(30), stageEnteredAt: ago(3) });
seedLead("co_tampa", { name: "Greenline Ventures", category: "Kitchen", value: 17500, source: "Google Ads", stage: "QUALIFIED", createdAt: ago(40), stageEnteredAt: ago(4) });
seedLead("co_tampa", { name: "Vision Mobility", category: "Bathroom", value: 25000, source: "Referral", stage: "PROPOSAL", createdAt: ago(60), stageEnteredAt: ago(6) });
seedLead("co_tampa", { name: "Zenith Systems", category: "Kitchen", value: 21500, source: "Website", stage: "WON", createdAt: ago(96), stageEnteredAt: ago(26) });
seedLead("co_tampa", { name: "Aurora Networks", category: "General", value: 17000, source: "Google Ads", stage: "WON", createdAt: ago(120), stageEnteredAt: ago(50) });
seedLead("co_fit", { name: "Derrick Cole", category: "Membership", value: 1200, source: "Instagram", stage: "NEW", createdAt: ago(2), stageEnteredAt: ago(2) });
seedLead("co_fit", { name: "Priya Raman", category: "Personal training", value: 3400, source: "Walk-in", stage: "CONTACTED", createdAt: ago(12), stageEnteredAt: ago(3) });
seedLead("co_fit", { name: "Tom Nguyen", category: "Corporate plan", value: 5200, source: "Referral", stage: "QUALIFIED", createdAt: ago(28), stageEnteredAt: ago(5) });
seedLead("co_fit", { name: "Angela Brooks", category: "Membership", value: 980, source: "Instagram", stage: "PROPOSAL", createdAt: ago(50), stageEnteredAt: ago(8) });
seedLead("co_fit", { name: "Marcus Reed", category: "Personal training", value: 2600, source: "Website", stage: "WON", createdAt: ago(80), stageEnteredAt: ago(20) });

export const loadCompanies = () => store.get("ezx_companies", () => SEED_COMPANIES);
export const saveCompanies = (c) => store.set("ezx_companies", c);
export const loadLeads = (companyId) => store.get(`ezx_leads_${companyId}`, () => seedLeads[companyId] || []);
export const saveLeads = (companyId, leads) => store.set(`ezx_leads_${companyId}`, leads);

export function exportAll() {
  const companies = loadCompanies();
  const payload = {
    exportedAt: new Date().toISOString(),
    companies,
    leads: Object.fromEntries(companies.map((c) => [c.id, loadLeads(c.id)])),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "ezxmgmt-backup.json"; a.click();
  URL.revokeObjectURL(url);
}
export function importAll(json) {
  const data = JSON.parse(json);
  if (!Array.isArray(data.companies) || typeof data.leads !== "object") throw new Error("bad file");
  saveCompanies(data.companies);
  data.companies.forEach((c) => saveLeads(c.id, data.leads[c.id] || []));
  return data.companies;
}
