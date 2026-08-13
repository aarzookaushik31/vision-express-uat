import React from "react";
import styles from "../styles/sections/ve-care-section.less";
import placeholderLogo from "../assets/images/ve-care-logo.png";

export function Component(input = {}) {
  const props = (input && (input.props ?? input)) || {};
  const blocks = input?.blocks || [];

  const {
    logoImage,
    logoSubtext,
    headingLine1,
    headingLine2,
    description,
    ctaText,
    ctaLink,
    backgroundGraphic,
    backgroundGraphicMobile,
    productImage,
    showPriceTag,
    priceLabel,
    priceValue,
    priceUnit,
    backgroundColor,
    overlapAmount
  } = props || {};

  return (
    <section
      className={styles.veCareSection}
      style={{
        backgroundColor: backgroundColor?.value || "#2a0505"
      }}
    >
      {backgroundGraphic?.value && (
        <div
          className={styles.glowBackground}
          style={{ backgroundImage: `url(${backgroundGraphic.value})` }}
        />
      )}

      {/* Mobile-specific background, editable from the module editor.
          Falls back to the desktop graphic if left empty, so nothing
          breaks for existing pages that haven't set this field yet. */}
      {(backgroundGraphicMobile?.value || backgroundGraphic?.value) && (
        <div
          className={styles.glowBackgroundMobile}
          style={{
            backgroundImage: `url(${
              backgroundGraphicMobile?.value || backgroundGraphic?.value
            })`
          }}
        />
      )}

      <div className={styles.heroContent}>
        <div className={styles.logoLockup}>
          <img
            src={logoImage?.value || placeholderLogo}
            alt="Ve-Care Protect"
            className={styles.logoImg}
          />
          {logoSubtext?.value && (
            <span className={styles.logoSubtext}>{logoSubtext.value}</span>
          )}
        </div>

        {(headingLine1?.value || headingLine2?.value) && (
          <h2 className={styles.heading}>
            {headingLine1?.value && <span>{headingLine1.value}</span>}
            {headingLine2?.value && (
              <span className={styles.headingBold}>{headingLine2.value}</span>
            )}
          </h2>
        )}

        {description?.value && (
          <p className={styles.description}>{description.value}</p>
        )}

        {ctaText?.value && (
          <a
            href={ctaLink?.value || "#"}
            className={styles.ctaButton}
            {...(ctaLink?.value ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            <span className={styles.playIcon}>&#9658;</span>
            {ctaText.value}
          </a>
        )}
      </div>

      {/* Product image sits in normal flow within the glow area,
          but overlaps out of the section via negative margin below */}
      <div
        className={styles.imageWrapper}
      >  
      </div>

      {blocks?.length > 0 && (
        <div className={styles.featureStripOuter}>
          <div className={styles.featureStrip}>
            {blocks.map((block, index) => {
              const blockProps = block?.props || {};
              return (
                <div className={styles.featureItem} key={block.id || index}>
                  {blockProps.icon?.value && (
                    <div className={styles.featureIconWrap}>
                      <img src={blockProps.icon.value} alt="" />
                    </div>
                  )}
                  <div className={styles.featureText}>
                    {blockProps.title?.value && (
                      <p className={styles.featureTitle}>
                        {blockProps.title.value}
                      </p>
                    )}
                    {blockProps.description?.value && (
                      <p className={styles.featureDescription}>
                        {blockProps.description.value}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

Component.displayName = "VeCareSection";
export default Component;

export const settings = {
  label: "Ve-Care Protection Section",
  props: [
    {
      id: "logoImage",
      type: "image_picker",
      label: "Ve-Care Logo"
    },
    {
      id: "logoSubtext",
      type: "text",
      label: "Logo Subtext",
      default: "Protect"
    },
    {
      id: "headingLine1",
      type: "text",
      label: "Heading Line 1",
      default: "Life Happens."
    },
    {
      id: "headingLine2",
      type: "text",
      label: "Heading Line 2 (bold)",
      default: "Your Glasses Stay Protected."
    },
    {
      id: "description",
      type: "textarea",
      label: "Description",
      default:
        "Protection against accidental damage and everyday wear for up to 3 years."
    },
    {
      id: "ctaText",
      type: "text",
      label: "CTA Button Text",
      default: "Watch Demo"
    },
    {
      id: "ctaLink",
      type: "url",
      label: "CTA Link (video URL)"
    },
    {
      id: "backgroundGraphic",
      type: "image_picker",
      label: "Background Glow / Shield Graphic (Desktop)"
    },
    {
      id: "backgroundGraphicMobile",
      type: "image_picker",
      label:
        "Background Glow / Shield Graphic (Mobile — optional, falls back to the desktop graphic if left empty)"
    },
    {
      id: "productImage",
      type: "image_picker",
      label: "Product Image"
    },
    {
      id: "overlapAmount",
      type: "range",
      label: "Image Overlap Below Section (px)",
      default: 120,
      min: 0,
      max: 250,
      step: 10
    },
    {
      id: "showPriceTag",
      type: "checkbox",
      label: "Show Price Tag",
      default: true
    },
    {
      id: "priceLabel",
      type: "text",
      label: "Price Tag Label",
      default: "Starting at just"
    },
    {
      id: "priceValue",
      type: "text",
      label: "Price Value",
      default: "₹299"
    },
    {
      id: "priceUnit",
      type: "text",
      label: "Price Unit",
      default: "/pair"
    },
    {
      id: "backgroundColor",
      type: "color",
      label: "Background Color",
      default: "#2a0505"
    }
  ],
  blocks: [
    {
      type: "feature",
      name: "Feature Item",
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
          default: "Transparent Coverage"
        },
        {
          id: "description",
          type: "text",
          label: "Description",
          default: "Know exactly what's covered and what's not"
        }
      ]
    }
  ],
  blockLimit: 4
};

Component.settings = settings;