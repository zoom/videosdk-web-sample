/* eslint-disable @typescript-eslint/explicit-member-accessibility */

class WhiteNoiseProcessor extends AudioProcessor {
  constructor(port: MessagePort, options: any) {
    super(port, options);
    port.onmessage = ({ data: { cmd, data } }) => {
      if (cmd === 'update') {
        port.postMessage({ cmd: 'received update message', data });
      }
    };
  }
  process(inputs: Array<Array<Float32Array>>, outputs: Array<Array<Float32Array>>) {
    const output = outputs[0];
    output.forEach((channel) => {
      for (let i = 0; i < channel.length; i++) {
        channel[i] = Math.random() * 2 - 1;
      }
    });
    return true;
  }
}

registerProcessor('white-noise-audio-processor', WhiteNoiseProcessor);
