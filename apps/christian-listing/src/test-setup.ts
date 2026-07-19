import { TextDecoder, TextEncoder } from 'node:util';
import { ReadableStream, TransformStream, WritableStream } from 'node:stream/web';

Object.assign(globalThis, { ReadableStream, TextDecoder, TextEncoder, TransformStream, WritableStream });

const { fetch, Headers, Request, Response } = require('undici');
Object.assign(globalThis, { fetch, Headers, Request, Response });
