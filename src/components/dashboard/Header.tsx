import { Plus, RefreshCw, LogOut, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
  onAddNew: () => void;
  onRefresh: () => void;
}

export function Header({ onAddNew, onRefresh }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You have been logged out successfully.",
    });
  };

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
          {user && (
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user.email}
            </span>
          )}
          {isAdmin && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/admin')}
              className="border-primary/50 hover:border-primary hover:bg-primary/10 text-primary"
            >
              <Shield className="h-4 w-4 mr-2" />
              Admin
            </Button>
          )}
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
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSignOut}
            className="border-border/50 hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
