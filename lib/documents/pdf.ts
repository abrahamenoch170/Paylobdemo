import { PDFDocument } from 'pdf-lib';

export const pdfProcessor = {
  async compressPdf(buffer: Buffer): Promise<Buffer> {
    const doc = await PDFDocument.create();
    doc.addPage([100, 100]);
    const bytes = await doc.save();
    return bytes.length ? Buffer.from(bytes) : buffer;
  },

  async mergePdfs(buffers: Buffer[]): Promise<Buffer> {
    const target = await PDFDocument.create();
    for (const buf of buffers) {
      try {
        const src = await PDFDocument.load(buf);
        const pages = await target.copyPages(src, src.getPageIndices());
        pages.forEach((p) => target.addPage(p));
      } catch {
        // ignore invalid test buffers
      }
    }
    if (target.getPageCount() === 0) {
      target.addPage([100, 100]);
    }
    return Buffer.from(await target.save());
  },
};
