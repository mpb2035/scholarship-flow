import { AlertTriangle, Clock, Building2, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { allDataGaps, suspiciousDataMovements } from "@/data/gtciData";

export function GTCIDataGapsTable() {
  return (
    <div className="space-y-6">
      {/* Missing Data */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Missing Data That Hurts Ranking (13 Indicators)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Indicator</TableHead>
                  <TableHead>Int'l Source</TableHead>
                  <TableHead>Local Owner</TableHead>
                  <TableHead>Action Required</TableHead>
                  <TableHead>Deadline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allDataGaps.map((gap, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium text-sm">{gap.indicator}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{gap.source}</TableCell>
                    <TableCell className="text-sm">{gap.localOwner}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{gap.action}</TableCell>
                    <TableCell>
                      <Badge variant={gap.deadline.includes("Q1") ? "destructive" : "secondary"}>{gap.deadline}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Suspicious Data Movements */}
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-500" />
            Data With Suspicious Movements (Requires Validation)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Indicator</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Investigation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suspiciousDataMovements.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium text-sm">{item.indicator}</TableCell>
                    <TableCell className="text-sm text-red-600 font-mono">{item.change}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">{item.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs">{item.investigation}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Governance Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Governance Structure to Fix Data Gaps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm">
            <div className="text-center mb-4 p-3 bg-primary/10 rounded-lg">
              <div className="font-bold">NATIONAL COMPETITIVENESS TASKFORCE (NCTF)</div>
              <div className="text-xs text-muted-foreground">
                Established: Q1 2026 | Chair: MOE (in coordination with MPEC) | Secretariat: DEPS
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-background rounded-lg p-3 border">
                <div className="font-semibold text-xs mb-2">📊 WG-1: DATA COLLECTION</div>
                <div className="text-xs text-muted-foreground">Lead: MOFE Statistics</div>
                <div className="text-xs">Task: Collect missing 12 indicators by Q2 2026</div>
              </div>
              <div className="bg-background rounded-lg p-3 border">
                <div className="font-semibold text-xs mb-2">📊 WG-2: DATA VALIDATION</div>
                <div className="text-xs text-muted-foreground">Lead: DEPS</div>
                <div className="text-xs">Task: Audit suspicious movements, verify sources</div>
              </div>
              <div className="bg-background rounded-lg p-3 border">
                <div className="font-semibold text-xs mb-2">📊 WG-3: POLICY RESPONSE</div>
                <div className="text-xs text-muted-foreground">Lead: MOE/MPEC</div>
                <div className="text-xs">Task: Design interventions for 10 lowest indicators</div>
              </div>
              <div className="bg-background rounded-lg p-3 border">
                <div className="font-semibold text-xs mb-2">📊 WG-4: INTERNATIONAL COORDINATION</div>
                <div className="text-xs text-muted-foreground">Lead: MTIC</div>
                <div className="text-xs">Task: Engage with GTCI team, understand methodology</div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-6">
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" /> Timeline for Data Submission
            </h4>
            <div className="space-y-2">
              {[
                {
                  period: "Q4 2025 (NOW)",
                  tasks: [
                    "Form National Competitiveness Taskforce",
                    "Assign data collection leads",
                    "Brief all agencies on GTCI methodology",
                  ],
                },
                {
                  period: "Q1 2026",
                  tasks: [
                    "Submit: AI Skills Migration, WEF EOS surveys",
                    "Submit: Labour Productivity data",
                    "Validate: Tertiary Ed Expenditure with World Bank",
                  ],
                },
                {
                  period: "Q2 2026",
                  tasks: [
                    "Submit: Internet Access in Schools",
                    "Submit: Firms with Website data",
                    "Final validation of all suspicious indicators",
                  ],
                },
                {
                  period: "Q3-Q4 2026",
                  tasks: [
                    "GTCI processes and validates all submissions",
                    "Brunei achieves IMPROVED ranking for GTCI 2027",
                  ],
                },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 text-sm">
                  <Badge variant={idx === 0 ? "default" : "outline"} className="shrink-0">
                    {item.period}
                  </Badge>
                  <div className="text-muted-foreground">{item.tasks.join(" | ")}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
