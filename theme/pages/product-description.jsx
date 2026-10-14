import React from "react";
import FindStore from "../sections/find-store";
import { useGlobalStore } from "fdk-core/utils";
import { useThemeConfig } from "../helper/hooks";
import { SectionRenderer } from "fdk-core/components";
import { getHelmet } from "../providers/global-provider";
import styles from "../styles/sections/product-description.less";

function ProductDescription({ fpi }) {
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi });
  const { sections = [] } = page || {};
  // Reuse a configured store finder; fill the missing design section only when absent.
  const hasStoreFinder = sections.some((section) => section?.name === "find-store");
  const PRODUCT = useGlobalStore(fpi.getters.PRODUCT);
  const seo = PRODUCT?.product_details?.seo || {};
  const productDescription = PRODUCT?.product_meta?.short_description;

  const mergedSeo = {
    ...seo,
    description: seo?.description || productDescription,
  };

  return (
    <>
      {getHelmet({ seo: mergedSeo })}
      <div
        className={`${styles.productDescWrapper} basePageContainer margin0auto`}
      >

  {page?.value === "product-description" && (
          <SectionRenderer
            sections={sections}
            fpi={fpi}
            globalConfig={globalConfig}
          />
        )}
        {page?.value === "product-description" && !hasStoreFinder && (
          <FindStore props={{
            heading: { value: "We're Closer Than You Think" },
            subheading: { value: "Eye test or frame trial? Drop by your nearest Vision Express." },
            inputPlaceholder: { value: "Enter Pincode" },
            buttonText: { value: "Find Stores" },
          }} />
        )}
      </div>
      {/* Note: Do not remove the below empty div, it is required to insert sticky add to cart at the bottom of the sections */}
      <div id="sticky-add-to-cart" className={styles.stickyAddToCart}></div>

       

    </>
  );
}

export const sections = JSON.stringify([
  {
    attributes: {
      page: "product-description",
    },
  },
]);

export default ProductDescription;
