import React from "react";
import styles from "../styles/sections/in-store-advantage.less";

const HIGHLIGHT_COLOR = "#9e007e";


const renderHeading = (text, highlight) => {
  const custom = typeof highlight === "string" ? highlight.trim() : "";
  const hl = custom || text.trim().split(/\s+/).pop();
  if (!hl) return text;

  let idx = text.toLowerCase().indexOf(hl.toLowerCase());
  let len = hl.length;
  if (idx === -1) {
    const last = text.trim().split(/\s+/).pop();
    idx = text.lastIndexOf(last);
    len = last.length;
    if (idx === -1) return text;
  }

  return (
    <>
      {text.slice(0, idx)}
      <span
        className={styles.highlight}
        style={{ color: HIGHLIGHT_COLOR }}
      >
        {text.slice(idx, idx + len)}
      </span>
      {text.slice(idx + len)}
    </>
  );
};

export function Component({ props, blocks = [] }) {
  const {
    heading,
    highlightText,
    primaryButtonText,
    primaryButtonLink,
    secondaryButtonText,
    secondaryButtonLink,
  } = props || {};

  return (
    <section className={styles.inStoreAdvantageSection}>
      <div className={styles.container}>
        {heading?.value && (
          <h2>{renderHeading(heading.value, highlightText?.value)}</h2>
        )}

        <div className={styles.cardsWrapper}>
          {blocks.length > 0 &&
            blocks.map((block, index) => {
              const { icon, title } = block?.props || {};
              return (
                <div key={index} className={styles.card}>
                  {icon?.value && (
                    <img src={icon.value} alt={title?.value || "advantage"} />
                  )}
                  {title?.value && <p>{title.value}</p>}
                </div>
              );
            })}
        </div>

        {(primaryButtonText?.value || secondaryButtonText?.value) && (
          <div className={styles.buttonsWrapper}>
            {primaryButtonText?.value && (
              <a
                href={primaryButtonLink?.value || "#"}
                className={`${styles.button} ${styles.primary}`}
              >
                {primaryButtonText.value}
              </a>
            )}
            {secondaryButtonText?.value && (
              <a
                href={secondaryButtonLink?.value || "#"}
                className={`${styles.button} ${styles.secondary}`}
              >
                {secondaryButtonText.value}
              </a>
            )}
          </div>
        )}
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
      default: "THE IN-STORE ADVANTAGE",
    },
    {
      id: "highlightText",
      type: "text",
      label: "Highlight Text (part of the heading shown in purple)",
      default: "ADVANTAGE",
    },
    {
      id: "primaryButtonText",
      type: "text",
      label: "Primary Button Text",
      default: "In-Store Eye Test",
    },
    {
      id: "primaryButtonLink",
      type: "url",
      label: "Primary Button Link",
      default: "#",
    },
    {
      id: "secondaryButtonText",
      type: "text",
      label: "Secondary Button Text",
      default: "Book a Home Test",
    },
    {
      id: "secondaryButtonLink",
      type: "url",
      label: "Secondary Button Link",
      default: "#",
    },
  ],
  blocks: [
    {
      type: "advantage",
      label: "Advantage Card",
      props: [
        {
          id: "icon",
          type: "image_picker",
          label: "Icon",
        },
        {
          id: "title",
          type: "text",
          label: "Title",
          default: "Certified Optometrists",
        },
      ],
    },
  ],
};

Component.settings = settings;