export interface PillarPerformance {
  pillar: string;
  score: number;
  rank: number;
  status: string;
}

export interface DataGapIndicator {
  indicator: string;
  currentStatus: string;
  impact: string;
  dataSource: string;
}

export interface WEFParticipationStep {
  source: string;
  targetCount: string;
  contact: string;
  timeline: string;
}

export interface MinistryGovernance {
  thematicGroup: string;
  leadMinistry: string;
  coCoordinators: string;
  indicators: string;
}

export interface FundingModelItem {
  component: string;
  budget: string;
  source: string;
  responsibility: string;
}

export interface IndicatorAnalysis {
  id: string;
  indicatorId: string;
  indicatorName: string;
  leadAgency: string;
  dataSource: string;
  currentScore: string;
  currentInitiative: string;
  dataStrategy: string;
  gapAnalysis: string;
  recommendedAction: string;
  measurableKPI: string;
  timeline: string;
  alignment: string;
  fundingNote?: string;
  thematicGroup: string;
}

export interface ImplementationPhase {
  priority: string;
  action: string;
  leadAgency: string;
  deadline: string;
  budget: string;
}

export interface ExpectedOutcome {
  metric: string;
  baseline2023: string;
  target2027: string;
  target2030: string;
}

export interface GTCIStrategicAnalysis {
  id?: string;
  user_id?: string;
  document_title: string;
  executive_summary: {
    currentRank: number;
    currentScore: number;
    regionalRank: string;
    strategicTarget: string;
  };
  pillar_performance: PillarPerformance[];
  data_gap_indicators: DataGapIndicator[];
  wef_participation_steps: WEFParticipationStep[];
  ministry_governance: MinistryGovernance[];
  funding_model: FundingModelItem[];
  indicator_analysis: IndicatorAnalysis[];
  implementation_roadmap: ImplementationPhase[];
  expected_outcomes: ExpectedOutcome[];
  metadata: {
    preparedFor: string;
    preparedBy: string;
    date: string;
    classification: string;
  };
  created_at?: string;
  updated_at?: string;
}
