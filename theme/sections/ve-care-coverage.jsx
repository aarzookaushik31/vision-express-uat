import React, { useState, useRef, useEffect } from "react";
import styles from "../styles/sections/ve-care-coverage.less";
import placeholderIcon from "../assets/images/glass-lens.png";

export function Component(input = {}) {
  const props = (input && (input.props ?? input)) || {};
  const blocks = (input && input.blocks) || [];

  const {
    headingPrefix,
    headingHighlight,
    coveredLabel,
    helperText,
    backgroundColor
  } = props || {};

  const [selectedIndexes, setSelectedIndexes] = useState(() => new Set([]));
  const [activeSlide, setActiveSlide] = useState(0);
const cardsRef = useRef(null);


  useEffect(() => {
  const container = cardsRef.current;

  if (!container) return;

  const handleScroll = () => {
    const slideWidth = container.clientWidth;
    const index = Math.round(container.scrollLeft / slideWidth);

    setActiveSlide(index);
  };

  container.addEventListener("scroll", handleScroll, { passive: true });

  return () => {
    container.removeEventListener("scroll", handleScroll);
  };
}, []);

  const handleSelect = (index) => {
    setSelectedIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };


  const goToSlide = (index) => {
  const container = cardsRef.current;

  if (!container) return;

  container.scrollTo({
    left: index * container.clientWidth,
    behavior: "smooth",
  });

  setActiveSlide(index);
};

  return (
    <section
      className={styles.veCareCoverage}
      style={{
        backgroundColor: backgroundColor?.value || "#0a0a0a"
      }}
    >
      <div className={styles.container}>
        {/* Header */}
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

    {blocks.length > 0 && (
  <div className={styles.cards} ref={cardsRef}>
    {blocks.map((block, index) => {
      const {
        title,
        defaultImage,
        coveredImage
      } = block.props || {};

      const isSelected = selectedIndexes.has(index);

      const imageSrc = isSelected
        ? coveredImage?.value || defaultImage?.value || placeholderIcon
        : defaultImage?.value || placeholderIcon;

      return (
        <button
          type="button"
          className={`${styles.card} ${
            isSelected ? styles.cardSelected : ""
          }`}
          key={block.id || index}
          onClick={() => handleSelect(index)}
          aria-pressed={isSelected}
        >
          <div className={styles.cardTopRow}>
            <span className={styles.radioCircle}>
              {isSelected && (
                <svg
                  width="18"
                  height="14"
                  viewBox="0 0 18 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16.7755 0.385747C16.2857 -0.128582 15.551 -0.128582 15.0612 0.385747L5.87755 10.0294L2.08163 6.04336C1.59184 5.52904 0.857143 5.52904 0.367347 6.04336C-0.122449 6.55769 -0.122449 7.32919 0.367347 7.84351L5.02041 12.7296C5.26531 12.9868 5.5102 13.1154 5.87755 13.1154C6.2449 13.1154 6.4898 12.9868 6.73469 12.7296L16.7755 2.1859C17.2653 1.67157 17.2653 0.900075 16.7755 0.385747Z"
                    fill="#E42313"
                  />
                </svg>
              )}
            </span>

            {isSelected && (
              <p className={styles.coveredLabel}>
                {coveredLabel?.value || "You're covered!"}
              </p>
            )}
          </div>

          <div className={styles.cardBody}>
            <div className={styles.cardTextBlock}>
              {title?.value && (
                <p className={styles.cardTitle}>
                  {title.value}
                </p>
              )}
            </div>

            <div className={styles.cardImageWrap}>
              <img
                src={imageSrc}
                alt={title?.value || "Coverage scenario"}
              />
            </div>
          </div>
        </button>
      );
    })}
  </div>
)}

{blocks.length > 1 && (
  <div className={styles.sliderDots}>
    {blocks.map((_, index) => (
      <button
        key={index}
        type="button"
        className={`${styles.sliderDot} ${
          activeSlide === index ? styles.sliderDotActive : ""
        }`}
        onClick={() => goToSlide(index)}
        aria-label={`Go to slide ${index + 1}`}
        aria-current={activeSlide === index ? "true" : undefined}
      />
    ))}
  </div>
)}

        {helperText?.value && (
          <p className={styles.helperText}>{helperText.value}</p>
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
      id: "headingPrefix",
      type: "text",
      label: "Heading (normal text)",
      default: "Has This"
    },
    {
      id: "headingHighlight",
      type: "text",
      label: "Heading (highlighted text)",
      default: "Ever Happened?"
    },
    {
      id: "coveredLabel",
      type: "text",
      label: "Selected State Label",
      default: "You're covered!"
    },
    {
      id: "helperText",
      type: "text",
      label: "Helper Text Below Cards",
      default: "Select the options above to check if you're covered or not."
    },
    {
      id: "backgroundColor",
      type: "color",
      label: "Background Color",
      default: "#0a0a0a"
    }
  ],
  blocks: [
    {
      type: "coverage_card",
      name: "Coverage Scenario Card",
      props: [
        {
          id: "title",
          type: "text",
          label: "Scenario Text",
          default: "My glasses slipped from my hands"
        },
        {
          id: "defaultImage",
          type: "image_picker",
          label: "Default Image (unselected)"
        },
        {
          id: "coveredImage",
          type: "image_picker",
          label: "Covered Image (selected / red state)"
        }
      ]
    }
  ],
  blockLimit: 6
};

Component.settings = settings;