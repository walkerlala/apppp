import * as EventEmitter from 'eventemitter3';

export enum RendererEvents {
  PhotoItemClicked = 'PhotoItemClicked',
  PhotoItemDoubleClicked = 'PhotoItemDoubleClicked',
  ShowModal = 'ShowModal',
  CloseModal = 'CloseModal',
  ToggleScaleToFit = 'ToggleScaleToFit',
  NavigatePage = 'NavigatePage',
};

export const eventBus = new EventEmitter.EventEmitter();
