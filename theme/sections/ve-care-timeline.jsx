import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/sections/ve-care-yearly-timeline.less";

export function Component(input = {}) {
  const props = (input && (input.props ?? input)) || {};
  const blocks = (input && input.blocks) || [];

  const {
    headingPrefix,
    headingHighlight,
    lineColor,
    lineTrackColor,
    backgroundColor
  } = props || {};

  const [revealedSteps, setRevealedSteps] = useState(() => new Set());
  const [lineProgress, setLineProgress] = useState([]);
  const stepRefs = useRef([]);

useEffect(() => {
  const updateLineProgress = () => {
    const viewportHeight = window.innerHeight;

    const progressValues = stepRefs.current.map((step) => {
      if (!step) return 0;

      const line = step.querySelector(`.${styles.stepLine}`);

      if (!line) return 0;

      const rect = line.getBoundingClientRect();

      /*
       * Red animation starts when the top
       * of the line reaches 65% of viewport.
       */
      const startPoint = viewportHeight * 0.65;

      /*
       * Line becomes completely red when
       * it reaches 35% of viewport.
       */
      const endPoint = viewportHeight * 0.35;

      const progress =
        (startPoint - rect.top) /
        (rect.height + startPoint - endPoint);

      return Math.min(1, Math.max(0, progress));
    });

    setLineProgress(progressValues);
  };

  updateLineProgress();

  window.addEventListener("scroll", updateLineProgress, {
    passive: true
  });

  window.addEventListener("resize", updateLineProgress);

  return () => {
    window.removeEventListener("scroll", updateLineProgress);
    window.removeEventListener("resize", updateLineProgress);
  };
}, [blocks.length]);


useEffect(() => {     const nodes = stepRefs.current.filter(Boolean);     if (!nodes.length || typeof IntersectionObserver === "undefined") {       setRevealedSteps(new Set(nodes.map((_, i) => i)));       return undefined;     }     const observer = new IntersectionObserver(       (entries) => {         entries.forEach((entry) => {           if (entry.isIntersecting) {             const idx = Number(entry.target.dataset.stepIndex);             setRevealedSteps((prev) => {               if (prev.has(idx)) return prev;               const next = new Set(prev);               next.add(idx);               return next;             });           }         });       },       { threshold: 0.35, rootMargin: "0px 0px -10% 0px" }     );     nodes.forEach((node) => observer.observe(node));     return () => observer.disconnect();   }, [blocks.length]);

  return (
    <section
      className={styles.veCareTimeline}
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
          <div className={styles.timelineWrap}>
            {blocks.map((block, index) => {
              const { yearNumber, yearLabel, image, highlightText, description } =
                block.props || {};
              const isEven = index % 2 === 0;
              const isRevealed = revealedSteps.has(index);
                const progress = lineProgress[index] || 0;

              return (
                <div
                  key={block.id || index}
                  ref={(node) => (stepRefs.current[index] = node)}
                  data-step-index={index}
                  className={`${styles.step} ${
                    isEven ? styles.stepImageLeft : styles.stepImageRight
                  } ${isRevealed ? styles.stepRevealed : ""}`}
                >
                  {/* Line segment - own per step, colors independently */}
                 <span
  className={styles.stepLine}
  style={{
    backgroundColor:
      lineTrackColor?.value ||
      "rgba(255,255,255,0.25)"
  }}
>
 <span
  className={styles.stepLineProgress}
  style={{
    height: `${progress * 100}%`,
    backgroundColor:
      lineColor?.value || "#e02020"
  }}
/>
</span>

                  <div className={styles.stepYearRow}>
                    {yearNumber?.value && (
                      <span
                        className={styles.yearNumber}
                        style={{
                          color: isRevealed
                            ? lineColor?.value || "#e02020"
                            : "rgba(255,255,255,0.5)"
                        }}
                      >
                        {yearNumber.value}
                      </span>
                    )}
                    {yearLabel?.value && (
                      <span className={styles.yearLabel}>{yearLabel.value}</span>
                    )}
                  </div>

                  <div className={styles.stepContentRow}>
                    <div className={styles.stepImageCol}>
                      {image?.value && (
                        <img
                          src={image.value}
                          alt={highlightText?.value || "Timeline"}
                        />
                      )}
                    </div>

                    <div className={styles.stepTextCol}>
                      {(highlightText?.value || description?.value) && (
                        <p className={styles.stepText}>
                          {highlightText?.value && (
                            <span className={styles.stepHighlight}>
                              {highlightText.value}
                            </span>
                          )}{" "}
                          {description?.value}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

Component.displayName = "VeCareYearlyTimeline";
export default Component;

export const settings = {
  label: "Ve-Care Yearly Protection Timeline",
  props: [
    {
      id: "headingPrefix",
      type: "text",
      label: "Heading (normal text)",
      default: "Your Protection"
    },
    {
      id: "headingHighlight",
      type: "text",
      label: "Heading (highlighted text)",
      default: "Year After Year"
    },
    {
      id: "lineColor",
      type: "color",
      label: "Active Line/Year Color",
      default: "#e02020"
    },
    {
      id: "lineTrackColor",
      type: "color",
      label: "Inactive Line Color",
      default: "rgba(255,255,255,0.25)"
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
      type: "timeline_year",
      name: "Year Step",
      props: [
        {
          id: "yearNumber",
          type: "text",
          label: "Year Number",
          default: "01"
        },
        {
          id: "yearLabel",
          type: "text",
          label: "Year Sub-label",
          default: "YEAR"
        },
        {
          id: "image",
          type: "image_picker",
          label: "Image"
        },
        {
          id: "highlightText",
          type: "text",
          label: "Highlighted Word(s)",
          default: "One FREE"
        },
        {
          id: "description",
          type: "text",
          label: "Remaining Text",
          default: "replacement"
        }
      ]
    }
  ],
  blockLimit: 6
};

Component.settings = settings;