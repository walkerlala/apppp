import * as net from 'net';
import { join } from 'path';
import { isWindows } from '../utils';

export namespace easyipc {

    const BuffserSize = 8192;
    const HeaderSize = 24;

    function GetDomainSocketPath(ipcToken: string) {
      if (isWindows()) {
        return join('\\\\?\\pipe', `ani-${ipcToken}`);
      }
      return `/tmp/ani-${ipcToken}`;
    }

    export interface Message {
        messageType: number;
        content: Buffer;
    }

    interface MessageHeader {
        messageType: number;
        requestId: bigint;
        bodySize: number;
    }

    function parseMessageHeader(data: Buffer): MessageHeader {
      if (data.length !== HeaderSize) {
        throw new Error(`buffer.length should be ${HeaderSize}`);
      }
      const messageType = data.readInt32LE(0);
      const requestId = data.readBigInt64LE(8);
      const bodySize = data.readUInt32LE(16);
      return {
        messageType,
        requestId,
        bodySize,
      };
    }

    function serializeHeader(header: MessageHeader): Buffer {
      const result = Buffer.alloc(HeaderSize);
      const { messageType, requestId, bodySize } = header;
      result.writeInt32LE(messageType, 0);
      result.writeBigInt64LE(requestId, 8);
      result.writeUInt32LE(bodySize, 16);
      return result;
    }

    function writeBufferToSocket(socket: net.Socket, data: Buffer): Promise<void> {
      return new Promise((resolve, reject) => {
        socket.write(data, err => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    }

    function min<T>(a: T, b: T) {
      return a < b ? a : b;
    }

    class ReadFromSocketSession {
        public clientRemainData: Buffer | null = null;

    }

    function readBufferFromSocket(session: ReadFromSocketSession, socket: net.Socket, size: number): Promise<Buffer> {
      return new Promise((resolve, reject) => {
        let result: Buffer;
        const { clientRemainData } = session;
        if (clientRemainData) {
          if (clientRemainData.length == size) { // return
            resolve(clientRemainData);
            session.clientRemainData = null;
            return;
          } else if (clientRemainData.length > size) {
            const result = Buffer.alloc(size);
            clientRemainData.copy(result, 0, 0, size);
            session.clientRemainData = clientRemainData.slice(size, 0);
            resolve(result);
            return;
          } else { // clientRemainData.length < size
            result = Buffer.alloc(size);
            clientRemainData.copy(result, 0, 0);
            session.clientRemainData = null;
          }
        } else {
          result = Buffer.alloc(size);
        }


        let readBytes: number = 0;

        const errorHandler = (err: Error) => {
          socket.destroy();
          reject(err);
        };

        const dataHandler = (data: Buffer) => {
          const { length } = data;
          const sizeShouldCopy = min(length, size - readBytes);;
          data.copy(result, readBytes, 0, sizeShouldCopy);

          readBytes += sizeShouldCopy;

          if (readBytes >= size) {
            if (length > sizeShouldCopy) {
              session.clientRemainData = data.slice(sizeShouldCopy);
            }
            socket.removeListener('data', dataHandler);
            socket.removeListener('error', errorHandler);
            resolve(result);
          }
        };

        socket.addListener('data', dataHandler);

        socket.addListener('error', errorHandler);
      });
    }

    export class IpcServer {

      constructor(
            public readonly ipcToken: string,
            private onMessage: (message: Message) => Buffer,
      ) {

      }

        private onConnect = (conn: net.Socket) => {
          let preparedReadHeader = true;
          let remainsBuffer: Buffer = Buffer.alloc(0);
          let messageType: number;
          let requestId: bigint;
          let bodySize: number;
          let readBytes: number;
          conn.on('data', (data: Buffer) => {
            if (preparedReadHeader) {
              if (data.length !== HeaderSize) {
                conn.destroy();
                return;
              }
              messageType = data.readInt32LE(0);
              requestId = data.readBigInt64LE(4);
              bodySize = data.readUInt32LE(12);
              readBytes = 0;

              if (bodySize !== 0) {
                preparedReadHeader = false;
                remainsBuffer = Buffer.alloc(bodySize);
              }
            } else {
              data.copy(remainsBuffer, readBytes, 0, data.length);
              readBytes += data.length;
              if (readBytes >= bodySize) {
                preparedReadHeader = true;
                const message: Message = {
                  messageType,
                  content: remainsBuffer,
                };
                const returnBuffer = this.onMessage(message);
                // TODO
              }
            }
          });
        }

        run() {
          const path = GetDomainSocketPath(this.ipcToken);
          const server = net.createServer(this.onConnect).listen(path);
          server.on('error', (err) => {
            throw err;
          });

        }

    }

    export class IpcClient {

        private ipcToken: string;
        private socket: net.Socket;
        private reqIdCounter: bigint = BigInt(0);
        private session: ReadFromSocketSession = new ReadFromSocketSession();

        connect(token: string): Promise<void> {
          return new Promise((resolve, reject) => {
            this.ipcToken = token;

            const path = GetDomainSocketPath(token);
            this.socket = net.createConnection(path, () => {
              this.socket.removeListener('error', reject);
              resolve();
            });
            this.socket.addListener('error', reject);
          });
        }

        async sendMessage(messageType: number, data: Buffer): Promise<Buffer> {
          const header: MessageHeader = {
            messageType,
            requestId: this.reqIdCounter++,
            bodySize: data.length,
          };
          const headerBuffer = serializeHeader(header);

          await writeBufferToSocket(this.socket, headerBuffer);

          if (data.length !== 0) {
            await writeBufferToSocket(this.socket, data);
          }

          const recvHeaderBuffer = await readBufferFromSocket(this.session, this.socket, HeaderSize);
          const recvHeader = parseMessageHeader(recvHeaderBuffer);
          if (recvHeader.requestId !== header.requestId) {
            throw new Error(`request id: ${recvHeader.requestId} !== ${header.requestId}`);
          }
          if (recvHeader.bodySize === 0) {
            return Buffer.alloc(0);
          }

          return await readBufferFromSocket(this.session, this.socket, recvHeader.bodySize);
        }

        close() {
          this.socket.destroy();
        }

    }

}
