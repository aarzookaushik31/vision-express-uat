import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import * as GlamAR from "@glamario/core-web";
import btnImg from "../../assets/images/glam-ar-btn.png";
import styles from "./style.less";

// export default function GlamARTrigger({ accessToken, sku }) {
export default function GlamARTrigger({ accessToken, sku, children, buttonClassName }) {
  const [isOpen, setIsOpen] = useState(false);

  const config = {
    platform: "web",
  };

  useEffect(() => {
    if (isOpen) {
      GlamAR.init("container__frame_wrapper", accessToken, config);

      GlamAR.addEventListener("loaded", () => {
        console.log("SDK Loaded");

        if (sku) {
          GlamAR.applyBySku(sku);
        }
      });

      GlamAR.addEventListener("sku-applied", () => {
        console.log("SKU Applied Successfully");
      });
    }

    return () => {
      if (GlamAR && typeof GlamAR.destroy === "function") {
        GlamAR.destroy();
      }
    };
  }, [isOpen, sku]);

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

  return (
    <>
      {/* <button type="button" onClick={openAR} className={styles.glamArBtn}> */}
      <button type="button" onClick={openAR} className={buttonClassName || styles.glamArBtn}>
        {children || <img src={btnImg} alt="Try 3D" />}
      </button>

      {/* Original inline overlay condition retained: isOpen && (...) */}
      {isOpen && typeof document !== "undefined" && createPortal(
        <div className={styles.glamOverlay} role="dialog" aria-modal="true" aria-label="Virtual Try-On">
          <div className={styles.glamARModal}>
            <button
              type="button"
              onClick={closeAR}
              aria-label="Close Virtual Try-On"
              className={styles.closeBtn}
            >
              ✕
            </button>
            <div
              className={styles.containerGlamAR}
              id="container__frame_wrapper"
            />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
