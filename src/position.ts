/**
 * Represents position in text buffer.
 * Can be either `number` or `[number, number]`:
 * - `number` is an offset from the start of buffer
 * - `[number, number]` are [line, column] indexes
 */
export type Position = number | readonly [number, number];
