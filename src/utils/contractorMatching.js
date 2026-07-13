export function rankContractorsForLead(lead, contractors) {
  return contractors
    .map((contractor) => {
      let score = 0;
      const specialist = contractor.specialties.includes(lead.project.type);
      score += specialist ? 40 : 20;
      score += (contractor.conversionRate || 0.5) * 30;
      score += lead.project.budgetMin >= contractor.preferredBudgetMin ? 15 : 7;
      if (contractor.avgResponseTime <= 60) score += 15;
      else if (contractor.avgResponseTime <= 240) score += 10;
      else score += 5;
      return {
        contractor,
        matchScore: Math.round(score),
        reasoning: `${specialist ? "Specialist" : "Generalist"} · ${Math.round(contractor.conversionRate * 100)}% conv · ~${contractor.avgResponseTime}m response`,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}
