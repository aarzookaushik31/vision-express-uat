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
import LocationIcon from "../../assets/images/locationicon.svg";
import EyeTestingIcon from "../../assets/images/eyetestingicon.png";
import { FDKLink } from "fdk-core/components";
import Slider from "react-slick";

import DefaultTickerImage from "../../assets/images/tabler_eye-bolt.png";
import FindYourLensImage from "../../assets/images/glass-lens.png";


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
   themeKey = "",
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
          <div className={styles.tickerInline}>
            <Slider {...sliderConfig} className={styles.tickerSlider}>
              {tickerSlides.map((slide, index) => {
                const plainText = slide.replace(/<[^>]*>/g, "");
                const tickerImage = plainText
                  .toLowerCase()
                  .includes("find your lens")
                  ? FindYourLensImage
                  : DefaultTickerImage;

                return (
                  <div key={index} className={styles.tickerSlide}>
                    <img
                      src={tickerImage}
                      alt="Ticker"
                      className={styles.tickerImage}
                    />
                    <p
                      className={styles.tickerText}
                      dangerouslySetInnerHTML={{ __html: slide }}
                    />
                  </div>
                );
              })}
            </Slider>
          </div>

            <a
              href={`tel:22 6998 2727`}
              className={styles.tickerPhone}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.57.57 1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.57 1 1 0 01-.25 1.01l-2.2 2.21z"
                  fill="currentColor"
                />
              </svg>
              <span>+91 22 6998 2727</span>
            </a>
        </div>
      )}






      <div  className={`${styles.firstRowContainer} ${
    themeKey ? styles[themeKey] : ""
  }`}>
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
              width={200}
              height={35}
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
      

        {(!isDoubleRowHeader && globalConfig?.always_on_search) && (
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


  {(!isDoubleRowHeader && !globalConfig?.always_on_search) && (
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
                className={`${styles.icon} ${styles.findStoreicon}`}
                aria-label={`Find store`}
                 onClick={() => {
               window.location.href = "/locate-us";
              }}
              >
                <div>
                  <LocationIcon 
      className={styles.singleRowIcon} 
    />
                </div>
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
            </div>
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
           <FDKLink  className={styles.headerlogo} to="/">
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
