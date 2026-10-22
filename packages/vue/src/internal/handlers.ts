type Handler = (event: Event) => void;

/** Calls an event attribute: a single handler or the list Vue merged. */
function callHandler(handler: unknown, event: Event) {
  if (Array.isArray(handler))
    handler.forEach((each) => (each as Handler)(event));
  else if (typeof handler === 'function') (handler as Handler)(event);
}

export { callHandler };
