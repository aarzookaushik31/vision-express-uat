import React from "react";
import styles from "../styles/sections/in-store-advantage.less";

export function Component({props, blocks} ) {
  const { heading,  primaryButtonText, primaryButtonLink, secondaryButtonText, secondaryButtonLink } = props;

  return (
    <section className={styles.inStoreAdvantageSection}>
      <div className={styles.container}>
        {heading?.value && <h2>{heading.value}</h2>}

        <div className={styles.cardsWrapper}>
          {blocks.length > 0  &&
            blocks.map((block, index) => {
              const { icon, title } = block?.props || {};
              return (
                <div key={index} className={styles.card}>
                  {icon?.value && <img src={icon.value} alt={title?.value || "advantage"} />}
                  {title?.value && <p>{title.value}</p>}
                </div>
              );
            })}
        </div>

        <div className={styles.buttonsWrapper}>
          {primaryButtonText?.value && (
            <a href={primaryButtonLink?.value || "#"} className={`${styles.button} ${styles.primary}`}>
              {primaryButtonText.value}
            </a>
          )}
          {secondaryButtonText?.value && (
            <a href={secondaryButtonLink?.value || "#"} className={`${styles.button} ${styles.secondary}`}>
              {secondaryButtonText.value}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

Component.displayName = "InStoreAdvantageComponent";

export default Component;

export const settings = {
  label: "In-Store Advantage Section",
  props: [
    {
      id: "heading",
      type: "text",
      label: "Heading",
      default: "THE IN-STORE ADVANTAGE"
    },
    {
      id: "primaryButtonText",
      type: "text",
      label: "Primary Button Text",
      default: "In-Store Eye Test"
    },
    {
      id: "primaryButtonLink",
      type: "url",
      label: "Primary Button Link",
      default: "#"
    },
    {
      id: "secondaryButtonText",
      type: "text",
      label: "Secondary Button Text",
      default: "Book a Home Test"
    },
    {
      id: "secondaryButtonLink",
      type: "url",
      label: "Secondary Button Link",
      default: "#"
    }
  ],
  blocks: [
    {
      type: "advantage",
      label: "Advantage Card",
      props: [
        {
          id: "icon",
          type: "image_picker",
          label: "Icon"
        },
        {
          id: "title",
          type: "text",
          label: "Title",
          default: "Certified Optometrists"
        }
      ]
    }
  ]
};

Component.settings = settings;
