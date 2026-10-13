'use client';

import * as React from 'react';
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from '@animate-ui/react/primitives/tabs';

function Example({
  id,
  defaultValue,
  one,
}: {
  id: string;
  defaultValue?: string;
  one: React.ReactNode;
}) {
  return (
    <Tabs defaultValue={defaultValue}>
      <TabsList>
        <TabsTrigger value="one">One</TabsTrigger>
        <TabsTrigger value="two">Two</TabsTrigger>
      </TabsList>
      <TabsContents data-testid={id}>
        <TabsContent value="one">{one}</TabsContent>
        <TabsContent value="two">
          <div style={{ height: 120 }}>Panel two</div>
        </TabsContent>
      </TabsContents>
    </Tabs>
  );
}

function Late({ loaded }: { loaded: boolean }) {
  return loaded ? <div style={{ height: 40 }}>Loaded</div> : null;
}

export default function AnimateUITabsHiddenFixture() {
  const [shown, setShown] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  return (
    <div>
      <button type="button" onClick={() => setShown(true)}>
        Show
      </button>
      <button type="button" onClick={() => setLoaded(true)}>
        Load
      </button>
      <div hidden={!shown} className="flex flex-col gap-10">
        <Example
          id="tallest"
          defaultValue="two"
          one={<div style={{ height: 40 }}>Panel one</div>}
        />
        <Example
          id="shorter"
          defaultValue="one"
          one={<div style={{ height: 40 }}>Panel one</div>}
        />
      </div>
      <Example
        id="no-default"
        one={<div style={{ height: 40 }}>Panel one</div>}
      />
      <Example id="empty" defaultValue="one" one={<Late loaded={loaded} />} />
    </div>
  );
}
