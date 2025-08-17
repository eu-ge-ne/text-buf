export class Buffer {
  text = "";
  len = 0;
  eol_starts: number[] = [];
  eol_ends: number[] = [];

  constructor(text: string) {
    this.append(text);
  }

  append(text: string): void {
    for (const x of text.matchAll(/\r?\n/gm)) {
      this.eol_starts.push(this.len + x.index);
      this.eol_ends.push(this.len + x.index + x[0].length);
    }

    this.len += text.length;
    this.text += text;
  }

  find_eol(a: number, index: number): number {
    let b = this.eol_starts.length - 1;
    let i = 0;
    let start = 0;
    let end = 0;

    while (a <= b) {
      i = Math.trunc((a + b) / 2);
      start = this.eol_starts[i]!;
      end = this.eol_ends[i]!;

      if (index >= end) {
        a = i + 1;
      } else if (index < start) {
        b = i - 1;
      } else if (index === start) {
        a = i;
        break;
      } else {
        throw new Error("Invalid argument");
      }
    }

    return a;
  }
}
