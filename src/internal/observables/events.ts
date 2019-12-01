import { combineLatest, fromEvent, merge, Observable, zip } from 'rxjs';
import {
  concatMap,
  distinctUntilChanged,
  filter,
  first,
  map,
  mapTo,
  tap,
  withLatestFrom
  // tslint:disable-next-line: no-submodule-imports
} from 'rxjs/operators';

export type EventTarget = Window | Document | HTMLElement;

export function contextMenu(target: EventTarget) {
  return fromEvent(target, 'contextmenu') as Observable<MouseEvent>;
}

export function mouseEnter(target: EventTarget) {
  return fromEvent(target, 'mouseenter') as Observable<MouseEvent>;
}

export function mouseLeave(target: EventTarget) {
  return fromEvent(target, 'mouseleave') as Observable<MouseEvent>;
}

export function mouseDown(target: EventTarget) {
  return fromEvent(target, 'mousedown') as Observable<MouseEvent>;
}

export function mouseUp(target: EventTarget) {
  return fromEvent(target, 'mouseup') as Observable<MouseEvent>;
}

export function click(target: EventTarget) {
  return fromEvent(target, 'click') as Observable<MouseEvent>;
}

export function mouseMove(target: EventTarget) {
  return fromEvent(target, 'mousemove') as Observable<MouseEvent>;
}

export function mouseOver(target: EventTarget) {
  return fromEvent(target, 'mouseover') as Observable<MouseEvent>;
}

export function mouseOut(target: EventTarget) {
  return fromEvent(target, 'mouseout') as Observable<MouseEvent>;
}

// prettier-ignore
export function mouseReleased({ targetUp, targetDown }: {targetUp: EventTarget; targetDown: EventTarget; }) {
    return mouseDown(targetDown).pipe(concatMap(_ => mouseUp(targetUp).pipe(first()))) as Observable<MouseEvent>;
}

/**
 *  ** Drag event **
 *
 *
 * @param target EventTarget
 */
export function dragStart(target: EventTarget) {
  return mouseDown(target);
}

export function dragEnd(target: EventTarget) {
  return mouseReleased({ targetUp: document, targetDown: target });
}

export function dragStatus(target: EventTarget) {
  return merge(
    mouseDown(target).pipe(mapTo('down')),
    mouseReleased({ targetUp: document, targetDown: target }).pipe(mapTo('up'))
  );
}

export function drag(target: EventTarget) {
  const queue: MouseEvent[] = [];
  return combineLatest([mouseMove(document), dragStatus(target)]).pipe(
    map(([currentEvent, status]) => {
      const head = queue.pop();
      const nextValues = [
        status === 'up' ? currentEvent : head || currentEvent,
        currentEvent
      ];
      queue.push(currentEvent);
      return nextValues;
    }),
    filter(
      ([previousEvent, currentEvent]) =>
        previousEvent.clientX !== currentEvent.clientX ||
        previousEvent.clientY !== currentEvent.clientY
    )
  );
}

/**
 * ** Tap **
 *
 * @param target Event Target
 */
export function onTap(target: EventTarget) {
  return mouseDown(target);
}

export function onTapOut(target: EventTarget) {
  return click(document).pipe(
    withLatestFrom(
      merge(
        mouseEnter(target).pipe(mapTo('in')),
        mouseLeave(target).pipe(mapTo('out'))
      )
    ),
    distinctUntilChanged(([_p, prev], [_c, current]) => prev === current),
    filter(([mouseEvent, status]) => status === 'out'),
    map(([mouseEvent]) => mouseEvent)
  );
}
