/* eslint-disable @typescript-eslint/explicit-member-accessibility */
class WatermarkProcessor extends VideoProcessor {
  private context: OffscreenCanvasRenderingContext2D | null = null;
  private watermarkImage: ImageBitmap | null = null;

  constructor(port: MessagePort, options?: any) {
    super(port, options);

    port.addEventListener('message', (e) => {
      if (e.data.cmd === 'update_watermark_image') {
        this.updateWatermarkImage(e.data.data);
      }
    });
  }

  async processFrame(input: VideoFrame, output: OffscreenCanvas) {
    this.renderFrame(input, output);
    return true;
  }

  onInit() {
    const canvas = this.getOutput();
    if (canvas) {
      this.context = canvas.getContext('2d');
      if (!this.context) {
        console.error('2D context could not be initialized.');
      }
    }
  }

  onUninit() {
    this.context = null;
    this.watermarkImage = null;
  }

  private updateWatermarkImage(image: ImageBitmap) {
    this.watermarkImage = image;
  }

  private renderFrame(input: VideoFrame, output: OffscreenCanvas) {
    if (!this.context) return;

    // Draw the video frame onto the canvas
    this.context.drawImage(input, 0, 0, output.width, output.height);

    // Overlay the watermark if available
    if (this.watermarkImage) {
      const watermarkWidth = this.watermarkImage.width;
      const watermarkHeight = this.watermarkImage.height;
      this.context.globalAlpha = 0.5;
      this.context.drawImage(this.watermarkImage, 0, 0, watermarkWidth, watermarkHeight);
    }
  }
}

registerProcessor('watermark-processor', WatermarkProcessor);
