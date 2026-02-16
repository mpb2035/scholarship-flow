import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useAttachmentOverseas, AttachmentOverseas as AttachmentType } from '@/hooks/useAttachmentOverseas';
import { AttachmentCleanupDialog } from '@/components/dashboard/AttachmentCleanupDialog';
import { AttachmentScorecardDialog } from '@/components/dashboard/AttachmentScorecardDialog';
import { AttachmentEditDialog } from '@/components/dashboard/AttachmentEditDialog';
import { 
  Plane, 
  Users, 
  Building2, 
  GraduationCap, 
  Calendar, 
  MapPin, 
  Clock,
  CheckCircle2,
  TrendingUp,
  Pencil
} from 'lucide-react';

export default function AttachmentOverseas() {
  const { attachments, stats, loading, refreshAttachments, updateAttachment } = useAttachmentOverseas();
  const [editingAttachment, setEditingAttachment] = useState<AttachmentType | null>(null);

  const activeAttachments = useMemo(() => {
    const today = new Date();
    return attachments.filter(a => new Date(a.programEndDate) >= today);
  }, [attachments]);

  const handleSaveAttachment = async (id: string, updates: Partial<AttachmentType>) => {
    await updateAttachment(id, updates);
    await refreshAttachments();
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-3xl font-display font-bold gold-text flex items-center gap-2 sm:gap-3">
            <Plane className="h-6 w-6 sm:h-8 sm:w-8" />
            Attachment Overseas
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track students and programmes abroad
          </p>
        </div>
        <AttachmentCleanupDialog onCleanupComplete={refreshAttachments} />
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AttachmentScorecardDialog type="total" stats={stats} attachments={attachments}>
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                Total Programmes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalProgrammes}</div>
              <p className="text-xs text-muted-foreground mt-1">Submitted to date • Click for details</p>
            </CardContent>
          </Card>
        </AttachmentScorecardDialog>

        <AttachmentScorecardDialog type="active" stats={stats} attachments={attachments}>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Active Programmes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{stats.activeProgrammes}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently ongoing • Click for details</p>
            </CardContent>
          </Card>
        </AttachmentScorecardDialog>

        <AttachmentScorecardDialog type="students" stats={stats} attachments={attachments}>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Students Overseas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">{stats.studentsCurrentlyOverseas}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently abroad • Click for details</p>
            </CardContent>
          </Card>
        </AttachmentScorecardDialog>

        <AttachmentScorecardDialog type="returned" stats={stats} attachments={attachments}>
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20 cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-orange-500" />
                Returned to Brunei
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">{stats.returnedToBrunei}</div>
              <p className="text-xs text-muted-foreground mt-1">Programmes completed • Click for details</p>
            </CardContent>
          </Card>
        </AttachmentScorecardDialog>
      </div>

      {/* Institution Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttachmentScorecardDialog type="institution" stats={stats} attachments={attachments}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Institution Breakdown
                <span className="text-xs text-muted-foreground ml-auto">Click for details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.byInstitution.map((inst) => (
                <div key={inst.institution} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={inst.institution === 'PB' ? 'default' : 'secondary'}>
                        {inst.institution}
                      </Badge>
                      <span className="text-sm font-medium">
                        {inst.institution === 'PB' ? 'Politeknik Brunei' : 'IBTE'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{inst.count}</span>
                      <span className="text-muted-foreground text-sm ml-1">programmes</span>
                      <span className="text-muted-foreground mx-2">|</span>
                      <span className="font-bold text-primary">{inst.studentCount}</span>
                      <span className="text-muted-foreground text-sm ml-1">students</span>
                    </div>
                  </div>
                  <Progress 
                    value={stats.totalProgrammes > 0 ? (inst.count / stats.totalProgrammes) * 100 : 0} 
                    className="h-2"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </AttachmentScorecardDialog>

        <AttachmentScorecardDialog type="country" stats={stats} attachments={attachments}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Countries
                <span className="text-xs text-muted-foreground ml-auto">Click for details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.byCountry.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No data yet</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {stats.byCountry.map(({ country, count }) => (
                    <Badge key={country} variant="outline" className="text-sm py-1 px-3">
                      {country}
                      <span className="ml-2 bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs">
                        {count}
                      </span>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </AttachmentScorecardDialog>
      </div>

      {/* Programme Breakdown with Days Remaining */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Programme Status & Days Remaining
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.programmeBreakdown.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No programmes logged yet. Add an "Attachment Overseas" matter to see data here.
            </p>
          ) : (
            <div className="space-y-3">
              {stats.programmeBreakdown.map((prog) => (
                <div 
                  key={prog.programme} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <Badge variant={prog.isActive ? 'default' : 'secondary'} className="shrink-0">
                      {prog.isActive ? 'Active' : 'Done'}
                    </Badge>
                    <span className="font-medium text-sm sm:text-base truncate">{prog.programme}</span>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-6 pl-2 sm:pl-0">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-bold text-sm">{prog.studentCount}</span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">students</span>
                    </div>
                    {prog.isActive && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className={`font-bold text-sm ${prog.daysRemaining <= 7 ? 'text-destructive' : prog.daysRemaining <= 30 ? 'text-warning' : 'text-green-500'}`}>
                          {prog.daysRemaining}
                        </span>
                        <span className="text-xs text-muted-foreground">days</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Attachments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-primary" />
            Current Overseas Attachments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeAttachments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No active overseas attachments at the moment.
            </p>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="sm:hidden space-y-3">
                {activeAttachments.map((att) => {
                  const endDate = new Date(att.programEndDate);
                  const today = new Date();
                  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

                  return (
                    <div key={att.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={att.institution === 'PB' ? 'default' : 'secondary'}>
                          {att.institution}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm ${daysRemaining <= 7 ? 'text-destructive' : daysRemaining <= 30 ? 'text-warning' : 'text-green-500'}`}>
                            {daysRemaining}d left
                          </span>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditingAttachment(att)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {att.programmes.map((prog, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{prog}</Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{att.country} • {att.destinationInstitution}</span>
                        <span className="font-bold text-primary">{att.studentCount} students</span>
                      </div>
                      <Badge variant={att.fundingType === 'Organizer Funded' ? 'default' : 'outline'} className="text-xs">
                        {att.fundingType}
                      </Badge>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Institution</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Programme(s)</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Country</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Destination</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Students</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Duration</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Days Left</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Funding</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeAttachments.map((att) => {
                      const startDate = new Date(att.programStartDate);
                      const endDate = new Date(att.programEndDate);
                      const today = new Date();
                      const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
                      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

                      return (
                        <tr key={att.id} className="border-b border-border/30 hover:bg-muted/30">
                          <td className="py-3 px-3">
                            <Badge variant={att.institution === 'PB' ? 'default' : 'secondary'}>
                              {att.institution}
                            </Badge>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex flex-wrap gap-1">
                              {att.programmes.map((prog, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{prog}</Badge>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-3 font-medium">{att.country}</td>
                          <td className="py-3 px-3 text-sm">{att.destinationInstitution}</td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-primary">{att.studentCount}</span>
                          </td>
                          <td className="py-3 px-3 text-sm text-muted-foreground">{totalDays} days</td>
                          <td className="py-3 px-3">
                            <span className={`font-bold ${daysRemaining <= 7 ? 'text-destructive' : daysRemaining <= 30 ? 'text-warning' : 'text-green-500'}`}>
                              {daysRemaining}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <Badge variant={att.fundingType === 'Organizer Funded' ? 'default' : 'outline'}>
                              {att.fundingType}
                            </Badge>
                          </td>
                          <td className="py-3 px-3">
                            <Button variant="ghost" size="sm" onClick={() => setEditingAttachment(att)} className="h-8 w-8 p-0">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingAttachment && (
        <AttachmentEditDialog
          attachment={editingAttachment}
          open={!!editingAttachment}
          onOpenChange={(open) => !open && setEditingAttachment(null)}
          onSave={handleSaveAttachment}
        />
      )}
    </div>
  );
}
