import { combineLatest, EMPTY, merge, OperatorFunction } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  scan,
  startWith,
  tap,
  withLatestFrom
  // tslint:disable-next-line: no-submodule-imports
} from 'rxjs/operators';
import {
  drag,
  dragEnd,
  dragStart,
  dragStatus,
  onTap,
  onTapOut
} from './observables/events';
import {
  RxAnchor,
  RxAnchor2D,
  RxComponent,
  RxRotationAnchor
} from './rx-component';
import { RxSubscriber } from './rx-subscriber';
import {
  ComponentOptions,
  Draggable,
  DragInfo,
  Resizable,
  ResizeInfo,
  Rotable,
  RotationInfo,
  Scalable,
  ScaleInfo,
  Warpable,
  WarpInfo
} from './types';
import utils from './utils';

class RxRotationHandler {
  constructor(private rxRotationAnchor: RxRotationAnchor) {}

  public onDragStart() {
    return dragStart(this.rxRotationAnchor.target).pipe(
      map(mouseEvent => ({
        clientX: mouseEvent.clientX,
        clientY: mouseEvent.clientY
      }))
    );
  }

  public onDragEnd() {
    return dragEnd(this.rxRotationAnchor.target).pipe(
      map(mouseEvent => ({
        clientX: mouseEvent.clientX,
        clientY: mouseEvent.clientY
      }))
    );
  }

  public onDragStatus() {
    return dragStatus(this.rxRotationAnchor.target).pipe(
      map(status => ({
        status
      }))
    );
  }

  public onDrag(target: HTMLElement) {
    return this._onDrag().pipe(
      map(([from, to]) => {
        const { bottom, right, width, height } = target.getBoundingClientRect();
        const rect = {
          centerX: Math.round(right - width / 2),
          centerY: Math.round(bottom - height / 2)
        };
        return [rect, from, to] as [
          { centerX: number; centerY: number },
          { clientX: number; clientY: number },
          { clientX: number; clientY: number }
        ];
      })
    );
  }

  private _onDrag() {
    return drag(this.rxRotationAnchor.target).pipe(
      map(([from, to]) => [
        { clientX: from.clientX, clientY: from.clientY },
        { clientX: to.clientX, clientY: to.clientY }
      ])
    );
  }
}

// tslint:disable-next-line: max-classes-per-file tslint:disable-next-line: max-line-length
class RxAnchorsHandler {
  constructor(private rxAnchors: RxAnchor2D) {}

  public onDragStart() {
    const start = (anchor: RxAnchor) =>
      dragStart(anchor.target).pipe(
        map(mouseEvent => ({
          position: anchor.position,
          clientX: mouseEvent.clientX,
          clientY: mouseEvent.clientY
        }))
      );
    return merge(
      ...this.rxAnchors.flat().map(anchor => start(anchor as RxAnchor))
    );
  }

  public onDragEnd() {
    const end = (anchor: RxAnchor) =>
      dragEnd(anchor.target).pipe(
        map(mouseEvent => ({
          position: anchor.position,
          clientX: mouseEvent.clientX,
          clientY: mouseEvent.clientY
        }))
      );
    return merge(
      ...this.rxAnchors.flat().map(anchor => end(anchor as RxAnchor))
    );
  }

  public onDragStatus() {
    const end = (anchor: RxAnchor) =>
      dragStatus(anchor.target).pipe(
        map(status => ({
          position: anchor.position,
          status
        }))
      );
    return merge(
      ...this.rxAnchors.flat().map(anchor => end(anchor as RxAnchor))
    );
  }

  public onDrag() {
    const _drag = (anchor: RxAnchor) =>
      drag(anchor.target).pipe(
        map(([from, to]) => ({
          position: anchor.position,
          from: { clientX: from.clientX, clientY: from.clientY },
          to: { clientX: to.clientX, clientY: to.clientY }
        }))
      );
    return merge(
      ...this.rxAnchors.flat().map(anchor => _drag(anchor as RxAnchor))
    );
  }
}

// tslint:disable-next-line: max-classes-per-file tslint:disable-next-line: max-line-length
export class RxHandler
  implements
    Draggable<DragInfo, RxHandler>,
    Resizable<ResizeInfo, RxHandler>,
    Scalable<ScaleInfo, RxHandler>,
    Rotable<RotationInfo, RxHandler>,
    Warpable<WarpInfo, RxHandler> {
  private readonly rxAnchorsHandler: RxAnchorsHandler;
  private readonly rxRotationHandler: RxRotationHandler;
  private readonly rxSubscriber: RxSubscriber = new RxSubscriber();

  constructor(
    private readonly rxComponent: RxComponent,
    private _options: ComponentOptions
  ) {
    this.rxAnchorsHandler = new RxAnchorsHandler(rxComponent.rxAnchors);
    this.rxRotationHandler = new RxRotationHandler(
      rxComponent.rxRotationAnchor
    );
    this.subscribeAll();
  }

  /**
   * This properties are read-only.
   * To update them use updateOptions instead.
   *
   * @returns Component options
   */
  public get options() {
    const options: ComponentOptions = { ...this._options };
    return options;
  }

  public updateOptions(options: Partial<ComponentOptions>) {
    this._options = { ...this.options, ...options };
    this.rxComponent.changeVisibility(
      this._options.interactive ? 'visible' : 'hidden'
    );
  }

  public onDragStart(
    arg: (arg: { clientX: number; clientY: number }) => any
  ): RxHandler {
    this.rxSubscriber.subscribeTo(
      'dragstart',
      dragStart(this.rxComponent.target).pipe(
        map(
          mouseEvent => ({
            clientX: mouseEvent.clientX,
            clientY: mouseEvent.clientY
          }),
          tap(arg)
        )
      )
    );
    return this;
  }

  public onDragEnd(
    arg: (arg: { clientX: number; clientY: number }) => any
  ): RxHandler {
    this.rxSubscriber.subscribeTo(
      'dragend',
      dragEnd(this.rxComponent.target).pipe(
        map(
          mouseEvent => ({
            clientX: mouseEvent.clientX,
            clientY: mouseEvent.clientY
          }),
          tap(arg)
        )
      )
    );
    return this;
  }

  public onDrag(arg1: OperatorFunction<DragInfo, DragInfo>): RxHandler;
  public onDrag<A>(
    arg1: OperatorFunction<DragInfo, A>,
    arg2: OperatorFunction<A, DragInfo>
  ): RxHandler;
  public onDrag<A, B>(
    arg1: OperatorFunction<DragInfo, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, DragInfo>
  ): RxHandler;
  public onDrag<A, B, C>(
    arg1: OperatorFunction<DragInfo, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, DragInfo>
  ): RxHandler;
  public onDrag<A, B, C, D>(
    arg1: OperatorFunction<DragInfo, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, DragInfo>
  ): RxHandler;
  public onDrag<A, B, C, D, E>(
    arg1: OperatorFunction<DragInfo, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, DragInfo>
  ): RxHandler;
  public onDrag<A, B, C, D, E, F>(
    arg1: OperatorFunction<DragInfo, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, DragInfo>
  ): RxHandler;
  public onDrag<A, B, C, D, E, F, G>(
    arg1: OperatorFunction<DragInfo, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, G>,
    arg8: OperatorFunction<G, DragInfo>
  ): RxHandler;
  public onDrag<A, B, C, D, E, F, G, H>(
    arg1: OperatorFunction<DragInfo, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, G>,
    arg8: OperatorFunction<G, H>,
    arg9: OperatorFunction<H, DragInfo>
  ): RxHandler;
  public onDrag<A, B, C, D, E, F, G, H, I>(
    arg1: OperatorFunction<DragInfo, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, G>,
    arg8: OperatorFunction<G, H>,
    arg9: OperatorFunction<H, I>,
    arg10: OperatorFunction<I, any>,
    ...arg11: Array<OperatorFunction<any, DragInfo>>
  ): RxHandler;
  public onDrag(...args: any[]) {
    const dragObservable = drag(this.rxComponent.target)
      // @ts-ignore
      .pipe(
        filter(_ => this.options.draggable),
        withLatestFrom(
          combineLatest([
            this.rxAnchorsHandler.onDragStatus().pipe(startWith(null)),
            this.rxRotationHandler.onDragStatus().pipe(startWith(null))
          ])
        ),
        filter(([_, tail]) =>
          tail.every((value: any) => !value || value.status === 'up')
        ),
        // @ts-ignore
        map(([[from, to]]) => [
          { clientX: from.clientX, clientY: from.clientY },
          { clientX: to.clientX, clientY: to.clientY }
        ]),
        ...args,
        tap(([from, to]) =>
          this.rxComponent.updateStyle(
            utils.move(this.rxComponent.target, from, to)
          )
        )
      );

    this.rxSubscriber.subscribeTo('ondrag', dragObservable);
    return this;
  }

  public onResizeStart(arg: (arg: ResizeInfo) => any): RxHandler {
    const onResize = this.rxAnchorsHandler.onDragStart().pipe(
      filter(_ => this.options.resizable),
      tap(arg)
    );
    this.rxSubscriber.subscribeTo('resizestart', onResize);
    return this;
  }

  public onResizeEnd(arg: (arg: ResizeInfo) => any): RxHandler {
    const onResize = this.rxAnchorsHandler.onDragEnd().pipe(
      filter(_ => this.options.resizable),
      tap(arg)
    );
    this.rxSubscriber.subscribeTo('resizeend', onResize);
    return this;
  }

  onResize(arg1: OperatorFunction<ResizeInfo, ResizeInfo>): RxHandler;
  onResize<A>(
    arg1: OperatorFunction<ResizeInfo, A>,
    arg2: OperatorFunction<A, ResizeInfo>
  ): RxHandler;
  onResize<A, B>(
    arg1: OperatorFunction<ResizeInfo, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, ResizeInfo>
  ): RxHandler;
  onResize<A, B, C>(
    arg1: OperatorFunction<ResizeInfo, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, ResizeInfo>
  ): RxHandler;
  onResize<A, B, C, D>(
    arg1: OperatorFunction<ResizeInfo, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, ResizeInfo>
  ): RxHandler;
  onResize<A, B, C, D, E>(
    arg1: OperatorFunction<ResizeInfo, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, ResizeInfo>
  ): RxHandler;
  onResize<A, B, C, D, E, F>(
    arg1: OperatorFunction<ResizeInfo, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, ResizeInfo>
  ): RxHandler;
  onResize<A, B, C, D, E, F, G>(
    arg1: OperatorFunction<ResizeInfo, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, G>,
    arg8: OperatorFunction<G, ResizeInfo>
  ): RxHandler;
  onResize<A, B, C, D, E, F, G, H>(
    arg1: OperatorFunction<ResizeInfo, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, G>,
    arg8: OperatorFunction<G, H>,
    arg9: OperatorFunction<H, ResizeInfo>
  ): RxHandler;
  onResize<A, B, C, D, E, F, G, H, I>(
    arg1: OperatorFunction<ResizeInfo, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, G>,
    arg8: OperatorFunction<G, H>,
    arg9: OperatorFunction<H, I>,
    arg10: OperatorFunction<I, any>,
    ...arg11: Array<OperatorFunction<any, ResizeInfo>>
  ): RxHandler;
  public onResize(...args: any[]): RxHandler {
    // @ts-ignore
    const onResize = this.rxAnchorsHandler.onDrag().pipe(
      filter(_ => this.options.resizable),
      ...args,
      tap(({ from, to, position }) =>
        this.rxComponent.updateStyle(
          utils.resize(this.rxComponent.target, position, from, to)
        )
      )
    );
    this.rxSubscriber.subscribeTo('resize', onResize);
    return this;
  }

  public onScaleStart(arg: (arg: ResizeInfo) => any): RxHandler {
    const onScaleStart = this.rxAnchorsHandler.onDragStart().pipe(
      filter(_ => this.options.scalable),
      tap(arg)
    );
    this.rxSubscriber.subscribeTo('scalestart', onScaleStart);
    return this;
  }

  public onScaleEnd(arg: (arg: ResizeInfo) => any): RxHandler {
    const onScaleEnd = this.rxAnchorsHandler.onDragStart().pipe(
      filter(_ => this.options.scalable),
      tap(arg)
    );
    this.rxSubscriber.subscribeTo('scaleend', onScaleEnd);
    return this;
  }

  onScale(arg1: OperatorFunction<ScaleInfo, ScaleInfo>): RxHandler;
  onScale<A>(
    arg1: OperatorFunction<ScaleInfo, A>,
    arg2: OperatorFunction<A, ScaleInfo>
  ): RxHandler;
  onScale<A, B>(
    arg1: OperatorFunction<ScaleInfo, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, ScaleInfo>
  ): RxHandler;
  onScale<A, B, C>(
    arg1: OperatorFunction<ScaleInfo, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, ScaleInfo>
  ): RxHandler;
  onScale<A, B, C, D>(
    arg1: OperatorFunction<ScaleInfo, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, ScaleInfo>
  ): RxHandler;
  onScale<A, B, C, D, E>(
    arg1: OperatorFunction<ScaleInfo, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, ScaleInfo>
  ): RxHandler;
  onScale<A, B, C, D, E, F>(
    arg1: OperatorFunction<ScaleInfo, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, ScaleInfo>
  ): RxHandler;
  onScale<A, B, C, D, E, F, G>(
    arg1: OperatorFunction<ScaleInfo, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, G>,
    arg8: OperatorFunction<G, ScaleInfo>
  ): RxHandler;
  onScale<A, B, C, D, E, F, G, H>(
    arg1: OperatorFunction<ScaleInfo, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, G>,
    arg8: OperatorFunction<G, H>,
    arg9: OperatorFunction<H, ScaleInfo>
  ): RxHandler;
  onScale<A, B, C, D, E, F, G, H, I>(
    arg1: OperatorFunction<ScaleInfo, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, G>,
    arg8: OperatorFunction<G, H>,
    arg9: OperatorFunction<H, I>,
    arg10: OperatorFunction<I, any>,
    ...arg11: Array<OperatorFunction<any, ScaleInfo>>
  ): RxHandler;
  public onScale(...args: any[]): RxHandler {
    // @ts-ignore
    const onScale = this.rxAnchorsHandler.onDrag().pipe(
      filter(_ => this.options.scalable),
      // @ts-ignore
      map(value => utils.scale(this.rxComponent.target, value)),
      scan((acc, value: any) => ({
        scaleX: acc.scaleX * value.scaleX,
        scaleY: acc.scaleY * value.scaleY,
      })),
      // @ts-ignore
      ...args,
      // @ts-ignore
      tap(value => this.rxComponent.updateStyle(utils.scaleTransform(value)))
    );
    this.rxSubscriber.subscribeTo('scale', onScale);
    return this;
  }

  public onWarpStart(): RxHandler {
    const onResize = EMPTY;
    this.rxSubscriber.subscribeTo('warpstart', onResize);
    return this;
  }
  public onWarpEnd(): RxHandler {
    const onResize = EMPTY;
    this.rxSubscriber.subscribeTo('warpend', onResize);
    return this;
  }

  public onWarp(): RxHandler {
    const onWarp = EMPTY;
    this.rxSubscriber.subscribeTo('warp', onWarp);
    return this;
  }

  public onRotationStart(
    arg: (arg: { clientX: number; clientY: number }) => any
  ): RxHandler {
    const onRotationStart = this.rxRotationHandler.onDragStart().pipe(tap(arg));
    this.rxSubscriber.subscribeTo('rotationstart', onRotationStart);
    return this;
  }
  public onRotationEnd(
    arg: (arg: { clientX: number; clientY: number }) => any
  ): RxHandler {
    const onRotationEnd = this.rxRotationHandler.onDragEnd().pipe(tap(arg));
    this.rxSubscriber.subscribeTo('rotationend', onRotationEnd);
    return this;
  }

  onRotation(arg1: OperatorFunction<RotationInfo, RotationInfo>): RxHandler;
  onRotation<A>(
    arg1: OperatorFunction<RotationInfo, A>,
    arg2: OperatorFunction<A, RotationInfo>
  ): RxHandler;
  onRotation<A, B>(
    arg1: OperatorFunction<RotationInfo, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, RotationInfo>
  ): RxHandler;
  onRotation<A, B, C>(
    arg1: OperatorFunction<RotationInfo, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, RotationInfo>
  ): RxHandler;
  onRotation<A, B, C, D>(
    arg1: OperatorFunction<RotationInfo, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, RotationInfo>
  ): RxHandler;
  onRotation<A, B, C, D, E>(
    arg1: OperatorFunction<RotationInfo, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, RotationInfo>
  ): RxHandler;
  onRotation<A, B, C, D, E, F>(
    arg1: OperatorFunction<RotationInfo, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, RotationInfo>
  ): RxHandler;
  onRotation<A, B, C, D, E, F, G>(
    arg1: OperatorFunction<RotationInfo, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, G>,
    arg8: OperatorFunction<G, RotationInfo>
  ): RxHandler;
  onRotation<A, B, C, D, E, F, G, H>(
    arg1: OperatorFunction<RotationInfo, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, G>,
    arg8: OperatorFunction<G, H>,
    arg9: OperatorFunction<H, RotationInfo>
  ): RxHandler;
  onRotation<A, B, C, D, E, F, G, H, I>(
    arg1: OperatorFunction<RotationInfo, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, G>,
    arg8: OperatorFunction<G, H>,
    arg9: OperatorFunction<H, I>,
    arg10: OperatorFunction<I, any>,
    ...arg11: Array<OperatorFunction<any, RotationInfo>>
  ): RxHandler;
  public onRotation(...args: any[]): RxHandler {
    const onRotation = this.rxRotationHandler
      .onDrag(this.rxComponent.target)
      // @ts-ignore
      .pipe(
        filter(_ => this.options.rotatable),
        ...args,
        tap(([rect, start, end]) =>
          this.rxComponent.updateStyle(
            utils.rotateTransform(utils.rotate(rect, end))
          )
        )
      );
    this.rxSubscriber.subscribeTo('rotation', onRotation);
    return this;
  }

  public onFocus(arg: (arg: MouseEvent) => any): RxHandler {
    const onFocus = onTap(this.rxComponent.target).pipe(
      distinctUntilChanged(),
      tap(arg),
      filter(_ => this.options.interactive),
      tap(() => {
        this.rxComponent.setFocus(true);
      })
    );
    this.rxSubscriber.subscribeTo('focus', onFocus);
    return this;
  }

  public onBlur(arg: (arg: MouseEvent) => any): RxHandler {
    const onBlur = onTapOut(this.rxComponent.target).pipe(
      tap(value => arg(value)),
      filter(_ => this.options.interactive),
      tap(() => this.rxComponent.setFocus(false))
    );
    this.rxSubscriber.subscribeTo('blur', onBlur);
    return this;
  }

  private subscribeAll(arg: () => any = () => {}) {
    this.onBlur(arg)
      .onDrag(tap(arg))
      .onDragStart(arg)
      .onDragStart(arg)
      .onWarpEnd()
      .onWarpStart()
      .onWarp()
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
