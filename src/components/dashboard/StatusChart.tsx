import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DashboardStats } from '@/types/matter';

interface StatusChartProps {
  stats: DashboardStats;
}

const COLORS = {
  pending: 'hsl(45, 90%, 50%)',
  inProcess: 'hsl(200, 70%, 50%)',
  query: 'hsl(280, 70%, 50%)',
  approved: 'hsl(142, 70%, 45%)',
  overdue: 'hsl(0, 70%, 50%)',
};

export function StatusChart({ stats }: StatusChartProps) {
  const data = [
    { name: 'Pending SUT HE', value: stats.pendingSutHe, color: COLORS.pending },
    { name: 'In Process', value: stats.inProcess, color: COLORS.inProcess },
    { name: 'Query Response', value: stats.returnedForQuery, color: COLORS.query },
    { name: 'Pending Higher Up', value: stats.pendingHigherUp, color: COLORS.approved },
    { name: 'SLA Breached', value: stats.slaBreached, color: COLORS.overdue },
  ].filter(d => d.value > 0);

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
              <span style={{ color: 'hsl(45, 30%, 90%)' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
