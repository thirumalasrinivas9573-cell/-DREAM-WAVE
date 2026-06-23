const Report = require('../models/Report');
const { generateRDReport } = require('../services/openaiService');

// @desc    Generate comprehensive R&D report (2000-5000 words)
// @route   POST /api/report
exports.generateReport = async (req, res) => {
  try {
    const { goal } = req.body;
    if (!goal?.trim()) return res.status(400).json({ success: false, message: 'Goal is required.' });

    const reportData = await generateRDReport(goal.trim());

    const report = await Report.create({
      user: req.user.id,
      goal: goal.trim(),
      report: reportData,
    });

    res.status(201).json({ success: true, report });
  } catch (error) {
    console.error('[reportController.generateReport]', error.message);
    res.status(500).json({ success: false, message: 'Report generation failed. Please try again.' });
  }
};

// @desc    Get user reports
// @route   GET /api/report
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Download PDF (browser print)
// @route   GET /api/report/:id/download
exports.downloadPDF = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (report.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
