import React, { useState, useRef, useEffect } from "react";
import styles from "../styles/sections/ve-care-testimonials.less";

export function Component(input = {}) {
  const props = (input && (input.props ?? input)) || {};
  const blocks = (input && input.blocks) || [];

  const {
    headingPrefix,
    headingHighlight,
    backgroundColor
  } = props || {};

  const [activeSlide, setActiveSlide] = useState(0);
  const sliderRef = useRef(null);

  const totalSlides = blocks.length;

  const getSlideWidth = () => {
    const container = sliderRef.current;

    if (!container) return 0;

    const slide = container.querySelector("[data-slide]");

    if (!slide) return 0;

    const slideWidth = slide.getBoundingClientRect().width;
    const gap =
      parseFloat(getComputedStyle(container).gap) || 0;

    return slideWidth + gap;
  };

  const goToSlide = (index) => {
    const container = sliderRef.current;

    if (!container) return;

    const slideWidth = getSlideWidth();

    container.scrollTo({
      left: index * slideWidth,
      behavior: "smooth"
    });

    setActiveSlide(index);
  };

  const goToPrevious = () => {
    if (!totalSlides) return;

    const previousIndex =
      activeSlide === 0
        ? totalSlides - 1
        : activeSlide - 1;

    goToSlide(previousIndex);
  };

  const goToNext = () => {
    if (!totalSlides) return;

    const nextIndex =
      activeSlide === totalSlides - 1
        ? 0
        : activeSlide + 1;

    goToSlide(nextIndex);
  };

  useEffect(() => {
    const container = sliderRef.current;

    if (!container) return;

    const handleScroll = () => {
      const slideWidth = getSlideWidth();

      if (!slideWidth) return;

      const index = Math.round(
        container.scrollLeft / slideWidth
      );

      setActiveSlide(
        Math.max(0, Math.min(index, totalSlides - 1))
      );
    };

    container.addEventListener("scroll", handleScroll, {
      passive: true
    });

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [totalSlides]);

  return (
    <section
      className={styles.testimonial}
      style={{
        backgroundColor:
          backgroundColor?.value || "#000"
      }}
    >
      <div className={styles.container}>

        {/* Heading */}
        {(headingPrefix?.value ||
          headingHighlight?.value) && (
          <h2 className={styles.heading}>
            {headingPrefix?.value && (
              <span>
                {headingPrefix.value}
              </span>
            )}

            {headingHighlight?.value && (
              <span
                className={styles.headingHighlight}
              >
                {headingHighlight.value}
              </span>
            )}
          </h2>
        )}

        {blocks.length > 0 && (
          <div className={styles.sliderWrapper}>

            {/* Previous button */}
            {blocks.length > 1 && (
              <button
                type="button"
                className={`${styles.sliderArrow} ${styles.sliderArrowPrev}`}
                onClick={goToPrevious}
                aria-label="Previous testimonial"
              >
                <ArrowLeftIcon />
              </button>
            )}

            {/* Slider */}
            <div
              className={styles.slider}
              ref={sliderRef}
            >
              {blocks.map((block, index) => {
                const {
                  testimonialText,
                  customerName
                } = block.props || {};

                return (
                  <article
                    className={styles.slide}
                    key={block.id || index}
                    data-slide
                  >
                    <div className={styles.quoteIcon}>
                      <QuoteIcon />
                    </div>

                    <div className={styles.testimonialContent}>
                      {testimonialText?.value && (
                        <p className={styles.testimonialText}>
                          {testimonialText.value}
                        </p>
                      )}

                      {customerName?.value && (
                        <p className={styles.customerName}>
                          {customerName.value}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Next button */}
            {blocks.length > 1 && (
              <button
                type="button"
                className={`${styles.sliderArrow} ${styles.sliderArrowNext}`}
                onClick={goToNext}
                aria-label="Next testimonial"
              >
                <ArrowRightIcon />
              </button>
            )}
          </div>
        )}

        {/* Dots */}
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
                aria-label={`Go to testimonial ${
                  index + 1
                }`}
                aria-current={
                  activeSlide === index
                    ? "true"
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------------- Icons ---------------- */

function QuoteIcon() {
  return (
 <svg width="48" height="43" viewBox="0 0 48 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M47.6539 43H28.4581V26.0442C28.4581 19.2618 29.9347 13.429 33.1564 8.68139C36.3781 4.0694 41.2106 1.08517 47.6539 0V8.95268C41.8817 10.7161 38.9285 15.1924 38.6601 22.2461H47.6539V43ZM19.1958 43H0V26.0442C0 19.2618 1.4766 13.429 4.69827 8.68139C7.91995 4.0694 12.7525 1.08517 19.1958 0V8.95268C13.4236 10.7161 10.4704 15.1924 10.202 22.2461H19.1958V43Z" fill="white" fill-opacity="0.2"/>
</svg>

  );
}

function ArrowLeftIcon() {
  return (
    <svg width="11" height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.62579 19.2556C9.8989 19.2572 10.1663 19.1774 10.3939 19.0265C10.6215 18.8755 10.7989 18.6601 10.9037 18.4079C11.0084 18.1557 11.0356 17.878 10.9819 17.6102C10.9282 17.3424 10.796 17.0967 10.602 16.9044L3.31454 9.63063L10.602 2.35688C10.861 2.09796 11.0064 1.74679 11.0064 1.38063C11.0064 1.19932 10.9707 1.01979 10.9013 0.852283C10.8319 0.684778 10.7302 0.532579 10.602 0.404376C10.4738 0.276173 10.3216 0.174477 10.1541 0.105094C9.98663 0.0357114 9.8071 0 9.62579 0C9.25963 0 8.90846 0.145458 8.64954 0.404376L0.399542 8.65438C0.143447 8.912 -0.0002985 9.2605 -0.0002985 9.62375C-0.0002985 9.98701 0.143447 10.3355 0.399542 10.5931L8.64954 18.8431C8.77689 18.973 8.92875 19.0764 9.09633 19.1472C9.26391 19.218 9.44387 19.2549 9.62579 19.2556Z" fill="white"/>
</svg>

  );
}

function ArrowRightIcon() {
  return (
   <svg width="11" height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.383 19.2556C1.10989 19.2572 0.842494 19.1774 0.614904 19.0265C0.387314 18.8755 0.209841 18.6601 0.105112 18.4079C0.000382408 18.1557 -0.0268584 17.878 0.0268624 17.6102C0.0805832 17.3424 0.212832 17.0967 0.406747 16.9044L7.69425 9.63063L0.406747 2.35688C0.147829 2.09796 0.00237054 1.74679 0.00237054 1.38063C0.00237054 1.19932 0.0380812 1.01979 0.107464 0.852283C0.176847 0.684778 0.278544 0.532579 0.406747 0.404376C0.53495 0.276173 0.687148 0.174477 0.854653 0.105094C1.02216 0.0357114 1.20169 0 1.383 0C1.74916 0 2.10033 0.145458 2.35925 0.404376L10.6092 8.65438C10.8653 8.912 11.0091 9.2605 11.0091 9.62375C11.0091 9.98701 10.8653 10.3355 10.6092 10.5931L2.35925 18.8431C2.2319 18.973 2.08004 19.0764 1.91246 19.1472C1.74488 19.218 1.56492 19.2549 1.383 19.2556Z" fill="white"/>
</svg>

  );
}

Component.displayName = "VeCareTestimonials";

export default Component;

/* ---------------- Settings ---------------- */

export const settings = {
  label: "Ve-Care Testimonials",

  props: [
    {
      id: "headingPrefix",
      type: "text",
      label: "Heading (normal text)",
      default: "Trusted By Thousands of"
    },
    {
      id: "headingHighlight",
      type: "text",
      label: "Heading (highlighted text)",
      default: "Happy Customers"
    },
    {
      id: "backgroundColor",
      type: "color",
      label: "Background Color",
      default: "#000000"
    }
  ],

  blocks: [
    {
      type: "testimonial_card",
      name: "Testimonial",
      props: [
        {
          id: "testimonialText",
          type: "text",
          label: "Testimonial",
          default:
            "The claim process was incredibly smooth. I saved a lot on my replacement and highly recommend adding Ve-Care when purchasing glasses."
        },
        {
          id: "customerName",
          type: "text",
          label: "Customer Name",
          default: "Sam Williams"
        }
      ]
    }
  ],

  blockLimit: 6
};

Component.settings = settings;