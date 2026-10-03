"use client"

import * as React from "react"
import { cn } from "cn"
import { Progress as ProgressPrimitive } from "@animate-ui/react/primitives/radix-ui/progress"

import { Button } from "@/components/ui/button"

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-muted h-1 rounded-full relative flex w-full items-center overflow-x-hidden",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary size-full flex-1"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }

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
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">brand-assets.zip</span>
        <span className="text-muted-foreground tabular-nums">{value}%</span>
      </div>
      <Progress value={value} aria-label="Upload progress" />
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
