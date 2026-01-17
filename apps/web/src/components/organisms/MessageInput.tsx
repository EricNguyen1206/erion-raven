import { Paperclip, Send, Smile } from "lucide-react";
import { useRef } from "react";
import { Button } from "../ui/button";
import { useUpload } from "@/hooks/useUpload";
import { toast } from "react-toastify";
import { useKeyboardHeight } from "@/hooks/useKeyboardHeight";

interface MessageInputProps {
  onSendMessage: (message: string, url?: string, fileName?: string) => void;
  isConnected?: boolean;
  disabled?: boolean;
}

export default function MessageInput({
  onSendMessage,
  isConnected = true,
  disabled = false,
}: MessageInputProps) {
  const messageRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading } = useUpload();
  const keyboardHeight = useKeyboardHeight();
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

  const handleInputChange = (_e: React.ChangeEvent<HTMLInputElement>) => {
    // const newMessage = e.target.value;

    // // Handle typing indicators
    // if (newMessage.length > 0 && !hasTyped && onStartTyping) {
    //   onStartTyping();
    //   setHasTyped(true);
    // } else if (newMessage.length === 0 && hasTyped && onStopTyping) {
    //   onStopTyping();
    //   setHasTyped(false);
    // }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: Validate file size/type here

    try {
      const result = await uploadFile(file, "chat-images");
      if (result) {
        // Send message with image immediately
        // For now, we send an empty text message with the image
        // Or we could prompt user to add text.
        // Assuming sending immediately:
        onSendMessage("", result.publicUrl, file.name);
        toast.success("Image sent");
      }
    } catch (error) {
      // Error handled in useUpload
    } finally {
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
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
    <div
      className="fixed inset-x-0 bottom-0 w-full h-16 px-4 py-2 bg-background border-t border-border/30 transition-transform duration-300 ease-out md:relative md:transform-none"
      style={{
        transform: keyboardHeight > 0 ? `translateY(-${keyboardHeight}px)` : 'translateY(0)',
      }}
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        disabled={disabled || !isConnected || isUploading}
      />

      {/* Connection status indicator - Nordic minimalism: subtle inline warning */}
      {!isConnected ? (
        <div className="mb-3 text-xs font-light text-accent/70 bg-accent/5 border border-accent/10 rounded-lg px-4 py-2 tracking-wide">
          Not connected
        </div>)
        : (
          <div className="w-full h-full flex items-center gap-3">
            <div className="h-full flex-1">
              <div className="h-full flex items-center gap-2 bg-background border border-border/30 rounded-xl px-4 py-3 focus-within:border-primary/30 transition-all duration-200">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-11 w-11 shrink-0 rounded-lg hover:bg-accent/5 transition-all duration-200 ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
                  onClick={handleFileSelect}
                  disabled={disabled || !isConnected || isUploading}
                >
                  <Paperclip className="w-5 h-5" />
                </Button>

                <input
                  type="text"
                  ref={messageRef}
                  placeholder={disabled ? "Disconnected" : !isConnected ? "Connecting..." : isUploading ? "Uploading..." : "Type a message"}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  disabled={disabled || !isConnected || isUploading}
                  className="h-full flex-1 bg-transparent outline-none resize-none disabled:cursor-not-allowed disabled:opacity-40 font-light text-sm tracking-wide placeholder:text-muted-foreground/40"
                />

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 shrink-0 rounded-lg hover:bg-accent/5 transition-all duration-200 cursor-not-allowed opacity-40"
                >
                  <Smile className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <Button
              onClick={handleSend}
              disabled={(!getMessageValue().trim() && !isUploading) || disabled || !isConnected}
              size="icon"
              className="h-12 w-12 shrink-0 bg-primary hover:bg-primary/90 disabled:bg-muted/30 disabled:opacity-40 rounded-xl transition-all duration-200 shadow-none"
            >
              <Send className="w-[16px] h-[16px]" />
            </Button>
          </div>)
      }


    </div>
  );
}
