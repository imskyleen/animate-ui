// Animation utilities from tw-animate-css and shadcn's keyframes. Matched on
// the utility itself, whatever its variants (data-open:, data-[state=closed]:,
// data-[side=bottom]:…).
const ANIMATION_UTILITY =
  /^(animate-(in|out|accordion-(up|down)|collapsible-(up|down))|(fade|zoom|spin|blur)-(in|out)(-.+)?|slide-(in-from|out-to)-.+)$/;

/** The utility of a class, without its variants: `data-open:fade-in-0` → `fade-in-0`. */
export function utilityOf(token: string) {
  let depth = 0;
  let start = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token[i];
    if (char === '[' || char === '(') depth++;
    else if (char === ']' || char === ')') depth--;
    else if (char === ':' && depth === 0) start = i + 1;
  }
  return token.slice(start).replace(/^!/, '');
}

export function isAnimationClass(token: string, extra: RegExp[] = []) {
  const utility = utilityOf(token);
  return (
    ANIMATION_UTILITY.test(utility) ||
    extra.some((pattern) => pattern.test(token) || pattern.test(utility))
  );
}

/** Removes animation classes from a class string, keeping its spacing tidy. */
export function stripClasses(value: string, extra: RegExp[] = []) {
  const removed: string[] = [];
  const kept = value.split(/(\s+)/).filter((part) => {
    if (!part.trim()) return true;
    if (!isAnimationClass(part, extra)) return true;
    removed.push(part);
    return false;
  });
  if (removed.length === 0) return { value, removed };

  const leading = value.match(/^\s*/)?.[0] ?? '';
  const trailing = value.match(/\s*$/)?.[0] ?? '';
  const tokens = kept.join('').trim().split(/\s+/).filter(Boolean);
  return { value: `${leading}${tokens.join(' ')}${trailing}`, removed };
}
