"use client";

import { useEffect, useState } from "react";

type Props = {
  children?: React.ReactNode;
};

const ScreenProvider = ({ children }: Props) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // During SSR, always render children to prevent hydration mismatch
  if (!isClient) {
    return <>{children}</>;
  }

  // Mobile-first: App now works on all screen sizes!
  // Removed "not available on mobile" block - we're fully responsive now 🎉
  return <>{children}</>;
};

export default ScreenProvider;
