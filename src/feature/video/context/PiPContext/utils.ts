interface GetNewPiPWindowParams {
  width: number;
  height: number;
  onHide: () => void;
}

export async function getNewPiPWindow({ width, height, onHide }: GetNewPiPWindowParams) {
  const pipWindow = await window.documentPictureInPicture.requestWindow({
    width,
    height
  });

  pipWindow.addEventListener('pagehide', () => {
    console.log('- PiP: hide Picture-in-Picture window'); // eslint-disable-line no-console
    onHide();
  });

  // It is important to copy all parent window styles. Otherwise, there would be no CSS available at all
  // https://developer.chrome.com/docs/web-platform/document-picture-in-picture/#copy-style-sheets-to-the-picture-in-picture-window
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < document.styleSheets.length; i++) {
    const styleSheet = document.styleSheets[i];
    try {
      const style = document.createElement('style');
      style.textContent = collectStyleCssRules(styleSheet);
      pipWindow.document.head.appendChild(style);
    } catch (e) {
      const link = document.createElement('link');
      if (styleSheet.href) {
        link.rel = 'stylesheet';
        link.type = styleSheet.type;
        link.media = styleSheet.media.toString();
        link.href = styleSheet.href;
        pipWindow.document.head.appendChild(link);
      }
    }
  }

  return pipWindow;
}

function collectStyleCssRules(styleSheet: CSSStyleSheet) {
  let text = '';

  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < styleSheet.cssRules.length; i++) {
    text += styleSheet.cssRules[i].cssText;
  }

  return text;
}
