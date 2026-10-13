"use client"

import { cn } from "cn"
import {
  PreviewLinkCard as PreviewLinkCardPrimitive,
  PreviewLinkCardImage as PreviewLinkCardImagePrimitive,
  PreviewLinkCardPopover as PreviewLinkCardPopoverPrimitive,
  PreviewLinkCardTrigger as PreviewLinkCardTriggerPrimitive,
  type PreviewLinkCardImageProps,
  type PreviewLinkCardPopoverProps,
  type PreviewLinkCardProps,
  type PreviewLinkCardTriggerProps,
} from "@animate-ui/react/primitives/react-aria/preview-link-card"

function PreviewLinkCard(props: PreviewLinkCardProps) {
  return <PreviewLinkCardPrimitive {...props} />
}

function PreviewLinkCardTrigger(props: PreviewLinkCardTriggerProps) {
  return <PreviewLinkCardTriggerPrimitive {...props} />
}

function PreviewLinkCardContent({
  className,
  placement = "top",
  offset = 4,
  ...props
}: Omit<PreviewLinkCardPopoverProps, "className"> & { className?: string }) {
  return (
    <PreviewLinkCardPopoverPrimitive
      placement={placement}
      offset={offset}
      className={cn(
        "ring-foreground/10 bg-popover z-50 origin-(--trigger-anchor-point) overflow-hidden rounded-lg shadow-md ring-1 outline-hidden",
        className
      )}
      {...props}
    />
  )
}

function PreviewLinkCardImage({
  className,
  ...props
}: PreviewLinkCardImageProps) {
  return (
    <PreviewLinkCardImagePrimitive
      className={cn("block", className)}
      {...props}
    />
  )
}

export {
  PreviewLinkCard,
  PreviewLinkCardTrigger,
  PreviewLinkCardContent,
  PreviewLinkCardImage,
}

export const controls = {
  PreviewLinkCard: {
    href: { value: "https://animate-ui.com/docs" },
  },
  PreviewLinkCardContent: {
    side: {
      value: "top",
      options: { top: "top", bottom: "bottom", left: "left", right: "right" },
    },
    sideOffset: { value: 4 },
    align: {
      value: "center",
      options: { start: "start", center: "center", end: "end" },
    },
    alignOffset: { value: 0 },
  },
}

function toPlacement(
  side: "top" | "right" | "bottom" | "left",
  align: "start" | "center" | "end"
) {
  if (align === "center") return side
  if (side === "top" || side === "bottom") return `${side} ${align}` as const
  return `${side} ${align === "start" ? "top" : "bottom"}` as const
}

export default function PreviewLinkCardDemo({
  href = "https://animate-ui.com/docs",
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
}: {
  href?: string
  side?: "top" | "right" | "bottom" | "left"
  sideOffset?: number
  align?: "start" | "center" | "end"
  alignOffset?: number
}) {
  return (
    <p className="text-muted-foreground">
      Read the{" "}
      <PreviewLinkCard href={href}>
        <PreviewLinkCardTrigger
          target="_blank"
          className="text-foreground underline"
        >
          Animate UI Docs
        </PreviewLinkCardTrigger>
        <PreviewLinkCardContent
          placement={toPlacement(side, align)}
          offset={sideOffset}
          crossOffset={alignOffset}
          target="_blank"
        >
          <PreviewLinkCardImage alt="Animate UI Docs" />
        </PreviewLinkCardContent>
      </PreviewLinkCard>{" "}
      — hover to preview, click to dive in.
    </p>
  )
}
