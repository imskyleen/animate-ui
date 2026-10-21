'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';

type Props = Record<string, unknown>;
type Handle = { update: (props: Props) => void; unmount: () => void };
type VueDemos = {
  mount: (name: string, element: Element, props?: Props) => Promise<Handle>;
};

// Built by apps/vue-demos with Vite, outside the Next bundle.
const BUNDLE = '/vue-demos/index.js';

let bundle: Promise<VueDemos> | undefined;
const loadBundle = () =>
  (bundle ??= import(
    /* webpackIgnore: true */ /* turbopackIgnore: true */ BUNDLE
  ) as Promise<VueDemos>);

/** A demo from apps/vue-demos, mounted by Vue inside this element. */
export function VueDemo({ name, ...props }: { name: string } & Props) {
  const ref = useRef<HTMLDivElement>(null);
  const handleRef = useRef<Promise<Handle> | null>(null);
  const latestRef = useRef(props);

  useLayoutEffect(() => {
    latestRef.current = props;
  });

  useEffect(() => {
    const element = ref.current!;
    const mounted = loadBundle().then(async ({ mount }) => {
      const demo = await mount(name, element, latestRef.current);
      element.dataset.mounted = '';
      return demo;
    });
    handleRef.current = mounted;
    return () => {
      handleRef.current = null;
      delete element.dataset.mounted;
      void mounted.then((demo) => demo.unmount());
    };
  }, [name]);

  const key = JSON.stringify(props);
  useEffect(() => {
    void handleRef.current?.then((demo) => demo.update(latestRef.current));
  }, [key]);

  return <div ref={ref} data-slot="vue-demo" className="contents" />;
}
