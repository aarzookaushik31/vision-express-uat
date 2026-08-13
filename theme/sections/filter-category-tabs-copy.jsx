import React from "react";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import styles from "../styles/sections/filter-category-tabs-new.less";

// Groups a flat block list into category groups based on consecutive
// blocks sharing the same groupTitle. Order in the theme editor matters:
// all blocks for "Eyeglasses" should be added together before switching
// to "Sunglasses", etc.
function groupBlocks(blocks) {
  const groups = [];
  let current = null;

  (blocks || []).forEach((block) => {
    const bProps = block?.props || {};
    const groupTitle = bProps.groupTitle?.value || "Untitled Category";
    const groupLink = bProps.groupLink?.value || "#";

    if (!current || current.title !== groupTitle) {
      current = { title: groupTitle, link: groupLink, items: [] };
      groups.push(current);
    }

    current.items.push({
      title: bProps.title?.value || "Untitled",
      image: bProps.image?.value,
      hoverImage: bProps.hoverImage?.value,
      link: bProps.link?.value || "#",
    });
  });

  return groups;
}

export function Component({ props, blocks }) {
  const heading = props?.heading;
  const groups = groupBlocks(blocks);

  return (
    <section className={styles.filteredCategorySection}>
      <div className={styles["header-row"]}>
        {heading?.value && <h2>{heading.value}</h2>}
      </div>

      {/* MOBILE: stacked sections, each with its own heading + row */}
      <div className={styles["mobile-layout"]}>
        {groups.map((group, gIndex) => (
          <div key={gIndex} className={styles["group-block"]}>
            <h3 className={styles["group-heading"]}>{group.title}</h3>
            <div className={styles["item-row"]}>
              {group.items.map((item, iIndex) => (
                <a key={iIndex} href={item.link} className={styles.item}>
                  <div className={styles.imageWrapper}>
                    {item.image && (
                      <div className={styles.mainImage}>
                        <FyImage src={item.image} alt={item.title} />
                      </div>
                    )}
                    {item.hoverImage && (
                      <div className={styles.hoverImage}>
                        <FyImage src={item.hoverImage} alt="Hover" />
                      </div>
                    )}
                  </div>
                  <h4>{item.title}</h4>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP: single horizontal scroll strip, category pill inline */}
      <div className={styles["desktop-layout"]}>
        {groups.map((group, gIndex) => (
          <React.Fragment key={gIndex}>
            <a href={group.link} className={styles["group-pill"]}>
              <span className={styles["group-pill-icon"]} aria-hidden="true" />
              <span>{group.title}</span>
            </a>
            {group.items.map((item, iIndex) => (
              <a
                key={iIndex}
                href={item.link}
                className={styles.item}
              >
                <div className={styles.imageWrapper}>
                  {item.image && (
                    <div className={styles.mainImage}>
                      <img src={item.image} alt={item.title} />
                    </div>
                  )}
                  {item.hoverImage && (
                    <div className={styles.hoverImage}>
                      <img src={item.hoverImage} alt="Hover" />
                    </div>
                  )}
                </div>
                <h4>{item.title}</h4>
              </a>
            ))}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

Component.displayName = "FilteredCategoryTabs";

export const settings = {
  label: "Filtered Category with Tabs New",
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
          id: "groupTitle",
          label: "Category Group (e.g. Eyeglasses)",
          default: "Eyeglasses",
          info: "Blocks with the same value here are grouped together. Add all items for one category consecutively before starting the next.",
        },
        {
          type: "url",
          id: "groupLink",
          label: "Category Group Link",
        },
        {
          type: "text",
          id: "title",
          label: "Item Title (e.g. Men)",
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