import { getChatModeIcon, getChatModeLabel } from "@/lib/utils";
import { ChatMode } from "@/types";

import ChatModeButton from "./ui/chatModeButton";

interface ChatModeButtonsProps {
  chatMode: ChatMode;
  handleChatModeChange: (mode: ChatMode) => void;
}

export default function ChatModeButtons({
  chatMode,
  handleChatModeChange,
}: ChatModeButtonsProps) {
  return (
    <>
      <ChatModeButton
        chatMode={chatMode}
        setChatMode={handleChatModeChange}
        buttonMode="fart"
        text={getChatModeLabel("fart")}
        icon={getChatModeIcon("fart")}
      />
      <ChatModeButton
        chatMode={chatMode}
        setChatMode={handleChatModeChange}
        buttonMode="pirate"
        text={getChatModeLabel("pirate")}
        icon={getChatModeIcon("pirate")}
      />
      <ChatModeButton
        chatMode={chatMode}
        setChatMode={handleChatModeChange}
        buttonMode="linus"
        text={getChatModeLabel("linus")}
        icon={getChatModeIcon("linus")}
      />
      <ChatModeButton
        chatMode={chatMode}
        setChatMode={handleChatModeChange}
        buttonMode="minecraft"
        text={getChatModeLabel("minecraft")}
        icon={getChatModeIcon("minecraft")}
      />
      <ChatModeButton
        chatMode={chatMode}
        setChatMode={handleChatModeChange}
        buttonMode="comfort"
        text={getChatModeLabel("comfort")}
        icon={getChatModeIcon("comfort")}
      />
      <ChatModeButton
        chatMode={chatMode}
        setChatMode={handleChatModeChange}
        buttonMode="viking"
        text={getChatModeLabel("viking")}
        icon={getChatModeIcon("viking")}
      />
      <ChatModeButton
        chatMode={chatMode}
        setChatMode={handleChatModeChange}
        buttonMode="ghost"
        text={getChatModeLabel("ghost")}
        icon={getChatModeIcon("ghost")}
      />
      <ChatModeButton
        chatMode={chatMode}
        setChatMode={handleChatModeChange}
        buttonMode="classBully"
        text={getChatModeLabel("classBully")}
        icon={getChatModeIcon("classBully")}
      />
      <ChatModeButton
        chatMode={chatMode}
        setChatMode={handleChatModeChange}
        buttonMode="bob"
        text={getChatModeLabel("bob")}
        icon={getChatModeIcon("bob")}
      />
      <ChatModeButton
        chatMode={chatMode}
        setChatMode={handleChatModeChange}
        buttonMode="boomer"
        text={getChatModeLabel("boomer")}
        icon={getChatModeIcon("boomer")}
      />
      <ChatModeButton
        chatMode={chatMode}
        setChatMode={handleChatModeChange}
        buttonMode="embarrassingParent"
        text={getChatModeLabel("embarrassingParent")}
        icon={getChatModeIcon("embarrassingParent")}
      />
      <ChatModeButton
        chatMode={chatMode}
        setChatMode={handleChatModeChange}
        buttonMode="hacker"
        text={getChatModeLabel("hacker")}
        icon={getChatModeIcon("hacker")}
      />
      <ChatModeButton
        chatMode={chatMode}
        setChatMode={handleChatModeChange}
        buttonMode="doctor"
        text={getChatModeLabel("doctor")}
        icon={getChatModeIcon("doctor")}
      />
    </>
  );
}
