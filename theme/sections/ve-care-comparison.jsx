import React from "react";
import styles from "../styles/sections/ve-care-comparison.less";

export function Component(input = {}) {
  const props = (input && (input.props ?? input)) || {};
  const blocks = (input && input.blocks) || [];

  const {
    headingPrefix,
    headingHighlight,
    withoutLogoImage,
    withLogoImage,
    withoutTitle,
    withTitle,
    withoutBackgroundColor,
    withBackgroundColor,
    withoutWatermarkImage,
    withWatermarkImage,
    backgroundColor
  } = props || {};

  const withoutItems = blocks.filter(
    (block) => (block.props?.column?.value || "without") === "without"
  );
  const withItems = blocks.filter(
    (block) => block.props?.column?.value === "with"
  );

  return (
    <section
      className={styles.veCareComparison}
      style={{
        backgroundColor: backgroundColor?.value || "#0a0a0a"
      }}
    >
      <div className={styles.container}>
        {(headingPrefix?.value || headingHighlight?.value) && (
          <h2 className={styles.heading}>
            {headingPrefix?.value && <span>{headingPrefix.value} </span>}
            {headingHighlight?.value && (
              <span className={styles.headingHighlight}>
                {headingHighlight.value}
              </span>
            )}
          </h2>
        )}

        <div className={styles.cardsRow}>
          {/* Without Ve-Care */}
          <div
            className={`${styles.card} ${styles.cardWithout}`}
            style={{
              backgroundColor: withoutBackgroundColor?.value || "#ffffff",
              backgroundImage: withoutWatermarkImage?.value
                ? `url(${withoutWatermarkImage.value})`
                : "none"
            }}
          >
            <div className={styles.cardTitleBlock}>
              <p className={styles.cardTitle}>
                {withoutTitle?.value || "Without"}{" "}
                {withoutLogoImage?.value && (
                  <span className={styles.brandMark}>
                    <img src={withoutLogoImage.value} alt="Ve-Care" />
                  </span>
                )}
              </p>
            </div>

            <ul className={styles.itemList}>
              {withoutItems.map((block, index) => (
                <li className={styles.item} key={block.id || index}>
                  <span className={`${styles.iconCircle} ${styles.iconCross}`}>
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.6532 9.00341C11.1093 9.45971 11.1093 10.1969 10.6532 10.6532C10.4257 10.8807 10.1271 10.995 9.82821 10.995C9.52956 10.995 9.23092 10.8807 9.00341 10.6532L5.49764 7.14724L1.99187 10.6532C1.76437 10.8807 1.46572 10.995 1.16708 10.995C0.868217 10.995 0.569572 10.8807 0.342064 10.6532C-0.114021 10.1969 -0.114021 9.45971 0.342064 9.00341L3.84805 5.49764L0.342064 1.99187C-0.114021 1.53558 -0.114021 0.798363 0.342064 0.342064C0.798363 -0.114021 1.53558 -0.114021 1.99187 0.342064L5.49764 3.84805L9.00341 0.342064C9.45971 -0.114021 10.1969 -0.114021 10.6532 0.342064C11.1093 0.798363 11.1093 1.53558 10.6532 1.99187L7.14724 5.49764L10.6532 9.00341Z" fill="#E42312"/>
</svg>

                  </span>
                  <span>{block.props?.text?.value}</span>
                </li>
              ))}
            </ul>
          </div>


            <div className={styles.vsDivider}>
    <span>VS</span>
  </div>


          {/* With Ve-Care */}
          <div
            className={`${styles.card} ${styles.cardWith}`}
            style={{
              backgroundColor: withBackgroundColor?.value || "#e02020",
              backgroundImage: withWatermarkImage?.value
                ? `url(${withWatermarkImage.value})`
                : "none"
            }}
          >
            <div className={styles.cardTitleBlock}>
              <p className={styles.cardTitle}>
                {withTitle?.value || "With"}{" "}
                {withLogoImage?.value && (
                  <span className={styles.brandMark}>
                    <img src={withLogoImage.value} alt="Ve-Care" />
                  </span>
                )}
              </p>
            </div>

            <ul className={styles.itemList}>
              {withItems.map((block, index) => (
                <li className={styles.item} key={block.id || index}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14 0.5C21.4545 0.5 27.5 6.54551 27.5 14C27.5 21.4545 21.4545 27.5 14 27.5C6.54551 27.5 0.5 21.4545 0.5 14C0.500001 6.54551 6.54552 0.5 14 0.5ZM20.6885 9.04883C19.9092 8.26969 18.6397 8.26972 17.8604 9.04883L12.2031 14.7061L10.1396 12.6426C9.36512 11.8675 8.09164 11.8626 7.31152 12.6426C6.53243 13.4221 6.53262 14.6913 7.31152 15.4707L10.7227 18.8828V18.8838C10.743 18.9061 10.7647 18.9287 10.7871 18.9512C11.5666 19.7306 12.8369 19.7294 13.6152 18.9512L20.6885 11.8779C21.4669 11.0995 21.4682 9.82836 20.6885 9.04883Z" fill="white" stroke="white"/>
</svg>

                  <span>{block.props?.text?.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

Component.displayName = "VeCareComparison";
export default Component;

export const settings = {
  label: "How Ve-Care Works Section",
  props: [
    {
      id: "headingPrefix",
      type: "text",
      label: "Heading (normal text)",
      default: "How VeCare"
    },
    {
      id: "headingHighlight",
      type: "text",
      label: "Heading (highlighted text)",
      default: "Works?"
    },
    {
      id: "withoutLogoImage",
      type: "image_picker",
      label: "Left Card Logo (Without Ve-Care)"
    },
    {
      id: "withLogoImage",
      type: "image_picker",
      label: "Right Card Logo (With Ve-Care)"
    },
    {
      id: "withoutTitle",
      type: "text",
      label: "Left Card Prefix Text",
      default: "Without"
    },
    {
      id: "withTitle",
      type: "text",
      label: "Right Card Prefix Text",
      default: "With"
    },
    {
      id: "withoutBackgroundColor",
      type: "color",
      label: "Left Card Background Color",
      default: "#ffffff"
    },
    {
      id: "withBackgroundColor",
      type: "color",
      label: "Right Card Background Color",
      default: "#E42312"
    },
    {
      id: "withoutWatermarkImage",
      type: "image_picker",
      label: "Left Card Watermark Background Image"
    },
    {
      id: "withWatermarkImage",
      type: "image_picker",
      label: "Right Card Watermark Background Image"
    },
    {
      id: "backgroundColor",
      type: "color",
      label: "Section Background Color",
      default: "#0a0a0a"
    }
  ],
  blocks: [
    {
      type: "comparison_item",
      name: "Comparison Item",
      props: [
        {
          id: "column",
          type: "select",
          label: "Column",
          default: "without",
          options: [
            { value: "without", label: "Without Ve-Care" },
            { value: "with", label: "With Ve-Care" }
          ]
        },
        {
          id: "text",
          type: "text",
          label: "Item Text",
          default: "Pay full replacement cost"
        }
      ]
    }
  ],
  blockLimit: 10
};

Component.settings = settings;