import React, { useState, useMemo, useEffect } from "react";
import OutsideClickHandler from "react-outside-click-handler";
import SortDivider from "../../../../assets/images/plp/sort-divider.svg";
import styles from "./sort.less";
import { useLocation } from "react-router-dom";
import { useGlobalTranslation } from "fdk-core/utils";

function Sort({ sortList = [], onSortUpdate = () => {} }) {
  const { t } = useGlobalTranslation("translation");
  const [sortOpen, setSortOpen] = useState(false);
  const location = useLocation();

  const selectedSort = useMemo(() => {
    let selectedItem = sortList?.find((x) => x.is_selected);
    if (selectedItem) {
      return selectedItem.name;
    }
    return sortList?.[0]?.name;
  }, [sortList]);

  function updateSortOption(e, sortValue) {
    e.stopPropagation();
    e.preventDefault();
    onSortUpdate(sortValue);
    closeSortOption(e);
  }

  function closeSortOption() {
    setSortOpen(false);
  }

  useEffect(() => {
    closeSortOption();
  }, [location?.search]);

  return (
    <OutsideClickHandler onOutsideClick={closeSortOption}>
      <div
        className={styles.dropdown}
        onKeyDown={(e) => {
          if (e.key === "Escape") closeSortOption();
        }}
      >
        <button
          type="button"
          className={styles.sortTrigger}
          aria-expanded={sortOpen}
          onClick={() => setSortOpen(!sortOpen)}
          title={selectedSort}
        >
          <span className={styles.sortLabel}>
            {t("resource.facets.sort_by")}
          </span>
          <span className={styles.sortDivider} aria-hidden="true">
            <SortDivider />
          </span>
          <span className={styles.selectedSort}>{selectedSort}</span>
        </button>

        {sortOpen && (
          <ul className={styles.dropdownList}>
            {sortList?.map((sortType, index) => (
              <li key={sortType.value + index}>
                <button
                  type="button"
                  onClick={(e) => updateSortOption(e, sortType.value)}
                  aria-pressed={sortType.is_selected}
                >
                  {sortType.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </OutsideClickHandler>
  );
}

export default Sort;
