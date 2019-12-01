export type Vector = [number, number];

//TopLeft, BottomLeft, TopRight, BottomRight
export type Vertices = [Vector, Vector, Vector, Vector];

export type Side =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface DefaultOptions {
  interactive: boolean;
  draggable: boolean;
  rotable: boolean;
}

export interface Scalable {
  scalable: boolean;
}

export interface Resizable {
  resizable: boolean;
}

export interface Warpable {
  warpable: boolean;
}

export type ComponentOptions =
  | (DefaultOptions & Scalable)
  | (DefaultOptions & Resizable)
  | (DefaultOptions & Warpable);

export interface Component {
  updateStyle: (style: Partial<CSSStyleDeclaration>) => void;
}
