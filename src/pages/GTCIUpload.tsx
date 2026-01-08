import { useState, useMemo, useCallback } from 'react';
import { Plus, RotateCcw, Save, Loader2, Filter, X, Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BentoCard } from '@/components/playground/BentoCard';
import { NationalSummaryCard } from '@/components/playground/NationalSummaryCard';
import { SortToolbar, SortCriteria } from '@/components/playground/SortToolbar';
import { PolicyCommentModal } from '@/components/playground/PolicyCommentModal';
import { IndicatorDetailModal } from '@/components/playground/IndicatorDetailModal';
import { ExportButtons } from '@/components/playground/ExportButtons';
import { BentoIndicator, NationalStats, PILLAR_OPTIONS } from '@/data/playgroundData';
import { useGTCIUploadData } from '@/hooks/useGTCIUploadData';
import * as XLSX from 'xlsx';

const defaultNationalStats: NationalStats = {
  rank_2023: 0,
  rank_2025: 0,
  score_2023: 0,
  score_2025: 0,
  rank_change: 0,
  score_change: 0
};

export default function GTCIUpload() {
  const {
    title,
    indicators,
    nationalStats,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    isAuthenticated,
    updateTitle,
    updateIndicators,
    updateNationalStats,
    save,
    reset
  } = useGTCIUploadData();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>('default');
  const [pillarFilter, setPillarFilter] = useState<string>('all');
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [commentLabel, setCommentLabel] = useState('');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<BentoIndicator | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const parseExcelFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setUploadError(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      if (jsonData.length < 2) {
        throw new Error('Excel file must have at least a header row and one data row');
      }

      // Find header row (first row with content)
      const headerRow = jsonData[0] as string[];
      const dataRows = jsonData.slice(1).filter(row => row.some(cell => cell !== undefined && cell !== ''));

      // Map column names to indices (flexible matching)
      const columnMap: Record<string, number> = {};
      headerRow.forEach((header, index) => {
        if (header) {
          const normalizedHeader = String(header).toLowerCase().trim();
          columnMap[normalizedHeader] = index;
        }
      });

      // Helper to get cell value with flexible column name matching
      const getCell = (row: any[], ...possibleNames: string[]): any => {
        for (const name of possibleNames) {
          const idx = columnMap[name.toLowerCase()];
          if (idx !== undefined && row[idx] !== undefined) {
            return row[idx];
          }
        }
        return undefined;
      };

      // Parse indicators from Excel
      const parsedIndicators: BentoIndicator[] = dataRows.map((row, index) => {
        const score2025 = getCell(row, 'score_2025', 'score 2025', 'score2025', 'current_score', 'score');
        const score2023 = getCell(row, 'score_2023', 'score 2023', 'score2023', 'previous_score');
        const trendValue = getCell(row, 'trend_value', 'change', 'trend', 'difference');
        
        // Determine trend direction
        let trendDirection: 'up' | 'down' | 'neutral' = 'neutral';
        const numericTrend = parseFloat(String(trendValue)) || 0;
        if (numericTrend > 0) trendDirection = 'up';
        else if (numericTrend < 0) trendDirection = 'down';

        // Determine status based on score
        const numericScore = parseFloat(String(score2025)) || 0;
        let status: BentoIndicator['status'] = 'neutral';
        if (numericScore >= 70) status = 'star';
        else if (numericScore >= 50) status = 'good';
        else if (numericScore >= 30) status = 'warning';
        else if (numericScore > 0) status = 'critical';

        return {
          id: String(getCell(row, 'id', 'indicator_id', 'code') || `IND-${index + 1}`),
          title: String(getCell(row, 'title', 'name', 'indicator', 'indicator_name') || `Indicator ${index + 1}`),
          score_2025: score2025 ?? 0,
          score_2023: score2023,
          trend_direction: trendDirection,
          trend_value: String(trendValue ?? 'N/A'),
          status,
          insight: String(getCell(row, 'insight', 'insights', 'analysis') || ''),
          action: String(getCell(row, 'action', 'recommendation', 'strategic_action') || ''),
          quality_rating: parseInt(String(getCell(row, 'quality_rating', 'quality', 'data_quality') || '3')),
          category: String(getCell(row, 'category', 'group') || 'General'),
          pillar: String(getCell(row, 'pillar', 'pillar_name') || 'Custom Pillar'),
          owner: String(getCell(row, 'owner', 'responsible_party', 'agency') || 'TBD'),
          definition: String(getCell(row, 'definition', 'description', 'methodology') || ''),
          dataSource: String(getCell(row, 'data_source', 'datasource', 'source') || 'TBD'),
          dataAge: String(getCell(row, 'data_age', 'dataage', 'year') || 'Current'),
          reliabilityAssessment: String(getCell(row, 'reliability', 'reliability_assessment') || 'MEDIUM'),
          validationStatus: String(getCell(row, 'validation_status', 'validation') || 'Pending validation'),
          strategicRecommendation: String(getCell(row, 'strategic_recommendation', 'recommendation') || ''),
          policyNotes: []
        };
      });

      if (parsedIndicators.length === 0) {
        throw new Error('No valid indicators found in the Excel file');
      }

      // Try to parse national stats if present in a summary sheet
      let newNationalStats = { ...defaultNationalStats };
      if (workbook.SheetNames.includes('Summary') || workbook.SheetNames.includes('National')) {
        const summarySheet = workbook.Sheets['Summary'] || workbook.Sheets['National'];
        const summaryData = XLSX.utils.sheet_to_json(summarySheet) as any[];
        if (summaryData[0]) {
          newNationalStats = {
            rank_2023: parseInt(summaryData[0].rank_2023 || summaryData[0].previous_rank) || 0,
            rank_2025: parseInt(summaryData[0].rank_2025 || summaryData[0].current_rank) || 0,
            score_2023: parseFloat(summaryData[0].score_2023 || summaryData[0].previous_score) || 0,
            score_2025: parseFloat(summaryData[0].score_2025 || summaryData[0].current_score) || 0,
            rank_change: parseInt(summaryData[0].rank_change) || 0,
            score_change: parseFloat(summaryData[0].score_change) || 0
          };
        }
      }

      // Update state with parsed data
      updateIndicators(parsedIndicators);
      updateNationalStats(newNationalStats);
      updateTitle(`GTCI Analysis - ${file.name.replace(/\.[^/.]+$/, '')}`);

    } catch (error) {
      console.error('Error parsing Excel:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to parse Excel file');
    } finally {
      setIsProcessing(false);
    }
  }, [updateIndicators, updateNationalStats, updateTitle]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
        setUploadError('Please upload an Excel file (.xlsx, .xls) or CSV file');
        return;
      }
      parseExcelFile(file);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.name.match(/\.(xlsx|xls|csv)$/i)) {
      parseExcelFile(file);
    } else {
      setUploadError('Please upload an Excel file (.xlsx, .xls) or CSV file');
    }
  }, [parseExcelFile]);

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

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

  const filteredAndSortedIndicators = useMemo(() => {
    let items = [...indicators];
    
    if (pillarFilter !== 'all') {
      items = items.filter(item => item.pillar === pillarFilter);
    }
    
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
  
  const availablePillars = useMemo(() => {
    const pillars = new Set<string>();
    indicators.forEach(ind => {
      if (ind.pillar) pillars.add(ind.pillar);
    });
    return Array.from(pillars).sort();
  }, [indicators]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8 bg-background">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {isEditingTitle ? (
            <Input
              value={title}
              onChange={e => updateTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={e => e.key === 'Enter' && setIsEditingTitle(false)}
              autoFocus
              className="text-2xl md:text-3xl font-display font-bold h-auto py-2 bg-input border-border/50"
            />
          ) : (
            <h1
              onClick={() => setIsEditingTitle(true)}
              className="text-2xl md:text-3xl font-display font-bold text-foreground cursor-pointer hover:text-primary transition-colors"
            >
              📊 {title}
            </h1>
          )}
          
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
            {isAuthenticated && (
              <Button
                size="sm"
                onClick={save}
                disabled={isSaving || !hasUnsavedChanges}
                variant={hasUnsavedChanges ? 'default' : 'outline'}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1.5" />
                )}
                {hasUnsavedChanges ? 'Save' : 'Saved'}
              </Button>
            )}
          </div>
        </div>
        <p className="text-muted-foreground mt-2">
          Upload an Excel file to create GTCI scorecards. 
          {isAuthenticated 
            ? hasUnsavedChanges ? ' You have unsaved changes.' : ' All changes saved.' 
            : ' Sign in to save your changes.'}
        </p>
      </div>

      {/* Upload Zone */}
      {indicators.length === 0 && (
        <div className="max-w-7xl mx-auto mb-8">
          <div
            className="border-2 border-dashed border-border/50 rounded-xl p-12 text-center bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('excel-upload')?.click()}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Processing Excel file...</p>
              </div>
            ) : (
              <>
                <FileSpreadsheet className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Upload GTCI Excel Data</h3>
                <p className="text-muted-foreground mb-4">
                  Drag and drop an Excel file here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported formats: .xlsx, .xls, .csv
                </p>
              </>
            )}
            <input
              id="excel-upload"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
          
          {uploadError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          {/* Template Info */}
          <div className="mt-6 p-4 glass-card">
            <h4 className="font-semibold mb-2">Excel Template Format</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Your Excel file should have the following columns (headers are flexible):
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <code className="bg-muted px-2 py-1 rounded">id / code</code>
              <code className="bg-muted px-2 py-1 rounded">title / name</code>
              <code className="bg-muted px-2 py-1 rounded">score_2025</code>
              <code className="bg-muted px-2 py-1 rounded">score_2023</code>
              <code className="bg-muted px-2 py-1 rounded">trend_value</code>
              <code className="bg-muted px-2 py-1 rounded">pillar</code>
              <code className="bg-muted px-2 py-1 rounded">owner</code>
              <code className="bg-muted px-2 py-1 rounded">definition</code>
              <code className="bg-muted px-2 py-1 rounded">insight</code>
              <code className="bg-muted px-2 py-1 rounded">action</code>
              <code className="bg-muted px-2 py-1 rounded">data_source</code>
              <code className="bg-muted px-2 py-1 rounded">quality_rating</code>
            </div>
          </div>
        </div>
      )}

      {/* Re-upload button when data exists */}
      {indicators.length > 0 && (
        <div className="max-w-7xl mx-auto mb-6">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload className="h-4 w-4 mr-1.5" />
                Upload New File
              </span>
            </Button>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Filter Bar */}
      {indicators.length > 0 && (
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
                    <SelectItem value="all">All Pillars</SelectItem>
                    {availablePillars.map((pillar) => (
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

            <div className="ml-auto text-sm text-muted-foreground">
              Showing {filteredAndSortedIndicators.length} of {indicators.length} cards
            </div>
          </div>
        </div>
      )}

      {/* Bento Grid */}
      {indicators.length > 0 && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <NationalSummaryCard 
            stats={nationalStats || defaultNationalStats} 
            onCommentClick={handleCommentClick} 
          />

          {filteredAndSortedIndicators.map((indicator, index) => (
            <BentoCard
              key={`${indicator.id}-${index}`}
              indicator={indicator}
              onUpdate={updated => handleUpdateIndicator(indicators.indexOf(indicator), updated)}
              onDelete={() => handleDeleteIndicator(indicators.indexOf(indicator))}
              onCommentClick={handleCommentClick}
              onDetailClick={() => handleDetailClick(indicator)}
            />
          ))}
        </div>
      )}

      {/* Policy Comment Modal */}
      <PolicyCommentModal
        isOpen={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        label={commentLabel}
      />

      {/* Indicator Detail Modal */}
      <IndicatorDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        indicator={selectedIndicator}
        onUpdateIndicator={handleUpdateSelectedIndicator}
      />
    </div>
  );
}
