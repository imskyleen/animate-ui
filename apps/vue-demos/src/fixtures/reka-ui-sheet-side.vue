<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const sides = ['top', 'right', 'bottom', 'left'] as const
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <Sheet v-for="side in sides" :key="side">
      <SheetTrigger as-child>
        <Button variant="outline" class="capitalize">
          {{ side }}
        </Button>
      </SheetTrigger>
      <SheetContent :side="side">
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <Button type="submit">
            Save changes
          </Button>
          <SheetClose as-child>
            <Button variant="outline">
              Cancel
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  </div>
</template>
