const ANIMATION_UTILITY =
  /^(animate-(in|out|accordion-(up|down)|collapsible-(up|down))|(fade|zoom|spin|blur)-(in|out)(-.+)?|slide-(in-from|out-to)-.+)$/;

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

const INTERACTION_VARIANT =
  /(^|:)(group-|peer-)?(hover|focus|focus-visible|focus-within|active|disabled|visited)(\/[\w-]+)?:/;

export function isAnimationClass(token: string, extra: RegExp[] = []) {
  const utility = utilityOf(token);
  const onInteraction = INTERACTION_VARIANT.test(token);
  return (
    ANIMATION_UTILITY.test(utility) ||
    extra.some(
      (pattern) =>
        pattern.test(token) || (!onInteraction && pattern.test(utility)),
    )
  );
}

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

const CENTERING = [
  /^(top-1\/2|top-\[50%\])$/,
  /^(left-1\/2|left-\[50%\])$/,
  /^(-translate-x-1\/2|translate-x-\[-50%\])$/,
  /^(-translate-y-1\/2|translate-y-\[-50%\])$/,
];

export function centerWithMargins(value: string) {
  const tokens = value.trim().split(/\s+/).filter(Boolean);
  const found = CENTERING.map((pattern) =>
    tokens.find((token) => pattern.test(token)),
  );
  if (found.some((token) => !token)) return { value, replaced: [] };
  const replaced = found as string[];
  const kept = tokens.filter((token) => !replaced.includes(token));
  const added = ['inset-0', 'm-auto', 'h-fit'].filter(
    (token) => !kept.includes(token),
  );
  const leading = value.match(/^\s*/)?.[0] ?? '';
  const trailing = value.match(/\s*$/)?.[0] ?? '';
  return {
    value: `${leading}${[...kept, ...added].join(' ')}${trailing}`,
    replaced,
  };
}
