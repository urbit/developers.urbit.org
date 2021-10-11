import React from "react";

export default function Container({ children }) {
  return (
    <div className="flex flex-col min-h-screen w-full items-center">
      {children}
    </div>
  );
}
