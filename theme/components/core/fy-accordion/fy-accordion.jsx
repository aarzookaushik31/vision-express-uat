import React, { useState } from "react";
import styles from "./fy-accordion.less";
import MinusIcon from "../../../assets/images/minus.svg";
import AddIcon from "../../../assets/images/arrow-down.svg";

function FyAccordion({ isOpen: initialIsOpen, children }) {
  const [isOpenState, setIsOpenState] = useState(initialIsOpen);

  const toggleAccordion = () => {
    setIsOpenState(!isOpenState);
  };

  return (
    <div className={`${styles.accordion} ${isOpenState ? styles.open : ""}`}>
      <button
        type="button"
        className={`${styles.flexAlignCenter} ${styles.justifyBetween} ${styles.accordionHead}`}
        onClick={toggleAccordion}
      >
        <div>{children[0]}</div>
        <div className={styles.accordion__icon}>
          {isOpenState ? <MinusIcon /> : <AddIcon />}
        </div>
      </button>
      <div
        className={styles.accordion__content}
        style={{ display: isOpenState ? "block" : "none" }}
      >
        {children[1]}
      </div>
    </div>
  );
}

export default FyAccordion;
