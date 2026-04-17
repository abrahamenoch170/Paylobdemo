export const pdfProcessor = {
  async compressPdf(buffer: Buffer): Promise<Buffer> {
    return buffer;
  },

  async mergePdfs(buffers: Buffer[]): Promise<Buffer> {
    return Buffer.concat(buffers);
  },
};
