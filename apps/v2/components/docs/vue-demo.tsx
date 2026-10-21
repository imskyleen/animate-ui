'use client';

import { useEffect, useRef } from 'react';

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
  const handle = useRef<Promise<Handle> | null>(null);
  const latest = useRef(props);
  latest.current = props;

  useEffect(() => {
    const element = ref.current!;
    const mounted = loadBundle().then(async ({ mount }) => {
      const demo = await mount(name, element, latest.current);
      element.dataset.mounted = '';
      return demo;
    });
    handle.current = mounted;
    return () => {
      handle.current = null;
      delete element.dataset.mounted;
      void mounted.then((demo) => demo.unmount());
    };
  }, [name]);

  const key = JSON.stringify(props);
  useEffect(() => {
    void handle.current?.then((demo) => demo.update(latest.current));
  }, [key]);

  return <div ref={ref} data-slot="vue-demo" className="contents" />;
}
