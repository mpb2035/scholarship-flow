export interface BentoIndicator {
  id: string;
  title: string;
  score_2025: string | number;
  score_2023?: string | number;
  trend_direction: 'up' | 'down' | 'neutral';
  trend_value: string;
  status: 'critical' | 'warning' | 'alert' | 'good' | 'star' | 'neutral';
  insight: string;
  action: string;
  quality_rating: number;
  category: string;
  pillar?: string;
  owner?: string;
  definition?: string;
  dataSource?: string;
  dataAge?: string;
  reliabilityAssessment?: string;
  validationStatus?: string;
  strategicRecommendation?: string;
  policyNotes?: string[];
}

export interface NationalStats {
  rank_2023: number;
  rank_2025: number;
  score_2023: number;
  score_2025: number;
  rank_change: number;
  score_change: number;
}

export const initialNationalStats: NationalStats = {
  rank_2023: 41,
  rank_2025: 43,
  score_2023: 52.3,
  score_2025: 51.48,
  rank_change: -2,
  score_change: -0.82
};

export const initialDashboardTitle = "GTCI 2025 Pillar 6: Global Knowledge Skills (Brunei)";

export const initialIndicators: BentoIndicator[] = [
  // --- Row 1: Digital Production ---
  {
    id: "6.2.5",
    title: "Software Development",
    score_2025: 3.02,
    score_2023: 59.2,
    trend_direction: "down",
    trend_value: "-56.2",
    status: "critical",
    insight: "Massive decline due to methodology change (GitHub). Reflects low open-source culture.",
    action: "Create Government Open Source Centers; Tax incentives for public GitHub repos.",
    quality_rating: 4,
    category: "Digital Production",
    pillar: "Talent Impact",
    owner: "AITI",
    definition: "GitHub commits/pushes received and sent per million population (15-69 years). Measures active open-source development engagement on publicly-available GitHub projects.",
    dataSource: "Global Innovation Index (WIPO), GitHub, UN Population Division",
    dataAge: "2024 (Current)",
    reliabilityAssessment: "HIGH - Real-time GitHub data",
    validationStatus: "Methodology changed 2025, not directly comparable to 2023",
    strategicRecommendation: "ESTABLISH OPEN-SOURCE DEVELOPMENT ECOSYSTEM: (1) Create government-funded Open Source Centers linked to UBD/UTB; (2) Tax incentives for companies using public GitHub repos; (3) Scholarships for competitive developers (GitHub, Kaggle, HackerRank); (4) Partnerships with Google/Microsoft for developer certification; (5) National Software Dev Registry. Budget: $500K-$1M annually. Target: Top 50 globally within 5 years.",
    policyNotes: []
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
    category: "Digital Production",
    pillar: "Talent Impact",
    owner: "Ministry of Finance",
    definition: "Telecommunications, computer and information services exports as % of total trade. Includes telecom, software development, IT consulting, data processing services.",
    dataSource: "WTO Trade in Commercial Services Database, OECD, UN Comtrade",
    dataAge: "2023 (2-year lag)",
    reliabilityAssessment: "HIGH - WTO/OECD official data",
    validationStatus: "Reliable indicator of services sector weakness",
    strategicRecommendation: "BUILD ICT SERVICES EXPORT CAPACITY: (1) Software Development SEZ with tax holidays (5-10 years), subsidized office space, fast-track work permits; (2) Partner with Indian IT firms (Infosys, TCS) for nearshoring; (3) Develop services: BPO, Sharia fintech, cybersecurity, digital transformation consulting. TARGET: Increase from 2.44% to 8-10% within 7 years. Budget: $100M over 7 years.",
    policyNotes: []
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
    category: "Digital Production",
    pillar: "Talent Impact",
    owner: "AITI",
    definition: "Global downloads of mobile apps per billion PPP GDP (2-year average). Measures mobile app development capacity and global reach.",
    dataSource: "Global Innovation Index Database (WIPO), data.ia (Sensor Tower Company), IMF",
    dataAge: "2024 (Current)",
    reliabilityAssessment: "MEDIUM - Data.ia proprietary model",
    validationStatus: "Reliability limited by app store data quality",
    strategicRecommendation: "BUILD MOBILE APP DEVELOPMENT ECOSYSTEM: (1) App Dev Bootcamp (12-week intensive, 200/year); (2) App Dev Hub with subsidized cloud credits; (3) $20M App Dev Fund; (4) Priority categories: Islamic apps, government services, tourism; (5) Market expansion strategy (Malaysia, Singapore, Indonesia). TARGET: 1,000 app developers by 2030. Budget: $30M over 5 years.",
    policyNotes: []
  },
  // --- Row 2: Data Anomalies ---
  {
    id: "6.1.6",
    title: "Digital Skills",
    score_2025: 100.00,
    score_2023: 100,
    trend_direction: "neutral",
    trend_value: "Suspicious",
    status: "alert",
    insight: "Score of 100 is a data artifact (missing survey data). Real score likely ~15-25%.",
    action: "URGENT: Commission independent Digital Skills Census with ITU.",
    quality_rating: 2,
    category: "Data Anomalies",
    pillar: "High-Level Skills",
    owner: "MTIC",
    definition: "Individuals with advanced ICT skills (percentage of population). Definition: Population aged 15+ who wrote computer program using specialized programming language within last 3 months.",
    dataSource: "International Telecommunication Union (ITU DataHub)",
    dataAge: "2023 (2-year lag)",
    reliabilityAssessment: "LOW - Likely missing data",
    validationStatus: "CRITICAL: 100 score inconsistent with other digital indicators",
    strategicRecommendation: "URGENT: Commission National Digital Skills Census & Validation Study (0-6 months). Then: (1) Expand programming curriculum in schools; (2) Code Bootcamp Program; (3) 'Digital Natives Initiative': 15,000+ youth annually free training; (4) Programming Certificate Program. Target: Increase actual programmer population from ~2-3% to 15% within 5 years. Budget: $50M over 5 years.",
    policyNotes: []
  },
  {
    id: "6.2.6",
    title: "New Business Density",
    score_2025: 0.00,
    score_2023: 5.33,
    trend_direction: "down",
    trend_value: "-5.3",
    status: "alert",
    insight: "Zero score because MSMEs are Sole Proprietorships, not LLCs. Reporting failure.",
    action: "Mandate World Bank submission; Incentivize Sdn Bhd conversion.",
    quality_rating: 2,
    category: "Data Anomalies",
    pillar: "Talent Impact",
    owner: "DARe / BEBD",
    definition: "New corporate registrations per 1,000 working-age population per calendar year. Counts newly registered firms with limited liability.",
    dataSource: "World Bank Entrepreneurship Database",
    dataAge: "2022 (3-year lag)",
    reliabilityAssessment: "LOW - Missing data likely",
    validationStatus: "CRITICAL: Zero score contradicts actual business environment",
    strategicRecommendation: "BUILD ENTREPRENEURIAL ECOSYSTEM: (1) One-stop online business registration portal (reduce 14 days to 2 days); (2) '1000 SMEs Initiative' with $25K-$100K seed capital by sector; (3) Business Incubation Centers in all 4 districts; (4) Mandatory World Bank database submission. Budget: $5M annually. Target: 500 new businesses/year within 5 years.",
    policyNotes: []
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
    category: "Data Anomalies",
    pillar: "High-Level Skills",
    owner: "AITI",
    definition: "AI talent concentration: Ratio of LinkedIn members with AI skills/AI job titles to total LinkedIn members. Reflects country's AI ecosystem maturity.",
    dataSource: "OECD.AI Policy Observatory, LinkedIn Data",
    dataAge: "2024 (Limited coverage)",
    reliabilityAssessment: "LOW - Brunei likely not in sample",
    validationStatus: "No data available; LinkedIn penetration limited",
    strategicRecommendation: "CRITICAL INITIATIVE: Build Brunei AI Talent Development Strategy (2025-2035). Phase 1: Establish National AI Strategy Office; invest $20M in AI Research Center at UBD; 500 AI scholars annually. Phase 2: AI Innovation Hub; $100M Venture Fund. Phase 3: Integrate AI into government services. TARGET: 5,000+ AI professionals by 2035. Budget: $500M over 10 years.",
    policyNotes: []
  },
  // --- Row 3: Human Capital ---
  {
    id: "6.1.3",
    title: "Professionals",
    score_2025: 33.81,
    score_2023: 34.51,
    trend_direction: "down",
    trend_value: "-0.7",
    status: "good",
    insight: "~34% of workforce. Slight decline suggests brain drain risk.",
    action: "Return to Brunei program; Global Talent Visa.",
    quality_rating: 4,
    category: "Human Capital",
    pillar: "High-Level Skills",
    owner: "Ministry of Education",
    definition: "Professionals as percentage of total workforce. Includes science professionals, engineers, computing, architecture, life sciences, teaching, business/legal professionals.",
    dataSource: "International Labour Organization (ILOSTAT), World Bank Global Jobs Indicators Database",
    dataAge: "2024 (Current)",
    reliabilityAssessment: "HIGH - ILO standardized survey",
    validationStatus: "Slight decline indicates vulnerability",
    strategicRecommendation: "ENHANCE PROFESSIONAL WORKFORCE: (1) Talent Census to track brain drain; competitive salary benchmarking vs Singapore; (2) 'Return to Brunei' program with tax holidays, spousal employment support; (3) Global Talent Visa for specialists (5-year renewable); (4) R&D Scientist Programme with gov funding. Target: Increase professional share from 33.81% to 42% within 5 years. Budget: $50M over 5 years.",
    policyNotes: []
  },
  {
    id: "6.1.5",
    title: "Senior Officials & Managers",
    score_2025: 45.11,
    score_2023: 38.1,
    trend_direction: "up",
    trend_value: "+7.0",
    status: "star",
    insight: "Strongest indicator (Top 11% globally). Public sector heavy.",
    action: "Develop private sector middle-management.",
    quality_rating: 4,
    category: "Human Capital",
    pillar: "High-Level Skills",
    owner: "MMP",
    definition: "Legislators, senior officials, and managers as percentage of total employment. Classification: ISCO Revision 2008.",
    dataSource: "International Labour Organization (ILOSTAT), World Bank Global Jobs Indicators Database",
    dataAge: "2024 (Current)",
    reliabilityAssessment: "HIGH - ILO official data",
    validationStatus: "Brunei's strongest indicator; reliable",
    strategicRecommendation: "LEVERAGE MANAGEMENT STRENGTH FOR BROADER TALENT DEVELOPMENT: (1) Establish Management Development Institute providing executive education programs; (2) Leadership pipeline for private sector; (3) Export management consulting services (regional advantage); (4) Management training for SMEs; (5) Women in management development program.",
    policyNotes: []
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
    category: "Human Capital",
    pillar: "High-Level Skills",
    owner: "MoE",
    definition: "Labour force with tertiary education as percentage of total labour force. Definition: Highest educational attainment at tertiary level (ISCED 2011 levels 5-8).",
    dataSource: "International Labour Organization (ILOSTAT)",
    dataAge: "2024 (Current)",
    reliabilityAssessment: "HIGH - ILO official data",
    validationStatus: "Reliable education statistics",
    strategicRecommendation: "ENHANCE TERTIARY EDUCATION QUALITY & RELEVANCE: (1) Improve university rankings (target top-350 by 2030); (2) Expand specialized/technical tertiary offerings; (3) Industry-relevant curriculum development; (4) Improve graduate employment rates; (5) Partner with top universities for dual-degree programs.",
    policyNotes: []
  },
  // --- Row 4: Innovation ---
  {
    id: "6.2.7",
    title: "Scientific Journal Articles",
    score_2025: 32.91,
    score_2023: 24.29,
    trend_direction: "up",
    trend_value: "+8.6",
    status: "good",
    insight: "Strong growth in output (UBD/UTB). High quantity, need commercial impact.",
    action: "Focus on citations & commercialization.",
    quality_rating: 4,
    category: "Innovation",
    pillar: "Talent Impact",
    owner: "UBD/UTB",
    definition: "Scientific and technical journal articles per 10,000 inhabitants. Covers physics, biology, chemistry, mathematics, clinical medicine, biomedical research, engineering, technology, earth & space sciences.",
    dataSource: "World Bank Development Indicators, National Science Foundation (NSF)",
    dataAge: "2022 (3-year lag)",
    reliabilityAssessment: "HIGH - NSF/Scopus indexed data",
    validationStatus: "Positive trend confirmed; reliable measurement",
    strategicRecommendation: "EXPAND RESEARCH OUTPUT & SCIENTIFIC PUBLICATION EXCELLENCE: (1) Increase UBD research budget to $50M annually; (2) Establish 10 research centers; (3) Publication Fund (reimburse 50% open-access fees); (4) Partnerships with Singapore, Malaysia, Australia, UK universities; (5) Industry-university research linkages. Target: 50 publications/10,000 inhabitants by 2030. Budget: $50M annually.",
    policyNotes: []
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
    category: "Innovation",
    pillar: "High-Level Skills",
    owner: "UBD/UTB",
    definition: "Researchers (full-time equivalent) per million population. Definition: Professionals engaged in conception/creation of new knowledge.",
    dataSource: "Global Innovation Index (WIPO), UNESCO UIS, Eurostat, OECD MSTI",
    dataAge: "2023 (2-year lag)",
    reliabilityAssessment: "MEDIUM - UNESCO/ILO data",
    validationStatus: "Limited by small research base",
    strategicRecommendation: "BUILD RESEARCH TALENT & INFRASTRUCTURE: (1) Recruit international researchers with competitive packages; (2) Establish researcher career progression; (3) Research grants ($50K-$500K) for priority areas; (4) Sabbatical programs for professional development; (5) Target: Increase to 50-100 researchers per million by 2030 (~300 total). Budget: $20M annually.",
    policyNotes: []
  },
  {
    id: "6.2.4",
    title: "High-Value Exports",
    score_2025: 1.53,
    score_2023: 2.24,
    trend_direction: "down",
    trend_value: "-0.7",
    status: "critical",
    insight: "Oil/Gas doesn't count. Manufacturing base is weak.",
    action: "Diversify into downstream derivatives.",
    quality_rating: 4,
    category: "Innovation",
    pillar: "Talent Impact",
    owner: "Ministry of Finance",
    definition: "High-technology exports as percentage of manufactured exports. High-value = R&D-intensive products (computers, pharmaceuticals, scientific instruments, electrical machinery).",
    dataSource: "World Bank Development Indicators, UN Comtrade, WTO-OECD Trade Services Database",
    dataAge: "2023 (2-year lag)",
    reliabilityAssessment: "HIGH - UN Comtrade trade data",
    validationStatus: "Reliable but reveals commodity dependency",
    strategicRecommendation: "CRITICAL: DIVERSIFY EXPORT PORTFOLIO BEYOND OIL/GAS. Phase 1: Export Development Task Force; identify opportunities in halal products, petrochemicals, ICT services. Phase 2: Special Economic Zones with tax incentives; R&D tax credits (40%); $50M for infrastructure. Phase 3: Scale high-value exports from 1.53% to 15%+ within 7 years. Budget: $100M+ over 7 years.",
    policyNotes: []
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
    category: "Intangibles",
    pillar: "High-Level Skills",
    owner: "Ministry of Education",
    definition: "Survey-based assessment of workforce soft skills. Measures: Creativity & problem-solving, Management skills, Self-efficacy, Working with others (scale 1-7).",
    dataSource: "World Economic Forum Executive Opinion Survey (EOS)",
    dataAge: "2024 (Current)",
    reliabilityAssessment: "MEDIUM - Survey-based perception",
    validationStatus: "Potential respondent bias toward large companies",
    strategicRecommendation: "SYSTEMATIC SOFT SKILLS DEVELOPMENT: (1) Mandate curriculum in ALL secondary schools; (2) National Training Fund; (3) 'Brunei Soft Skills Standard' benchmark; (4) Subsidized workshops for SMEs; (5) Soft Skills Certification Board (tiered: Bronze→Silver→Gold); (6) Mobile app for microlearning. Target: Increase to 70+ within 3 years. Budget: $30M over 3 years.",
    policyNotes: []
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
    category: "Intangibles",
    pillar: "Talent Impact",
    owner: "BruIPO",
    definition: "Charges for use of intellectual property (receipts as % of total trade, 3-year average). Includes IP licensing fees, patent royalties, trademark licensing income.",
    dataSource: "World Trade Organization (WTO), OECD, UN Comtrade, IMF Balance of Payments",
    dataAge: "2023 (2-year lag)",
    reliabilityAssessment: "HIGH - IMF/WTO trade data",
    validationStatus: "Accurate reflection of zero commercial IP value",
    strategicRecommendation: "BUILD IP COMMERCIALIZATION CAPABILITY: (1) Patent Filing Incentive (government subsidizes 50% of fees); (2) Improve Patent Database & IP Office capacity; (3) University-Industry IP Partnership Offices; (4) IP Licensing Marketplace; (5) Tax incentives for IP licensing; (6) Priority sectors: Halal innovation, renewable energy, smart city solutions. Target: $5M annual IP receipts by year 10. Budget: $50M over 10 years.",
    policyNotes: []
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
    category: "Summary",
    pillar: "Strategic Planning",
    owner: "Ministry of Finance",
    definition: "Total estimated investment required for comprehensive talent development and digital transformation across all indicators.",
    dataSource: "Internal Analysis",
    dataAge: "2025 (Current)",
    reliabilityAssessment: "HIGH - Based on indicator analysis",
    validationStatus: "Strategic planning document",
    strategicRecommendation: "COMPREHENSIVE 10-YEAR TRANSFORMATION PLAN: Focus areas include AI Strategy ($500M), Digital Infrastructure ($200M), Education & Skills ($300M), R&D Investment ($150M), Entrepreneurship Support ($100M). Requires coordinated multi-ministry implementation with clear KPIs and annual progress reviews.",
    policyNotes: []
  }
];
