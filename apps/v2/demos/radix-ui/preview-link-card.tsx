"use client"

import { cn } from "cn"
import {
  PreviewLinkCard as PreviewLinkCardPrimitive,
  PreviewLinkCardContent as PreviewLinkCardContentPrimitive,
  PreviewLinkCardImage as PreviewLinkCardImagePrimitive,
  PreviewLinkCardPortal as PreviewLinkCardPortalPrimitive,
  PreviewLinkCardTrigger as PreviewLinkCardTriggerPrimitive,
  type PreviewLinkCardContentProps,
  type PreviewLinkCardImageProps,
  type PreviewLinkCardProps,
  type PreviewLinkCardTriggerProps,
} from "@animate-ui/react/primitives/radix-ui/preview-link-card"

function PreviewLinkCard(props: PreviewLinkCardProps) {
  return <PreviewLinkCardPrimitive {...props} />
}

function PreviewLinkCardTrigger(props: PreviewLinkCardTriggerProps) {
  return <PreviewLinkCardTriggerPrimitive {...props} />
}

function PreviewLinkCardContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: PreviewLinkCardContentProps) {
  return (
    <PreviewLinkCardPortalPrimitive>
      <PreviewLinkCardContentPrimitive
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "ring-foreground/10 bg-popover z-50 origin-(--radix-hover-card-content-transform-origin) overflow-hidden rounded-lg shadow-md ring-1 outline-hidden",
          className
        )}
        {...props}
      />
    </PreviewLinkCardPortalPrimitive>
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
    followCursor: {
      value: false,
      options: { false: false, true: true, x: "x", y: "y" },
    },
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

export default function PreviewLinkCardDemo({
  followCursor = false,
  href = "https://animate-ui.com/docs",
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
}: {
  followCursor?: boolean | "x" | "y"
  href?: string
  side?: "top" | "right" | "bottom" | "left"
  sideOffset?: number
  align?: "start" | "center" | "end"
  alignOffset?: number
}) {
  return (
    <p className="text-muted-foreground">
      Read the{" "}
      <PreviewLinkCard href={href} followCursor={followCursor}>
        <PreviewLinkCardTrigger
          target="_blank"
          className="text-foreground underline"
        >
          Animate UI Docs
        </PreviewLinkCardTrigger>
        <PreviewLinkCardContent
          side={side}
          sideOffset={sideOffset}
          align={align}
          alignOffset={alignOffset}
          target="_blank"
        >
          <PreviewLinkCardImage alt="Animate UI Docs" />
        </PreviewLinkCardContent>
      </PreviewLinkCard>{" "}
      — hover to preview, click to dive in.
    </p>
  )
}
