export const CHANGELOG_SEEN_KEY = 'animate-ui:changelog-seen';

/** Hides the changelog's "new" badge before the first paint once it was read. */
export function changelogSeenScript(version: string) {
  return `try{if(localStorage.getItem(${JSON.stringify(CHANGELOG_SEEN_KEY)})===${JSON.stringify(version)})document.documentElement.dataset.changelogSeen=""}catch(e){}`;
}
