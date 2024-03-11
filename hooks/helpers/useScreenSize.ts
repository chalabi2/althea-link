import { useState, useEffect } from "react";

const MOBILE_SCREEN_WIDTH_MAX = 768;

const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: undefined as number | undefined,
    height: undefined as number | undefined,
  });

  useEffect(() => {
    // Set the actual window sizes after the component has mounted
    setScreenSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    screenSize,
    isMobile:
      screenSize.width !== undefined &&
      screenSize.width < MOBILE_SCREEN_WIDTH_MAX,
  };
};

export default useScreenSize;
