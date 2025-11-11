import React from "react";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import styles from "../styles/sections/lens-comparison.less";

export function Component({ blocks }) {
  const blocksData = blocks?.length ? blocks : [];

  return (
    <section className={styles.comparisonSection}>
      <div className={styles.cardsWrapper}>
        {blocksData.map((block, index) => {
          const badgeText = block?.props?.badge_text?.value;
          const badgeLogo = block?.props?.badge_logo?.value;
          const headingText = block?.props?.heading?.value;
          const headingLogo = block?.props?.heading_logo?.value;

          return (
            <div className={styles.card} key={index}>
              <div className={styles.imageWrapper}>
                <FyImage
                  src={block?.props?.image?.value}
                  alt={headingText || "comparison-image"}
                  isFixedAspectRatio={false}
                />
              </div>
              <div className={styles.cardFooter}>
                <div className={styles.badge}>
                  {badgeText ? (
                    <span>{badgeText}</span>
                  ) : (
                    badgeLogo && <img src={badgeLogo} alt="badge-logo" />
                  )}
                </div>
                <div className={styles.heading}>
                  {headingText ? (
                    <span>{headingText}</span>
                  ) : (
                    headingLogo && (
                      <img src={headingLogo} alt="heading-logo" />
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export const settings = {
  label: "Lens Comparison",
  blocks: [
    {
      name: "Comparison Card",
      type: "gallery",
      props: [
        {
          type: "image_picker",
          id: "image",
          label: "Comparison Image",
        },
        {
          type: "text",
          id: "badge_text",
          label: "Badge Text",
          default: "Add text or logo",
        },
        {
          type: "image_picker",
          id: "badge_logo",
          label: "Badge Logo",
        },
        {
          type: "text",
          id: "heading",
          label: "Heading Text",
          default: "Add text or logo",
        },
        {
          type: "image_picker",
          id: "heading_logo",
          label: "Heading Logo",
        },
      ],
    },
  ],
  preset: {
    blocks: [
      {
        name: "Comparison Card",
        props: {
          badge_text: { value: "Add text or logo" },
          badge_logo: { value: "" },
          heading: { value: "Add text or logo" },
          heading_logo: { value: "" },
          image: { value: "" },
        },
      },
      {
        name: "Comparison Card",
        props: {
          badge_text: { value: "Add text or logo" },
          badge_logo: { value: "" },
          heading: { value: "" },
          heading_logo: { value: "/assets/images/vx-drivesure-logo.png" },
          image: { value: "" },
        },
      },
    ],
  },
};

export default Component;