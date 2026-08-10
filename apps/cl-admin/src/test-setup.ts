import { TextDecoder, TextEncoder } from 'node:util';
import { ReadableStream, TransformStream, WritableStream } from 'node:stream/web';

Object.assign(globalThis, { ReadableStream, TextDecoder, TextEncoder, TransformStream, WritableStream });
