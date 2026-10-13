'use client';

import * as React from 'react';
import {
  Button,
  ComboBox,
  Dialog,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  Select,
  SelectValue,
  SubmenuTrigger,
} from '@animate-ui/react/primitives/react-aria';

const FRUITS = ['Apple', 'Banana', 'Cherry'];

export default function ReactAriaPopoverFixture() {
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-col items-start gap-10">
      <section data-testid="standalone" className="flex items-center gap-4">
        <p data-testid="standalone-open">{open ? 'open' : 'closed'}</p>
        <Button ref={triggerRef} onPress={() => setOpen(true)}>
          Standalone trigger
        </Button>
        <Popover
          triggerRef={triggerRef}
          isOpen={open}
          onOpenChange={setOpen}
          placement="end"
          data-testid="standalone-popover"
          className={({ isExiting }) => (isExiting ? 'is-exiting' : 'is-open')}
          style={({ placement }) => ({
            outline: placement === 'right' ? '1px solid' : undefined,
          })}
        >
          <Dialog aria-label="Standalone">
            Standalone content
            <Button onPress={() => setOpen(false)}>Close standalone</Button>
          </Dialog>
        </Popover>
      </section>

      <section data-testid="select">
        <Select>
          <Label>Fruit</Label>
          <Button>
            <SelectValue />
          </Button>
          <Popover data-testid="select-popover">
            <ListBox>
              {FRUITS.map((fruit) => (
                <ListBoxItem key={fruit} id={fruit}>
                  {fruit}
                </ListBoxItem>
              ))}
            </ListBox>
          </Popover>
        </Select>
      </section>

      <section data-testid="combobox">
        <ComboBox>
          <Label>Fruit search</Label>
          <Input />
          <Popover data-testid="combobox-popover">
            <ListBox>
              {FRUITS.map((fruit) => (
                <ListBoxItem key={fruit} id={fruit}>
                  {fruit}
                </ListBoxItem>
              ))}
            </ListBox>
          </Popover>
        </ComboBox>
      </section>

      <section data-testid="menu">
        <MenuTrigger>
          <Button>Actions</Button>
          <Popover data-testid="menu-popover">
            <Menu>
              <MenuItem>Copy</MenuItem>
              <SubmenuTrigger>
                <MenuItem>Share</MenuItem>
                <Popover data-testid="submenu-popover">
                  <Menu>
                    <MenuItem>Email</MenuItem>
                    <MenuItem>Message</MenuItem>
                  </Menu>
                </Popover>
              </SubmenuTrigger>
            </Menu>
          </Popover>
        </MenuTrigger>
      </section>

      <section data-testid="render">
        <MenuTrigger>
          <Button>Rendered</Button>
          <Popover
            data-testid="render-popover"
            render={(props) => <section {...props} />}
            transition={{ duration: 0.2 }}
          >
            <Menu>
              <MenuItem>Only item</MenuItem>
            </Menu>
          </Popover>
        </MenuTrigger>
      </section>
    </div>
  );
}
