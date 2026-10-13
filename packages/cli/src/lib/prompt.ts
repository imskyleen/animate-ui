import { emitKeypressEvents } from 'node:readline';
import { stripVTControlCharacters, styleText } from 'node:util';

export type Ask = (question: string, choices: string[]) => Promise<number>;

export class PromptAbortedError extends Error {
  constructor() {
    super('Aborted.');
    this.name = 'PromptAbortedError';
  }
}

type Input = NodeJS.ReadableStream & {
  isTTY?: boolean;
  isRaw?: boolean;
  setRawMode?: (mode: boolean) => unknown;
};
type Output = NodeJS.WritableStream & { columns?: number };

const HIDE_CURSOR = '\x1b[?25l';
const SHOW_CURSOR = '\x1b[?25h';

export function select(
  question: string,
  choices: string[],
  {
    input = process.stdin as Input,
    output = process.stdout as Output,
  }: { input?: Input; output?: Output } = {},
): Promise<number> {
  return new Promise((resolve, reject) => {
    let index = 0;
    let rows = 0;

    const rowsOf = (lines: string[]) => {
      const columns = output.columns || Infinity;
      return lines.reduce(
        (sum, line) =>
          sum +
          Math.max(
            1,
            Math.ceil(stripVTControlCharacters(line).length / columns),
          ),
        0,
      );
    };
    const draw = (lines: string[]) => {
      if (rows > 0) output.write(`\x1b[${rows}A\r\x1b[0J`);
      output.write(`${lines.join('\n')}\n`);
      rows = rowsOf(lines);
    };
    const render = () =>
      draw([
        `${styleText('cyan', '?')} ${styleText('bold', question)} ${styleText('dim', '(↑/↓ and Enter)')}`,
        ...choices.map((choice, i) =>
          i === index
            ? styleText('cyan', `❯ ${i + 1}. ${choice}`)
            : `  ${i + 1}. ${choice}`,
        ),
      ]);

    const wasRaw = input.isRaw ?? false;
    const restore = () => {
      input.setRawMode?.(wasRaw);
      output.write(SHOW_CURSOR);
    };
    const cleanup = () => {
      input.off('keypress', onKeypress);
      process.off('exit', restore);
      restore();
      input.pause();
    };
    const choose = (i: number) => {
      cleanup();
      draw([
        `${styleText('green', '✔')} ${styleText('bold', question)} ${styleText('cyan', choices[i]!)}`,
      ]);
      resolve(i);
    };
    const onKeypress = (
      text: string | undefined,
      key: { name?: string; ctrl?: boolean } | undefined,
    ) => {
      if (key?.ctrl && key.name === 'c') {
        cleanup();
        output.write('\n');
        reject(new PromptAbortedError());
        return;
      }
      if (key?.name === 'return' || key?.name === 'enter') return choose(index);
      if (text && /^[1-9]$/.test(text) && Number(text) <= choices.length)
        return choose(Number(text) - 1);
      if (key?.name === 'up' || key?.name === 'k')
        index = (index - 1 + choices.length) % choices.length;
      else if (key?.name === 'down' || key?.name === 'j')
        index = (index + 1) % choices.length;
      else return;
      render();
    };

    emitKeypressEvents(input);
    input.setRawMode?.(true);
    process.on('exit', restore);
    input.on('keypress', onKeypress);
    input.resume();
    output.write(HIDE_CURSOR);
    render();
  });
}
