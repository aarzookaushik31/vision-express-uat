// import React, { useState, useMemo } from "react";
import React, { useState, useMemo, useRef } from "react";
import Slider from "react-slick";
import PreviousArrow from "../../../../assets/images/pdp-gallery/previous.svg";
import NextArrow from "../../../../assets/images/pdp-gallery/next.svg";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import PicZoom from "../pic-zoom/pic-zoom";
import styles from "./image-gallery.less";
import { getProductImgAspectRatio } from "../../../../helper/utils";
import MobileSlider from "../mobile-slider/mobile-slider";

function PdpImageGallery({
  images = [],
  isCustomOrder = false,
  iconColor = "",
  globalConfig = {},
  resumeVideo = false,
  followed,
  removeFromWishlist,
  addToWishList,
  handleShare,
  showShareIcon = true,
  slideTabCentreNone = true,
  imgSources = [],
  displayTag,
  desktopLayout = "grid",
  tryOnButton = null,
  shareButton = null,
}) {
  const [zoomData, setZoomData] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const thumbnailRefs = useRef([]);
  const desktopSliderRef = useRef(null);
  const isDesktopSlider = desktopLayout === "slider";
  // const DesktopGallery = isDesktopSlider ? Slider : "div";
  const DesktopGallery = isDesktopSlider ? Slider : React.Fragment;

  /* ==================================================
     🔥 REMOVE SHADE IMAGE (-99) FROM GALLERY
  ================================================== */

  const filteredImages = useMemo(() => {
    return images.filter((item) => {
      if (!item?.url) return true;

      const fileName = item.url.split("/").pop()?.toLowerCase();

      // remove image containing -99 before extension
      return !fileName?.match(/-99\.(png|jpg|jpeg|webp)$/);
    });
  }, [images]);

  /* ================================================== */

  const handleImageClick = (item) => {
    if (item?.type === "image") {
      setZoomData(item);
    }
  };

  const closeZoom = () => setZoomData(null);
  const selectedSlide = Math.min(activeSlide, Math.max(filteredImages.length - 1, 0));
  const selectSlide = (index) => {
    if (!filteredImages.length) return;
    const next = (index + filteredImages.length) % filteredImages.length;
    // setActiveSlide(next);
    // thumbnailRefs.current[next]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    desktopSliderRef.current?.slickGoTo(next);
  };
  const desktopGalleryProps = isDesktopSlider ? {
    ref: desktopSliderRef,
    className: styles.sliderTrack,
    arrows: false,
    dots: false,
    infinite: filteredImages.length > 1,
    slidesToShow: 1,
    slidesToScroll: 1,
    speed: 400,
    cssEase: "ease-in-out",
    draggable: true,
    swipe: true,
    touchMove: true,
    adaptiveHeight: false,
    afterChange: (index) => {
      setActiveSlide(index);
      thumbnailRefs.current[index]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    },
  } : {};

  return (
    // <div className={styles.galleryBox}>
    <div className={`${styles.galleryBox} ${isDesktopSlider ? styles.sliderGalleryBox : ""}`}>


{displayTag && (
  <div className={styles.displayTagContainer}>
    <span>{displayTag}</span>
  </div>
)}




      {/* ================= DESKTOP ================= */}
      {/* Original desktop grid classes retained below for reference. */}
      {/* <div className={styles.desktop}><div className={styles.galleryGrid}> */}
      <div className={`${styles.desktop} ${isDesktopSlider ? styles.desktopSlider : ""}`}>
        <div className={isDesktopSlider ? styles.sliderPanel : styles.galleryGrid}>
          {shareButton && showShareIcon && <div className={styles.desktopGalleryShare}>{shareButton}</div>}
          <DesktopGallery {...desktopGalleryProps}>
          {filteredImages.map((item, index) => (
            <div
              key={index}
              // className={styles.galleryItem}
              className={`${styles.galleryItem} ${isDesktopSlider ? styles.sliderItem : ""}`}
              // hidden={isDesktopSlider && index !== selectedSlide}
              style={{ "--icon-color": iconColor }}
              onClick={() => handleImageClick(item)}
            >
              {item.type === "image" && (
                <FyImage
                  customClass={styles.galleryImage}
                  src={item?.url}
                  alt={item?.alt}
                  aspectRatio={getProductImgAspectRatio(globalConfig)}
                  // sources={[{ width: 400 }]}
                  sources={[{ width: isDesktopSlider ? 900 : 400 }]}
                  globalConfig={globalConfig}
                  isImageFill={globalConfig?.img_fill}
                />
              )}

              {item.type === "video" && (
                <video
                  className={styles.galleryVideo}
                  src={item?.url}
                  controls
                />
              )}

              {item.type === "3d_model" && (
                <div className={styles.gallery3D}>
                  <span>3D Model</span>
                </div>
              )}

              {isCustomOrder && (
                <div className={`${styles.badge} ${styles.b4}`}>
                  Made to Order
                </div>
              )}
            </div>
          ))}
          </DesktopGallery>
          {isDesktopSlider && tryOnButton && (
            <div className={styles.tryOnButton}>{tryOnButton}</div>
          )}
        </div>
        {isDesktopSlider && filteredImages.length > 1 && (
          <div className={styles.sliderNavigation}>
            <button type="button" className={styles.sliderArrow} aria-label="Previous product image" onClick={() => selectSlide(selectedSlide - 1)}>
              <PreviousArrow />
            </button>
            <div className={styles.sliderThumbnails}>
              {filteredImages.map((item, index) => (
                <button type="button" key={index} ref={(node) => { thumbnailRefs.current[index] = node; }}
                  className={`${styles.sliderThumbnail} ${index === selectedSlide ? styles.selectedThumbnail : ""}`}
                  aria-label={`View product ${item.type === "image" ? "image" : item.type === "video" ? "video" : "3D model"} ${index + 1}`}
                  aria-pressed={index === selectedSlide} onClick={() => selectSlide(index)}>
                  {item.type === "image" ? (
                    <FyImage src={item.url} alt={item.alt} aspectRatio={1} sources={[{ width: 150 }]} globalConfig={globalConfig} isImageFill={false} />
                  ) : <span>{item.type === "video" ? "Video" : "3D Model"}</span>}
                </button>
              ))}
            </div>
            <button type="button" className={styles.sliderArrow} aria-label="Next product image" onClick={() => selectSlide(selectedSlide + 1)}>
              <NextArrow />
            </button>
          </div>
        )}
      </div>

      {/* ================= MOBILE ================= */}
      <div className={styles.mobile}>
        <MobileSlider
          images={filteredImages}
          onImageClick={(img) => handleImageClick(img)}
          isCustomOrder={isCustomOrder}
          resumeVideo={resumeVideo}
          globalConfig={globalConfig}
          sources={imgSources}
          slideTabCentreNone={slideTabCentreNone}
          handleShare={handleShare}
          showShareIcon={showShareIcon}
          displayTag={displayTag}
          tryOnButton={tryOnButton}
          shareButton={shareButton}
        />
      </div>

      {/* ================= ZOOM ================= */}
      {zoomData && (
        <div className={styles.zoomOverlay} onClick={closeZoom}>
          <div
            className={styles.zoomContainer}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeZoomBtn}
              onClick={closeZoom}
            >
              ✕
            </button>

            <PicZoom
              source={zoomData.url}
              type={zoomData.type}
              alt={zoomData.alt}
              globalConfig={globalConfig}
              customClass={styles.zoomedImage}
              isFrameLoading={false}
              resumeVideo={resumeVideo}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default PdpImageGallery;
