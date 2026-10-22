<script setup lang="ts">
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
  CollapsibleContent,
  CollapsibleRoot,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
  ProgressIndicator,
  ProgressRoot,
} from '@animate-ui/vue/primitives/reka-ui'
</script>

<template>
  <div class="flex flex-col gap-4 p-8">
    <CollapsibleRoot :default-open="true">
      <CollapsibleContent as-child>
        <section data-testid="reka-collapsible">Collapsible body</section>
      </CollapsibleContent>
    </CollapsibleRoot>

    <AccordionRoot type="single" default-value="a">
      <AccordionItem value="a">
        <AccordionHeader><AccordionTrigger>Accordion</AccordionTrigger></AccordionHeader>
        <AccordionContent as-child>
          <section data-testid="reka-accordion">Accordion body</section>
        </AccordionContent>
      </AccordionItem>
    </AccordionRoot>

    <ProgressRoot :model-value="40" class="w-40">
      <ProgressIndicator as-child style="transform: translateX(-60%)">
        <section data-testid="reka-progress" style="height: 8px" />
      </ProgressIndicator>
    </ProgressRoot>

    <DropdownMenuRoot>
      <DropdownMenuTrigger>Reka menu</DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent as-child>
          <section data-testid="reka-menu">
            <DropdownMenuItem>One</DropdownMenuItem>
            <DropdownMenuItem>Two</DropdownMenuItem>
          </section>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>

    <PopoverRoot>
      <PopoverTrigger>Reka popover</PopoverTrigger>
      <PopoverPortal>
        <PopoverContent as-child>
          <section data-testid="reka-popover">Popover body</section>
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>

    <DialogRoot>
      <DialogTrigger>Reka dialog</DialogTrigger>
      <DialogPortal>
        <DialogOverlay as-child>
          <section data-testid="reka-overlay" class="fixed inset-0 bg-black/40" />
        </DialogOverlay>
        <DialogContent as-child>
          <section data-testid="reka-dialog" class="fixed top-1/2 left-1/2 bg-white p-4">
            <DialogTitle>Dialog</DialogTitle>
          </section>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </div>
</template>
