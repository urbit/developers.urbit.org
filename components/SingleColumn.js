import React from "react";

export default function SingleColumn({ children }) {
  return (
    <div className="flex flex-col w-full items-center max-w-screen-2xl">
      {children}
    </div>
  );
}
