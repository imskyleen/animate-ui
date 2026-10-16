function screenScale(element: Element | null): [number, number] {
  if (!(element instanceof HTMLElement)) return [1, 1];
  const rect = element.getBoundingClientRect();
  const ratio = (drawn: number, laid: number) =>
    laid && Math.abs(drawn - laid) >= 1 ? drawn / laid : 1;
  return [
    ratio(rect.width, element.offsetWidth),
    ratio(rect.height, element.offsetHeight),
  ];
}

function layoutHeight(element: HTMLElement) {
  const drawn = element.getBoundingClientRect().height || 0;
  return drawn / screenScale(element)[1];
}

export { layoutHeight, screenScale };
