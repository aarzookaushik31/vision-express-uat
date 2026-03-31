import React from "react";
import { FDKLink } from "fdk-core/components";
import styles from "./breadcrumb.less";
import { useGlobalTranslation } from "fdk-core/utils";

function BreadCrumb({ productData, customClass }) {
  const { t } = useGlobalTranslation("translation");

  const attr1 = productData?.attributes?.["custom-attribute-1"];
  const attr2 = productData?.attributes?.["custom-attribute-2"];
  const attr3 = productData?.attributes?.["custom-attribute-3"];

  const breadcrumbs = [];

  // Home
  breadcrumbs.push({
    name: t("resource.common.breadcrumb.home"),
    url: "/",
  });

  // Attr 1
  if (attr1) {
    breadcrumbs.push({
      name: attr1,
      url: `/products?custom-attribute-1=${encodeURIComponent(attr1)}`,
    });
  }

  // Attr 2
  if (attr2) {
    breadcrumbs.push({
      name: attr2,
      url: `/products?custom-attribute-1=${encodeURIComponent(
        attr1
      )}&custom-attribute-2=${encodeURIComponent(attr2)}`,
    });
  }

  // Attr 3
  if (attr3) {
    breadcrumbs.push({
      name: attr3,
      url: `/products?custom-attribute-1=${encodeURIComponent(
        attr1
      )}&custom-attribute-2=${encodeURIComponent(
        attr2
      )}&custom-attribute-3=${encodeURIComponent(attr3)}`,
    });
  }


  if (productData?.name) {
  breadcrumbs.push({
    name: productData.name,
    url: "",
  });
}

  return (
    <div className={`${styles.breadcrumbs} ${styles.breadcrumbWrap} ${customClass}`}>

{/* <pre>{JSON.stringify(productData, null, 2)}</pre> */}


    {breadcrumbs.map((item, index) => {
  const isLast = index === breadcrumbs.length - 1;

  return (
    <span key={index}>
      {isLast ? (
        <span className={styles.productName}>{item.name}</span> 
      ) : (
        <FDKLink to={item.url}>{item.name}</FDKLink>
      )}
      {!isLast && <>&nbsp;/&nbsp;</>}
    </span>
  );
})}
    </div>
  );
}

export default BreadCrumb;