import React from "react";
import styles from "../styles/sections/ve-care-journey.less";

export function Component(input = {}) {
  const props = (input && (input.props ?? input)) || {};
  const blocks = (input && input.blocks) || [];

  const {
    heading,
    circleColor,
    backgroundColor
  } = props || {};

  return (
    <section
      className={styles.veCareJourney}
      style={{
        backgroundColor: backgroundColor?.value || "#e02020"
      }}
    >
      <div className={styles.container}>
        {heading?.value && (
          <h2 className={styles.heading}>{heading.value}</h2>
        )}

        {blocks.length > 0 && (
          <div className={styles.timeline}>
            {blocks.map((block, index) => {
              const { icon, label } = block.props || {};
              const isLast = index === blocks.length - 1;
              const isEven = index % 2 === 0;

              return (
                <React.Fragment key={block.id || index}>
                  <div
                    className={`${styles.step} ${
                      isEven ? styles.stepLeft : styles.stepRight
                    }`}
                  >
                    <div
                      className={styles.stepCircle}
                      style={{
                        backgroundColor: circleColor?.value || "#6b0f0f"
                      }}
                    >
                      {icon?.value && (
                        <img src={icon.value} alt={label?.value || "Step icon"} />
                      )}
                    </div>
                    {label?.value && (
                      <p className={styles.stepLabel}>{label.value}</p>
                    )}
                  </div>

                  {!isLast && (
                    <div className={styles.connector}>
                      <span className={styles.connectorLine} />
                      <span className={styles.connectorArrow} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

Component.displayName = "VeCareJourney";
export default Component;

export const settings = {
  label: "Ve-Care Protection Journey Section",
  props: [
    {
      id: "heading",
      type: "text",
      label: "Heading",
      default: "Your Protection Journey"
    },
    {
      id: "circleColor",
      type: "color",
      label: "Step Circle Color",
      default: "#6b0f0f"
    },
    {
      id: "backgroundColor",
      type: "color",
      label: "Background Color",
      default: "#e02020"
    }
  ],
  blocks: [
    {
      type: "journey_step",
      name: "Journey Step",
      props: [
        {
          id: "icon",
          type: "image_picker",
          label: "Step Icon"
        },
        {
          id: "label",
          type: "text",
          label: "Step Label",
          default: "Purchase Glasses"
        }
      ]
    }
  ],
  blockLimit: 8
};

Component.settings = settings;