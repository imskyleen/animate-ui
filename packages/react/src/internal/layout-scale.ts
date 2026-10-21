/**
 * How much transforms scale `el` on screen. Divides by its exact layout size:
 * offsetWidth is rounded, so a box of fractional size would read as scaled.
 */
export function layoutScale(
  el: HTMLElement,
  rect = el.getBoundingClientRect(),
) {
  const style = getComputedStyle(el);
  const sum = (...names: string[]) =>
    style.boxSizing === 'border-box'
      ? 0
      : names.reduce(
          (total, name) =>
            total + (parseFloat(style.getPropertyValue(name)) || 0),
          0,
        );
  const width =
    parseFloat(style.width) +
      sum(
        'padding-left',
        'padding-right',
        'border-left-width',
        'border-right-width',
      ) || el.offsetWidth;
  const height =
    parseFloat(style.height) +
      sum(
        'padding-top',
        'padding-bottom',
        'border-top-width',
        'border-bottom-width',
      ) || el.offsetHeight;
  return {
    x: width ? rect.width / width : 1,
    y: height ? rect.height / height : 1,
  };
}
