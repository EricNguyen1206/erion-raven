const HomePage = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-8 py-12">
      <div className="max-w-lg space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-light tracking-wide text-foreground">
            Welcome back
          </h1>
          <p className="text-base font-light leading-relaxed text-muted-foreground/70 tracking-wide">
            Select a conversation from the sidebar to continue chatting, or start a new conversation.
          </p>
        </div>

        <div className="pt-8 flex flex-col gap-3">
          <div className="px-6 py-4 rounded-xl bg-accent/5 border border-accent/10">
            <p className="text-xs font-light text-foreground/60 tracking-wide">
              Tip: Use <kbd className="px-2 py-0.5 rounded bg-accent/20 text-accent font-light text-[10px]">Cmd + K</kbd> to quickly search conversations
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage