import React, { useState, useRef, useEffect } from "react";
import styles from "../styles/sections/ve-care-whats-covered.less";

export function Component(input = {}) {
  const props = (input && (input.props ?? input)) || {};
  const blocks = (input && input.blocks) || [];

  const { headingPrefix, headingHighlight, backgroundColor } = props || {};

  const [flippedIndexes, setFlippedIndexes] = useState(() => new Set([]));

  const [activeSlide, setActiveSlide] = useState(0);
const cardGridRef = useRef(null);

useEffect(() => {
  const container = cardGridRef.current;

  if (!container) return;

  const handleScroll = () => {
    const slideWidth = container.clientWidth;
    const index = Math.round(container.scrollLeft / slideWidth);

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

  container.scrollTo({
    left: index * container.clientWidth,
    behavior: "smooth"
  });

  setActiveSlide(index);
};

  const flipCard = (index) => {
    setFlippedIndexes((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  const unflipCard = (index) => {
    setFlippedIndexes((prev) => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
  };

  return (
    <section
      className={styles.whatsCovered}
      style={{ backgroundColor: backgroundColor?.value || "#0a0a0a" }}
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

        {blocks.length > 0 && (
          <div className={styles.cardGrid} ref={cardGridRef}>
            {blocks.map((block, index) => {
              const {
                frontImage,
                frontTitle,
                backEyebrow,
                backHeading,
                backDescription
              } = block.props || {};

              const isFlipped = flippedIndexes.has(index);

              return (
                <div className={styles.cardWrap} key={block.id || index}>
                  <div
                    className={`${styles.cardInner} ${
                      isFlipped ? styles.cardFlipped : ""
                    }`}
                  >
                    {/* FRONT */}
                    <div className={styles.cardFace}>
                      <div
                        className={styles.cardFrontImage}
                        style={{
                          backgroundImage: frontImage?.value
                            ? `url(${frontImage.value})`
                            : "none"
                        }}
                      >
                        <div className={styles.cardFrontOverlay} />
                        {frontTitle?.value && (
                          <p className={styles.cardFrontTitle}>
                            {frontTitle.value}
                          </p>
                        )}
                        <button
                          type="button"
                          className={styles.flipButton}
                          onClick={() => flipCard(index)}
                          aria-label={`Show details for ${
                            frontTitle?.value || "this coverage item"
                          }`}
                          aria-expanded={isFlipped}
                        >
                          <PlusIcon />
                        </button>
                      </div>
                    </div>

                    {/* BACK */}
                    <div className={`${styles.cardFace} ${styles.cardFaceBack}`}>
                      <div className={styles.cardBackContent}>
                        {backEyebrow?.value && (
                          <p className={styles.cardBackEyebrow}>
                            {backEyebrow.value}
                          </p>
                        )}
                        {backHeading?.value && (
                          <p className={styles.cardBackHeading}>
                            {backHeading.value}
                          </p>
                        )}
                        {backDescription?.value && (
                          <p className={styles.cardBackDescription}>
                            {backDescription.value}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        className={styles.flipButton}
                        onClick={() => unflipCard(index)}
                        aria-label={`Hide details for ${
                          frontTitle?.value || "this coverage item"
                        }`}
                        aria-expanded={isFlipped}
                      >
                        <MinusIcon />
                      </button>
                    </div>
                  </div>
                </div>
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

      </div>
    </section>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 1V15M1 8H15" stroke="#E42313" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 8H15" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

Component.displayName = "WhatsCovered";
export default Component;

export const settings = {
  label: "What's Covered Flip Cards",
  props: [
    {
      id: "headingPrefix",
      type: "text",
      label: "Heading (normal text)",
      default: "What's"
    },
    {
      id: "headingHighlight",
      type: "text",
      label: "Heading (highlighted text)",
      default: "covered?"
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
      type: "coverage_flip_card",
      name: "Coverage Card",
      props: [
        {
          id: "frontImage",
          type: "image_picker",
          label: "Front Image"
        },
        {
          id: "frontTitle",
          type: "text",
          label: "Front Title",
          default: "Scratched Lenses"
        },
        {
          id: "backEyebrow",
          type: "text",
          label: "Back Eyebrow Text",
          default: "Dropped your glasses?"
        },
        {
          id: "backHeading",
          type: "text",
          label: "Back Heading (highlighted)",
          default: "You're covered."
        },
        {
          id: "backDescription",
          type: "text",
          label: "Back Description",
          default: "Protection against life's unexpected moments."
        }
      ]
    }
  ],
  blockLimit: 6
};

Component.settings = settings;