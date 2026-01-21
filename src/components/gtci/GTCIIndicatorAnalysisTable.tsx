import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Copy, Check, Plus, Trash2, AlertCircle, Search, X, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import type { IndicatorAnalysis } from '@/types/gtciAnalysis';

interface GTCIIndicatorAnalysisTableProps {
  indicators: IndicatorAnalysis[];
  onUpdate: (indicators: IndicatorAnalysis[]) => void;
  editable: boolean;
}

export function GTCIIndicatorAnalysisTable({ indicators, onUpdate, editable }: GTCIIndicatorAnalysisTableProps) {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter indicators based on search query
  const filteredIndicators = useMemo(() => {
    if (!searchQuery.trim()) return indicators;
    
    const query = searchQuery.toLowerCase();
    return indicators.filter(ind => 
      ind.indicatorId?.toLowerCase().includes(query) ||
      ind.indicatorName?.toLowerCase().includes(query) ||
      ind.leadAgency?.toLowerCase().includes(query) ||
      ind.dataSource?.toLowerCase().includes(query) ||
      ind.thematicGroup?.toLowerCase().includes(query) ||
      ind.gapAnalysis?.toLowerCase().includes(query) ||
      ind.recommendedAction?.toLowerCase().includes(query) ||
      ind.measurableKPI?.toLowerCase().includes(query)
    );
  }, [indicators, searchQuery]);

  const groupedIndicators = filteredIndicators.reduce((acc, indicator) => {
    const group = indicator.thematicGroup || 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(indicator);
    return acc;
  }, {} as Record<string, IndicatorAnalysis[]>);

  const updateIndicator = (id: string, field: keyof IndicatorAnalysis, value: string) => {
    const updated = indicators.map(ind => 
      ind.id === id ? { ...ind, [field]: value } : ind
    );
    onUpdate(updated);
  };

  const deleteIndicator = (id: string) => {
    onUpdate(indicators.filter(ind => ind.id !== id));
  };

  const addIndicator = (thematicGroup: string) => {
    const newIndicator: IndicatorAnalysis = {
      id: crypto.randomUUID(),
      indicatorId: '',
      indicatorName: 'New Indicator',
      leadAgency: '',
      dataSource: '',
      currentScore: '',
      currentInitiative: '',
      dataStrategy: '',
      gapAnalysis: '',
      recommendedAction: '',
      measurableKPI: '',
      timeline: '',
      alignment: '',
      thematicGroup
    };
    onUpdate([...indicators, newIndicator]);
  };

  const copyAllToClipboard = () => {
    const text = indicators.map(ind => 
      `${ind.indicatorId} - ${ind.indicatorName}\n` +
      `Lead Agency: ${ind.leadAgency}\n` +
      `Data Source: ${ind.dataSource}\n` +
      `Current Score: ${ind.currentScore}\n` +
      `Gap Analysis: ${ind.gapAnalysis}\n` +
      `Recommended Action: ${ind.recommendedAction}\n` +
      `KPI: ${ind.measurableKPI}\n` +
      `Timeline: ${ind.timeline}\n`
    ).join('\n---\n');
    
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success('Indicators copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      
      // Group indicators by thematic group for separate sheets
      const grouped = indicators.reduce((acc, indicator) => {
        const group = indicator.thematicGroup || 'Other';
        if (!acc[group]) acc[group] = [];
        acc[group].push(indicator);
        return acc;
      }, {} as Record<string, IndicatorAnalysis[]>);

      // Create a sheet for each thematic group
      Object.entries(grouped).forEach(([groupName, groupIndicators]) => {
        const data = groupIndicators.map((ind) => ({
          'Indicator ID': ind.indicatorId || '',
          'Indicator Name': ind.indicatorName || '',
          'Lead Agency': ind.leadAgency || '',
          'Data Source': ind.dataSource || '',
          'Current Score': ind.currentScore || '',
          'Current Initiative': ind.currentInitiative || '',
          'Data Strategy': ind.dataStrategy || '',
          'Gap Analysis': ind.gapAnalysis || '',
          'Recommended Action': ind.recommendedAction || '',
          'Measurable KPI': ind.measurableKPI || '',
          'Timeline': ind.timeline || '',
          'Alignment': ind.alignment || '',
          'Funding Note': ind.fundingNote || ''
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        
        // Auto-size columns
        const maxWidth = 50;
        const colWidths = Object.keys(data[0] || {}).map((key) => ({
          wch: Math.min(maxWidth, Math.max(key.length, ...data.map(row => String(row[key as keyof typeof row] || '').length)))
        }));
        ws['!cols'] = colWidths;

        // Sanitize sheet name (max 31 chars, no special chars)
        const sheetName = groupName.substring(0, 31).replace(/[:\\/?*\[\]]/g, '_');
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      });

      // Also create a summary sheet with all indicators
      const allData = indicators.map((ind) => ({
        'Thematic Group': ind.thematicGroup || '',
        'Indicator ID': ind.indicatorId || '',
        'Indicator Name': ind.indicatorName || '',
        'Lead Agency': ind.leadAgency || '',
        'Data Source': ind.dataSource || '',
        'Current Score': ind.currentScore || '',
        'Current Initiative': ind.currentInitiative || '',
        'Data Strategy': ind.dataStrategy || '',
        'Gap Analysis': ind.gapAnalysis || '',
        'Recommended Action': ind.recommendedAction || '',
        'Measurable KPI': ind.measurableKPI || '',
        'Timeline': ind.timeline || '',
        'Alignment': ind.alignment || '',
        'Funding Note': ind.fundingNote || ''
      }));

      const summaryWs = XLSX.utils.json_to_sheet(allData);
      const summaryColWidths = Object.keys(allData[0] || {}).map((key) => ({
        wch: Math.min(50, Math.max(key.length, ...allData.map(row => String(row[key as keyof typeof row] || '').length)))
      }));
      summaryWs['!cols'] = summaryColWidths;
      
      // Insert summary sheet at the beginning
      XLSX.utils.book_append_sheet(wb, summaryWs, 'All Indicators');

      XLSX.writeFile(wb, `GTCI_Strategic_Indicators_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Excel file exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export Excel file');
    }
  };

  const renderEditableField = (indicator: IndicatorAnalysis, field: keyof IndicatorAnalysis, label: string, multiline = false) => {
    const value = indicator[field] as string || '';
    
    if (!editable) {
      return (
        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          <p className="text-sm">{value || '-'}</p>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {multiline ? (
          <Textarea
            value={value}
            onChange={(e) => updateIndicator(indicator.id, field, e.target.value)}
            className="min-h-[60px] text-sm"
          />
        ) : (
          <Input
            value={value}
            onChange={(e) => updateIndicator(indicator.id, field, e.target.value)}
            className="h-8 text-sm"
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Detailed 77-Indicator Analysis</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportToExcel}
            className="flex items-center gap-1 border-green-600 text-green-600 hover:bg-green-50"
          >
            <FileSpreadsheet className="h-3 w-3" />
            Export Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={copyAllToClipboard}
            className="flex items-center gap-1"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied!' : 'Copy All'}
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search indicators by name, ID, agency, data source..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery('')}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Results count when searching */}
      {searchQuery && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">{filteredIndicators.length}</Badge>
          <span>indicators found for "{searchQuery}"</span>
        </div>
      )}

      {filteredIndicators.length === 0 && searchQuery && (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No indicators found matching "{searchQuery}"</p>
          <Button variant="link" onClick={() => setSearchQuery('')} className="mt-2">
            Clear search
          </Button>
        </div>
      )}

      <Accordion type="multiple" className="space-y-4" defaultValue={searchQuery ? Object.keys(groupedIndicators) : []}>
        {Object.entries(groupedIndicators).map(([group, groupIndicators]) => (
          <AccordionItem key={group} value={group} className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Badge variant="outline">{groupIndicators.length}</Badge>
                <span className="font-medium">{group}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              {groupIndicators.map((indicator) => (
                <Card key={indicator.id} className="border-l-4 border-l-primary/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {indicator.indicatorId}
                        </Badge>
                        {editable ? (
                          <Input
                            value={indicator.indicatorName}
                            onChange={(e) => updateIndicator(indicator.id, 'indicatorName', e.target.value)}
                            className="h-7 text-sm font-semibold w-64"
                          />
                        ) : (
                          <CardTitle className="text-base">{indicator.indicatorName}</CardTitle>
                        )}
                      </div>
                      {editable && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteIndicator(indicator.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {renderEditableField(indicator, 'leadAgency', 'Lead Agency')}
                      {renderEditableField(indicator, 'dataSource', 'Data Source')}
                      {renderEditableField(indicator, 'currentScore', 'Current Score')}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderEditableField(indicator, 'currentInitiative', 'Current Initiative', true)}
                      {renderEditableField(indicator, 'dataStrategy', 'Data Strategy', true)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderEditableField(indicator, 'gapAnalysis', 'Gap Analysis', true)}
                      {renderEditableField(indicator, 'recommendedAction', 'Recommended Action', true)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {renderEditableField(indicator, 'measurableKPI', 'Measurable KPI')}
                      {renderEditableField(indicator, 'timeline', 'Timeline')}
                      {renderEditableField(indicator, 'alignment', 'Alignment')}
                    </div>

                    {indicator.fundingNote && (
                      <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                        <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                        {editable ? (
                          <Textarea
                            value={indicator.fundingNote}
                            onChange={(e) => updateIndicator(indicator.id, 'fundingNote', e.target.value)}
                            className="flex-1 text-sm min-h-[40px]"
                          />
                        ) : (
                          <p className="text-sm">{indicator.fundingNote}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {editable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addIndicator(group)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Indicator to {group}
                </Button>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
