const Report = require('../models/Report');
const OpenAIService = require('../services/openaiService');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// @desc    Generate R&D report
// @route   POST /api/report
exports.generateReport = async (req, res) => {
  try {
    const { goal } = req.body;

    // Generate AI report
    const reportData = await OpenAIService.generateRDReport(goal);

    // Create report in database
    const report = await Report.create({
      user: req.user.id,
      goal,
      report: reportData
    });

    // Generate PDF
    const pdfBuffer = await generatePDF(reportData, goal);
    
    // Save PDF (in production, use cloud storage)
    const pdfPath = path.join(__dirname, '../reports', `report_${report._id}.pdf`);
    
    // Ensure reports directory exists
    const reportsDir = path.dirname(pdfPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    fs.writeFileSync(pdfPath, pdfBuffer);
    
    // Update report with PDF URL
    report.pdfUrl = `/reports/report_${report._id}.pdf`;
    await report.save();

    res.status(201).json({
      success: true,
      report,
      pdfUrl: report.pdfUrl
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's reports
// @route   GET /api/report
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reports
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Download PDF
// @route   GET /api/report/:id/download
exports.downloadPDF = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const pdfPath = path.join(__dirname, '../reports', `report_${report._id}.pdf`);
    
    if (fs.existsSync(pdfPath)) {
      res.download(pdfPath, `R&D_Report_${report.goal}.pdf`);
    } else {
      res.status(404).json({ message: 'PDF not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to generate PDF
async function generatePDF(reportData, goal) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Add content to PDF
      doc.fontSize(20).text(`R&D Report: ${goal}`, { align: 'center' });
      doc.moveDown();

      doc.fontSize(14).text('Career Overview:', { underline: true });
      doc.fontSize(12).text(reportData.careerOverview || 'N/A');
      doc.moveDown();

      doc.fontSize(14).text('Market Demand:', { underline: true });
      doc.fontSize(12).text(reportData.demand || 'N/A');
      doc.moveDown();

      doc.fontSize(14).text('Required Skills:', { underline: true });
      doc.fontSize(12).text(reportData.skills || 'N/A');
      doc.moveDown();

      doc.fontSize(14).text('Learning Path:', { underline: true });
      doc.fontSize(12).text(reportData.learningPath || 'N/A');
      doc.moveDown();

      doc.fontSize(14).text('Tools & Technologies:', { underline: true });
      doc.fontSize(12).text(reportData.tools || 'N/A');
      doc.moveDown();

      doc.fontSize(14).text('Salary Expectations:', { underline: true });
      doc.fontSize(12).text(reportData.salary || 'N/A');
      doc.moveDown();

      doc.fontSize(14).text('Growth Opportunities:', { underline: true });
      doc.fontSize(12).text(reportData.growth || 'N/A');
      doc.moveDown();

      doc.fontSize(14).text('Potential Risks:', { underline: true });
      doc.fontSize(12).text(reportData.risks || 'N/A');
      doc.moveDown();

      doc.fontSize(14).text('Opportunities:', { underline: true });
      doc.fontSize(12).text(reportData.opportunities || 'N/A');
      doc.moveDown();

      doc.fontSize(14).text('Case Studies:', { underline: true });
      doc.fontSize(12).text(reportData.caseStudies || 'N/A');
      doc.moveDown();

      doc.fontSize(14).text('Comparison:', { underline: true });
      doc.fontSize(12).text(reportData.comparison || 'N/A');
      doc.moveDown();

      doc.fontSize(14).text('Final Decision:', { underline: true });
      doc.fontSize(12).text(reportData.finalDecision || 'N/A');

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
