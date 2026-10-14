// Previous hooks: import React, { useState, createRef } from "react";
import React, { useState, useEffect, createRef } from "react";
import Slider from "react-slick";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import { getProductImgAspectRatio } from "../../../../helper/utils";
// import { useMobile } from "../../../../helper/hooks/useMobile";
import { useViewport } from "../../../../helper/hooks";
import Viewer3D from "../viewer-3d/viewer-3d";
import styles from "./mobile-slider.less";
import { useGlobalTranslation } from "fdk-core/utils";
import ReplayIcon from "../../../../assets/images/replay.svg";
import MuteIcon from "../../../../assets/images/mute.svg";
import UnmuteIcon from "../../../../assets/images/unmute.svg";
import AutoRotateIcon from "../../../../assets/images/auto-rotate.svg";
import ShareIcon from "../../../../assets/images/share-04.svg";
import PreviousArrow from "../../../../assets/images/pdp-gallery/previous.svg";
import NextArrow from "../../../../assets/images/pdp-gallery/next.svg";
// import WishlistIcon from "../../../../assets/images/wishlist";

function MobileSlider({
  images,
  globalConfig,
  onImageClick,
  isCustomOrder = false,
  // followed,
  // removeFromWishlist,
  // addToWishList,
  setCurrentImageIndex,
  slideTabCentreNone = false,
  handleShare,
  showShareIcon = true,
  sources = [],
  displayTag,
  tryOnButton = null,
  shareButton = null,
  mobileAutoplay = true,
  mobileAutoplaySpeed = 3000,
}) {
  const { t } = useGlobalTranslation("translation");
  const [mainSlider, setMainSlider] = useState(null);
  const [thumbSlider, setThumbSlider] = useState(null);
  // const isMobile = useMobile(768);
  const isMobile = useViewport(0, 768);

  const [showReplayButton, setShowReplayButton] = useState(false);
  const [isMute, setIsMute] = useState(true);
  const [loadedVideos, setLoadedVideos] = useState([]);
  const videoRef = createRef();
  const autoplayInterval = Number(mobileAutoplaySpeed);
  const resolvedAutoplaySpeed = Number.isFinite(autoplayInterval) && autoplayInterval > 0
    ? autoplayInterval
    : 3000;
  useEffect(() => {
    if (!mainSlider?.innerSlider) return;
    // Slick retains its paused state when responsive autoplay changes from false to true.
    if (isMobile && mobileAutoplay && images?.length > 1) {
      mainSlider.slickPlay();
    } else {
      mainSlider.slickPause();
    }
  }, [mainSlider, isMobile, mobileAutoplay, images?.length, resolvedAutoplaySpeed]);

const mainSettings = {
  dots: false,
  infinite: images?.length > 1,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
  swipe: true,
  speed: 400,
  // The mobile gallery stays mounted behind its desktop CSS, so autoplay is viewport scoped.
  autoplay: false,
  autoplaySpeed: resolvedAutoplaySpeed,
  pauseOnHover: true,
  pauseOnFocus: true,
  responsive: [{
    breakpoint: 768,
    settings: { autoplay: Boolean(mobileAutoplay) && images?.length > 1 },
  }],
  asNavFor: thumbSlider,
  beforeChange: (current, next) => {
    if (typeof setCurrentImageIndex === "function") {
      setCurrentImageIndex(next);
    }
  },
};


  const thumbSettings = {
    dots: false,
    infinite: images?.length > 1,
    // slidesToShow: Math.min(images?.length, 5),
    // Previous mobile count: slidesToShow: Math.min(images?.length, 3),
    // Previous five-thumbnail presentation: slidesToShow: Math.min(images?.length, 5),
    slidesToShow: Math.min(images?.length, 3),
    slidesToScroll: 1,
    swipeToSlide: true,
    focusOnSelect: true,
    asNavFor: mainSlider,
    centerMode: images?.length > 5,
    centerPadding: "0px",
    arrows: false,
  };

  function getImageURL(src) {
    return `http://img.youtube.com/vi/${src?.substr(
      (src?.lastIndexOf("/") ?? "") + 1
    )}/0.jpg`;
  }

  return (
    <div className={styles.mobilePdpCarouselBox} style={{ maxWidth: "100vw" }}>
      <div className={styles.mobileGalleryPanel}>
        {displayTag && <div className={styles.mobileDisplayTag}>{displayTag}</div>}
        {/* Previous mobile share button retained for reference:
        {showShareIcon && handleShare && (
          <button type="button" className={styles.mobileGalleryShare} aria-label="Share product" onClick={handleShare}>
            <ShareIcon />
          </button>
        )} */}
        {showShareIcon && shareButton && <div className={styles.mobileGalleryShare}>{shareButton}</div>}
      <Slider  className={styles.mainSlider} {...mainSettings} ref={(slider) => setMainSlider(slider)}>
        {images?.map((media, i) => (
          <div className={styles.mediaWrapper} key={i}>
            {media.type === "image" && (
              <div onClick={() => onImageClick()}>
                <FyImage
                  customClass={styles.mobileGalleryImage}
                  src={media?.url}
                  alt={media?.alt}
                  isImageFill={globalConfig?.img_fill}
                  aspectRatio={getProductImgAspectRatio(globalConfig)}
                  sources={sources}
                  defer={i > 1}
                  globalConfig={globalConfig}
                />
              </div>
            )}

            {media.type === "video" && (
              <div className={styles.videoContainer}>
                {media?.url.includes("youtube") && (
                  <img
                    src={getImageURL(media.url)}
                    alt={media.alt}
                    onClick={() => onImageClick()}
                  />
                )}
                <div className={styles.videoPlayerWrapper}>
                  {!media?.url.includes("youtube") && (
                    <video
                      ref={videoRef}
                      id={`mobile-video-player-${i}`}
                      className={styles.originalVideo}
                      controls={false}
                      autoPlay
                      muted={isMute}
                      onClick={() => {
                        if (videoRef.current?.paused) {
                          videoRef.current.play();
                        } else {
                          videoRef.current.pause();
                        }
                      }}
                      onEnded={() => setShowReplayButton(true)}
                    >
                      <source src={media?.url} type="video/mp4" />
                    </video>
                  )}
                  {showReplayButton && (
                    <ReplayIcon
                      className={`${styles.playerIcon} ${styles.playerReplay}`}
                      onClick={() => {
                        setShowReplayButton(false);
                        videoRef.current.currentTime = 0;
                        videoRef.current.play();
                      }}
                    />
                  )}
                  <span onClick={() => setIsMute(!isMute)}>
                    {isMute ? (
                      <MuteIcon
                        className={`${styles.playerIcon} ${styles.playerMute}`}
                      />
                    ) : (
                      <UnmuteIcon
                        className={`${styles.playerIcon} ${styles.playerMute}`}
                      />
                    )}
                  </span>
                </div>
              </div>
            )}

            {media.type === "3d_model" && (
              <div className={styles.type3dModel}>
                <Viewer3D src={media.url} />
                <AutoRotateIcon
                  className={styles.autoRotateIcon}
                  onClick={() => onImageClick()}
                />
              </div>
            )}

            {isCustomOrder && (
              <div className={`${styles.badge} ${styles.b4}`}>
                {t("resource.product.made_to_order")}
              </div>
            )}

            {/* <button
              type="button"
              aria-label="Wishlist"
              className={`${followed ? styles.activeWishlist : ""} ${styles.wishlistIcon}`}
              onClick={(e) =>
                followed ? removeFromWishlist(e) : addToWishList(e)
              }
            >
              <WishlistIcon isActive={followed} />
            </button> */}
          </div>
        ))}
      </Slider>
        {tryOnButton && <div className={styles.mobileTryOn}>{tryOnButton}</div>}
      </div>

      <div className={styles.mobileThumbnailNavigation}>
        {images?.length > 1 && <button type="button" className={styles.mobileArrow} aria-label="Previous product image" onClick={() => mainSlider?.slickPrev()}><PreviousArrow /></button>}
      <Slider
        {...thumbSettings}
        ref={(slider) => setThumbSlider(slider)}
        className={styles.thumbnailSlider}
      >
        {images?.map((media, i) => (
          <div key={i} className={styles.thumbnailWrapper}>
            <div className={styles.thumbnailmediaWrapper}>
            {media.type === "image" && (
              <img src={media?.url} alt={media?.alt} className={styles.thumbnailImage} />
            )}
            {media.type === "video" && (
              <img
                src={media?.url.includes("youtube") ? getImageURL(media.url) : "/video-placeholder.png"}
                alt="video thumbnail"
                className={styles.thumbnailImage}
              />
            )}
            {media.type === "3d_model" && (
              <div className={styles.thumbnail3D}>3D</div>
            )}
            </div>
          </div>
        ))}
      </Slider>
        {images?.length > 1 && <button type="button" className={styles.mobileArrow} aria-label="Next product image" onClick={() => mainSlider?.slickNext()}><NextArrow /></button>}
      </div>
    </div>
  );
}

export default MobileSlider;
