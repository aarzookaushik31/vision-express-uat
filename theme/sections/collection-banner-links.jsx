import React from "react";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import styles from "../styles/sections/collection-banner-links.less";

export function Component({ blocks = [] }) {
  return (
    <section className={styles.infoBlocksSection}>
      {blocks.length > 0 &&
        blocks.map((block, index) => {
          const bProps = block?.props || {};
          return (
            <a
              key={block?.uid || index}
              href={bProps.link?.value || "#"}
              className={styles.block}
              style={{
                backgroundImage: bProps.background?.value
                  ? `url(${bProps.background.value})`
                  : "none",
              }}
            >
              <div className={styles.content}>
                {bProps.heading?.value && <h2>{bProps.heading.value}</h2>}
                {bProps.description?.value && (
                  <p>{bProps.description.value}</p>
                )}
              </div>
              {bProps.arrow_icon?.value && (
                <div className={styles.arrow}>
                  <FyImage
                    src={bProps.arrow_icon.value}
                    alt="Arrow Icon"
                    className={styles.arrowIcon}
                  />
                </div>
              )}
            </a>
          );
        })}
    </section>
  );
}

export const settings = {
  label: "Collection Banner Links",
  blocks: [
    {
      type: "block",
      name: "Block",
      props: [
        {
          type: "image_picker",
          id: "background",
          label: "Background Image",
        },
        {
          type: "text",
          id: "heading",
          label: "Heading",
          default: "Block Heading",
        },
        {
          type: "text",
          id: "description",
          label: "Paragraph Text",
          default: "This is a short description for the block.",
        },
        {
          type: "image_picker",
          id: "arrow_icon",
          label: "Arrow Icon Image",
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
