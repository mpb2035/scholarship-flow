import { useState, useMemo } from 'react';
import { Plus, RotateCcw, Save, Loader2, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BentoCard } from '@/components/playground/BentoCard';
import { NationalSummaryCard } from '@/components/playground/NationalSummaryCard';
import { SortToolbar, SortCriteria } from '@/components/playground/SortToolbar';
import { PolicyCommentModal } from '@/components/playground/PolicyCommentModal';
import { IndicatorDetailModal } from '@/components/playground/IndicatorDetailModal';
import { ExportButtons } from '@/components/playground/ExportButtons';
import { BentoIndicator, initialNationalStats, PILLAR_OPTIONS } from '@/data/playgroundData';
import { usePlaygroundData } from '@/hooks/usePlaygroundData';
export default function Playground() {
  const {
    title,
    indicators,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    isAuthenticated,
    updateTitle,
    updateIndicators,
    save,
    reset
  } = usePlaygroundData();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>('default');
  const [pillarFilter, setPillarFilter] = useState<string>('all');
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [commentLabel, setCommentLabel] = useState('');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<BentoIndicator | null>(null);
  const handleUpdateIndicator = (index: number, updated: BentoIndicator) => {
    const newIndicators = indicators.map((item, i) => i === index ? updated : item);
    updateIndicators(newIndicators);
  };
  const handleDeleteIndicator = (index: number) => {
    const newIndicators = indicators.filter((_, i) => i !== index);
    updateIndicators(newIndicators);
  };
  const handleAddNew = () => {
    const newIndicator: BentoIndicator = {
      id: `NEW-${Date.now().toString(36).toUpperCase()}`,
      title: 'New Indicator',
      score_2025: 0,
      score_2023: 0,
      trend_direction: 'neutral',
      trend_value: 'N/A',
      status: 'neutral',
      insight: 'Click to edit this insight...',
      action: 'Click to add strategic action...',
      quality_rating: 3,
      category: 'Custom',
      pillar: 'Custom Pillar',
      owner: 'TBD',
      definition: 'Click to add definition and methodology...',
      dataSource: 'TBD',
      dataAge: 'Current',
      reliabilityAssessment: 'MEDIUM',
      validationStatus: 'Pending validation',
      strategicRecommendation: 'Click to add strategic recommendation...',
      policyNotes: []
    };
    // Auto-save when adding a new card (pass true as second argument)
    updateIndicators([...indicators, newIndicator], true);
  };
  const handleCommentClick = (label: string) => {
    setCommentLabel(label);
    setCommentModalOpen(true);
  };
  const handleDetailClick = (indicator: BentoIndicator) => {
    setSelectedIndicator(indicator);
    setDetailModalOpen(true);
  };
  const handleUpdateSelectedIndicator = (updated: BentoIndicator) => {
    const index = indicators.findIndex(i => i.id === updated.id);
    if (index !== -1) {
      handleUpdateIndicator(index, updated);
      setSelectedIndicator(updated);
    }
  };
  const filteredAndSortedIndicators = useMemo(() => {
    let items = [...indicators];
    
    // Apply pillar filter
    if (pillarFilter !== 'all') {
      items = items.filter(item => item.pillar === pillarFilter);
    }
    
    // Apply sorting
    switch (sortCriteria) {
      case 'id':
        return items.sort((a, b) => a.id.localeCompare(b.id));
      case 'change':
        return items.sort((a, b) => {
          const changeA = typeof a.trend_value === 'string' ? parseFloat(a.trend_value) || 0 : a.trend_value;
          const changeB = typeof b.trend_value === 'string' ? parseFloat(b.trend_value) || 0 : b.trend_value;
          return changeA - changeB;
        });
      default:
        return items;
    }
  }, [indicators, sortCriteria, pillarFilter]);
  
  // Get unique pillars that are actually assigned to scorecards
  const availablePillars = useMemo(() => {
    const pillars = new Set<string>();
    indicators.forEach(ind => {
      if (ind.pillar) pillars.add(ind.pillar);
    });
    return Array.from(pillars).sort();
  }, [indicators]);
  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>;
  }
  return <div className="min-h-screen p-6 md:p-8 bg-background">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {isEditingTitle ? <Input value={title} onChange={e => updateTitle(e.target.value)} onBlur={() => setIsEditingTitle(false)} onKeyDown={e => e.key === 'Enter' && setIsEditingTitle(false)} autoFocus className="text-2xl md:text-3xl font-display font-bold h-auto py-2 bg-input border-border/50" /> : <h1 onClick={() => setIsEditingTitle(true)} className="text-2xl md:text-3xl font-display font-bold text-foreground cursor-pointer hover:text-primary transition-colors">
              🍱 {title}
            </h1>}
          
          <div className="flex items-center gap-2">
            <ExportButtons indicators={indicators} title={title} />
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Reset
            </Button>
            <Button size="sm" onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add Card
            </Button>
            {isAuthenticated && <Button size="sm" onClick={save} disabled={isSaving || !hasUnsavedChanges} variant={hasUnsavedChanges ? 'default' : 'outline'}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
                {hasUnsavedChanges ? 'Save' : 'Saved'}
              </Button>}
          </div>
        </div>
        <p className="text-muted-foreground mt-2">
          Click any card to view details and add policy recommendations. 
          {isAuthenticated ? hasUnsavedChanges ? ' You have unsaved changes.' : ' All changes saved.' : ' Sign in to save your changes.'}
        </p>
      </div>

      {/* Filter Bar - Harmonized with Dashboard */}
      <div className="max-w-7xl mx-auto glass-card p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <SortToolbar activeCriteria={sortCriteria} onSort={setSortCriteria} />
          
          {availablePillars.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={pillarFilter} onValueChange={setPillarFilter}>
                <SelectTrigger className="w-[220px] bg-input border-border/50">
                  <SelectValue placeholder="Filter by Pillar" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">
                    All Pillars
                  </SelectItem>
                  {PILLAR_OPTIONS.filter(p => availablePillars.includes(p)).map((pillar) => (
                    <SelectItem key={pillar} value={pillar}>
                      {pillar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {pillarFilter !== 'all' && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setPillarFilter('all')}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Results count */}
          <div className="ml-auto text-sm text-muted-foreground">
            Showing {filteredAndSortedIndicators.length} of {indicators.length} cards
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* National Summary Card */}
        <NationalSummaryCard stats={initialNationalStats} onCommentClick={handleCommentClick} />

        {/* Indicator Cards */}
        {filteredAndSortedIndicators.map((indicator, index) => <BentoCard key={`${indicator.id}-${index}`} indicator={indicator} onUpdate={updated => handleUpdateIndicator(indicators.indexOf(indicator), updated)} onDelete={() => handleDeleteIndicator(indicators.indexOf(indicator))} onCommentClick={handleCommentClick} onDetailClick={() => handleDetailClick(indicator)} />)}
      </div>

      {/* Empty State */}
      {indicators.length === 0 && <div className="max-w-7xl mx-auto text-center py-16">
          <p className="text-muted-foreground mb-4">No scorecards yet. Add your first one!</p>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Card
          </Button>
        </div>}

      {/* Policy Comment Modal */}
      <PolicyCommentModal isOpen={commentModalOpen} onClose={() => setCommentModalOpen(false)} label={commentLabel} />

      {/* Indicator Detail Modal */}
      <IndicatorDetailModal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} indicator={selectedIndicator} onUpdateIndicator={handleUpdateSelectedIndicator} />
    </div>;
}