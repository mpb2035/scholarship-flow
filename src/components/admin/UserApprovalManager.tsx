import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, UserCheck } from 'lucide-react';

interface PendingUser {
  user_id: string;
  email: string | null;
  display_name: string | null;
  is_approved: boolean;
  created_at: string;
}

export function UserApprovalManager() {
  const { toast } = useToast();
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, email, display_name, is_approved, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching profiles:', error);
      toast({ title: 'Error', description: 'Failed to load users.', variant: 'destructive' });
    } else {
      setUsers((data as any[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleApprove = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: true } as any)
      .eq('user_id', userId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to approve user.', variant: 'destructive' });
    } else {
      setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, is_approved: true } : u));
      toast({ title: 'User Approved', description: 'User can now access the site.' });
    }
  };

  const handleRevoke = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: false } as any)
      .eq('user_id', userId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to revoke access.', variant: 'destructive' });
    } else {
      setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, is_approved: false } : u));
      toast({ title: 'Access Revoked', description: 'User access has been revoked.' });
    }
  };

  const pendingCount = users.filter(u => !u.is_approved).length;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          User Approval
          {pendingCount > 0 && (
            <Badge variant="destructive" className="ml-2">{pendingCount} pending</Badge>
          )}
        </CardTitle>
        <CardDescription>Approve or revoke access for users who sign up or log in for the first time</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No users found</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.user_id} className={!u.is_approved ? 'bg-amber-500/5' : ''}>
                  <TableCell className="text-sm">{u.email || u.user_id.slice(0, 8) + '...'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.display_name || '—'}</TableCell>
                  <TableCell>
                    {u.is_approved ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30" variant="outline">
                        <CheckCircle className="h-3 w-3 mr-1" /> Approved
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30" variant="outline">
                        <XCircle className="h-3 w-3 mr-1" /> Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {u.is_approved ? (
                      <Button variant="outline" size="sm" onClick={() => handleRevoke(u.user_id)}
                        className="text-destructive border-destructive/30 hover:bg-destructive/10">
                        Revoke
                      </Button>
                    ) : (
                      <Button variant="default" size="sm" onClick={() => handleApprove(u.user_id)} className="gap-1">
                        <CheckCircle className="h-3 w-3" /> Approve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
