import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Save, RotateCcw } from 'lucide-react';

interface SLAConfig {
  id: string;
  case_type: string;
  sla_days: number;
  at_risk_days: number;
  critical_days: number;
}

export function SLAConfigManager() {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<SLAConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editedConfigs, setEditedConfigs] = useState<Record<string, Partial<SLAConfig>>>({});

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sla_configurations')
        .select('*')
        .order('case_type');

      if (error) throw error;
      setConfigs(data || []);
      setEditedConfigs({});
    } catch (err) {
      console.error('Error fetching SLA configs:', err);
      toast({
        title: 'Error',
        description: 'Failed to load SLA configurations.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (id: string, field: keyof SLAConfig, value: number) => {
    setEditedConfigs(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const getDisplayValue = (config: SLAConfig, field: keyof SLAConfig): number => {
    const edited = editedConfigs[config.id];
    if (edited && edited[field] !== undefined) {
      return edited[field] as number;
    }
    return config[field] as number;
  };

  const hasChanges = (id: string) => {
    return !!editedConfigs[id] && Object.keys(editedConfigs[id]).length > 0;
  };

  const handleSave = async (config: SLAConfig) => {
    const changes = editedConfigs[config.id];
    if (!changes) return;

    setSaving(config.id);
    try {
      const { error } = await supabase
        .from('sla_configurations')
        .update({
          sla_days: changes.sla_days ?? config.sla_days,
          at_risk_days: changes.at_risk_days ?? config.at_risk_days,
          critical_days: changes.critical_days ?? config.critical_days,
        })
        .eq('id', config.id);

      if (error) throw error;

      // Update local state
      setConfigs(prev => prev.map(c => 
        c.id === config.id 
          ? { ...c, ...changes }
          : c
      ));
      
      // Clear edited state for this config
      setEditedConfigs(prev => {
        const newState = { ...prev };
        delete newState[config.id];
        return newState;
      });

      toast({
        title: 'SLA Updated',
        description: `SLA configuration for "${config.case_type}" saved successfully.`,
      });
    } catch (err) {
      console.error('Error saving SLA config:', err);
      toast({
        title: 'Error',
        description: 'Failed to save SLA configuration.',
        variant: 'destructive',
      });
    } finally {
      setSaving(null);
    }
  };

  const handleReset = (id: string) => {
    setEditedConfigs(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };

  const handleSaveAll = async () => {
    const changedIds = Object.keys(editedConfigs);
    if (changedIds.length === 0) return;

    setSaving('all');
    try {
      for (const id of changedIds) {
        const config = configs.find(c => c.id === id);
        if (!config) continue;

        const changes = editedConfigs[id];
        const { error } = await supabase
          .from('sla_configurations')
          .update({
            sla_days: changes.sla_days ?? config.sla_days,
            at_risk_days: changes.at_risk_days ?? config.at_risk_days,
            critical_days: changes.critical_days ?? config.critical_days,
          })
          .eq('id', id);

        if (error) throw error;
      }

      await fetchConfigs();
      toast({
        title: 'All SLAs Updated',
        description: `${changedIds.length} configuration(s) saved successfully.`,
      });
    } catch (err) {
      console.error('Error saving SLA configs:', err);
      toast({
        title: 'Error',
        description: 'Failed to save some SLA configurations.',
        variant: 'destructive',
      });
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasAnyChanges = Object.keys(editedConfigs).length > 0;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>SLA Configuration</CardTitle>
          <CardDescription>
            Set SLA days, at-risk threshold, and critical threshold for each case type
          </CardDescription>
        </div>
        {hasAnyChanges && (
          <Button 
            onClick={handleSaveAll}
            disabled={saving === 'all'}
            className="gold-glow"
          >
            {saving === 'all' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save All Changes
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Case Type</TableHead>
                <TableHead className="text-center">SLA Days</TableHead>
                <TableHead className="text-center">At Risk (days)</TableHead>
                <TableHead className="text-center">Critical (days)</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map(config => (
                <TableRow key={config.id} className={hasChanges(config.id) ? 'bg-primary/5' : ''}>
                  <TableCell className="font-medium">{config.case_type}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={1}
                      max={365}
                      value={getDisplayValue(config, 'sla_days')}
                      onChange={(e) => handleInputChange(config.id, 'sla_days', parseInt(e.target.value) || 0)}
                      className="w-20 text-center mx-auto"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={1}
                      max={365}
                      value={getDisplayValue(config, 'at_risk_days')}
                      onChange={(e) => handleInputChange(config.id, 'at_risk_days', parseInt(e.target.value) || 0)}
                      className="w-20 text-center mx-auto"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={1}
                      max={365}
                      value={getDisplayValue(config, 'critical_days')}
                      onChange={(e) => handleInputChange(config.id, 'critical_days', parseInt(e.target.value) || 0)}
                      className="w-20 text-center mx-auto"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSave(config)}
                        disabled={!hasChanges(config.id) || saving === config.id}
                        className={hasChanges(config.id) ? 'text-primary' : ''}
                      >
                        {saving === config.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleReset(config.id)}
                        disabled={!hasChanges(config.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}