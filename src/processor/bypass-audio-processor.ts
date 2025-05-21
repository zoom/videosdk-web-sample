/* eslint-disable @typescript-eslint/explicit-member-accessibility */

class BypassAudioProcessor extends AudioProcessor {
  onInit() {
    console.log('init bypass processor');
  }
  onUninit() {
    console.log('uninit bypass processor');
  }
  process(inputs: Array<Array<Float32Array>>, outputs: Array<Array<Float32Array>>) {
    const input = inputs[0];
    const output = outputs[0];

    if (input.length > 0) {
      for (let channel = 0; channel < output.length; ++channel) {
        output[channel].set(input[channel]);
      }
    }

    return true;
  }
}

registerProcessor('bypass-audio-processor', BypassAudioProcessor);
