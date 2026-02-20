import React from "react";
import styles from "../styles/sections/ve-care-pricing.less";
import placeholderImage from "../assets/images/placeholder/slideshow-desktop2.jpg";

export function Component(input = {}) {
  const props = (input && (input.props ?? input)) || {};
  const blocks = (input && input.blocks) || [];

  const {
    heading,
    productImage,
    backgroundColor
  } = props || {};

  return (
    <section
      className={styles.veCarePricing}
      style={{
        backgroundColor: backgroundColor?.value || "#ffffff"
      }}
    >
      <div className={styles.container}>
        {/* Left */}
        <div className={styles.left}>
          {heading?.value && (
            <h2 className={styles.heading}>{heading.value}</h2>
          )}

          {blocks.length > 0 && (
            <div className={styles.cards}>
              {blocks.map((block, index) => {
                const {
                  plan,
                  price,
                  suffix,
                  description
                } = block.props || {};

                return (
                  <div className={styles.card} key={index}>
                    {plan?.value && (
                      <h4 className={styles.plan}>{plan.value}</h4>
                    )}

                    {price?.value && (
                      <div className={styles.priceRow}>
                        <span className={styles.price}>{price.value}</span>
                        {suffix?.value && (
                          <span className={styles.suffix}>
                            {suffix.value}
                          </span>
                        )}
                      </div>
                    )}

                    {description?.value && (
                      <p className={styles.description}>
                        {description.value}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right */}
        <div className={styles.right}>
          <img
            src={productImage?.value || placeholderImage}
            alt="Product"
          />
        </div>
      </div>
    </section>
  );
}

Component.displayName = "VeCarePricing";
export default Component;



export const settings = {
  label: "Ve-Care Pricing Section",
  props: [
    {
      id: "heading",
      type: "text",
      label: "Section Heading",
      default: "PRICING"
    },
    {
      id: "productImage",
      type: "image_picker",
      label: "Right Side Image"
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
      type: "pricing_card",
      name: "Pricing Card",
      props: [
        {
          id: "plan",
          type: "text",
          label: "Plan Name",
          default: "SINGLE VISION"
        },
        {
          id: "price",
          type: "text",
          label: "Price",
          default: "₹299"
        },
        {
          id: "suffix",
          type: "text",
          label: "Price Suffix",
          default: "/ PER PAIR"
        },
        {
          id: "description",
          type: "textarea",
          label: "Description",
          default: "Perfect for reading or distance glasses."
        }
      ]
    }
  ]
};

Component.settings = settings;
