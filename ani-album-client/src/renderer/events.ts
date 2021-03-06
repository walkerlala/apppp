import * as EventEmitter from 'eventemitter3';

export enum RendererEvents {
  ShowModal = 'ShowModal',
  CloseModal = 'CloseModal',
  NavigatePage = 'NavigatePage',
  NavigateToPrevPage = 'NavigateToPrevPage',
  AlbumContentUpdated = 'AlbumContentUpdated',
  WorkspaceContentUpated = 'WorkspaceContentUpated',
};

export const eventBus = new EventEmitter.EventEmitter();
