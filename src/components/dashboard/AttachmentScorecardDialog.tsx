import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AttachmentOverseas, AttachmentStats } from '@/hooks/useAttachmentOverseas';
import { 
  GraduationCap, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Building2, 
  MapPin,
  Calendar,
  ExternalLink
} from 'lucide-react';

interface ScorecardDialogProps {
  type: 'total' | 'active' | 'students' | 'returned' | 'institution' | 'country';
  stats: AttachmentStats;
  attachments: AttachmentOverseas[];
  children: React.ReactNode;
}

export function AttachmentScorecardDialog({ type, stats, attachments, children }: ScorecardDialogProps) {
  const [open, setOpen] = useState(false);
  const today = new Date();

  const getDialogContent = () => {
    switch (type) {
      case 'total':
        return {
          title: 'Total Programmes Overview',
          icon: <GraduationCap className="h-5 w-5 text-primary" />,
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-secondary/30">
                  <div className="text-2xl font-bold text-primary">{stats.totalProgrammes}</div>
                  <div className="text-sm text-muted-foreground">Total Programmes</div>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30">
                  <div className="text-2xl font-bold text-blue-500">
                    {attachments.reduce((sum, a) => sum + a.studentCount, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Students</div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">All Programmes</h4>
                {attachments.map((att) => (
                  <div key={att.id} className="p-3 rounded-lg border bg-card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={att.institution === 'PB' ? 'default' : 'secondary'}>
                          {att.institution}
                        </Badge>
                        <span className="font-medium">{att.destinationInstitution}</span>
                      </div>
                      <Badge variant="outline">{att.country}</Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {att.programmes.map((prog, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{prog}</Badge>
                      ))}
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {att.studentCount} students
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {att.programStartDate} - {att.programEndDate}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ),
        };

      case 'active':
        const activeList = attachments.filter(a => new Date(a.programEndDate) >= today);
        return {
          title: 'Active Programmes',
          icon: <TrendingUp className="h-5 w-5 text-green-500" />,
          content: (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="text-2xl font-bold text-green-500">{stats.activeProgrammes}</div>
                <div className="text-sm text-muted-foreground">Currently Active Programmes</div>
              </div>
              {activeList.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No active programmes</p>
              ) : (
                <div className="space-y-2">
                  {activeList.map((att) => {
                    const endDate = new Date(att.programEndDate);
                    const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={att.id} className="p-3 rounded-lg border bg-card">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{att.destinationInstitution}</span>
                          <span className={`font-bold ${daysRemaining <= 7 ? 'text-destructive' : daysRemaining <= 30 ? 'text-warning' : 'text-green-500'}`}>
                            {daysRemaining} days left
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {att.country} • {att.studentCount} students • {att.programmes.join(', ')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ),
        };

      case 'students':
        const currentlyOverseas = attachments.filter(a => new Date(a.programEndDate) >= today);
        return {
          title: 'Students Currently Overseas',
          icon: <Users className="h-5 w-5 text-blue-500" />,
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="text-2xl font-bold text-blue-500">{stats.studentsCurrentlyOverseas}</div>
                  <div className="text-sm text-muted-foreground">Students Abroad</div>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30">
                  <div className="text-2xl font-bold">{currentlyOverseas.length}</div>
                  <div className="text-sm text-muted-foreground">Active Programmes</div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Breakdown by Programme</h4>
                {currentlyOverseas.map((att) => (
                  <div key={att.id} className="p-3 rounded-lg border bg-card flex items-center justify-between">
                    <div>
                      <div className="font-medium">{att.destinationInstitution}</div>
                      <div className="text-sm text-muted-foreground">{att.country} • {att.programmes.join(', ')}</div>
                    </div>
                    <div className="text-xl font-bold text-blue-500">{att.studentCount}</div>
                  </div>
                ))}
              </div>
            </div>
          ),
        };

      case 'returned':
        const completedList = attachments.filter(a => new Date(a.programEndDate) < today);
        return {
          title: 'Returned to Brunei',
          icon: <CheckCircle2 className="h-5 w-5 text-orange-500" />,
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <div className="text-2xl font-bold text-orange-500">{stats.returnedToBrunei}</div>
                  <div className="text-sm text-muted-foreground">Students Returned</div>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30">
                  <div className="text-2xl font-bold">{completedList.length}</div>
                  <div className="text-sm text-muted-foreground">Completed Programmes</div>
                </div>
              </div>
              {completedList.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No completed programmes yet</p>
              ) : (
                <div className="space-y-2">
                  <h4 className="font-medium">Completed Programmes</h4>
                  {completedList.map((att) => (
                    <div key={att.id} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{att.destinationInstitution}</span>
                        <Badge variant="secondary">Completed</Badge>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {att.country} • {att.studentCount} students • Ended: {att.programEndDate}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ),
        };

      case 'institution':
        return {
          title: 'Institution Breakdown Details',
          icon: <Building2 className="h-5 w-5 text-primary" />,
          content: (
            <div className="space-y-4">
              {stats.byInstitution.map((inst) => {
                const instAttachments = attachments.filter(a => a.institution === inst.institution);
                return (
                  <div key={inst.institution} className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                      <div className="flex items-center gap-2">
                        <Badge variant={inst.institution === 'PB' ? 'default' : 'secondary'}>
                          {inst.institution}
                        </Badge>
                        <span className="font-medium">
                          {inst.institution === 'PB' ? 'Politeknik Brunei' : 'IBTE'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{inst.count}</span> programmes •{' '}
                        <span className="font-bold text-primary">{inst.studentCount}</span> students
                      </div>
                    </div>
                    {instAttachments.map((att) => (
                      <div key={att.id} className="ml-4 p-2 rounded border bg-card/50 text-sm">
                        <div className="flex justify-between">
                          <span>{att.destinationInstitution} ({att.country})</span>
                          <span>{att.studentCount} students</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ),
        };

      case 'country':
        return {
          title: 'Countries Overview',
          icon: <MapPin className="h-5 w-5 text-primary" />,
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-secondary/30">
                  <div className="text-2xl font-bold">{stats.byCountry.length}</div>
                  <div className="text-sm text-muted-foreground">Countries</div>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30">
                  <div className="text-2xl font-bold text-primary">{stats.totalProgrammes}</div>
                  <div className="text-sm text-muted-foreground">Total Programmes</div>
                </div>
              </div>
              {stats.byCountry.map(({ country, count }) => {
                const countryAttachments = attachments.filter(a => a.country === country);
                const totalStudents = countryAttachments.reduce((sum, a) => sum + a.studentCount, 0);
                return (
                  <div key={country} className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                      <span className="font-medium">{country}</span>
                      <div>
                        <span className="font-bold">{count}</span> programmes •{' '}
                        <span className="font-bold text-blue-500">{totalStudents}</span> students
                      </div>
                    </div>
                    {countryAttachments.map((att) => (
                      <div key={att.id} className="ml-4 p-2 rounded border bg-card/50 text-sm">
                        <div className="flex justify-between">
                          <span>{att.destinationInstitution}</span>
                          <Badge variant="outline" className="text-xs">{att.institution}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ),
        };

      default:
        return { title: '', icon: null, content: null };
    }
  };

  const { title, icon, content } = getDialogContent();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon}
            {title}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          {content}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
