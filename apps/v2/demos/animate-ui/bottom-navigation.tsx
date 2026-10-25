"use client"

import * as React from "react"
import {
  BottomNavigation,
  BottomNavigationHighlight,
  BottomNavigationHighlightItem,
  BottomNavigationAccessory,
  BottomNavigationItem,
  BottomNavigationLabel,
} from "@animate-ui/react/primitives/bottom-navigation"
import { Button } from "@animate-ui/react/primitives/buttons/button"

import { House } from "@/registry/icons/house"
import { Plus } from "@/registry/icons/plus"
import { Search } from "@/registry/icons/search"
import { User } from "@/registry/icons/user"
import { Wallet } from "@/registry/icons/wallet"

const ITEMS = [
  { value: "home", label: "Home", Icon: House },
  { value: "search", label: "Search", Icon: Search },
  { value: "wallet", label: "Wallet", Icon: Wallet },
  { value: "profile", label: "Profile", Icon: User },
]

const PAYMENTS = [
  { name: "Spotify", time: "08:12", amount: "€10.99" },
  { name: "Figma", time: "09:30", amount: "€15.00" },
  { name: "Uber", time: "12:42", amount: "€6.05" },
  { name: "Notion", time: "14:05", amount: "€8.00" },
  { name: "Airbnb", time: "17:03", amount: "€256.73" },
  { name: "Vercel", time: "18:21", amount: "€20.00" },
  { name: "Apple", time: "19:18", amount: "€2.99" },
  { name: "Dribbble", time: "20:47", amount: "€52.92" },
  { name: "Netflix", time: "21:15", amount: "€13.49" },
  { name: "Linear", time: "22:02", amount: "€8.00" },
]

export const controls = {
  BottomNavigation: {
    scrollBehavior: {
      value: "minimize",
      options: { none: "none", hide: "hide", minimize: "minimize" },
    },
    labels: { value: true },
    accessory: { value: true },
  },
}

export default function BottomNavigationDemo({
  scrollBehavior = "minimize",
  labels = true,
  accessory = true,
}: {
  scrollBehavior?: "none" | "hide" | "minimize"
  labels?: boolean | string
  accessory?: boolean | string
}) {
  const showLabels = String(labels) === "true"
  const showAccessory = String(accessory) === "true"
  const [value, setValue] = React.useState("home")
  const [presses, setPresses] = React.useState(0)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  return (
    <div className="relative h-[440px] w-[340px] overflow-hidden rounded-[2rem] border bg-background shadow-sm">
      <div ref={scrollRef} className="h-full overflow-y-auto px-5 pt-6 pb-24">
        <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Today
        </p>
        <ul className="flex flex-col gap-4">
          {PAYMENTS.map((payment) => (
            <li key={payment.name} className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                {payment.name[0]}
              </span>
              <span className="flex flex-1 flex-col">
                <span className="text-sm font-medium">{payment.name}</span>
                <span className="text-xs text-muted-foreground">
                  {payment.time}
                </span>
              </span>
              <span className="text-sm font-medium tabular-nums">
                {payment.amount}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-background to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
        <BottomNavigation
          value={value}
          onValueChange={setValue}
          scrollBehavior={scrollBehavior}
          scrollContainer={scrollRef}
          aria-label="Main"
          className="pointer-events-auto flex items-center gap-2"
        >
          <BottomNavigationHighlight className="absolute inset-0 z-0 rounded-full bg-muted">
            <ul className="flex items-center rounded-full border bg-background/80 p-1.5 shadow-lg backdrop-blur">
              {ITEMS.map(({ value: item, label, Icon }) => (
                <li key={item}>
                  <BottomNavigationHighlightItem value={item}>
                    <BottomNavigationItem value={item} asChild>
                      <button
                        type="button"
                        aria-label={label}
                        className="relative z-10 flex h-11 items-center justify-center rounded-full px-3.5 text-muted-foreground outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 hover:text-foreground data-[state=active]:text-foreground"
                      >
                        <Icon animate={value === item} initial={false} size={20} />
                        {showLabels && (
                          <BottomNavigationLabel className="pl-2 text-sm font-medium">
                            {label}
                          </BottomNavigationLabel>
                        )}
                      </button>
                    </BottomNavigationItem>
                  </BottomNavigationHighlightItem>
                </li>
              ))}
            </ul>
          </BottomNavigationHighlight>
          {showAccessory && (
            <BottomNavigationAccessory className="rounded-full border bg-background/80 p-1.5 shadow-lg backdrop-blur">
              <Button
                type="button"
                aria-label="New payment"
                onClick={() => setPresses((count) => count + 1)}
                className="flex size-11 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors duration-300 ease-out hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <Plus key={presses} animate={presses > 0} size={20} />
              </Button>
            </BottomNavigationAccessory>
          )}
        </BottomNavigation>
      </div>
    </div>
  )
}
