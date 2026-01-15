import type { GTCIStrategicAnalysis } from '@/types/gtciAnalysis';

export const defaultGTCIStrategicAnalysis: GTCIStrategicAnalysis = {
  document_title: 'GTCI Strategic Analysis - Brunei Darussalam 2026-2030',
  executive_summary: {
    currentRank: 41,
    currentScore: 55.0,
    regionalRank: '4th in ASEAN (after Singapore #1, Malaysia #24, Thailand #36)',
    strategicTarget: 'GTCI Rank 35 by 2030 (from current 41) through systematic data improvement + policy gaps closure'
  },
  pillar_performance: [
    { pillar: 'Enable Talent', score: 56.3, rank: 43, status: 'Moderate' },
    { pillar: 'Attract Talent', score: 56.08, rank: 46, status: 'Weak' },
    { pillar: 'Grow Talent', score: 39.88, rank: 55, status: 'CRITICAL' },
    { pillar: 'Retain Talent', score: 65.49, rank: 39, status: 'Strong' },
    { pillar: 'Vocational/Technical Skills', score: 62.18, rank: 33, status: 'Competitive' },
    { pillar: 'Generalist Adaptive Skills', score: 28.98, rank: 50, status: 'CRITICAL' }
  ],
  data_gap_indicators: [
    { indicator: 'Enterprise Software Adoption (1.3.5)', currentStatus: 'n/a', impact: 'Rank 70+', dataSource: 'WEF EOS' },
    { indicator: 'Cloud Computing (1.3.6)', currentStatus: 'n/a', impact: 'Rank 70+', dataSource: 'WEF EOS' },
    { indicator: 'Firms with Website (1.3.7)', currentStatus: 'n/a', impact: 'Rank 50+', dataSource: 'WEF EOS' },
    { indicator: 'Finding Skilled Employees (5.2.1)', currentStatus: 'n/a', impact: 'Rank 60+', dataSource: 'WEF EOS' },
    { indicator: 'Education-Job Relevance (5.2.2)', currentStatus: 'n/a', impact: 'Rank 50+', dataSource: 'WEF EOS' },
    { indicator: 'Skills Matching (5.2.3)', currentStatus: 'n/a', impact: 'Rank 55+', dataSource: 'WEF EOS' },
    { indicator: 'Professional Management (1.3.3)', currentStatus: 'Weak', impact: 'Rank 45', dataSource: 'WEF EOS' },
    { indicator: 'Labour-Employer Cooperation (1.3.2)', currentStatus: 'Weak', impact: 'Rank 50', dataSource: 'WEF EOS' }
  ],
  wef_participation_steps: [
    { source: 'Brunei Chamber of Commerce', targetCount: '40', contact: 'Direct outreach to member firms', timeline: 'Jan 2026' },
    { source: 'Large Firms (oil/gas, finance, construction)', targetCount: '60', contact: 'CEO + HR director each', timeline: 'Jan 2026' },
    { source: 'SME Chambers + Business Association', targetCount: '80', contact: 'Bulk invitation + incentive', timeline: 'Feb 2026' },
    { source: 'Government-Linked Companies (GLCs)', targetCount: '40', contact: 'Ministry directive + coordination', timeline: 'Feb 2026' },
    { source: 'Educational Institutions (UBD, UPB, JPMC)', targetCount: '20', contact: 'Senior management participation', timeline: 'Feb 2026' }
  ],
  ministry_governance: [
    { thematicGroup: '1. Governance & Institutional Integrity', leadMinistry: 'JPES', coCoordinators: 'MIEA, MoJ', indicators: '6' },
    { thematicGroup: '2. Digital Transformation', leadMinistry: 'MTIC', coCoordinators: 'MoE, JPES', indicators: '13' },
    { thematicGroup: '3. Formal Education', leadMinistry: 'MOHE', coCoordinators: 'MoE, UBD', indicators: '6' },
    { thematicGroup: '4. Research & Intellectual Impact', leadMinistry: 'MOHE', coCoordinators: 'UBD, MTIC, JPES', indicators: '5' },
    { thematicGroup: '5. Economic Vitality', leadMinistry: 'MTIC', coCoordinators: 'MOF, DARe, Brunei-X', indicators: '7' },
    { thematicGroup: '6. Organizational Management', leadMinistry: 'JPES', coCoordinators: 'MPEC, Chambers', indicators: '10' },
    { thematicGroup: '7. Diversity & Social Mobility', leadMinistry: 'JPES', coCoordinators: 'MOHE, MoWA, MIEA', indicators: '11' },
    { thematicGroup: '8. Sustainability & Resilience', leadMinistry: 'JPES', coCoordinators: 'MoH, MOF, Environmental', indicators: '12' },
    { thematicGroup: '9. Workforce Professional Attainment', leadMinistry: 'JPES', coCoordinators: 'MOHE, MTIC', indicators: '7' }
  ],
  funding_model: [
    { component: 'WEF GTCI Membership + EOS', budget: '80,000', source: 'MPEC', responsibility: 'Annual' },
    { component: 'Data Collection (agencies)', budget: '150,000', source: 'Each ministry', responsibility: 'Distributed' },
    { component: 'IT Systems (Dashboard + Reporting)', budget: '200,000', source: 'MTIC', responsibility: 'One-time' },
    { component: 'Communications + Stakeholder Events', budget: '100,000', source: 'MPEC', responsibility: 'Annual' },
    { component: 'TOTAL YEAR 1', budget: '530,000', source: '', responsibility: '2026-2027' },
    { component: 'Ongoing (Year 2+)', budget: '250,000', source: '', responsibility: 'Annual' }
  ],
  indicator_analysis: [
    {
      id: '1',
      indicatorId: '1.1.1',
      indicatorName: 'Government Effectiveness',
      leadAgency: 'JPES / Ministry of Justice & Attorney General',
      dataSource: 'World Bank Governance Indicators',
      currentScore: '74.5 (Rank 12)',
      currentInitiative: 'Digital Government initiatives; E-government portal expansion (2023-2027 MoE plan)',
      dataStrategy: 'WB submits automatically; no Brunei action required. Monitor WB portal for annual updates.',
      gapAnalysis: 'No policy gap. Data maintained. Continue e-government momentum.',
      recommendedAction: 'Accelerate digital service delivery (target: 95% government services online by 2027); publicize progress to WB',
      measurableKPI: '90% of government transactions digital by end-2026',
      timeline: 'Ongoing; monitor WB data (March 2026, 2027)',
      alignment: 'Wawasan Brunei 2035 (Enabling Support System) + Digital Economy Masterplan (Priority 1)',
      thematicGroup: 'Governance & Institutional Integrity'
    },
    {
      id: '2',
      indicatorId: '1.1.2',
      indicatorName: 'Rule of Law',
      leadAgency: 'Ministry of Justice & Attorney General / JPES',
      dataSource: 'World Justice Project Rule of Law Index',
      currentScore: '68.2 (Rank 24)',
      currentInitiative: 'Judicial independence framework; Legal modernization initiatives',
      dataStrategy: 'WJP conducts independent assessment; no direct Brunei submission. Consider legal transparency report to WJP.',
      gapAnalysis: 'Score is moderate. Brunei ranks below regional peers (Singapore 86, Malaysia 59).',
      recommendedAction: 'Publish annual judicial statistics & case disposition times; increase legal transparency reports; engage WJP with country briefing',
      measurableKPI: 'Publish transparent justice sector report by Q2 2026',
      timeline: '2027 WJP Index publication (data collection: 2026)',
      alignment: 'Wawasan Brunei 2035 (Rule of Law pillar)',
      thematicGroup: 'Governance & Institutional Integrity'
    },
    {
      id: '3',
      indicatorId: '1.1.3',
      indicatorName: 'Political Stability',
      leadAgency: 'JPES / Ministry of Interior Affairs & Defence',
      dataSource: 'World Bank Governance Indicators (conflict risk assessments)',
      currentScore: '88.2 (Rank 2 globally)',
      currentInitiative: 'Strong institutional stability; low crime environment maintained through community policing',
      dataStrategy: 'WB processes automatically. Brunei\'s strength evident in data. Continue status quo.',
      gapAnalysis: 'No gap. Brunei is regional & global leader. Maintain this advantage.',
      recommendedAction: 'Maintain security infrastructure; publicize safety metrics in talent attraction campaigns',
      measurableKPI: 'Maintain Rank 1-2 in Political Stability (2027, 2028, 2030 cycles)',
      timeline: 'Annual WB monitoring',
      alignment: 'Wawasan Brunei 2035 (Enabling Support System)',
      fundingNote: 'This is Brunei\'s STRONGEST indicator. Leverage this in international recruitment campaigns.',
      thematicGroup: 'Governance & Institutional Integrity'
    },
    {
      id: '4',
      indicatorId: '1.3.5',
      indicatorName: 'Enterprise Software Adoption',
      leadAgency: 'MTIC / Brunei-X Digital Hub',
      dataSource: 'WEF Executive Opinion Survey',
      currentScore: 'n/a (Brunei not in EOS; imputed ~50, Rank 60+)',
      currentInitiative: 'SME Digital Roadmap (MTIC 2024); E-invoicing mandate for government procurement',
      dataStrategy: 'CRITICAL: WEF EOS participation mandatory. Target 200+ firm responses in Mar-Apr 2026.',
      gapAnalysis: 'Data gap. Actual adoption likely 35-45% (below regional average of 55-60%).',
      recommendedAction: '(1) Participate in WEF EOS (Mar-Apr 2026); (2) Launch SME software adoption incentive (tax deduction for digital investments); (3) Establish Brunei-X "Digital Adoption Center"',
      measurableKPI: '60% SME enterprise software adoption by 2028',
      timeline: 'WEF EOS participation (Mar-Apr 2026); SME program launch (Jun 2026)',
      alignment: 'Digital Economy Masterplan (Priority 2: SME Digitalization) + Wawasan Brunei 2035 (Dynamic Economy)',
      fundingNote: 'Action Item (URGENT): WEF EOS enrollment by Jan 31, 2026',
      thematicGroup: 'Digital Transformation'
    },
    {
      id: '5',
      indicatorId: '3.1.1',
      indicatorName: 'Vocational Enrolment',
      leadAgency: 'MOHE / JPMC',
      dataSource: 'UNESCO Institute for Statistics; MoE annual enrollment statistics',
      currentScore: '75.0 (Rank 9 globally)',
      currentInitiative: 'JPMC enrollment growth (2020-2025); Vocational pathway expansion at secondary level',
      dataStrategy: 'UNESCO UIS collects vocational enrollment data. MOHE submits annually by April 2026 deadline.',
      gapAnalysis: 'No gap. Brunei ranks 9th globally in vocational enrollment—exceptional for a small nation.',
      recommendedAction: 'Maintain current trajectory. Focus on quality: (1) Improve JPMC graduate employment rate (target: 90% by 2027); (2) Strengthen industry partnerships',
      measurableKPI: 'Maintain Rank 1-10 in Vocational Enrolment; 90% JPMC graduate employment by 2027',
      timeline: 'Ongoing monitoring; Quality improvement focus 2026-2027',
      alignment: 'Manpower Blueprint (Aspiration 1: Dynamic Education) + Wawasan 2035',
      fundingNote: 'Strength: This is Brunei\'s competitive advantage. Feature prominently in regional talent attraction campaigns.',
      thematicGroup: 'Formal Education'
    }
  ],
  implementation_roadmap: [
    { priority: 'CRITICAL', action: 'WEF GTCI EOS Enrollment + participation commitment', leadAgency: 'MTIC/MPEC', deadline: 'Jan 31, 2026', budget: 'Contact' },
    { priority: 'CRITICAL', action: 'Designate GTCI Focal Point in each ministry', leadAgency: 'MPEC', deadline: 'Jan 20, 2026', budget: 'N/A' },
    { priority: 'CRITICAL', action: 'Establish MPEC GTCI Steering Committee', leadAgency: 'MPEC', deadline: 'Jan 31, 2026', budget: 'N/A' },
    { priority: 'HIGH', action: 'Data audit: Which 77 indicators have Brunei data?', leadAgency: 'MPEC/All agencies', deadline: 'Feb 15, 2026', budget: '20K' },
    { priority: 'HIGH', action: 'OECD PISA participation enrollment', leadAgency: 'MoE', deadline: 'Feb 15, 2026', budget: 'Contact OECD' },
    { priority: 'HIGH', action: 'Researcher census (baseline count)', leadAgency: 'MOHE', deadline: 'Feb 28, 2026', budget: '30K' },
    { priority: 'HIGH', action: 'WEF EOS respondent recruitment (target: 200)', leadAgency: 'MTIC', deadline: 'Feb 28, 2026', budget: '50K' },
    { priority: 'MEDIUM', action: 'Publish Brunei GTCI baseline strategy document', leadAgency: 'MPEC', deadline: 'Mar 15, 2026', budget: '20K' }
  ],
  expected_outcomes: [
    { metric: 'Overall GTCI Rank', baseline2023: '41', target2027: '38-40', target2030: '35' },
    { metric: 'Overall GTCI Score', baseline2023: '55.0', target2027: '60', target2030: '65' },
    { metric: 'Enable Talent', baseline2023: '56.3', target2027: '62', target2030: '70' },
    { metric: 'Attract Talent', baseline2023: '56.1', target2027: '62', target2030: '70' },
    { metric: 'Grow Talent', baseline2023: '39.9', target2027: '48', target2030: '60' },
    { metric: 'Retain Talent', baseline2023: '65.5', target2027: '72', target2030: '78' },
    { metric: 'Vocational Skills', baseline2023: '62.2', target2027: '68', target2030: '75' },
    { metric: 'Generalist Skills', baseline2023: '29.0', target2027: '40', target2030: '55' }
  ],
  metadata: {
    preparedFor: 'Ministry of Education, Manpower Planning & Employment Council (MPEC), Ministry of Technology, Innovation and Culture (MTIC)',
    preparedBy: 'Strategic National Competitiveness Unit',
    date: 'January 15, 2026',
    classification: 'Government of Brunei Darussalam - Strategic Planning Document'
  }
};
