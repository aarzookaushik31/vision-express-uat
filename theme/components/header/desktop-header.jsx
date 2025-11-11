import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  useGlobalStore,
  useGlobalTranslation,
  useLocale,
} from "fdk-core/utils";
import Navigation from "./navigation";
import I18Dropdown from "./i18n-dropdown";
import Search from "./search";
import styles from "./styles/desktop-header.less";
import AngleDownIcon from "../../assets/images/header-angle-down.svg";
import WishlistIcon from "../../assets/images/wishlistHeader.svg";
import UserIcon from "../../assets/images/accountHeader.svg";
import CartIcon from "../../assets/images/single-row-cart.svg";
import LocationIcon from "../../assets/images/locationicon.png";
import EyeTestingIcon from "../../assets/images/eyetestingicon.png";
import { FDKLink } from "fdk-core/components";
import Tickerimage from "../../assets/images/tabler_eye-bolt.png";
import Slider from "react-slick";

function HeaderDesktop({
  checkLogin,
  fallbackLogo,
  cartItemCount,
  globalConfig,
  LoggedIn,
  appInfo,
  navigation,
  wishlistCount,
  fpi,
  isHyperlocal = false,
  isPromiseLoading = false,
  pincode = "",
  deliveryMessage = "",
  onDeliveryClick = () => {},
  languageIscCode,
}) {




const rawTicker = globalConfig?.header_ticker_text || "";

// Split by comma, remove extra spaces
const tickerSlides = rawTicker
  .split(",")
  .map((t) => t.trim())
  .filter(Boolean);



  const sliderConfig = {
    dots: false,
    arrows: false,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 1,
    slidesToScroll: 1,
    swipeToSlide: true,
    pauseOnHover: false,
  };



  const { t } = useGlobalTranslation("translation");
  const isDoubleRowHeader = globalConfig?.header_layout === "double";

  const getMenuMaxLength = () => {
    if (isDoubleRowHeader) {
      return 50;
    }

    const logoMenuAlignment = globalConfig?.logo_menu_alignment;
    return {
      layout_1: 6,
      layout_2: 6,
      layout_3: 6,
      layout_4: 5,
    }[logoMenuAlignment];
  };

  const getShopLogo = () =>
    appInfo?.logo?.secure_url?.replace("original", "resize-h:165") ||
    fallbackLogo;





  return (
    <div
      className={`${styles.headerDesktop}  ${
        styles[globalConfig.header_layout]
      } ${styles[globalConfig.logo_menu_alignment]}`}
    >


{tickerSlides.length > 0 && (
  <div className={styles.homepageTicker}>
    <Slider {...sliderConfig} className={styles.tickerSlider}>
      {tickerSlides.map((slide, index) => (
        <div key={index} className={styles.tickerSlide}>
          <img src={Tickerimage} alt="Ticker" className={styles.tickerImage} />
          <p
            className={styles.tickerText}
            dangerouslySetInnerHTML={{ __html: slide }}
          />
        </div>
      ))}
    </Slider>
  </div>
)}





      <div className={styles.firstRowContainer}>
      <div className={styles.firstRow}>
       
        <div className={`${styles.left} ${(isDoubleRowHeader && globalConfig?.logo_menu_alignment === "layout_3") ? styles.leftLayout3DoubleHeader : ""}`}>
          {!isDoubleRowHeader && (
            <Navigation
              customClass={`${styles.firstRowNav} ${
                styles[globalConfig?.header_layout]
              }`}
              maxMenuLength={getMenuMaxLength()}
              fallbackLogo={fallbackLogo}
              navigationList={navigation}
              appInfo={appInfo}
              globalConfig={globalConfig}
              reset
              checkLogin={checkLogin}
              languageIscCode={languageIscCode}
              fpi={fpi}
            />
          )}
          {isDoubleRowHeader && globalConfig?.always_on_search && (
            <div className={styles.alwaysOnSearch}>
              <Search
                customSearchClass={styles.customSearchClass}
                customSearchWrapperClass={styles.customSearchWrapperClass}
                showCloseButton={false}
                alwaysOnSearch={true}
                screen="desktop"
                globalConfig={globalConfig}
                fpi={fpi}
              />
            </div>
          )}
        </div>
        <div className={`${styles.middle} ${styles.flexCenter}`}>

            { !(isDoubleRowHeader && globalConfig?.logo_menu_alignment === "layout_3") && (
          <FDKLink to="/">
            <img
              className={styles.logo}
              style={{
                maxHeight: `${globalConfig?.desktop_logo_max_height || 65}px`,
              }}
              src={getShopLogo()}
              alt={t("resource.header.shop_logo_alt_text")}
            />
             </FDKLink>
             )}


          {isHyperlocal &&
            globalConfig?.always_on_search &&
            ["layout_1", "layout_2", "layout_3"].includes(
              globalConfig?.logo_menu_alignment
            ) && (
              <button
                className={`${styles.hyperlocalActionBtn} ${styles.hyperlocalSearchOn}`}
                onClick={onDeliveryClick}
              >
                {isPromiseLoading ? (
                  t("resource.header.fetching")
                ) : (
                  <>
                    <div className={styles.label}>
                      {pincode
                        ? deliveryMessage
                        : t("resource.header.pin_code")}
                    </div>
                    {pincode && (
                      <div className={styles.pincode}>
                        <span>{pincode}</span>
                        <AngleDownIcon className={styles.headerAngleDownIcon} />
                      </div>
                    )}
                  </>
                )}
              </button>
            )}
        </div>
        <div className={`${styles.right} ${styles.right__icons}`}>
          <I18Dropdown
            fpi={fpi}
            languageIscCode={languageIscCode}
          ></I18Dropdown>
          {isHyperlocal &&
            (!globalConfig?.always_on_search ||
              globalConfig?.logo_menu_alignment === "layout_4") && (
              <button
                className={styles.hyperlocalActionBtn}
                onClick={onDeliveryClick}
              >
                {isPromiseLoading ? (
                  t("resource.header.fetching")
                ) : (
                  <>
                    <div className={styles.label}>
                      {pincode
                        ? deliveryMessage
                        : t("resource.header.pin_code")}
                    </div>
                    {pincode && (
                      <div className={styles.pincode}>
                        <span>{pincode}</span>
                        <AngleDownIcon className={styles.headerAngleDownIcon} />
                      </div>
                    )}
                  </>
                )}
              </button>
            )}
          {(!isDoubleRowHeader || !globalConfig?.always_on_search) && (
            <div className={`${styles.icon} ${styles["right__icons--search"]}`}>
              <Search
                customClass={`${styles[globalConfig?.header_layout]}-row-search`}
                screen="desktop"
                globalConfig={globalConfig}
                fpi={fpi}
              />
            </div>
          )}

           <button
                type="button"
                className={`${styles.icon}`}
                aria-label={`Eye testing`}
                 onClick={() => {
               window.location.href = "/sections/book-an-eye-test";
              }}
              >
                <div>
                 <img 
      src={EyeTestingIcon} 
      alt="Eye Testing Icon" 
      className={styles.singleRowIcon} 
    />
                </div>
              Eye Testing
              </button>

          <button
            type="button"
            className={`${styles.icon} ${styles["right__icons--profile"]}`}
            aria-label={t("resource.profile.profile")}
            onClick={() => checkLogin("profile")}
          >
            <UserIcon
              className={`${styles.user} ${styles.headerIcon} ${styles.singleRowIcon}`}
            />
            My Account
          </button>
          <button
            type="button"
            className={` ${styles["right__icons--wishlist"]}`}
            aria-label="wishlist"
            onClick={() => checkLogin("wishlist")}
          >
            <div className={styles.icon}>
              <WishlistIcon
                className={`${styles.wishlist} ${styles.singleRowIcon}`}
              />
              {wishlistCount > 0 && LoggedIn && (
                <span className={styles.count}>{wishlistCount}</span>
              )}
              Wishlist
            </div>
          </button>
          {!globalConfig?.disable_cart &&
            globalConfig?.button_options !== "none" && (
              <button
                type="button"
                className={`${styles.icon} ${styles["right__icons--bag"]}`}
                aria-label={`${cartItemCount ?? 0} item in cart`}
                onClick={() => checkLogin("cart")}
              >
                <div>
                  <CartIcon
                    className={`${styles.cart} ${styles.singleRowIcon}`}
                  />
                  {cartItemCount > 0 && (
                    <span className={styles.count}>{cartItemCount}</span>
                  )}
                </div>
                Cart
              </button>
            )}

           
              <button
                type="button"
                className={`${styles.icon}`}
                aria-label={`Find store`}
                 onClick={() => {
               window.location.href = "/locate-us";
              }}
              >
                <div>
                  <img 
      src={LocationIcon} 
      alt="Location Icon" 
      className={styles.singleRowIcon} 
    />
                </div>
               Find Store
              </button>

               <button
                type="button"
                className={`${styles.icon}`}
                aria-label={`Contact Us`}
                onClick={() => {
               window.location.href = "/contact-us";
              }}
              >
              Contact Us
              </button>
            
        </div>
        </div>
        </div>
   
      {isDoubleRowHeader && (       
        <div        
        className={`${styles.secondRowContainer} ${
      globalConfig?.logo_menu_alignment === "layout_3" ? styles.layout3ExtraClass : ""
    }`}        
        >
          

           { globalConfig?.logo_menu_alignment === "layout_3" &&
           <FDKLink to="/">
            <img
              className={styles.logo}
              style={{
                maxHeight: `${globalConfig?.desktop_logo_max_height || 65}px`,
              }}
              src={getShopLogo()}
              alt={t("resource.header.shop_logo_alt_text")}
            />
          </FDKLink>
           }

        <Navigation
          customClass={styles.secondRow}
          maxMenuLength={getMenuMaxLength()}
          fallbackLogo={fallbackLogo}
          navigationList={navigation}
          globalConfig={globalConfig}
          appInfo={appInfo}
          LoggedIn={LoggedIn}
          checkLogin={checkLogin}
          languageIscCode={languageIscCode}
          fpi={fpi}
        />
        </div>
       
      )}
      
    </div>
  );
}

export default HeaderDesktop;
