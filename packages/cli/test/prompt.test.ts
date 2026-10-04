// The arrow-key select, driven through fake terminal streams.
import { PassThrough } from 'node:stream';
import { describe, expect, test } from 'vitest';

import { PromptAbortedError, select } from '../src/lib/prompt';

const terminal = () => {
  const modes: boolean[] = [];
  const input = Object.assign(new PassThrough(), {
    isTTY: true,
    isRaw: false,
    setRawMode(mode: boolean) {
      modes.push(mode);
      this.isRaw = mode;
      return this;
    },
  });
  let written = '';
  const output = new PassThrough();
  output.on('data', (chunk) => (written += chunk));
  return { input, output, modes, written: () => written };
};

const CHOICES = ['Delete a', 'Delete a and the 2 others', 'Keep a', 'Keep all'];
const UP = '\x1b[A';
const DOWN = '\x1b[B';

describe('select', () => {
  test('↑/↓ move, Enter chooses; raw mode and the cursor are restored', async () => {
    const io = terminal();
    const answer = select('Nothing imports a.', CHOICES, io);
    io.input.write(DOWN);
    io.input.write(DOWN);
    io.input.write(UP);
    io.input.write('\r');
    expect(await answer).toBe(1);
    expect(io.modes).toEqual([true, false]);
    expect(io.input.isRaw).toBe(false);
    expect(io.written()).toContain('\x1b[?25h');
    expect(io.written()).toContain('Nothing imports a.');
  });

  test('↑ from the first choice wraps to the last', async () => {
    const io = terminal();
    const answer = select('?', CHOICES, io);
    io.input.write(UP);
    io.input.write('\r');
    expect(await answer).toBe(3);
  });

  test('a digit chooses directly', async () => {
    const io = terminal();
    const answer = select('?', CHOICES, io);
    io.input.write('9');
    io.input.write('3');
    expect(await answer).toBe(2);
  });

  test('Ctrl-C rejects, restoring the terminal', async () => {
    const io = terminal();
    const answer = select('?', CHOICES, io);
    io.input.write('\x03');
    await expect(answer).rejects.toBeInstanceOf(PromptAbortedError);
    expect(io.input.isRaw).toBe(false);
    expect(io.written()).toContain('\x1b[?25h');
  });
});
