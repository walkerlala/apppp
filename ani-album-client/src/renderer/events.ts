import * as EventEmitter from 'eventemitter3';

export enum RendererEvents {
  PhotoItemClicked = 'PhotoItemClicked',
  PhotoItemDoubleClicked = 'PhotoItemDoubleClicked',
  ShowModal = 'ShowModal',
  CloseModal = 'CloseModal',
  ToggleScaleToFit = 'ToggleScaleToFit',
  NavigatePage = 'NavigatePage',
  NavigateToPrevPage = 'NavigateToPrevPage',
  AlbumInfoUpdated = 'AlbumInfoUpdated',
  AlbumContentUpdated = 'AlbumContentUpdated',
  WorkspaceContentUpated = 'WorkspaceContentUpated',
};

export const eventBus = new EventEmitter.EventEmitter();
