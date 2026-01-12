import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, History } from 'lucide-react';
import { format } from 'date-fns';
import { Leave } from '@/types/leave';

interface LeaveHistoryTableProps {
  leaves: Leave[];
  onDelete: (id: string) => Promise<void>;
}

export function LeaveHistoryTable({ leaves, onDelete }: LeaveHistoryTableProps) {
  const [filter, setFilter] = useState<'all' | 'annual' | 'sick' | 'other'>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');

  const years = [...new Set(leaves.map(l => new Date(l.start_date).getFullYear()))].sort((a, b) => b - a);

  const filteredLeaves = leaves.filter(l => {
    const matchesType = filter === 'all' || l.leave_type === filter;
    const matchesYear = yearFilter === 'all' || new Date(l.start_date).getFullYear().toString() === yearFilter;
    return matchesType && matchesYear;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'annual': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'sick': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'other': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Leave History
          </CardTitle>
          <div className="flex gap-2">
            <Select value={filter} onValueChange={(v: 'all' | 'annual' | 'sick' | 'other') => setFilter(v)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="sick">Sick</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredLeaves.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No leaves recorded yet. Log your first leave above!
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell>
                    <Badge className={getTypeColor(leave.leave_type)}>
                      {leave.leave_type.charAt(0).toUpperCase() + leave.leave_type.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(leave.start_date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{format(new Date(leave.end_date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell className="font-medium">{leave.days_used}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(leave.status)}>
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {leave.notes || '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(leave.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
