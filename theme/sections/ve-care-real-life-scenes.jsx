import React, { useState, useRef, useEffect } from "react";
import styles from "../styles/sections/real-life-scenarios.less";

export function Component(input = {}) {
  const props = (input && (input.props ?? input)) || {};
  const blocks = (input && input.blocks) || [];

  const { heading, backgroundColor, coveredLabel } = props || {};

  const [activeSlide, setActiveSlide] = useState(0);
  const cardGridRef = useRef(null);

  useEffect(() => {
    const container = cardGridRef.current;

    if (!container) return;

    const handleScroll = () => {
      const slide = container.querySelector("[data-slide]");

      if (!slide) return;

      const slideWidth = slide.getBoundingClientRect().width;
      const gap =
        parseFloat(getComputedStyle(container).gap) || 0;

      const index = Math.round(
        container.scrollLeft / (slideWidth + gap)
      );

      setActiveSlide(index);
    };

    container.addEventListener("scroll", handleScroll, {
      passive: true
    });

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const goToSlide = (index) => {
    const container = cardGridRef.current;

    if (!container) return;

    const slide = container.querySelector("[data-slide]");

    if (!slide) return;

    const slideWidth = slide.getBoundingClientRect().width;
    const gap =
      parseFloat(getComputedStyle(container).gap) || 0;

    container.scrollTo({
      left: index * (slideWidth + gap),
      behavior: "smooth"
    });

    setActiveSlide(index);
  };

  return (
    <section
      className={styles.realLifeScenarios}
      style={{
        backgroundColor: backgroundColor?.value || "#E42313"
      }}
    >
      <div className={styles.container}>
        {heading?.value && (
          <h2 className={styles.heading}>
            {heading.value}
          </h2>
        )}

        {blocks.length > 0 && (
          <>
            <div
              className={styles.cardGrid}
              ref={cardGridRef}
            >
              {blocks.map((block, index) => {
                const {
                  image,
                  title,
                  description
                } = block.props || {};

                return (
                  <div
                    className={styles.card}
                    key={block.id || index}
                    data-slide
                  >
                    <div
                      className={styles.cardImage}
                      style={{
                        backgroundImage: image?.value
                          ? `url(${image.value})`
                          : "none"
                      }}
                    >
                      <div className={styles.cardOverlay} />

                      <div className={styles.cardContent}>
                        {title?.value && (
                          <p className={styles.cardTitle}>
                            {title.value}
                          </p>
                        )}

                        {description?.value && (
                          <p className={styles.cardDescription}>
                            {description.value}
                          </p>
                        )}

                        <div className={styles.cardBadge}>
                          <span className={styles.badgeIcon}>
                            <CheckIcon />
                          </span>

                          <span className={styles.badgeLabel}>
                            {coveredLabel?.value || "Covered!"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile dots */}
            {blocks.length > 1 && (
              <div className={styles.sliderDots}>
                {blocks.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`${styles.sliderDot} ${
                      activeSlide === index
                        ? styles.sliderDotActive
                        : ""
                    }`}
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={
                      activeSlide === index
                        ? "true"
                        : undefined
                    }
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg
      width="10"
      height="8"
      viewBox="0 0 14 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13 1L4.75 9.5L1 5.6"
        stroke="#000"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

Component.displayName = "RealLifeScenarios";
export default Component;

export const settings = {
  label: "Real-Life Scenarios",
  props: [
    {
      id: "heading",
      type: "text",
      label: "Heading",
      default: "Real-Life Scenarios"
    },
    {
      id: "coveredLabel",
      type: "text",
      label: "Badge Label",
      default: "Covered!"
    },
    {
      id: "backgroundColor",
      type: "color",
      label: "Background Color",
      default: "#E42313"
    }
  ],
  blocks: [
    {
      type: "scenario_card",
      name: "Scenario Card",
      props: [
        {
          id: "image",
          type: "image_picker",
          label: "Image"
        },
        {
          id: "title",
          type: "text",
          label: "Title",
          default: "For Parents"
        },
        {
          id: "description",
          type: "text",
          label: "Description",
          default: "My kids accidently broke my glasses?"
        }
      ]
    }
  ],
  blockLimit: 6
};

Component.settings = settings;