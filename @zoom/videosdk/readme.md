# Zoom Video SDK

The Web SDK enables the development of video applications powered by Zoom’s core framework inside an HTML5 web client through a highly optimized WebAssembly module.

As an extension of the Zoom browser client, this SDK is intended for implementations where the end user has a low-bandwidth environment, is behind a network firewall, or has restrictions on their machine which would prevent them from installing the Zoom Desktop or Mobile Clients.

## Compatibility

The Web SDK is compatible with major mainstream browsers. See the following table for the details.

| Feature /Browser | Chrome 58+ | Firefox 56+ | Safari 11+ | Opera 45+ | iOS 13+ | Android Chrome |
|------------------|------------|-------------|------------|-----------|---------|----------------|
| Video(receive)   | ✔         | ✔          | ✔         | ✔        | ✔      | ✔             |
| Video(send)      | ✔         | ✔          | ✔         | ✔        | ✘      | ✔             |
| Audio(receive)   | ✔         | ✔          | ✘         | ✔        | ✘      | ✔             |
| Audio(send)      | ✔         | ✔ (76+)    | ✘         | ✔        | ✘      | ✔             |
| Screen(receive)  | ✔         | ✔          | ✔         | ✔        | ✔      | ✔             |
| Scrreen(send)    | ✔(72+)    | ✔(66+)     | ✘         | ✔        | ✘      | ✘             |