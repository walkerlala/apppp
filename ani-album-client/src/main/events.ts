import * as EventEmitter from 'eventemitter3';

export enum MainProcessEvents {
  ImportPhotos = 'ImportPhotos',
};

export const eventBus = new EventEmitter.EventEmitter();
