// package: 
// file: ipc.proto

import * as jspb from "google-protobuf";

export class GenerateThumbnailsRequest extends jspb.Message {
  getPath(): string;
  setPath(value: string): void;

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
    typesList: Array<ThumbnailTypeMap[keyof ThumbnailTypeMap]>,
  }
}

export class Thunbnail extends jspb.Message {
  getType(): ThumbnailTypeMap[keyof ThumbnailTypeMap];
  setType(value: ThumbnailTypeMap[keyof ThumbnailTypeMap]): void;

  getWidth(): number;
  setWidth(value: number): void;

  getHeight(): number;
  setHeight(value: number): void;

  getData(): Uint8Array | string;
  getData_asU8(): Uint8Array;
  getData_asB64(): string;
  setData(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Thunbnail.AsObject;
  static toObject(includeInstance: boolean, msg: Thunbnail): Thunbnail.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Thunbnail, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Thunbnail;
  static deserializeBinaryFromReader(message: Thunbnail, reader: jspb.BinaryReader): Thunbnail;
}

export namespace Thunbnail {
  export type AsObject = {
    type: ThumbnailTypeMap[keyof ThumbnailTypeMap],
    width: number,
    height: number,
    data: Uint8Array | string,
  }
}

export class GenerateThumbnailsResponse extends jspb.Message {
  clearDataList(): void;
  getDataList(): Array<Thunbnail>;
  setDataList(value: Array<Thunbnail>): void;
  addData(value?: Thunbnail, index?: number): Thunbnail;

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
    dataList: Array<Thunbnail.AsObject>,
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

