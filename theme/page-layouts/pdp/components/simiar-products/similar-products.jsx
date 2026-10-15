// Previous hooks: import React from "react";
import React, { useEffect, useRef } from "react";
import styles from "./similar-products.less";
import useRecommendation from "./useRecommendations";
import Slider from "react-slick";
import { FDKLink } from "fdk-core/components";
import SliderCard from "./product-card.jsx";
// Previous hooks: import { useWishlist, useAccounts, useThemeConfig } from "../../../../helper/hooks";
// import { useWishlist, useAccounts, useThemeConfig, useMobile } from "../../../../helper/hooks";
import { useWishlist, useAccounts, useThemeConfig, useViewport } from "../../../../helper/hooks";



const RecommendedProducts = ({
  fpi,
  slug,
  sectionTitle,
  slideToShow,
  customValue,
  wrapper,
  customSettings, 
  // Previous presentation props: customClass = ""
  customClass = "",
  mobileAutoplay = true,
  mobileAutoplaySpeed = 3000,
  imageCarouselAutoplay = true,
  imageCarouselAutoplaySpeed = 3000,
}) => {

    const { toggleWishlist, followedIdList } = useWishlist({ fpi });
  const { isLoggedIn, openLogin } = useAccounts({ fpi });
  // const isMobile = useMobile(768);
  const isMobile = useViewport(0, 768);
  const sliderRef = useRef(null);
  const previousMobile = useRef(isMobile);


const handleWishlistToggle = (data) => {
  if (!isLoggedIn) {
    localStorage.setItem("pendingWishlistProduct", JSON.stringify(data));
    openLogin({ redirectUrl: "/wishlist"});
    return;
  }

  toggleWishlist(data);
};


  const { product_lists, apiLoading } = useRecommendation(
    fpi,
    slug,
    wrapper,
    customValue
  );
  const autoplayInterval = Number(mobileAutoplaySpeed);
  const resolvedAutoplaySpeed = Number.isFinite(autoplayInterval) && autoplayInterval > 0
    ? autoplayInterval
    : 3000;
  const canMobileAutoplay = Boolean(mobileAutoplay) && product_lists?.items?.length > 1;
  useEffect(() => {
    const slider = sliderRef.current;
    // Custom unslick layouts and single-item layouts may not mount an inner slider.
    if (!slider?.innerSlider) return;
    if (isMobile && canMobileAutoplay) {
      slider.slickPlay();
    } else {
      slider.slickPause();
      // Restore the first desktop group so all visible cards remain accessible after mobile looping.
      if (previousMobile.current && !isMobile) slider.slickGoTo(0, true);
    }
    previousMobile.current = isMobile;
  }, [isMobile, canMobileAutoplay, resolvedAutoplaySpeed, product_lists?.items?.length, customSettings]);

  if (!product_lists?.items?.length && !apiLoading) {
    return null;
  }

  // Previous settings source: const settings = customSettings || {
  const baseSettings = customSettings || {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    cssEase: "linear",
    responsive: [
      {
        breakpoint: 1050,
        settings: {
          slidesToShow: 4,
          dots: false,
          arrows: false,
          infinite: false,
        },
      },
      {
        breakpoint: 768, 
        settings: {
          slidesToShow: 1,
          rows: 1,
          slidesPerRow: 1,
          dots: false,
          arrows: false,
          infinite: false,
        },
      },
    ],
  };
  // These calculations now run above the early return so the autoplay effect always follows hook order:
  // const autoplayInterval = Number(mobileAutoplaySpeed);
  // const resolvedAutoplaySpeed = Number.isFinite(autoplayInterval) && autoplayInterval > 0
  //   ? autoplayInterval
  //   : 3000;
  // const canMobileAutoplay = Boolean(mobileAutoplay) && product_lists?.items?.length > 1;
  const configuredResponsive = baseSettings.responsive || [];
  // Reuse the custom layout that already applies at the mobile boundary.
  const mobileLayout = configuredResponsive
    .filter((entry) => entry.breakpoint >= 768)
    .sort((first, second) => first.breakpoint - second.breakpoint)[0]?.settings;
  const responsive = configuredResponsive.map((entry) => ({
    ...entry,
    settings: entry.settings === "unslick" ? "unslick" : {
      ...entry.settings,
      // Autoplay should keep cycling on mobile; manual-mode and desktop loop settings stay intact.
      ...(entry.breakpoint <= 768 && canMobileAutoplay ? { infinite: true } : {}),
      autoplay: entry.breakpoint <= 768 ? canMobileAutoplay : false,
      autoplaySpeed: resolvedAutoplaySpeed,
      pauseOnHover: true,
      pauseOnFocus: true,
    },
  }));
  if (!configuredResponsive.some((entry) => entry.breakpoint === 768)) {
    responsive.push({
      breakpoint: 768,
      settings: mobileLayout === "unslick" ? "unslick" : {
        ...mobileLayout,
        ...(canMobileAutoplay ? { infinite: true } : {}),
        autoplay: canMobileAutoplay,
        autoplaySpeed: resolvedAutoplaySpeed,
        pauseOnHover: true,
        pauseOnFocus: true,
      },
    });
  }
  const settings = {
    ...baseSettings,
    autoplay: false,
    autoplaySpeed: resolvedAutoplaySpeed,
    responsive,
  };

  return (
    <div className={`${styles.recommendedWrapper} ${styles[customClass]}`}>
      {/* Original heading retained: <h2 className={styles.sectionTitle}>{sectionTitle}</h2> */}
      <h2 className={styles.sectionTitle}>
        {sectionTitle?.split(" ").slice(0, -1).join(" ")}{" "}
        <span className={styles.titleAccent}>{sectionTitle?.split(" ").slice(-1).join(" ")}</span>
      </h2>

      {/* Original wrapper: <div className={styles.productsWrap}> */}
      <div
        className={styles.productsWrap}
        onFocusCapture={() => {
          if (isMobile && canMobileAutoplay) sliderRef.current?.slickPause();
        }}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget) && isMobile && canMobileAutoplay) {
            sliderRef.current?.slickPlay();
          }
        }}
      >
        <div id="RecommendSlider" className={styles.sliderContainer}>
          {/* Previous slider: <Slider {...settings} style={{ width: "100%" }}> */}
          <Slider ref={sliderRef} {...settings} style={{ width: "100%" }}>
            {product_lists?.items?.length > 0 ? (
              product_lists.items.map((product, index) => (
                <FDKLink key={index} action={product?.action || ""}>
                  {/* Original card presentation retained:
                  <SliderCard product={product}
                  customClass={["figmaSimilarCard"]} onWishlistClick={handleWishlistToggle} followedIdList={followedIdList} />
                  */}
                 


<SliderCard
  product={product}
  imageIndex={5}
  imageCarouselAll={true}
  imageCarouselPlayOnHover={true}
  imageCarouselAutoplay={Boolean(imageCarouselAutoplay)}
  imageCarouselAutoplaySpeed={700}
  customClass={["figmaSimilarCard"]}
  onWishlistClick={handleWishlistToggle}
  followedIdList={followedIdList}
/>


                </FDKLink>
              ))
            ) : (
              <div className={styles.noRecommendations}>
                <p>
                  {apiLoading
                    ? "Loading recommendations..."
                    : "No recommendations available."}
                </p>
              </div>
            )}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default RecommendedProducts;
