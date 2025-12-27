import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DashboardStats } from '@/types/matter';

interface StatusChartProps {
  stats: DashboardStats;
  onSegmentClick?: (status: string) => void;
}

const COLORS = {
  pending: 'hsl(45, 90%, 50%)',
  inProcess: 'hsl(200, 70%, 50%)',
  query: 'hsl(280, 70%, 50%)',
  approved: 'hsl(142, 70%, 45%)',
  overdue: 'hsl(0, 70%, 50%)',
};

// Map display names to filter values (Query Response maps to multiple statuses)
const STATUS_FILTER_MAP: Record<string, string | string[]> = {
  'Pending SUT HE': 'Pending SUT HE Review',
  'In Process': 'In Process',
  'Query Response': ['Returned for Query', 'Dept to Respond – SUT HE Query', 'Dept to Respond – Higher Up Query'],
  'Pending Higher Up': 'Pending Higher Up Approval',
  'SLA Breached': 'sla_breached', // Special case for SLA filter
};

export function StatusChart({ stats, onSegmentClick }: StatusChartProps) {
const data = [
    { name: 'Pending SUT HE', value: stats.pendingSutHe, color: COLORS.pending },
    { name: 'In Process', value: stats.inProcess, color: COLORS.inProcess },
    { name: 'Query Response', value: stats.returnedForQuery, color: COLORS.query },
    { name: 'Pending Higher Up', value: stats.pendingHigherUp, color: COLORS.approved },
  ].filter(d => d.value > 0);

  const handleClick = (entry: { name: string }) => {
    if (onSegmentClick) {
      const filterValue = STATUS_FILTER_MAP[entry.name] || entry.name;
      // Pass filter value as JSON string if it's an array, otherwise as plain string
      onSegmentClick(Array.isArray(filterValue) ? JSON.stringify(filterValue) : filterValue);
    }
  };

  return (
    <div className="glass-card p-6 h-[360px]">
      <h3 className="font-display text-lg font-semibold gold-text mb-4">
        Status Distribution
      </h3>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
            stroke="transparent"
            style={{ cursor: onSegmentClick ? 'pointer' : 'default' }}
            onClick={(_, index) => handleClick(data[index])}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(20, 10%, 12%)',
              border: '1px solid hsl(45, 30%, 20%)',
              borderRadius: '8px',
              color: 'hsl(45, 30%, 90%)',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span style={{ color: 'hsl(45, 30%, 90%)', cursor: 'pointer' }}>{value}</span>
            )}
            onClick={(e) => handleClick({ name: e.value as string })}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
