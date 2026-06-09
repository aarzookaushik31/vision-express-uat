import React, { useEffect, useState } from "react";
import { FDKLink } from "fdk-core/components";
import { useGlobalStore, useFPI } from "fdk-core/utils";

import ProductCard from "../components/product-card/product-card";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";

import styles from "../styles/sections/brand-featured-collection.less";

import placeholderBanner from "../assets/images/placeholder/featured-collection-banner.png";
import placeholderProduct from "../assets/images/placeholder/featured-collection-product.png";

import { FEATURED_COLLECTION } from "../queries/collectionsQuery";

export function Component({ props, globalConfig }) {
  const fpi = useFPI();

  const {
    heading,
    subheading,
    description,
    collection,
    button_text,
    show_view_all,
    padding_top,
    padding_bottom,
    header_position,
    image_position,
    text_alignment,
  } = props;

  const customValues = useGlobalStore(fpi?.getters?.CUSTOM_VALUE);
  const [isLoading, setIsLoading] = useState(true);

  const collectionData =
    customValues?.[`featuredCollectionData-${collection?.value}`]?.data;

  const products =
    collectionData?.collection?.products?.items?.slice(0, 2) || [];

  const bannerUrl =
    props.custom_banner?.value ||
    collectionData?.collection?.banners?.portrait?.url ||
    placeholderBanner;

  const slug = collectionData?.collection?.slug ?? "";

  useEffect(() => {
    if (collection?.value) {
      fpi.executeGQL(FEATURED_COLLECTION, {
        slug: collection.value,
        first: 20,
        pageNo: 1,
      }).then((res) => {
        setIsLoading(false);
        return fpi.custom.setValue(
          `featuredCollectionData-${collection.value}`,
          res
        );
      });
    }
  }, [collection]);

  const dynamicStyles = {
    paddingTop: `${padding_top?.value ?? 16}px`,
    paddingBottom: `${padding_bottom?.value ?? 16}px`,
  };

  const alignStyle = {
    textAlign: text_alignment?.value || "left",
    alignItems:
      text_alignment?.value === "center"
        ? "center"
        : text_alignment?.value === "right"
        ? "flex-end"
        : "flex-start",
  };

  const isImageLeft = image_position?.value === "left";

  return (
    <section className={styles.sectionWrapper} style={dynamicStyles}>
      
      {/* HEADER TOP */}
      {header_position?.value === "top" && (
        <div className={styles.headerBlock}>
          {heading?.value && <h2 className={styles.heading}>{heading.value}</h2>}
          {subheading?.value && (
            <p className={styles.subHeading}>{subheading.value}</p>
          )}
        </div>
      )}

      <div className={styles.customLayoutWrapper}>
        
        {/* IMAGE LEFT */}
        {isImageLeft && (
          <div className={styles.rightImage}>
            <FDKLink to={`/collection/${slug}`}>
              <FyImage
                globalConfig={globalConfig}
                src={bannerUrl}
                aspectRatio="0.8"
                mobileAspectRatio="0.8"
              />
            </FDKLink>
          </div>
        )}

        {/* CONTENT */}
        <div className={styles.leftContent} style={alignStyle}>
          
          {/* HEADER INSIDE */}
          {header_position?.value === "inside" && (
            <>
              {heading?.value && (
                <h2 className={styles.heading}>{heading.value}</h2>
              )}
              {subheading?.value && (
                <p className={styles.subHeading}>{subheading.value}</p>
              )}
            </>
          )}

          {description?.value && (
            <div className={styles.description}  dangerouslySetInnerHTML={{ __html: description?.value }} />
          )}

          {/* PRODUCTS */}
          <div className={styles.productGrid}>
            {products.length > 0 ? (
              products.map((product, index) => (
                <FDKLink key={index} action={product?.action}>
                  <ProductCard
                    product={product}
                    isImageFill={true}
                    imagePlaceholder={placeholderProduct}
                    aspectRatio={"1:1"}
                  />
                </FDKLink>
              ))
            ) : (
              <p>Loading products...</p>
            )}
          </div>

          {/* BUTTON */}
          {button_text?.value && show_view_all?.value && (
            <div
              style={{
                display: "flex",
                justifyContent:
                  text_alignment?.value === "center"
                    ? "center"
                    : text_alignment?.value === "right"
                    ? "flex-end"
                    : "flex-start",
              }}
            >
              <FDKLink to={`/collection/${slug}`}>
                <button className={styles.viewAllBtn}>
                  {button_text.value}
                </button>
              </FDKLink>
            </div>
          )}
        </div>

        {/* IMAGE RIGHT */}
        {!isImageLeft && (
          <div className={styles.rightImage}>
            <FDKLink to={`/collection/${slug}`}>
              <FyImage
                globalConfig={globalConfig}
                src={bannerUrl}
                aspectRatio="0.8"
                mobileAspectRatio="0.8"
              />
            </FDKLink>
          </div>
        )}
      </div>
    </section>
  );
}



export const settings = {
  label: "Brand Featured Collection",
  props: [
    {
      type: "collection",
      id: "collection",
      label: "Select Collection",
    },

    {
      type: "text",
      id: "heading",
      label: "Heading",
      default: "Discover Our Latest Collection",
    },
    {
      type: "text",
      id: "subheading",
      label: "Subheading",
      default: "New Spring-Summer 2025 eyewear collection",
    },
    {
      type: "select",
      id: "header_position",
      label: "Header Position",
      default: "inside",
      options: [
        { value: "top", text: "Above Section" },
        { value: "inside", text: "Above Description" },
      ],
    },

    {
      type: "textarea",
      id: "description",
      label: "Description",
      default:
        "Find your tribe. Share your vision. Discover eyewear crafted for every identity.",
    },

    {
      type: "select",
      id: "image_position",
      label: "Image Position",
      default: "right",
      options: [
        { value: "left", text: "Left" },
        { value: "right", text: "Right" },
      ],
    },

    {
      type: "text",
      id: "button_text",
      label: "Button Text",
      default: "View All",
    },
    {
      type: "checkbox",
      id: "show_view_all",
      label: "Show Button",
      default: true,
    },
    {
  id: "text_alignment",
  type: "select",
  label: "Text Alignment",
  default: "left",
  options: [
    { value: "left", text: "Left" },
    { value: "center", text: "Center" },
    { value: "right", text: "Right" },
  ],
},

    {
      type: "image_picker",
      id: "custom_banner",
      label: "Custom Banner Image",
      info: "Override collection banner",
    },

    {
      type: "range",
      id: "padding_top",
      min: 0,
      max: 100,
      step: 1,
      unit: "px",
      label: "Top Padding",
      default: 32,
    },
    {
      type: "range",
      id: "padding_bottom",
      min: 0,
      max: 100,
      step: 1,
      unit: "px",
      label: "Bottom Padding",
      default: 32,
    },
  ],
};