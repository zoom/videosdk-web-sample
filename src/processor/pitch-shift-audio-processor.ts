/* eslint-disable @typescript-eslint/explicit-member-accessibility */

class PitchShiftProcessor extends AudioProcessor {
  pitchRatio: number;
  bufferSize: number;
  buffer: Float32Array;
  writePos: number;
  readPos: number;
  formantRatio: number;
  dryWet: number;
  hpf: {
    prevIn: number;
    prevOut: number;
    alpha: number;
  };
  constructor(port: MessagePort, options: any) {
    super(port, options);
    this.bufferSize = 11025; // 1 second buffer (44.1kHz sampling rate)
    this.buffer = new Float32Array(this.bufferSize);
    this.writePos = 0;
    this.readPos = 0.0;
    // Parameter configuration
    this.pitchRatio = 1.5; // Tone ratio (1.0 is original sound)
    this.formantRatio = 1.2; // Formant ratio
    this.dryWet = 0.7; // // Dry/Wet mix ratio
    // High-pass filter parameters (simple implementation)
    this.hpf = {
      prevIn: 0,
      prevOut: 0,
      alpha: 0.86
    };
  }
  process(inputs: Array<Array<Float32Array>>, outputs: Array<Array<Float32Array>>) {
    const input = inputs[0];
    const output = outputs[0];
    if (input.length === 0 || !input[0]) {
      return true;
    }
    const inputChannel = input[0];
    const outputChannel = output[0];
    // Write input to ring buffer
    for (let i = 0; i < inputChannel.length; i++) {
      this.buffer[this.writePos] = inputChannel[i];
      this.writePos = (this.writePos + 1) % this.bufferSize;
    }
    // Process each output sample
    for (let i = 0; i < outputChannel.length; i++) {
      // Calculate current read position
      let readPos = this.readPos % this.bufferSize;
      if (readPos < 0) readPos += this.bufferSize;
      // Linear interpolation
      const intPos = Math.floor(readPos);
      const frac = readPos - intPos;
      const nextPos = (intPos + 1) % this.bufferSize;
      // Raw signal
      const raw = this.buffer[intPos] * (1 - frac) + this.buffer[nextPos] * frac;
      // High-pass filter
      const filtered = raw - this.hpf.prevIn + this.hpf.alpha * this.hpf.prevOut;
      this.hpf.prevIn = raw;
      this.hpf.prevOut = filtered;
      // Dry/Wet mix
      outputChannel[i] = filtered * this.dryWet + raw * (1 - this.dryWet);
      // Update read position (apply pitch ratio)
      this.readPos += this.pitchRatio;
      // Auto wrap-around handling
      if (this.readPos >= this.bufferSize) {
        this.readPos -= this.bufferSize;
        this.writePos = 0; // Reset write position to keep in sync
      }
    }
    return true;
  }
}

registerProcessor('pitch-shift-audio-processor', PitchShiftProcessor);
