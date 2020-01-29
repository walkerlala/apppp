import * as EventEmitter from 'eventemitter3';

export enum RendererEvents {
  PhotoItemClicked = 'PhotoItemClicked',
  PhotoItemDoubleClicked = 'PhotoItemDoubleClicked',
};

export const eventBus = new EventEmitter.EventEmitter();
