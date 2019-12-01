import { Observable, combineLatest, fromEvent, merge } from 'rxjs';
import {
  concatMap,
  distinctUntilChanged,
  filter,
  first,
  map,
  mapTo,
  withLatestFrom,
} from 'rxjs/operators';

export type EventTarget = Window | Document | HTMLElement;

export function contextMenu(target: EventTarget) {
  return fromEvent<MouseEvent>(target, 'contextmenu');
}

export function mouseEnter(target: EventTarget) {
  return fromEvent<MouseEvent>(target, 'mouseenter');
}

export function mouseLeave(target: EventTarget) {
  return fromEvent<MouseEvent>(target, 'mouseleave');
}

export function mouseDown(target: EventTarget) {
  return fromEvent<MouseEvent>(target, 'mousedown');
}

export function mouseUp(target: EventTarget) {
  return fromEvent<MouseEvent>(target, 'mouseup');
}

export function click(target: EventTarget) {
  return fromEvent<MouseEvent>(target, 'click');
}

export function mouseMove(target: EventTarget) {
  return fromEvent<MouseEvent>(target, 'mousemove');
}

export function mouseOver(target: EventTarget) {
  return fromEvent<MouseEvent>(target, 'mouseover');
}

export function mouseOut(target: EventTarget) {
  return fromEvent<MouseEvent>(target, 'mouseout');
}

// prettier-ignore
export function mouseReleased({ targetUp, targetDown }: {targetUp: EventTarget; targetDown: EventTarget; }) {
    return mouseDown(targetDown).pipe(concatMap(_ => mouseUp(targetUp).pipe(first())));
}

// Drag Event

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
  ) as Observable<'up' | 'down'>;
}

export function drag(target: EventTarget) {
  const queue: MouseEvent[] = [];
  return combineLatest([mouseMove(document), dragStatus(target)]).pipe(
    map(([currentEvent, status]) => {
      const head = queue.pop();
      const nextValues = [
        status === 'up' ? currentEvent : head || currentEvent,
        currentEvent,
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

// Blur Event

export function onFocus(target: EventTarget) {
  return mouseDown(target);
}

export function onBlur(target: EventTarget) {
  return click(document).pipe(
    withLatestFrom(
      merge(
        mouseEnter(target).pipe(mapTo('focus')),
        mouseLeave(target).pipe(mapTo('blur'))
      )
    ),
    distinctUntilChanged(([_p, prev], [_c, current]) => prev === current),
    filter(([mouseEvent, status]) => status === 'blur'),
    map(([mouseEvent]) => mouseEvent)
  );
}
