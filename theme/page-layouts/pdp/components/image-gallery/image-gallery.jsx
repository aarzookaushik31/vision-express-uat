import React, { useState } from "react";
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
}) {
  const [zoomData, setZoomData] = useState(null);

  const handleImageClick = (item) => {
    if (item?.type === "image") {
      setZoomData(item);
    }
  };

  const closeZoom = () => setZoomData(null);

  return (
    <div className={styles.galleryBox}>
      {/* Desktop Grid */}
      <div className={styles.desktop}>
        <div className={styles.galleryGrid}>
          {images.map((item, index) => (
            <div
              key={index}
              className={styles.galleryItem}
              style={{ "--icon-color": iconColor }}
              onClick={() => handleImageClick(item)}
            >
              {item.type === "image" && (
                <FyImage
                  customClass={styles.galleryImage}
                  src={item?.url}
                  alt={item?.alt}
                  aspectRatio={getProductImgAspectRatio(globalConfig)}
                  sources={[{ width: 400 }]}
                  globalConfig={globalConfig}
                  isImageFill={globalConfig?.img_fill}
                />
              )}

              {item.type === "video" && (
                <video className={styles.galleryVideo} src={item?.url} controls />
              )}

              {item.type === "3d_model" && (
                <div className={styles.gallery3D}>
                  <span>3D Model</span>
                </div>
              )}

              {isCustomOrder && (
                <div className={`${styles.badge} ${styles.b4}`}>Made to Order</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile */}
      <div className={styles.mobile}>
        <MobileSlider
          images={images}
          onImageClick={(img) => handleImageClick(img)}
          isCustomOrder={isCustomOrder}
          resumeVideo={resumeVideo}
          globalConfig={globalConfig}
          sources={imgSources}
          slideTabCentreNone={slideTabCentreNone}
          handleShare={handleShare}
          showShareIcon={showShareIcon}
        />
      </div>


      {zoomData && (
        <div className={styles.zoomOverlay} onClick={closeZoom}>
          <div
            className={styles.zoomContainer}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.closeZoomBtn} onClick={closeZoom}>
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
