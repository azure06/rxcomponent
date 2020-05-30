import { Component, ComponentOptions, Vector, Vertices } from './types';
import { RxHandler } from '../main';
import { Side } from './types';
import { Subject, Subscription, combineLatest, merge } from 'rxjs';
import {
  add,
  applyCss,
  cursorByPosition,
  matrixToCss,
  resize,
  rotate,
  rotateToCss,
  scaleToCss,
  size,
  translateToCss,
  verticesFromCss,
  verticesFromDistance,
} from './utils/vector';
import { create3DMatrix } from './utils/matrix';
import { map, startWith, tap } from 'rxjs/operators';
import { scan } from 'rxjs/operators';

const defaultStyle = {
  border: '3px solid #5980FA',
  position: 'absolute',
  borderRadius: '2px',
  boxShadow: '0px 0px 5px 2px rgba(50,130,200,0.75)',
  zIndex: '-1',
  boxSizing: 'inherit',
};

const anchorsStyle = {
  backgroundColor: '#5980FA',
  border: '1px solid rgba(255,255,255,0.9)',
  position: 'absolute',
  borderRadius: '5px',
  width: '10px',
  height: '10px',
  boxSizing: 'inherit',
  // boxShadow: '0px 0px 5px 1px rgba(50,130,200,0.75)'
};

export class RxRotationAnchor implements Component {
  private _target: HTMLElement = document.createElement('div');

  public constructor(target: HTMLElement) {
    target.prepend(this._target);
  }

  public get target() {
    return this._target;
  }

  public updateStyle(style: Partial<CSSStyleDeclaration>) {
    applyCss(this._target, {
      ...anchorsStyle,
      backgroundColor: 'rgba(255,100,150)',
      cursor: 'alias',
      ...style,
    });
  }
}

export class RxAnchor implements Component {
  private _target: HTMLElement = document.createElement('div');

  public constructor(target: HTMLElement, private _position: Side) {
    target.prepend(this._target);
    if (_position === 'center') {
      this._target.hidden = true;
    }
  }

  public get target() {
    return this._target;
  }

  public get position() {
    return this._position;
  }

  public updateStyle(style: Partial<CSSStyleDeclaration>) {
    applyCss(this._target, {
      ...anchorsStyle,
      cursor: cursorByPosition[this._position],
      ...style,
    });
  }
}

export class RxFrame implements Component {
  private readonly _target: HTMLElement = document.createElement('div');

  public constructor(target: HTMLElement) {
    target.prepend(this.target);
    this.setFocus(false);
    this.updateStyle(defaultStyle);
  }

  public updateStyle(style: Partial<CSSStyleDeclaration>) {
    applyCss(this._target, style);
  }

  public setFocus(focus: boolean) {
    this._target.style.visibility = focus ? 'visible' : 'hidden';
  }

  public get focussed() {
    return this._target.style.visibility === 'visible';
  }

  public get target() {
    return this._target;
  }
}

export type RxAnchor2D = [
  [RxAnchor, RxAnchor, RxAnchor],
  [RxAnchor, RxAnchor, RxAnchor],
  [RxAnchor, RxAnchor, RxAnchor],
];

export class RxComponent implements Component {
  private readonly _rxAnchors: RxAnchor2D;
  private readonly _rxRotationAnchor: RxRotationAnchor;
  private readonly _rxFrame: RxFrame;

  private readonly moveSubject = new Subject<Vector>();
  private readonly resizeSubject = new Subject<[Side, Vector]>();
  private readonly warpSubject = new Subject<[Side, Vector]>();
  private readonly scaleSubject = new Subject<Vector>();

  private readonly warpCssSubject = new Subject<string>();
  private readonly rotationCssSubject = new Subject<string>();
  private readonly scaleCssSubject = new Subject<string>();
  private readonly moveCssSubject = new Subject<Vector>();
  private readonly resizeCssSubject = new Subject<Vector>();

  private readonly moveStream = this.moveSubject.asObservable().pipe(
    scan<Vector>((acc, distance) => add(acc, distance), [0, 0]),
    tap(args => this.moveCssSubject.next(args)),
  );
  private readonly resizeStream = this.resizeSubject.asObservable().pipe(
    scan<[Side, Vector], [Vector, Vector]>(
      ([_, position], [side, distance]) => resize(side, position, distance),
      [
        [0, 0],
        [0, 0],
      ],
    ),
    tap(([[offsetX, offsetY], distance]) => {
      const [width, height] = size(verticesFromCss(this.target));
      this.resizeCssSubject.next(distance);
      this.applyCommonCss(
        this.updateStyle({
          width: `${width + offsetX}px`,
          height: `${height + offsetY}px`,
        }),
      );
    }),
  );
  private readonly warpStream = this.warpSubject.asObservable().pipe(
    scan<[Side, Vector], { [key in Side]: Vector }>((acc, [side, distance]) => {
      acc[side] = acc[side] ? add(acc[side], distance) : distance;
      return acc;
    }, {} as { [key in Side]: Vector }),
    map(verticesDist => {
      const [width, height] = size(verticesFromCss(this.target));
      const from: Vertices = [
        [0, 0],
        [0, height],
        [width, 0],
        [width, height],
      ];
      const to: Vertices = verticesFromDistance(from, verticesDist);
      return [from, to] as [Vertices, Vertices];
    }),
    tap(([start, end]) => {
      const matrix = create3DMatrix(start, end);
      this.warpCssSubject.next(matrixToCss(matrix));
    }),
  );
  private readonly scaleStream = this.scaleSubject.asObservable().pipe(
    scan<Vector>(([xScale, yScale], [xK, yK]) => [xScale * xK, yScale * yK], [
      1,
      1,
    ]),
    tap(k => this.scaleCssSubject.next(scaleToCss(k))),
  );
  private readonly transformCssStream = combineLatest(
    combineLatest(
      this.moveCssSubject.asObservable().pipe(startWith([0, 0] as Vector)),
      this.resizeCssSubject.asObservable().pipe(startWith([0, 0] as Vector)),
    ).pipe(map(([t1, t2]) => translateToCss(add(t1, t2)))),
    this.warpCssSubject.asObservable().pipe(startWith('')),
    this.scaleCssSubject.asObservable().pipe(startWith('')),
    this.rotationCssSubject.asObservable().pipe(startWith('')),
  ).pipe(
    tap(props =>
      this.updateStyle({
        transform: props.filter(prop => !!prop).join(' '),
      }),
    ),
  );

  public move(distance: Vector) {
    this.moveSubject.next(distance);
  }

  public resize(side: Side, distance: Vector) {
    this.resizeSubject.next([side, distance]);
  }

  public warp(side: Side, distance: Vector) {
    this.warpSubject.next([side, distance]);
  }

  public rotate(center: Vector, to: Vector) {
    this.rotationCssSubject.next(rotateToCss(rotate(center, to)));
  }

  public scale(k: Vector) {
    this.scaleSubject.next(k);
  }

  public readonly subscription: Subscription = merge(
    this.moveStream,
    this.resizeStream,
    this.warpStream,
    this.scaleStream,
    this.transformCssStream,
  ).subscribe();

  constructor(
    private readonly _target: HTMLElement,
    style: Partial<CSSStyleDeclaration>,
  ) {
    // prettier-ignore
    this._rxAnchors = [
      [new RxAnchor(_target, 'top-left'), new RxAnchor(_target, 'top-center'), new RxAnchor(_target, 'top-right')],
      [new RxAnchor(_target, 'center-left'), new RxAnchor(_target, 'center'), new RxAnchor(_target, 'center-right')],
      [new RxAnchor(_target, 'bottom-left'), new RxAnchor(_target, 'bottom-center'), new RxAnchor(_target, 'bottom-right')]
    ];

    this._rxRotationAnchor = new RxRotationAnchor(_target);
    this._rxFrame = new RxFrame(_target);

    // Positioning of anchors and frame
    this.applyCommonCss(
      this.updateStyle({
        ...style,
        boxSizing: 'border-box',
        position: 'relative',
      }),
    );
  }

  public get target() {
    return this._target;
  }

  public get rxFrame() {
    return this._rxFrame;
  }

  public get rxAnchors() {
    return this._rxAnchors;
  }

  public get rxRotationAnchor() {
    return this._rxRotationAnchor;
  }

  public get focused() {
    return this.rxFrame.focussed;
  }

  public setFocus(value: boolean) {
    this.rxFrame.setFocus(value);
  }

  public changeAnchorsVisibility(rxHandler: RxHandler) {
    const frameVisible = rxHandler.draggable;
    const anchorVisible =
      rxHandler.warpable || rxHandler.resizable || rxHandler.scalable;
    const rotationAnchorVisible = rxHandler.rotable;

    const toVisibility = (value: boolean) => ({
      visibility:
        rxHandler.interactive && this.focused && value ? 'visible' : 'hidden',
    });

    this.rxFrame.updateStyle(toVisibility(frameVisible));

    this.rxAnchors.forEach(anchorSet =>
      anchorSet.forEach(anchor =>
        anchor.updateStyle(toVisibility(anchorVisible)),
      ),
    );

    this.rxRotationAnchor.updateStyle(toVisibility(rotationAnchorVisible));
  }

  public updateStyle(style: Partial<CSSStyleDeclaration>) {
    return applyCss(this._target, style);
  }

  // prettier-ignore
  private applyCommonCss({ width: widthStr, height: heightStr }: CSSStyleDeclaration) {
    const [width, height] = [+widthStr.slice(0, -2), +heightStr.slice(0, -2)];
    // Update anchors
    this._rxAnchors.forEach((set, rowIndex) =>
      set.forEach((anchor, colIndex) => {
        anchor.updateStyle({
          top: `${Math.round(-10 / 2 + (height / 2) * rowIndex)}px`,
          left: `${Math.round(-10 / 2 + (width / 2) * colIndex)}px`,
        });
      })
    );
    // Update rotation anchor
    this._rxRotationAnchor.updateStyle({
      top: `${Math.round(-10 / 2 - 25)}px`,
      left: `${Math.round(-10 / 2 + width / 2)}px`,
    });
    this.rxFrame.updateStyle({ width: `${width}px`, height: `${height}px` });
  }
}
