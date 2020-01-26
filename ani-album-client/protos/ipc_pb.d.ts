// package: 
// file: ipc.proto

import * as jspb from "google-protobuf";

export class GenerateThumbnailsRequest extends jspb.Message {
  getPath(): string;
  setPath(value: string): void;

  getOutDir(): string;
  setOutDir(value: string): void;

  clearTypesList(): void;
  getTypesList(): Array<ThumbnailTypeMap[keyof ThumbnailTypeMap]>;
  setTypesList(value: Array<ThumbnailTypeMap[keyof ThumbnailTypeMap]>): void;
  addTypes(value: ThumbnailTypeMap[keyof ThumbnailTypeMap], index?: number): ThumbnailTypeMap[keyof ThumbnailTypeMap];

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GenerateThumbnailsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GenerateThumbnailsRequest): GenerateThumbnailsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GenerateThumbnailsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GenerateThumbnailsRequest;
  static deserializeBinaryFromReader(message: GenerateThumbnailsRequest, reader: jspb.BinaryReader): GenerateThumbnailsRequest;
}

export namespace GenerateThumbnailsRequest {
  export type AsObject = {
    path: string,
    outDir: string,
    typesList: Array<ThumbnailTypeMap[keyof ThumbnailTypeMap]>,
  }
}

export class Thumbnail extends jspb.Message {
  getType(): ThumbnailTypeMap[keyof ThumbnailTypeMap];
  setType(value: ThumbnailTypeMap[keyof ThumbnailTypeMap]): void;

  getPath(): string;
  setPath(value: string): void;

  getWidth(): number;
  setWidth(value: number): void;

  getHeight(): number;
  setHeight(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Thumbnail.AsObject;
  static toObject(includeInstance: boolean, msg: Thumbnail): Thumbnail.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Thumbnail, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Thumbnail;
  static deserializeBinaryFromReader(message: Thumbnail, reader: jspb.BinaryReader): Thumbnail;
}

export namespace Thumbnail {
  export type AsObject = {
    type: ThumbnailTypeMap[keyof ThumbnailTypeMap],
    path: string,
    width: number,
    height: number,
  }
}

export class GenerateThumbnailsResponse extends jspb.Message {
  clearDataList(): void;
  getDataList(): Array<Thumbnail>;
  setDataList(value: Array<Thumbnail>): void;
  addData(value?: Thumbnail, index?: number): Thumbnail;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GenerateThumbnailsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GenerateThumbnailsResponse): GenerateThumbnailsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GenerateThumbnailsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GenerateThumbnailsResponse;
  static deserializeBinaryFromReader(message: GenerateThumbnailsResponse, reader: jspb.BinaryReader): GenerateThumbnailsResponse;
}

export namespace GenerateThumbnailsResponse {
  export type AsObject = {
    dataList: Array<Thumbnail.AsObject>,
  }
}

export interface MessageTypeMap {
  PING: 0;
  GENERATETHUMBNAILS: 1;
}

export const MessageType: MessageTypeMap;

export interface ThumbnailTypeMap {
  SMALL: 0;
  MEDIUM: 1;
  LARGE: 2;
}

export const ThumbnailType: ThumbnailTypeMap;

