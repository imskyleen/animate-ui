export const NEW_FOR_DAYS = 60;

const DAY = 86_400_000;

export function isRecent(date: string, now = Date.now()) {
  return (now - new Date(date).getTime()) / DAY <= NEW_FOR_DAYS;
}

export function isNewPage(frontmatter: Record<string, unknown>) {
  if (typeof frontmatter.releaseDate === 'string')
    return isRecent(frontmatter.releaseDate);
  return frontmatter.new === true;
}
