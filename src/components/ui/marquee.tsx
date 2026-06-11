import { cn } from "@/lib/utils"

interface MarqueeProps {
  children: React.ReactNode
  className?: string
  pauseOnHover?: boolean
  direction?: "left" | "right"
}

export function Marquee({
  children,
  className,
  pauseOnHover = true,
  direction = "left",
}: MarqueeProps) {
  return (
    <div
      className={cn(
        "group flex overflow-hidden gap-12",
        "[mask-image:linear-gradient(to_right,transparent_0%,#000_10%,#000_90%,transparent_100%)]",
        className
      )}
    >
      <div
        className={cn(
          "flex min-w-full shrink-0 animate-marquee gap-12",
          direction === "right" && "animate-marquee-reverse",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
      >
        {children}
      </div>
      <div
        aria-hidden
        className={cn(
          "flex min-w-full shrink-0 animate-marquee gap-12",
          direction === "right" && "animate-marquee-reverse",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
      >
        {children}
      </div>
    </div>
  )
}
