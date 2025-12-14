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
    <div className={cn("flex w-full items-end gap-2 mb-4", isSent ? "justify-end" : "justify-start", className)}>
      {!isSent && (
        <Avatar className="h-8 w-8 border shadow-sm" style={{ borderColor: "var(--border)" }}>
          <AvatarImage src={avatarUrl || "/placeholder.svg"} />
          <AvatarFallback
            className="text-xs"
            style={{ backgroundColor: "var(--secondary)", color: "var(--card-foreground)" }}
          >
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "relative max-w-[70%] rounded-2xl px-4 py-3 text-sm shadow-sm transition-all border",
          isSent ? "rounded-br-sm" : "rounded-bl-sm",
        )}
        style={
          isSent
            ? {
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
                borderColor: "var(--primary)",
              }
            : {
                backgroundColor: "var(--secondary)",
                color: "var(--card-foreground)",
                borderColor: "var(--border)",
              }
        }
      >
        <p className="leading-relaxed">{content}</p>
        {timestamp && <span className="mt-1 block text-[10px] opacity-70 text-right">{timestamp}</span>}
      </div>
    </div>
  )
}

