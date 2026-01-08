import { useState, useMemo } from 'react';
import { X, Plus, Globe, TrendingUp, TrendingDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { gtciCountryData, pillarConfig, CountryPillarScores } from '@/data/gtciCountryData';
import { cn } from '@/lib/utils';

interface CountryComparisonCardProps {
  className?: string;
}

const PILLAR_KEYS = ['enable', 'attract', 'grow', 'retain', 'vocationalTechnical', 'generalistAdaptive'] as const;

export function CountryComparisonCard({ className }: CountryComparisonCardProps) {
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['Brunei', 'Singapore', 'Malaysia']);
  const [isAddingCountry, setIsAddingCountry] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCountryData = useMemo(() => {
    return selectedCountries
      .map(name => gtciCountryData.find(c => c.country === name))
      .filter((c): c is CountryPillarScores => c !== undefined);
  }, [selectedCountries]);

  const availableCountries = useMemo(() => {
    return gtciCountryData.filter(c => !selectedCountries.includes(c.country));
  }, [selectedCountries]);

  const filteredCountries = useMemo(() => {
    if (!searchQuery) return availableCountries;
    const query = searchQuery.toLowerCase();
    return availableCountries.filter(c => 
      c.country.toLowerCase().includes(query) ||
      c.region.toLowerCase().includes(query)
    );
  }, [availableCountries, searchQuery]);

  const addCountry = (country: string) => {
    if (selectedCountries.length < 6 && !selectedCountries.includes(country)) {
      setSelectedCountries([...selectedCountries, country]);
    }
    setIsAddingCountry(false);
    setSearchQuery('');
  };

  const removeCountry = (country: string) => {
    setSelectedCountries(selectedCountries.filter(c => c !== country));
  };

  // Get max value for each pillar for bar scaling
  const maxValues = useMemo(() => {
    const max: Record<string, number> = {};
    PILLAR_KEYS.forEach(key => {
      max[key] = Math.max(...selectedCountryData.map(c => c.pillars[key]), 100);
    });
    return max;
  }, [selectedCountryData]);

  // Country colors for visual distinction
  const countryColors = [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-purple-500',
    'bg-rose-500',
    'bg-cyan-500',
  ];

  return (
    <div className={cn("glass-card p-6 col-span-1 md:col-span-2 lg:col-span-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Globe className="h-6 w-6 text-primary" />
          <div>
            <h3 className="text-lg font-semibold">GTCI 2025 Country Comparison</h3>
            <p className="text-sm text-muted-foreground">Compare pillar scores across countries</p>
          </div>
        </div>
        
        {/* Add Country Button */}
        <Popover open={isAddingCountry} onOpenChange={setIsAddingCountry}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              disabled={selectedCountries.length >= 6}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Country
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0" align="end">
            <Command>
              <CommandInput 
                placeholder="Search countries..." 
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                <CommandEmpty>No countries found.</CommandEmpty>
                <CommandGroup>
                  {filteredCountries.slice(0, 10).map((country) => (
                    <CommandItem
                      key={country.country}
                      onSelect={() => addCountry(country.country)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{country.country}</span>
                        <span className="text-xs text-muted-foreground">
                          #{country.overallRank} • {country.overallScore.toFixed(1)}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Selected Countries Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {selectedCountries.map((country, index) => {
          const data = gtciCountryData.find(c => c.country === country);
          return (
            <Badge 
              key={country} 
              variant="secondary" 
              className={cn(
                "px-3 py-1.5 text-sm flex items-center gap-2",
                countryColors[index % countryColors.length],
                "text-white border-0"
              )}
            >
              <span className="font-medium">{country}</span>
              <span className="text-white/80 text-xs">#{data?.overallRank}</span>
              {selectedCountries.length > 1 && (
                <button
                  onClick={() => removeCountry(country)}
                  className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          );
        })}
        {selectedCountries.length < 6 && (
          <span className="text-xs text-muted-foreground self-center">
            {6 - selectedCountries.length} more can be added
          </span>
        )}
      </div>

      {/* Pillar Comparison Grid */}
      <div className="space-y-4">
        {PILLAR_KEYS.map((pillarKey) => (
          <div key={pillarKey} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: pillarConfig[pillarKey].color }}>
                {pillarConfig[pillarKey].name}
              </span>
            </div>
            
            <div className="space-y-1.5">
              {selectedCountryData.map((country, index) => {
                const score = country.pillars[pillarKey];
                const percentage = (score / maxValues[pillarKey]) * 100;
                
                // Find if this is the highest score
                const isHighest = selectedCountryData.every(c => c.pillars[pillarKey] <= score);
                const isLowest = selectedCountryData.every(c => c.pillars[pillarKey] >= score);
                
                return (
                  <div key={country.country} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-24 truncate">
                      {country.country}
                    </span>
                    <div className="flex-1 h-6 bg-muted/30 rounded-full overflow-hidden relative">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          countryColors[index % countryColors.length]
                        )}
                        style={{ width: `${percentage}%` }}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium">
                        {score.toFixed(1)}
                      </span>
                    </div>
                    {selectedCountryData.length > 1 && (
                      <span className="w-6 flex justify-center">
                        {isHighest && <TrendingUp className="h-4 w-4 text-green-500" />}
                        {isLowest && selectedCountryData.length > 1 && !isHighest && (
                          <TrendingDown className="h-4 w-4 text-red-400" />
                        )}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Overall Score Summary */}
      <div className="mt-6 pt-4 border-t border-border/50">
        <h4 className="text-sm font-semibold mb-3">Overall GTCI Score</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {selectedCountryData.map((country, index) => (
            <div 
              key={country.country}
              className={cn(
                "p-3 rounded-xl text-white text-center",
                countryColors[index % countryColors.length]
              )}
            >
              <div className="text-2xl font-bold">{country.overallScore.toFixed(1)}</div>
              <div className="text-xs text-white/80">#{country.overallRank}</div>
              <div className="text-xs font-medium mt-1 truncate">{country.country}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 text-xs text-muted-foreground">
        <p>Data source: Global Talent Competitiveness Index 2025. Scores are out of 100.</p>
      </div>
    </div>
  );
}
