import React from "react";
import styles from "../styles/sections/ve-care-coverage.less";

export function Component(input = {}) {
  const props = (input && (input.props ?? input)) || {};
  const blocks = (input && input.blocks) || [];

  const {
    logo,
    description,
    backgroundColor
  } = props || {};

  return (
    <section
      className={styles.veCareCoverage}
      style={{
        backgroundColor: backgroundColor?.value || "#ffffff"
      }}
    >
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logoBlock}>
            <span className={styles.bar} />
            {logo?.value && <img src={logo.value} alt="Ve-Care Logo" />}
          </div>

          {description?.value && (
            <p  dangerouslySetInnerHTML={{ __html: description.value }} className={styles.description} />
          )}
        </div>

        {/* Cards */}
        {blocks.length > 0 && (
          <div className={styles.cards}>
            {blocks.map((block, index) => {
              const {
                label,
                title,
                meta
              } = block.props || {};

              return (
                <div className={styles.card} key={index}>
                  {label?.value && (
                    <span className={styles.cardLabel}>
                      {label.value}
                    </span>
                  )}

                  {title?.value && (
                    <h3 className={styles.cardTitle}>
                      {title.value}
                    </h3>
                  )}

                  {meta?.value && (
                    <p className={styles.cardMeta}>
                      {meta.value}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

Component.displayName = "VeCareCoverage";
export default Component;


export const settings = {
  label: "Ve-Care Coverage Section",
  props: [
    {
      id: "logo",
      type: "image_picker",
      label: "Logo Image"
    },
    {
      id: "description",
      type: "textarea",
      label: "Description",
      default:
        "VE-CARE PROTECT is our premium eyewear protection plan designed to give you complete peace of mind long after your purchase."
    },
    {
      id: "backgroundColor",
      type: "color",
      label: "Background Color",
      default: "#ffffff"
    }
  ],
  blocks: [
    {
      type: "coverage_card",
      name: "Coverage Card",
      props: [
        {
          id: "label",
          type: "text",
          label: "Card Label",
          default: "1ST YEAR COVERAGE"
        },
        {
          id: "title",
          type: "text",
          label: "Card Title",
          default: "1 Free Replacement"
        },
        {
          id: "meta",
          type: "text",
          label: "Card Meta Text",
          default: "Lens | Frame | Complete pair"
        }
      ]
    }
  ]
};

Component.settings = settings;
