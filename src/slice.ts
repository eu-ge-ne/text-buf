import { Buffer } from "./buffer.ts";

export interface Slice {
  readonly buf: Buffer;
  start: number;
  len: number;
  eols_start: number;
  eols_len: number;
}

export function new_slice(
  buf: Buffer,
  start: number,
  len: number,
  eols_start: number,
  eols_len: number,
): Slice {
  return {
    buf,
    start,
    len,
    eols_start,
    eols_len,
  };
}

export function slice_from_text(text: string): Slice {
  const buf = new Buffer(text);

  return new_slice(buf, 0, buf.len, 0, buf.eol_starts.length);
}
