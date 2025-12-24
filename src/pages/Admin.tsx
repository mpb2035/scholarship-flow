import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Users, 
  Database, 
  Settings, 
  Loader2,
  Shield,
  Trash2,
  Plus
} from 'lucide-react';

interface UserWithRole {
  id: string;
  email: string;
  role: 'admin' | 'user' | null;
  created_at: string;
}

interface MatterRecord {
  id: string;
  case_id: string;
  case_title: string;
  case_type: string;
  priority: string;
  overall_status: string;
  sla_status: string;
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [matters, setMatters] = useState<MatterRecord[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMatters, setLoadingMatters] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user) {
        navigate('/auth');
      } else if (!isAdmin) {
        toast({
          title: 'Access Denied',
          description: 'You do not have admin privileges.',
          variant: 'destructive',
        });
        navigate('/');
      }
    }
  }, [user, isAdmin, authLoading, roleLoading, navigate, toast]);

  // Fetch users with roles
  useEffect(() => {
    async function fetchUsers() {
      if (!isAdmin) return;
      
      setLoadingUsers(true);
      try {
        // Get all users from user_roles
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role, created_at');

        if (rolesError) throw rolesError;

        // Map to user format
        const usersWithRoles: UserWithRole[] = (rolesData || []).map(r => ({
          id: r.user_id,
          email: 'Loading...',
          role: r.role as 'admin' | 'user',
          created_at: r.created_at,
        }));

        setUsers(usersWithRoles);
      } catch (err) {
        console.error('Error fetching users:', err);
        toast({
          title: 'Error',
          description: 'Failed to load users.',
          variant: 'destructive',
        });
      } finally {
        setLoadingUsers(false);
      }
    }

    if (isAdmin) fetchUsers();
  }, [isAdmin, toast]);

  // Fetch matters
  useEffect(() => {
    async function fetchMatters() {
      if (!isAdmin) return;
      
      setLoadingMatters(true);
      try {
        const { data, error } = await supabase
          .from('matters')
          .select('id, case_id, case_title, case_type, priority, overall_status, sla_status, created_at')
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;
        setMatters(data || []);
      } catch (err) {
        console.error('Error fetching matters:', err);
        toast({
          title: 'Error',
          description: 'Failed to load matters.',
          variant: 'destructive',
        });
      } finally {
        setLoadingMatters(false);
      }
    }

    if (isAdmin) fetchMatters();
  }, [isAdmin, toast]);

  const handleUpdateRole = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast({
        title: 'Role Updated',
        description: `User role changed to ${newRole}.`,
      });
    } catch (err) {
      console.error('Error updating role:', err);
      toast({
        title: 'Error',
        description: 'Failed to update role.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMatter = async (id: string) => {
    if (!confirm('Are you sure you want to delete this matter?')) return;

    try {
      const { error } = await supabase
        .from('matters')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMatters(prev => prev.filter(m => m.id !== id));
      toast({
        title: 'Matter Deleted',
        description: 'The matter has been removed.',
      });
    } catch (err) {
      console.error('Error deleting matter:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete matter.',
        variant: 'destructive',
      });
    }
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold gold-text flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">Manage users, data, and settings</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold gold-text">{users.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Matters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold gold-text">{matters.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Admin Count
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold gold-text">
                {users.filter(u => u.role === 'admin').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="matters" className="gap-2">
              <Database className="h-4 w-4" />
              Matters
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage user roles</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map(u => (
                        <TableRow key={u.id}>
                          <TableCell className="font-mono text-xs">
                            {u.id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>
                            <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(u.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={u.role || 'user'}
                              onValueChange={(val) => handleUpdateRole(u.id, val as 'admin' | 'user')}
                              disabled={u.id === user?.id}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Matters Tab */}
          <TabsContent value="matters">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>View and delete matter records</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingMatters ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Case ID</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>SLA</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {matters.map(m => (
                          <TableRow key={m.id}>
                            <TableCell className="font-mono">{m.case_id}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{m.case_title}</TableCell>
                            <TableCell>{m.case_type}</TableCell>
                            <TableCell>
                              <Badge variant={
                                m.priority === 'High' ? 'destructive' : 
                                m.priority === 'Medium' ? 'default' : 'secondary'
                              }>
                                {m.priority}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs">{m.overall_status}</TableCell>
                            <TableCell>
                              <Badge variant={
                                m.sla_status === 'Overdue' ? 'destructive' :
                                m.sla_status === 'At Risk' ? 'outline' : 'secondary'
                              }>
                                {m.sla_status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteMatter(m.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
