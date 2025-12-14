const HomePage = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
      <div
        className="p-8 rounded-2xl border shadow-sm max-w-lg"
        style={{ backgroundColor: "var(--secondary)", borderColor: "var(--border)", color: "var(--card-foreground)" }}
      >
        <h1 className="text-3xl font-bold mb-4">Welcome back!</h1>
        <p className="text-lg" style={{ color: "var(--muted-foreground)" }}>
          Select a conversation from the sidebar or start a new chat.
        </p>
      </div>
    </div>
  )
}

export default HomePage