import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, X } from "lucide-react"

interface Friend {
  id: string
  name: string
  avatar: string
  status: "online" | "offline" | "away"
}

interface FriendRequest {
  id: string
  name: string
  avatar: string
  mutualFriends: number
}

const mockFriends: Friend[] = [
  {
    id: "1",
    name: "Alice Freeman",
    avatar: "/placeholder.svg?height=48&width=48",
    status: "online",
  },
  {
    id: "2",
    name: "Bob Smith",
    avatar: "/placeholder.svg?height=48&width=48",
    status: "away",
  },
  {
    id: "3",
    name: "Charlie Davis",
    avatar: "/placeholder.svg?height=48&width=48",
    status: "online",
  },
  {
    id: "4",
    name: "Diana Prince",
    avatar: "/placeholder.svg?height=48&width=48",
    status: "offline",
  },
  {
    id: "5",
    name: "Ethan Hunt",
    avatar: "/placeholder.svg?height=48&width=48",
    status: "online",
  },
  {
    id: "6",
    name: "Fiona Gallagher",
    avatar: "/placeholder.svg?height=48&width=48",
    status: "offline",
  },
  {
    id: "7",
    name: "George Wilson",
    avatar: "/placeholder.svg?height=48&width=48",
    status: "away",
  },
]

const mockRequests: FriendRequest[] = [
  {
    id: "1",
    name: "Hannah Montana",
    avatar: "/placeholder.svg?height=48&width=48",
    mutualFriends: 3,
  },
  {
    id: "2",
    name: "Ian Malcolm",
    avatar: "/placeholder.svg?height=48&width=48",
    mutualFriends: 7,
  },
  {
    id: "3",
    name: "Julia Roberts",
    avatar: "/placeholder.svg?height=48&width=48",
    mutualFriends: 2,
  },
]

const statusColors = {
  online: "#22c55e",
  away: "#eab308",
  offline: "#a3a3a3",
}

export default function ContactsPage() {
  return (
    <div className="h-full w-full flex flex-col p-6 gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: "var(--card-foreground)" }}>
          Contacts
        </h1>
        <Badge
          variant="secondary"
          className="border"
          style={{ backgroundColor: "var(--secondary)", borderColor: "var(--border)", color: "var(--card-foreground)" }}
        >
          {mockFriends.length} friends
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Friend Requests Section */}
        <div
          className="rounded-2xl border overflow-hidden flex flex-col h-fit shadow-sm"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="p-4 border-b" style={{ backgroundColor: "var(--secondary)", borderColor: "var(--border)" }}>
            <h2 className="text-lg font-semibold" style={{ color: "var(--card-foreground)" }}>
              Friend Requests
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              {mockRequests.length} pending
            </p>
          </div>

          <ScrollArea className="max-h-[400px]">
            <div className="p-2">
              {mockRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                  style={{ borderColor: "var(--border)" }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLElement).style.backgroundColor = "var(--secondary)"
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLElement).style.backgroundColor = "transparent"
                  }}
                >
                  <Avatar className="h-12 w-12 border-2 shadow-sm" style={{ borderColor: "var(--border)" }}>
                    <AvatarImage src={request.avatar || "/placeholder.svg"} alt={request.name} />
                    <AvatarFallback style={{ backgroundColor: "var(--secondary)", color: "var(--card-foreground)" }}>
                      {request.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: "var(--card-foreground)" }}>
                      {request.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {request.mutualFriends} mutual friends
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      className="h-8 w-8 rounded-full shadow-md border"
                      style={{
                        backgroundColor: "#22c55e",
                        borderColor: "var(--border)",
                        color: "#fff",
                      }}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      className="h-8 w-8 rounded-full shadow-md border"
                      style={{
                        backgroundColor: "#ef4444",
                        borderColor: "var(--border)",
                        color: "#fff",
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Friends List Section */}
        <div
          className="rounded-2xl border overflow-hidden flex flex-col shadow-sm"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="p-4 border-b" style={{ backgroundColor: "var(--secondary)", borderColor: "var(--border)" }}>
            <h2 className="text-lg font-semibold" style={{ color: "var(--card-foreground)" }}>
              All Friends
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              {mockFriends.filter((f) => f.status === "online").length} online
            </p>
          </div>

          <ScrollArea className="flex-1 max-h-[600px]">
            <div className="p-2">
              {mockFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer"
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLElement).style.backgroundColor = "var(--secondary)"
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLElement).style.backgroundColor = "transparent"
                  }}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-2 shadow-sm" style={{ borderColor: "var(--border)" }}>
                      <AvatarImage src={friend.avatar || "/placeholder.svg"} alt={friend.name} />
                      <AvatarFallback style={{ backgroundColor: "var(--secondary)", color: "var(--card-foreground)" }}>
                        {friend.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 shadow-sm"
                      style={{
                        backgroundColor: statusColors[friend.status],
                        borderColor: "var(--card)",
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: "var(--card-foreground)" }}>
                      {friend.name}
                    </p>
                    <p className="text-xs capitalize" style={{ color: "var(--muted-foreground)" }}>
                      {friend.status}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    className="border"
                    style={{
                      backgroundColor: "var(--secondary)",
                      borderColor: "var(--border)",
                      color: "var(--card-foreground)",
                    }}
                  >
                    Message
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
