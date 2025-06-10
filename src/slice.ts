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

export function slice_growable(x: Slice): boolean {
  return (x.buf.len < 100) && (x.start + x.len === x.buf.len);
}

export function grow_slice(x: Slice, text: string): void {
  x.buf.append(text);

  resize_slice(x, x.len + [...text].length);
}

export function trim_slice_end(x: Slice, n: number): void {
  resize_slice(x, x.len - n);
}

export function trim_slice_start(x: Slice, n: number): void {
  x.start += n;
  x.len -= n;
  x.eols_start = x.buf.find_eol(x.eols_start, x.start);
  const eols_end = x.buf.find_eol(x.eols_start, x.start + x.len);
  x.eols_len = eols_end - x.eols_start;
}

export function resize_slice(x: Slice, len: number): void {
  x.len = len;
  const eols_end = x.buf.find_eol(x.eols_start, x.start + x.len);
  x.eols_len = eols_end - x.eols_start;
}

export function split_slice(x: Slice, index: number, gap: number): Slice {
  const start = x.start + index + gap;
  const len = x.len - index - gap;

  resize_slice(x, index);

  const eols_start = x.buf.find_eol(x.eols_start + x.eols_len, start);
  const eols_end = x.buf.find_eol(eols_start, start + len);
  const eols_len = eols_end - eols_start;

  return new_slice(x.buf, start, len, eols_start, eols_len);
}
