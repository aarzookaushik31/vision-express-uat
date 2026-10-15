/**
 * ProductCard Component
 * (keep your existing doc comment here)
 *
 * Image carousel (PDP recommendations):
 *  - imageCarouselAll: preferred image (imageIndex) first, then the rest, max 4.
 *  - imageCarouselIndices: explicit list of image indices (used when imageCarouselAll is false).
 *  - imageCarouselPlayOnHover: plays only while the card is hovered (desktop), always forward.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { currencyFormat, formatLocale } from "../../../../helper/utils";
import { useMobile } from "../../../../helper/hooks";
import FyImage from "../../../../components/core/fy-image/fy-image";
import SvgWrapper from "../../../../components/core/svgWrapper/SvgWrapper";
import styles from "./product-card.less";
import FyButton from "../../../../components/core/fy-button/fy-button";
import { useGlobalStore, useFPI, useGlobalTranslation } from "fdk-core/utils";
import WishlistIcon from "../../../../assets/images/wishlist";
import PreviousArrow from "../../../../assets/images/pdp-gallery/previous.svg";
import NextArrow from "../../../../assets/images/pdp-gallery/next.svg";

const MAX_SLIDES = 4;

/**
 * Direction: always forward. A clone of the first image is appended, autoplay
 * slides onto the clone, then snaps back to the real first slide with the
 * transition disabled, so the track never slides backwards.
 *
 * hover is owned by the card (isHovered prop), like the listing card.
 */
const CardImageCarousel = ({
  images,
  productName,
  imgSrcSet,
  imageBackgroundColor,
  autoplay,
  autoplaySpeed,
  playOnHover = false,
  isMobile = false,
  isHovered = false,
}) => {
  const count = images.length;
  const [pos, setPos] = useState(0); // pos === count is the cloned first slide
  const [animate, setAnimate] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const pointerStart = useRef(null);
  const suppressImageClick = useRef(false);
  const imageKey = images.map((image) => image.url).join("|");
  const interval = Number(autoplaySpeed);
  const resolvedInterval = Number.isFinite(interval) && interval > 0 ? interval : 3000;

  const hoverMode = playOnHover && !isMobile;
  const shouldPlay = hoverMode ? isHovered : autoplay && !isHovered && !isFocused;

  const activeImage = count > 0 ? pos % count : 0;

  const snapTo = (index) => {
    setAnimate(false);
    setPos(index);
  };

  // Reset when the image set changes
  useEffect(() => { snapTo(0); }, [imageKey]);

  // Re-enable the transition one tick after an instant jump
  useEffect(() => {
    if (animate) return undefined;
    const id = setTimeout(() => setAnimate(true), 30);
    return () => clearTimeout(id);
  }, [animate]);

  // Forward-only autoplay
  useEffect(() => {
    if (!shouldPlay || count < 2) return undefined;
    const timer = setInterval(() => {
      setPos((current) => (current >= count ? current : current + 1));
    }, resolvedInterval);
    return () => clearInterval(timer);
  }, [shouldPlay, count, resolvedInterval]);

  // Hover mode: back to the first image when the mouse leaves the card
  useEffect(() => {
    if (hoverMode && !isHovered) snapTo(0);
  }, [isHovered, hoverMode]);

  const resetFromClone = () => {
    if (pos === count) snapTo(0);
  };

  // Fallback in case transitionend never fires
  useEffect(() => {
    if (pos !== count || count < 2) return undefined;
    const id = setTimeout(resetFromClone, 800);
    return () => clearTimeout(id);
  }, [pos, count]);

  const selectImage = (event, index) => {
    event.preventDefault();
    event.stopPropagation();
    setAnimate(true);
    if (index >= count) setPos(count);
    else if (index < 0) setPos(count - 1);
    else setPos(index);
  };

  return (
    <div
      className={styles.cardImageCarousel}
      role="group"
      aria-roledescription="carousel"
      aria-label={`${productName} images`}
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsFocused(false);
      }}
    >
      <div
        className={styles.cardImageTrack}
        style={{
          transform: `translateX(-${pos * 100}%)`,
          ...(animate ? {} : { transition: "none" }),
        }}
        onTransitionEnd={(event) => {
          if (event.target === event.currentTarget) resetFromClone();
        }}
        onMouseDown={(event) => { if (count > 1) event.stopPropagation(); }}
        onTouchStart={(event) => { if (count > 1) event.stopPropagation(); }}
        onTouchMove={(event) => { if (count > 1) event.stopPropagation(); }}
        onTouchEnd={(event) => { if (count > 1) event.stopPropagation(); }}
        onPointerDown={(event) => {
          if (count > 1) event.stopPropagation();
          pointerStart.current = { x: event.clientX, y: event.clientY };
          suppressImageClick.current = false;
        }}
        onPointerUp={(event) => {
          const start = pointerStart.current;
          pointerStart.current = null;
          if (!start || count < 2) return;
          const distance = event.clientX - start.x;
          if (Math.abs(distance) > 40 && Math.abs(distance) > Math.abs(event.clientY - start.y)) {
            suppressImageClick.current = true;
            selectImage(event, activeImage + (distance < 0 ? 1 : -1));
          }
        }}
        onPointerCancel={() => { pointerStart.current = null; }}
        onClickCapture={(event) => {
          if (suppressImageClick.current) {
            event.preventDefault();
            event.stopPropagation();
            suppressImageClick.current = false;
          }
        }}
      >
        {images.map((image, index) => (
          <div
            className={`${styles.cardImageSlide} ${
              index === 0 ? styles.slideCover : styles.slideContain
            }`}
            key={image.url}
            aria-hidden={index !== activeImage}
          >
            <FyImage
              src={image.url}
              alt={image.alt || productName}
              backgroundColor={imageBackgroundColor}
              isFixedAspectRatio={false}
              customClass={styles.productImage}
              sources={imgSrcSet}
              defer={index !== 0}
            />
          </div>
        ))}
        {/* Clone of the first (cover) slide so autoplay keeps moving forward */}
        {count > 1 && (
          <div
            className={`${styles.cardImageSlide} ${styles.slideCover}`}
            key="loop-clone"
            aria-hidden="true"
          >
            <FyImage
              src={images[0].url}
              alt=""
              backgroundColor={imageBackgroundColor}
              isFixedAspectRatio={false}
              customClass={styles.productImage}
              sources={imgSrcSet}
              defer={false}
            />
          </div>
        )}
      </div>
      {count > 1 && (
        <>
          <button type="button" className={`${styles.cardImageArrow} ${styles.cardImagePrevious}`} aria-label={`Previous image of ${productName}`} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => selectImage(event, activeImage - 1)}>
            <PreviousArrow viewBox="0 0 40 40" aria-hidden="true" />
          </button>
          <button type="button" className={`${styles.cardImageArrow} ${styles.cardImageNext}`} aria-label={`Next image of ${productName}`} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => selectImage(event, activeImage + 1)}>
            <NextArrow viewBox="0 0 40 40" aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
};

const ProductCard = ({
  product,
  customClass = [],
  listingPrice = "range",
  imgSrcSet = [
    { breakpoint: { min: 1024 }, width: 600 },
    { breakpoint: { min: 768 }, width: 300 },
    { breakpoint: { min: 481 }, width: 300 },
    { breakpoint: { max: 390 }, width: 300 },
    { breakpoint: { max: 480 }, width: 300 },
  ],
  aspectRatio = 0.8,
  isBrand = true,
  isPrice = true,
  isSaleBadge = true,
  isWishlistIcon = true,
  isImageFill = false,
  showImageOnHover = false,
  imageIndex = 0,
  useSelectedImageOnHover = false,
  imageCarouselIndices = [],
  imageCarouselAll = false,
  imageCarouselAutoplay = false,
  imageCarouselAutoplaySpeed = 3000,
  imageCarouselPlayOnHover = false,
  imageBackgroundColor = "",
  imagePlaceholder = "",
  columnCount = { desktop: 4, tablet: 3, mobile: 1 },
  WishlistIconComponent = () => <SvgWrapper svgSrc="wishlist-plp" />,
  isRemoveIcon = false,
  RemoveIconComponent = () => (
    <SvgWrapper svgSrc="item-close" className={styles.removeIcon} />
  ),
  actionButtonText,
  followedIdList = [],
  onWishlistClick = () => {},
  handleAddToCart = () => {},
  onRemoveClick = () => {},
  centerAlign = true,
  showAddToCart = false,
  showBadge = true,
  isSlider = false,
}) => {
  const { t } = useGlobalTranslation("translation");
  const fpi = useFPI();
  const i18nDetails = useGlobalStore(fpi?.getters?.i18N_DETAILS) || {};
  const locale = i18nDetails?.language?.locale || "en";
  const countryCode = i18nDetails?.countryCode || "IN";
  const isMobile = useMobile();
  const [isHovered, setIsHovered] = useState(false);

  const getListingPrice = (key) => {
    if (!product.price) return "";

    let price = "";
    const priceDetails = product.price[key];

    switch (listingPrice) {
      case "min":
        price = currencyFormat(
          priceDetails.min,
          priceDetails.currency_symbol,
          formatLocale(locale, countryCode, true)
        );
        break;
      case "max":
        price = currencyFormat(
          priceDetails.max,
          priceDetails.currency_symbol,
          formatLocale(locale, countryCode, true)
        );
        break;
      case "range":
        price =
          priceDetails.min !== priceDetails.max
            ? `${currencyFormat(
                priceDetails.min,
                priceDetails.currency_symbol,
                formatLocale(locale, countryCode, true)
              )} - ${currencyFormat(
                priceDetails.max,
                priceDetails.currency_symbol,
                formatLocale(locale, countryCode, true)
              )}`
            : currencyFormat(
                priceDetails.min,
                priceDetails.currency_symbol,
                formatLocale(locale, countryCode, true)
              );
        break;
      default:
        break;
    }
    return price;
  };

  const getProductImages = () => {
    return (
      product?.media ||
      product?.medias ||
      []
    ).filter((m) => m.type === "image");
  };

  const images = getProductImages();
  const selectedImage = images?.[imageIndex]?.url ? images[imageIndex] : images?.[0];
  const imageUrl = selectedImage?.url || imagePlaceholder;
  const hoverImage = useSelectedImageOnHover ? selectedImage : images?.[1];
  const hoverImageUrl = hoverImage?.url || "";
  const imageAlt = selectedImage?.alt || `${product?.brand?.name} | ${product?.name}`;
  const hoverImageAlt = hoverImage?.alt || imageAlt;

  const uniqueWithUrl = (list) =>
    list.filter(
      (image, index, arr) =>
        image?.url && arr.findIndex((item) => item?.url === image.url) === index
    );

  // Same rule as the listing card: preferred image first, then the rest (max 4).
  // Otherwise fall back to the explicit index list.
  const carouselImages = imageCarouselAll
    ? uniqueWithUrl([selectedImage, ...images.filter((img) => img !== selectedImage)]).slice(0, MAX_SLIDES)
    : uniqueWithUrl(imageCarouselIndices.map((index) => images[index]));

  if (
    !imageCarouselAll &&
    imageCarouselIndices.length > 0 &&
    !carouselImages.length &&
    selectedImage?.url
  ) {
    carouselImages.push(selectedImage);
  }

  const shadeVariants = product.variants?.find(
    (variant) => variant.display_type === "color"
  );
  // Figma recommendation swatches use variant colors rather than product thumbnails.
  const useColorDots = customClass.includes("figmaSimilarCard");
  const getVariantColor = (variant) => {
    const color = variant?.color?.trim?.() || variant?.color_name?.trim?.() || "transparent";
    return /^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(color) ? `#${color}` : color;
  };
  const shadeVariantsCount = shadeVariants?.items?.length - 1 || 0;
  const currentShade = shadeVariants?.items?.find(
    (variant) => product?.slug === variant?.slug
  );
  const variants = shadeVariants?.items
    ?.filter((variant) => variant.slug !== currentShade?.slug)
    .slice(0, 3);

  const hasDiscount =
    getListingPrice("effective") !== getListingPrice("marked");

  const isFollowed = useMemo(() => {
    return !!followedIdList?.includes(product?.uid);
  }, [followedIdList, product]);

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onWishlistClick({ product, isFollowed });
  };

  const handleRemoveClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onRemoveClick({ product, isFollowed });
  };

  const gridClass = useMemo(
    () =>
      `${columnCount?.mobile === 2 ? styles["mob-grid-2-card"] : styles["mob-grid-1-card"]} ${columnCount?.tablet === 2 ? styles["tablet-grid-2-card"] : styles["tablet-grid-3-card"]} ${columnCount?.desktop === 2 ? styles["desktop-grid-2-card"] : styles["desktop-grid-4-card"]}`,
    [columnCount?.desktop, columnCount?.tablet, columnCount?.mobile]
  );

  const handleAddToCartClick = (event) => {
    event?.preventDefault();
    event?.stopPropagation();
    handleAddToCart(product?.slug);
  };

  const getShadeImage = (medias) => {
    if (!Array.isArray(medias)) return "";

    const image99 = medias.find((media) =>
      media?.url?.toLowerCase().includes("-99")
    );

    if (image99) return image99.url;

    const imageList = medias.filter((m) => m.type === "image");
    const lastImage = imageList[imageList.length - 1];

    return lastImage?.url || "";
  };

  const displayTag =
    product?.attributes?.displaytag &&
    Array.isArray(product.attributes.displaytag) &&
    product.attributes.displaytag.length > 0
      ? product.attributes.displaytag[0]
      : null;

  return (
    <div
      className={`productcard ${styles.productCard} ${
        !product.sellable ? styles.disableCursor : ""
      } ${styles[customClass[0]]} ${styles[customClass[1]]} ${
        styles[customClass[2]]
      } ${styles.animate} ${gridClass} ${isSlider ? styles.sliderCard : ""}`}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {displayTag && (
        <div className={styles.displayTagContainer}>
          <span>{useColorDots && /^best\s*seller$/i.test(String(displayTag).trim()) ? "Best Seller" : displayTag}</span>
        </div>
      )}

      <div className={styles.imageContainer}>
        {!carouselImages.length && !isMobile && showImageOnHover && hoverImageUrl && (
          <FyImage
            src={hoverImageUrl}
            alt={hoverImageAlt}
            backgroundColor={imageBackgroundColor}
            isFixedAspectRatio={false}
            customClass={` ${styles.productImage} ${styles.hoverImage}`}
            sources={imgSrcSet}
            defer={true}
          />
        )}
        {carouselImages.length ? (
          <CardImageCarousel
            images={carouselImages}
            productName={product.name}
            imgSrcSet={imgSrcSet}
            imageBackgroundColor={imageBackgroundColor}
            autoplay={imageCarouselAutoplay}
            autoplaySpeed={imageCarouselAutoplaySpeed}
            playOnHover={imageCarouselPlayOnHover}
            isMobile={isMobile}
            isHovered={isHovered}
          />
        ) : (
          <FyImage
            src={imageUrl || imagePlaceholder}
            alt={imageAlt}
            backgroundColor={imageBackgroundColor}
            isFixedAspectRatio={false}
            customClass={`${styles.productImage} ${styles.mainImage}`}
            sources={imgSrcSet}
            defer={false}
          />
        )}
        {isWishlistIcon && (
          <button
            className={`${styles.wishlistBtn} ${isFollowed ? styles.active : ""}`}
            onClick={handleWishlistClick}
            title={t("resource.product.wishlist_icon")}
          >
            <WishlistIcon isActive={isFollowed} />
          </button>
        )}
        {isRemoveIcon && (
          <button
            className={`${styles.wishlistBtn} ${isFollowed ? styles.active : ""}`}
            onClick={handleRemoveClick}
            title={t("resource.product.wishlist_icon")}
          >
            <RemoveIconComponent />
          </button>
        )}
        {!product.sellable ? (
          <div className={`${styles.badge} ${styles.outOfStock}`}>
            <span className={`${styles.text} ${styles.captionNormal}`}>
              {t("resource.common.out_of_stock")}
            </span>
          </div>
        ) : product.teaser_tag && showBadge ? (
          <div className={styles.badge}>
            <span className={`${styles.text} ${styles.captionNormal}`}>
              {product?.teaser_tag?.substring(0, 14)}
            </span>
          </div>
        ) : isSaleBadge && showBadge && product.discount && product.sellable ? (
          <div className={`${styles.badge} ${styles.sale}`}>
            <span className={`${styles.text} ${styles.captionNormal}`}>
              {t("resource.common.sale")}
            </span>
          </div>
        ) : null}
      </div>
      <div className={styles.productDescContainer}>
        <div className={styles.productDesc}>
          {shadeVariantsCount !== 0 && (
            <div className={styles.productVariants}>
              <div className={`${styles.shade} ${styles.currentShade}`}>
                {!useColorDots && getShadeImage(currentShade?.medias) ? (
                  <img
                    src={getShadeImage(currentShade?.medias)}
                    alt={currentShade?.name}
                    className={styles.shadeImage}
                  />
                ) : (
                  <div
                    className={styles.shadeColor}
                    style={{ backgroundColor: getVariantColor(currentShade) }}
                  />
                )}
              </div>

              {variants?.map((variantItem) => (
                <div
                  key={variantItem.uid}
                  className={`${styles.shade} ${styles.allShades}`}
                >
                  {!useColorDots && getShadeImage(variantItem?.medias) ? (
                    <img
                      src={getShadeImage(variantItem?.medias)}
                      alt={variantItem?.name}
                      className={styles.shadeImage}
                    />
                  ) : (
                    <div
                      className={styles.shadeColor}
                      style={{ backgroundColor: getVariantColor(variantItem) }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {isBrand && product.brand && (
            <h3 className={styles.productBrand}>{product.brand.name}</h3>
          )}
          <h5
            className={`${styles.productName} ${styles.b2} ${centerAlign ? styles.centerAlign : ""}`}
            title={product.name}
          >
            {product.name}
          </h5>
          {isPrice && (
            <div
              className={`${styles.productPrice} ${centerAlign ? styles.center : ""}`}
            >
              {product?.price?.effective && (
                <span className={`${styles["productPrice--sale"]} ${styles.h4}`}>
                  {getListingPrice("effective")}
                </span>
              )}
              {hasDiscount && (
                <span className={`${styles["productPrice--regular"]} ${styles.captionNormal}`}>
                  {getListingPrice("marked")}
                </span>
              )}
              {product.discount && (
                <span
                  className={`${styles["productPrice--discount"]} ${styles.captionNormal} ${centerAlign ? styles["productPrice--textCenter"] : ""}`}
                >
                  ({product.discount})
                </span>
              )}
            </div>
          )}
        </div>

        {showAddToCart && (
          <FyButton
            variant="outlined"
            className={styles.addToCart}
            onClick={handleAddToCartClick}
          >
            {actionButtonText ?? t("resource.common.add_to_cart")}
          </FyButton>
        )}
      </div>
    </div>
  );
};

export default ProductCard;