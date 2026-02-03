import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminUserManagement } from '@/hooks/usePagePermissions';
import { useToast } from '@/hooks/use-toast';
import { Users, Shield, CheckSquare, XSquare, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export function UserPermissionsManager() {
  const { users, loading, updateUserRole, updatePagePermission, setAllPermissions, allPages, refetch } = useAdminUserManagement();
  const { toast } = useToast();
  const [updating, setUpdating] = useState<string | null>(null);
  const [newUserId, setNewUserId] = useState('');

  const handleRoleChange = async (userId: string, role: 'admin' | 'user') => {
    setUpdating(userId);
    try {
      await updateUserRole(userId, role);
      toast({
        title: 'Role Updated',
        description: `User role has been changed to ${role}.`,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update user role.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  const handlePermissionChange = async (userId: string, pagePath: string, canAccess: boolean) => {
    setUpdating(`${userId}-${pagePath}`);
    try {
      await updatePagePermission(userId, pagePath, canAccess);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update permission.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleGrantAll = async (userId: string) => {
    setUpdating(`${userId}-all`);
    try {
      await setAllPermissions(userId, true);
      toast({
        title: 'Permissions Updated',
        description: 'All page access has been granted.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to grant permissions.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleRevokeAll = async (userId: string) => {
    setUpdating(`${userId}-all`);
    try {
      await setAllPermissions(userId, false);
      toast({
        title: 'Permissions Updated',
        description: 'All page access has been revoked.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to revoke permissions.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleAddUser = async () => {
    if (!newUserId.trim()) return;
    
    setUpdating('new-user');
    try {
      await updateUserRole(newUserId.trim(), 'user');
      setNewUserId('');
      toast({
        title: 'User Added',
        description: 'New user has been added with default role.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to add user. Make sure the user ID is valid.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Access Control
        </CardTitle>
        <CardDescription>
          Manage user roles and page access permissions. Admins have full access to all pages.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new user section */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter User ID to add..."
            value={newUserId}
            onChange={(e) => setNewUserId(e.target.value)}
            className="max-w-md"
          />
          <Button 
            onClick={handleAddUser} 
            disabled={!newUserId.trim() || updating === 'new-user'}
          >
            {updating === 'new-user' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add User'}
          </Button>
          <Button variant="outline" onClick={refetch}>
            Refresh
          </Button>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No users found. Users will appear here after they sign up.
          </div>
        ) : (
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">User ID</TableHead>
                  <TableHead className="w-[120px]">Role</TableHead>
                  <TableHead className="w-[120px]">Quick Actions</TableHead>
                  {allPages.map((page) => (
                    <TableHead key={page.path} className="text-center min-w-[100px]">
                      {page.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell className="font-mono text-xs">
                      {user.user_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role || 'user'}
                        onValueChange={(value) => handleRoleChange(user.user_id, value as 'admin' | 'user')}
                        disabled={updating === user.user_id}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              Admin
                            </div>
                          </SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGrantAll(user.user_id)}
                          disabled={updating?.startsWith(user.user_id) || user.role === 'admin'}
                          title="Grant all access"
                        >
                          <CheckSquare className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRevokeAll(user.user_id)}
                          disabled={updating?.startsWith(user.user_id) || user.role === 'admin'}
                          title="Revoke all access"
                        >
                          <XSquare className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                    {allPages.map((page) => (
                      <TableCell key={page.path} className="text-center">
                        <Checkbox
                          checked={user.role === 'admin' || user.permissions[page.path] === true}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(user.user_id, page.path, checked === true)
                          }
                          disabled={
                            user.role === 'admin' || 
                            updating === `${user.user_id}-${page.path}` ||
                            updating === `${user.user_id}-all`
                          }
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
