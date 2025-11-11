import React from "react";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import styles from "../styles/sections/icon-text-list.less";

export function Component({ blocks }) {
  const isHome =
    typeof window !== "undefined" && window.location.pathname === "/";

  return (
    <section
      className={`${styles.iconListSection} ${
        isHome ? styles.iconListSectionHome : styles.iconListSectioncontainer
      }`}
    >
      <div className={styles.grid}>
        {(blocks || []).map((block, index) => {
          const props = block?.props || {};

          return (
            <div key={index} className={styles.iconItem}>
              {props.image?.value && (
                <div className={styles.listIcon}>
                  <FyImage
                    src={props.image.value}
                    alt={props.title?.value || "Icon"}
                  />
                </div>
              )}

              <div>
                {props.title?.value && (
                  <h3
                    className={styles.title}
                    dangerouslySetInnerHTML={{ __html: props.title.value }}
                  />
                )}

                {props.description?.value && (
                  <p
                    className={styles.text}
                    dangerouslySetInnerHTML={{ __html: props.description.value }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

Component.displayName = "IconTextList";
export default Component; 

export const settings = {
  label: "Icon List Section",
  blocks: [
    {
      type: "list_item",
      name: "Icon Item",
      props: [
        {
          type: "image_picker",
          id: "image",
          label: "Icon Image (50x50)",
        },
        {
          type: "text",
          id: "title",
          label: "Heading",
          default: "100+",
        },
        {
          type: "text",
          id: "description",
          label: "Text",
          default: "Stores in India & 550+ Global Stores ",
        },
      ],
    },
  ],
};

Component.settings = settings;
