import { Side, Vector, Vertices } from '../types';

// Vector

export function mouseEventToVector(event: MouseEvent): Vector {
  return [event.clientX, event.clientY];
}

export function verticesFromCss(el: HTMLElement): Vertices {
  const left = +el.style.left!.slice(0, -2);
  const top = +el.style.top!.slice(0, -2);
  const width = +el.style.width!.slice(0, -2);
  const height = +el.style.height!.slice(0, -2);
  return [
    [left, top],
    [left, top + height],
    [left + width, top],
    [left + width, top + height],
  ];
}

// https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
export function verticesFromViewPort(el: HTMLElement): Vertices {
  const { top, left, bottom, right } = el.getBoundingClientRect();
  return [
    [left, top],
    [left, bottom],
    [right, top],
    [right, bottom],
  ];
}

// prettier-ignore
export function centerFromVertices(vertices: Vertices): Vector {
  const [width, height] = size(vertices);
  return [Math.round(vertices[3][0] - width / 2), Math.round(vertices[3][1] - height / 2)];
}

export function add([x0, y0]: Vector, [x1, y1]: Vector): Vector {
  return [x0 + x1, y0 + y1];
}

export function subtract([x0, y0]: Vector, [x1, y1]: Vector): Vector {
  return [x1 - x0, y1 - y0];
}

export function distance(from: Vector, to: Vector): number {
  const [x, y] = subtract(from, to);
  return Math.sqrt(x * x + y * y);
}

export function size([[x0, y0], _1, _2, [x3, y3]]: Vertices): Vector {
  return [x3 - x0, y3 - y0];
}

// prettier-ignore
export function verticesFromDistance(start: Vertices, dist: { [key in Side]: Vector }) : Vertices {
  const [lT, lB, rT, rB] = start;
  const zero = [0,0]
  return [
    add(lT, dist['top-left'] || zero),
    add(lB, dist['bottom-left'] || zero),
    add(rT, dist['top-right'] || zero),
    add(rB, (dist['bottom-right'] || zero)),
  ];
}

// prettier-ignore
export function resize(side: Side, [xT, yT]: Vector, [distX, distY] : Vector) : [Vector, Vector] {
  switch (side) {
    case 'top-left':
      return [
        [-distX, -distY],
        [(xT += distX), (yT += distY)],
      ];
    case 'top-center':
      return [
        [0, -distY],
        [xT, (yT += distY)],
      ];
    case 'top-right':
      return [
        [distX, -distY],
        [xT, (yT += distY)],
      ];
    case 'center-left':
      return [
        [-distX, 0],
        [(xT += distX), yT],
      ];
    case 'center':
      return [
        [0, 0],
        [xT, yT],
      ];
    case 'center-right':
      return [
        [distX, 0],
        [xT, yT],
      ];
    case 'bottom-left':
      return [
        [-distX, +distY],
        [(xT += distX), yT],
      ];
    case 'bottom-center':
      return [
        [0, distY],
        [xT, yT],
      ];
    case 'bottom-right':
      return [
        [distX, distY],
        [xT, yT],
      ];
    default:
      return [
        [0, 0],
        [xT, yT],
      ];
  }
}

// prettier-ignore
export const scale = ([TL, _1, _2, RB]: Vertices, side: Side, [xDist, yDist]: Vector) : Vector => {
  const [width, height] = subtract(TL, RB);
  const k = 2;
  const xScaleR = width + k * xDist;
  const yScaleR = height + k * yDist;
  const xScaleL = width + k * -xDist;
  const yScaleL = height + k * -yDist;

  switch (side) {
    case 'top-left':
      return [xScaleL / width || 1, yScaleL / height || 1];
    case 'top-center':
      return [1, yScaleL / height || 1];
    case 'top-right':
      return [xScaleR / width || 1, yScaleL / height || 1];
    case 'center-left':
      return [xScaleL / width || 1, yScaleL / height || 1];
    case 'center':
      return [1, 1];
    case 'center-right':
      return [xScaleR / width || 1, yScaleR / height || 1];
    case 'bottom-left':
      return [xScaleL / width || 1, yScaleR / height || 1];
    case 'bottom-center':
      return [1, yScaleR / height || 1];
    case 'bottom-right':
      return [xScaleR / width || 1, yScaleR / height || 1];
  }
};

export const rotate = ([xC, yC]: Vector, [x, y]: Vector) => {
  return ((Math.atan2(y - yC, x - xC) - (3 * Math.PI) / 2) * 180) / Math.PI;
};

// CSS

export function applyCss(el: HTMLElement, style: Partial<CSSStyleDeclaration>) {
  return Object.assign(el.style, style);
}

export function verticesToCss([[x0, y0], _1, _2, [x1, y1]]: Vertices) {
  return {
    top: `${y0}px`,
    left: `${x0}px`,
    width: `${x1 - x0}px`,
    height: `${y1 - y0}px`,
  };
}

export function mergeTransform(properties: string[]) {
  const transform = properties.reduce((acc, prop) => `${prop} ${acc}`, '');
  return { transform };
}

export function translateToCss([x, y]: Vector) {
  return `translate(${x}px,${y}px)`;
}

export function matrixToCss(matrix: number[][]) {
  return `translate(-50%, -50%) matrix3d(${matrix
    .flatMap(row => row.map(value => +value.toFixed(10)))
    .join(',')}) translate(50%, 50%)`;
}

export const scaleToCss = ([xScale, yScale]: Vector) => {
  return `scale(${xScale}, ${yScale})`;
};

export const rotateToCss = (degree: number) => {
  return `rotate(${degree}deg)`;
};

export const cursorByPosition = {
  'top-left': 'nwse-resize',
  'top-center': 'ns-resize',
  'top-right': 'nesw-resize',
  'center-left': 'ew-resize',
  center: 'auto',
  'center-right': 'ew-resize',
  'bottom-left': 'nesw-resize',
  'bottom-center': 'ns-resize',
  'bottom-right': 'nwse-resize',
};
