import { CONTRACTORS } from "./contractorList.js";
import { HOUR } from "../utils/constants.js";
import { calculateQualityScore, calcWinProbability } from "../utils/scoringAlgorithm.js";

/* ---------- Sample data ---------- */
let uid = 100;
export function makeLead(overrides) {
  const now = Date.now();
  const base = {
    id: `lead_${uid++}`,
    source: "leadpages_form",
    createdAt: new Date(now - 4 * HOUR).toISOString(),
    homeowner: { name: "", phone: "", email: "", responseTime: 60 },
    project: { type: "kitchen", budgetMin: 20000, budgetMax: 30000, timelineDays: 60 },
    currentStage: "NEW",
    stageEnteredAt: new Date(now - 4 * HOUR).toISOString(),
    stageHistory: [],
    contractorOffers: [],
    activities: [],
    notes: "",
    outcome: { result: null, closeDate: null, revenue: null, contractorWinner: null, lossReason: null },
  };
  const lead = { ...base, ...overrides, homeowner: { ...base.homeowner, ...(overrides.homeowner || {}) }, project: { ...base.project, ...(overrides.project || {}) } };
  lead.qualityScore = calculateQualityScore(lead);
  lead.winProbability = calcWinProbability(lead, CONTRACTORS);
  return lead;
}

function act(hoursAgo, action, notes) {
  return { timestamp: new Date(Date.now() - hoursAgo * HOUR).toISOString(), action, notes, user: "system" };
}

function offer(conId, hoursAgo, status, price, extra = {}) {
  const c = CONTRACTORS.find((x) => x.id === conId);
  return {
    contractorId: conId, contractorName: c.name,
    offeredAt: new Date(Date.now() - hoursAgo * HOUR).toISOString(),
    tier: price >= 550 ? "premium" : "standard", price,
    status, responseAt: extra.responseAt || null, acceptedAt: extra.acceptedAt || null,
    paymentReceivedAt: extra.paymentReceivedAt || null, notes: "",
  };
}

export function buildSampleLeads() {
  const now = Date.now();
  return [
    makeLead({
      homeowner: { name: "John Smith", phone: "+1-813-555-0123", email: "john.smith@example.com", responseTime: 45 },
      project: { type: "kitchen", budgetMin: 22000, budgetMax: 30000, timelineDays: 60 },
      createdAt: new Date(now - 2 * HOUR).toISOString(), stageEnteredAt: new Date(now - 2 * HOUR).toISOString(),
      activities: [act(2, "form_submitted", "Lead entered via Leadpages form"), act(1.9, "sms_sent", "Confirmation SMS sent"), act(1.8, "sms_responded", "Homeowner confirmed interest")],
    }),
    makeLead({
      homeowner: { name: "Maria Alvarez", phone: "+1-813-555-0188", email: "maria.a@example.com", responseTime: 30 },
      project: { type: "kitchen", budgetMin: 28000, budgetMax: 40000, timelineDays: 45 },
      createdAt: new Date(now - 1 * HOUR).toISOString(), stageEnteredAt: new Date(now - 1 * HOUR).toISOString(),
      activities: [act(1, "form_submitted", "Google Ads landing page"), act(0.9, "sms_sent", "Confirmation SMS sent"), act(0.8, "sms_responded", "Replied in 30 min"), act(0.5, "consultation_completed", "15-min phone consult done")],
      source: "google_ads",
    }),
    makeLead({
      homeowner: { name: "Derrick Cole", phone: "+1-813-555-0142", email: "d.cole@example.com", responseTime: 300 },
      project: { type: "general", budgetMin: 12000, budgetMax: 16000, timelineDays: 120 },
      createdAt: new Date(now - 6 * HOUR).toISOString(), stageEnteredAt: new Date(now - 6 * HOUR).toISOString(),
      activities: [act(6, "form_submitted", "Manual entry from phone inquiry")],
      source: "manual_entry",
    }),
    makeLead({
      homeowner: { name: "Priya Raman", phone: "+1-813-555-0157", email: "priya.r@example.com", responseTime: 55 },
      project: { type: "bathroom", budgetMin: 18000, budgetMax: 24000, timelineDays: 50 },
      currentStage: "QUALIFIED",
      createdAt: new Date(now - 9 * HOUR).toISOString(), stageEnteredAt: new Date(now - 3 * HOUR).toISOString(),
      stageHistory: [{ stage: "NEW", enteredAt: new Date(now - 9 * HOUR).toISOString(), exitedAt: new Date(now - 3 * HOUR).toISOString() }],
      activities: [act(9, "form_submitted", "Leadpages form"), act(8.8, "sms_responded", "Confirmed"), act(3, "qualified", "Budget verified on call")],
    }),
    makeLead({
      homeowner: { name: "Tom Nguyen", phone: "+1-813-555-0170", email: "tom.n@example.com", responseTime: 90 },
      project: { type: "kitchen", budgetMin: 25000, budgetMax: 32000, timelineDays: 70 },
      currentStage: "QUALIFIED",
      createdAt: new Date(now - 12 * HOUR).toISOString(), stageEnteredAt: new Date(now - 5 * HOUR).toISOString(),
      stageHistory: [{ stage: "NEW", enteredAt: new Date(now - 12 * HOUR).toISOString(), exitedAt: new Date(now - 5 * HOUR).toISOString() }],
      activities: [act(12, "form_submitted", "Leadpages form"), act(5, "qualified", "Qualification call complete")],
    }),
    makeLead({
      homeowner: { name: "Angela Brooks", phone: "+1-813-555-0114", email: "angela.b@example.com", responseTime: 40 },
      project: { type: "kitchen", budgetMin: 24000, budgetMax: 30000, timelineDays: 55 },
      currentStage: "OFFERED",
      createdAt: new Date(now - 30 * HOUR).toISOString(), stageEnteredAt: new Date(now - 27 * HOUR).toISOString(),
      stageHistory: [
        { stage: "NEW", enteredAt: new Date(now - 30 * HOUR).toISOString(), exitedAt: new Date(now - 28 * HOUR).toISOString() },
        { stage: "QUALIFIED", enteredAt: new Date(now - 28 * HOUR).toISOString(), exitedAt: new Date(now - 27 * HOUR).toISOString() },
      ],
      contractorOffers: [offer("con_A", 27, "pending", 600), offer("con_B", 26, "pending", 600)],
      activities: [act(30, "form_submitted", "Leadpages form"), act(27, "offer_sent", "Offered to ABC Remodeling + XYZ Contractors")],
    }),
    makeLead({
      homeowner: { name: "Sam Whitfield", phone: "+1-813-555-0199", email: "sam.w@example.com", responseTime: 100 },
      project: { type: "bathroom", budgetMin: 16000, budgetMax: 20000, timelineDays: 80 },
      currentStage: "OFFERED",
      createdAt: new Date(now - 8 * HOUR).toISOString(), stageEnteredAt: new Date(now - 4 * HOUR).toISOString(),
      stageHistory: [
        { stage: "NEW", enteredAt: new Date(now - 8 * HOUR).toISOString(), exitedAt: new Date(now - 5 * HOUR).toISOString() },
        { stage: "QUALIFIED", enteredAt: new Date(now - 5 * HOUR).toISOString(), exitedAt: new Date(now - 4 * HOUR).toISOString() },
      ],
      contractorOffers: [offer("con_B", 4, "pending", 450)],
      activities: [act(8, "form_submitted", "Leadpages form"), act(4, "offer_sent", "Offered to XYZ Contractors")],
    }),
    makeLead({
      homeowner: { name: "Lena Ortiz", phone: "+1-813-555-0161", email: "lena.o@example.com", responseTime: 25 },
      project: { type: "kitchen", budgetMin: 26000, budgetMax: 34000, timelineDays: 60 },
      currentStage: "ACCEPTED",
      createdAt: new Date(now - 40 * HOUR).toISOString(), stageEnteredAt: new Date(now - 10 * HOUR).toISOString(),
      stageHistory: [
        { stage: "NEW", enteredAt: new Date(now - 40 * HOUR).toISOString(), exitedAt: new Date(now - 38 * HOUR).toISOString() },
        { stage: "QUALIFIED", enteredAt: new Date(now - 38 * HOUR).toISOString(), exitedAt: new Date(now - 36 * HOUR).toISOString() },
        { stage: "OFFERED", enteredAt: new Date(now - 36 * HOUR).toISOString(), exitedAt: new Date(now - 10 * HOUR).toISOString() },
      ],
      contractorOffers: [
        offer("con_A", 36, "accepted", 600, { responseAt: new Date(now - 10 * HOUR).toISOString(), acceptedAt: new Date(now - 10 * HOUR).toISOString() }),
        offer("con_C", 36, "declined", 600, { responseAt: new Date(now - 20 * HOUR).toISOString() }),
      ],
      activities: [act(40, "form_submitted", "Leadpages form"), act(36, "offer_sent", "Offered to ABC + Reliable"), act(10, "offer_accepted", "ABC Remodeling accepted — collect $600")],
    }),
    makeLead({
      homeowner: { name: "Marcus Reed", phone: "+1-813-555-0135", email: "marcus.r@example.com", responseTime: 60 },
      project: { type: "kitchen", budgetMin: 30000, budgetMax: 38000, timelineDays: 60 },
      currentStage: "SOLD",
      createdAt: new Date(now - 72 * HOUR).toISOString(), stageEnteredAt: new Date(now - 3 * HOUR).toISOString(),
      stageHistory: [
        { stage: "NEW", enteredAt: new Date(now - 72 * HOUR).toISOString(), exitedAt: new Date(now - 70 * HOUR).toISOString() },
        { stage: "QUALIFIED", enteredAt: new Date(now - 70 * HOUR).toISOString(), exitedAt: new Date(now - 68 * HOUR).toISOString() },
        { stage: "OFFERED", enteredAt: new Date(now - 68 * HOUR).toISOString(), exitedAt: new Date(now - 30 * HOUR).toISOString() },
        { stage: "ACCEPTED", enteredAt: new Date(now - 30 * HOUR).toISOString(), exitedAt: new Date(now - 3 * HOUR).toISOString() },
      ],
      contractorOffers: [offer("con_A", 68, "accepted", 600, { responseAt: new Date(now - 30 * HOUR).toISOString(), acceptedAt: new Date(now - 30 * HOUR).toISOString(), paymentReceivedAt: new Date(now - 3 * HOUR).toISOString() })],
      activities: [act(72, "form_submitted", "Leadpages form"), act(30, "offer_accepted", "ABC accepted"), act(3, "payment_received", "$600 received — SOLD")],
      outcome: { result: "won", closeDate: new Date(now - 3 * HOUR).toISOString(), revenue: 600, contractorWinner: "ABC Remodeling", lossReason: null },
    }),
    makeLead({
      homeowner: { name: "Dana Fields", phone: "+1-813-555-0126", email: "dana.f@example.com", responseTime: 400 },
      project: { type: "general", budgetMin: 10000, budgetMax: 14000, timelineDays: 150 },
      currentStage: "LOST",
      createdAt: new Date(now - 96 * HOUR).toISOString(), stageEnteredAt: new Date(now - 48 * HOUR).toISOString(),
      activities: [act(96, "form_submitted", "Leadpages form"), act(48, "marked_lost", "Budget below $15K minimum")],
      outcome: { result: "lost", closeDate: new Date(now - 48 * HOUR).toISOString(), revenue: null, contractorWinner: null, lossReason: "Budget too low" },
    }),
  ];
}
