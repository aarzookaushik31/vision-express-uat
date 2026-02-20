import React, { useState } from "react";
import styles from "../styles/sections/ve-care-claim.less";
import arrow from "../assets/images/arrow-down-purple.png";

export function Component(input = {}) {
  const props = (input && (input.props ?? input)) || {};
  const blocks = (input && input.blocks) || [];

  const {
    heading,
    termsTitle,
    termsContent,
    backgroundColor
  } = props || {};

  const [open, setOpen] = useState(false);

  return (
    <section
      className={styles.veCareClaim}
      style={{
        backgroundColor: backgroundColor?.value || "#ffffff"
      }}
    >
      <div className={styles.container}>
        {/* Heading */}
        {heading?.value && (
          <h2 className={styles.heading}>{heading.value}</h2>
        )}

        {/* Steps */}
        {blocks.length > 0 && (
          <div className={styles.steps}>
            {blocks.map((block, index) => {
              const { icon, title, description } = block.props || {};

              return (
                <div className={styles.stepCard} key={index}>
                  {icon?.value && (
                    <div className={styles.iconWrapper}>
                      <img src={icon.value} alt={title?.value || "Step"} />
                    </div>
                  )}

                  {title?.value && (
                    <h3 className={styles.stepTitle}>{title.value}</h3>
                  )}

                  {description?.value && (
                    <p className={styles.stepDescription}>
                      {description.value}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Terms */}
        <div className={styles.terms}>
          <button
            className={styles.termsHeader}
            onClick={() => setOpen(!open)}
          >
            <span>{termsTitle?.value || "Terms & Conditions"}</span>
            <span
              className={`${styles.arrow} ${open ? styles.open : ""}`}
            >
              <img src={arrow} alt="arrow" />
            </span>
          </button>

          {open && (
            <div
              className={styles.termsContent}
              dangerouslySetInnerHTML={{
                __html: termsContent?.value || ""
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
}

Component.displayName = "VeCareClaim";
export default Component;


export const settings = {
  label: "How To Claim Section",
  props: [
    {
      id: "heading",
      type: "text",
      label: "Section Heading",
      default: "HOW TO CLAIM"
    },
    {
      id: "termsTitle",
      type: "text",
      label: "Terms Title",
      default: "Terms & Conditions"
    },
    {
      id: "termsContent",
      type: "textarea",
      label: "Terms Content (HTML allowed)",
      default:
        "<p>Ve-Care Protect is applicable only at Vision Express stores with a valid invoice.</p>"
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
      type: "claim_step",
      name: "Claim Step",
      props: [
        {
          id: "icon",
          type: "image_picker",
          label: "Step Icon"
        },
        {
          id: "title",
          type: "text",
          label: "Step Title",
          default: "Visit Nearest Store"
        },
        {
          id: "description",
          type: "text",
          label: "Step Description",
          default: "Walk into any Vision Express outlet."
        }
      ]
    }
  ]
};

Component.settings = settings;
