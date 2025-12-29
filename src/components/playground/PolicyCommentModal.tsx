import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface PolicyCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  label: string;
}

export function PolicyCommentModal({ isOpen, onClose, label }: PolicyCommentModalProps) {
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    toast.success('Your policy input has been saved for review.');
    setComment('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[hsl(210,80%,28%)]">Submit Policy Input</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mb-2">Policy Note for: <strong>{label}</strong></p>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Enter your policy feedback here..."
          className="min-h-[100px]"
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            className="bg-[hsl(210,80%,28%)] hover:bg-[hsl(210,80%,35%)]"
          >
            Submit Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
