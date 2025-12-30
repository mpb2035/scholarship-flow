import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingUp, TrendingDown, Minus, Star, Database, Clock, 
  Shield, CheckCircle, Lightbulb, Plus, Send, Trash2, ExternalLink, Pencil, Check, X 
} from 'lucide-react';
import { BentoIndicator } from '@/data/playgroundData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface IndicatorDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  indicator: BentoIndicator | null;
  onUpdateIndicator: (updated: BentoIndicator) => void;
}

const statusColors: Record<string, string> = {
  critical: 'bg-red-500',
  warning: 'bg-orange-500',
  alert: 'bg-yellow-500',
  good: 'bg-green-500',
  star: 'bg-blue-500',
  neutral: 'bg-gray-500',
};

interface EditableFieldProps {
  value: string;
  onSave: (value: string) => void;
  label: string;
  icon?: React.ReactNode;
  bgClass?: string;
}

function EditableField({ value, onSave, label, icon, bgClass = 'bg-muted/50' }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = useCallback(() => {
    if (editValue.trim() !== value) {
      onSave(editValue.trim());
      toast.success(`${label} updated and saved`);
    }
    setIsEditing(false);
  }, [editValue, value, onSave, label]);

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          {icon}
          {label}
        </h4>
        <Textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="min-h-[80px] text-sm"
          autoFocus
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            <Check className="h-3 w-3 mr-1" />
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel}>
            <X className="h-3 w-3 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
        {icon}
        {label}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </h4>
      <p className={cn('text-muted-foreground text-sm leading-relaxed p-3 rounded-lg border border-dashed cursor-pointer hover:border-primary/50 transition-colors', bgClass)}
         onClick={() => setIsEditing(true)}
      >
        {value || 'Click to add...'}
      </p>
    </div>
  );
}

export function IndicatorDetailModal({ isOpen, onClose, indicator, onUpdateIndicator }: IndicatorDetailModalProps) {
  const [newPolicyNote, setNewPolicyNote] = useState('');

  if (!indicator) return null;

  const TrendIcon = indicator.trend_direction === 'up' 
    ? TrendingUp 
    : indicator.trend_direction === 'down' 
      ? TrendingDown 
      : Minus;

  const trendColor = indicator.trend_direction === 'down' 
    ? 'text-red-500' 
    : indicator.trend_direction === 'up' 
      ? 'text-green-500' 
      : 'text-muted-foreground';

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={cn(
          'h-4 w-4',
          i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
        )}
      />
    ));
  };

  const handleUpdateField = (field: keyof BentoIndicator, value: string) => {
    onUpdateIndicator({ ...indicator, [field]: value });
  };

  const handleAddPolicyNote = () => {
    if (!newPolicyNote.trim()) return;
    
    const updatedNotes = [...(indicator.policyNotes || []), newPolicyNote.trim()];
    onUpdateIndicator({ ...indicator, policyNotes: updatedNotes });
    setNewPolicyNote('');
    toast.success('Policy recommendation added successfully');
  };

  const handleDeletePolicyNote = (index: number) => {
    const updatedNotes = (indicator.policyNotes || []).filter((_, i) => i !== index);
    onUpdateIndicator({ ...indicator, policyNotes: updatedNotes });
    toast.success('Policy note removed');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-[hsl(210,80%,28%)] text-white p-6">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="border-white/40 text-white bg-white/10">
                    {indicator.id}
                  </Badge>
                  {indicator.pillar && (
                    <Badge variant="outline" className="border-white/40 text-white bg-white/10">
                      {indicator.pillar}
                    </Badge>
                  )}
                  <div className={cn('w-3 h-3 rounded-full', statusColors[indicator.status])} />
                </div>
                <DialogTitle className="text-2xl font-bold text-white mb-2">
                  {indicator.title}
                </DialogTitle>
                {indicator.owner && (
                  <p className="text-white/70 text-sm">Owner: {indicator.owner}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{indicator.score_2025}</div>
                <div className={cn('flex items-center justify-end gap-1 text-sm', trendColor)}>
                  <TrendIcon className="h-4 w-4" />
                  <span>{indicator.trend_value}</span>
                </div>
                {indicator.score_2023 && (
                  <p className="text-white/60 text-xs mt-1">2023: {indicator.score_2023}</p>
                )}
              </div>
            </div>
          </DialogHeader>
        </div>

        <Tabs defaultValue="overview" className="flex-1">
          <div className="px-6 pt-4 border-b">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="data">Data & Sources</TabsTrigger>
              <TabsTrigger value="policy">Policy Notes</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[400px]">
            {/* Overview Tab */}
            <TabsContent value="overview" className="p-6 space-y-6 mt-0">
              {indicator.definition && (
                <div>
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    Definition & Methodology
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {indicator.definition}
                  </p>
                </div>
              )}

              <EditableField
                value={indicator.insight}
                onSave={(value) => handleUpdateField('insight', value)}
                label="Key Insight"
                icon={<Lightbulb className="h-4 w-4 text-amber-500" />}
                bgClass="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
              />

              <EditableField
                value={indicator.action}
                onSave={(value) => handleUpdateField('action', value)}
                label="Recommended Action"
                bgClass="bg-muted/50"
              />

              <EditableField
                value={indicator.strategicRecommendation || ''}
                onSave={(value) => handleUpdateField('strategicRecommendation', value)}
                label="Strategic Recommendation"
                icon={<CheckCircle className="h-4 w-4 text-green-500" />}
                bgClass="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
              />

              <div className="flex items-center gap-1 pt-2">
                <span className="text-sm text-muted-foreground mr-2">Data Quality:</span>
                {renderStars(indicator.quality_rating)}
              </div>
            </TabsContent>

            {/* Data & Sources Tab */}
            <TabsContent value="data" className="p-6 space-y-4 mt-0">
              <EditableField
                value={indicator.dataSource || ''}
                onSave={(value) => handleUpdateField('dataSource', value)}
                label="Data Source"
                icon={<Database className="h-4 w-4 text-primary" />}
                bgClass="bg-muted/30"
              />

              {indicator.sourceUrls && indicator.sourceUrls.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {indicator.sourceUrls.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline bg-primary/10 px-2 py-1 rounded-md"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {source.name}
                    </a>
                  ))}
                </div>
              )}

              <EditableField
                value={indicator.dataAge || ''}
                onSave={(value) => handleUpdateField('dataAge', value)}
                label="Data Age"
                icon={<Clock className="h-4 w-4 text-primary" />}
                bgClass="bg-muted/30"
              />

              <EditableField
                value={indicator.reliabilityAssessment || ''}
                onSave={(value) => handleUpdateField('reliabilityAssessment', value)}
                label="Reliability Assessment"
                icon={<Shield className="h-4 w-4 text-primary" />}
                bgClass="bg-muted/30"
              />

              <EditableField
                value={indicator.validationStatus || ''}
                onSave={(value) => handleUpdateField('validationStatus', value)}
                label="Validation Status"
                icon={<CheckCircle className="h-4 w-4 text-primary" />}
                bgClass="bg-muted/30"
              />

              <div className="pt-4">
                <h5 className="font-medium text-sm mb-2">Category</h5>
                <Badge variant="secondary">{indicator.category}</Badge>
              </div>
            </TabsContent>

            {/* Policy Notes Tab */}
            <TabsContent value="policy" className="p-6 space-y-4 mt-0">
              <div>
                <h4 className="font-semibold text-foreground mb-3">Add Policy Recommendation</h4>
                <Textarea
                  value={newPolicyNote}
                  onChange={(e) => setNewPolicyNote(e.target.value)}
                  placeholder="Enter your policy recommendation or feedback..."
                  className="min-h-[100px] mb-2"
                />
                <Button 
                  onClick={handleAddPolicyNote} 
                  disabled={!newPolicyNote.trim()}
                  className="bg-[hsl(210,80%,28%)] hover:bg-[hsl(210,80%,35%)]"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Recommendation
                </Button>
              </div>

              {(indicator.policyNotes && indicator.policyNotes.length > 0) ? (
                <div className="space-y-3 pt-4">
                  <h4 className="font-semibold text-foreground">Policy Recommendations ({indicator.policyNotes.length})</h4>
                  {indicator.policyNotes.map((note, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <Send className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm flex-1">{note}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeletePolicyNote(index)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No policy recommendations yet.</p>
                  <p className="text-xs">Add your first recommendation above.</p>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
