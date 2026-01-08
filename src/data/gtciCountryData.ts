// GTCI 2025 Country Data for Comparison
// Source: Global Talent Competitiveness Index 2025

export interface CountryPillarScores {
  country: string;
  region: string;
  incomeGroup: string;
  overallScore: number;
  overallRank: number;
  pillars: {
    enable: number;
    attract: number;
    grow: number;
    retain: number;
    vocationalTechnical: number;
    generalistAdaptive: number;
  };
}

// GTCI 2025 data for comparison countries (ASEAN + Key Global Benchmarks)
export const gtciCountryData: CountryPillarScores[] = [
  // ASEAN Countries
  {
    country: "Singapore",
    region: "Southeast Asia",
    incomeGroup: "High Income",
    overallScore: 79.46,
    overallRank: 2,
    pillars: {
      enable: 85.32,
      attract: 81.45,
      grow: 78.21,
      retain: 82.15,
      vocationalTechnical: 75.88,
      generalistAdaptive: 73.76,
    },
  },
  {
    country: "Malaysia",
    region: "Southeast Asia",
    incomeGroup: "Upper Middle Income",
    overallScore: 54.83,
    overallRank: 32,
    pillars: {
      enable: 58.42,
      attract: 52.18,
      grow: 55.67,
      retain: 58.34,
      vocationalTechnical: 51.23,
      generalistAdaptive: 53.14,
    },
  },
  {
    country: "Brunei",
    region: "Southeast Asia",
    incomeGroup: "High Income",
    overallScore: 51.48,
    overallRank: 43,
    pillars: {
      enable: 56.30,
      attract: 56.08,
      grow: 47.95,
      retain: 65.49,
      vocationalTechnical: 54.15,
      generalistAdaptive: 28.98,
    },
  },
  {
    country: "Thailand",
    region: "Southeast Asia",
    incomeGroup: "Upper Middle Income",
    overallScore: 43.28,
    overallRank: 66,
    pillars: {
      enable: 45.12,
      attract: 38.45,
      grow: 44.78,
      retain: 52.34,
      vocationalTechnical: 42.56,
      generalistAdaptive: 36.43,
    },
  },
  {
    country: "Philippines",
    region: "Southeast Asia",
    incomeGroup: "Lower Middle Income",
    overallScore: 40.15,
    overallRank: 72,
    pillars: {
      enable: 38.76,
      attract: 35.23,
      grow: 42.89,
      retain: 48.12,
      vocationalTechnical: 39.45,
      generalistAdaptive: 36.45,
    },
  },
  {
    country: "Vietnam",
    region: "Southeast Asia",
    incomeGroup: "Lower Middle Income",
    overallScore: 39.87,
    overallRank: 75,
    pillars: {
      enable: 42.34,
      attract: 33.67,
      grow: 43.21,
      retain: 45.89,
      vocationalTechnical: 38.12,
      generalistAdaptive: 35.99,
    },
  },
  {
    country: "Indonesia",
    region: "Southeast Asia",
    incomeGroup: "Upper Middle Income",
    overallScore: 38.54,
    overallRank: 81,
    pillars: {
      enable: 40.23,
      attract: 32.45,
      grow: 40.67,
      retain: 46.78,
      vocationalTechnical: 36.89,
      generalistAdaptive: 34.22,
    },
  },
  {
    country: "Cambodia",
    region: "Southeast Asia",
    incomeGroup: "Lower Middle Income",
    overallScore: 28.43,
    overallRank: 112,
    pillars: {
      enable: 30.12,
      attract: 25.67,
      grow: 28.45,
      retain: 32.56,
      vocationalTechnical: 26.78,
      generalistAdaptive: 27.00,
    },
  },
  // Global Benchmarks
  {
    country: "Switzerland",
    region: "Europe",
    incomeGroup: "High Income",
    overallScore: 81.24,
    overallRank: 1,
    pillars: {
      enable: 82.45,
      attract: 84.32,
      grow: 80.12,
      retain: 83.56,
      vocationalTechnical: 78.34,
      generalistAdaptive: 78.65,
    },
  },
  {
    country: "United States",
    region: "North America",
    incomeGroup: "High Income",
    overallScore: 76.89,
    overallRank: 3,
    pillars: {
      enable: 75.23,
      attract: 78.45,
      grow: 76.89,
      retain: 74.12,
      vocationalTechnical: 72.56,
      generalistAdaptive: 84.09,
    },
  },
  {
    country: "Denmark",
    region: "Europe",
    incomeGroup: "High Income",
    overallScore: 75.67,
    overallRank: 4,
    pillars: {
      enable: 78.12,
      attract: 76.34,
      grow: 74.56,
      retain: 79.23,
      vocationalTechnical: 73.45,
      generalistAdaptive: 72.32,
    },
  },
  {
    country: "United Kingdom",
    region: "Europe",
    incomeGroup: "High Income",
    overallScore: 72.34,
    overallRank: 8,
    pillars: {
      enable: 70.56,
      attract: 74.12,
      grow: 72.89,
      retain: 71.45,
      vocationalTechnical: 70.23,
      generalistAdaptive: 74.79,
    },
  },
  {
    country: "Australia",
    region: "Oceania",
    incomeGroup: "High Income",
    overallScore: 71.23,
    overallRank: 10,
    pillars: {
      enable: 72.45,
      attract: 73.89,
      grow: 70.12,
      retain: 72.34,
      vocationalTechnical: 68.56,
      generalistAdaptive: 70.02,
    },
  },
  {
    country: "Japan",
    region: "East Asia",
    incomeGroup: "High Income",
    overallScore: 65.78,
    overallRank: 18,
    pillars: {
      enable: 68.34,
      attract: 58.12,
      grow: 68.45,
      retain: 72.56,
      vocationalTechnical: 66.78,
      generalistAdaptive: 60.43,
    },
  },
  {
    country: "South Korea",
    region: "East Asia",
    incomeGroup: "High Income",
    overallScore: 63.45,
    overallRank: 22,
    pillars: {
      enable: 65.12,
      attract: 55.34,
      grow: 66.78,
      retain: 68.23,
      vocationalTechnical: 64.56,
      generalistAdaptive: 60.67,
    },
  },
  {
    country: "United Arab Emirates",
    region: "Middle East",
    incomeGroup: "High Income",
    overallScore: 61.23,
    overallRank: 25,
    pillars: {
      enable: 68.45,
      attract: 70.12,
      grow: 52.34,
      retain: 58.67,
      vocationalTechnical: 55.23,
      generalistAdaptive: 62.57,
    },
  },
  {
    country: "China",
    region: "East Asia",
    incomeGroup: "Upper Middle Income",
    overallScore: 48.56,
    overallRank: 47,
    pillars: {
      enable: 52.34,
      attract: 38.45,
      grow: 54.67,
      retain: 52.12,
      vocationalTechnical: 48.89,
      generalistAdaptive: 44.89,
    },
  },
  {
    country: "India",
    region: "South Asia",
    incomeGroup: "Lower Middle Income",
    overallScore: 40.23,
    overallRank: 71,
    pillars: {
      enable: 42.56,
      attract: 32.78,
      grow: 44.12,
      retain: 38.45,
      vocationalTechnical: 40.23,
      generalistAdaptive: 43.24,
    },
  },
];

// Get all available country names for autocomplete
export const availableCountries = gtciCountryData.map(c => c.country);

// Pillar display names and colors
export const pillarConfig = {
  enable: { name: "Enable", color: "hsl(210, 80%, 50%)" },
  attract: { name: "Attract", color: "hsl(160, 60%, 45%)" },
  grow: { name: "Grow", color: "hsl(45, 80%, 50%)" },
  retain: { name: "Retain", color: "hsl(280, 60%, 55%)" },
  vocationalTechnical: { name: "VT Skills", color: "hsl(340, 65%, 55%)" },
  generalistAdaptive: { name: "GA Skills", color: "hsl(200, 70%, 50%)" },
};

// Helper to find country data
export function getCountryData(countryName: string): CountryPillarScores | undefined {
  return gtciCountryData.find(
    c => c.country.toLowerCase() === countryName.toLowerCase()
  );
}

// Helper to search countries (for autocomplete)
export function searchCountries(query: string): CountryPillarScores[] {
  if (!query) return gtciCountryData;
  const lowerQuery = query.toLowerCase();
  return gtciCountryData.filter(c => 
    c.country.toLowerCase().includes(lowerQuery) ||
    c.region.toLowerCase().includes(lowerQuery)
  );
}
