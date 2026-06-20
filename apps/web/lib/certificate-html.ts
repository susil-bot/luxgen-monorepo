export interface CertificateRenderData {
  courseTitle: string;
  studentName: string;
  certificateNumber: string;
  issuedAt: string;
  tenantName?: string;
}

export function renderCertificateHtml(data: CertificateRenderData): string {
  const issuedDate = new Date(data.issuedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Certificate — ${escapeHtml(data.courseTitle)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: Georgia, 'Times New Roman', serif;
      background: #f5f5f7;
      color: #1d1d1f;
      padding: 24px;
    }
    .certificate {
      width: min(900px, 100%);
      background: #fff;
      border: 8px double #007aff;
      padding: 48px 56px;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0,0,0,0.08);
    }
    .label { font-size: 14px; letter-spacing: 0.2em; text-transform: uppercase; color: #86868b; }
    h1 { font-size: 36px; margin: 16px 0 8px; font-weight: 700; }
    .recipient { font-size: 28px; margin: 24px 0 8px; color: #007aff; }
    .course { font-size: 22px; margin: 8px 0 24px; }
    .meta { font-size: 14px; color: #636366; margin-top: 32px; }
    @media print {
      body { background: #fff; padding: 0; }
      .certificate { box-shadow: none; border-width: 6px; }
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="label">Certificate of Completion</div>
    <h1>${escapeHtml(data.tenantName ?? 'LuxGen')}</h1>
    <p>This certifies that</p>
    <div class="recipient">${escapeHtml(data.studentName)}</div>
    <p>has successfully completed</p>
    <div class="course">${escapeHtml(data.courseTitle)}</div>
    <div class="meta">
      <div>Issued ${escapeHtml(issuedDate)}</div>
      <div>Certificate No. ${escapeHtml(data.certificateNumber)}</div>
    </div>
  </div>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
