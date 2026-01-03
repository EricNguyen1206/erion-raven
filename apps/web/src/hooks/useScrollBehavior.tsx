import { useRef, useEffect, useCallback } from "react";

interface UseScrollBehaviorProps {
  hasMore?: boolean;
  loadMore?: () => void;
  isFetching?: boolean;
}

// Hook for managing scroll behavior
export const useScrollBehavior = ({ hasMore, loadMore, isFetching }: UseScrollBehaviorProps = {}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const previousScrollHeightRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);

  // Sync ref with prop for use in event listener
  useEffect(() => {
    isFetchingRef.current = !!isFetching;
  }, [isFetching]);

  const scrollToBottom = useCallback(() => {
    containerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    mainRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const scrollToBottomOnUpdate = useCallback(() => {
    // Only scroll to bottom if we are not fetching old messages (infinite scroll)
    // and if we are near the bottom or it's the first load
    // For now, keep simple behavior: scroll to bottom on update unless explicitly told not to?
    // Actually, when loading more messages, we strictly DO NOT want to scroll to bottom.
    // The previous behavior was just scrolling to bottom whenever `chats` changed.
    // We need to be careful now.

    // If we are fetching, do nothing (we will handle scroll adjustment manually)
    if (isFetchingRef.current) return;

    mainRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleScroll = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport || !hasMore || !loadMore || isFetchingRef.current) return;

    if (viewport.scrollTop === 0) {
      // Create a small buffer by scrolling down 1px to prevent continuous firing if user keeps scrolling up
      // viewport.scrollTop = 1; 

      previousScrollHeightRef.current = viewport.scrollHeight;
      loadMore();
    }
  }, [hasMore, loadMore]);

  // Attach scroll listener
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    viewport.addEventListener("scroll", handleScroll);
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Adjust scroll position after fetching
  useEffect(() => {
    if (!isFetching && previousScrollHeightRef.current > 0) {
      const viewport = viewportRef.current;
      if (viewport) {
        const newScrollHeight = viewport.scrollHeight;
        const scrollDiff = newScrollHeight - previousScrollHeightRef.current;

        // Adjust scroll position to maintain relative position
        // Disable smooth scrolling temporarily for instant adjustment
        viewport.style.scrollBehavior = "auto";
        viewport.scrollTop = scrollDiff;
        viewport.style.scrollBehavior = ""; // Reset

        previousScrollHeightRef.current = 0;
      }
    }
  }, [isFetching]);

  return {
    containerRef,
    mainRef,
    viewportRef,
    scrollToBottom,
    scrollToBottomOnUpdate,
  };
};