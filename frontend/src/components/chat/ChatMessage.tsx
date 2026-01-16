import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "@shared/models/chat";

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      data-testid={`chat-message-${message.role}`}
    >
      <Avatar className={`w-8 h-8 flex-shrink-0 ${isUser ? "bg-primary" : "bg-muted"}`}>
        <AvatarFallback className={isUser ? "bg-primary text-primary-foreground" : "bg-muted"}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>

      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-card border border-border"
        }`}
      >
        <div className="text-sm whitespace-pre-wrap break-words">
          {message.content}
          {isStreaming && !isUser && (
            <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
          )}
        </div>
        <div
          className={`text-xs mt-2 ${
            isUser ? "text-primary-foreground/70" : "text-muted-foreground"
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}
