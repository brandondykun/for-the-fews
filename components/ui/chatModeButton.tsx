import { Checkbox } from "@/components/ui/checkbox";
import { ChatMode } from "@/types";

import GradientBorder from "./gradientBorder";

type Props = {
  chatMode: ChatMode;
  setChatMode: (mode: ChatMode) => void;
  buttonMode: ChatMode;
  text: string;
  icon: string;
};

export default function ChatModeButton({
  chatMode,
  setChatMode,
  buttonMode,
  text,
  icon,
}: Props) {
  return (
    <GradientBorder
      width={1}
      roundedSize="lg"
      showGradientBorder={chatMode === buttonMode}
      rotationSpeed="slow"
      rotate={true}
      defaultBorderColor="bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-500 transition-all duration-300"
    >
      <div
        onClick={() => setChatMode(buttonMode)}
        className={`flex items-center p-3 rounded-lg transition-all duration-200 hover:shadow-md cursor-pointer ${
          chatMode === buttonMode
            ? "bg-neutral-100 dark:bg-neutral-900 bg-gradient-to-br dark:from-neutral-950 dark:via-neutral-800 dark:to-neutral-950 from-neutral-300 via-neutral-100 to-neutral-300"
            : "bg-neutral-100 dark:bg-neutral-900"
        }`}
      >
        <Checkbox
          checked={chatMode === buttonMode}
          className="mr-3 border-neutral-400"
        />
        <span
          className={`text-sm font-semibold ${
            chatMode === buttonMode
              ? "text-neutral-900 dark:text-neutral-100"
              : "text-neutral-600 dark:text-neutral-400"
          }`}
        >
          {icon} {text}
        </span>
      </div>
    </GradientBorder>
  );
}
