export interface BentoIndicator {
  id: string;
  title: string;
  score_2025: string | number;
  trend_direction: 'up' | 'down' | 'neutral';
  trend_value: string;
  status: 'critical' | 'warning' | 'alert' | 'good' | 'star' | 'neutral';
  insight: string;
  action: string;
  quality_rating: number;
  category: string;
}

export const initialDashboardTitle = "GTCI 2025 Pillar 6: Global Knowledge Skills (Brunei)";

export const initialIndicators: BentoIndicator[] = [
  // --- Row 1: Digital Production ---
  {
    id: "6.2.5",
    title: "Software Development",
    score_2025: 3.02,
    trend_direction: "down",
    trend_value: "-56.2",
    status: "critical",
    insight: "Massive decline due to methodology change (GitHub). Reflects low open-source culture.",
    action: "Create Government Open Source Centers; Tax incentives for public GitHub repos.",
    quality_rating: 4,
    category: "Digital Production"
  },
  {
    id: "6.2.1",
    title: "ICT Services Exports",
    score_2025: 2.44,
    trend_direction: "neutral",
    trend_value: "Replaced",
    status: "warning",
    insight: "Local trap: IT firms focus on government contracts rather than exporting services.",
    action: "Establish Software SEZ; Incentivize firms to export to Singapore/Region.",
    quality_rating: 4,
    category: "Digital Production"
  },
  {
    id: "6.2.2",
    title: "Mobile App Development",
    score_2025: 43.27,
    trend_direction: "neutral",
    trend_value: "New",
    status: "warning",
    insight: "Rank 112th. Apps are local utilities (BruHealth), not global commercial hits.",
    action: "Export-First App Bootcamp; Fund game dev for Muslim market.",
    quality_rating: 3,
    category: "Digital Production"
  },
  // --- Row 2: Data Anomalies ---
  {
    id: "6.1.6",
    title: "Digital Skills",
    score_2025: 100.00,
    trend_direction: "neutral",
    trend_value: "Suspicious",
    status: "alert",
    insight: "Score of 100 is a data artifact (missing survey data). Real score likely ~15-25%.",
    action: "URGENT: Commission independent Digital Skills Census with ITU.",
    quality_rating: 2,
    category: "Data Anomalies"
  },
  {
    id: "6.2.6",
    title: "New Business Density",
    score_2025: 0.00,
    trend_direction: "down",
    trend_value: "-5.3",
    status: "alert",
    insight: "Zero score because MSMEs are Sole Proprietorships, not LLCs. Reporting failure.",
    action: "Mandate World Bank submission; Incentivize Sdn Bhd conversion.",
    quality_rating: 2,
    category: "Data Anomalies"
  },
  {
    id: "6.1.7",
    title: "AI Talent Concentration",
    score_2025: "N/A",
    trend_direction: "neutral",
    trend_value: "No Data",
    status: "neutral",
    insight: "Brunei not in LinkedIn sample. Blind spot on AI readiness.",
    action: "National AI Strategy; 'Update your LinkedIn' campaign.",
    quality_rating: 2,
    category: "Data Anomalies"
  },
  // --- Row 3: Human Capital ---
  {
    id: "6.1.3",
    title: "Professionals",
    score_2025: 33.81,
    trend_direction: "down",
    trend_value: "-0.7",
    status: "good",
    insight: "~34% of workforce. Slight decline suggests brain drain risk.",
    action: "Return to Brunei program; Global Talent Visa.",
    quality_rating: 4,
    category: "Human Capital"
  },
  {
    id: "6.1.5",
    title: "Senior Officials & Managers",
    score_2025: 45.11,
    trend_direction: "up",
    trend_value: "+7.0",
    status: "star",
    insight: "Strongest indicator (Top 11% globally). Public sector heavy.",
    action: "Develop private sector middle-management.",
    quality_rating: 4,
    category: "Human Capital"
  },
  {
    id: "6.1.1",
    title: "Workforce w/ Tertiary Ed",
    score_2025: 35.56,
    trend_direction: "up",
    trend_value: "+7.9",
    status: "good",
    insight: "Good supply. Risk of graduate unemployment if demand lags.",
    action: "Track graduate employment; Verify HND coding.",
    quality_rating: 4,
    category: "Human Capital"
  },
  // --- Row 4: Innovation ---
  {
    id: "6.2.7",
    title: "Scientific Journal Articles",
    score_2025: 32.91,
    trend_direction: "up",
    trend_value: "+8.6",
    status: "good",
    insight: "Strong growth in output (UBD/UTB). High quantity, need commercial impact.",
    action: "Focus on citations & commercialization.",
    quality_rating: 4,
    category: "Innovation"
  },
  {
    id: "6.1.4",
    title: "Researchers (FTE)",
    score_2025: 4.82,
    trend_direction: "neutral",
    trend_value: "New",
    status: "critical",
    insight: "Extremely low density. Faculty teaching loads reduce FTE count.",
    action: "Recruit Post-Docs; Fix research hour reporting.",
    quality_rating: 3,
    category: "Innovation"
  },
  {
    id: "6.2.4",
    title: "High-Value Exports",
    score_2025: 1.53,
    trend_direction: "down",
    trend_value: "-0.7",
    status: "critical",
    insight: "Oil/Gas doesn't count. Manufacturing base is weak.",
    action: "Diversify into downstream derivatives.",
    quality_rating: 4,
    category: "Innovation"
  },
  // --- Row 5: Intangibles & Summary ---
  {
    id: "6.1.2",
    title: "Soft Skills",
    score_2025: 57.13,
    trend_direction: "neutral",
    trend_value: "New",
    status: "warning",
    insight: "Rank 60. Graduates technically qualified but lack adaptability.",
    action: "Embed 'Adaptive Skills' in TVET curriculum.",
    quality_rating: 3,
    category: "Intangibles"
  },
  {
    id: "6.2.3",
    title: "IP Receipts",
    score_2025: 0.00,
    trend_direction: "neutral",
    trend_value: "New",
    status: "critical",
    insight: "We buy technology, we do not sell it. Zero IP income.",
    action: "Patent Filing Incentives; University TTOs.",
    quality_rating: 4,
    category: "Intangibles"
  },
  {
    id: "SUMMARY",
    title: "Investment Required",
    score_2025: "$1.26B",
    trend_direction: "neutral",
    trend_value: "10 Yr Plan",
    status: "neutral",
    insight: "Total ask for 10-year transformation plan.",
    action: "Focus: AI Strategy ($500M), Digital Infra ($200M).",
    quality_rating: 5,
    category: "Summary"
  }
];
