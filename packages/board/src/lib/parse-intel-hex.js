const decoder = new TextDecoder();

export function parseIntelHex(data) {
  const bytes = [];
  const hex = typeof data === 'string' ? data : decoder.decode(data);
  let extraAddr = 0;

  for (let line of hex.split(/\s*\n\s*/)) {
    if (line.length < 1) continue;
    if (line[0] != ':') {
      throw new Error("Hex file has a line not starting with ':'");
    }

    const reclen = parseInt(line.substring(1, 3), 16);
    const addr = parseInt(line.substring(3, 7), 16) + extraAddr;
    const recType = parseInt(line.substring(7, 9), 16);

    if (line.length != reclen * 2 + 11) {
      throw new Error('Error in hex file: ' + line);
    }

    let check_sum = 0;
    for (let i = 0; i < reclen + 5; i++) {
      check_sum += parseInt(line.substring(i * 2 + 1, i * 2 + 3), 16);
    }
    check_sum &= 0xff;

    if (check_sum != 0) {
      throw new Error('Checksum error in hex file: ' + line);
    }

    switch (recType) {
      case 0: // Data record
        while (bytes.length < addr + reclen) {
          bytes.push(0);
        }
        for (let i = 0; i < reclen; i++) {
          bytes[addr + i] = parseInt(line.substring(i * 2 + 9, i * 2 + 11), 16);
        }
        break;
      case 1: // End Of File record
        break;
      case 2: // Extended Segment Address Record
        extraAddr = parseInt(line.substring(9, 13), 16) * 16;
        break;
    }
  }
  return bytes;
}
