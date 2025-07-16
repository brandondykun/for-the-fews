import React from "react";

import UserIcon from "@/components/ui/userIcon";
import UserStatusIcon from "@/components/ui/userStatusIcon";
import { useRoomUsers } from "@/hooks/useRoomUsers";

interface ChatUsersSidebarProps {
  currentRoomId: string | null;
  currentRoomName: string | null;
}

function ChatUsersSidebar({
  currentRoomId,
  currentRoomName,
}: ChatUsersSidebarProps) {
  const { users, loading: usersLoading } = useRoomUsers(currentRoomId || "");

  return (
    <aside className="bg-neutral-200 dark:bg-neutral-900 px-2 py-2 min-w-[250px] max-w-[250px]">
      {currentRoomName && (
        <h2 className="text-md font-semibold text-neutral-700 dark:text-neutral-200 mb-4 break-words">
          {currentRoomName} Chat
        </h2>
      )}
      {usersLoading ? (
        <>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              className="h-15 bg-neutral-300/60 dark:bg-neutral-700/30 mb-2 rounded-lg animate-pulse"
              key={index}
            ></div>
          ))}
        </>
      ) : (
        users.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-2 justify-between py-3 px-3 bg-neutral-300/60 dark:bg-neutral-700/30 mb-2 rounded-lg"
          >
            <UserIcon user={user} className="bg-neutral-100/50" />
            <div className="flex flex-1 truncate">{user.displayName}</div>
            <UserStatusIcon status={user.status} />
          </div>
        ))
      )}
    </aside>
  );
}

// Memo to prevent unnecessary rerenders when props haven't changed
export default React.memo(ChatUsersSidebar);
