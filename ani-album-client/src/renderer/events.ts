import * as EventEmitter from 'eventemitter3';

export enum RendererEvents {
  PhotoItemClicked = 'PhotoItemClicked',
  PhotoItemDoubleClicked = 'PhotoItemDoubleClicked',
  ShowModal = 'ShowModal',
  CloseModal = 'CloseModal',
  NavigatePage = 'NavigatePage',
  NavigateToPrevPage = 'NavigateToPrevPage',
  AlbumInfoUpdated = 'AlbumInfoUpdated',
  WorkspaceInfoUpdated = 'WorkspaceInfoUpdated',
  AlbumContentUpdated = 'AlbumContentUpdated',
  WorkspaceContentUpated = 'WorkspaceContentUpated',
};

export const eventBus = new EventEmitter.EventEmitter();
