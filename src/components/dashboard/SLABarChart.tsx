import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Matter } from '@/types/matter';

interface SLABarChartProps {
  matters: Matter[];
  onBarClick?: (slaStatus: string) => void;
}

// Map display names to filter values
const SLA_FILTER_MAP: Record<string, string> = {
  'Within SLA': 'Within SLA',
  'At Risk': 'At Risk',
  'Critical': 'Critical',
  'Overdue': 'Overdue',
  'Completed': 'Completed',
};

export function SLABarChart({ matters, onBarClick }: SLABarChartProps) {
  const grouped = matters.reduce((acc, matter) => {
    const status = matter.slaStatus;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = [
    { name: 'Within SLA', value: grouped['Within SLA'] || 0, color: 'hsl(142, 70%, 45%)' },
    { name: 'At Risk', value: grouped['At Risk'] || 0, color: 'hsl(45, 90%, 50%)' },
    { name: 'Critical', value: grouped['Critical'] || 0, color: 'hsl(38, 92%, 50%)' },
    { name: 'Overdue', value: grouped['Overdue'] || 0, color: 'hsl(0, 70%, 50%)' },
    { name: 'Completed', value: (grouped['Completed'] || 0) + (grouped['Completed Overdue'] || 0), color: 'hsl(200, 70%, 50%)' },
  ];

  const handleClick = (entry: { name: string }) => {
    if (onBarClick) {
      const filterValue = SLA_FILTER_MAP[entry.name] || entry.name;
      onBarClick(filterValue);
    }
  };

  return (
    <div className="glass-card p-6 h-[360px]">
      <h3 className="font-display text-lg font-semibold gold-text mb-4">
        SLA Compliance
      </h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart 
          data={data} 
          layout="vertical" 
          margin={{ left: 20 }}
          style={{ cursor: onBarClick ? 'pointer' : 'default' }}
        >
          <XAxis type="number" stroke="hsl(45, 20%, 40%)" />
          <YAxis 
            type="category" 
            dataKey="name" 
            stroke="hsl(45, 20%, 40%)"
            tick={{ fill: 'hsl(45, 30%, 90%)', fontSize: 12 }}
            width={80}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(20, 10%, 12%)',
              border: '1px solid hsl(45, 30%, 20%)',
              borderRadius: '8px',
              color: 'hsl(45, 30%, 90%)',
            }}
          />
          <Bar 
            dataKey="value" 
            radius={[0, 4, 4, 0]}
            onClick={(_, index) => handleClick(data[index])}
            style={{ cursor: 'pointer' }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
