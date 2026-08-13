import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/sections/lens-test.less";
import ArrowTop from "../assets/images/back.svg";

const questions = [
  {
    id: "age",
    title: "What Is Your Age?",
    subtitle: "FIND YOUR PERFECT LENS MATCH",
    options: ["< 20", "20-40", "40+"],
    videoKeys: ["age_image_1", "age_image_2", "age_image_3"]
  },
  {
    id: "vision",
    title: "What Type of Correction You Need?",
    subtitle: "UNDERSTANDING YOUR NEEDS",
    options: ["Near", "Far", "Both"]
  },
  {
    id: "lifestyle",
    title: "What's Your Lifestyle?",
    subtitle: "FIND YOUR PERFECT LENS MATCH",
    options: [
      "Study & Screens",
      "Home & Family",
      "Work & Commute",
      "Business Leaders",
      "Specialist Work"
    ],
    lifeImageKeys: [
      "lifestyle_image_1",
      "lifestyle_image_2",
      "lifestyle_image_3",
      "lifestyle_image_4",
      "lifestyle_image_5"
    ],
    imageKeys: [
      "life_image_1",
      "life_image_2",
      "life_image_3",
      "life_image_4",
      "life_image_5"
    ]
  }
];

// Human readable labels for the "Your Selections" pills
const questionLabels = {
  age: "Age",
  vision: "Vision",
  lifestyle: "Lifestyle"
};


const timeline = {
normal: { start: 0, end: 0 },
  wide: { start: 0, end: 2 },
  digital: { start: 2, end: 3 },
  customized: { start: 3, end: 5 }
};

const timelineMobile = {
normal: { start: 0, end: 0 },
  wide: { start: 0, end: 2 },
  digital: { start: 2, end: 3 },
  customized: { start: 3, end: 5 }
};

const progressiveDotsMap = {
  normal: 4,
  wide: 5,
  digital: 7,
  customized: 9
};

const visionTimingsDesktop = {
  default: 0,
  near: 0,
  far: 1,
  both: 0.8
};

const visionTimingsMobile = {
  default: 0,
  near: 0,
  far: 2,
  both: 1.3,
};

export function Component({ props = {} }) {
  const { background_image, logo_image } = props;

  const [currentStep, setCurrentStep] = useState("start");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [progressiveMode, setProgressiveMode] = useState(false);
  const [lensType, setLensType] = useState("normal");
  const [sliderValue, setSliderValue] = useState(0);
  const [resultData, setResultData] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [prevImage, setPrevImage] = useState(null);
  const [imageSwapId, setImageSwapId] = useState(0);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);

  const [history, setHistory] = useState([]);

  const [prevLifestyleVideo, setPrevLifestyleVideo] = useState(null);
  const [currentLifestyleVideo, setCurrentLifestyleVideo] = useState(null);
  const [lifestyleSwapId, setLifestyleSwapId] = useState(0);

  const videoRef = useRef(null);
  const intervalRef = useRef(null);
  const sliderIntervalRef = useRef(null);

  const visionVideoRef = useRef(null);
  const visionintervalRef = useRef(null);

  useEffect(() => {
    if (currentStep === "progressive" && videoRef.current) {
      setLensType("normal");
      setSliderValue(0);

      const activeTimeline = isMobile ? timelineMobile : timeline;

      videoRef.current.currentTime = activeTimeline.normal.start;
      videoRef.current.play();
    }
  }, [currentStep]);

  

  useEffect(() => {
    if (currentStep === "questions") {
      const q = questions[currentQuestion];
      const firstIndex = 0;

      if (q.id === "age") {
       const firstImage = isMobile
  ? props[`age_mobile_image_${firstIndex + 1}`]?.value
  : props[`age_image_${firstIndex + 1}`]?.value;

        setCurrentImage(firstImage);
        setSelectedOption(q.options[firstIndex]);
      }

      if (q.id === "lifestyle" && q.lifeImageKeys) {
        // FIX: this previously read `life_video_${n}`, a prop key that
        // doesn't exist in settings (the actual photos are
        // `lifestyle_image_1`..`5`, referenced via q.lifeImageKeys). That
        // made the initial photo silently undefined, leaving the screen
        // blank until the user clicked an option (handleAnswer used the
        // correct key already).
   const imageKey = isMobile
  ? `lifestyle_mobile_image_${firstIndex + 1}`
  : q.lifeImageKeys[firstIndex];

const firstImage = props[imageKey]?.value;

setCurrentLifestyleVideo(firstImage);

        setSelectedOption(q.options[firstIndex]);
      }

      if (q.id === "vision") {
        // FIX: default to the first option ("Near") instead of null so the
        // pill/UI matches the pre-selected state shown in the design, and it
        // lines up with the video already sitting at visionTimings.default.
        setSelectedOption(q.options[firstIndex]);

        if (visionVideoRef.current) {
          const video = visionVideoRef.current;

          const playToDefault = () => {
            video.currentTime = 0;
            video.play();

            const timings = isMobile
  ? visionTimingsMobile
  : visionTimingsDesktop;


            const stopAtDefault = () => {
              if (video.currentTime >= timings.default) {
                video.pause();
                video.removeEventListener("timeupdate", stopAtDefault);
              }
            };

            video.addEventListener("timeupdate", stopAtDefault);
          };

          if (video.readyState >= 1) {
            playToDefault();
          } else {
            video.onloadedmetadata = playToDefault;
          }
        }
      }
    }

    if (currentStep === "progressive") {
      if (videoRef.current) {
        const video = videoRef.current;

        const playToDefault = () => {
       const activeTimeline = isMobile ? timelineMobile : timeline;

video.currentTime = activeTimeline.normal.start;

video.play();

const stopAtDefault = () => {
    if (video.currentTime >= activeTimeline.normal.end) {
        video.pause();
        video.currentTime = activeTimeline.normal.end;
        video.removeEventListener("timeupdate", stopAtDefault);
    }
};

          video.addEventListener("timeupdate", stopAtDefault);
        };

        if (video.readyState >= 1) {
          playToDefault();
        } else {
          video.onloadedmetadata = playToDefault;
        }
      }
    }
  }, [currentStep, currentQuestion, isMobile]);

  useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 767);
  };

  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
  };
}, []);







const resultsMap = () => ({
  "Study & Screens": {
    title: "GadgetPro lenses",
    description: "Ideal for long screen hours & digital comfort.",
    image: isMobile
  ? props?.studyscreens_mobile_image?.value
  : props?.studyscreens_image?.value,
    link: "/sections/gadget-pro-lens",
    logo: props?.gadget_pro_logo?.value,
    points: [
      "Reduces eye strain from screens & devices",
      "Includes blue-light protection",
      "Lightweight and great for all-day wear",
      "Available in multiple colors and styles"
    ]
  },
  "Home & Family": {
    title: "GadgetPro lenses",
    description: "Comfortable clarity for your daily routine.",
    image: isMobile
  ? props?.homefamily_mobile_image?.value
  : props?.homefamily_image?.value,
    link: "/sections/gadget-pro-lens",
    logo: props?.gadget_pro_logo?.value,
    points: [
      "Perfect for indoor and casual outdoor use",
      "Provides gentle eye protection from light",
      "Designed for long home hours",
      "Stylish, durable and easy to wear"
    ]
  },
  "Work & Commute": {
    title: "Drivesure lenses",
    description: "Made for focus and comfort on the move.",
      image: isMobile
  ? props?.workcommute_mobile_image?.value
  : props?.workcommute_image?.value,
    link: "/sections/drive-sure-lens",
    logo: props?.drive_sure_logo?.value,
    points: [
      "Reduces glare while driving or traveling",
      "Enhances clarity in changing light",
      "Lightweight for busy workdays",
      "Offers both UV and screen protection"
    ]
  },
  "Business Leaders": {
    title: "Clearvision lenses",
    description: "Professional clarity with a premium look.",
          image: isMobile
  ? props?.businessleaders_mobile_image?.value
  : props?.businessleaders_image?.value,
    link: "/sections/clear-vision-lens",
    logo: props?.clear_vision_logo?.value,
    points: [
      "Sharp vision for meetings and screens",
      "Anti-reflective for a polished appearance",
      "Comfortable during long hours at work",
      "Sleek and elegant frame options"
    ]
  },
  "Specialist Work": {
    title: "TruVision lenses",
    description: "Designed for technical and detail-focused tasks.",
          image: isMobile
  ? props?.specialistwork_mobile_image?.value
  : props?.specialistwork_image?.value,
    link: "/sections/tru-vision-lens",
    logo: props?.tru_vision_logo?.value,
    points: [
      "Delivers high-definition clarity and focus",
      "Enhances contrast for accurate vision",
      "Custom coatings for specialist needs",
      "Stable, precise fit for long sessions"
    ]
  }
});

const progressiveResultMap = () => ({
  normal: {
    image: isMobile
  ? props?.progressive_normal_mobile_image?.value
  : props?.progressive_normal_image?.value,
    title: "Regular lenses",
    link: "/sections/progressive-regular-lens",
    logo: props?.regular_lens_logo?.value,
    description: "Everyday clarity with lasting comfort.",
    points: [
      "Great for reading and daily use at home",
      "Gentle on eyes, reduces strain naturally",
      "Clear, reliable, and easy to wear daily",
      "Durable for everyday life and comfort"
    ]
  },
  wide: {
    image: isMobile
  ? props?.progressive_wide_mobile_image?.value
  : props?.progressive_wide_image?.value,
    title: "Comfort lenses",
    link: "/sections/progressive-comfort-lens",
    logo: props?.comfort_lens_logo?.value,
    description: "All-day ease for active eyes.",
    points: [
      "Keeps eyes fresh, cool, and relaxed",
      "Prevents dryness and eye fatigue",
      "Soft, light, and breathable design",
      "Effortless comfort throughout the day"
    ]
  },
  digital: {
        image: isMobile
  ? props?.progressive_digital_mobile_image?.value
  : props?.progressive_digital_image?.value,
    title: "Supreme lenses",
    link: "/sections/progressive-supreme-lens",
    logo: props?.supreme_lens_logo?.value,
    description: "Premium clarity with total care.",
    points: [
      "Sharp vision in every light condition",
      "Advanced anti-glare protection",
      "Steady focus for screens and reading",
      "Long-lasting comfort and superior quality"
    ]
  },
  customized: {
          image: isMobile
  ? props?.progressive_customized_mobile_image?.value
  : props?.progressive_customized_image?.value,
    title: "Lumino lenses",
    link: "/sections/progressive-lumino-lens",
    logo: props?.lumino_lens_logo?.value,
    description: "Smart vision that adapts to light.",
    points: [
      "Adjusts to brightness instantly and smoothly",
      "Reduces glare indoors and outdoors",
      "Enhances color depth and contrast",
      "Stylish, protective, and crystal clear"
    ]
  }
});






  const handleStart = () => {
    setHistory((prev) => [...prev, { step: currentStep }]);
    setCurrentStep("questions");
    setCurrentQuestion(0);
  };

  const jumpToLensTypeVision = (type) => {
    if (!visionVideoRef.current) return;

    const video = visionVideoRef.current;
    const currentTime = video.currentTime;
    
    const timings = isMobile
  ? visionTimingsMobile
  : visionTimingsDesktop;

const targetTime = timings[type];

    if (visionintervalRef.current) {
      clearInterval(visionintervalRef.current);
      visionintervalRef.current = null;
    }

    video.pause();

    if (currentTime > targetTime) {
      visionintervalRef.current = setInterval(() => {
        if (video.currentTime <= targetTime) {
          clearInterval(visionintervalRef.current);
          visionintervalRef.current = null;
          video.currentTime = targetTime;
        } else {
          video.currentTime -= 0.033;
        }
      }, 33);
    } else if (currentTime < targetTime) {
      video.playbackRate = 1;
      video.play();

      const checkForward = () => {
        if (video.currentTime >= targetTime) {
          video.pause();
          video.currentTime = targetTime;
        } else {
          requestAnimationFrame(checkForward);
        }
      };
      requestAnimationFrame(checkForward);
    }
  };

  const handleAnswer = (option, index) => {
    setSelectedOption(option);

    const q = questions[currentQuestion];

    if (q.videoKeys && q.videoKeys[index]) {
      const videoKey = q.videoKeys[index];
      setCurrentVideo(props[videoKey]?.value || "");
    } else {
      setCurrentVideo(null);
    }

    if (q.id === "age") {
     const newImage = isMobile
  ? props[`age_mobile_image_${index + 1}`]?.value
  : props[`age_image_${index + 1}`]?.value;

      setPrevImage(currentImage);
      setCurrentImage(newImage);
      setImageSwapId((prev) => prev + 1);
    }

    if (q.id === "lifestyle") {
    const imageKey = isMobile
  ? `lifestyle_mobile_image_${index + 1}`
  : q.lifeImageKeys[index];

const newVideo = props[imageKey]?.value || "";
      setPrevLifestyleVideo(currentLifestyleVideo);
      setCurrentLifestyleVideo(newVideo);
      setLifestyleSwapId((prev) => prev + 1);
    }

    if (q.id === "vision") {
      jumpToLensTypeVision(option.toLowerCase());
    }
  };

  const progressiveVideo = isMobile
  ? props?.progressive_normal_video_mobile?.value
  : props?.progressive_normal_video?.value;

  const animateSlider = (targetValue) => {
    if (sliderIntervalRef.current) {
      clearInterval(sliderIntervalRef.current);
      sliderIntervalRef.current = null;
    }

    const startValue = sliderValue;
    const distance = targetValue - startValue;
    const duration = 500;
    const steps = 30;
    const stepValue = distance / steps;
    const stepTime = duration / steps;

    let currentStepCount = 0;

    sliderIntervalRef.current = setInterval(() => {
      currentStepCount++;
      if (currentStepCount >= steps) {
        clearInterval(sliderIntervalRef.current);
        sliderIntervalRef.current = null;
        setSliderValue(targetValue);
      } else {
        setSliderValue(startValue + stepValue * currentStepCount);
      }
    }, stepTime);
  };

  const jumpToLensType = (type) => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const currentTime = video.currentTime;
  const activeTimeline = isMobile ? timelineMobile : timeline;

const { end } = activeTimeline[type];
const targetTime = end;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    video.pause();

    if (currentTime > targetTime) {
      intervalRef.current = setInterval(() => {
        if (video.currentTime <= targetTime) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          video.currentTime = targetTime;
        } else {
          video.currentTime -= 0.033;
        }
      }, 33);
    } else if (currentTime < targetTime) {
      video.playbackRate = 1;
      video.play();

      const checkForward = () => {
        if (video.currentTime >= targetTime) {
          video.pause();
          video.currentTime = targetTime;
        } else {
          requestAnimationFrame(checkForward);
        }
      };
      requestAnimationFrame(checkForward);
    }
  };

  const previousLensType = useRef("normal");

  const handleSlider = (e) => {
    const value = Number(e.target.value);

    if (sliderIntervalRef.current) {
      clearInterval(sliderIntervalRef.current);
      sliderIntervalRef.current = null;
    }

    setSliderValue(value);

    let newType = "normal";
    if (value < 25) newType = "normal";
    else if (value < 50) newType = "wide";
    else if (value < 75) newType = "digital";
    else newType = "customized";

    const tabChanged = previousLensType.current !== newType;
    setLensType(newType);

    if (!tabChanged) return;

    previousLensType.current = newType;
    jumpToLensType(newType);
  };

  const handleTabClick = (type) => {
    setLensType(type);

    const sliderMap = { normal: 0, wide: 33, digital: 66, customized: 100 };

    animateSlider(sliderMap[type]);
    jumpToLensType(type);
    previousLensType.current = type;
  };

  const renderDots = (filled, total = 10) => (
    <div className={styles.dotsRow}>
      {[...Array(total)].map((_, i) => (
        <span
          key={i}
          className={`${styles.dot} ${i < filled ? styles.filledDot : ""}`}
        ></span>
      ))}
    </div>
  );

  const handleBack = () => {
    if (history.length === 0) return;

    const last = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setCurrentStep(last.step || "start");

    if (last.step === "questions") {
      setCurrentQuestion(last.question ?? 0);
      setAnswers(last.answers || {});
      setSelectedOption(last.selectedOption || null);
    }
  };

  const handleNext = () => {
    setHistory((prev) => [
      ...prev,
      {
        step: currentStep,
        question: currentQuestion,
        answers,
        selectedOption
      }
    ]);

    const newAnswers = { ...answers, [questions[currentQuestion].id]: selectedOption };
    setAnswers(newAnswers);

    if (questions[currentQuestion].id === "age" && selectedOption === "40+") {
      setProgressiveMode(true);
      setCurrentStep("progressive");
      return;
    }

    if (currentQuestion === questions.length - 1) {
      const lifestyleAnswer = selectedOption;
      const result = resultsMap(props)[lifestyleAnswer];
      setResultData(result);
      setCurrentStep("result");
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleProgressiveNext = () => {
    const progMap = progressiveResultMap(props);
    setResultData(progMap[lensType]);
    setCurrentStep("result");
  };

  // FIX: pills now include the *current* in-progress selection (not just
  // confirmed answers), and render with a "YOUR SELECTIONS" label, a
  // checkmark, and a "Label: Value" format to match the design.
  const getSelectionPills = () => {
    const combined = { ...answers };
    const q = questions[currentQuestion];
    if (currentStep === "questions" && q && selectedOption) {
      combined[q.id] = selectedOption;
    }
    if (currentStep === "progressive" || currentStep === "result") {
      combined.age = combined.age || "40+";
    }
    return Object.entries(combined).filter(([, value]) => Boolean(value));
  };

  const renderSelectionsCard = () => {
    const pills = getSelectionPills();
    if (pills.length === 0) return null;

    return (
      <div className={styles.selectionsWrapper}>
        <p className={styles.selectionsLabel}>Your Selections</p>
        <div className={styles.previousSelectedAnswers}>
         {pills
  .filter(([key]) => key !== "lifestyle")
  .map(([key, value]) => (
    <span key={key} className={styles.answerPill}>
      <span className={styles.checkIcon}>&#10003;</span>
      {questionLabels[key] || key}: <strong>{value}</strong>
    </span>
))}
        </div>
      </div>
    );
  };

  // FIX: previously only a single top-left "back" button existed. The design
  // calls for a back arrow and a forward/next arrow, both pinned to the
  // bottom corners of the screen.
  const renderNavArrows = (onNext, nextDisabled) => (
    <>
      <button
        onClick={handleBack}
        className={`${styles.navArrow} ${styles.navArrowLeft}`}
        aria-label="Back"
      >
        <ArrowTop />
      </button>
      {onNext && (
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className={`${styles.navArrow} ${styles.navArrowRight}`}
          aria-label="Next"
        >
          <ArrowTop />
        </button>
      )}
    </>
  );

  // START SCREEN
  if (currentStep === "start") {
    return (
      <div className={styles["lens-test-section"]}>
        <div className={styles["card-wrapper"]}>
          <div className={styles.card}>
            <div className={styles.hero}>
              <img src={background_image?.value} className={styles["hero-photo"]} alt="" />
              <div className={styles["hero-overlay"]}></div>
            </div>

            <div className={styles.content}>
              <div className={`${styles.brand} ${styles.animateTop}`}>
                <img src={logo_image?.value} className={styles.brandLogo} alt="" />
              </div>

              <h2 className={`${styles.heading} ${styles.animateBottom}`}>
                Find Your Perfect Lens Match
              </h2>

              <p className={`${styles.subheading} ${styles.animateBottom}`}>
                Take this quick test to discover the right lens for your eyes, lifestyle, and screen time.
              </p>

              <button
                onClick={handleStart}
                className={`${styles.button} ${styles["button-primary"]} ${styles.animateBottom}`}
              >
                Start The Lens Test
                <span className={styles.buttonIcon}><span></span></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // QUESTION SCREEN
  if (currentStep === "questions") {
    const q = questions[currentQuestion];
    const isLifestyle = q.id === "lifestyle";

    return (
      <div className={styles["lens-test-section"]}>
        {renderNavArrows(handleNext, !selectedOption)}

        <div className={styles["card-wrapper"]}>
          <div className={`${styles.card} ${styles[q.id]}`}>
            <div key={currentQuestion} className={styles["question-wrapper"]}>
              {/* Logo + selections — overlays the photo, doesn't push it down */}
              <div className={styles.questionBrand}>
                <img src={logo_image?.value} className={styles.brandLogo} alt="" />
                {renderSelectionsCard()}
              </div>

              {/* Age image */}
              {q.id === "age" && (
                <div className={styles["age-image-wrapper"]}>
                  {prevImage && (
                    <img
                      key={`prev-${imageSwapId}`}
                      src={prevImage}
                      className={`${styles.ageImageCopy} ${styles.fadeOut}`}
                      alt=""
                    />
                  )}

                  {currentImage && (
                    <img
                      key={`current-${imageSwapId}`}
                      src={currentImage}
                      className={`${styles.ageImage} ${imageSwapId === 0 ? "" : styles.fadeIn}`}
                      alt=""
                    />
                  )}

                 
                </div>
              )}

              {/* Vision video */}
             {/* Vision video */}
{q.id === "vision" && (
  <div className={styles["vision-video-wrapper"]}>
    <video
      ref={visionVideoRef}
      key={isMobile ? "vision-mobile" : "vision-desktop"}
      src={isMobile ? props.vision_video_mobile?.value : props.vision_video?.value}
      className={styles["vision-video"]}
      autoPlay
      muted
      playsInline
    />
  </div>
)}

              {/* Lifestyle video */}
              {isLifestyle && (
                <div  className={styles["lifestyle-glasses-wrapper"]}>
                  {prevLifestyleVideo && (
                    <img
                      key={`prev-${lifestyleSwapId}`}
                      src={prevLifestyleVideo}
                      className={`${styles["lifestyle-video-copy"]} ${styles.zoomfadeOut}`}
                      alt=""
                    />
                  )}

                  {currentLifestyleVideo && (
                    <img
                      key={`current-${lifestyleSwapId}`}
                      src={currentLifestyleVideo}
                      className={`${styles["lifestyle-video"]} ${lifestyleSwapId === 0 ? "" : styles.zoomfadeIn}`}
                      alt=""
                    />
                  )}
                </div>
              )}

              <div className={styles.questionContentWrapper}>
             <p
  className={`${styles["question-subtitle"]} ${
    isLifestyle ? styles["lifestyle-subtitle"] : ""
  }`}
>
  {q.subtitle}
</p>

                <h2 className={styles["question-title"]}>
                  {q.title}
                </h2>

                {isLifestyle ? (
                  <div className={styles["lifestyle-options"]}>
                    {q.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(option, index)}
                        className={`${styles["lifestyle-option"]} ${selectedOption === option ? styles["lifestyle-selected"] : ""}`}
                      >
                        {q.imageKeys && props[q.imageKeys[index]]?.value && (
                          <div className={styles["lifestyle-icon-wrapper"]}>
                            <img
                              src={props[q.imageKeys[index]].value}
                              alt={option}
                              className={styles["lifestyle-icon"]}
                            />
                          </div>
                        )}
                        <span className={styles["lifestyle-option-text"]}>{option}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className={styles.options}>
                    {q.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(option, index)}
                        className={`${styles.option} ${selectedOption === option ? styles.selected : ""}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PROGRESSIVE SCREEN
  if (currentStep === "progressive") {
    return (
      <div className={styles["lens-test-section"]}>
        {renderNavArrows(handleProgressiveNext, false)}

        <div className={styles["card-wrapper"]}>
          <div className={styles.card}>
            <div className={styles["question-wrapper"]}>
              {/* FIX: entrance animation removed — this screen no longer
                  animates in on mount. It only used to fire once when the
                  progressive step first appeared, not on tab/slider
                  changes (those are handled via JS video scrubbing), so
                  removing it doesn't affect the option-change behavior. */}
              <div className={styles.questionBrand}>
                <img src={logo_image?.value} className={styles.brandLogo} alt="" />
              </div>

              {/* FIX: made full-bleed like age-image-wrapper/etc. The video
                  itself already contains the lens graphic, badge text, and
                  description as baked-in motion graphics — the separate
                  badge/description overlay was duplicating that content, so
                  it's been removed. Entrance fade also removed (see above). */}
             <div className={styles["progressive-video-wrapper"]}>
  <video
    ref={videoRef}
    key={isMobile ? "progressive-mobile" : "progressive-desktop"}
    src={progressiveVideo}
    autoPlay
    muted
    playsInline
    loop
    className={styles["progressive-video"]}
  />
</div>

              <div className={`${styles.questionContentWrapper} ${styles.questionContentWrapperprogressive}`}>
                <p className={styles["question-subtitle"]}>
                  DRAG TO VIEW YOUR PERFECT LENS.
                </p>

                <div className={styles["slider-wrapper"]}>
                  <input
                    id="progressive-slider"
                    className={styles["pink-slider"]}
                    type="range"
                    min="0"
                    max="100"
                    value={sliderValue}
                    onInput={handleSlider}
                  />
                </div>

                <div className={styles["progressive-tabs"]}>
                  {["normal", "wide", "digital", "customized"].map((key) => (
                    <span
                      key={key}
                      onClick={() => handleTabClick(key)}
                      className={`${styles.tab} ${lensType === key ? styles.active : ""}`}
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </span>
                  ))}
                </div>

                <div className={styles.progressiveGrid}>
                  <div className={styles.gridRow}>
                    <span className={styles.gridLabel}>Near:</span>
                    {renderDots(progressiveDotsMap[lensType])}
                  </div>

                  <div className={styles.gridRow}>
                    <span className={styles.gridLabel}>Intermediate:</span>
                    {renderDots(progressiveDotsMap[lensType])}
                  </div>

                  <div className={styles.gridRow}>
                    <span className={styles.gridLabel}>Far:</span>
                    {renderDots(progressiveDotsMap[lensType])}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RESULT SCREEN
  if (currentStep === "result" && resultData) {
    return (
      <div className={styles["lens-test-section"]}>

        <div className={styles["card-wrapper"]}>
          <div className={styles.card}>
            <div className={styles["thankyou-wrapper"]}>

              <div className={styles.resultheader}>
              <p className={`${styles["result-subtitle"]} ${styles.animateTop}`}>LENS TEST RESULT</p>
              <h2 className={`${styles["result-title"]} ${styles.animateTop}`}>THANK YOU!</h2>

              <p className={`${styles["result-text"]} ${styles.animateTop}`}>
                We've found the lens type that best fits your vision needs.
              </p>
              </div>

              <div className={`${styles["result-glasses"]} ${styles.animateTop}`}>
                <img src={resultData.image} alt={resultData.title} />
              </div>

              <div className={`${styles["result-box"]}`}>

                {resultData.logo ? (
                  <img
                    src={resultData.logo}
                    alt={resultData.title}
                    className={styles["result-lens-logo"]}
                  />
                ) : (
                  <h3 className={styles["result-lens-title"]}>{resultData.title}</h3>
                )}

                <p className={styles["result-lens-description"]}>{resultData.description}</p>

                <ul className={styles["result-points"]}>
                  {resultData.points?.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>

                <a href={resultData.link} className={styles["learn-more-button"]}>
                  <div>Learn More</div>
                  <span className={styles.buttonIcon}><span></span></span>
                </a>

                <a href="/locate-us" className={styles["visit-store"]}>or Visit The Store</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export const settings = {
  label: "Lens Test New",
  props: [
    { type: "image_picker", id: "background_image", label: "Background Image" },
    { type: "image_picker", id: "logo_image", label: "Logo Image" },

    { type: "image_picker", id: "age_image_1", label: "Image: Age < 20" },
    { type: "image_picker", id: "age_image_2", label: "Image: Age 20-40" },
    { type: "image_picker", id: "age_image_3", label: "Image: Age 40+" },


    { type: "image_picker", id: "age_mobile_image_1", label: "Mobile Image: Age < 20" },
{ type: "image_picker", id: "age_mobile_image_2", label: "Mobile Image: Age 20-40" },
{ type: "image_picker", id: "age_mobile_image_3", label: "Mobile Image: Age 40+" },

   { type: "video", id: "vision_video", label: "Vision Question Video" },
{ type: "video", id: "vision_video_mobile", label: "Vision Question Video (Mobile)" },

    { type: "image_picker", id: "lifestyle_image_1", label: "Image: Study & Screens" },
    { type: "image_picker", id: "lifestyle_image_2", label: "Image: Home & Family" },
    { type: "image_picker", id: "lifestyle_image_3", label: "Image: Work & Commute" },
    { type: "image_picker", id: "lifestyle_image_4", label: "Image: Business Leaders" },
    { type: "image_picker", id: "lifestyle_image_5", label: "Image: Specialist Work" },
    

    { type: "image_picker", id: "lifestyle_mobile_image_1", label: "Mobile Image: Study & Screens" },
{ type: "image_picker", id: "lifestyle_mobile_image_2", label: "Mobile Image: Home & Family" },
{ type: "image_picker", id: "lifestyle_mobile_image_3", label: "Mobile Image: Work & Commute" },
{ type: "image_picker", id: "lifestyle_mobile_image_4", label: "Mobile Image: Business Leaders" },
{ type: "image_picker", id: "lifestyle_mobile_image_5", label: "Mobile Image: Specialist Work" },


    { type: "image_picker", id: "life_image_1", label: "Icon: Study & Screens" },
    { type: "image_picker", id: "life_image_2", label: "Icon: Home & Family" },
    { type: "image_picker", id: "life_image_3", label: "Icon: Work & Commute" },
    { type: "image_picker", id: "life_image_4", label: "Icon: Business Leaders" },
    { type: "image_picker", id: "life_image_5", label: "Icon: Specialist Work" },

    { type: "image_picker", id: "studyscreens_image", label: "Study and Screens result Image" },
    { type: "image_picker", id: "homefamily_image", label: "Home and Family result Image" },
    { type: "image_picker", id: "workcommute_image", label: "Work and Commute result Image" },
    { type: "image_picker", id: "businessleaders_image", label: "Business Leaders result Image" },
    { type: "image_picker", id: "specialistwork_image", label: "Specialist Work result Image" },

    { type: "image_picker", id: "studyscreens_mobile_image", label: "Study & Screens Mobile Result Image" },
{ type: "image_picker", id: "homefamily_mobile_image", label: "Home & Family Mobile Result Image" },
{ type: "image_picker", id: "workcommute_mobile_image", label: "Work & Commute Mobile Result Image" },
{ type: "image_picker", id: "businessleaders_mobile_image", label: "Business Leaders Mobile Result Image" },
{ type: "image_picker", id: "specialistwork_mobile_image", label: "Specialist Work Mobile Result Image" },

    { type: "video", id: "progressive_normal_video", label: "Progressive Lens Video" },
{ type: "video", id: "progressive_normal_video_mobile", label: "Progressive Lens Video (Mobile)" },

    { type: "image_picker", id: "progressive_normal_image", label: "Progressive Normal Result Image" },
    { type: "image_picker", id: "progressive_wide_image", label: "Progressive Wide Result Image" },
    { type: "image_picker", id: "progressive_digital_image", label: "Progressive Digital Result Image" },
    { type: "image_picker", id: "progressive_customized_image", label: "Progressive Customized Result Image" },

{ type: "image_picker", id: "progressive_normal_mobile_image", label: "Progressive Normal Mobile Result Image" },
{ type: "image_picker", id: "progressive_wide_mobile_image", label: "Progressive Wide Mobile Result Image" },
{ type: "image_picker", id: "progressive_digital_mobile_image", label: "Progressive Digital Mobile Result Image" },
{ type: "image_picker", id: "progressive_customized_mobile_image", label: "Progressive Customized Mobile Result Image" },


    { type: "image_picker", id: "gadget_pro_logo", label: "Gadget Pro Lens Logo" },
    { type: "image_picker", id: "drive_sure_logo", label: "Drive Sure Lens Logo" },
    { type: "image_picker", id: "clear_vision_logo", label: "Clear Vision Lens Logo" },
    { type: "image_picker", id: "tru_vision_logo", label: "Tru Vision Lens Logo" },
    { type: "image_picker", id: "regular_lens_logo", label: "Regular Lens Logo" },
    { type: "image_picker", id: "comfort_lens_logo", label: "Comfort Lens Logo" },
    { type: "image_picker", id: "supreme_lens_logo", label: "Supreme Lens Logo" },
    { type: "image_picker", id: "lumino_lens_logo", label: "Lumino Lens Logo" }
  ]
};

Component.settings = settings;
export default Component;