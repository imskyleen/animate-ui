<script setup lang="ts">
import { useMediaQuery } from "@vueuse/core"
import { computed, ref } from "vue"
import { toast } from "vue-sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Toaster } from "@/components/ui/sonner"
import "vue-sonner/style.css"

const props = withDefaults(
  defineProps<{ direction?: "bottom" | "top" | "left" | "right" }>(),
  { direction: "right" },
)

const deliveryTimes = [
  {
    value: "asap",
    id: "delivery-asap",
    label: "Standard delivery",
    description: "25–35 min · Driver assigned now",
    badge: "Fastest",
  },
  {
    value: "5-00",
    id: "delivery-5-00",
    label: "5:00 PM – 5:15 PM",
    description: "Prep starts at 4:45 PM",
  },
  {
    value: "5-30",
    id: "delivery-5-30",
    label: "5:30 PM – 5:45 PM",
    description: "Good if you're heading home",
  },
  {
    value: "6-00",
    id: "delivery-6-00",
    label: "6:00 PM – 6:15 PM",
    description: "Most popular · High demand",
  },
  {
    value: "6-30",
    id: "delivery-6-30",
    label: "6:30 PM – 6:45 PM",
    description: "Last slot before kitchen closes",
  },
]

const SWIPE_DIRECTION = {
  bottom: "down",
  top: "up",
  left: "left",
  right: "right",
} as const

const open = ref(false)
const deliveryTime = ref("asap")
const isMobile = useMediaQuery("(max-width: 767px)")
const swipeDirection = computed(() => isMobile.value ? "down" : SWIPE_DIRECTION[props.direction])

function handleConfirm() {
  const selected = deliveryTimes.find(time => time.value === deliveryTime.value)

  if (!selected) {
    return
  }

  open.value = false
  toast("Delivery time confirmed", {
    description: selected.label,
  })
}
</script>

<template>
  <Drawer v-model:open="open" :swipe-direction="swipeDirection">
    <DrawerTrigger as-child>
      <Button variant="secondary">
        Open Drawer
      </Button>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Pick a delivery time</DrawerTitle>
        <DrawerDescription>
          We'll prepare your order as soon as possible.
        </DrawerDescription>
      </DrawerHeader>
      <div class="flex-1 scroll-fade overflow-y-auto p-4">
        <RadioGroup v-model="deliveryTime" class="gap-2">
          <FieldLabel v-for="time in deliveryTimes" :key="time.value" :for="time.id">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle class="flex items-center gap-2">
                  {{ time.label }}
                  <Badge v-if="time.badge" variant="secondary">
                    {{ time.badge }}
                  </Badge>
                </FieldTitle>
                <FieldDescription>{{ time.description }}</FieldDescription>
              </FieldContent>
              <RadioGroupItem :id="time.id" :value="time.value" />
            </Field>
          </FieldLabel>
        </RadioGroup>
      </div>
      <DrawerFooter>
        <Button class="h-[34px]" @click="handleConfirm">
          Confirm Delivery Time
        </Button>
        <DrawerClose as-child>
          <Button variant="outline">
            Cancel
          </Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
  <Toaster />
</template>
