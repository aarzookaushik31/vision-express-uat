import React, { useState } from "react";
import FilterList from "../filter-list/filter-list";
import styles from "./filter-item.less";
import FilterChevron from "../../../../assets/images/plp/filter-chevron.svg";
import FilterRowDivider from "../../../../assets/images/plp/filter-row-divider.svg";

const FilterItem = ({ filter, isMobileView, onFilterUpdate = () => {} }) => {
  const [isActive, setIsActive] = useState(false);

  const toggleActive = () => {
    setIsActive(!isActive);
  };

  return (
    <div
      className={`${styles.filter} ${!filter.values.length ? styles.empty : ""}`}
    >
      {filter.values.length > 0 && (
        <button
          type="button"
          aria-expanded={isActive}
          className={`${styles["filter__title"]} ${styles.flexAlignCenter} ${styles.justifyBetween}`}
          onClick={toggleActive}
        >
          <span className={styles.name}>{filter.key.display}</span>
          <span>
            <FilterChevron
              className={`${styles["arrow-icon"]} ${isActive ? styles.isOpen : ""}`}
            />
          </span>
        </button>
      )}
      <div
        className={`${styles["filter__list"]} ${
          !isActive ? styles.collapse : ""
        }`}
      >
        <FilterList
          filter={filter}
          isMobileView={isMobileView}
          onFilterUpdate={onFilterUpdate}
        />
      </div>
      <FilterRowDivider className={styles.divider} aria-hidden="true" />
    </div>
  );
};

export default FilterItem;
