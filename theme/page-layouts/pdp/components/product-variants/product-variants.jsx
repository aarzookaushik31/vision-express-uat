import React from "react";
import FyImage from "../../../../components/core/fy-image/fy-image";
import styles from "./product-variants.less";
import { isRunningOnClient } from "../../../../helper/utils";
import { FDKLink } from "fdk-core/components";
import { useGlobalTranslation } from "fdk-core/utils";
import CheckIcon from "../../../../assets/images/check.svg";

function ProductVariants({
  variants,
  product,
  currentSlug,
  globalConfig,
  preventRedirect = false,
  setSlug,
}) {
  const { t } = useGlobalTranslation("translation");
  const isProductSet = product?.is_set;

  const getProductLink = (item) => `/product/${item.slug}`;

const getImageURL = (item) => {
  if (!Array.isArray(item.medias)) return "";

  const found = item.medias.find((media) =>
    media?.url?.toLowerCase().includes("-99")
  );

  return found?.url || item.medias[item.medias.length - 1]?.url || "";
};

  /* =====================================
     🔥 ADDITIONAL SHADE IMAGE MATCHER
  ===================================== */

  const getAdditionalShadeImage = (variant) => {
    if (!product?.media?.length) return "";

    const variantValue = variant?.value?.toString().toLowerCase();
    if (!variantValue) return "";

    const matched = product.media.find((media) => {
      const fileName = media?.url?.split("/").pop()?.toLowerCase();

      return (
        fileName?.endsWith(`-${variantValue}.png`) ||
        fileName?.endsWith(`-${variantValue}.jpg`) ||
        fileName?.endsWith(`-${variantValue}.jpeg`)
      );
    });

    return matched?.url || "";
  };

  const isVariantSelected = (item) => {
    if (currentSlug) {
      return currentSlug?.includes(item.slug);
    } else if (isRunningOnClient()) {
      return window?.location?.pathname.includes(item.slug);
    }
    return false;
  };

const getSelectedVariantLabel = (item) => {
  const selectedVariant =
    item?.items?.find((variant) => isVariantSelected(variant)) || {};

  const selectedValue =
    selectedVariant?.color_name ||
    selectedVariant?.value ||
    selectedVariant?.name;

  if (!selectedValue) return "";

  const isReadingGlasses =
    item?.header?.toLowerCase() === "reading glasses";

  return {
    header: isReadingGlasses
      ? "SELECTED POWER"
      : item?.header?.toUpperCase(),
    value: selectedValue?.toUpperCase(),
  };
};

  return (
    <div className={styles.productVariants}>
      {variants?.map((item, type) => {
        const isAdditionalShades =
          item?.header?.toLowerCase()?.includes("additional");

        const shouldRenderAsImage =
          item.display_type === "image" || isAdditionalShades;


          const isReadingGlasses =
  item?.header?.toLowerCase() === "reading glasses";


        return (
          <div key={item.header + type} className={styles.variantWrapper}>
          {(() => {
  const label = getSelectedVariantLabel(item);
  if (!label) return null;

  return (
    <div className={styles.variantTitle}>
      <span className={styles.variantHeader}>
        {label.header}:
      </span>
      <span className={styles.variantValue}>
        {label.value}
      </span>
    </div>
  );
})()}







 {isReadingGlasses && (
      <select
        className={styles.variantDropdown}
        value={
          item?.items?.find((v) => isVariantSelected(v))?.slug || ""
        }
        onChange={(e) => {
          const selectedSlug = e.target.value;
          if (!selectedSlug) return;

          if (!preventRedirect) {
            window.location.href = `/product/${selectedSlug}`;
          } else {
            setSlug(selectedSlug);
          }
        }}
      >
        {item?.items?.map((variant) => (
          <option
            key={variant.slug}
            value={variant.slug}
            disabled={!variant.is_available}
          >
            {variant?.value}
          </option>
        ))}
      </select>
    ) }







            {/* ================= IMAGE VARIANTS ================= */}
            {shouldRenderAsImage && !isReadingGlasses && (
              <div className={styles.variantContainer}>
                {item?.items?.map((variant, index) => {
                  const imageURL =
                    getImageURL(variant) ||
                    getAdditionalShadeImage(variant);

                  return (
                    <div
                      key={variant.slug + index}
                      className={`${styles.variantItemImage} ${
                        isVariantSelected(variant)
                          ? styles.selected
                          : ""
                      } ${!variant.is_available ? styles.unavailable : ""}`}
                    >
                     {!preventRedirect ? (
  <FDKLink to={getProductLink(variant)}>
    <img
      src={imageURL}
      alt={variant?.name || ""}
      className={styles.variantImg}
    />
  </FDKLink>
) : (
  <div onClick={() => setSlug(variant?.slug)}>
    <img
      src={imageURL}
      alt={variant?.name || ""}
      className={styles.variantImg}
    />
  </div>
)}

                      <div
                        className={
                          isVariantSelected(variant)
                            ? styles.selectedOverlay
                            : styles.overlay
                        }
                      />

                      {isVariantSelected(variant) && (
                        <CheckIcon className={styles.selectedIcon} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ================= COLOR VARIANTS ================= */}
            {item.display_type === "color" && !shouldRenderAsImage &&  !isReadingGlasses && (
              <div className={styles.variantContainer}>
                {item?.items?.map((variant) => (
                  <div
                    key={variant.slug}
                    className={`${styles.variantItemColor} ${
                      isVariantSelected(variant) ? styles.selected : ""
                    }`}
                  >
                    <FDKLink
                      to={getProductLink(variant)}
                      title={variant.color_name}
                    >
                      <div
                        style={{
                          background: `#${variant.color}`,
                        }}
                        className={`${styles.color} ${
                          isVariantSelected(variant) ? styles.selected : ""
                        } ${!variant.is_available ? styles.unavailable : ""}`}
                      >
                        <div
                          className={
                            isVariantSelected(variant)
                              ? styles.selectedOverlay
                              : styles.overlay
                          }
                        />
                        <CheckIcon className={styles.selectedIcon} />
                      </div>
                    </FDKLink>
                  </div>
                ))}
              </div>
            )}

            {/* ================= TEXT VARIANTS ================= */}
            {item.display_type === "text" && !shouldRenderAsImage && !isReadingGlasses && (
              <div className={styles.variantContainer}>
                {item?.items?.map((variant, index) => (
                  <div
                    key={variant.slug + index}
                    className={`${styles.variantItemText} b2 ${
                      isVariantSelected(variant) ? styles.selected : ""
                    } ${!variant.is_available ? styles.unavailable : ""}`}
                  >
                    {!preventRedirect ? (
                      <FDKLink to={getProductLink(variant)}>
                        <div>{variant?.value}</div>
                      </FDKLink>
                    ) : (
                      <div onClick={() => setSlug(variant?.slug)}>
                        {variant?.value}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ProductVariants;