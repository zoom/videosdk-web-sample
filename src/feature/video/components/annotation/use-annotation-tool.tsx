import { AnnotationToolType } from '@zoom/videosdk';
export function getAnnotationDraw() {
  const drawTools = [
    {
      name: 'Pen',
      icon: 'icon-ann-pen',
      value: AnnotationToolType.Pen,
      cursor: 'pen-cursor'
    },
    {
      name: 'Highlighter',
      icon: 'icon-ann-highlighter',
      value: AnnotationToolType.Highlighter,
      cursor: 'pen-highlight-cursor'
    },
    {
      name: 'Vanishing Pen',
      icon: 'icon-ann-vanishing',
      value: AnnotationToolType.VanishingPen,
      cursor: 'pen-highlight-cursor'
    }
  ];
  const lineWidths = [
    {
      name: 'Thin',
      icon: 'icon-ann-thin',
      value: 1
    },
    {
      name: 'Regular',
      icon: 'icon-ann-regular',
      value: 2
    },
    {
      name: 'Thick',
      icon: 'icon-ann-thick',
      value: 4
    },
    {
      name: 'Bulk',
      icon: 'icon-ann-bulk',
      value: 8
    }
  ];
  const shapes = [
    // 1st row
    {
      name: 'Line',
      icon: 'icon-ann-line',
      value: AnnotationToolType.Line
    },
    {
      name: 'Rectangle',
      element: <i className="anno-shape anno-rectangle-icon" />,
      value: AnnotationToolType.Rectangle
    },
    {
      name: 'Ellipse',
      element: <i className="anno-shape anno-ellipse-icon" />,
      value: AnnotationToolType.Ellipse
    },
    {
      name: 'Diamond',
      element: <i className="anno-shape anno-diamond-icon" />,
      value: AnnotationToolType.Diamond
    },
    // 2nd row
    {
      name: 'Arrow',
      icon: 'icon-ann-single-arrow',
      value: AnnotationToolType.Arrow1
    },
    {
      name: 'Shaded rectangle',
      element: <i className="anno-shape anno-rectangle-icon semi-fill" />,
      value: AnnotationToolType.RectangleSemiFill
    },
    {
      name: 'Shaded ellipse',
      element: <i className="anno-shape anno-ellipse-icon semi-fill" />,
      value: AnnotationToolType.EllipseSemiFill
    },
    {
      name: 'Shaded diamond',
      element: <i className="anno-shape anno-diamond-icon semi-fill" />,
      value: AnnotationToolType.DiamondSemiFill
    },
    // 3rd row
    {
      name: 'Double arrow',
      icon: 'icon-ann-double-arrow',
      value: AnnotationToolType.DoubleArrow
    },
    {
      name: 'Filled rectangle',
      element: <i className="anno-shape anno-rectangle-icon fill" />,
      value: AnnotationToolType.RectangleFill
    },
    {
      name: 'Filled ellipse',
      element: <i className="anno-shape anno-ellipse-icon fill" />,
      value: AnnotationToolType.EllipseFill
    },
    {
      name: 'Filled diamond',
      element: <i className="anno-shape anno-diamond-icon fill" />,
      value: AnnotationToolType.DiamondFill
    },
    // 4th row
    {
      name: 'Vanishing arrow',
      icon: 'icon-ann-vanishing-arrow',
      value: AnnotationToolType.VanishingArrow
    },
    {
      name: 'Vanishing rectangle',
      element: <i className="anno-shape anno-rectangle-icon vanishing" />,
      value: AnnotationToolType.VanishingRectangle
    },
    {
      name: 'Vanishing ellipse',
      element: <i className="anno-shape anno-ellipse-icon vanishing" />,
      value: AnnotationToolType.VanishingEllipse
    },
    {
      name: 'Vanishing diamond',
      element: <i className="anno-shape anno-diamond-icon vanishing" />,
      value: AnnotationToolType.VanishingDiamond
    }
  ];
  return [
    {
      title: 'Draw',
      type: 'pen',
      items: drawTools
    },
    {
      title: 'Line width',
      type: 'line witdh',
      items: lineWidths
    },
    {
      title: 'Shapes',
      type: 'shape',
      items: shapes.map((i) => ({ cursor: 'shapes-cursor', ...i }))
    }
  ];
}

export function getAnnotationStamp() {
  return [
    {
      name: 'Tick',
      icon: 'icon-ann-stamp-check',
      value: AnnotationToolType.StampCheck
    },
    {
      name: 'Arrow',
      icon: 'icon-ann-stamp-arrow',
      value: AnnotationToolType.StampArrow
    },
    {
      name: 'Cross',
      icon: 'icon-ann-stamp-cross',
      value: AnnotationToolType.StampX
    },
    {
      name: 'Heart',
      icon: 'icon-ann-stamp-heart',
      value: AnnotationToolType.StampHeart
    },
    {
      name: 'Star',
      icon: 'icon-ann-stamp-star',
      value: AnnotationToolType.StampStar
    },
    {
      name: 'Question',
      icon: 'icon-ann-stamp-question',
      value: AnnotationToolType.StampQuestionMark
    }
  ];
}

export function getAnnotationSpotlight() {
  return [
    {
      name: 'Spotlight',
      icon: 'icon-ann-spotlight',
      value: AnnotationToolType.Spotlight,
      isPresenterOnly: true
    },
    {
      name: 'Arrow',
      icon: 'icon-ann-spotlight-arrow',
      value: AnnotationToolType.Arrow
    }
  ];
}
const argbConvertRgb = (argbColor: number) => {
  // argb convert to RGB
  const r = (argbColor >> 16) & 0xff;
  const g = (argbColor >> 8) & 0xff;
  const b = argbColor & 0xff;
  const rgb = (r << 16) | (g << 8) | b;
  const hex = rgb.toString(16).padStart(6, '0');
  return `#${hex}`;
};
export function getPaletteColor() {
  const colors = [
    [0xffffffff, 'White'],
    [0xffff1919, 'Red'],
    [0xffffde32, 'Yellow'],
    [0xff82c786, 'Green'],
    [0xff2e8cff, 'Blue'],
    [0xffb479ff, 'Light purple'],
    [0xffff38c7, 'Pink'],
    [0xffff8a00, 'Orange'],
    [0xff49d61e, 'Lime-tree green'],
    [0xff51d8eb, 'Ice blue'],
    [0xff000000, 'Dark grey'],
    [0xff7f0000, 'Dark red'],
    [0xff774408, 'Brown'],
    [0xff0b7228, 'Dark green'],
    [0xff144fc3, 'Dark blue']
  ];
  return colors.map(([v, n]) => {
    const color = argbConvertRgb(v as number);
    return {
      name: n,
      element: (
        <i
          className="anno-palette-color"
          style={{
            backgroundColor: color === '#000000' ? '#383c42' : color,
            outline: color === '#000000' ? '1px solid #fff' : ''
          }}
        />
      ),
      value: v
    };
  });
}
