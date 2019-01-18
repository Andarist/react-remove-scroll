import * as React from 'react';
import {TouchEvent} from "react";
import {RemoveScrollBar} from 'react-remove-scroll-bar';
import {handleScroll} from "./handleScroll";

export const getTouchY = (event: TouchEvent) => event.changedTouches ? event.changedTouches[0].clientY : 0;

export interface RemoveScrollProps {
  noIsolation?: boolean;
}

export class RemoveScroll extends React.Component<RemoveScrollProps> {
  private shouldPreventQueue: Array<{ name: string, delta: number, target: any }> = [];
  private touchStart = 0;
  private ref = React.createRef<HTMLDivElement>();

  componentDidMount() {
    if (typeof document !== 'undefined') {
      document.addEventListener('wheel', this.shouldPrevent, {passive: false});
      document.addEventListener('touchmove', this.shouldPrevent, {passive: false});
    }
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      document.removeEventListener('wheel', this.shouldPrevent, {passive: false} as any);
      document.removeEventListener('touchmove', this.shouldPrevent, {passive: false} as any);
    }
  }

  shouldPrevent = (event: any) => {
    const delta = event.deltaY || getTouchY(event);
    const sourceEvent = this.shouldPreventQueue.find(
      (e: any) => e.name === event.type && e.delta === delta && e.target === event.target
    );
    if (!sourceEvent) {
      event.preventDefault();
    }
  };

  shouldCancel = (name: string, delta: number, target: any, should: boolean) => {
    if (!should) {
      const event = {name, delta, target};
      this.shouldPreventQueue.push(event);
      setTimeout(() => {
        this.shouldPreventQueue = this.shouldPreventQueue.filter(e => e !== event);
      }, 1);
    }
  };

  scrollTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    this.touchStart = getTouchY(event);
  };

  scrollWheel = (event: any) => {
    this.shouldCancel(event.type, event.deltaY, event.target, handleScroll(this.ref.current as any, event, event.deltaY));
  };

  scrollTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    this.shouldCancel(event.type, getTouchY(event), event.target, handleScroll(this.ref.current as any, event, this.touchStart - getTouchY(event)));
  };

  render() {
    return (
      <React.Fragment>
        <RemoveScrollBar/>
        <div
          ref={this.ref}
          onScrollCapture={this.scrollWheel}
          onWheelCapture={this.scrollWheel}
          onTouchStartCapture={this.scrollTouchStart}
          onTouchMoveCapture={this.scrollTouchMove}
        >
          {this.props.children}
        </div>
      </React.Fragment>
    )
  }
}