"use client";

import Rive from "@rive-app/react-canvas";
import LoadingComponent from "../animated/loader";
import Image from "next/image";

interface Props {
  height?: string;
  width?: string;
  themed?: boolean;
}
const Splash = (props: Props) => {
  const loadingGif = "/loading.gif";
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
        <Image alt="Loading icon" src={loadingGif} height={100} width={100} />
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
        minHeight: "100vh",
      }}
    >
      <Image alt="Loading icon" src={loadingGif} height={100} width={100} />
    </div>
  );
};

export default Splash;
