import { Observable, Subscription } from 'rxjs';

export class RxSubscriber {
  private subscriptions: { [name: string]: Subscription | undefined } = {};

  public subscribeTo(
    name: string,
    observable: Observable<any>,
    ...observables: Array<Observable<any>>
  ) {
    const target = this.subscriptions[name];
    this.unsubscribe(target);
    this.subscriptions[name] = this.subscribe(observable, ...observables);
  }

  private subscribe(
    observable: Observable<any>,
    ...observables: Array<Observable<any>>
  ) {
    return observables.reduce(
      (subscription, observer) => subscription.add(observer.subscribe()),
      observable.subscribe()
    );
  }

  private unsubscribe(
    subscription?: Subscription,
    ...subscriptions: Subscription[]
  ) {
    if (subscription) {
      [subscription, ...subscriptions].forEach(sub => sub.unsubscribe());
    }
  }
}
