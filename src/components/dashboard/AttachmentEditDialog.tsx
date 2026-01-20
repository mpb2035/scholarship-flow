import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AttachmentOverseas } from '@/hooks/useAttachmentOverseas';
import { X, Plus } from 'lucide-react';

interface AttachmentEditDialogProps {
  attachment: AttachmentOverseas;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<AttachmentOverseas>) => Promise<void>;
}

const PROGRAMME_OPTIONS = [
  'DE', 'DT', 'ND', 'NT', 'HND', 'HNT', 'DIT', 'DIC', 'DHM', 'DAF', 
  'DMK', 'DBM', 'DPA', 'DSK', 'DFT', 'DAC', 'DCM', 'DEE', 'DME', 'DCE'
];

export function AttachmentEditDialog({ attachment, open, onOpenChange, onSave }: AttachmentEditDialogProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    institution: attachment.institution,
    programmes: [...attachment.programmes],
    programStartDate: attachment.programStartDate,
    programEndDate: attachment.programEndDate,
    fundingType: attachment.fundingType,
    country: attachment.country,
    destinationInstitution: attachment.destinationInstitution,
    studentCount: attachment.studentCount,
  });

  const [newProgramme, setNewProgramme] = useState('');

  const handleAddProgramme = (prog: string) => {
    if (prog && !formData.programmes.includes(prog)) {
      setFormData(prev => ({
        ...prev,
        programmes: [...prev.programmes, prog],
      }));
    }
    setNewProgramme('');
  };

  const handleRemoveProgramme = (prog: string) => {
    setFormData(prev => ({
      ...prev,
      programmes: prev.programmes.filter(p => p !== prog),
    }));
  };

  const handleSave = async () => {
    if (!formData.institution || !formData.programStartDate || !formData.programEndDate) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      await onSave(attachment.id, formData);
      toast({
        title: 'Success',
        description: 'Attachment overseas record updated successfully.',
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving attachment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update record. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Attachment Overseas</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Institution *</Label>
              <Select
                value={formData.institution}
                onValueChange={(value) => setFormData(prev => ({ ...prev, institution: value as 'PB' | 'IBTE' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PB">Politeknik Brunei</SelectItem>
                  <SelectItem value="IBTE">IBTE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Funding Type</Label>
              <Select
                value={formData.fundingType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, fundingType: value as 'Self Funded' | 'Organizer Funded' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Self Funded">Self Funded</SelectItem>
                  <SelectItem value="Organizer Funded">Organizer Funded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Programmes</Label>
            <div className="flex flex-wrap gap-1 mb-2">
              {formData.programmes.map((prog) => (
                <Badge key={prog} variant="secondary" className="flex items-center gap-1">
                  {prog}
                  <button
                    type="button"
                    onClick={() => handleRemoveProgramme(prog)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Select value={newProgramme} onValueChange={handleAddProgramme}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Add programme..." />
                </SelectTrigger>
                <SelectContent>
                  {PROGRAMME_OPTIONS.filter(p => !formData.programmes.includes(p)).map((prog) => (
                    <SelectItem key={prog} value={prog}>{prog}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={formData.programStartDate}
                onChange={(e) => setFormData(prev => ({ ...prev, programStartDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date *</Label>
              <Input
                type="date"
                value={formData.programEndDate}
                onChange={(e) => setFormData(prev => ({ ...prev, programEndDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Country</Label>
            <Input
              value={formData.country}
              onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
              placeholder="e.g., Singapore"
            />
          </div>

          <div className="space-y-2">
            <Label>Destination Institution</Label>
            <Input
              value={formData.destinationInstitution}
              onChange={(e) => setFormData(prev => ({ ...prev, destinationInstitution: e.target.value }))}
              placeholder="e.g., Nanyang Polytechnic"
            />
          </div>

          <div className="space-y-2">
            <Label>Number of Students</Label>
            <Input
              type="number"
              min={0}
              value={formData.studentCount}
              onChange={(e) => setFormData(prev => ({ ...prev, studentCount: parseInt(e.target.value) || 0 }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
