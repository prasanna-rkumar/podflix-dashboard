"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn, secondsToHHMMSS } from "@/lib/utils"

const MultiRangeSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        className="relative h-10 w-full grow overflow-hidden rounded bg-slate-900/30 dark:bg-slate-50/20"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log("Range clicked")
        }}
      >
        <SliderPrimitive.Range
          className="absolute h-full bg-slate-50 border-2 border-slate-700 dark:bg-slate-50 rounded-md"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("Range clicked")
          }}
        />
      </SliderPrimitive.Track>

      <SliderPrimitive.Thumb className="group relative left-[1px] rounded-l-md block h-10 w-1 bg-slate-700 shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 dark:border-slate-800 dark:border-slate-50/50 dark:bg-slate-950 dark:focus-visible:ring-slate-300" >
        <span className="invisible group-active:visible absolute -top-4 left-1/2 -translate-x-1/2">{props.value ? secondsToHHMMSS(props.value[0]) : ""}</span>
      </SliderPrimitive.Thumb>

      <SliderPrimitive.Thumb className="group relative -left-[5px] rounded-r-md block h-10 w-1 bg-slate-700 shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 dark:border-slate-800 dark:border-slate-50/50 dark:bg-slate-950 dark:focus-visible:ring-slate-300">
        <span className="invisible group-active:visible absolute -top-4 left-1/2 -translate-x-1/2">{props.value ? secondsToHHMMSS(props.value[1]) : ""}</span>
      </SliderPrimitive.Thumb>

    </SliderPrimitive.Root>
  );
});
MultiRangeSlider.displayName = "MultiRangeSlider"

export { MultiRangeSlider }
