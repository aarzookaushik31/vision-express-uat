import React from "react";
import styles from "./page-not-found.less";
import "@gofynd/theme-template/components/core/fy-button/fy-button.css";
import { useGlobalTranslation } from "fdk-core/utils";
import { FDKLink } from "fdk-core/components";
import PageNotFoundIcon from "../../assets/images/not-found.png";
import PageNotFoundIconMobile from "../../assets/images/not-found-mobile.png";


function PageNotFound({ title }) {
  const { t } = useGlobalTranslation("translation");
  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.container}>

        <h1>Oops!</h1>
        <img className={styles.errorImgDesktop} src={PageNotFoundIcon} />
        <img className={styles.errorImgMobile} src={PageNotFoundIconMobile} />
        <h2>
          Page Not Found
        </h2>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <FDKLink to="/">
         <button>Back to Homepage</button>         
        </FDKLink>
      </div>
    </div>
  );
}
PageNotFound.defaultProps = {
  title: "Page Not Found",
};

export default PageNotFound;
