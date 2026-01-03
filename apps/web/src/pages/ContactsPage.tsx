import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, X, Loader2 } from "lucide-react"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import {
  useFriendsQuery,
  useFriendRequestsQuery,
  useAcceptFriendRequestMutation,
  useDeclineFriendRequestMutation,
} from "@/services/api/friends"

export default function ContactsPage() {
  const navigate = useNavigate()

  // Fetch friends and friend requests
  const { data: friends = [], isLoading: isLoadingFriends } = useFriendsQuery()
  const { data: friendRequests, isLoading: isLoadingRequests } = useFriendRequestsQuery()

  // Mutations
  const acceptMutation = useAcceptFriendRequestMutation({
    onSuccess: (data) => {
      toast.success("Friend request accepted!")
      // Navigate to the newly created conversation
      if (data.conversationId) {
        navigate(`/messages/${data.conversationId}`)
      }
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
    <div className="h-full w-full flex flex-col px-8 py-6 gap-8">
      {/* Header - Nordic minimalism: light, spacious */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-light tracking-wide text-foreground">
          Contacts
        </h1>
        <Badge
          variant="secondary"
          className="border-none bg-accent/10 text-foreground/70 font-light text-xs tracking-wide px-3 py-1"
        >
          {friends.length} friends
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Friend Requests Section */}
        <div className="rounded-xl border border-border/30 overflow-hidden flex flex-col h-fit bg-card/30 backdrop-blur-sm">
          <div className="px-6 py-4 border-b border-border/20">
            <h2 className="text-base font-light tracking-wide text-foreground">
              Friend Requests
            </h2>
            <p className="text-xs font-light text-muted-foreground/60 mt-1 tracking-wide">
              {receivedRequests.length} pending
            </p>
          </div>

          <ScrollArea className="max-h-[400px]">
            <div className="p-3">
              {isLoadingRequests ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/40" />
                </div>
              ) : receivedRequests.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-sm font-light text-muted-foreground/50 tracking-wide">
                    No pending requests
                  </p>
                </div>
              ) : (
                receivedRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 hover:bg-accent/5"
                  >
                    <Avatar className="h-10 w-10 border-none shadow-none rounded-lg">
                      <AvatarImage src={request.fromUser?.avatar || "/placeholder.svg"} alt={request.fromUser?.username || "User"} />
                      <AvatarFallback className="rounded-lg bg-accent/15 text-foreground/60 text-xs font-light">
                        {(request.fromUser?.username || "U").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="font-light text-sm truncate text-foreground">
                        {request.fromUser?.username || request.fromUser?.email || "Unknown User"}
                      </p>
                      <p className="text-xs font-light text-muted-foreground/50 tracking-wide">
                        {request.fromUser?.email}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        className="h-8 w-8 rounded-lg bg-accent/90 hover:bg-accent text-accent-foreground border-none shadow-none transition-all duration-200"
                        onClick={() => handleAccept(request.id)}
                        disabled={acceptMutation.isPending || declineMutation.isPending}
                      >
                        {acceptMutation.isPending && acceptMutation.variables === request.id ? (
                          <Loader2 className="h-4 w-4 animate-spin opacity-60" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        className="h-8 w-8 rounded-lg bg-destructive/90 hover:bg-destructive text-destructive-foreground border-none shadow-none transition-all duration-200"
                        onClick={() => handleDecline(request.id)}
                        disabled={acceptMutation.isPending || declineMutation.isPending}
                      >
                        {declineMutation.isPending && declineMutation.variables === request.id ? (
                          <Loader2 className="h-4 w-4 animate-spin opacity-60" />
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
        <div className="rounded-xl border border-border/30 overflow-hidden flex flex-col bg-card/30 backdrop-blur-sm">
          <div className="px-6 py-4 border-b border-border/20">
            <h2 className="text-base font-light tracking-wide text-foreground">
              All Friends
            </h2>
            <p className="text-xs font-light text-muted-foreground/60 mt-1 tracking-wide">
              {friends.length} total
            </p>
          </div>

          <ScrollArea className="flex-1 max-h-[600px]">
            <div className="p-3">
              {isLoadingFriends ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/40" />
                </div>
              ) : friends.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-sm font-light text-muted-foreground/50 tracking-wide">
                    No friends yet
                  </p>
                </div>
              ) : (
                friends.map((friendship) => {
                  const friend = friendship.friend
                  return (
                    <div
                      key={friendship.friendId}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 hover:bg-accent/5 cursor-pointer"
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10 border-none shadow-none rounded-lg">
                          <AvatarImage src={friend?.avatar || "/placeholder.svg"} alt={friend?.username || "Friend"} />
                          <AvatarFallback className="rounded-lg bg-accent/15 text-foreground/60 text-xs font-light">
                            {(friend?.username || "F").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-light text-sm truncate text-foreground">
                          {friend?.username || friend?.email || "Unknown"}
                        </p>
                        <p className="text-xs font-light text-muted-foreground/50 tracking-wide">
                          {friend?.email}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        className="h-8 px-4 rounded-lg bg-transparent hover:bg-accent/5 text-foreground/70 hover:text-foreground border border-border/30 shadow-none font-light text-xs tracking-wide transition-all duration-200"
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
