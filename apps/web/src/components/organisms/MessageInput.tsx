import { Paperclip, Send, Smile } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onStartTyping?: () => void;
  onStopTyping?: () => void;
  isConnected?: boolean;
  disabled?: boolean;
}

export default function MessageInput({
  onSendMessage,
  onStartTyping,
  onStopTyping,
  isConnected = true,
  disabled = false,
}: MessageInputProps) {
  const messageRef = useRef<HTMLInputElement>(null);
  //   const [hasTyped, setHasTyped] = useState(false);

  const handleSend = () => {
    const messageValue = messageRef.current?.value || "";
    if (messageValue.trim() && isConnected && !disabled) {
      onSendMessage(messageValue.trim());
      if (messageRef.current) {
        messageRef.current.value = "";
      }
      //   setHasTyped(false);

      // // Stop typing indicator when sending
      // if (onStopTyping) {
      //     onStopTyping()
      // }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMessage = e.target.value;

    // // Handle typing indicators
    // if (newMessage.length > 0 && !hasTyped && onStartTyping) {
    //   onStartTyping();
    //   setHasTyped(true);
    // } else if (newMessage.length === 0 && hasTyped && onStopTyping) {
    //   onStopTyping();
    //   setHasTyped(false);
    // }
  };

  //   // Auto-stop typing after 3 seconds of inactivity
  //   useEffect(() => {
  //     if (hasTyped && onStopTyping) {
  //       const timer = setTimeout(() => {
  //         onStopTyping();
  //         setHasTyped(false);
  //       }, 3000);

  //       return () => clearTimeout(timer);
  //     }
  //   }, [hasTyped, onStopTyping]);

  const getMessageValue = () => {
    return messageRef.current?.value || "";
  };

  return (
    <div className="px-8 py-5 bg-background border-t border-border/30">
      {/* Connection status indicator - Nordic minimalism: subtle inline warning */}
      {!isConnected && (
        <div className="mb-3 text-xs font-light text-accent/70 bg-accent/5 border border-accent/10 rounded-lg px-4 py-2 tracking-wide">
          Not connected
        </div>
      )}

      <div className="flex items-center gap-3 max-w-4xl mx-auto">
        <div className="flex-1">
          <div className="flex items-center gap-2 bg-background border border-border/30 rounded-xl px-4 py-3 focus-within:border-primary/30 transition-all duration-200">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-lg hover:bg-accent/5 transition-all duration-200 cursor-not-allowed opacity-40"
            >
              <Paperclip className="w-[16px] h-[16px]" />
            </Button>

            <input
              type="text"
              ref={messageRef}
              placeholder={disabled ? "Disconnected" : !isConnected ? "Connecting..." : "Type a message"}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={disabled || !isConnected}
              className="flex-1 bg-transparent outline-none resize-none disabled:cursor-not-allowed disabled:opacity-40 font-light text-sm tracking-wide placeholder:text-muted-foreground/40"
            />

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-lg hover:bg-accent/5 transition-all duration-200 cursor-not-allowed opacity-40"
            >
              <Smile className="w-[16px] h-[16px]" />
            </Button>
          </div>
        </div>

        <Button
          onClick={handleSend}
          disabled={!getMessageValue().trim() || disabled || !isConnected}
          size="icon"
          className="h-11 w-11 shrink-0 bg-primary hover:bg-primary/90 disabled:bg-muted/30 disabled:opacity-40 rounded-xl transition-all duration-200 shadow-none"
        >
          <Send className="w-[18px] h-[18px]" />
        </Button>
      </div>
    </div>
  );
}
