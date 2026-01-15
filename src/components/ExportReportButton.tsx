'use client';

import { useState } from 'react';
import { Download, Loader2, FileText, CheckCircle } from 'lucide-react';
import { generateReportData, ExamReportData } from '@/app/actions/export-report';

export default function ExportReportButton() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleExport = async () => {
    setIsGenerating(true);
    setSuccess(false);

    try {
      const data = await generateReportData();
      
      // Generate HTML for printing
      const html = generateReportHTML(data);
      
      // Open in new window and trigger print
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
        };
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isGenerating}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
        ${success 
          ? 'bg-green-100 text-green-700' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isGenerating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : success ? (
        <CheckCircle className="w-4 h-4" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {success ? 'Report Generated!' : 'Export Report'}
    </button>
  );
}

function generateReportHTML(data: ExamReportData): string {
  const date = new Date(data.generatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <title>Study Progress Report - ${date}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1a1a1a; }
    h1 { font-size: 24px; margin-bottom: 8px; color: #2D5A3D; }
    h2 { font-size: 16px; margin: 24px 0 12px; color: #2D5A3D; border-bottom: 2px solid #2D5A3D; padding-bottom: 4px; }
    .meta { color: #666; font-size: 12px; margin-bottom: 24px; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: #f5f5f5; padding: 16px; border-radius: 8px; text-align: center; }
    .stat-value { font-size: 28px; font-weight: bold; color: #2D5A3D; }
    .stat-label { font-size: 11px; color: #666; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f5f5f5; font-size: 12px; text-transform: uppercase; color: #666; }
    .progress-bar { height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden; }
    .progress-fill { height: 100%; background: #2D5A3D; }
    .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #999; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>📚 Master Plumbing Study Report</h1>
  <p class="meta">Generated on ${date}</p>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value">${data.summary.examReadiness}%</div>
      <div class="stat-label">Exam Readiness</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${data.summary.mastered}</div>
      <div class="stat-label">Cards Mastered</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${data.summary.studyStreak}</div>
      <div class="stat-label">Day Streak</div>
    </div>
  </div>

  <h2>Progress Overview</h2>
  <table>
    <tr><th>Category</th><th>Count</th><th>Percentage</th></tr>
    <tr><td>Mastered</td><td>${data.summary.mastered}</td><td>${Math.round((data.summary.mastered / data.summary.totalCards) * 100) || 0}%</td></tr>
    <tr><td>Learning</td><td>${data.summary.learning}</td><td>${Math.round((data.summary.learning / data.summary.totalCards) * 100) || 0}%</td></tr>
    <tr><td>Needs Review</td><td>${data.summary.needsReview}</td><td>${Math.round((data.summary.needsReview / data.summary.totalCards) * 100) || 0}%</td></tr>
    <tr><td><strong>Total</strong></td><td><strong>${data.summary.totalCards}</strong></td><td>100%</td></tr>
  </table>

  ${data.subjectProgress.length > 0 ? `
  <h2>Subject Progress</h2>
  <table>
    <tr><th>Subject</th><th>Progress</th><th>Cards</th></tr>
    ${data.subjectProgress.map(s => `
    <tr>
      <td>${s.subject}</td>
      <td>
        <div class="progress-bar"><div class="progress-fill" style="width: ${s.progress}%"></div></div>
        ${s.progress}%
      </td>
      <td>${s.total}</td>
    </tr>
    `).join('')}
  </table>
  ` : ''}

  ${data.recentExams.length > 0 ? `
  <h2>Recent Exams</h2>
  <table>
    <tr><th>Date</th><th>Score</th><th>Percentage</th></tr>
    ${data.recentExams.map(e => `
    <tr>
      <td>${new Date(e.date).toLocaleDateString()}</td>
      <td>${e.score} / ${e.totalQuestions}</td>
      <td>${e.percentage}%</td>
    </tr>
    `).join('')}
  </table>
  ` : ''}

  ${data.weakAreas.length > 0 ? `
  <h2>Areas to Focus On</h2>
  <table>
    <tr><th>Topic</th><th>Estimated Accuracy</th></tr>
    ${data.weakAreas.map(w => `
    <tr><td>${w.topic}</td><td>${w.accuracy}%</td></tr>
    `).join('')}
  </table>
  ` : ''}

  <div class="footer">
    <p>Generated by Master Plumbing Study App</p>
  </div>
</body>
</html>
  `;
}
