"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

import { Button } from "@/components/ui/button";

interface EvadingButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?:
    | "outline"
    | "default"
    | "destructive"
    | "secondary"
    | "ghost"
    | "link";
  evades?: boolean; // Whether the button should evade the cursor
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; // Click handler when not evading
  detectionRadius?: number; // Distance at which button starts evading
  moveDistance?: number; // How far the button moves when evading
  speed?: number; // Animation speed in milliseconds
}

const EvadingButton = ({
  children,
  className = "",
  variant = "default",
  evades = true,
  onClick,
  detectionRadius = 100,
  moveDistance = 150,
  speed = 300,
}: EvadingButtonProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize button position to center of container
  useEffect(() => {
    if (containerRef.current && !isInitialized) {
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();

      setPosition({
        x: containerRect.width / 2,
        y: containerRect.height / 2,
      });
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const moveButton = useCallback(
    (mouseX: number, mouseY: number, forceMove = false) => {
      if (!buttonRef.current || !containerRef.current || !evades) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const button = buttonRef.current;
      const buttonRect = button.getBoundingClientRect();

      // Calculate button center relative to container
      const buttonCenterX = position.x;
      const buttonCenterY = position.y;

      // Convert mouse position to container-relative coordinates
      const relativeMouseX = mouseX - containerRect.left;
      const relativeMouseY = mouseY - containerRect.top;

      // Calculate distance between mouse and button center
      const distance = Math.sqrt(
        Math.pow(relativeMouseX - buttonCenterX, 2) +
          Math.pow(relativeMouseY - buttonCenterY, 2)
      );

      // If mouse is within detection radius or we're forcing a move, move the button away
      if (distance < detectionRadius || forceMove) {
        let newX, newY;

        if (forceMove) {
          // If forcing move (hover escape), move to a random safe position
          const buttonWidth = buttonRect.width;
          const buttonHeight = buttonRect.height;
          const safeMargin = Math.max(detectionRadius, 100);

          // Find a position far from the mouse
          const attempts = 10;
          let bestDistance = 0;
          let bestX = buttonCenterX;
          let bestY = buttonCenterY;

          for (let i = 0; i < attempts; i++) {
            const candidateX =
              buttonWidth / 2 +
              Math.random() * (containerRect.width - buttonWidth);
            const candidateY =
              buttonHeight / 2 +
              Math.random() * (containerRect.height - buttonHeight);

            const candidateDistance = Math.sqrt(
              Math.pow(relativeMouseX - candidateX, 2) +
                Math.pow(relativeMouseY - candidateY, 2)
            );

            if (
              candidateDistance > bestDistance &&
              candidateDistance > safeMargin
            ) {
              bestDistance = candidateDistance;
              bestX = candidateX;
              bestY = candidateY;
            }
          }

          newX = bestX;
          newY = bestY;
        } else {
          // Normal evasion: move away from mouse
          let directionX = buttonCenterX - relativeMouseX;
          let directionY = buttonCenterY - relativeMouseY;

          // If too close to mouse (almost zero distance), pick a random direction
          if (Math.abs(directionX) < 1 && Math.abs(directionY) < 1) {
            const angle = Math.random() * 2 * Math.PI;
            directionX = Math.cos(angle);
            directionY = Math.sin(angle);
          }

          // Normalize the direction vector
          const magnitude = Math.sqrt(
            directionX * directionX + directionY * directionY
          );
          const normalizedX = magnitude > 0 ? directionX / magnitude : 0;
          const normalizedY = magnitude > 0 ? directionY / magnitude : 0;

          // Calculate new position
          newX = buttonCenterX + normalizedX * moveDistance;
          newY = buttonCenterY + normalizedY * moveDistance;
        }

        // Keep button within container bounds with padding to prevent corner trapping
        const buttonWidth = buttonRect.width;
        const buttonHeight = buttonRect.height;
        const padding = Math.min(
          50,
          Math.min(containerRect.width, containerRect.height) * 0.1
        );

        const clampedX = Math.max(
          buttonWidth / 2 + padding,
          Math.min(containerRect.width - buttonWidth / 2 - padding, newX)
        );
        const clampedY = Math.max(
          buttonHeight / 2 + padding,
          Math.min(containerRect.height - buttonHeight / 2 - padding, newY)
        );

        // Check if the new position would be too close to any corner
        const corners = [
          { x: padding, y: padding }, // top-left
          { x: containerRect.width - padding, y: padding }, // top-right
          { x: padding, y: containerRect.height - padding }, // bottom-left
          {
            x: containerRect.width - padding,
            y: containerRect.height - padding,
          }, // bottom-right
        ];

        const cornerTooClose = corners.some((corner) => {
          const distanceToCorner = Math.sqrt(
            Math.pow(clampedX - corner.x, 2) + Math.pow(clampedY - corner.y, 2)
          );
          return distanceToCorner < detectionRadius;
        });

        // If too close to a corner, move to center-ish area
        if (cornerTooClose) {
          const centerX = containerRect.width / 2;
          const centerY = containerRect.height / 2;
          const offsetX = (Math.random() - 0.5) * (containerRect.width * 0.3);
          const offsetY = (Math.random() - 0.5) * (containerRect.height * 0.3);

          setPosition({
            x: Math.max(
              buttonWidth / 2 + padding,
              Math.min(
                containerRect.width - buttonWidth / 2 - padding,
                centerX + offsetX
              )
            ),
            y: Math.max(
              buttonHeight / 2 + padding,
              Math.min(
                containerRect.height - buttonHeight / 2 - padding,
                centerY + offsetY
              )
            ),
          });
        } else {
          setPosition({ x: clampedX, y: clampedY });
        }
      }
    },
    [position, detectionRadius, moveDistance, evades]
  );

  // Mouse move handler
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      moveButton(event.clientX, event.clientY);
    },
    [moveButton]
  );

  // Touch move handler for mobile
  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        moveButton(touch.clientX, touch.clientY);
      }
    },
    [moveButton]
  );

  useEffect(() => {
    if (evades) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("touchmove", handleTouchMove);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("touchmove", handleTouchMove);
      };
    }
  }, [handleMouseMove, handleTouchMove, evades]);

  // Prevent the button from being clicked only when evading
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (evades) {
      e.preventDefault();
      e.stopPropagation();
      // The button will have already moved away, but just in case
    } else if (onClick) {
      // If not evading, call the provided click handler
      onClick(e);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      style={{ minHeight: "300px" }}
    >
      <Button
        ref={buttonRef}
        variant={variant}
        className={`absolute transition-all duration-${speed} ease-out transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${!evades ? "bg-green-500" : ""} ${className}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transitionDuration: `${speed}ms`,
        }}
        onClick={handleClick}
        onMouseEnter={(e) => {
          // Quick escape when mouse hovers over button
          if (evades) {
            moveButton(e.clientX, e.clientY, true);
          }
        }}
        onMouseOver={(e) => {
          // Continuous escape while mouse is over button
          if (evades) {
            moveButton(e.clientX, e.clientY, true);
          }
        }}
      >
        {children}
      </Button>
    </div>
  );
};

export default EvadingButton;
