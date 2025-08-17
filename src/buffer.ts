export class Buffer {
  text = "";
  len = 0;
  eols_buf = new ArrayBuffer(1024 * 64, { maxByteLength: 100e6 * 2 });
  eols = new Int32Array(this.eols_buf);
  eols_len = 0;

  constructor(text: string) {
    this.#append_eols(text);

    this.text = text;
    this.len = text.length;
  }

  append(text: string): void {
    this.#append_eols(text);

    this.text += text;
    this.len += text.length;
  }

  find_eol_index(index: number, a: number): number {
    let b = this.eols_len - 1;
    let i = 0;

    while (a <= b) {
      i = Math.trunc((a + b) / 2);

      if (index >= this.eols[i * 2 + 1]!) {
        a = i + 1;
      } else if (index < this.eols[i * 2]!) {
        b = i - 1;
      } else if (index === this.eols[i * 2]!) {
        a = i;
        break;
      } else {
        throw new Error("Invalid argument");
      }
    }

    return a;
  }

  #append_eols(text: string): void {
    for (const x of text.matchAll(/\r?\n/gm)) {
      const new_len = (this.eols_len + 1) * 2 * 4;
      if (new_len > this.eols_buf.byteLength) {
        this.eols_buf.resize(new_len * 2);
      }

      this.eols[this.eols_len * 2] = this.len + x.index;
      this.eols[this.eols_len * 2 + 1] = this.len + x.index + x[0].length;

      this.eols_len += 1;
    }

    this.eols_buf.resize(this.eols_len * 2 * 4);
  }
}
