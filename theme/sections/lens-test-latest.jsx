import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/sections/lens-test-latest.less";

/* ==========================================================================
   HELPERS
   Fynd block field values are read as block.props.<id>.value, same shape
   as top-level props.<id>.value. See official example:
   https://docs.fynd.com/partners/commerce/themes/vuejs/section-overview/
   ("blocks": [{ "type": "product", "name": "Product", "props": [...] }])
   ========================================================================== */

const val = (obj, id) => obj?.[id]?.value;

// "screens, digital, driving" -> ["screens","digital","driving"]
const parseTags = (str) =>
  (str || "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

// Pull "up to N" numbered options (option_1_label / option_1_icon / option_1_tags ...)
// off a question block's props into a clean array.
const getQuestionOptions = (block, maxOptions = 9) => {
  const p = block?.props || {};
  const options = [];
  for (let i = 1; i <= maxOptions; i++) {
    const label = val(p, `option_${i}_label`);
    if (!label) continue;
    options.push({
      index: i,
      label,
      icon: val(p, `option_${i}_icon`) || null,
      tags: parseTags(val(p, `option_${i}_tags`)),
    });
  }
  return options;
};

// Pull up to 4 numbered features off a result block.
const getResultFeatures = (block, maxFeatures = 4) => {
  const p = block?.props || {};
  const features = [];
  for (let i = 1; i <= maxFeatures; i++) {
    const title = val(p, `feature_${i}_title`);
    if (!title) continue;
    features.push({
      title,
      description: val(p, `feature_${i}_description`) || "",
      icon: val(p, `feature_${i}_icon`) || null,
    });
  }
  return features;
};

// Pull up to 5 loading filmstrip images off the section props into a clean array.
const getLoadingImages = (props, maxImages = 5) => {
  const images = [];
  for (let i = 1; i <= maxImages; i++) {
    const img = val(props, `loading_image_${i}`);
    if (img) images.push(img);
  }
  return images;
};

// Build the linear list of screens the user walks through: every question
// block in order, with any fact blocks pointing at that question number
// inserted immediately after it.
const buildFlow = (blocks) => {
  const questionBlocks = (blocks || []).filter((b) => b.type === "question");
  const factBlocks = (blocks || []).filter((b) => b.type === "fact");

  const flow = [];
  questionBlocks.forEach((block, i) => {
    const questionNumber = i + 1;
    flow.push({ type: "question", block, key: block.id ?? `q-${i}`, questionNumber });

    factBlocks
      .filter((f) => parseInt(val(f.props, "after_question"), 10) === questionNumber)
      .forEach((factBlock, fi) =>
        flow.push({ type: "fact", block: factBlock, key: factBlock.id ?? `f-${i}-${fi}` })
      );
  });

  return flow;
};

// Given every answer given so far, tally which result block scores highest.
const computeSignals = (tags) => {
  const has = (t) => tags.has(t);
  const ageOlder = has("age_40_55") || has("age_55plus");
  const correctionBoth = has("correction_both");
  const correctionNear = has("correction_near");

  let S = has("screen_2_6") ? 1 : has("screen_6_10") ? 2 : has("screen_10plus") ? 3 : 0;
  if (has("activity_screens") || has("activity_gaming")) S += 1;

  const D = has("drive_daynight") ? 3 : has("drive_day") ? 1 : 0;

  let C = (has("symptom_glare") ? 2 : 0) + (has("symptom_headaches") ? 1 : 0);
  C = Math.min(C, 3);

  const symptomTags = ["symptom_headaches", "symptom_dryeyes", "symptom_glare"];
  const Y = symptomTags.filter(has).length;

  const T = has("thinner_yes") ? 2 : has("thinner_ifpossible") ? 1 : 0;

  let P = T;
  if (has("priority_clearvision")) P += 1;
  if (ageOlder) P += 1;
  if (has("frame_rimless")) P += 2;
  else if (has("frame_metal") || has("frame_semirimless")) P += 1;

  const activityTags = [
    "activity_screens", "activity_outdoors", "activity_driving", "activity_meetings",
    "activity_reading", "activity_gaming", "activity_cooking", "activity_selfies", "activity_workout",
  ];
  const L = activityTags.filter(has).length;

  return { S, D, C, P, T, L, Y, correctionBoth, correctionNear, ageOlder };
};

const decideFamily = (sig) => {
  if (sig.correctionBoth) return "progressive";
  if (sig.correctionNear && sig.ageOlder) return "progressive";
  return "single_vision";
};

const decideSingleVisionTier = (sig, tags) => {
  if (tags.has("thinner_yes") && sig.P >= 3) return "truvision";
  if (sig.D >= 2 && sig.D >= sig.S) return "drivesure";
  if (sig.S >= 2 && sig.S >= sig.D && sig.S >= sig.C - 1) return "gadgetpro";
  if (sig.C >= 2 || sig.P >= 2) return "clearvision";
  return "essential_plus";
};

const decideProgressiveTier = (sig) => {
  const LDS = sig.L + sig.S + sig.D + (sig.C >= 2 ? 1 : 0) + sig.T + sig.Y;
  if (LDS <= 4) return "basic";
  if (LDS <= 7) return "regular";
  if (LDS <= 10) return "comfort";
  if (LDS <= 13) return "supreme";
  if (LDS <= 16) return "supreme_plus";
  return "lumino";
};

const computeResult = (answers, questionBlocks, resultBlocks) => {
  const tags = new Set();
  questionBlocks.forEach((qBlock, qi) => {
    const qKey = qBlock.id ?? `q-${qi}`;
    const options = getQuestionOptions(qBlock);
    (answers[qKey] || []).forEach((optIndex) => {
      const option = options.find((o) => o.index === optIndex);
      option?.tags.forEach((t) => tags.add(t));
    });
  });

  const sig = computeSignals(tags);
  const family = decideFamily(sig);
  const resultKey =
    family === "progressive" ? decideProgressiveTier(sig) : decideSingleVisionTier(sig, tags);

  const match = resultBlocks.find((r) =>
    parseTags(val(r.props, "match_tags")).includes(resultKey)
  );
  return match || resultBlocks[0] || null;
};




// Detects "mobile" from the actual rendered width of the section itself
// (via ResizeObserver) rather than the global window viewport. Many theme
// editors simulate a mobile preview by narrowing a container inside the
// page instead of truly resizing the browser window, which means CSS
// `@media (max-width: ...)` never fires even though the preview looks
// like mobile. Measuring the section's own box width sidesteps that.
function useContainerIsMobile(breakpoint = 768) {
  const ref = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const update = (width) => {
      if (width > 0) setIsMobile(width <= breakpoint);
    };

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver((entries) => {
        update(entries[0]?.contentRect?.width || 0);
      });
      observer.observe(el);
      update(el.getBoundingClientRect().width);
      return () => observer.disconnect();
    }

    const onResize = () => update(el.getBoundingClientRect().width || window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);

  return [ref, isMobile];
}

/* ==========================================================================
   COMPONENT
   ========================================================================== */

export function Component({ props = {}, blocks = [] }) {
  const questionBlocks = blocks.filter((b) => b.type === "question");
  const resultBlocks = blocks.filter((b) => b.type === "result");
  const flow = buildFlow(blocks);

  const [sectionRef, isMobile] = useContainerIsMobile(768);
  const [currentStep, setCurrentStep] = useState(val(props, "show_intro") ? "start" : "flow");
  const [flowIndex, setFlowIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [blockKey]: [optionIndex, ...] }
  const [reviewReturnIndex, setReviewReturnIndex] = useState(0);
  const [finalResult, setFinalResult] = useState(null);
  const [checkedSteps, setCheckedSteps] = useState(0);
  const [filmstripIndex, setFilmstripIndex] = useState(0);

  const loadingTimersRef = useRef([]);
  const filmstripTimerRef = useRef(null);
  const currentFlowItem = flow[flowIndex];

  /* ---------------- Navigation ---------------- */

  const handleStart = () => {
    setCurrentStep("flow");
    setFlowIndex(0);
  };

  const handleBack = () => {
    if (flowIndex === 0) {
      if (val(props, "show_intro")) setCurrentStep("start");
      return;
    }
    setFlowIndex((i) => i - 1);
  };

  const handleReviewOpen = () => {
    setReviewReturnIndex(flowIndex);
    setCurrentStep("review");
  };

  const handleReviewResume = () => {
    setFlowIndex(reviewReturnIndex);
    setCurrentStep("flow");
  };

  const handleReviewEdit = (targetFlowIndex) => {
    setFlowIndex(targetFlowIndex);
    setCurrentStep("flow");
  };

  const goToLoading = () => {
    setFinalResult(computeResult(answers, questionBlocks, resultBlocks));
    setCheckedSteps(0);
    setFilmstripIndex(0);
    setCurrentStep("loading");
  };

  const handleForward = () => {
    if (currentFlowItem?.type !== "question") return;
    const isLast = flowIndex === flow.length - 1;
    if (isLast) goToLoading();
    else setFlowIndex((i) => i + 1);
  };

  const handleFactContinue = () => {
    const isLast = flowIndex === flow.length - 1;
    if (isLast) goToLoading();
    else setFlowIndex((i) => i + 1);
  };

  /* ---------------- Answer handling ---------------- */
const handleSelectOption = (blockKey, block, option) => {
  const multi = !!val(block.props, "multi_select");
  const existing = answers[blockKey] || [];

  let updatedSelection;
  if (!multi) {
    updatedSelection = [option.index];
  } else {
    const alreadySelected = existing.includes(option.index);
    updatedSelection = alreadySelected
      ? existing.filter((i) => i !== option.index)
      : [...existing, option.index];
  }

  const updatedAnswers = { ...answers, [blockKey]: updatedSelection };
  setAnswers(updatedAnswers);

  if (!multi) {
    setTimeout(() => {
      const isLast = flowIndex === flow.length - 1;
      if (isLast) {
        setFinalResult(computeResult(updatedAnswers, questionBlocks, resultBlocks));
        setCheckedSteps(0);
        setFilmstripIndex(0);
        setCurrentStep("loading");
      } else {
        setFlowIndex((i) => i + 1);
      }
    }, 350);
  }
};

  const isOptionSelected = (blockKey, option) =>
    (answers[blockKey] || []).includes(option.index);

  const hasAnswer = (blockKey) => (answers[blockKey] || []).length > 0;




const optionsRef = useRef(null);
const [showScrollHint, setShowScrollHint] = useState(false);
const [isScrollable, setIsScrollable] = useState(false);
const [thumbStyle, setThumbStyle] = useState({ height: "0%", top: "0%" });

useEffect(() => {
  const el = optionsRef.current;
  if (!el) return undefined;

  const checkScrollable = () => {
    const scrollable = el.scrollHeight - el.clientHeight > 4;
    const nearBottom = el.scrollHeight - el.clientHeight - el.scrollTop < 4;

    setIsScrollable(scrollable);
    setShowScrollHint(scrollable && !nearBottom);

    if (scrollable) {
      const thumbHeightPct = (el.clientHeight / el.scrollHeight) * 100;
      const thumbTopPct = (el.scrollTop / el.scrollHeight) * 100;
      setThumbStyle({ height: `${thumbHeightPct}%`, top: `${thumbTopPct}%` });
    } else {
      setThumbStyle({ height: "0%", top: "0%" });
    }
  };

  checkScrollable();
  el.addEventListener("scroll", checkScrollable, { passive: true });
  window.addEventListener("resize", checkScrollable);

  let ro;
  if (typeof ResizeObserver !== "undefined") {
    ro = new ResizeObserver(checkScrollable);
    ro.observe(el);
  }

  return () => {
    el.removeEventListener("scroll", checkScrollable);
    window.removeEventListener("resize", checkScrollable);
    ro?.disconnect();
  };
}, [currentFlowItem?.key]);

  /* ---------------- Loading screen animation ---------------- */

  useEffect(() => {
    loadingTimersRef.current.forEach(clearTimeout);
    loadingTimersRef.current = [];
    if (currentStep !== "loading") return;

    const steps = [
      val(props, "loading_step_1"),
      val(props, "loading_step_2"),
      val(props, "loading_step_3"),
    ].filter(Boolean);

    steps.forEach((_, i) => {
      loadingTimersRef.current.push(
        setTimeout(() => setCheckedSteps(i + 1), 700 * (i + 1))
      );
    });

    loadingTimersRef.current.push(
      setTimeout(() => setCurrentStep("result-hero"), 700 * (steps.length + 1))
    );

    return () => loadingTimersRef.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  /* ---------------- Loading filmstrip slider ---------------- */

  useEffect(() => {
    clearInterval(filmstripTimerRef.current);
    if (currentStep !== "loading") return;

    const images = getLoadingImages(props);
    if (images.length <= 1) return;

    filmstripTimerRef.current = setInterval(() => {
      setFilmstripIndex((i) => (i + 1) % images.length);
    }, 1100);

    return () => clearInterval(filmstripTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);


/* ---------------- Fact screen auto-advance ---------------- */

useEffect(() => {
  const isFactScreen =
    currentStep === "flow" && currentFlowItem?.type === "fact";

  if (!isFactScreen) return undefined;

  const timer = setTimeout(() => {
    handleFactContinue();
  }, 3500); 

  return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [currentStep, flowIndex]);




  /* ---------------- Shared header ---------------- */

  const renderHeader = () => (
    <div className={`${styles.brand} ${styles.animateTop}`}>
      <h1 className={styles["brand-image"]}>
        <img src={val(props, "logo_image")} alt="" />
      </h1>
    </div>
  );

  const renderNavBar = ({ backDisabled = false, forwardDisabled = false } = {}) => (
    <div className={styles.navBar}>
      <button
        onClick={handleBack}
        disabled={backDisabled}
        className={`${styles.navArrow} ${styles.navArrowLeft}`}
        aria-label="Back"
      >
       <svg width="12" height="22" viewBox="0 0 12 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.311798 11.428L9.9053 21.0183C10.3263 21.4382 11.0083 21.4382 11.4303 21.0183C11.8513 20.5984 11.8513 19.9164 11.4303 19.4965L2.59774 10.6672L11.4292 1.83779C11.8502 1.41789 11.8502 0.735877 11.4292 0.31492C11.0083 -0.104973 10.3252 -0.104973 9.90424 0.31492L0.310735 9.90514C-0.103755 10.3207 -0.103755 11.0134 0.311798 11.428Z" fill="white"/>
</svg>

      </button>
      <button onClick={handleReviewOpen} className={styles.reviewLink}>
        Review Answers
      </button>
      <button
        onClick={handleForward}
        disabled={forwardDisabled}
        className={`${styles.navArrow} ${styles.navArrowRight}`}
        aria-label="Next"
      >
       <svg width="12" height="22" viewBox="0 0 12 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.311798 11.428L9.9053 21.0183C10.3263 21.4382 11.0083 21.4382 11.4303 21.0183C11.8513 20.5984 11.8513 19.9164 11.4303 19.4965L2.59774 10.6672L11.4292 1.83779C11.8502 1.41789 11.8502 0.735877 11.4292 0.31492C11.0083 -0.104973 10.3252 -0.104973 9.90424 0.31492L0.310735 9.90514C-0.103755 10.3207 -0.103755 11.0134 0.311798 11.428Z" fill="white"/>
</svg>

      </button>
    </div>
  );

  /* ==========================================================================
     START SCREEN (optional, toggled via props.show_intro)
     ========================================================================== */
  if (currentStep === "start") {
    return (
      <div className={styles["lens-test-section"]}>
        <div className={styles["card-wrapper"]}>
          <div className={styles.card}>
            {val(props, "intro_background_image") && (
              <div className={styles.hero}>
                <img
                  src={val(props, "intro_background_image")}
                  className={styles["hero-photo"]}
                  alt=""
                />
                <div className={styles["hero-overlay"]}></div>
              </div>
            )}
            <div className={styles.content}>
              {renderHeader()}
              <h2 className={`${styles.heading} ${styles.animateBottom}`}>
                {val(props, "intro_heading") || "Find Your Perfect Lens Match"}
              </h2>
              <p className={`${styles.subheading} ${styles.animateBottom}`}>
                {val(props, "intro_subheading") ||
                  "Answer a few quick questions to discover the right lens for you."}
              </p>
              <button
                onClick={handleStart}
                className={`${styles.button} ${styles["button-primary"]} ${styles.animateBottom}`}
              >
                {val(props, "intro_button_text") || "Start The Lens Test"}
                <span className={styles.buttonIcon}>
                  <svg width="19" height="11" viewBox="0 0 19 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18.7823 4.87207C18.7821 4.8718 18.7819 4.87149 18.7816 4.87123L14.9036 0.25832C14.613 -0.0872489 14.1431 -0.0859629 13.8539 0.261336C13.5648 0.60859 13.5659 1.17026 13.8564 1.51587L16.4602 4.6129H0.742187C0.332277 4.6129 0 5.01006 0 5.5C0 5.98994 0.332277 6.3871 0.742187 6.3871H16.4601L13.8564 9.48413C13.5659 9.82974 13.5648 10.3914 13.854 10.7387C14.1432 11.086 14.6131 11.0872 14.9036 10.7417L18.7817 6.12877C18.7819 6.12851 18.7821 6.1282 18.7823 6.12793C19.073 5.78117 19.0721 5.21768 18.7823 4.87207Z" fill="white"/>
</svg>

                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }



  if (currentStep === "flow" && !currentFlowItem) {
  return (
    <div className={styles["lens-test-section"]}>
      <div className={styles["card-wrapper"]}>
        <div className={styles.card}>
          <div className={styles.content}>
            {renderHeader()}
            <h2 className={styles.heading}>No questions configured yet</h2>
            <p className={styles.subheading}>
              Add at least one "Question" block to this section in the editor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


  /* ==========================================================================
     QUESTION / FACT FLOW
     ========================================================================== */
  if (currentStep === "flow" && currentFlowItem) {
    /* ---------------- FACT SCREEN ---------------- */
    if (currentFlowItem.type === "fact") {
      const factProps = currentFlowItem.block.props || {};
      const factBgImage = val(factProps, "background_image");
      const factIconImage = val(factProps, "icon_image");
      const factStat = val(factProps, "stat");
      const factStatSuffix = val(factProps, "stat_suffix");

      return (
        <div className={`${styles["lens-test-section"]} ${styles["lens-test-section--question"]}`} >
          <div className={styles["card-wrapper"]}>
            <div
              className={`${styles.card} ${factBgImage ? styles["has-full-bleed-image"] : ""}`}
            >
              {factBgImage && (
                <div className={styles["full-bleed-image-wrapper"]}>
                  <img src={factBgImage} className={styles["fact-full-bleed-image"]} alt="" />
                  <div className={styles["fact-overlay"]}></div>
                </div>
              )}
              <div
                className={`${styles["fact-wrapper"]} ${
                  factBgImage ? styles["fact-wrapper--overlay"] : ""
                }`}
              >
                {renderHeader()}
                <div className={`${styles.factIcon} ${styles.animateBottom}`}>
                  {factIconImage ? (
                    <img src={factIconImage} alt="" className={styles.factIconImage} />
                  ) : (
                    <span className={styles.factDots}></span>
                  )}
                </div>

                <div>
                <p className={`${styles.factLabel} ${styles.animateBottom}`}>
                  {val(factProps, "label") || "DID YOU KNOW?"}
                </p>
                {factStat && (
                  <p className={`${styles.factStat} ${styles.animateBottom}`}>
                    {factStat}
                    {factStatSuffix && (
                      <span className={styles.factStatSuffix}>{factStatSuffix}</span>
                    )}
                  </p>
                )}
                <p className={`${styles.factDescription} ${styles.animateBottom}`}>
                  {val(factProps, "description")}
                </p>
                </div>
                {/* <button
                  onClick={handleFactContinue}
                  className={`${styles.button} ${styles["button-primary"]} ${styles["button-full"]} ${styles.animateBottom}`}
                >
                  {val(factProps, "button_text") || "Continue"}
                  <span className={styles.buttonIcon}>
                   <svg width="19" height="11" viewBox="0 0 19 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18.7823 4.87207C18.7821 4.8718 18.7819 4.87149 18.7816 4.87123L14.9036 0.25832C14.613 -0.0872489 14.1431 -0.0859629 13.8539 0.261336C13.5648 0.60859 13.5659 1.17026 13.8564 1.51587L16.4602 4.6129H0.742187C0.332277 4.6129 0 5.01006 0 5.5C0 5.98994 0.332277 6.3871 0.742187 6.3871H16.4601L13.8564 9.48413C13.5659 9.82974 13.5648 10.3914 13.854 10.7387C14.1432 11.086 14.6131 11.0872 14.9036 10.7417L18.7817 6.12877C18.7819 6.12851 18.7821 6.1282 18.7823 6.12793C19.073 5.78117 19.0721 5.21768 18.7823 4.87207Z" fill="white"/>
</svg>

                  </span>
                </button> */}

                                <div className={`${styles.factProgressBar} ${styles.animateBottom}`}>
                  <div
                    key={flowIndex}
                    className={styles.factProgressBarFill}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    /* ---------------- QUESTION SCREEN ---------------- */
    const block = currentFlowItem.block;
    const blockKey = currentFlowItem.key;
    const qProps = block.props || {};
    const options = getQuestionOptions(block);
    const multi = !!val(qProps, "multi_select");
    const imageUrl = val(qProps, "image");
    const mobileImageUrl = val(qProps, "mobile_image") || imageUrl;
    const activeImageUrl = isMobile ? mobileImageUrl : imageUrl;
    const hasImage = !!imageUrl;

    return (
      <div  className={`${styles["lens-test-section"]} ${styles["lens-test-section--question"]}`} ref={sectionRef}>
        <div className={styles["card-wrapper"]}>
          <div className={`${styles.card} ${hasImage ? styles["has-full-bleed-image"] : ""}`}>
            <div key={blockKey} className={styles["question-wrapper"]}>
              {hasImage && (
                <div className={styles["full-bleed-image-wrapper"]}>
                  <img
                    src={activeImageUrl}
                    className={styles["full-bleed-image"]}
                    alt=""
                  />
                  <div className={styles["full-bleed-overlay"]}></div>
                </div>
              )}

              <div className={styles.questionTop}>
                {renderHeader()}
              </div>

              <div
                className={`${styles.questionContentWrapper} ${
                  hasImage ? styles["questionContentWrapper--overlay"] : ""
                }`}
              >
                <h2 className={`${styles["question-title"]} ${styles.animateBottom}`}>
                  {val(qProps, "title")}
                </h2>

                <div className={styles.optionsWrapper}>

                <div     ref={optionsRef}
 className={`${styles.options} ${styles.animateBottom}`}>
                  {options.map((option) => {
                    const selected = isOptionSelected(blockKey, option);
                    return (
                      <button
                        key={option.index}
                        onClick={() => handleSelectOption(blockKey, block, option)}
                        className={`${styles.option} ${selected ? styles.selected : ""}`}
                      >
                        {option.icon && (
                          <span className={styles.optionIconWrapper}>
                            <img src={option.icon} alt="" className={styles.optionIcon} />
                          </span>
                        )}
                        <span className={styles.optionLabel}>{option.label}</span>
                        <span
                          className={`${styles.optionIndicator} ${
                            multi ? styles.optionIndicatorCheckbox : styles.optionIndicatorRadio
                          } ${selected ? styles.optionIndicatorSelected : ""}`}
                        >
                          {multi && selected && (
                            <svg
                              className={styles.checkmark}
                              width="10"
                              height="8"
                              viewBox="0 0 10 8"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M1 4.2L3.6 6.8L9 1"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>

     {isScrollable && (
  <div className={styles.fakeScrollTrack}>
    <div className={styles.fakeScrollThumb} style={thumbStyle}></div>
  </div>
)}

{showScrollHint && (
  <div className={styles.scrollHint} aria-hidden="true">
    <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1L7 7L13 1" stroke="white" strokeOpacity="0.8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
)}
</div>

                {renderNavBar({
                  backDisabled: flowIndex === 0 && !val(props, "show_intro"),
                  forwardDisabled: !hasAnswer(blockKey),
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     REVIEW ANSWERS SCREEN
     ========================================================================== */
  if (currentStep === "review") {
    // Only show questions the user has actually answered, most-recent-first
    // order is preserved (matches the flow order).
    const answeredItems = flow
      .map((item, idx) => ({ item, idx }))
      .filter(({ item }) => item.type === "question" && hasAnswer(item.key));

    return (
      <div className={styles["lens-test-section"]}>
        <div className={styles["card-wrapper"]}>
          <div className={styles.card}>
            <div className={styles["review-wrapper"]}>
              <div className={`${styles.reviewHeader} ${styles.animateTop}`}>
                <h2 className={styles["review-title"]}>
                  {val(props, "review_heading") || "Review Answers"}
                </h2>
                <p className={styles.reviewSubheading}>
                  {val(props, "review_subheading") ||
                    "Review or edit your previous responses"}
                </p>
              </div>

              <div className={`${styles.reviewList} ${styles.animateBottom}`}>
                {answeredItems.map(({ item, idx }) => {
                  const options = getQuestionOptions(item.block);
                  const selectedIndexes = answers[item.key] || [];
                  const selectedOptions = options.filter((o) =>
                    selectedIndexes.includes(o.index)
                  );
                  const selectedLabels = selectedOptions.map((o) => o.label).join(", ");
                  const reviewIcon = selectedOptions.find((o) => o.icon)?.icon;

                  return (
                    <button
                      key={item.key}
                      className={styles.reviewItem}
                      onClick={() => handleReviewEdit(idx)}
                    >
                      <span className={styles.reviewItemIconWrapper}>
                        {reviewIcon ? (
                          <img src={reviewIcon} alt="" className={styles.reviewItemIcon} />
                        ) : (
                          <span className={styles.reviewItemIconDot}></span>
                        )}
                      </span>
                      <span className={styles.reviewItemText}>
                        <p className={styles.reviewItemQuestion}>
                          {val(item.block.props, "title")}
                        </p>
                        <p className={styles.reviewItemAnswer}>{selectedLabels}</p>
                      </span>
                      <span className={styles.reviewChevron}>
                        <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L7 7L1 13" stroke="white" strokeOpacity="0.5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleReviewResume}
                className={`${styles.button} ${styles["button-primary"]} ${styles["button-full"]} ${styles.animateBottom}`}
              >
                Continue
                <span className={styles.buttonIcon}>
                 <svg width="19" height="11" viewBox="0 0 19 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18.7823 4.87207C18.7821 4.8718 18.7819 4.87149 18.7816 4.87123L14.9036 0.25832C14.613 -0.0872489 14.1431 -0.0859629 13.8539 0.261336C13.5648 0.60859 13.5659 1.17026 13.8564 1.51587L16.4602 4.6129H0.742187C0.332277 4.6129 0 5.01006 0 5.5C0 5.98994 0.332277 6.3871 0.742187 6.3871H16.4601L13.8564 9.48413C13.5659 9.82974 13.5648 10.3914 13.854 10.7387C14.1432 11.086 14.6131 11.0872 14.9036 10.7417L18.7817 6.12877C18.7819 6.12851 18.7821 6.1282 18.7823 6.12793C19.073 5.78117 19.0721 5.21768 18.7823 4.87207Z" fill="white"/>
</svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     LOADING / MATCHING SCREEN
     ========================================================================== */
  if (currentStep === "loading") {
    const steps = [
      val(props, "loading_step_1"),
      val(props, "loading_step_2"),
      val(props, "loading_step_3"),
    ].filter(Boolean);

    const filmstripImages = getLoadingImages(props);
    const filmstripLen = filmstripImages.length;
    const prevImage = filmstripLen ? filmstripImages[(filmstripIndex - 1 + filmstripLen) % filmstripLen] : null;
    const mainImage = filmstripLen ? filmstripImages[filmstripIndex] : null;
    const nextImage = filmstripLen ? filmstripImages[(filmstripIndex + 1) % filmstripLen] : null;

    return (
      <div className={styles["lens-test-section"]}>
        <div className={styles["card-wrapper"]}>
          <div className={styles.card}>
            <div className={styles["loading-wrapper"]}>
              {renderHeader()}
              {filmstripLen > 0 && (
                <div className={`${styles.filmstrip} ${styles.animateBottom}`}>
                  {filmstripLen > 1 && (
                    <img src={prevImage} className={styles.filmstripSide} alt="" />
                  )}
                  <img
                    key={filmstripIndex}
                    src={mainImage}
                    className={`${styles.filmstripMain} ${styles.filmstripSlide}`}
                    alt=""
                  />
                  {filmstripLen > 1 && (
                    <img src={nextImage} className={styles.filmstripSide} alt="" />
                  )}
                </div>
              )}

              <h2 className={`${styles["question-title"]} ${styles.animateBottom}`}>
                {val(props, "loading_heading") || "Matching your lens"}
              </h2>
              <p className={`${styles.loadingDescription} ${styles.animateBottom}`}>
                {val(props, "loading_description")}
              </p>

              <div className={`${styles.checklist} ${styles.animateBottom}`}>
                {steps.map((step, i) => (
                  <div
                    key={i}
                    className={`${styles.checklistItem} ${
                      i < checkedSteps ? styles.checklistItemDone : styles.checklistItemPending
                    }`}
                  >
                    <svg className={styles.checklistTick} width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.5001 0C16.2981 0 21.0001 4.70206 21.0001 10.5001C21.0001 16.2981 16.2981 21.0001 10.5001 21.0001C4.70206 21.0001 0 16.2981 0 10.5001C0 4.70206 4.70206 0 10.5001 0ZM8.31959 13.9106L5.74892 11.3378C5.31097 10.8995 5.31088 10.1849 5.74892 9.74682C6.18706 9.30878 6.90484 9.31152 7.33978 9.74682L9.15209 11.5606L13.6605 7.05214C14.0986 6.614 14.8133 6.614 15.2514 7.05214C15.6895 7.49018 15.6889 8.20548 15.2514 8.643L9.94624 13.9481C9.50873 14.3856 8.79342 14.3863 8.35538 13.9481C8.34307 13.9358 8.33119 13.9233 8.31959 13.9106Z" fill="white"/>
</svg>

                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     RESULT — HERO SCREEN
     ========================================================================== */
  if (currentStep === "result-hero" && finalResult) {
    const r = finalResult.props || {};
    const heroVideo = val(r, "hero_video");
    const heroVideoMobile = val(r, "hero_video_mobile") || heroVideo;
    const activeHeroVideo = isMobile ? heroVideoMobile : heroVideo;
    const heroVideoPoster = val(r, "hero_video_poster");

    return (
      <div className={styles["lens-test-section"]} ref={sectionRef}>
        <div className={styles["card-wrapper"]}>
          <div className={`${styles.card} ${heroVideo ? styles["has-full-bleed-image"] : ""}`}>
            {heroVideo && (
              <div className={styles["result-hero-video-wrapper"]}>
                <video
                  key={activeHeroVideo}
                  className={styles["result-hero-video"]}
                  src={activeHeroVideo}
                  poster={heroVideoPoster || undefined}
                  autoPlay
                  muted
                  loop
                  playsInline
                />
                <div className={styles["result-hero-video-overlay"]}></div>
              </div>
            )}
            <div
              className={`${styles["result-hero-wrapper"]} ${
                heroVideo ? styles["result-hero-wrapper--video"] : ""
              }`}
            >
              {renderHeader()}
              <p className={`${styles.resultEyebrow} ${styles.animateBottom}`}>
                We've Found Your Perfect Lens
              </p>
              <p className={`${styles.resultSubheading} ${styles.animateBottom}`}>
                Based on your lifestyle &amp; visual needs, we recommend
              </p>

              {heroVideo ? (
                <div className={styles["result-hero-video-spacer"]}></div>
              ) : (
                val(r, "hero_image") && (
                  <div className={`${styles.resultLensGraphic} ${styles.animateBottom}`}>
                    <img src={val(r, "hero_image")} alt={val(r, "lens_name")} />
                  </div>
                )
              )}

              <div className={`${styles.productPill} ${styles.animateBottom}`}>
                {val(r, "lens_name")}
              </div>
              <p className={`${styles.productTagline} ${styles.animateBottom}`}>
                {val(r, "lens_tagline")}
              </p>

              <div className={`${styles.resultButtons} ${styles.animateBottom}`}>
                <a href={val(props, "store_link") || "/locate-us"} className={styles["button-outline"]}>
                  Visit Store
                </a>
                <button
                  onClick={() => setCurrentStep("result-detail")}
                  className={`${styles.button} ${styles["button-primary"]}`}
                >
                  Learn More
                  <span className={styles.buttonIcon}>
                   <svg width="19" height="11" viewBox="0 0 19 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18.7823 4.87207C18.7821 4.8718 18.7819 4.87149 18.7816 4.87123L14.9036 0.25832C14.613 -0.0872489 14.1431 -0.0859629 13.8539 0.261336C13.5648 0.60859 13.5659 1.17026 13.8564 1.51587L16.4602 4.6129H0.742187C0.332277 4.6129 0 5.01006 0 5.5C0 5.98994 0.332277 6.3871 0.742187 6.3871H16.4601L13.8564 9.48413C13.5659 9.82974 13.5648 10.3914 13.854 10.7387C14.1432 11.086 14.6131 11.0872 14.9036 10.7417L18.7817 6.12877C18.7819 6.12851 18.7821 6.1282 18.7823 6.12793C19.073 5.78117 19.0721 5.21768 18.7823 4.87207Z" fill="white"/>
</svg>

                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     RESULT — DETAIL SCREEN
     ========================================================================== */
  if (currentStep === "result-detail" && finalResult) {
    const r = finalResult.props || {};
    const features = getResultFeatures(finalResult);

    return (
      <div className={styles["lens-test-section"]}>
        <div className={styles["card-wrapper"]}>
          <div className={styles.card}>
            <div className={styles["result-detail-wrapper"]}>
              {renderHeader()}
              <div className={`${styles.productPill} ${styles.animateTop}`}>
                {val(r, "lens_name")}
              </div>
              <p className={`${styles.productTagline} ${styles.animateTop}`}>
                {val(r, "lens_tagline")}
              </p>

              <h2 className={`${styles["question-title"]} ${styles.animateBottom}`}>
                Why This Lens Is Right For You
              </h2>

              <div className={`${styles.featureGrid} ${styles.animateBottom}`}>
                {features.map((f, i) => (
                  <div key={i} className={styles.featureCard}>
                    {f.icon && (
                      <span className={styles.featureIconWrapper}>
                        <img src={f.icon} alt="" className={styles.featureIcon} />
                      </span>
                    )}
                    <p className={styles.featureTitle}>{f.title}</p>
                    <p className={styles.featureDescription}>{f.description}</p>
                  </div>
                ))}
              </div>

              {(val(r, "stat_percent") || val(r, "rating")) && (
                <div className={`${styles.statsBar} ${styles.animateBottom}`}>
                  {val(r, "stat_percent") && (
                    <p className={styles.statsPercent}>
                      <strong>{val(r, "stat_percent")}</strong> {val(r, "stat_description")}
                    </p>
                  )}
                  {val(r, "rating") && (
                    <p className={styles.statsRating}>
                      <span className={styles.stars}>★★★★★</span> {val(r, "rating")} Customer
                      Rating
                    </p>
                  )}
                </div>
              )}

              <a
                href={val(r, "learn_more_link") || val(props, "store_link") || "/locate-us"}
                className={`${styles.button} ${styles["button-primary"]} ${styles["button-full"]} ${styles.animateBottom}`}
              >
                Continue
                <span className={styles.buttonIcon}>
                  <svg width="19" height="11" viewBox="0 0 19 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18.7823 4.87207C18.7821 4.8718 18.7819 4.87149 18.7816 4.87123L14.9036 0.25832C14.613 -0.0872489 14.1431 -0.0859629 13.8539 0.261336C13.5648 0.60859 13.5659 1.17026 13.8564 1.51587L16.4602 4.6129H0.742187C0.332277 4.6129 0 5.01006 0 5.5C0 5.98994 0.332277 6.3871 0.742187 6.3871H16.4601L13.8564 9.48413C13.5659 9.82974 13.5648 10.3914 13.854 10.7387C14.1432 11.086 14.6131 11.0872 14.9036 10.7417L18.7817 6.12877C18.7819 6.12851 18.7821 6.1282 18.7823 6.12793C19.073 5.78117 19.0721 5.21768 18.7823 4.87207Z" fill="white"/>
</svg>

                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/* ==========================================================================
   EDITOR SCHEMA
   Matches the official Fynd section schema example exactly:
   https://docs.fynd.com/partners/commerce/themes/vuejs/section-overview/
     settings = { name, label, props: [...], blocks: [ { type, name, props: [...] } ] }
   Field values are read in the component as props.<id>.value /
   block.props.<id>.value.
   ========================================================================== */

export const settings = {
  label: "Lens Test Latest",
  props: [
    { type: "image_picker", id: "logo_image", label: "Logo Image" },

    { type: "checkbox", id: "show_intro", label: "Show an intro screen before question 1", default: false },
    { type: "image_picker", id: "intro_background_image", label: "Intro Background Image" },
    { type: "text", id: "intro_heading", label: "Intro Heading", default: "Find Your Perfect Lens Match" },
    { type: "text", id: "intro_subheading", label: "Intro Subheading", default: "" },
    { type: "text", id: "intro_button_text", label: "Intro Button Text", default: "Start The Lens Test" },

    { type: "text", id: "review_heading", label: "Review Screen Heading", default: "Review Answers" },
    { type: "text", id: "review_subheading", label: "Review Screen Subheading", default: "Review or edit your previous responses" },

    { type: "text", id: "loading_heading", label: "Loading Heading", default: "Matching your lens" },
    { type: "text", id: "loading_description", label: "Loading Description", default: "" },
    { type: "image_picker", id: "loading_image_1", label: "Loading Filmstrip — Image 1" },
    { type: "image_picker", id: "loading_image_2", label: "Loading Filmstrip — Image 2" },
    { type: "image_picker", id: "loading_image_3", label: "Loading Filmstrip — Image 3" },
    { type: "image_picker", id: "loading_image_4", label: "Loading Filmstrip — Image 4 (optional)", info: "Add more images to make the filmstrip slide through a longer sequence." },
    { type: "image_picker", id: "loading_image_5", label: "Loading Filmstrip — Image 5 (optional)" },
    { type: "text", id: "loading_step_1", label: "Loading Checklist Step 1", default: "" },
    { type: "text", id: "loading_step_2", label: "Loading Checklist Step 2", default: "" },
    { type: "text", id: "loading_step_3", label: "Loading Checklist Step 3", default: "" },

    { type: "text", id: "store_link", label: "Visit Store Link", default: "/locate-us" },
  ],

  blocks: [
    {
      type: "question",
      name: "Question",
      props: [
        { type: "text", id: "title", label: "Question Title", default: "" },
        {
          type: "checkbox",
          id: "multi_select",
          label: "Allow selecting more than one option?",
          default: false,
        },
        { type: "image_picker", id: "image", label: "Question Image (Desktop)", info: "Full-width background image for this question. Used on desktop, and on mobile too if no mobile image is set below." },
        { type: "image_picker", id: "mobile_image", label: "Question Image (Mobile, optional)", info: "Optional. If set, this image is used instead of the desktop image on mobile screens. Leave empty to reuse the desktop image on mobile." },

        { type: "text", id: "option_1_label", label: "Option 1 — Label", default: "" },
        { type: "image_picker", id: "option_1_icon", label: "Option 1 — Icon" },
        { type: "text", id: "option_1_tags", label: "Option 1 — Result Tags (comma-separated)", default: "", info: "Tags used to match this answer to a result, e.g. 'digital, screens'" },

        { type: "text", id: "option_2_label", label: "Option 2 — Label", default: "" },
        { type: "image_picker", id: "option_2_icon", label: "Option 2 — Icon" },
        { type: "text", id: "option_2_tags", label: "Option 2 — Result Tags (comma-separated)", default: "", info: "Tags used to match this answer to a result, e.g. 'digital, screens'" },

        { type: "text", id: "option_3_label", label: "Option 3 — Label", default: "" },
        { type: "image_picker", id: "option_3_icon", label: "Option 3 — Icon" },
        { type: "text", id: "option_3_tags", label: "Option 3 — Result Tags (comma-separated)", default: "", info: "Tags used to match this answer to a result, e.g. 'digital, screens'" },

        { type: "text", id: "option_4_label", label: "Option 4 — Label", default: "" },
        { type: "image_picker", id: "option_4_icon", label: "Option 4 — Icon" },
        { type: "text", id: "option_4_tags", label: "Option 4 — Result Tags (comma-separated)", default: "", info: "Tags used to match this answer to a result, e.g. 'digital, screens'" },

        { type: "text", id: "option_5_label", label: "Option 5 — Label", default: "" },
        { type: "image_picker", id: "option_5_icon", label: "Option 5 — Icon" },
        { type: "text", id: "option_5_tags", label: "Option 5 — Result Tags (comma-separated)", default: "", info: "Tags used to match this answer to a result, e.g. 'digital, screens'" },

        { type: "text", id: "option_6_label", label: "Option 6 — Label", default: "" },
        { type: "image_picker", id: "option_6_icon", label: "Option 6 — Icon" },
        { type: "text", id: "option_6_tags", label: "Option 6 — Result Tags (comma-separated)", default: "", info: "Tags used to match this answer to a result, e.g. 'digital, screens'" },

        { type: "text", id: "option_7_label", label: "Option 7 — Label", default: "" },
        { type: "image_picker", id: "option_7_icon", label: "Option 7 — Icon" },
        { type: "text", id: "option_7_tags", label: "Option 7 — Result Tags (comma-separated)", default: "", info: "Tags used to match this answer to a result, e.g. 'digital, screens'" },

        { type: "text", id: "option_8_label", label: "Option 8 — Label", default: "" },
        { type: "image_picker", id: "option_8_icon", label: "Option 8 — Icon" },
        { type: "text", id: "option_8_tags", label: "Option 8 — Result Tags (comma-separated)", default: "", info: "Tags used to match this answer to a result, e.g. 'digital, screens'" },

        { type: "text", id: "option_9_label", label: "Option 9 — Label", default: "" },
        { type: "image_picker", id: "option_9_icon", label: "Option 9 — Icon" },
        { type: "text", id: "option_9_tags", label: "Option 9 — Result Tags (comma-separated)", default: "", info: "Tags used to match this answer to a result, e.g. 'digital, screens'" },
      ],
    },
    {
      type: "fact",
      name: "Fact Screen",
      props: [
        {
          type: "text",
          id: "after_question",
          label: "Insert after question number",
          default: "",
          info: "e.g. 2 places this fact screen right after the 2nd question block",
        },
        { type: "image_picker", id: "background_image", label: "Background Photo (optional)", info: "Full-screen background photo behind the fact card, like the question screens" },
        { type: "image_picker", id: "icon_image", label: "Icon / Graphic (optional)", info: "Small graphic shown above the label, e.g. an eye icon. Falls back to a dotted icon if left empty." },
        { type: "text", id: "label", label: "Small Label", default: "Did You Know?" },
        { type: "text", id: "stat", label: "Big Stat Text", default: "", info: "e.g. 7" },
        { type: "text", id: "stat_suffix", label: "Stat Suffix Text (optional)", default: "", info: "Small text shown right next to the big stat, e.g. 'signs' to read as '7 signs'" },
        { type: "text", id: "description", label: "Description", default: "" },
        { type: "text", id: "button_text", label: "Button Text", default: "Continue" },
      ],
    },
    {
      type: "result",
      name: "Result / Lens Recommendation",
      props: [
        {
          type: "text",
          id: "match_tags",
          label: "Matching Tags (comma-separated)",
          default: "",
          info: "This result wins when the user's answers add up to the most matches on these tags",
        },
        { type: "text", id: "lens_name", label: "Lens Name", default: "" },
        { type: "text", id: "lens_tagline", label: "Lens Tagline", default: "" },
        { type: "video", id: "hero_video", label: "Hero Background Video (Desktop)", info: "Upload a video that plays as an animated background on the result screen. Used on desktop, and on mobile too if no mobile video is set below. If the lens graphic is part of the video, leave 'Hero Lens Graphic' below empty. Video is muted and loops automatically." },
        { type: "video", id: "hero_video_mobile", label: "Hero Background Video (Mobile, optional)", info: "Optional. If set, this video plays instead of the desktop video on mobile screens. Leave empty to reuse the desktop video on mobile." },
        { type: "image_picker", id: "hero_video_poster", label: "Hero Video Poster Image (optional)", info: "Shown while the video loads, or as a fallback if the video can't play. Only used when a Hero Background Video is set." },
        { type: "image_picker", id: "hero_image", label: "Hero Lens Graphic", info: "Static lens graphic shown above the result. Only used when no Hero Background Video is set above." },
        { type: "text", id: "learn_more_link", label: "Learn More Link", default: "" },

        { type: "image_picker", id: "feature_1_icon", label: "Feature 1 — Icon" },
        { type: "text", id: "feature_1_title", label: "Feature 1 — Title", default: "" },
        { type: "text", id: "feature_1_description", label: "Feature 1 — Description", default: "" },

        { type: "image_picker", id: "feature_2_icon", label: "Feature 2 — Icon" },
        { type: "text", id: "feature_2_title", label: "Feature 2 — Title", default: "" },
        { type: "text", id: "feature_2_description", label: "Feature 2 — Description", default: "" },

        { type: "image_picker", id: "feature_3_icon", label: "Feature 3 — Icon" },
        { type: "text", id: "feature_3_title", label: "Feature 3 — Title", default: "" },
        { type: "text", id: "feature_3_description", label: "Feature 3 — Description", default: "" },

        { type: "image_picker", id: "feature_4_icon", label: "Feature 4 — Icon" },
        { type: "text", id: "feature_4_title", label: "Feature 4 — Title", default: "" },
        { type: "text", id: "feature_4_description", label: "Feature 4 — Description", default: "" },

        { type: "text", id: "stat_percent", label: "Stat Percentage", default: "", info: "e.g. 90%" },
        {
          type: "text",
          id: "stat_description",
          label: "Stat Description",
          default: "",
          info: "e.g. Of customers with similar lifestyles choose this lens.",
        },
        { type: "text", id: "rating", label: "Rating", default: "", info: "e.g. 4.8/5" },
      ],
    },
  ],
};

Component.settings = settings;
export default Component;