import { Component, Position } from './types';
import utils from './utils';

const defaultStyle = {
  border: '3px solid #5980FA',
  position: 'absolute',
  borderRadius: '2px',
  boxShadow: '0px 0px 5px 2px rgba(50,130,200,0.75)'
};

const anchorsStyle = {
  backgroundColor: '#5980FA',
  border: '1px solid rgba(255,255,255,0.9)',
  position: 'absolute',
  borderRadius: '5px',
  width: '10px',
  height: '10px'
  // boxShadow: '0px 0px 5px 1px rgba(50,130,200,0.75)'
};

// tslint:disable-next-line:max-classes-per-file
export class RxRotationAnchor implements Component {
  private _target: HTMLElement = document.createElement('div');

  public constructor(target: HTMLElement) {
    target.prepend(this._target);
  }

  public get target() {
    return this._target;
  }

  public updateStyle(style: Partial<CSSStyleDeclaration>) {
    utils.applyStyle(this._target, {
      ...anchorsStyle,
      backgroundColor: 'rgba(255,100,150)',
      cursor: 'alias',
      ...style
    });
  }
}

// tslint:disable-next-line:max-classes-per-file
export class RxAnchor implements Component {
  private _target: HTMLElement = document.createElement('div');

  public constructor(target: HTMLElement, private _position: Position) {
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
    utils.applyStyle(this._target, {
      ...anchorsStyle,
      cursor: utils.cursorByPosition[this._position],
      ...style
    });
  }
}

// tslint:disable-next-line: max-classes-per-file
export class RxFrame implements Component {
  private readonly _target: HTMLElement = document.createElement('div');

  public constructor(target: HTMLElement) {
    target.prepend(this.target);
    this.setFocus(false);
    this.updateStyle(defaultStyle);
  }

  public updateStyle(style: Partial<CSSStyleDeclaration>) {
    utils.applyStyle(this._target, style);
  }

  public setFocus(focus: boolean) {
    this._target.hidden = !focus;
  }

  public get target() {
    return this._target;
  }
}

export type RxAnchor2D = [
  [RxAnchor, RxAnchor, RxAnchor],
  [RxAnchor, RxAnchor, RxAnchor],
  [RxAnchor, RxAnchor, RxAnchor]
];

// tslint:disable-next-line: max-classes-per-file
export class RxComponent implements Component {
  private readonly _rxAnchors: RxAnchor2D;
  private readonly _rxRotationAnchor: RxRotationAnchor;
  private readonly _rxFrame: RxFrame;

  constructor(
    private readonly _target: HTMLElement,
    style: Partial<CSSStyleDeclaration>
  ) {
    // prettier-ignore
    this._rxAnchors = [
        [new RxAnchor(_target, 'top-left'), new RxAnchor(_target, 'top-center'), new RxAnchor(_target, 'top-right')],
        [new RxAnchor(_target, 'center-left'), new RxAnchor(_target, 'center'), new RxAnchor(_target, 'center-right')],
        [new RxAnchor(_target, 'bottom-left'), new RxAnchor(_target, 'bottom-center'), new RxAnchor(_target, 'bottom-right')]
    ];

    this._rxRotationAnchor = new RxRotationAnchor(_target);
    this._rxFrame = new RxFrame(_target);
    this.updateStyle({ ...style, position: 'relative' });
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

  public setFocus(value: boolean) {
    this._rxFrame.setFocus(value);
  }

  public changeVisibility(visibility: 'visible' | 'hidden') {
    this.rxFrame.updateStyle({
      visibility
    });
    this.rxAnchors.forEach(anchorSet =>
      anchorSet.forEach(anchor =>
        anchor.updateStyle({
          visibility
        })
      )
    );
    this.rxRotationAnchor.updateStyle({
      visibility
    });
  }

  public updateStyle(style: Partial<CSSStyleDeclaration>) {
    const { width, height } = utils.applyStyle(this._target, style);
    this._rxFrame.updateStyle({ width, height });
    this.updateAnchorsStyle({ width, height });
    this.updateRotationAnchorStyle({ width, height });
  }

  private updateRotationAnchorStyle(style: Partial<CSSStyleDeclaration>) {
    const height = +(style.height || '').slice(0, -2);
    const width = +(style.width || '').slice(0, -2);
    this._rxRotationAnchor.updateStyle({
      top: `${Math.round(-10 / 2 - 25)}px`,
      left: `${Math.round(-10 / 2 + width / 2)}px`
    });
  }

  private updateAnchorsStyle(style: Partial<CSSStyleDeclaration>) {
    const height = +(style.height || '').slice(0, -2);
    const width = +(style.width || '').slice(0, -2);
    this._rxAnchors.forEach((set, rowIndex) =>
      set.forEach((anchor, colIndex) => {
        anchor.updateStyle({
          top: `${Math.round(-10 / 2 + (height / 2) * rowIndex)}px`,
          left: `${Math.round(-10 / 2 + (width / 2) * colIndex)}px`
        });
      })
    );
  }
}
