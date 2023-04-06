import React, { useRef, useEffect } from "react";

function ScrollableContent(props) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [props.children]);

  return (
    <div
      ref={scrollRef}
      style={{ overflowY: "auto", maxHeight: "640px" }} // set a maximum height to enable scrolling
    >
      {props.children}
    </div>
  );
}

export default ScrollableContent;
