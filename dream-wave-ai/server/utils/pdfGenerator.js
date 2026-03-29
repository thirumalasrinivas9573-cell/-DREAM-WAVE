const PDFDocument = require('pdfkit');
const fs          = require('fs');
const path        = require('path');

const REPORTS_DIR = path.join(__dirname, '../reports');
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

// Colors
const C = {
  primary:  '#7c3aed',
  accent:   '#ec4899',
  dark:     '#1a1a2e',
  gray:     '#4a4a6a',
  light:    '#f5f3ff',
  white:    '#ffffff',
  gold:     '#f59e0b'
};

function generatePDF(reportData, fileName) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(REPORTS_DIR, fileName);
    const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // ── COVER PAGE ──────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, doc.page.height).fill(C.dark);

    // Gradient bar top
    doc.rect(0, 0, doc.page.width, 8).fill(C.primary);

    // Logo area
    doc.fontSize(48).fillColor(C.white).text('🌊', 50, 80, { align: 'center' });

    doc.fontSize(28).fillColor(C.white).font('Helvetica-Bold')
      .text('Dream Wave AI', 50, 150, { align: 'center' });

    doc.fontSize(14).fillColor('#a78bfa')
      .text('Career Research & Development Report', 50, 190, { align: 'center' });

    // Career title box
    doc.roundedRect(80, 240, doc.page.width - 160, 80, 12)
      .fill(C.primary);
    doc.fontSize(22).fillColor(C.white).font('Helvetica-Bold')
      .text(reportData.career || 'Career Report', 80, 265, { width: doc.page.width - 160, align: 'center' });

    // User info
    doc.fontSize(11).fillColor('#c4b5fd').font('Helvetica')
      .text(`Prepared for: ${reportData.userName || 'Dream Wave User'}`, 50, 360, { align: 'center' })
      .text(`Generated: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, 50, 378, { align: 'center' })
      .text(`AA ID: ${reportData.aaId || 'N/A'}`, 50, 396, { align: 'center' });

    // Bottom bar
    doc.rect(0, doc.page.height - 8, doc.page.width, 8).fill(C.accent);

    // ── CONTENT PAGES ───────────────────────────────────────────────────
    doc.addPage();

    const sections = reportData.sections || [];
    let sectionNum = 1;

    for (const section of sections) {
      // Check if we need a new page (leave 120px buffer)
      if (doc.y > doc.page.height - 120) doc.addPage();

      // Section header bar
      doc.rect(50, doc.y, doc.page.width - 100, 32).fill(C.primary);
      doc.fontSize(13).fillColor(C.white).font('Helvetica-Bold')
        .text(`${sectionNum}. ${section.title}`, 62, doc.y - 26);
      doc.moveDown(0.3);

      sectionNum++;

      // Section content
      doc.fontSize(10.5).fillColor('#1a1a2e').font('Helvetica');

      const lines = (section.content || '').split('\n');
      for (const line of lines) {
        if (doc.y > doc.page.height - 80) doc.addPage();

        const trimmed = line.trim();
        if (!trimmed) { doc.moveDown(0.4); continue; }

        if (trimmed.startsWith('##')) {
          doc.fontSize(11).fillColor(C.primary).font('Helvetica-Bold')
            .text(trimmed.replace(/^#+\s*/, ''), 50, doc.y, { width: doc.page.width - 100 });
          doc.fontSize(10.5).fillColor('#1a1a2e').font('Helvetica');
        } else if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
          doc.text('  ' + trimmed.replace(/^[-•*]\s*/, '• '), 50, doc.y, { width: doc.page.width - 100 });
        } else if (/^\d+\./.test(trimmed)) {
          doc.text('  ' + trimmed, 50, doc.y, { width: doc.page.width - 100 });
        } else {
          doc.text(trimmed, 50, doc.y, { width: doc.page.width - 100 });
        }
        doc.moveDown(0.25);
      }
      doc.moveDown(0.8);
    }

    // ── PAGE NUMBERS ────────────────────────────────────────────────────
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 1; i < totalPages; i++) {
      doc.switchToPage(i);
      doc.rect(0, doc.page.height - 30, doc.page.width, 30).fill('#f5f3ff');
      doc.fontSize(9).fillColor(C.gray).font('Helvetica')
        .text(`Dream Wave AI — Career R&D Report`, 50, doc.page.height - 20, { align: 'left' })
        .text(`Page ${i} of ${totalPages - 1}`, 50, doc.page.height - 20, { align: 'right', width: doc.page.width - 100 });
    }

    doc.end();
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

module.exports = { generatePDF, REPORTS_DIR };
