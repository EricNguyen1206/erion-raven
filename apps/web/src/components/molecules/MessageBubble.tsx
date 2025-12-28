import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

interface MessageBubbleProps {
  content: string
  variant: "sent" | "received"
  timestamp?: string
  avatarUrl?: string
  avatarFallback?: string
  className?: string
}

export default function MessageBubble({
  content,
  variant,
  timestamp,
  avatarUrl,
  avatarFallback = "U",
  className,
}: MessageBubbleProps) {
  const isSent = variant === "sent"

  return (
    <div className={cn("flex h-16 shrink-0 w-full items-end gap-3 py-2", isSent ? "justify-end" : "justify-start", className)}>
      {!isSent && (
        <Avatar className="h-7 w-7 rounded-lg flex-shrink-0 border-none shadow-none">
          <AvatarImage src={avatarUrl || "/placeholder.svg"} className="object-cover" />
          <AvatarFallback
            className="text-xs font-light rounded-lg"
            style={{ backgroundColor: "var(--accent)", opacity: 0.15, color: "var(--foreground)" }}
          >
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "relative max-w-[65%] rounded-2xl px-4 py-2 text-sm font-light leading-relaxed transition-all duration-200 border-none shadow-none",
          isSent ? "rounded-br-md" : "rounded-bl-md",
        )}
        style={
          isSent
            ? {
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
              opacity: 0.95,
            }
            : {
              backgroundColor: "var(--secondary)",
              color: "var(--foreground)",
              opacity: 0.6,
            }
        }
      >
        <p className="leading-relaxed tracking-wide">{content}</p>
        {timestamp && <span className="mt-1 block text-[10px] opacity-50 text-right font-light tracking-wider">{timestamp}</span>}
      </div>
    </div>
  )
}

