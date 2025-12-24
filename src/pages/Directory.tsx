import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Pencil, Check, X, Trash2, ExternalLink, Loader2, Bookmark } from 'lucide-react';

interface Shortcut {
  id: string;
  title: string;
  url: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

const Directory = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [saving, setSaving] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Fetch shortcuts
  useEffect(() => {
    async function fetchShortcuts() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_shortcuts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setShortcuts(data || []);
      } catch (err) {
        console.error('Error fetching shortcuts:', err);
        toast({
          title: 'Error',
          description: 'Failed to load your shortcuts.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    if (user) fetchShortcuts();
  }, [user, toast]);

  const handleAddNew = async () => {
    if (!newTitle.trim() || !newUrl.trim() || !user) return;

    setSaving(true);
    try {
      let formattedUrl = newUrl.trim();
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = 'https://' + formattedUrl;
      }

      const { data, error } = await supabase
        .from('user_shortcuts')
        .insert({
          title: newTitle.trim(),
          url: formattedUrl,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setShortcuts(prev => [data, ...prev]);
      setNewTitle('');
      setNewUrl('');
      setIsAdding(false);
      toast({
        title: 'Shortcut Added',
        description: 'Your new shortcut has been saved.',
      });
    } catch (err) {
      console.error('Error adding shortcut:', err);
      toast({
        title: 'Error',
        description: 'Failed to add shortcut.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (shortcut: Shortcut, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(shortcut.id);
    setEditTitle(shortcut.title);
    setEditUrl(shortcut.url);
  };

  const handleSaveEdit = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editTitle.trim() || !editUrl.trim()) return;

    setSaving(true);
    try {
      let formattedUrl = editUrl.trim();
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = 'https://' + formattedUrl;
      }

      const { error } = await supabase
        .from('user_shortcuts')
        .update({
          title: editTitle.trim(),
          url: formattedUrl,
        })
        .eq('id', id);

      if (error) throw error;

      setShortcuts(prev =>
        prev.map(s =>
          s.id === id ? { ...s, title: editTitle.trim(), url: formattedUrl } : s
        )
      );
      setEditingId(null);
      toast({
        title: 'Shortcut Updated',
        description: 'Your changes have been saved.',
      });
    } catch (err) {
      console.error('Error updating shortcut:', err);
      toast({
        title: 'Error',
        description: 'Failed to update shortcut.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this shortcut?')) return;

    try {
      const { error } = await supabase
        .from('user_shortcuts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setShortcuts(prev => prev.filter(s => s.id !== id));
      toast({
        title: 'Shortcut Deleted',
        description: 'The shortcut has been removed.',
      });
    } catch (err) {
      console.error('Error deleting shortcut:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete shortcut.',
        variant: 'destructive',
      });
    }
  };

  const handleCardClick = (url: string) => {
    if (editingId) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold gold-text flex items-center gap-2">
              <Bookmark className="h-6 w-6" />
              My Directory
            </h1>
            <p className="text-muted-foreground">Your personal quick links and bookmarks</p>
          </div>
          <Button
            onClick={() => setIsAdding(true)}
            className="gap-2"
            disabled={isAdding}
          >
            <Plus className="h-4 w-4" />
            Add New Link
          </Button>
        </div>

        {/* Add New Card */}
        {isAdding && (
          <Card className="mb-6 bg-card border-primary/30">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">
                    Title
                  </label>
                  <Input
                    placeholder="e.g., Company Portal"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">
                    URL
                  </label>
                  <Input
                    placeholder="e.g., https://portal.company.com"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNew()}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddNew}
                    disabled={!newTitle.trim() || !newUrl.trim() || saving}
                    className="gap-2"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAdding(false);
                      setNewTitle('');
                      setNewUrl('');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shortcuts Grid */}
        {shortcuts.length === 0 && !isAdding ? (
          <div className="text-center py-16">
            <Bookmark className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No shortcuts yet
            </h3>
            <p className="text-sm text-muted-foreground/70 mb-4">
              Add your first quick link to get started
            </p>
            <Button onClick={() => setIsAdding(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Link
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {shortcuts.map((shortcut) => (
              <Card
                key={shortcut.id}
                className={`group relative bg-card border-border hover:border-primary/50 transition-all duration-200 ${
                  editingId === shortcut.id ? '' : 'cursor-pointer hover:shadow-lg hover:shadow-primary/5'
                }`}
                onClick={() => editingId !== shortcut.id && handleCardClick(shortcut.url)}
              >
                <CardContent className="p-6 min-h-[140px] flex flex-col">
                  {editingId === shortcut.id ? (
                    <div className="space-y-3 flex-1">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Title"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Input
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        placeholder="URL"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(shortcut.id, e as unknown as React.MouseEvent)}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={(e) => handleSaveEdit(shortcut.id, e)}
                          disabled={saving}
                          className="gap-1"
                        >
                          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Action buttons */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={(e) => handleStartEdit(shortcut, e)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={(e) => handleDelete(shortcut.id, e)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {/* Card content */}
                      <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <ExternalLink className="h-8 w-8 text-primary/50 mb-3 group-hover:text-primary transition-colors" />
                        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {shortcut.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 truncate max-w-full">
                          {shortcut.url.replace(/^https?:\/\//, '').split('/')[0]}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Directory;