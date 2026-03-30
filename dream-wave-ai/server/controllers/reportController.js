const path   = require('path');
const fs     = require('fs');
const Goal   = require('../models/Goal');
const { generateReport }  = require('../services/reportService');
const { generatePDF, REPORTS_DIR } = require('../utils/pdfGenerator');
const { saveGoalToFirebase } = require('../services/firebaseService');

// POST /api/report/generate
exports.generate = async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId)
    return res.status(400).json({ message: 'sessionId is required' });

  try {
    // Load goal session
    const session = await Goal.findOne({ _id: sessionId, userId: req.user._id });
    if (!session)
      return res.status(404).json({ message: 'Goal session not found' });

    // Build context for report
    const goalData = {
      goal:       session.goal || 'Career Goal',
      background: session.messages
        .filter(m => m.role === 'user')
        .map(m => m.content)
        .join(' | '),
      summary:    session.summary,
      userName:   req.user.name,
      aaId:       req.user.aaId
    };

    // Generate report content via OpenAI
    console.log(`📝 Generating report for: ${goalData.goal}`);
    const { sections } = await generateReport(goalData);

    if (!sections.length)
      return res.status(500).json({ message: 'Report generation produced no content' });

    // Generate PDF
    const fileName = `report_${req.user._id}_${Date.now()}.pdf`;
    await generatePDF({ ...goalData, career: goalData.goal, sections }, fileName);

    const reportUrl = `/api/report/download/${fileName}`;

    // Save URL to MongoDB
    session.reportUrl = reportUrl;
    await session.save();

    // Save metadata to Firebase (non-blocking)
    saveGoalToFirebase(req.user._id, {
      goal:      goalData.goal,
      messages:  session.messages,
      summary:   session.summary,
      reportUrl
    }).catch(() => {});

    console.log(`✅ Report generated: ${fileName}`);
    res.json({
      message:   'Report generated successfully',
      reportUrl,
      fileName,
      sections:  sections.length
    });
  } catch (err) {
    console.error('Report generation error:', err.message);
    const isQuota = err?.status === 429 || err?.code === 'insufficient_quota';
    res.status(isQuota ? 503 : 500).json({
      message: isQuota
        ? 'AI service temporarily unavailable. Please try again later.'
        : 'Report generation failed'
    });
  }
};

// GET /api/report/download/:filename
exports.download = (req, res) => {
  const { filename } = req.params;

  // Security: only allow safe filenames
  if (!/^report_[a-zA-Z0-9_]+\.pdf$/.test(filename))
    return res.status(400).json({ message: 'Invalid filename' });

  const filePath = path.join(REPORTS_DIR, filename);
  if (!fs.existsSync(filePath))
    return res.status(404).json({ message: 'Report not found' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  fs.createReadStream(filePath).pipe(res);
};

// GET /api/report/list — user's generated reports
exports.list = async (req, res) => {
  try {
    const sessions = await Goal.find({
      userId:    req.user._id,
      reportUrl: { $ne: null }
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('goal reportUrl createdAt');
    res.json({ reports: sessions });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reports' });
  }
};
