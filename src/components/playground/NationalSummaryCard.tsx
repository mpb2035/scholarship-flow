import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NationalStats } from '@/data/playgroundData';

interface NationalSummaryCardProps {
  stats: NationalStats;
  onCommentClick: (label: string) => void;
}

export function NationalSummaryCard({ stats, onCommentClick }: NationalSummaryCardProps) {
  return (
    <div className="col-span-full bg-[hsl(210,80%,28%)] text-white rounded-3xl p-6 md:p-8 border-4 border-[hsl(210,20%,80%)] grid md:grid-cols-2 gap-6 items-center">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">🇧🇳 Brunei Darussalam</h1>
        <p className="text-white/80 mb-6">Global Talent Competitiveness Index Summary</p>
        
        <div className="flex gap-8 md:gap-10">
          <div>
            <span className="text-xs uppercase text-white/60 tracking-wide">2023 Rank</span>
            <div className="text-3xl md:text-4xl font-bold">#{stats.rank_2023}</div>
          </div>
          <div className="border-l border-white/30 pl-8 md:pl-10">
            <span className="text-xs uppercase text-white/60 tracking-wide">2025 Rank</span>
            <div className="text-3xl md:text-4xl font-bold">#{stats.rank_2025}</div>
            <span className={stats.rank_change < 0 ? 'text-red-300 font-semibold text-sm' : 'text-green-300 font-semibold text-sm'}>
              📉 {stats.rank_change} Positions
            </span>
          </div>
        </div>
      </div>
      
      <div className="text-right">
        <span className="text-xs uppercase text-white/60 tracking-wide">Overall Score</span>
        <div className="text-5xl md:text-6xl font-extrabold">{stats.score_2025}</div>
        <p className="text-white/80 mt-2">
          Score Delta: <span className={stats.score_change < 0 ? 'text-red-300 font-bold' : 'text-green-300 font-bold'}>
            {stats.score_change} pts
          </span>
        </p>
        <Button 
          variant="outline" 
          className="mt-4 w-full border-white/40 bg-white/10 text-white hover:bg-white/20 rounded-xl"
          onClick={() => onCommentClick('Global Strategy')}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Add Executive Feedback
        </Button>
      </div>
    </div>
  );
}
