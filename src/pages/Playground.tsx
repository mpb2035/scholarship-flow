import { useState, useMemo } from 'react';
import { Plus, RotateCcw, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BentoCard } from '@/components/playground/BentoCard';
import { NationalSummaryCard } from '@/components/playground/NationalSummaryCard';
import { SortToolbar, SortCriteria } from '@/components/playground/SortToolbar';
import { PolicyCommentModal } from '@/components/playground/PolicyCommentModal';
import { IndicatorDetailModal } from '@/components/playground/IndicatorDetailModal';
import { BentoIndicator, initialNationalStats } from '@/data/playgroundData';
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
    updateIndicators([...indicators, newIndicator]);
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
  const sortedIndicators = useMemo(() => {
    const items = [...indicators];
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
  }, [indicators, sortCriteria]);
  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>;
  }
  return <div className="min-h-screen p-6 md:p-8 bg-primary-foreground">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {isEditingTitle ? <Input value={title} onChange={e => updateTitle(e.target.value)} onBlur={() => setIsEditingTitle(false)} onKeyDown={e => e.key === 'Enter' && setIsEditingTitle(false)} autoFocus className="text-2xl md:text-3xl font-display font-bold h-auto py-2" /> : <h1 onClick={() => setIsEditingTitle(true)} className="text-2xl md:text-3xl font-display font-bold text-[hsl(210,80%,28%)] cursor-pointer hover:text-[hsl(210,80%,35%)] transition-colors">
              🍱 {title}
            </h1>}
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={reset} className="border-[hsl(210,80%,28%)] text-[hsl(210,80%,28%)]">
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Reset
            </Button>
            <Button size="sm" onClick={handleAddNew} className="bg-[hsl(210,80%,28%)] hover:bg-[hsl(210,80%,35%)]">
              <Plus className="h-4 w-4 mr-1.5" />
              Add Card
            </Button>
            {isAuthenticated && <Button size="sm" onClick={save} disabled={isSaving || !hasUnsavedChanges} variant={hasUnsavedChanges ? 'default' : 'outline'} className={hasUnsavedChanges ? 'bg-[hsl(210,80%,28%)] hover:bg-[hsl(210,80%,35%)]' : ''}>
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

      {/* Sort Toolbar */}
      <div className="max-w-7xl mx-auto">
        <SortToolbar activeCriteria={sortCriteria} onSort={setSortCriteria} />
      </div>

      {/* Bento Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* National Summary Card */}
        <NationalSummaryCard stats={initialNationalStats} onCommentClick={handleCommentClick} />

        {/* Indicator Cards */}
        {sortedIndicators.map((indicator, index) => <BentoCard key={`${indicator.id}-${index}`} indicator={indicator} onUpdate={updated => handleUpdateIndicator(indicators.indexOf(indicator), updated)} onDelete={() => handleDeleteIndicator(indicators.indexOf(indicator))} onCommentClick={handleCommentClick} onDetailClick={() => handleDetailClick(indicator)} />)}
      </div>

      {/* Empty State */}
      {indicators.length === 0 && <div className="max-w-7xl mx-auto text-center py-16">
          <p className="text-muted-foreground mb-4">No scorecards yet. Add your first one!</p>
          <Button onClick={handleAddNew} className="bg-[hsl(210,80%,28%)] hover:bg-[hsl(210,80%,35%)]">
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