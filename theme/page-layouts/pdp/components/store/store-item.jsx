// StoreItem.js
import React from "react";
import PropTypes from "prop-types";

import styles from "./store-item.less";


function StoreItem({
  storeitem,
}) {



    const handleGetDirections = () => {
    if (!storeitem?.address) return;

      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              "Vision Express, " + storeitem.address
        )}`,
        "_blank"
      );
       };



  return (
    <div className={styles.storeItemWrapper}>
      <h2 className={styles.storeName}>
        {storeitem.name}
      </h2>
      <p className={styles.storeAddress}>
        {storeitem.address}
      </p>
     
      <div className={styles.buttonWrapper}>

          <button
          type="button"
          className={`${styles.button} btnPrimary ${styles.directionButton}`}
          onClick={handleGetDirections}
        >
           Get Directions
        </button>
         <a
          className={`${styles.button} btnSecondary ${styles.detailsButton}`}
          href={`/locate-us?storeCode=${storeitem.store_code}`}
        >
          Store Details
        </a>
      </div>
    </div>
  );
}

StoreItem.propTypes = {
  onSelectStoreItem: PropTypes.func,
};

export default StoreItem;
