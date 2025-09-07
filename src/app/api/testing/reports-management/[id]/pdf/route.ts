import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsPDF } from 'jspdf';
import { Decimal } from '@prisma/client/runtime/library';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    console.log('PDF generation started for report ID:', id);
    
    // PDF download is now public for published reports
    // No authentication required for public viewing

    // Get the testing report with related data (public access for published reports)
    const report = await prisma.testingReport.findUnique({
      where: {
        id: id,
        status: 'published'
      },
      include: {
        tool: {
          select: {
            name: true,
            description: true,
            website: true,
            logoUrl: true
          }
        },
        tester: {
          select: {
            name: true,
            email: true,
            role: true
          }
        },
        approver: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!report) {
      console.log('Report not found for ID:', id);
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    console.log('Report found:', {
      id: report.id,
      title: report.title,
      toolName: report.tool.name,
      status: report.status
    });

    // Create PDF using jsPDF
    const doc = new jsPDF();
    let yPosition = 20;

    // Safe score formatting function
    const formatScore = (score: number | string | Decimal | null | undefined): string => {
      if (score === null || score === undefined) return '0.0';
      const numScore = typeof score === 'string' ? parseFloat(score) : 
                      score instanceof Decimal ? score.toNumber() : score;
      return isNaN(numScore) ? '0.0' : numScore.toFixed(1);
    };

    // Helper function to add text with word wrap
    const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      if (isBold) {
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      
      const lines = doc.splitTextToSize(text, maxWidth);
      
      lines.forEach((line: string) => {
        if (yPosition > 280) { // Check if we need a new page
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, margin, yPosition);
        yPosition += fontSize * 0.4; // Line height
      });
      
      yPosition += 5; // Add some space after text
    };

    // Header
    addText('Testing Report', 24, true);
    yPosition += 10;

    // Tool Information
    addText(report.tool.name, 18, true);
    if (report.tool.description) {
      addText(report.tool.description);
    }
    if (report.tool.website) {
      addText(`Website: ${report.tool.website}`);
    }
    yPosition += 10;

    // Report Title and Summary
    addText(report.title, 16, true);
    addText(report.summary);
    yPosition += 10;

    // Scores Section
    if (report.overallScore) {
      addText('Scores', 14, true);
      addText(`Overall Score: ${formatScore(report.overallScore)}/10`);
      if (report.valueScore) addText(`Value Score: ${formatScore(report.valueScore)}/10`);
      if (report.usageScore) addText(`Usage Score: ${formatScore(report.usageScore)}/10`);
      if (report.integrationScore) addText(`Integration Score: ${formatScore(report.integrationScore)}/10`);
      yPosition += 10;
    }

    // Verdict
    if (report.verdict) {
      addText('Verdict', 14, true);
      addText(report.verdict.toUpperCase());
      yPosition += 10;
    }

    // Detailed Analysis
    if (report.detailedAnalysis) {
      addText('Detailed Analysis', 14, true);
      addText(report.detailedAnalysis);
      yPosition += 10;
    }

    // Pros
    if (report.pros && report.pros.length > 0) {
      addText('Pros', 14, true);
      report.pros.forEach((pro, index) => {
        addText(`${index + 1}. ${pro}`);
      });
      yPosition += 10;
    }

    // Cons
    if (report.cons && report.cons.length > 0) {
      addText('Cons', 14, true);
      report.cons.forEach((con, index) => {
        addText(`${index + 1}. ${con}`);
      });
      yPosition += 10;
    }

    // Recommendations
    if (report.recommendations) {
      addText('Recommendations', 14, true);
      addText(report.recommendations);
      yPosition += 10;
    }

    // Use Cases
    if (report.useCases && report.useCases.length > 0) {
      addText('Use Cases', 14, true);
      report.useCases.forEach((useCase, index) => {
        addText(`${index + 1}. ${useCase}`);
      });
      yPosition += 10;
    }

    // Footer with tester and approval info
    yPosition += 20;
    addText(`Tested by: ${report.tester.name || report.tester.email} (${report.tester.role})`, 10);
    if (report.approver) {
      addText(`Approved by: ${report.approver.name || report.approver.email}`, 10);
    }
    addText(`Report Date: ${new Date(report.createdAt).toLocaleDateString()}`, 10);
    if (report.approvedAt) {
      addText(`Approved Date: ${new Date(report.approvedAt).toLocaleDateString()}`, 10);
    }

    // Get PDF as buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Return PDF as response
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${report.tool.name}-${report.title}-report.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      reportId: id
    });
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}