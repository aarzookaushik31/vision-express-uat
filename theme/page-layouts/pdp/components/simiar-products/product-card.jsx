/**
 * ProductCard Component
 *
 * This React component renders a product card with various customizable options such as displaying brand, price, sale badges, wishlist icons, and more. It supports responsive design with different layouts for mobile, tablet, and desktop views.
 *
 * @param {Object} props - The properties object.
 * @param {Object} props.product - The product data to be displayed.
 * @param {Array} [props.customClass=[]] - Custom CSS classes to apply to the card.
 * @param {string} [props.listingPrice="range"] - Determines the price display format ("min", "max", or "range").
 * @param {boolean} [props.isHdimgUsed=false] - Flag to determine if high-definition images should be used.
 * @param {number} [props.aspectRatio=0.8] - Aspect ratio for the product image.
 * @param {boolean} [props.isBrand=true] - Flag to display the brand name.
 * @param {boolean} [props.isPrice=true] - Flag to display the price.
 * @param {boolean} [props.isSaleBadge=true] - Flag to display a sale badge if applicable.
 * @param {boolean} [props.isWishlistIcon=true] - Flag to display a wishlist icon.
 * @param {boolean} [props.isImageFill=false] - Flag to determine if the image should fill its container.
 * @param {boolean} [props.showImageOnHover=false] - Flag to show a different image on hover.
 * @param {number} [props.imageIndex=0] - Preferred image position among the product's image media.
 * @param {boolean} [props.useSelectedImageOnHover=false] - Keep the selected presentation image on hover.
 * @param {string} [props.imageBackgroundColor=""] - Background color for the image.
 * @param {string} [props.imagePlaceholder=""] - Placeholder image URL.
 * @param {Object} [props.columnCount={ desktop: 4, tablet: 3, mobile: 1 }] - Number of columns for different viewports.
 * @param {Function} [props.WishlistIconComponent=() => <SvgWrapper svgSrc="wishlist-plp" />] - Custom component for the wishlist icon.
 * @param {boolean} [props.isRemoveIcon=false] - Flag to display a remove icon.
 * @param {Function} [props.RemoveIconComponent=() => <SvgWrapper svgSrc="item-close" />] - Custom component for the remove icon.
 * @param {Array} [props.followedIdList=[]] - List of followed product IDs.
 * @param {Function} [props.onWishlistClick=() => {}] - Callback function for wishlist icon click.
 * @param {Function} [props.handleAddToCart=() => {}] - Callback function for add to cart action.
 * @param {Function} [props.onRemoveClick=() => {}] - Callback function for remove icon click.
 * @param {boolean} [props.centerAlign=true] - Flag to center align text.
 * @param {boolean} [props.showAddToCart=false] - Flag to display the add to cart button.
 *
 * @returns {JSX.Element} The rendered product card component.
 *
 */

// import React, { useMemo } from "react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { currencyFormat, formatLocale } from "../../../../helper/utils";
import { useMobile } from "../../../../helper/hooks";
import FyImage from "../../../../components/core/fy-image/fy-image";
import SvgWrapper from "../../../../components/core/svgWrapper/SvgWrapper";
import  styles from "./product-card.less";
import FyButton from "../../../../components/core/fy-button/fy-button";
import { useGlobalStore, useFPI, useGlobalTranslation } from "fdk-core/utils";
import WishlistIcon from "../../../../assets/images/wishlist";
import PreviousArrow from "../../../../assets/images/pdp-gallery/previous.svg";
import NextArrow from "../../../../assets/images/pdp-gallery/next.svg";

const CardImageCarousel = ({ images, productName, imgSrcSet, imageBackgroundColor, autoplay, autoplaySpeed }) => {
  const [activeImage, setActiveImage] = useState(0);
  // Initial combined pause state: const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPaused = isHovered || isFocused;
  const pointerStart = useRef(null);
  const suppressImageClick = useRef(false);
  const imageKey = images.map((image) => image.url).join("|");
  const interval = Number(autoplaySpeed);
  const resolvedInterval = Number.isFinite(interval) && interval > 0 ? interval : 3000;

  useEffect(() => { setActiveImage(0); }, [imageKey]);
  useEffect(() => {
    if (!autoplay || isPaused || images.length < 2) return undefined;
    const timer = setInterval(() => {
      setActiveImage((current) => (current + 1) % images.length);
    }, resolvedInterval);
    return () => clearInterval(timer);
  }, [autoplay, isPaused, images.length, resolvedInterval]);

  const selectImage = (event, index) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveImage((index + images.length) % images.length);
  };

  return (
    <div
      className={styles.cardImageCarousel}
      role="group"
      aria-roledescription="carousel"
      aria-label={`${productName} images`}
      // Initial pause handlers: onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} onFocusCapture={() => setIsPaused(true)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={(event) => {
        // Initial combined pause reset: if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
        if (!event.currentTarget.contains(event.relatedTarget)) setIsFocused(false);
      }}
    >
      <div
        className={styles.cardImageTrack}
        style={{ transform: `translateX(-${activeImage * 100}%)` }}
        onMouseDown={(event) => { if (images.length > 1) event.stopPropagation(); }}
        onTouchStart={(event) => { if (images.length > 1) event.stopPropagation(); }}
        onTouchMove={(event) => { if (images.length > 1) event.stopPropagation(); }}
        onTouchEnd={(event) => { if (images.length > 1) event.stopPropagation(); }}
        onPointerDown={(event) => {
          if (images.length > 1) event.stopPropagation();
          pointerStart.current = { x: event.clientX, y: event.clientY };
          suppressImageClick.current = false;
        }}
        onPointerUp={(event) => {
          const start = pointerStart.current;
          pointerStart.current = null;
          if (!start || images.length < 2) return;
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
          <div className={styles.cardImageSlide} key={image.url} aria-hidden={index !== activeImage}>
            <FyImage
              src={image.url}
              alt={image.alt || productName}
              backgroundColor={imageBackgroundColor}
              isFixedAspectRatio={false}
              customClass={styles.productImage}
              sources={imgSrcSet}
              defer={false}
            />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <>
          <button type="button" className={`${styles.cardImageArrow} ${styles.cardImagePrevious}`} aria-label={`Previous image of ${productName}`} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => selectImage(event, activeImage - 1)}>
            <PreviousArrow viewBox="0 0 40 40" aria-hidden="true" />
          </button>
          <button type="button" className={`${styles.cardImageArrow} ${styles.cardImageNext}`} aria-label={`Next image of ${productName}`} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => selectImage(event, activeImage + 1)}>
            <NextArrow viewBox="0 0 40 40" aria-hidden="true" />
          </button>
          <div className={styles.cardImageDots}>
            {images.map((image, index) => (
              <button type="button" key={image.url} className={index === activeImage ? styles.cardImageDotActive : ""} aria-label={`View image ${index + 1} of ${productName}`} aria-pressed={index === activeImage} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => selectImage(event, index)} />
            ))}
          </div>
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
  imageCarouselAutoplay = false,
  imageCarouselAutoplaySpeed = 3000,
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
  // Original first-image presentation retained:
  // const imageUrl = images?.[0]?.url || imagePlaceholder;
  // const hoverImageUrl = images?.[1]?.url || "";
  // const imageAlt = images?.[0]?.alt || `${product?.brand?.name} | ${product?.name}`;
  const selectedImage = images?.[imageIndex]?.url ? images[imageIndex] : images?.[0];
  const imageUrl = selectedImage?.url || imagePlaceholder;
  const hoverImage = useSelectedImageOnHover ? selectedImage : images?.[1];
  const hoverImageUrl = hoverImage?.url || "";
  const imageAlt = selectedImage?.alt || `${product?.brand?.name} | ${product?.name}`;
  const hoverImageAlt = hoverImage?.alt || imageAlt;
  const carouselImages = imageCarouselIndices
    .map((index) => images[index])
    .filter((image, index, list) => image?.url && list.findIndex((item) => item?.url === image.url) === index);
  if (imageCarouselIndices.length > 0 && !carouselImages.length && selectedImage?.url) {
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
    > 




{displayTag && (
  <div className={styles.displayTagContainer}>
    {/* Original label retained: <span>{displayTag}</span> */}
    <span>{useColorDots && /^best\s*seller$/i.test(String(displayTag).trim()) ? "Best Seller" : displayTag}</span>
  </div>
)}


      <div className={styles.imageContainer}>
        {/* Original condition: !isMobile && showImageOnHover && hoverImageUrl */}
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
        {/* Original static image remains the fallback when the image carousel is not configured. */}
        {carouselImages.length ? (
          <CardImageCarousel images={carouselImages} productName={product.name} imgSrcSet={imgSrcSet} imageBackgroundColor={imageBackgroundColor} autoplay={imageCarouselAutoplay} autoplaySpeed={imageCarouselAutoplaySpeed} />
        ) : <FyImage
          src={imageUrl || imagePlaceholder}
          alt={imageAlt}
          backgroundColor={imageBackgroundColor}
          isFixedAspectRatio={false}
          customClass={`${styles.productImage} ${styles.mainImage}`}
          sources={imgSrcSet}
          defer={false}
        />}
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

    {/* CURRENT SHADE */}
   <div className={`${styles.shade} ${styles.currentShade}`}>
  {/* Original image-first condition retained: getShadeImage(currentShade?.medias) */}
  {!useColorDots && getShadeImage(currentShade?.medias) ? (
    <img
      src={getShadeImage(currentShade?.medias)}
      alt={currentShade?.name}
      className={styles.shadeImage}
    />
  ) : (
    <div
      className={styles.shadeColor}
      style={{
        // Original color formatting: currentShade?.color ? `#${currentShade.color}` : currentShade?.color_name,
        backgroundColor: getVariantColor(currentShade),
      }}
    />
  )}
</div>

 

{variants?.map((variantItem) => (
  <div
    key={variantItem.uid}
    className={`${styles.shade} ${styles.allShades}`}
  >
    {/* Original image-first condition retained: getShadeImage(variantItem?.medias) */}
    {!useColorDots && getShadeImage(variantItem?.medias) ? (
      <img
        src={getShadeImage(variantItem?.medias)}
        alt={variantItem?.name}
        className={styles.shadeImage}
      />
    ) : (
      <div
        className={styles.shadeColor}
        style={{
          // Original color formatting: variantItem?.color ? `#${variantItem.color}` : variantItem?.color_name,
          backgroundColor: getVariantColor(variantItem),
        }}
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
                <span
                  className={`${styles["productPrice--sale"]} ${styles.h4}`}
                >
                  {getListingPrice("effective")}
                </span>
              )}
              {hasDiscount && (
                <span
                  className={`${styles["productPrice--regular"]} ${styles.captionNormal}`}
                >
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
