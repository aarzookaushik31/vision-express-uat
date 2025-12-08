import React, { useState, useEffect , useRef} from "react";
import styles from "../styles/sections/lens-test.less";
import BlurEffect from "../assets/images/blur-vision-lens.png";

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
    options: ["Near", "Far", "Both"],
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
    videoKeys: [
      "life_video_1",
      "life_video_2",
      "life_video_3",
      "life_video_4",
      "life_video_5"
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


const resultsMap = (props) => ({
  "Study & Screens": {
    title: "GadgetPro lenses",
    description: "Ideal for long screen hours & digital comfort.",
    image: props?.studyscreens_image?.value,
    link: "/sections/gadget-pro-lens",
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
    image: props?.homefamily_image?.value,
    link: "/sections/gadget-pro-lens",
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
    image: props?.workcommute_image?.value,
    link: "/sections/drive-sure-lens",
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
    image: props?.businessleaders_image?.value,
     link: "/sections/clear-vision-lens",
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
    image: props?.specialistwork_image?.value,
     link: "/sections/tru-vision-lens",
    points: [
      "Delivers high-definition clarity and focus",
      "Enhances contrast for accurate vision",
      "Custom coatings for specialist needs",
      "Stable, precise fit for long sessions"
    ]
  }
});


const progressiveResultMap = (props) => ({
  normal: {
    image: props?.progressive_normal_image.value,
    title: "Regular lenses",
    link: "/sections/progressive-regular-lens",
    description: "Everyday clarity with lasting comfort.",
    points: [
      "Great for reading and daily use at home",
      "Gentle on eyes, reduces strain naturally",
      "Clear, reliable, and easy to wear daily",
      "Durable for everyday life and comfort"
    ]
  },
  wide: {
    image: props?.progressive_wide_image.value,
    title: "Comfort lenses",
     link: "/sections/progressive-comfort-lens",
    description: "All-day ease for active eyes.",
    points: [
      "Keeps eyes fresh, cool, and relaxed",
      "Prevents dryness and eye fatigue",
      "Soft, light, and breathable design",
      "Effortless comfort throughout the day"
    ]
  },
  digital: {
    image: props?.progressive_digital_image.value,
    title: "Supreme lenses",
     link: "/sections/progressive-supreme-lens",
    description: "Premium clarity with total care.",
    points: [
      "Sharp vision in every light condition",
      "Advanced anti-glare protection",
      "Steady focus for screens and reading",
      "Long-lasting comfort and superior quality"
    ]
  },
  customized: {
    image: props?.progressive_customized_image.value,
    title: "Lumino lenses",
     link: "/sections/progressive-lumino-lens",
    description: "Smart vision that adapts to light.",
    points: [
      "Adjusts to brightness instantly and smoothly",
      "Reduces glare indoors and outdoors",
      "Enhances color depth and contrast",
      "Stylish, protective, and crystal clear"
    ]
  }
});

const timeline = {
  normal: { start: 0, end: 2 },
  wide: { start: 2, end: 3.2 },
  digital: { start: 3, end: 5 },
  customized: { start: 5, end: 6.3 },
};


const progressiveDotsMap = {
  normal: 4,
  wide: 5,
  digital: 7,
  customized: 9
};

const visionTimings = {
  default: 3,
  near: 4,
  far: 6,
  both: 8
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

    videoRef.current.currentTime = timeline.normal.start;
    videoRef.current.play();
  }
}, [currentStep]);



useEffect(() => {
  if (currentStep === "questions") {
    const q = questions[currentQuestion];

    const firstIndex = 0;

    if (q.id === "age") {
      const firstImage = props[`age_image_${firstIndex + 1}`]?.value;
      setCurrentImage(firstImage);
    }



      if (q.id === "lifestyle" && q.videoKeys) {
 const firstVideo = props[`life_video_${firstIndex + 1}`]?.value;
    setCurrentLifestyleVideo(firstVideo);

  }


 if (q.id === "vision") {
  if (visionVideoRef.current) {
    const video = visionVideoRef.current;

    const playToDefault = () => {
      video.currentTime = 0;
      video.play();

      const stopAtDefault = () => {
        if (video.currentTime >= visionTimings.default) {
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

  setSelectedOption(null);
}



    setSelectedOption(q.options[firstIndex]);
  }





if (currentStep === "progressive") {

  console.log("progressive lens question")
  if (videoRef.current) {
    const video = videoRef.current;
 console.log("progressive lens question video")
    const playToDefault = () => {
      video.currentTime = timeline.normal.start ?? 0;
      video.play();

      const stopAtDefault = () => {
        if (video.currentTime >= (timeline.normal.end ?? 0)) {
          video.pause();
          video.currentTime = timeline.normal.end ?? 0;
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










}, [currentStep, currentQuestion]);



  const handleStart = () => {
    setCurrentStep("questions");
    setCurrentQuestion(0);
  };



const jumpToLensTypeVision = (type) => {
  if (!visionVideoRef.current) return;
  
  const video = visionVideoRef.current;
  const currentTime = video.currentTime;
  const targetTime = visionTimings[type];
 
  
  // Clear any existing intervals
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
  const newImage = props[`age_image_${index + 1}`]?.value;

  setPrevImage(currentImage);
  setCurrentImage(newImage);

  setImageSwapId(prev => prev + 1); 
}


if (q.id === "lifestyle") {
  const newVideo = props[q.videoKeys[index]]?.value || "";

  setPrevLifestyleVideo(currentLifestyleVideo);
  setCurrentLifestyleVideo(newVideo);

  setLifestyleSwapId(prev => prev + 1);
}



if (q.id === "vision") {

jumpToLensTypeVision(option.toLowerCase());

}
};




 const progressiveVideo = props?.progressive_normal_video?.value;





const animateSlider = (targetValue) => {
  // Clear any existing slider animation
  if (sliderIntervalRef.current) {
    clearInterval(sliderIntervalRef.current);
    sliderIntervalRef.current = null;
  }

  const startValue = sliderValue;
  const distance = targetValue - startValue;
  const duration = 500; // milliseconds
  const steps = 30;
  const stepValue = distance / steps;
  const stepTime = duration / steps;
  
  let currentStep = 0;

  sliderIntervalRef.current = setInterval(() => {
    currentStep++;
    if (currentStep >= steps) {
      clearInterval(sliderIntervalRef.current);
      sliderIntervalRef.current = null;
      setSliderValue(targetValue);
    } else {
      setSliderValue(startValue + (stepValue * currentStep));
    }
  }, stepTime);
};





const jumpToLensType = (type) => {
  if (!videoRef.current) return;
  
  const video = videoRef.current;
  const currentTime = video.currentTime;
  const { start, end } = timeline[type];
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





const handleSlider = (e) => {
  const value = Number(e.target.value);

  if (sliderIntervalRef.current) {
    clearInterval(sliderIntervalRef.current);
    sliderIntervalRef.current = null;
  }
  
  setSliderValue(value);

  let type = "normal";
  if (value < 25) type = "normal";
  else if (value < 50) type = "wide";
  else if (value < 75) type = "digital";
  else type = "customized";

  setLensType(type);

  const { start, end } = timeline[type];
  const relative = (value % 25) / 25;
  const targetTime = start + (end - start) * relative;

  if (videoRef.current) {
    const video = videoRef.current;
    const currentTime = video.currentTime;
    
    // Clear any existing intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    video.pause();
    
    if (currentTime > targetTime) {
      // Reverse playback using setInterval
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
      // Play forward with actual video playback
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
  }
};

const handleTabClick = (type) => {
  setLensType(type);

  const sliderMap = {
    normal: 0,
    wide: 33,
    digital: 66,
    customized: 100
  };

  // Animate slider to target value
  animateSlider(sliderMap[type]);

  jumpToLensType(type); 
};

   const renderDots = (filled, total = 10) => {
      return (
        <div className={styles.dotsRow}>
          {[...Array(total)].map((_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${i < filled ? styles.filledDot : ""}`}
            ></span>
          ))}
        </div>
      );
    };






  const handleNext = () => {
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

  // START SCREEN
  if (currentStep === "start") {
    return (
      <div className={styles["lens-test-section"]}>
        <div className={styles["card-wrapper"]}>
          <div className={styles.card}>
            <div className={styles.hero}>
              <img src={background_image?.value} className={styles["hero-photo"]} />
              <div className={styles["hero-overlay"]}></div>
            </div>

            <div className={styles.content}>
              <div className={`${styles.brand} ${styles.animateTop}`}>
                <h1 className={styles["brand-image"]}>
                  <img src={logo_image?.value} />
                </h1>
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
        <div className={styles["card-wrapper"]}>
          <div className={styles.card}>
            <div key={currentQuestion} className={styles["question-wrapper"]}>
              
              {/* Logo */}
              <div className={`${styles.brand} ${styles.animateTop}`}>
                <h1 className={styles["brand-image"]}>
                  <img src={logo_image?.value} />
                </h1>
              </div>




              {/* Video */}
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
        className={`${styles.ageImage} ${imageSwapId === 0 ? styles.slideFromBottom : styles.fadeIn}`}
        alt=""
      />
    )}

    <img
      src={props.background_platform_image?.value}
      className={styles.bgplatformIMage}
    />
  </div>
)}






{q.id === "vision" && (
  <div className={styles["vision-video-wrapper"]}>
     <video
        ref={visionVideoRef}
        key={`vision`}
        src={props.vision_video.value}
        className={`${styles["vision-video"]} ${styles.fadeIn}`}
        autoPlay
        muted
        playsInline
      />
  </div>
)}









              {/* Lifestyle Video */}
           {isLifestyle && (
  <div className={styles["lifestyle-glasses-wrapper"]}>
    
    {/* Fading OUT previous video */}
    {prevLifestyleVideo && (
      <video
        key={`prev-${lifestyleSwapId}`}
        src={prevLifestyleVideo}
        className={`${styles["lifestyle-video-copy"]} ${styles.zoomfadeOut}`}
        autoPlay
        muted
        playsInline
        loop
      />
    )}

    {/* Fading IN current video */}
    {currentLifestyleVideo && (
      <video
        key={`current-${lifestyleSwapId}`}
        src={currentLifestyleVideo}
        className={`${styles["lifestyle-video"]} ${styles.zoomfadeIn}`}
        autoPlay
        muted
        playsInline
        loop
      />
    )}

  </div>
)}




         <div  className={styles.questionContentWrapper}>

              {/* Subtitle */}
              <p className={`${styles["question-subtitle"]} ${styles.animateBottom}`}>
                {q.subtitle}
              </p>

              {/* Title */}
              <h2 className={`${styles["question-title"]} ${styles.animateBottom}`}>
                {q.title}
              </h2>

              {/* OPTIONS */}
              {isLifestyle ? (
                <div className={`${styles["lifestyle-options"]} ${styles.animateBottom}`}>
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
                <div className={`${styles.options} ${styles.animateBottom}`}>
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

              {/* Next Button */}
              <button
                onClick={handleNext}
                disabled={!selectedOption}
                className={`${styles.nextQuestionbutton} ${styles.animateBottom}`}
              >
                <span></span>
              </button>

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
        <div className={styles["card-wrapper"]}>
          <div className={styles.card}>
            <div className={styles["question-wrapper"]}>
              
              <div className={`${styles.brand} ${styles.animateTop}`}>
                <h1 className={styles["brand-image"]}>
                  <img src={logo_image?.value} />
                </h1>
              </div>

              <div className={`${styles["progressive-video-wrapper"]} ${styles.animateTop}`}>
             <video
  ref={videoRef}
  src={progressiveVideo}
   autoPlay
        muted
        playsInline
        loop
  className={`${styles["progressive-video"]} ${styles.fadeInVideo}`}
/>

              </div>

              <p className={`${styles["question-subtitle"]} ${styles.animateBottom}`}>
                DRAG TO VIEW YOUR PERFECT LENS.
              </p>

              <div className={`${styles["slider-wrapper"]} ${styles.animateBottom}`}>
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

              <div className={`${styles["progressive-tabs"]} ${styles.animateBottom}`}>
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

              <div className={`${styles.progressiveGrid} ${styles.animateBottom}`}>
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

              <button
                className={`${styles["nextQuestionbutton"]} ${styles.animateBottom}`}
                onClick={() => {
                  const progMap = progressiveResultMap(props);
                  setResultData(progMap[lensType]);
                  setCurrentStep("result");
                }}
              >
                <span></span>
              </button>

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

              <p className={`${styles["result-subtitle"]} ${styles.animateTop}`}>LENS TEST RESULT</p>
              <h2 className={`${styles["result-title"]} ${styles.animateTop}`}>THANK YOU!</h2>

              <p className={`${styles["result-text"]} ${styles.animateTop}`}>
                We've found the lens type that best fits your vision needs.
              </p>

              <div className={`${styles["result-glasses"]} ${styles.animateTop}`}>
                <img src={resultData.image} alt={resultData.title} />
              </div>

              <div className={`${styles["result-box"]} ${styles.animateBottom}`}>
                <img src={logo_image?.value} className={styles["result-logo"]} />

                <h3 className={styles["result-lens-title"]}>{resultData.title}</h3>
                <p className={styles["result-lens-description"]}>{resultData.description}</p>

                <ul className={styles["result-points"] }>
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
  label: "Lens Test",
  props: [
    { type: "image_picker", id: "background_image", label: "Background Image" },
    { type: "image_picker", id: "logo_image", label: "Logo Image" },

{ type: "image_picker", id: "age_image_1", label: "Image: Age < 20" },
{ type: "image_picker", id: "age_image_2", label: "Image: Age 20-40" },
{ type: "image_picker", id: "age_image_3", label: "Image: Age 40+" },

{ type: "image_picker", id: "background_platform_image", label: "Background Platform Image" },


{ type: "video", id: "vision_video", label: "Vision Question Video" },



    { type: "video", id: "life_video_1", label: "Video: Study & Screens" },
    { type: "video", id: "life_video_2", label: "Video: Home & Family" },
    { type: "video", id: "life_video_3", label: "Video: Work & Commute" },
    { type: "video", id: "life_video_4", label: "Video: Business Leaders" },
    { type: "video", id: "life_video_5", label: "Video: Specialist Work" },

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

    { type: "video", id: "progressive_normal_video", label: "Progressive Lens Video" },


    { type: "image_picker", id: "progressive_normal_image", label: "Progressive Normal Result Image" },
    { type: "image_picker", id: "progressive_wide_image", label: "Progressive Wide Result Image" },
    { type: "image_picker", id: "progressive_digital_image", label: "Progressive Digital Result Image" },
    { type: "image_picker", id: "progressive_customized_image", label: "Progressive Customized Result Image" },
  ]
};

Component.settings = settings;
export default Component;
