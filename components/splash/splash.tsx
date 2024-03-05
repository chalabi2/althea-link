"use client";

import Rive from "@rive-app/react-canvas";
import LoadingComponent from "../animated/loader";

interface Props {
  height?: string;
  width?: string;
  themed?: boolean;
}
const Splash = (props: Props) => {
  //   if mobile only
  if (!window.matchMedia("(min-width: 768px)").matches) {
    return (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: " 100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <LoadingComponent size="lg" />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <LoadingComponent size="lg" />
    </div>
  );
};

export default Splash;
