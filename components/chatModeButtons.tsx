import { getChatModeIcon, getChatModeLabel } from "@/lib/utils";
import { ChatMode } from "@/types";

import ChatModeButton from "./ui/chatModeButton";

interface ChatModeButtonsProps {
  chatMode: ChatMode;
  handleChatModeChange: (mode: ChatMode) => void;
  isCustomChatbotSelected?: boolean;
}

export default function ChatModeButtons({
  chatMode,
  handleChatModeChange,
  isCustomChatbotSelected = false,
}: ChatModeButtonsProps) {
  // When a custom chatbot is selected, don't show any default mode as selected
  const effectiveChatMode = isCustomChatbotSelected ? null : chatMode;

  return (
    <>
      <ChatModeButton
        chatMode={effectiveChatMode}
        setChatMode={handleChatModeChange}
        buttonMode="fart"
        text={getChatModeLabel("fart")}
        icon={getChatModeIcon("fart")}
      />
      <ChatModeButton
        chatMode={effectiveChatMode}
        setChatMode={handleChatModeChange}
        buttonMode="pirate"
        text={getChatModeLabel("pirate")}
        icon={getChatModeIcon("pirate")}
      />
      <ChatModeButton
        chatMode={effectiveChatMode}
        setChatMode={handleChatModeChange}
        buttonMode="linus"
        text={getChatModeLabel("linus")}
        icon={getChatModeIcon("linus")}
      />
      <ChatModeButton
        chatMode={effectiveChatMode}
        setChatMode={handleChatModeChange}
        buttonMode="minecraft"
        text={getChatModeLabel("minecraft")}
        icon={getChatModeIcon("minecraft")}
      />
      <ChatModeButton
        chatMode={effectiveChatMode}
        setChatMode={handleChatModeChange}
        buttonMode="comfort"
        text={getChatModeLabel("comfort")}
        icon={getChatModeIcon("comfort")}
      />
      <ChatModeButton
        chatMode={effectiveChatMode}
        setChatMode={handleChatModeChange}
        buttonMode="viking"
        text={getChatModeLabel("viking")}
        icon={getChatModeIcon("viking")}
      />
      <ChatModeButton
        chatMode={effectiveChatMode}
        setChatMode={handleChatModeChange}
        buttonMode="ghost"
        text={getChatModeLabel("ghost")}
        icon={getChatModeIcon("ghost")}
      />
      <ChatModeButton
        chatMode={effectiveChatMode}
        setChatMode={handleChatModeChange}
        buttonMode="classBully"
        text={getChatModeLabel("classBully")}
        icon={getChatModeIcon("classBully")}
      />
      <ChatModeButton
        chatMode={effectiveChatMode}
        setChatMode={handleChatModeChange}
        buttonMode="bob"
        text={getChatModeLabel("bob")}
        icon={getChatModeIcon("bob")}
      />
      <ChatModeButton
        chatMode={effectiveChatMode}
        setChatMode={handleChatModeChange}
        buttonMode="boomer"
        text={getChatModeLabel("boomer")}
        icon={getChatModeIcon("boomer")}
      />
      <ChatModeButton
        chatMode={effectiveChatMode}
        setChatMode={handleChatModeChange}
        buttonMode="embarrassingParent"
        text={getChatModeLabel("embarrassingParent")}
        icon={getChatModeIcon("embarrassingParent")}
      />
      <ChatModeButton
        chatMode={effectiveChatMode}
        setChatMode={handleChatModeChange}
        buttonMode="hacker"
        text={getChatModeLabel("hacker")}
        icon={getChatModeIcon("hacker")}
      />
      <ChatModeButton
        chatMode={effectiveChatMode}
        setChatMode={handleChatModeChange}
        buttonMode="doctor"
        text={getChatModeLabel("doctor")}
        icon={getChatModeIcon("doctor")}
      />
      <ChatModeButton
        chatMode={effectiveChatMode}
        setChatMode={handleChatModeChange}
        buttonMode="daredevil"
        text={getChatModeLabel("daredevil")}
        icon={getChatModeIcon("daredevil")}
      />
    </>
  );
}
