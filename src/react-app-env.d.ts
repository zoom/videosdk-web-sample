/// <reference types="react-scripts" />
declare module '*.svg' {
  import type React from 'react';
  const SVG: React.VFC<React.SVGProps<SVGSVGElement>>;
  export default SVG;
  export const ReactComponent: React.VFC<React.SVGProps<SVGSVGElement>>;
}
