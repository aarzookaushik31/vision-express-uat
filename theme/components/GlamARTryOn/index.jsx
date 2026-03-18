import React, { useState, useEffect } from "react";
import * as GlamAR from "@glamario/core-web";
import btnImg from "../../assets/images/glam-ar-btn.png";
import styles from "./style.less";

export default function GlamARTrigger({ accessToken, sku }) {
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

  return (
    <>
      <button type="button" onClick={openAR} className={styles.glamArBtn}>
        <img src={btnImg} alt="Try 3D" />
      </button>

      {isOpen && (
        <div className={styles.glamOverlay}>
          <div className={styles.glamARModal}>
            <button
              type="button"
              onClick={closeAR}
              className={styles.closeBtn}
            >
              ✕
            </button>
            <div
              className={styles.containerGlamAR}
              id="container__frame_wrapper"
            />
          </div>
        </div>
      )}
    </>
  );
}