import React, { useState, createRef } from "react";
import Slider from "react-slick";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import { getProductImgAspectRatio } from "../../../../helper/utils";
import Viewer3D from "../viewer-3d/viewer-3d";
import styles from "./mobile-slider.less";
import { useGlobalTranslation } from "fdk-core/utils";
import ReplayIcon from "../../../../assets/images/replay.svg";
import MuteIcon from "../../../../assets/images/mute.svg";
import UnmuteIcon from "../../../../assets/images/unmute.svg";
import AutoRotateIcon from "../../../../assets/images/auto-rotate.svg";
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
}) {
  const { t } = useGlobalTranslation("translation");
  const [mainSlider, setMainSlider] = useState(null);
  const [thumbSlider, setThumbSlider] = useState(null);

  const [showReplayButton, setShowReplayButton] = useState(false);
  const [isMute, setIsMute] = useState(true);
  const [loadedVideos, setLoadedVideos] = useState([]);
  const videoRef = createRef();

const mainSettings = {
  dots: false,
  infinite: images?.length > 1,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
  swipe: true,
  speed: 400,
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
    slidesToShow: Math.min(images?.length, 5),
    slidesToScroll: 1,
    swipeToSlide: true,
    focusOnSelect: true,
    asNavFor: mainSlider,
    centerMode: images?.length > 5,
    arrows: false,
  };

  function getImageURL(src) {
    return `http://img.youtube.com/vi/${src?.substr(
      (src?.lastIndexOf("/") ?? "") + 1
    )}/0.jpg`;
  }

  return (
    <div className={styles.mobilePdpCarouselBox} style={{ maxWidth: "100vw" }}>
      <Slider  className={styles.mainSlider} {...mainSettings} ref={(slider) => setMainSlider(slider)}>
        {images?.map((media, i) => (
          <div className={styles.mediaWrapper} key={i}>
            {media.type === "image" && (
              <div onClick={() => onImageClick()}>
                <FyImage
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
    </div>
  );
}

export default MobileSlider;
