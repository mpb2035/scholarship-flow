import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Leave } from '@/types/leave';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, startOfYear, endOfYear } from 'date-fns';

interface LeaveOverviewChartProps {
  leaves: Leave[];
}

export function LeaveOverviewChart({ leaves }: LeaveOverviewChartProps) {
  const currentYear = new Date().getFullYear();
  const approvedLeaves = leaves.filter(l => l.status === 'approved');

  // Monthly breakdown for current year
  const monthlyData = eachMonthOfInterval({
    start: startOfYear(new Date()),
    end: endOfYear(new Date()),
  }).map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);

    const monthLeaves = approvedLeaves.filter(l => {
      const leaveStart = new Date(l.start_date);
      return leaveStart >= monthStart && leaveStart <= monthEnd;
    });

    return {
      month: format(month, 'MMM'),
      annual: monthLeaves.filter(l => l.leave_type === 'annual').reduce((sum, l) => sum + l.days_used, 0),
      sick: monthLeaves.filter(l => l.leave_type === 'sick').reduce((sum, l) => sum + l.days_used, 0),
      other: monthLeaves.filter(l => l.leave_type === 'other').reduce((sum, l) => sum + l.days_used, 0),
    };
  });

  // Yearly breakdown
  const years = [...new Set(approvedLeaves.map(l => new Date(l.start_date).getFullYear()))].sort();
  const yearlyData = years.map(year => {
    const yearLeaves = approvedLeaves.filter(l => new Date(l.start_date).getFullYear() === year);
    return {
      year: year.toString(),
      annual: yearLeaves.filter(l => l.leave_type === 'annual').reduce((sum, l) => sum + l.days_used, 0),
      sick: yearLeaves.filter(l => l.leave_type === 'sick').reduce((sum, l) => sum + l.days_used, 0),
      other: yearLeaves.filter(l => l.leave_type === 'other').reduce((sum, l) => sum + l.days_used, 0),
    };
  });

  // Type distribution for pie chart
  const typeDistribution = [
    { name: 'Annual', value: approvedLeaves.filter(l => l.leave_type === 'annual' && new Date(l.start_date).getFullYear() === currentYear).reduce((sum, l) => sum + l.days_used, 0), color: '#10b981' },
    { name: 'Sick', value: approvedLeaves.filter(l => l.leave_type === 'sick' && new Date(l.start_date).getFullYear() === currentYear).reduce((sum, l) => sum + l.days_used, 0), color: '#f59e0b' },
    { name: 'Other', value: approvedLeaves.filter(l => l.leave_type === 'other' && new Date(l.start_date).getFullYear() === currentYear).reduce((sum, l) => sum + l.days_used, 0), color: '#3b82f6' },
  ].filter(d => d.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="monthly" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="monthly">Monthly ({currentYear})</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="monthly" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="annual" stackId="a" fill="#10b981" name="Annual" />
                <Bar dataKey="sick" stackId="a" fill="#f59e0b" name="Sick" />
                <Bar dataKey="other" stackId="a" fill="#3b82f6" name="Other" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="yearly" className="h-[300px]">
            {yearlyData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No historical data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="year" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="annual" fill="#10b981" name="Annual" />
                  <Bar dataKey="sick" fill="#f59e0b" name="Sick" />
                  <Bar dataKey="other" fill="#3b82f6" name="Other" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </TabsContent>

          <TabsContent value="distribution" className="h-[300px]">
            {typeDistribution.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No leave data for {currentYear}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {typeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
