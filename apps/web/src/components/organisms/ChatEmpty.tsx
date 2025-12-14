export function ChatEmpty() {
  return (

    <div
      className="flex-1 flex flex-col h-full relative z-10 border-l"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      <main className="flex-1 overflow-auto p-6"><div className="h-full flex flex-col items-center justify-center text-center space-y-6">
        <div
          className="p-8 rounded-2xl border shadow-sm max-w-lg"
          style={{ backgroundColor: "var(--secondary)", borderColor: "var(--border)", color: "var(--card-foreground)" }}
        >
          <h1 className="text-3xl font-bold mb-4">Welcome back!</h1>
          <p className="text-lg" style={{ color: "var(--muted-foreground)" }}>
            Select a conversation from the sidebar or start a new chat.
          </p>
        </div>
      </div></main>
    </div>

  )
}