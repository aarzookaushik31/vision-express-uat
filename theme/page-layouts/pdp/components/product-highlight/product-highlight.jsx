import React from "react";
import styles from "./product-highlight.less";
import lightweightIcon from "../../../../assets/images/lightweight.png";
import ValueDriven from "../../../../assets/images/valuedriven.png";
import LowMaintainence from "../../../../assets/images/low-maintenance.png";
import Flexible from "../../../../assets/images/flexible.png";
import Common from "../../../../assets/images/flexible.png";

function PdpHighlights({ highlights }) {
  if (!highlights || highlights.length === 0) return null;

  const iconMap = {
    "lightweight": lightweightIcon,
    "value-driven": ValueDriven,
    "low-maintenance": LowMaintainence,
    "flexible": Flexible,
  };

  return (
    <div className={styles.highlightsContainer}>
      {highlights.map((item, index) =>
        item.split("~").map((p, i) => {
          const text = p.trim();
          const lower = text.toLowerCase();

          const matchedKey = Object.keys(iconMap).find((key) =>
            lower.includes(key)
          );

          const icon = matchedKey ? iconMap[matchedKey] : Common;

          return (
            <div className={styles.highlightItem} key={`${index}-${i}`}>
              <span className={styles.icon}>
                <img src={icon} className={styles.iconImg} />
              </span>

              <span className={styles.text}>{text}</span>
            </div>
          );
        })
      )}
    </div>
  );
}

export default PdpHighlights;
