import { from } from 'rxjs';
import { Position } from '../types';

// prettier-ignore
// tslint:disable-next-line: prefer-object-spread
const applyStyle = (target: HTMLElement, style: Partial<CSSStyleDeclaration>) => Object.assign(target.style, style);

// prettier-ignore
// tslint:disable-next-line: no-shadowed-variable
const move = (target: HTMLElement, from: { clientX: number; clientY: number }, to: { clientX: number; clientY: number }) => {
    const x = to.clientX - from.clientX;
    const y = to.clientY - from.clientY;
    // tslint:disable-next-line: no-non-null-assertion
    const top = +target.style.top!.slice(0, -2);
    // tslint:disable-next-line: no-non-null-assertion
    const left = +target.style.left!.slice(0, -2);
    return { top: `${top + y}px`, left: `${left + x}px` };
  };

const resize = (
  target: HTMLElement,
  position: Position,
  // tslint:disable-next-line: no-shadowed-variable
  from: { clientX: number; clientY: number },
  to: { clientX: number; clientY: number }
) => {
  const x = to.clientX - from.clientX;
  const y = to.clientY - from.clientY;
  // tslint:disable-next-line: no-non-null-assertion
  const width = +target.style.width!.slice(0, -2);
  // tslint:disable-next-line: no-non-null-assertion
  const height = +target.style.height!.slice(0, -2);
  // tslint:disable-next-line: no-non-null-assertion
  const left = +target.style.left!.slice(0, -2);
  // tslint:disable-next-line: no-non-null-assertion
  const top = +target.style.top!.slice(0, -2);

  switch (position) {
    case 'top-left':
      return {
        width: `${width - x}px`,
        height: `${height - y}px`,
        left: `${left + x}px`,
        top: `${top + y}px`
      };
    case 'top-center':
      return {
        width: `${width}px`,
        height: `${height - y}px`,
        top: `${top + y}px`
      };
    case 'top-right':
      return {
        width: `${width + x}px`,
        height: `${height - y}px`,
        top: `${top + y}px`
      };
    case 'center-left':
      return {
        width: `${width - x}px`,
        height: `${height}px`,
        left: `${left + x}px`
      };
    case 'center':
      return { width: `${width}px`, height: `${height}px` };
    case 'center-right':
      return { width: `${width + x}px`, height: `${height}px` };
    case 'bottom-left':
      return {
        width: `${width - x}px`,
        height: `${height + y}px`,
        left: `${left + x}px`
      };
    case 'bottom-center':
      return { width: `${width}px`, height: `${height + y}px` };
    case 'bottom-right':
      return { width: `${width + x}px`, height: `${height + y}px` };
  }
};

// tslint:disable: no-non-null-assertion
const scale = (
  target: HTMLElement,
  args: {
    position: Position;
    from: { clientX: number; clientY: number };
    to: { clientX: number; clientY: number };
  }
) => {
  const { width, height } = target.getBoundingClientRect();
  const offsetX = args.to.clientX - args.from.clientX;
  const offsetY = args.to.clientY - args.from.clientY;
  const targetWidth = width + 2 * offsetX;
  const targetHeight = height + 2 * offsetY;
  return {
    scaleX: targetWidth / width || 1,
    scaleY: targetHeight / height || 1
  };
};

const scaleTransform = ({
  scaleX,
  scaleY
}: {
  scaleX: number;
  scaleY: number;
}): Partial<CSSStyleDeclaration> => {
  return {
    transform: `scale(${scaleX}, ${scaleY})`
  };
};

const rotate = (
  rect: { centerX: number; centerY: number },
  target: { clientX: number; clientY: number }
) => {
  return (
    ((Math.atan2(target.clientY - rect.centerY, target.clientX - rect.centerX) -
      (3 * Math.PI) / 2) *
      180) /
    Math.PI
  );
};

const rotateTransform = (degree: number) => {
  return {
    transform: `rotate(${degree}deg)`
  };
};

const cursorByPosition = {
  'top-left': 'nwse-resize',
  'top-center': 'ns-resize',
  'top-right': 'nesw-resize',
  'center-left': 'ew-resize',
  center: 'auto',
  'center-right': 'ew-resize',
  'bottom-left': 'nesw-resize',
  'bottom-center': 'ns-resize',
  'bottom-right': 'nwse-resize'
};

export default {
  move,
  resize,
  scale,
  rotate,
  rotateTransform,
  scaleTransform,
  cursorByPosition,
  applyStyle
};
