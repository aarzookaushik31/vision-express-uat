import React from "react";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import styles from "../styles/sections/filter-category-tabs.less";

export function Component({ props, blocks }) {
  const heading = props?.heading;

  return (
    <section className={styles.filteredCategorySection}>
      <div className={styles["header-row"]}>
        {heading?.value && <h2>{heading.value}</h2>}
      </div>

      <div className={styles["item-grid"]}>
        {(blocks || []).map((block, index) => {
          const bProps = block?.props || {};
          const image = bProps.image?.value;
          const hoverImage = bProps.hoverImage?.value;
          const title = bProps.title?.value || "Untitled";
          const link = bProps.link?.value || "#";

          return (
            <div key={index} className={styles.item}>
              <a href={link}>
                <div className={styles.imageWrapper}>
                  {image && (
                    <div className={styles.mainImage}>
                      <FyImage src={image} alt={title} />
                    </div>
                  )}
                  {hoverImage && (
                    <div className={styles.hoverImage}>
                      <FyImage src={hoverImage} alt="Hover" />
                    </div>
                  )}
                </div>
                <h4>{title}</h4>
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}

Component.displayName = "FilteredCategoryTabs";

export const settings = {
  label: "Filtered Category with Tabs",
  props: [
    {
      type: "text",
      id: "heading",
      default: "Explore Our Collections",
      label: "Section Heading",
    },
  ],
  blocks: [
    {
      type: "list_item",
      name: "List Item",
      props: [
        {
          type: "text",
          id: "title",
          label: "Item Title",
          default: "Sample Item",
        },
        {
          type: "image_picker",
          id: "image",
          label: "Item Image",
        },
        {
          type: "image_picker",
          id: "hoverImage",
          label: "Hover Image",
        },
        {
          type: "url",
          id: "link",
          label: "Item Link",
        },
      ],
    },
  ],
};

Component.settings = settings;
export default Component;
