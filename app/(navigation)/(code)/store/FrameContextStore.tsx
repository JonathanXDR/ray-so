import React, { createContext, createRef, PropsWithChildren, RefObject, useRef } from "react";

export const FrameContext = createContext<RefObject<HTMLDivElement | null>>(createRef<HTMLDivElement>());

const FrameContextStore: React.FC<PropsWithChildren> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);

  return <FrameContext.Provider value={ref}>{children}</FrameContext.Provider>;
};

export default FrameContextStore;
