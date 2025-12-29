"use client";

import React, { useEffect, useState } from "react";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  Loader2,
  MoreVertical,
  Pencil,
  PlusIcon,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import ChatModeButtons from "@/components/chatModeButtons";
import LlmChatInput from "@/components/llmChatInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import GradientBorder from "@/components/ui/gradientBorder";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { DAILY_MESSAGE_LIMIT, MAX_MESSAGE_CHARACTERS } from "@/constants";
import { useAuth } from "@/context/auth-context";
import { useChat } from "@/hooks/useChat";
import { db } from "@/lib/firebase";
import { getChatModeLabel } from "@/lib/utils";
import { Chatbot, ChatMode } from "@/types";

export default function ChatPage() {
  const { user } = useAuth();

  // Local state for fetching chatbots from Firestore
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [isLoadingChatbots, setIsLoadingChatbots] = useState(true);

  // Fetch user's custom chatbots from Firestore
  useEffect(() => {
    if (!user) {
      setChatbots([]);
      setIsLoadingChatbots(false);
      return;
    }

    const chatbotsQuery = query(
      collection(db, "chatbots"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      chatbotsQuery,
      (snapshot) => {
        const fetchedChatbots: Chatbot[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          userId: doc.data().userId,
          name: doc.data().name,
          emoji: doc.data().emoji,
          firstMessageText: doc.data().firstMessageText,
          description: doc.data().description,
          speechStyle: doc.data().speechStyle,
          focus: doc.data().focus,
          avoid: doc.data().avoid,
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));
        setChatbots(fetchedChatbots);
        setIsLoadingChatbots(false);
      },
      (error) => {
        console.error("Error fetching chatbots:", error);
        toast.error("Failed to load custom chatbots");
        setIsLoadingChatbots(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Pass chatbots to useChat hook for centralized management
  const {
    inputMessage,
    loading,
    streaming,
    chatMode,
    selectedChatbot,
    currentMessages,
    remaining,
    isLimitReached,
    messagesEndRef,
    textareaRef,
    setInputMessage,
    sendMessage,
    changeChatMode,
    selectChatbot,
  } = useChat({ chatbots });

  // Combined form state for adding/editing chatbot
  const [chatbotDialogOpen, setChatbotDialogOpen] = useState(false);
  const [editingChatbot, setEditingChatbot] = useState<Chatbot | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmoji, setFormEmoji] = useState("");
  const [formFirstMessageText, setFormFirstMessageText] = useState("");
  const [descriptionText, setDescriptionText] = useState("");
  const [focusText, setFocusText] = useState("");
  const [avoidText, setAvoidText] = useState("");
  const [speechStyleText, setSpeechStyleText] = useState("");
  const [isSavingChatbot, setIsSavingChatbot] = useState(false);

  const isEditMode = editingChatbot !== null;

  // State for deleting chatbot
  const [deletingChatbot, setDeletingChatbot] = useState<Chatbot | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingChatbot, setIsDeletingChatbot] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage();
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await handleSubmit(e);
    }
  };

  const handleChatModeChange = (mode: ChatMode) => {
    changeChatMode(mode);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSelectChatbot = (chatbot: Chatbot) => {
    selectChatbot(chatbot);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleOpenChatbotDialog = (chatbot?: Chatbot) => {
    if (chatbot) {
      // Edit mode
      setEditingChatbot(chatbot);
      setFormName(chatbot.name);
      setFormEmoji(chatbot.emoji);
      setFormFirstMessageText(chatbot.firstMessageText);
    } else {
      // Add mode
      setEditingChatbot(null);
      setFormName("");
      setFormEmoji("");
      setFormFirstMessageText("");
    }
    setChatbotDialogOpen(true);
  };

  const handleSaveChatbot = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to create a chatbot");
      return;
    }

    if (!formName.trim()) {
      toast.error("Please enter a name for your chatbot");
      return;
    }

    setIsSavingChatbot(true);

    try {
      if (isEditMode) {
        // Update existing chatbot
        await updateDoc(doc(db, "chatbots", editingChatbot.id), {
          name: formName.trim(),
          emoji: formEmoji.trim() || "🤖",
          firstMessageText: formFirstMessageText.trim(),
          description: descriptionText.trim(),
          speechStyle: speechStyleText.trim(),
          focus: focusText.trim(),
          avoid: avoidText.trim(),
        });
        toast.success("Chatbot updated successfully!");
      } else {
        // Create new chatbot
        await addDoc(collection(db, "chatbots"), {
          userId: user.uid,
          name: formName.trim(),
          emoji: formEmoji.trim() || "🤖",
          firstMessageText: formFirstMessageText.trim(),
          description: descriptionText.trim(),
          speechStyle: speechStyleText.trim(),
          focus: focusText.trim(),
          avoid: avoidText.trim(),
          createdAt: serverTimestamp(),
        });
        toast.success("Chatbot created successfully!");
      }

      setChatbotDialogOpen(false);
      setEditingChatbot(null);
    } catch (error) {
      console.error("Error saving chatbot:", error);
      toast.error(
        `Failed to ${isEditMode ? "update" : "create"} chatbot. Please try again.`
      );
    } finally {
      setIsSavingChatbot(false);
    }
  };

  const handleOpenDeleteDialog = (chatbot: Chatbot) => {
    setDeletingChatbot(chatbot);
    setChatbotDialogOpen(false); // Close the edit dialog if open
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteChatbot = async () => {
    if (!deletingChatbot) return;

    setIsDeletingChatbot(true);

    try {
      await deleteDoc(doc(db, "chatbots", deletingChatbot.id));

      toast.success("Chatbot deleted successfully!");
      setIsDeleteDialogOpen(false);
      setDeletingChatbot(null);

      // If the deleted chatbot was selected, clear selection
      if (selectedChatbot?.id === deletingChatbot.id) {
        changeChatMode("fart");
      }
    } catch (error) {
      console.error("Error deleting chatbot:", error);
      toast.error("Failed to delete chatbot. Please try again.");
    } finally {
      setIsDeletingChatbot(false);
    }
  };

  // Get label for current selection (default mode or custom chatbot)
  const getCurrentSelectionLabel = () => {
    if (selectedChatbot) {
      return `${selectedChatbot.emoji} ${selectedChatbot.name}`;
    }
    return getChatModeLabel(chatMode);
  };

  return (
    <main className="flex flex-1 flex-col md:flex-row bg-neutral-50 dark:bg-neutral-800 h-[calc(100dvh-64px)]">
      <div className="md:hidden bg-neutral-200 dark:bg-neutral-900 flex flex-row justify-between items-center px-2 py-1">
        <Drawer>
          <DrawerTrigger>
            <span className="flex items-center gap-2">
              <div className="text-lg">{getCurrentSelectionLabel()}</div>
              <RefreshCw size={16} />
            </span>
          </DrawerTrigger>
          <DrawerContent className="h-full flex flex-col">
            <DrawerHeader>
              <DrawerTitle>Choose a chat mode</DrawerTitle>
            </DrawerHeader>
            <ScrollArea className="p-4 overflow-auto flex flex-col gap-2 mb-4">
              <div className="flex flex-col gap-2">
                <ChatModeButtons
                  chatMode={chatMode}
                  handleChatModeChange={handleChatModeChange}
                  isCustomChatbotSelected={selectedChatbot !== null}
                />
              </div>
            </ScrollArea>
            <DrawerFooter>
              <DrawerClose>
                <span>Close</span>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-semibold ${
              isLimitReached
                ? "text-red-600 dark:text-red-400"
                : remaining <= 10
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-green-600 dark:text-green-400"
            }`}
          >
            {remaining} left
          </span>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            / {DAILY_MESSAGE_LIMIT}
          </span>
        </div>
      </div>
      <div className="hidden md:block border-b border-neutral-200 dark:border-neutral-900 bg-neutral-100 dark:bg-neutral-900 min-w-64 h-[calc(100dvh-64px)]">
        <div className="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-20">
          <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Daily Messages Limit
          </h4>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-semibold ${
                isLimitReached
                  ? "text-red-600 dark:text-red-400"
                  : remaining <= 10
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-green-600 dark:text-green-400"
              }`}
            >
              {remaining} left
            </span>
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              / {DAILY_MESSAGE_LIMIT}
            </span>
          </div>
          {isLimitReached && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              Limit reached! Resets at midnight.
            </p>
          )}
        </div>
        <ScrollArea className="h-[calc(100vh-134px)] overflow-y-hidden flex flex-col flex-1 ">
          <div className="px-4 pt-4">
            <h3 className="text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
              Chat Mode:
            </h3>
            <p className="max-w-[200px] text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              Pick a chat mode to set the tone for the conversation.
            </p>
            <div className="overflow-hidden flex flex-col flex-1 gap-2 mb-4">
              <ChatModeButtons
                chatMode={chatMode}
                handleChatModeChange={handleChatModeChange}
                isCustomChatbotSelected={selectedChatbot !== null}
              />
              <div className="mt-4 border-b dark:border-neutral-700 border-neutral-400 pb-2">
                Custom Chatbots
              </div>

              {isLoadingChatbots ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-neutral-500" />
                </div>
              ) : chatbots.length === 0 ? (
                <p className="text-sm text-neutral-500 dark:text-neutral-400 py-2">
                  No Custom Chatbots Found
                </p>
              ) : (
                <div className="flex flex-col gap-2 mb-3">
                  {chatbots.map((chatbot) => (
                    <GradientBorder
                      key={chatbot.id}
                      width={1}
                      roundedSize="lg"
                      showGradientBorder={selectedChatbot?.id === chatbot.id}
                      defaultBorderColor="bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-500 transition-all duration-300"
                    >
                      <div
                        className={`flex items-center p-3 rounded-lg transition-all duration-200 hover:shadow-md ${
                          selectedChatbot?.id === chatbot.id
                            ? "bg-neutral-100 dark:bg-neutral-900 bg-gradient-to-br dark:from-neutral-950 dark:via-neutral-800 dark:to-neutral-950 from-neutral-300 via-neutral-100 to-neutral-300"
                            : "bg-neutral-100 dark:bg-neutral-900"
                        }`}
                      >
                        <div
                          onClick={() => handleSelectChatbot(chatbot)}
                          className="flex items-center flex-1 cursor-pointer"
                        >
                          <Checkbox
                            checked={selectedChatbot?.id === chatbot.id}
                            className="mr-3 border-neutral-400"
                          />
                          <span
                            className={`text-sm font-semibold ${
                              selectedChatbot?.id === chatbot.id
                                ? "text-neutral-900 dark:text-neutral-100"
                                : "text-neutral-600 dark:text-neutral-400"
                            }`}
                          >
                            {chatbot.emoji} {chatbot.name}
                          </span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4 text-neutral-500" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleOpenChatbotDialog(chatbot)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => handleOpenDeleteDialog(chatbot)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </GradientBorder>
                  ))}
                </div>
              )}

              <Button
                variant="outline"
                className="gap-0"
                onClick={() => handleOpenChatbotDialog()}
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add New Chatbot
              </Button>

              {/* Add/Edit Chatbot Dialog */}
              <Dialog
                open={chatbotDialogOpen}
                onOpenChange={setChatbotDialogOpen}
              >
                <DialogContent className="sm:max-w-[425px] md:max-w-2xl max-h-[90dvh] overflow-y-auto">
                  <form onSubmit={handleSaveChatbot}>
                    <DialogHeader>
                      <DialogTitle>
                        {isEditMode ? "Edit Chatbot" : "Add New Chatbot"}
                      </DialogTitle>
                      <DialogDescription>
                        {isEditMode
                          ? "Update your custom chatbot settings."
                          : "Build your own custom chatbot."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-3">
                        <Label htmlFor="chatbot-name">Name</Label>
                        <Input
                          id="chatbot-name"
                          name="chatbot-name"
                          placeholder="Chatbot Name"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          disabled={isSavingChatbot}
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="chatbot-emoji">Emoji</Label>
                        <Input
                          id="chatbot-emoji"
                          name="chatbot-emoji"
                          placeholder="🤖"
                          value={formEmoji}
                          onChange={(e) => setFormEmoji(e.target.value)}
                          disabled={isSavingChatbot}
                          className="placeholder:opacity-40"
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="chatbot-first-message">
                          First Message
                        </Label>
                        <Input
                          id="chatbot-first-message"
                          name="chatbot-first-message"
                          placeholder="Hello! How can I help you today?"
                          value={formFirstMessageText}
                          onChange={(e) =>
                            setFormFirstMessageText(e.target.value)
                          }
                          disabled={isSavingChatbot}
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="chatbot-description">Description</Label>
                        <Textarea
                          id="chatbot-description"
                          name="chatbot-description"
                          placeholder="Describe your chatbot in a few sentences"
                          value={descriptionText}
                          onChange={(e) => setDescriptionText(e.target.value)}
                          disabled={isSavingChatbot}
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="chatbot-speech-style">
                          Speech Style
                        </Label>
                        <Textarea
                          id="chatbot-speech-style"
                          name="chatbot-speech-style"
                          placeholder="How should your chatbot talk?"
                          value={speechStyleText}
                          onChange={(e) => setSpeechStyleText(e.target.value)}
                          disabled={isSavingChatbot}
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="chatbot-focus">Focus On</Label>
                        <Textarea
                          id="chatbot-focus"
                          name="chatbot-focus"
                          placeholder="What is your chatbot's focus?"
                          value={focusText}
                          onChange={(e) => setFocusText(e.target.value)}
                          disabled={isSavingChatbot}
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="chatbot-avoid">Avoid</Label>
                        <Textarea
                          id="chatbot-avoid"
                          name="chatbot-avoid"
                          placeholder="What should the chatbot avoid?"
                          value={avoidText}
                          onChange={(e) => setAvoidText(e.target.value)}
                          disabled={isSavingChatbot}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isSavingChatbot}
                        >
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button type="submit" disabled={isSavingChatbot}>
                        {isSavingChatbot ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isEditMode ? "Updating..." : "Saving..."}
                          </>
                        ) : isEditMode ? (
                          "Update Chatbot"
                        ) : (
                          "Save Chatbot"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Delete Chatbot Confirmation Dialog */}
              <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
              >
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Delete Chatbot</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete{" "}
                      <span className="font-semibold">
                        {deletingChatbot?.name}
                      </span>
                      ? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2">
                    <DialogClose asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isDeletingChatbot}
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDeleteChatbot}
                      disabled={isDeletingChatbot}
                      className="dark:bg-red-700"
                    >
                      {isDeletingChatbot ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete Chatbot"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </ScrollArea>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden h-[calc(100dvh-100px)] md:h-[calc(100dvh-64px)] relative">
        <ScrollArea className="h-full overflow-y-scroll px-2">
          <div className="space-y-12 pt-4 flex-1 max-w-3xl mx-auto px-2 relative h-[calc(100dvh-100px)] md:h-[calc(100dvh-64px)]">
            {currentMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.isUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-2 sm:px-4 py-2 rounded-xl ${
                    message.isUser
                      ? "bg-neutral-200/50 dark:bg-neutral-700 dark:text-neutral-100 sm:max-w-sm mx-2 sm:mx-0 max-w-[90%]"
                      : "dark:bg-neutral-800 text-neutral-950 dark:text-neutral-100 max-w-4xl"
                  }`}
                >
                  <p className="text-md">
                    {message.text}
                    {/* Show typing indicator for streaming messages */}
                    {streaming && !message.isUser && message.text === "" && (
                      <span className="inline-block animate-pulse">●●●</span>
                    )}
                  </p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} className="mb-48 h-36" />
          </div>
        </ScrollArea>
        <div className="absolute bottom-0 left-0 right-0 px-4">
          <div className="max-w-3xl mx-auto bg-neutral-50 dark:bg-neutral-800 rounded-t-[28px] pb-2">
            <LlmChatInput
              handleSubmit={handleSubmit}
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              handleKeyDown={handleKeyDown}
              isSubmitting={loading}
              ref={textareaRef}
              isLimitReached={isLimitReached}
              remaining={remaining}
              maxLength={MAX_MESSAGE_CHARACTERS}
              placeholder="Ask anything"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
