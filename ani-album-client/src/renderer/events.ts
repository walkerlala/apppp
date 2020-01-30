import * as EventEmitter from 'eventemitter3';

export enum RendererEvents {
  PhotoItemClicked = 'PhotoItemClicked',
  PhotoItemDoubleClicked = 'PhotoItemDoubleClicked',
  SidebarTreeClicked = 'SidebarTreeClicked',
  ShowModal = 'ShowModal',
  CloseModal = 'CloseModal',
  ToggleScaleToFit = 'ToggleScaleToFit',
};

export const eventBus = new EventEmitter.EventEmitter();
