import { useState, useRef, useEffect } from 'react';
import { useNotes, Note } from '@/hooks/useNotes';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Copy, Trash2, Pin, PinOff, Palette, MoreVertical, Loader2, Search, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const NOTE_COLORS: { value: string; label: string; bg: string; border: string }[] = [
  { value: 'default', label: 'Default', bg: 'bg-card', border: 'border-border' },
  { value: 'yellow', label: 'Yellow', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  { value: 'green', label: 'Green', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  { value: 'blue', label: 'Blue', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { value: 'purple', label: 'Purple', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  { value: 'pink', label: 'Pink', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
  { value: 'red', label: 'Red', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  { value: 'orange', label: 'Orange', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
];

const getColorClasses = (color: string) => NOTE_COLORS.find(c => c.value === color) || NOTE_COLORS[0];

function NoteCard({ note, onUpdate, onDelete }: { note: Note; onUpdate: (id: string, u: Partial<Note>) => void; onDelete: (id: string) => void }) {
  const { toast } = useToast();
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const colors = getColorClasses(note.color);

  useEffect(() => { setTitle(note.title); setContent(note.content); }, [note.title, note.content]);

  const save = (field: 'title' | 'content', value: string) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onUpdate(note.id, { [field]: value }), 500);
  };

  const handleCopy = () => {
    const text = [note.title, note.content].filter(Boolean).join('\n\n');
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'Note copied to clipboard.' });
  };

  return (
    <Card className={`${colors.bg} ${colors.border} border hover:shadow-md transition-shadow group`}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Input
            value={title}
            onChange={e => { setTitle(e.target.value); save('title', e.target.value); }}
            placeholder="Title"
            className="border-0 p-0 h-auto text-base font-semibold bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/50"
          />
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onUpdate(note.id, { pinned: !note.pinned })}>
              {note.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-3.5 w-3.5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {NOTE_COLORS.map(c => (
                  <DropdownMenuItem key={c.value} onClick={() => onUpdate(note.id, { color: c.value })}>
                    <div className={`h-3 w-3 rounded-full ${c.bg} ${c.border} border mr-2`} />
                    {c.label}
                    {note.color === c.value && <CheckCircle className="h-3 w-3 ml-auto text-primary" />}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem onClick={() => onDelete(note.id)} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <Textarea
          value={content}
          onChange={e => { setContent(e.target.value); save('content', e.target.value); }}
          placeholder="Take a note..."
          className="border-0 p-0 bg-transparent focus-visible:ring-0 resize-none min-h-[80px] placeholder:text-muted-foreground/50 text-sm"
          rows={4}
        />
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-muted-foreground">
            {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
          </span>
          {note.pinned && <Badge variant="outline" className="text-[10px] px-1.5 py-0">Pinned</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function NotesPage() {
  const { notes, loading, addNote, updateNote, deleteNote } = useNotes();
  const [search, setSearch] = useState('');

  const filtered = search
    ? notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()))
    : notes;

  const pinned = filtered.filter(n => n.pinned);
  const others = filtered.filter(n => !n.pinned);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notes</h1>
          <p className="text-muted-foreground text-sm">Quick notes for work — auto-saved and persistent</p>
        </div>
        <Button onClick={addNote} className="gap-2">
          <Plus className="h-4 w-4" /> New Note
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-input border-border/50" />
      </div>

      {pinned.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
            <Pin className="h-3 w-3" /> Pinned
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {pinned.map(n => <NoteCard key={n.id} note={n} onUpdate={updateNote} onDelete={deleteNote} />)}
          </div>
        </div>
      )}

      <div>
        {pinned.length > 0 && others.length > 0 && (
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Others</p>
        )}
        {others.length === 0 && pinned.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-muted-foreground">No notes yet</p>
            <Button variant="outline" onClick={addNote} className="gap-2">
              <Plus className="h-4 w-4" /> Create your first note
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {others.map(n => <NoteCard key={n.id} note={n} onUpdate={updateNote} onDelete={deleteNote} />)}
          </div>
        )}
      </div>
    </div>
  );
}
