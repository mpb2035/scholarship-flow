import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onAddNew: () => void;
  onRefresh: () => void;
}

export function Header({ onAddNew, onRefresh }: HeaderProps) {
  return (
    <header className="glass-card p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold gold-text tracking-wide">
            SFZN WORK
          </h1>
          <p className="text-muted-foreground mt-1">
            Matter Tracking Dashboard
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onRefresh}
            className="border-border/50 hover:border-primary/50 hover:bg-secondary/50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={onAddNew}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gold-glow"
          >
            <Plus className="h-4 w-4 mr-2" />
            Log New Matter
          </Button>
        </div>
      </div>
    </header>
  );
}
