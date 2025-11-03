import { useEffect } from "react";

function useNormalizeScale(baseFontSize = 32) {
  useEffect(() => {
    const applyScale = () => {
      const zoom = window.devicePixelRatio || 1;
      const adjustedFontSize =
        zoom > 1.05 ? `${baseFontSize / zoom}px` : `${baseFontSize}px`;
      document.documentElement.style.fontSize = adjustedFontSize;
    };

    applyScale();

    window.addEventListener("resize", applyScale);
    window
      .matchMedia("(resolution: 2dppx)")
      .addEventListener("change", applyScale);

    return () => {
      window.removeEventListener("resize", applyScale);
      window
        .matchMedia("(resolution: 2dppx)")
        .removeEventListener("change", applyScale);
    };
  }, [baseFontSize]);
}

export default useNormalizeScale;
