import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import * as GlamAR from "@glamario/core-web";
import btnImg from "../../assets/images/glam-ar-btn.png";
import styles from "./style.less";

export default function GlamARTrigger({
  accessToken,
  sku,
  children,
  buttonClassName,
  mode,
  ariaLabel,
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    GlamAR.init("container__frame_wrapper", accessToken, { platform: "web" });
    const handleLoaded = () => {
      if (sku) GlamAR.applyBySku(sku);
      else GlamAR.open(mode);
    };
    const handleSkuApplied = () => {
      if (mode) GlamAR.open(mode);
      else GlamAR.open();
    };
    const handleSkuFailed = () => console.error("GlamAR: SKU could not be applied", sku);
    const handleError = (payload) => console.error("GlamAR error:", payload);
    const handleClosed = () => setIsOpen(false);

    GlamAR.addEventListener("loaded", handleLoaded);
    GlamAR.addEventListener("sku-applied", handleSkuApplied);
    GlamAR.addEventListener("sku-failed", handleSkuFailed);
    GlamAR.addEventListener("error", handleError);
    GlamAR.addEventListener("closed", handleClosed);

    return () => {
      GlamAR.removeEventListener("loaded", handleLoaded);
      GlamAR.removeEventListener("sku-applied", handleSkuApplied);
      GlamAR.removeEventListener("sku-failed", handleSkuFailed);
      GlamAR.removeEventListener("error", handleError);
      GlamAR.removeEventListener("closed", handleClosed);
      if (typeof GlamAR.destroy === "function") GlamAR.destroy();
    };
  }, [isOpen, sku, accessToken, mode]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const openAR = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(true);
  };

  const closeAR = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={openAR}
        aria-label={ariaLabel}
        className={buttonClassName || styles.glamArBtn}
      >
        {children || <img src={btnImg} alt="Try 3D" />}
      </button>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className={styles.glamOverlay}
            role="dialog"
            aria-modal="true"
            aria-label={mode === "modelViewer" ? "360° product view" : "Virtual Try-On"}
          >
            <div className={styles.glamARModal}>
              <button
                type="button"
                onClick={closeAR}
                aria-label={mode === "modelViewer" ? "Close 360° product view" : "Close Virtual Try-On"}
                className={styles.closeBtn}
              >
                ✕
              </button>
              <div className={styles.containerGlamAR} id="container__frame_wrapper" />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}