const EOL_RE = /\r?\n/gm;

export class Buffer {
  #text = "";

  len = 0;
  eol_starts: number[] = [];
  eol_ends: number[] = [];

  constructor(text: string) {
    this.append(text);
  }

  append(text: string): void {
    for (const x of text.matchAll(EOL_RE)) {
      this.eol_starts.push(this.len + x.index);
      this.eol_ends.push(this.len + x.index + x[0].length);
    }

    this.len += text.length;
    this.#text += text;
  }

  read(index: number, count: number): string {
    return this.#text.slice(index, index + count);
  }

  find_eol(a: number, index: number): number {
    let b = this.eol_starts.length - 1;
    let i = 0;
    let v = 0;

    while (a <= b) {
      i = Math.trunc((a + b) / 2);
      v = this.eol_starts[i]!;

      if (v < index) {
        a = i + 1;
      } else if (v > index) {
        b = i - 1;
      } else {
        a = i;
        break;
      }
    }

    return a;
  }
}
