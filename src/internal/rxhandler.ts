import {
  ComponentOptions,
  Resizable,
  Scalable,
  Vertices,
  Warpable,
} from './types';
import { Observable, OperatorFunction, combineLatest, merge, of } from 'rxjs';
import {
  RxAnchor,
  RxAnchor2D,
  RxComponent,
  RxRotationAnchor,
} from './rxcomponent';
import { RxSubscriber } from './rxsubscriber';
import {
  add,
  centerFromVertices,
  mouseEventToVector,
  resize,
  scale,
  size,
  subtract,
  verticesFromCss,
  verticesFromDistance,
  verticesFromViewPort,
} from './utils/vector';
import {
  distinctUntilChanged,
  filter,
  map,
  scan,
  startWith,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import {
  drag,
  dragEnd,
  dragStart,
  dragStatus,
  onBlur,
  onFocus,
} from './observables/events';

import { EventTarget } from './observables/events';
import { Side, Vector } from './types';

class RxRotationHandler {
  constructor(private rxRotationAnchor: RxRotationAnchor) {}

  public onDragStart() {
    return dragStart(this.rxRotationAnchor.target).pipe(
      map(mouseEventToVector),
    );
  }

  public onDragEnd() {
    return dragEnd(this.rxRotationAnchor.target).pipe(map(mouseEventToVector));
  }

  public onDragStatus() {
    return dragStatus(this.rxRotationAnchor.target);
  }

  public onDrag(target: HTMLElement) {
    return drag(this.rxRotationAnchor.target).pipe(
      map(([from, to]) => [mouseEventToVector(from), mouseEventToVector(to)]),
      map(([from, to]): [Vector, Vector, Vector] => {
        const center = centerFromVertices(verticesFromViewPort(target));
        return [center, from, to];
      }),
    );
  }
}

class RxAnchorsHandler {
  constructor(private rxAnchors: RxAnchor2D) {}

  private mergeComponents<T, R>(
    event: (target: EventTarget) => Observable<T>,
    transform: (rxAnchor: RxAnchor) => OperatorFunction<T, R>,
  ) {
    const events = this.rxAnchors
      .reduce((acc, value) => [...acc, ...value], [] as RxAnchor[])
      .map(anchor => event(anchor.target).pipe(transform(anchor)));
    return merge(...events);
  }

  public onDragStart() {
    return this.mergeComponents(dragStart, anchor =>
      map((mouseEvent): [Side, Vector] => [
        anchor.position,
        mouseEventToVector(mouseEvent),
      ]),
    );
  }

  public onDragEnd() {
    return this.mergeComponents(dragEnd, anchor =>
      map((mouseEvent): [Side, Vector] => [
        anchor.position,
        mouseEventToVector(mouseEvent),
      ]),
    );
  }

  public onDragStatus() {
    return this.mergeComponents(dragStatus, anchor =>
      map((status): [Side, 'up' | 'down'] => [anchor.position, status]),
    );
  }

  public onDrag() {
    return this.mergeComponents(drag, anchor =>
      map(([from, to]): [Side, Vector, Vector] => [
        anchor.position,
        mouseEventToVector(from),
        mouseEventToVector(to),
      ]),
    );
  }
}

export class RxHandler {
  private readonly rxAnchorsHandler: RxAnchorsHandler;
  private readonly rxRotationHandler: RxRotationHandler;
  private readonly rxSubscriber: RxSubscriber = new RxSubscriber();
  private dragObservable?: Observable<Vector>;

  constructor(
    private readonly rxComponent: RxComponent,
    private options: ComponentOptions,
  ) {
    this.rxAnchorsHandler = new RxAnchorsHandler(rxComponent.rxAnchors);
    this.rxRotationHandler = new RxRotationHandler(
      rxComponent.rxRotationAnchor,
    );

    this.rxComponent.changeAnchorsVisibility(this);
    this.subscribeAll();
  }

  public get draggable() {
    return this.options.draggable;
  }

  public get rotable() {
    return this.options.rotable;
  }

  public get resizable() {
    return 'resizable' in this.options && this.options.resizable;
  }

  public get warpable() {
    return 'warpable' in this.options && this.options.warpable;
  }

  public get scalable() {
    return 'scalable' in this.options && this.options.scalable;
  }

  public get interactive() {
    return this.options.interactive;
  }

  public updateOptions(options: Partial<ComponentOptions>) {
    const { draggable, interactive, rotable } = options;
    const rest = (): Scalable | Resizable | Warpable | ComponentOptions =>
      'warpable' in options
        ? { warpable: !!options.warpable }
        : 'resizable' in options
        ? { resizable: !!options.resizable }
        : 'scalable' in options
        ? { scalable: !!options.scalable }
        : this.options;

    this.options = {
      ...rest(),
      draggable: draggable === undefined ? this.options.draggable : draggable,
      interactive:
        interactive === undefined ? this.options.interactive : interactive,
      rotable: rotable === undefined ? this.options.rotable : rotable,
    };

    this.rxComponent.changeAnchorsVisibility(this);
  }

  public onDragStart(arg: (from: Vector) => void) {
    this.rxSubscriber.subscribeTo(
      'dragstart',
      dragStart(this.rxComponent.target).pipe(
        filter(_ => this.draggable),
        map(mouseEventToVector),
        tap(arg),
      ),
    );
    return this;
  }

  public onDragEnd(arg: (to: Vector) => void) {
    this.rxSubscriber.subscribeTo(
      'dragend',
      dragEnd(this.rxComponent.target).pipe(
        filter(_ => this.draggable),
        map(mouseEventToVector),
        tap(arg),
      ),
    );
    return this;
  }

  public onDrag(
    operator: OperatorFunction<[Vector, Vector], [Vector, Vector]>,
  ) {
    this.dragObservable = drag(this.rxComponent.target).pipe(
      filter(_ => this.draggable),
      withLatestFrom(
        combineLatest([
          this.rxAnchorsHandler.onDragStatus().pipe(
            startWith([null, null]),
            map(([_, status]) => status),
          ),
          this.rxRotationHandler.onDragStatus().pipe(startWith(null)),
        ]),
      ),
      filter(([_, tail]) => tail.every(status => !status || status === 'up')),
      map(([[from, to]]): [Vector, Vector] => [
        mouseEventToVector(from),
        mouseEventToVector(to),
      ]),
      operator,
      scan(
        (acc, [from, to]) => {
          acc = add(acc, subtract(from, to));
          return acc;
        },
        [0, 0] as Vector,
      ),
      tap(args => this.rxComponent.translate(args)),
    );
    this.rxSubscriber.subscribeTo('ondrag', this.dragObservable);
    return this;
  }

  public onResizeStart(arg: (arg: [Side, Vector]) => void) {
    const onResize = this.rxAnchorsHandler.onDragStart().pipe(
      filter(_ => this.resizable),
      tap(arg),
    );
    this.rxSubscriber.subscribeTo('resizestart', onResize);
    return this;
  }

  public onResizeEnd(arg: (arg: [Side, Vector]) => void) {
    const onResize = this.rxAnchorsHandler.onDragEnd().pipe(
      filter(_ => this.resizable),
      tap(arg),
    );
    this.rxSubscriber.subscribeTo('resizeend', onResize);
    return this;
  }

  public onResize(
    operator: OperatorFunction<[Side, Vector, Vector], [Side, Vector, Vector]>,
  ) {
    const onResize = this.rxAnchorsHandler.onDrag().pipe(
      filter(_ => this.resizable),
      operator,
      scan(
        ([_, translation], [side, from, to]) =>
          resize(side, translation, subtract(from, to)),
        [
          [0, 0],
          [0, 0],
        ] as [Vector, Vector],
      ),
      tap(args => this.rxComponent.resize(args)),
    );
    this.rxSubscriber.subscribeTo('resize', onResize);
    return this;
  }

  public onScaleStart(arg: (arg: [Side, Vector]) => void) {
    const onScaleStart = this.rxAnchorsHandler.onDragStart().pipe(
      filter(_ => this.scalable),
      tap(arg),
    );
    this.rxSubscriber.subscribeTo('scalestart', onScaleStart);
    return this;
  }

  public onScaleEnd(arg: (arg: [Side, Vector]) => void) {
    const onScaleEnd = this.rxAnchorsHandler.onDragEnd().pipe(
      filter(_ => this.scalable),
      tap(arg),
    );
    this.rxSubscriber.subscribeTo('scaleend', onScaleEnd);
    return this;
  }

  public onScale(operator: OperatorFunction<Vector, Vector>) {
    const onScale = this.rxAnchorsHandler.onDrag().pipe(
      filter(_ => this.scalable),
      map(([side, from, to]) =>
        scale(
          verticesFromViewPort(this.rxComponent.target),
          side,
          subtract(from, to),
        ),
      ),
      scan(
        ([xScale, yScale]: Vector, [xK, yK]): Vector => [
          xScale * xK,
          yScale * yK,
        ],
        [1, 1],
      ),
      operator,
      tap(values => this.rxComponent.scale(values)),
    );
    this.rxSubscriber.subscribeTo('scale', onScale);
    return this;
  }

  public onWarpStart(arg: (arg: [Side, Vector]) => void) {
    const onWarp = this.rxAnchorsHandler.onDragStart().pipe(
      filter(_ => this.scalable),
      tap(arg),
    );
    this.rxSubscriber.subscribeTo('warpstart', onWarp);
    return this;
  }
  public onWarpEnd(arg: (arg: [Side, Vector]) => void) {
    const onWarp = this.rxAnchorsHandler.onDragEnd().pipe(
      filter(_ => this.scalable),
      tap(arg),
    );
    this.rxSubscriber.subscribeTo('warpend', onWarp);
    return this;
  }

  public onWarp(
    operator: OperatorFunction<[Vertices, Vertices], [Vertices, Vertices]>,
  ) {
    const onWarp = this.rxAnchorsHandler.onDrag().pipe(
      filter(_ => this.warpable),
      scan((acc, [side, from, to]) => {
        acc[side] = acc[side]
          ? add(acc[side], subtract(from, to))
          : subtract(from, to);
        return acc;
      }, {} as { [key in Side]: Vector }),
      map(verticesDist => {
        const [width, height] = size(verticesFromCss(this.rxComponent.target));
        const from: Vertices = [
          [0, 0],
          [0, height],
          [width, 0],
          [width, height],
        ];
        const to: Vertices = verticesFromDistance(from, verticesDist);
        return [from, to] as [Vertices, Vertices];
      }),
      operator,
      tap(args => this.rxComponent.warp(...args)),
    );
    this.rxSubscriber.subscribeTo('warp', onWarp);
    return this;
  }

  public onRotationStart(arg: (arg: Vector) => void) {
    const onRotationStart = this.rxRotationHandler.onDragStart().pipe(
      filter(_ => this.rotable),
      tap(arg),
    );
    this.rxSubscriber.subscribeTo('rotationstart', onRotationStart);
    return this;
  }
  public onRotationEnd(arg: (arg: Vector) => void) {
    const onRotationEnd = this.rxRotationHandler.onDragEnd();
    this.rxSubscriber.subscribeTo('rotationend', onRotationEnd);
    return this;
  }

  public onRotation(
    operator: OperatorFunction<
      [Vector, Vector, Vector],
      [Vector, Vector, Vector]
    >,
  ) {
    const onRotation = this.rxRotationHandler
      .onDrag(this.rxComponent.target)
      .pipe(
        filter(_ => this.rotable),
        operator,
        tap(([center, _, to]) => this.rxComponent.rotate(center, to)),
      );
    this.rxSubscriber.subscribeTo('rotation', onRotation);
    return this;
  }

  public onFocus(arg?: (arg: MouseEvent) => void) {
    const onFocus_ = onFocus(this.rxComponent.target).pipe(
      distinctUntilChanged(),
      filter(_ => this.options.interactive),
      tap(
        arg
          ? arg
          : () => {
              this.rxComponent.setFocus(true);
              this.rxComponent.changeAnchorsVisibility(this);
            },
      ),
    );
    this.rxSubscriber.subscribeTo('focus', onFocus_);
    return this;
  }

  public onBlur(arg?: (arg: MouseEvent) => void) {
    const onBlur_ = onBlur(this.rxComponent.target).pipe(
      filter(_ => this.options.interactive),
      tap(
        arg
          ? arg
          : () => {
              this.rxComponent.setFocus(false);
              this.rxComponent.changeAnchorsVisibility(this);
            },
      ),
    );
    this.rxSubscriber.subscribeTo('blur', onBlur_);
    return this;
  }

  private subscribeAll(arg = () => {}) {
    this.onBlur()
      .onFocus()
      .onDrag(tap(arg))
      .onDragStart(arg)
      .onDragStart(arg)
      .onWarpEnd(arg)
      .onWarpStart(arg)
      .onWarp(tap(arg))
      .onResize(tap(arg))
      .onResizeEnd(arg)
      .onResizeStart(arg)
      .onRotation(tap(arg))
      .onRotationEnd(arg)
      .onRotationStart(arg)
      .onScale(tap(arg))
      .onScaleEnd(arg)
      .onScaleStart(arg);
  }
}
