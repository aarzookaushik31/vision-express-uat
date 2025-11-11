import React from "react";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import styles from "../styles/sections/shop-by-category-grid.less";

export function Component({ props = {}, blocks = [] }) {
  return (
    <section className={styles.shopCategorySection}>
      {props.heading?.value && (
        <h2 className={styles.heading}>{props.heading.value}</h2>
      )}

      <div className={styles.grid}>
        {blocks.map((block, index) => {
          const bProps = block?.props || {};
          return (
            <a
              key={block?.uid || index}
              href={bProps.link?.value || "#"}
              className={`${styles.gridItem} ${styles[`item${index + 1}`]}`}
            >
              <div className={styles.imageContainer}>
                {bProps.image?.value && (
                  <FyImage
                    src={bProps.image.value}
                    alt={bProps.title?.value || "Category"}
                    className={styles.image}
                  />
                )}
              </div>
              <div className={styles.overlay}>
                {bProps.title?.value && <h3>{bProps.title.value}</h3>}
                {bProps.description?.value && <p>{bProps.description.value}</p>}
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

export const settings = {
  label: "Shop by Category Grid",
  props: [
    {
      type: "text",
      id: "heading",
      label: "Section Heading",
      default: "Shop by Category",
    },
  ],
  blocks: [
    {
      type: "block",
      name: "Category Block",
      props: [
        {
          type: "image_picker",
          id: "image",
          label: "Category Image",
        },
        {
          type: "text",
          id: "title",
          label: "Category Title",
          default: "Category Name",
        },
        {
          type: "text",
          id: "description",
          label: "Category Description",
          default: "Starting at ₹2,999 →",
        },
        {
          type: "url",
          id: "link",
          label: "Link URL",
        },
      ],
    },
  ],
};

Component.settings = settings;
export default Component;
