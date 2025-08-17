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

  find_eol_index(index: number, a: number): number {
    const { eol_starts: starts, eol_ends: ends } = this;

    let b = starts.length - 1;
    let i = 0;

    while (a <= b) {
      i = Math.trunc((a + b) / 2);

      if (index >= ends[i]!) {
        a = i + 1;
      } else if (index < starts[i]!) {
        b = i - 1;
      } else if (index === starts[i]!) {
        a = i;
        break;
      } else {
        throw new Error("Invalid argument");
      }
    }

    return a;
  }
}
