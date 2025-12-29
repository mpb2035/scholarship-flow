import { useState, useEffect } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BentoCard } from '@/components/playground/BentoCard';
import { BentoIndicator, initialIndicators, initialDashboardTitle } from '@/data/playgroundData';

const STORAGE_KEY = 'playground_data';

export default function Playground() {
  const [title, setTitle] = useState(initialDashboardTitle);
  const [indicators, setIndicators] = useState<BentoIndicator[]>(initialIndicators);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Load from session storage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTitle(parsed.title || initialDashboardTitle);
        setIndicators(parsed.indicators || initialIndicators);
      } catch {
        // Use defaults if parsing fails
      }
    }
  }, []);

  // Save to session storage on changes
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ title, indicators }));
  }, [title, indicators]);

  const handleUpdateIndicator = (index: number, updated: BentoIndicator) => {
    setIndicators(prev => prev.map((item, i) => i === index ? updated : item));
  };

  const handleDeleteIndicator = (index: number) => {
    setIndicators(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddNew = () => {
    const newIndicator: BentoIndicator = {
      id: `NEW-${Date.now().toString(36).toUpperCase()}`,
      title: 'New Indicator',
      score_2025: 0,
      trend_direction: 'neutral',
      trend_value: 'N/A',
      status: 'neutral',
      insight: 'Click to edit this insight...',
      action: 'Click to add strategic action...',
      quality_rating: 3,
      category: 'Custom'
    };
    setIndicators(prev => [...prev, newIndicator]);
  };

  const handleReset = () => {
    setTitle(initialDashboardTitle);
    setIndicators(initialIndicators);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {isEditingTitle ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
              autoFocus
              className="text-2xl md:text-3xl font-display font-bold h-auto py-2"
            />
          ) : (
            <h1
              onClick={() => setIsEditingTitle(true)}
              className="text-2xl md:text-3xl font-display font-bold text-foreground cursor-pointer hover:text-primary transition-colors"
            >
              🍱 {title}
            </h1>
          )}
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Reset
            </Button>
            <Button size="sm" onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add Card
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground mt-2">
          Click any field to edit. Changes are saved during your session.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {indicators.map((indicator, index) => (
          <BentoCard
            key={`${indicator.id}-${index}`}
            indicator={indicator}
            onUpdate={(updated) => handleUpdateIndicator(index, updated)}
            onDelete={() => handleDeleteIndicator(index)}
          />
        ))}
      </div>

      {/* Empty State */}
      {indicators.length === 0 && (
        <div className="max-w-7xl mx-auto text-center py-16">
          <p className="text-muted-foreground mb-4">No scorecards yet. Add your first one!</p>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Card
          </Button>
        </div>
      )}
    </div>
  );
}
