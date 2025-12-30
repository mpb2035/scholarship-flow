import { FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BentoIndicator } from '@/data/playgroundData';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

interface ExportButtonsProps {
  indicators: BentoIndicator[];
  title: string;
}

export function ExportButtons({ indicators, title }: ExportButtonsProps) {
  const exportToExcel = () => {
    try {
      const data = indicators.map((ind) => ({
        'ID': ind.id,
        'Title': ind.title,
        'Pillar': ind.pillar || '',
        'Category': ind.category,
        'Score 2025': ind.score_2025,
        'Score 2023': ind.score_2023 || '',
        'Trend': ind.trend_direction,
        'Trend Value': ind.trend_value,
        'Status': ind.status,
        'Key Insight': ind.insight,
        'Recommended Action': ind.action,
        'Strategic Recommendation': ind.strategicRecommendation || '',
        'Data Source': ind.dataSource || '',
        'Data Age': ind.dataAge || '',
        'Reliability': ind.reliabilityAssessment || '',
        'Validation Status': ind.validationStatus || '',
        'Quality Rating': ind.quality_rating,
        'Owner': ind.owner || '',
        'Policy Notes': (ind.policyNotes || []).join('; ')
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Scorecards');
      
      // Auto-size columns
      const maxWidth = 50;
      const colWidths = Object.keys(data[0] || {}).map((key) => ({
        wch: Math.min(maxWidth, Math.max(key.length, ...data.map(row => String(row[key as keyof typeof row] || '').length)))
      }));
      ws['!cols'] = colWidths;

      XLSX.writeFile(wb, `${title.replace(/[^a-z0-9]/gi, '_')}_scorecards.xlsx`);
      toast.success('Excel file exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export Excel file');
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let yPos = 20;

      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin, yPos);
      yPos += 15;

      // Date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPos);
      yPos += 10;

      indicators.forEach((ind, index) => {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        // Card header
        doc.setFillColor(30, 64, 114); // Blue header
        doc.rect(margin, yPos, contentWidth, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`${ind.id} - ${ind.title}`, margin + 3, yPos + 8);
        
        // Score on right
        const scoreText = `Score: ${ind.score_2025}`;
        doc.text(scoreText, pageWidth - margin - doc.getTextWidth(scoreText) - 3, yPos + 8);
        yPos += 15;

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);

        // Details
        const details = [
          { label: 'Pillar', value: ind.pillar || 'N/A' },
          { label: 'Category', value: ind.category },
          { label: 'Status', value: ind.status },
          { label: 'Trend', value: `${ind.trend_direction} (${ind.trend_value})` },
        ];

        doc.setFont('helvetica', 'normal');
        details.forEach((d) => {
          doc.setFont('helvetica', 'bold');
          doc.text(`${d.label}: `, margin, yPos);
          doc.setFont('helvetica', 'normal');
          doc.text(d.value, margin + doc.getTextWidth(`${d.label}: `), yPos);
          yPos += 5;
        });

        yPos += 3;

        // Key Insight
        doc.setFont('helvetica', 'bold');
        doc.text('Key Insight:', margin, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        const insightLines = doc.splitTextToSize(ind.insight, contentWidth);
        doc.text(insightLines, margin, yPos);
        yPos += insightLines.length * 4 + 3;

        // Recommended Action
        doc.setFont('helvetica', 'bold');
        doc.text('Recommended Action:', margin, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        const actionLines = doc.splitTextToSize(ind.action, contentWidth);
        doc.text(actionLines, margin, yPos);
        yPos += actionLines.length * 4 + 3;

        // Strategic Recommendation
        if (ind.strategicRecommendation) {
          doc.setFont('helvetica', 'bold');
          doc.text('Strategic Recommendation:', margin, yPos);
          yPos += 5;
          doc.setFont('helvetica', 'normal');
          const stratLines = doc.splitTextToSize(ind.strategicRecommendation, contentWidth);
          doc.text(stratLines, margin, yPos);
          yPos += stratLines.length * 4 + 3;
        }

        // Data Source
        if (ind.dataSource) {
          doc.setFont('helvetica', 'bold');
          doc.text('Data Source:', margin, yPos);
          yPos += 5;
          doc.setFont('helvetica', 'normal');
          doc.text(ind.dataSource, margin, yPos);
          yPos += 7;
        }

        // Separator
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;
      });

      doc.save(`${title.replace(/[^a-z0-9]/gi, '_')}_scorecards.pdf`);
      toast.success('PDF file exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export PDF file');
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={exportToExcel}
        className="border-green-600 text-green-600 hover:bg-green-50"
      >
        <FileSpreadsheet className="h-4 w-4 mr-1.5" />
        Excel
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportToPDF}
        className="border-red-600 text-red-600 hover:bg-red-50"
      >
        <FileText className="h-4 w-4 mr-1.5" />
        PDF
      </Button>
    </div>
  );
}