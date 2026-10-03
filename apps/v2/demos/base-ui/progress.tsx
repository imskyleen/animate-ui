"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "@animate-ui/react/primitives/base-ui/progress"
import { cn } from "cn"

import { Button } from "@/components/ui/button"

function Progress({
  className,
  children,
  value,
  ...props
}: ProgressPrimitive.Root.Props) {
  return (
    <ProgressPrimitive.Root
      value={value}
      data-slot="progress"
      className={cn("flex flex-wrap gap-3", className)}
      {...props}
    >
      {children}
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </ProgressPrimitive.Root>
  )
}

function ProgressTrack({ className, ...props }: ProgressPrimitive.Track.Props) {
  return (
    <ProgressPrimitive.Track
      className={cn(
        "bg-muted h-1 rounded-full relative flex w-full items-center overflow-x-hidden",
        className
      )}
      data-slot="progress-track"
      {...props}
    />
  )
}

function ProgressIndicator({
  className,
  ...props
}: ProgressPrimitive.Indicator.Props) {
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn("bg-primary h-full", className)}
      {...props}
    />
  )
}

function ProgressLabel({ className, ...props }: ProgressPrimitive.Label.Props) {
  return (
    <ProgressPrimitive.Label
      className={cn("text-sm font-medium", className)}
      data-slot="progress-label"
      {...props}
    />
  )
}

function ProgressValue({ className, ...props }: ProgressPrimitive.Value.Props) {
  return (
    <ProgressPrimitive.Value
      className={cn("text-muted-foreground ml-auto text-sm tabular-nums", className)}
      data-slot="progress-value"
      {...props}
    />
  )
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
}

const STEPS = [12, 27, 41, 58, 64, 83, 100]

function useUpload() {
  const [value, setValue] = React.useState(64)
  const [running, setRunning] = React.useState(false)

  React.useEffect(() => {
    if (!running) return
    let step = 0
    const id = setInterval(() => {
      setValue(STEPS[step])
      step += 1
      if (step === STEPS.length) {
        clearInterval(id)
        setRunning(false)
      }
    }, 450)
    return () => clearInterval(id)
  }, [running])

  const start = () => {
    setValue(0)
    setRunning(true)
  }

  return { value, running, start }
}

export default function ProgressDemo() {
  const { value, running, start } = useUpload()

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Progress value={value}>
        <ProgressLabel>brand-assets.zip</ProgressLabel>
        <ProgressValue />
      </Progress>
      <Button
        variant="outline"
        size="sm"
        className="self-start"
        disabled={running}
        onClick={start}
      >
        {running ? "Uploading…" : "Upload again"}
      </Button>
    </div>
  )
}
