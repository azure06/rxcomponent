import { Observable, OperatorFunction, Subscription } from 'rxjs';

/**
 * ** Component Options **
 *
 */
export interface ComponentOptions {
  readonly draggable: boolean;
  readonly rotatable: boolean;
  readonly scalable: boolean;
  readonly resizable: boolean;
  readonly keepRatio: boolean;
  readonly interactive: boolean;
}

/**
 * ** Position **
 *
 */
export type Position =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/**
 * ** From To Event **
 *
 */
export type DragInfo = [
  { clientX: number; clientY: number },
  { clientX: number; clientY: number }
];

export type WarpInfo = [
  { clientX: number; clientY: number },
  { clientX: number; clientY: number }
];

export interface ResizeInfo {
  clientX: number;
  clientY: number;
  position: Position;
}

export interface ScaleInfo {
  scaleX: number;
  scaleY: number;
}

export type RotationInfo = [
  { centerX: number; centerY: number },
  { clientX: number; clientY: number },
  { clientX: number; clientY: number }
];

/**
 * ** HTML Component **
 *
 */
export interface Component {
  updateStyle: (style: Partial<CSSStyleDeclaration>) => void;
}

/**
 * ** Draggable **
 *
 */
export interface Draggable<T, R> {
  onDragStart(arg1: (arg: any) => any): R;
  onDragEnd(arg1: (arg: any) => any): R;
  onDrag(arg1: OperatorFunction<T, T>): R;
  onDrag<A>(arg1: OperatorFunction<T, A>, arg2: OperatorFunction<A, T>): R;
  onDrag<A, B>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, T>
  ): R;
  onDrag<A, B, C>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, T>
  ): R;
  onDrag<A, B, C, D>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, T>
  ): R;
  onDrag<A, B, C, D, E>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, T>
  ): R;
  onDrag<A, B, C, D, E, F>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, T>
  ): R;
  onDrag<A, B, C, D, E, F, G>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, G>,
    arg8: OperatorFunction<G, T>
  ): R;
  onDrag<A, B, C, D, E, F, G, H>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, G>,
    arg8: OperatorFunction<G, H>,
    arg9: OperatorFunction<H, T>
  ): R;
  onDrag<A, B, C, D, E, F, G, H, I>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, G>,
    arg8: OperatorFunction<G, H>,
    arg9: OperatorFunction<H, I>,
    arg10: OperatorFunction<I, any>,
    ...arg11: Array<OperatorFunction<any, T>>
  ): R;
}

export interface Resizable<T, R> {
  onResizeStart(arg: (arg: any) => any): R;
  onResizeEnd(arg: (arg: any) => any): R;
  onResize(arg1: OperatorFunction<T, T>): R;
  onResize<A>(arg1: OperatorFunction<T, A>, arg2: OperatorFunction<A, T>): R;
  onResize<A, B>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, T>
  ): R;
  onResize<A, B, C>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, T>
  ): R;
  onResize<A, B, C, D>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, T>
  ): R;
  onResize<A, B, C, D, E>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, T>
  ): R;
  onResize<A, B, C, D, E, F>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, T>
  ): R;
  onResize<A, B, C, D, E, F, G>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, G>,
    arg8: OperatorFunction<G, T>
  ): R;
  onResize<A, B, C, D, E, F, G, H>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, G>,
    arg8: OperatorFunction<G, H>,
    arg9: OperatorFunction<H, T>
  ): R;
  onResize<A, B, C, D, E, F, G, H, I>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, G>,
    arg8: OperatorFunction<G, H>,
    arg9: OperatorFunction<H, I>,
    arg10: OperatorFunction<I, any>,
    ...arg11: Array<OperatorFunction<any, T>>
  ): R;
}

export interface Scalable<T, R> {
  onScaleStart(arg: (arg: ResizeInfo) => any): R;
  onScaleEnd(arg: (arg: ResizeInfo) => any): R;
  onScale(arg1: OperatorFunction<T, T>): R;
  onScale<A>(arg1: OperatorFunction<T, A>, arg2: OperatorFunction<A, T>): R;
  onScale<A, B>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, T>
  ): R;
  onScale<A, B, C>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, T>
  ): R;
  onScale<A, B, C, D>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, T>
  ): R;
  onScale<A, B, C, D, E>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, T>
  ): R;
  onScale<A, B, C, D, E, F>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, T>
  ): R;
  onScale<A, B, C, D, E, F, G>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, G>,
    arg8: OperatorFunction<G, T>
  ): R;
  onScale<A, B, C, D, E, F, G, H>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, G>,
    arg8: OperatorFunction<G, H>,
    arg9: OperatorFunction<H, T>
  ): R;
  onScale<A, B, C, D, E, F, G, H, I>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, G>,
    arg8: OperatorFunction<G, H>,
    arg9: OperatorFunction<H, I>,
    arg10: OperatorFunction<I, any>,
    ...arg11: Array<OperatorFunction<any, T>>
  ): R;
}

export interface Rotable<T, R> {
  onRotationStart(arg1: (arg: any) => any): R;
  onRotationEnd(arg1: (arg: any) => any): R;
  onRotation(arg1: OperatorFunction<T, T>): R;
  onRotation<A>(arg1: OperatorFunction<T, A>, arg2: OperatorFunction<A, T>): R;
  onRotation<A, B>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, T>
  ): R;
  onRotation<A, B, C>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, T>
  ): R;
  onRotation<A, B, C, D>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, T>
  ): R;
  onRotation<A, B, C, D, E>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, T>
  ): R;
  onRotation<A, B, C, D, E, F>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, T>
  ): R;
  onRotation<A, B, C, D, E, F, G>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, G>,
    arg8: OperatorFunction<G, T>
  ): R;
  onRotation<A, B, C, D, E, F, G, H>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, G>,
    arg8: OperatorFunction<G, H>,
    arg9: OperatorFunction<H, T>
  ): R;
  onRotation<A, B, C, D, E, F, G, H, I>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, G>,
    arg8: OperatorFunction<G, H>,
    arg9: OperatorFunction<H, I>,
    arg10: OperatorFunction<I, any>,
    ...arg11: Array<OperatorFunction<any, T>>
  ): R;
}

export interface Warpable<T, R> {
  onWarpStart(): R;
  onWarpEnd(): R;
  onWarp(arg1: OperatorFunction<T, T>): R;
  onWarp<A>(arg1: OperatorFunction<T, A>, arg2: OperatorFunction<A, T>): R;
  onWarp<A, B>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, T>
  ): R;
  onWarp<A, B, C>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, T>
  ): R;
  onWarp<A, B, C, D>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, T>
  ): R;
  onWarp<A, B, C, D, E>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, T>
  ): R;
  onWarp<A, B, C, D, E, F>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, T>
  ): R;
  onWarp<A, B, C, D, E, F, G>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, G>,
    arg8: OperatorFunction<G, T>
  ): R;
  onWarp<A, B, C, D, E, F, G, H>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, G>,
    arg8: OperatorFunction<G, H>,
    arg9: OperatorFunction<H, T>
  ): R;
  onWarp<A, B, C, D, E, F, G, H, I>(
    arg1: OperatorFunction<T, A>,
    arg2: OperatorFunction<A, B>,
    arg3: OperatorFunction<B, C>,
    arg4: OperatorFunction<C, D>,
    arg5: OperatorFunction<D, E>,
    arg6: OperatorFunction<E, F>,
    arg7: OperatorFunction<F, G>,
    arg8: OperatorFunction<G, H>,
    arg9: OperatorFunction<H, I>,
    arg10: OperatorFunction<I, any>,
    ...arg11: Array<OperatorFunction<any, T>>
  ): R;
}
