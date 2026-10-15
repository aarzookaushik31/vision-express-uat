import React from "react";

const StickyColumn = ({ className, topOffset = 0, children }) => {
  return (
    <div
      className={className}
      style={{
        position: "sticky",
        top: topOffset,
        alignSelf: "flex-start",
        maxHeight: `calc(100vh - ${topOffset}px)`,
        overflowY: "auto",
        overscrollBehavior: "contain",
        scrollbarWidth: "thin",
      }}
    >
      {children}
    </div>
  );
};

export default StickyColumn;