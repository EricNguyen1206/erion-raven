import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, X, Loader2 } from "lucide-react"
import { toast } from "react-toastify"
import {
  useFriendsQuery,
  useFriendRequestsQuery,
  useAcceptFriendRequestMutation,
  useDeclineFriendRequestMutation,
} from "@/services/api/friends"

const statusColors = {
  online: "#22c55e",
  away: "#eab308",
  offline: "#a3a3a3",
}

export default function ContactsPage() {
  // Fetch friends and friend requests
  const { data: friends = [], isLoading: isLoadingFriends } = useFriendsQuery()
  const { data: friendRequests, isLoading: isLoadingRequests } = useFriendRequestsQuery()

  // Mutations
  const acceptMutation = useAcceptFriendRequestMutation({
    onSuccess: () => {
      toast.success("Friend request accepted!")
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to accept friend request")
    },
  })

  const declineMutation = useDeclineFriendRequestMutation({
    onSuccess: () => {
      toast.success("Friend request declined")
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to decline friend request")
    },
  })

  const handleAccept = (requestId: string) => {
    acceptMutation.mutate(requestId)
  }

  const handleDecline = (requestId: string) => {
    declineMutation.mutate(requestId)
  }

  // Get received friend requests (pending only)
  const receivedRequests = friendRequests?.received || []

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
          {friends.length} friends
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
              {receivedRequests.length} pending
            </p>
          </div>

          <ScrollArea className="max-h-[400px]">
            <div className="p-2">
              {isLoadingRequests ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--muted-foreground)" }} />
                </div>
              ) : receivedRequests.length === 0 ? (
                <div className="flex items-center justify-center p-8">
                  <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                    No pending requests
                  </p>
                </div>
              ) : (
                receivedRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                    style={{ borderColor: "var(--border)" }}
                    onMouseEnter={(e) => {
                      ; (e.currentTarget as HTMLElement).style.backgroundColor = "var(--secondary)"
                    }}
                    onMouseLeave={(e) => {
                      ; (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"
                    }}
                  >
                    <Avatar className="h-12 w-12 border-2 shadow-sm" style={{ borderColor: "var(--border)" }}>
                      <AvatarImage src={request.fromUser?.avatar || "/placeholder.svg"} alt={request.fromUser?.username || "User"} />
                      <AvatarFallback style={{ backgroundColor: "var(--secondary)", color: "var(--card-foreground)" }}>
                        {(request.fromUser?.username || "U").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate" style={{ color: "var(--card-foreground)" }}>
                        {request.fromUser?.username || request.fromUser?.email || "Unknown User"}
                      </p>
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                        {request.fromUser?.email}
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
                        onClick={() => handleAccept(request.id)}
                        disabled={acceptMutation.isPending || declineMutation.isPending}
                      >
                        {acceptMutation.isPending && acceptMutation.variables === request.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        className="h-8 w-8 rounded-full shadow-md border"
                        style={{
                          backgroundColor: "#ef4444",
                          borderColor: "var(--border)",
                          color: "#fff",
                        }}
                        onClick={() => handleDecline(request.id)}
                        disabled={acceptMutation.isPending || declineMutation.isPending}
                      >
                        {declineMutation.isPending && declineMutation.variables === request.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              )}
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
              {friends.length} total
            </p>
          </div>

          <ScrollArea className="flex-1 max-h-[600px]">
            <div className="p-2">
              {isLoadingFriends ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--muted-foreground)" }} />
                </div>
              ) : friends.length === 0 ? (
                <div className="flex items-center justify-center p-8">
                  <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                    No friends yet
                  </p>
                </div>
              ) : (
                friends.map((friendship) => {
                  const friend = friendship.friend
                  return (
                    <div
                      key={friendship.friendId}
                      className="flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer"
                      onMouseEnter={(e) => {
                        ; (e.currentTarget as HTMLElement).style.backgroundColor = "var(--secondary)"
                      }}
                      onMouseLeave={(e) => {
                        ; (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"
                      }}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12 border-2 shadow-sm" style={{ borderColor: "var(--border)" }}>
                          <AvatarImage src={friend?.avatar || "/placeholder.svg"} alt={friend?.username || "Friend"} />
                          <AvatarFallback style={{ backgroundColor: "var(--secondary)", color: "var(--card-foreground)" }}>
                            {(friend?.username || "F").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 shadow-sm"
                          style={{
                            backgroundColor: statusColors.offline, // TODO: Get real online status
                            borderColor: "var(--card)",
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" style={{ color: "var(--card-foreground)" }}>
                          {friend?.username || friend?.email || "Unknown"}
                        </p>
                        <p className="text-xs capitalize" style={{ color: "var(--muted-foreground)" }}>
                          {friend?.email}
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
                  )
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
