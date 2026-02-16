import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Landmark, TrendingUp, CreditCard, DollarSign, Plus, Trash2, Pencil, Check, X, ChevronDown,
} from 'lucide-react';
import { NetWorthEntry } from '@/hooks/useNetWorthTracker';
import { format, parseISO } from 'date-fns';

interface Props {
  entries: NetWorthEntry[];
  totals: { assets: number; loans: number; savings: number; netWorth: number };
  getEntriesByType: (type: 'asset' | 'loan' | 'saving') => NetWorthEntry[];
  addEntry: (data: { entryType: 'asset' | 'loan' | 'saving'; label: string; amount: number; notes?: string }) => Promise<void>;
  updateEntry: (id: string, amount: number) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
}

const TYPE_CONFIG = {
  asset: { label: 'Assets', icon: Landmark, color: 'text-blue-600', bg: 'from-blue-500/15 to-blue-600/5 border-blue-500/30' },
  loan: { label: 'Loans', icon: CreditCard, color: 'text-red-600', bg: 'from-red-500/15 to-red-600/5 border-red-500/30' },
  saving: { label: 'Savings', icon: DollarSign, color: 'text-emerald-600', bg: 'from-emerald-500/15 to-emerald-600/5 border-emerald-500/30' },
} as const;

const NetWorthScorecard = ({ entries, totals, getEntriesByType, addEntry, updateEntry, deleteEntry }: Props) => {
  const [isOpen, setIsOpen] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({ entryType: 'asset' as 'asset' | 'loan' | 'saving', label: '', amount: '', notes: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');

  const handleAdd = async () => {
    if (!newEntry.label.trim() || !newEntry.amount) return;
    await addEntry({
      entryType: newEntry.entryType,
      label: newEntry.label,
      amount: parseFloat(newEntry.amount),
      notes: newEntry.notes || undefined,
    });
    setNewEntry({ entryType: 'asset', label: '', amount: '', notes: '' });
    setDialogOpen(false);
  };

  const handleSaveEdit = (id: string) => {
    if (editAmount) {
      updateEntry(id, parseFloat(editAmount));
      setEditingId(null);
    }
  };

  const renderEntryList = (type: 'asset' | 'loan' | 'saving') => {
    const typeEntries = getEntriesByType(type);
    const config = TYPE_CONFIG[type];

    if (typeEntries.length === 0) {
      return <p className="text-center text-muted-foreground py-4 text-sm">No {config.label.toLowerCase()} logged yet.</p>;
    }

    return (
      <div className="space-y-1.5">
        {typeEntries.map(entry => (
          <div key={entry.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/40 text-sm">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{entry.label}</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {format(parseISO(entry.loggedAt), 'MMM d, yyyy')}
                </Badge>
              </div>
              {entry.notes && <p className="text-xs text-muted-foreground truncate mt-0.5">{entry.notes}</p>}
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              {editingId === entry.id ? (
                <>
                  <Input
                    type="number"
                    value={editAmount}
                    onChange={e => setEditAmount(e.target.value)}
                    className="h-7 w-24 text-xs px-2"
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSaveEdit(entry.id);
                      else if (e.key === 'Escape') setEditingId(null);
                    }}
                  />
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-emerald-600" onClick={() => handleSaveEdit(entry.id)}>
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground" onClick={() => setEditingId(null)}>
                    <X className="h-3 w-3" />
                  </Button>
                </>
              ) : (
                <>
                  <span className={`font-semibold ${config.color}`}>
                    {type === 'loan' ? '-' : ''}${entry.amount.toFixed(2)}
                  </span>
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground" onClick={() => { setEditingId(entry.id); setEditAmount(entry.amount.toString()); }}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => deleteEntry(entry.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-gradient-to-br from-indigo-500/15 to-indigo-600/5 border-indigo-500/30">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-indigo-500/20">
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Net Worth</p>
                <p className={`text-2xl sm:text-4xl font-bold ${totals.netWorth >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                  ${Math.abs(totals.netWorth).toFixed(2)}
                  {totals.netWorth < 0 && <span className="text-sm ml-1">deficit</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right space-y-0.5">
                <p className="text-xs text-muted-foreground">Assets: <span className="text-blue-600 font-medium">${totals.assets.toFixed(2)}</span></p>
                <p className="text-xs text-muted-foreground">Loans: <span className="text-red-600 font-medium">-${totals.loans.toFixed(2)}</span></p>
                <p className="text-xs text-muted-foreground">Savings: <span className="text-emerald-600 font-medium">${totals.savings.toFixed(2)}</span></p>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                  <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>
      </Card>

      <CollapsibleContent>
        <div className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-4 sm:p-6">
              <div>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Landmark className="h-4 w-4 sm:h-5 sm:w-5" />
                  Net Worth Tracker
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Log your assets, loans & savings — track changes over time
                </p>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-1" /> Add Entry
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add Net Worth Entry</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={newEntry.entryType} onValueChange={(v: 'asset' | 'loan' | 'saving') => setNewEntry({ ...newEntry, entryType: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asset">Asset</SelectItem>
                          <SelectItem value="loan">Loan</SelectItem>
                          <SelectItem value="saving">Saving</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Label</Label>
                      <Input
                        value={newEntry.label}
                        onChange={e => setNewEntry({ ...newEntry, label: e.target.value })}
                        placeholder="e.g., House, Car Loan, FD Account"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Amount ($)</Label>
                      <Input
                        type="number"
                        value={newEntry.amount}
                        onChange={e => setNewEntry({ ...newEntry, amount: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Notes (optional)</Label>
                      <Input
                        value={newEntry.notes}
                        onChange={e => setNewEntry({ ...newEntry, notes: e.target.value })}
                        placeholder="e.g., Current market value"
                      />
                    </div>
                    <Button onClick={handleAdd} className="w-full">Add Entry</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <Tabs defaultValue="asset" className="space-y-3">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="asset" className="text-xs sm:text-sm">Assets</TabsTrigger>
                  <TabsTrigger value="loan" className="text-xs sm:text-sm">Loans</TabsTrigger>
                  <TabsTrigger value="saving" className="text-xs sm:text-sm">Savings</TabsTrigger>
                </TabsList>
                <TabsContent value="asset">{renderEntryList('asset')}</TabsContent>
                <TabsContent value="loan">{renderEntryList('loan')}</TabsContent>
                <TabsContent value="saving">{renderEntryList('saving')}</TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default NetWorthScorecard;
