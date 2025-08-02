import React from "react";

import Image from "next/image";

import { Download } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import { ImageGenerationMessage } from "@/types";

// Generated Image Card Component for horizontal display
interface GeneratedImageCardProps {
  message: ImageGenerationMessage;
}

export default function GeneratedImageCard({
  message,
}: GeneratedImageCardProps) {
  // handle downloading the generated image
  const downloadImage = () => {
    if (
      !message.imageUrl ||
      !message.imageUrl.startsWith("data:image/png;base64,")
    )
      return;

    try {
      // Create a temporary anchor element
      const link = document.createElement("a");
      link.href = message.imageUrl; // Use the original data URL
      const imageUUID = uuidv4();
      link.download = `for-the-fews-image-${imageUUID}.png`;

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  return (
    <div className="aspect-square bg-neutral-200 dark:bg-neutral-600 rounded-lg p-0.5 relative group overflow-hidden mx-2 max-h-[550px] flex">
      {message.loading ? (
        <div className="p-16 flex flex-col items-center justify-center flex-1">
          <div className="w-8 h-8 border-3 border-neutral-400 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">
            Generating image...
          </p>
        </div>
      ) : (
        <>
          <Image
            src={message.imageUrl!}
            alt={message.content}
            width={500}
            height={500}
            className="w-full h-full object-contain rounded-lg"
            onError={(e) => {
              console.error("Image failed to load:", e);
            }}
            priority={false}
            unoptimized={true}
          />
          <div className="absolute top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center p-4 sm:p-8 text-neutral-50">
            <p className="text-sm sm:text-base">{message.content}</p>
          </div>
          <button
            onClick={downloadImage}
            className="absolute top-3 right-3 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-105 transform"
            title="Download image"
          >
            <Download size={16} />
          </button>
        </>
      )}
    </div>
  );
}
