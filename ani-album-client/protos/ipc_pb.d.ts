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

export class ReadExifRequest extends jspb.Message {
  getPath(): string;
  setPath(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReadExifRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ReadExifRequest): ReadExifRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ReadExifRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReadExifRequest;
  static deserializeBinaryFromReader(message: ReadExifRequest, reader: jspb.BinaryReader): ReadExifRequest;
}

export namespace ReadExifRequest {
  export type AsObject = {
    path: string,
  }
}

export class ExifInfo extends jspb.Message {
  getCameraMake(): string;
  setCameraMake(value: string): void;

  getCameraModel(): string;
  setCameraModel(value: string): void;

  getSoftware(): string;
  setSoftware(value: string): void;

  getBitsPerSample(): number;
  setBitsPerSample(value: number): void;

  getImageWidth(): number;
  setImageWidth(value: number): void;

  getImageHeight(): number;
  setImageHeight(value: number): void;

  getImageDescription(): string;
  setImageDescription(value: string): void;

  getImageOrientation(): number;
  setImageOrientation(value: number): void;

  getImageCopyright(): string;
  setImageCopyright(value: string): void;

  getImageDatetime(): string;
  setImageDatetime(value: string): void;

  getOriginalDatetime(): string;
  setOriginalDatetime(value: string): void;

  getDigitizeDatetime(): string;
  setDigitizeDatetime(value: string): void;

  getSubsecondTime(): string;
  setSubsecondTime(value: string): void;

  getExposureTime(): number;
  setExposureTime(value: number): void;

  getFStop(): number;
  setFStop(value: number): void;

  getIsoSpeed(): number;
  setIsoSpeed(value: number): void;

  getSubjectDistance(): number;
  setSubjectDistance(value: number): void;

  getExposureBias(): number;
  setExposureBias(value: number): void;

  getFlashUsed(): number;
  setFlashUsed(value: number): void;

  getMeteringMode(): number;
  setMeteringMode(value: number): void;

  getLensFocalLength(): number;
  setLensFocalLength(value: number): void;

  getFocalLength35mm(): number;
  setFocalLength35mm(value: number): void;

  getGpsLatitude(): number;
  setGpsLatitude(value: number): void;

  getGpsLongitude(): number;
  setGpsLongitude(value: number): void;

  getGpsAltitude(): number;
  setGpsAltitude(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ExifInfo.AsObject;
  static toObject(includeInstance: boolean, msg: ExifInfo): ExifInfo.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ExifInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ExifInfo;
  static deserializeBinaryFromReader(message: ExifInfo, reader: jspb.BinaryReader): ExifInfo;
}

export namespace ExifInfo {
  export type AsObject = {
    cameraMake: string,
    cameraModel: string,
    software: string,
    bitsPerSample: number,
    imageWidth: number,
    imageHeight: number,
    imageDescription: string,
    imageOrientation: number,
    imageCopyright: string,
    imageDatetime: string,
    originalDatetime: string,
    digitizeDatetime: string,
    subsecondTime: string,
    exposureTime: number,
    fStop: number,
    isoSpeed: number,
    subjectDistance: number,
    exposureBias: number,
    flashUsed: number,
    meteringMode: number,
    lensFocalLength: number,
    focalLength35mm: number,
    gpsLatitude: number,
    gpsLongitude: number,
    gpsAltitude: number,
  }
}

export interface MessageTypeMap {
  PING: 0;
  GENERATETHUMBNAILS: 1;
  READEXIF: 2;
}

export const MessageType: MessageTypeMap;

export interface ThumbnailTypeMap {
  SMALL: 0;
  MEDIUM: 1;
  LARGE: 2;
}

export const ThumbnailType: ThumbnailTypeMap;

