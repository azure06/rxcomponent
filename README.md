<p align="center">
  <img src="resources/rxcanvas.gif" style="border-radius: 5px;" alt="RxCanvas" width="566"/>
</p>

**Move** **Resize** **Warp** **Scale** **Rotate** any element in inside a page.

## Get Started

### npm

```sh
 npm install rxjs
 npm install @azure06/rxcomponent
```

## Usage

```ts
import { RxComponent, RxHandler } from 'rxcomponent';

const rxComponent = new RxComponent(
  document.querySelector('#rxcomponent') as HTMLElement,
  {
    width: '260px',
    height: '90px',
  }
);
const rxHandler = new RxHandler(rxComponent, {
  draggable: true,
  rotable: true,
  resizable: false,
  interactive: true,
});

rxHandler
  .onDrag(tap((_) => console.log('Dragging!🔥')))
  .onResize(tap((_) => console.log('Resizing!')))
  .onRotation(tap((_) => console.log('Rotating!')));
```

**RxComponent** is [MIT licensed](LICENSE).

## Codebase

**RxComponent** is written completely in TypeScript, and built using **rollup**.

**RxComponent** makes extensive use of functional and reactive programming.
