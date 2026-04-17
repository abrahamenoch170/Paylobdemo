export const mediaProcessor = {
  async generateVideoPreview(_path: string): Promise<Buffer> {
    return Buffer.alloc(10);
  },

  async generateImagePreview(_buffer: Buffer): Promise<Buffer> {
    return Buffer.alloc(10);
  },
};
