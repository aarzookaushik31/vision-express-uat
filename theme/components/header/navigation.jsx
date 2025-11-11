import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FDKLink } from "fdk-core/components";
import { convertActionToUrl } from "@gofynd/fdk-client-javascript/sdk/common/Utility";
import styles from "./styles/navigation.less";
import HamburgerIcon from "../../assets/images/hamburgericon.svg";
import CloseIcon from "../../assets/images/close.svg";
import WishlistIcon from "../../assets/images/wishlistsidebaricon.png";
import LocationIcon from "../../assets/images/locationsidebaricon.png";
import ArrowDownIcon from "../../assets/images/arrow-down.svg";
import UserIcon from "../../assets/images/usersidebar.svg";
import EyeTestIcon from "../../assets/images/eyetesticon.png";
import ContactSidebar from "../../assets/images/contactsidebar.svg";
import { isRunningOnClient } from "../../helper/utils";
import MegaMenu from "./mega-menu";
import { useGlobalTranslation } from "fdk-core/utils";
import { useParams } from "react-router-dom";
import I18Dropdown from "./i18n-dropdown";
import MegaMenuLarge from "./mega-menu-large";
import Search from "./search";
import ArrowTabNav from "../../assets/images/arrownavtab.png";

function Navigation({
  fallbackLogo,
  reset,
  isSidebarNav,
  maxMenuLength = 0,
  customClass = {},
  navigationList,
  globalConfig,
  appInfo,
  checkLogin,
  languageIscCode,
  fpi
}) {
  const { locale } = useParams();
  const { t } = useGlobalTranslation("translation");
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSidebarNav, setShowSidebarNav] = useState(true);
  const [sidebarl2Nav, setSidebarl2Nav] = useState({});
  const [sidebarl3Nav, setSidebarl3Nav] = useState({});
  const [sidebarl4Nav, setSidebarl4Nav] = useState({});
  const [activeItem, setActiveItem] = useState(null);
  const [hoveredL2Index, setHoveredL2Index] = useState(null);
  const [isClient, setIsClient] = useState(false);


useEffect(() => {
  if (sidebarl2Nav?.state && sidebarl2Nav?.navigation?.length > 0) {
    setHoveredL2Index(0);
  }
}, [sidebarl2Nav]);



  const handleMouseEnter = (index) => {
    setActiveItem(index);
  };

  const handleMouseLeave = () => {
    setActiveItem(null);
    setHoveredL2Index(null);
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };

  const navWeightClassName = useMemo(() => {
    if (globalConfig?.nav_weight === "regular") {
      return styles.fwRegular;
    }
    if (globalConfig?.nav_weight === "bold") {
      return styles.fwBold;
    }
    return styles.fwSemibold;
  }, [globalConfig?.nav_weight]);

  const closeSidebarNav = () => {
    setShowSidebar(false);
    setShowSidebarNav(true);
    setSidebarl2Nav({ state: false });
    setSidebarl3Nav({ state: false });
  };

  useEffect(() => {
    if (reset) {
      closeSidebarNav();
    }
  }, [reset]);

  useEffect(() => {
    if (isRunningOnClient()) {
      setIsClient(true);
      if (showSidebar) {
        document.body.classList.add("remove-scroll");
      } else {
        document.body.classList.remove("remove-scroll");
      }
      return () => {
        document.body.classList.remove("remove-scroll");
      };
    }
  }, [showSidebar]);

  const isHorizontalNav = navigationList?.length > 0 && !isSidebarNav;
  const isMegaMenu =
    isHorizontalNav &&
    globalConfig?.header_mega_menu &&
    globalConfig?.header_layout === "double";
  const isFullWidthMegamenu =
    globalConfig?.header_mega_menu_fullwidth && isMegaMenu;
  const getNavigation = navigationList?.slice(0, maxMenuLength);

  const getShopLogoMobile = () =>
     globalConfig?.mobile_sidebar_logo ||
    appInfo?.mobile_logo?.secure_url ||
    appInfo?.logo?.secure_url ||
    fallbackLogo;

  const openSidebarNav = () => {
    setShowSidebar(true);
  };

  const getAnimate = (index) => {
    let animate = null;
    if (isClient) {
      if (activeItem === index) {
        animate = { opacity: 1, y: 0 };
      } else {
        animate = { opacity: 0, y: -20 };
      }
    }
    return animate;
  };

  const redirectToMenu = (menu, level) => {
    if (!menu.sub_navigation.length) {
      closeSidebarNav();
    } else {
      if (level === "l2") {
        setShowSidebarNav(false);
        setSidebarl3Nav((prev) => ({ ...prev, title: false, state: false }));
        setSidebarl2Nav({
          state: true,
          title: menu.display,
          navigation: menu.sub_navigation,
          parentTags: menu.tags  ? menu.tags : [],
        });
      }
      if (level === "l3") {
        setSidebarl2Nav((prev) => ({ ...prev, state: false }));
        setSidebarl3Nav({
          state: true,
          title: menu.display,
          navigation: menu.sub_navigation,
        });
      }
       if (level === "l4") {
      setSidebarl3Nav({ state: false });
      setSidebarl4Nav({
        state: true,
        title: menu.display,
        navigation: menu.sub_navigation,
      });
    }
    }
  };

const goBack = (level) => {
  if (level === "l2") {
    setSidebarl2Nav({ state: true });
    setSidebarl3Nav({ state: false });
    setSidebarl4Nav({ state: false });
  }
  if (level === "l1") {
    setSidebarl2Nav({ state: false });
    setSidebarl3Nav({ state: false });
    setSidebarl4Nav({ state: false });
    setShowSidebarNav(true);
  }
  if (level === "l3") {
    setSidebarl3Nav({ state: true });
    setSidebarl4Nav({ state: false });
  }
};


  return (
    <div className={customClass}>
      {isFullWidthMegamenu ? (
        <MegaMenuLarge
          headerNavigation={getNavigation}
          l1MenuClassName={navWeightClassName}
        ></MegaMenuLarge>
      ) : isMegaMenu ? (
        <MegaMenu
          headerNavigation={getNavigation}
          l1MenuClassName={navWeightClassName}
        ></MegaMenu>
      ) : isHorizontalNav ? (
        <nav className={`${styles.nav} ${customClass}`}>
          <AnimatePresence>
            <motion.ul
              className={styles.l1NavigationList}
              initial={isClient ? "hidden" : undefined}
              animate={isClient ? "visible" : undefined}
              exit={isClient ? "hidden" : undefined}
              variants={dropdownVariants}
              transition={{ duration: 0.3 }}
            >
              {getNavigation?.map((l1nav, index) => (
                <li
                  key={index}
                  className={`${styles.l1NavigationList__item} h5 ${styles.flexAlignCenter} ${styles.fontBody} ${navWeightClassName}`}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                >
                  {l1nav?.action?.page?.type === "external" ? (
                    <a
                      href={l1nav?.action?.page?.query?.url[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span
                        className={`${styles.menuTitle} ${styles.flexAlignCenter}`}
                      >
                        <span>{l1nav.display}</span>
                        {l1nav.sub_navigation?.length > 0 && (
                          <ArrowDownIcon
                            className={`${styles.menuIcon} ${styles.dropdownIcon}`}
                          />
                        )}
                      </span>
                    </a>
                  ) : (
                    <FDKLink action={l1nav?.action}>
                      <span
                        className={`${styles.menuTitle} ${styles.flexAlignCenter}`}
                      >
                        <span>{l1nav.display}</span>
                        {l1nav.sub_navigation?.length > 0 && (
                          <ArrowDownIcon
                            className={`${styles.menuIcon} ${styles.dropdownIcon}`}
                          />
                        )}
                      </span>
                    </FDKLink>
                  )}

                  <AnimatePresence>
                    {l1nav?.sub_navigation?.length > 0 && (
                      <motion.div
                        className={styles.l2NavigationListWrapper}
                        initial={isClient ? { opacity: 0, y: -20 } : null}
                        animate={() => getAnimate(index)}
                        exit={isClient ? { opacity: 0, y: -20 } : null}
                        transition={{ duration: 0.3 }}
                      >
                        <ul className={styles.l2NavigationList}>
                          {l1nav.sub_navigation.map((l2nav, l2Index) => (
                            <li
                              key={l2nav.display}
                              className={`${styles.l2NavigationList__item} b1 ${styles.fontBody}`}
                              onMouseEnter={() => setHoveredL2Index(l2Index)}
                              onMouseLeave={() => setHoveredL2Index(null)}
                            >
                              <div
                                className={
                                  styles["l2NavigationList__item--container"]
                                }
                              >
                                <FDKLink
                                  action={l2nav?.action}
                                  className={
                                    styles["l2NavigationList__item--wrapper"]
                                  }
                                >
                                  <span
                                    className={`${styles.menuItem} ${styles.flexAlignCenter} ${styles.justifyBetween}`}
                                  >
                                    <span>{l2nav.display}</span>
                                    {l2nav?.sub_navigation?.length > 0 && (
                                      <ArrowDownIcon
                                        className={`${styles.menuIcon} ${styles.arrowRightIcon}`}
                                      />
                                    )}
                                  </span>
                                </FDKLink>
                                <AnimatePresence>
                                  {l2nav.sub_navigation.length > 0 &&
                                    hoveredL2Index === l2Index && (
                                      <motion.ul
                                        className={styles.l3NavigationList}
                                        initial={
                                          isClient
                                            ? { opacity: 0, x: -20 }
                                            : null
                                        }
                                        animate={
                                          isClient ? { opacity: 1, x: 0 } : null
                                        }
                                        exit={
                                          isClient
                                            ? { opacity: 0, x: -20 }
                                            : null
                                        }
                                        transition={{ duration: 0.3 }}
                                      >
                                        {l2nav.sub_navigation.map((l3nav) => (
                                          <li
                                            key={`${l3nav.display}`}
                                            className={`${styles.l3NavigationList__item} b1 ${styles.fontBody}`}
                                          >
                                            <FDKLink
                                              action={l3nav?.action}
                                              className={`${styles["l3NavigationList__item--wrapper"]}`}
                                            >
                                              <span
                                                className={`${styles.menuItem} ${styles.flexAlignCenter}`}
                                              >
                                                <span>{l3nav.display}</span>
                                              </span>
                                            </FDKLink>
                                          </li>
                                        ))}
                                      </motion.ul>
                                    )}
                                </AnimatePresence>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </nav>
      ) : null}
      <button
        className={`${styles.icon} ${styles.flexCenter}`}
        style={{ display: isSidebarNav ? "flex" : "none" }}
        onClick={openSidebarNav}
        aria-label="open navigation"
      >
        <HamburgerIcon
          className={`${styles.hamburgerIcon} ${styles.menuIcon}`}
        />
      </button>
      {/* Sidebar If */}
      <div>
        <motion.div
          className={`${styles.sidebar}`}
          initial={{ x: "-100%" }} // Start off-screen to the left
          animate={{ x: showSidebar ? 0 : "-100%" }} // Animate to 0 when open, back to -100% when closed
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "100%",
          }}
        >
          <div
            className={`${styles.sidebar__header} ${styles.flexAlignCenter} ${styles.justifyBetween}`}
            style={{
              display: "flex",
            }}
          >
            <FDKLink link="/">
              <img
                style={{
                  maxHeight: `${globalConfig?.mobile_logo_max_height || 24}px`,
                }}
                className={styles.logo}
                src={getShopLogoMobile()}
                loading="lazy"
                alt={t("resource.header.shop_logo_mobile_alt_text")}
              />
            </FDKLink>

            <div className={styles.sidebarHeaderIconContainer}>
              
               <button
              type="button"
              className={styles.wishlistIcon}
               onClick={() => {
                window.location.href = "/locate-us";
                setShowSidebar(false);
              }}
            >
                <img 
                    src={LocationIcon} 
                    alt="WishlistIcon" 
                    className={`${styles.menuIcon} ${styles.sidebarIcon}`}
                  />
            </button>

              <button
              type="button"
              className={styles.wishlistIcon}
               onClick={() => {
                checkLogin("wishlist");
                setShowSidebar(false);
              }}
            >
                <img 
                    src={WishlistIcon} 
                    alt="WishlistIcon" 
                    className={`${styles.menuIcon} ${styles.sidebarIcon}`}
                  />
            </button>
          
            <button
              type="button"
              className={styles.closeIcon}
              onClick={closeSidebarNav}
              aria-label={t("resource.facets.close_alt")}
            >
              <CloseIcon
                className={`${styles.menuIcon} ${styles.crossIcon} ${styles.sidebarIcon}`}
              />
            </button>
              </div>
          </div>

              <div className={styles.alwaysOnSearch}>
              <Search
                customSearchClass={styles.customSearchClass}
                customSearchWrapperClass={styles.customSearchWrapperClass}
                showCloseButton={false}
                alwaysOnSearch={true}
                globalConfig={globalConfig}
                fpi={fpi}
              />
            </div>
            















          <nav className={styles.sidebar__navigation}>
            <ul
              key="l1_Nav"
              style={{ display: showSidebarNav ? "block" : "none" }}
            >
              {navigationList.map((nav, index) => (
                <li
                  key={`${nav.display}-${index}`}
                  className={`${styles["sidebar__navigation--item"]} ${styles.flexAlignCenter} ${styles.justifyBetween} ${styles.fontBody} h5`}
                >
                  {nav?.action?.page?.type === "external" ? (
                    <a
                      href={nav?.action?.page?.query?.url[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.navLink}
                      onClick={() => {
                        setShowSidebar(false);
                        closeSidebarNav();
                      }}
                    >
                      {nav.display}
                    </a>
                  ) : convertActionToUrl(nav?.action) ? (
                    <FDKLink
                      className={styles.navLink}
                      action={nav?.action}
                      onClick={() => {
                        setShowSidebar(false);
                        closeSidebarNav();
                      }}
                    >
                      {nav.display}
                    </FDKLink>
                  ) : (
                    <span
                      onClick={() => {
                        if (nav.sub_navigation?.length > 0) {
                          redirectToMenu(nav, "l2");
                        } else {
                          setShowSidebar(false);
                          closeSidebarNav();
                        }
                      }}
                    >
                      {nav.display}
                    </span>
                  )}
                  {nav?.sub_navigation?.length > 0 && (
                    <div onClick={() => redirectToMenu(nav, "l2")}>
                      <ArrowDownIcon
                        className={`${styles.arrowRightIcon} ${styles.sidebarIcon} ${styles.menuIcon}`}
                        style={{
                          display: "block",
                        }}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
    

               
{sidebarl2Nav.state && !sidebarl4Nav.state && (
  <>
    {sidebarl2Nav?.parentTags?.includes("hasTabs") ? (
      // 🟣 If parent has "hasTabs" → show tab layout
      <div key="l2_Nav" className={styles.l2WithTabs}>
        {/* Back to L1 */}
        <div
          onClick={() => goBack("l1")}
          className={`${styles["sidebar__navigation--item"]} ${styles.title}
            ${styles.flexAlignCenter} ${styles.justifyStart} ${styles.fontBody} b1`}
          style={{ display: sidebarl2Nav.title ? "flex" : "none" }}
        >
          <ArrowDownIcon
            className={`${styles.arrowLeftIcon} ${styles.sidebarIcon} ${styles.menuIcon}`}
          />
          <span>{sidebarl2Nav.title}</span>
        </div>

        {/* Tabs */}
        <ul className={styles.l2Tabs}>
          {sidebarl2Nav.navigation.map((l2nav, index) => (
            <li
              key={index}
              className={`${styles.l2Tab} ${
                hoveredL2Index === index ? styles.activeTab : ""
              }`}
              onClick={() => setHoveredL2Index(index)}
            >
              <img
                className={styles.arrowtabimg}
                src={ArrowTabNav}
                alt="arrow"
                loading="lazy"
                fetchpriority="low"
              />
              <NavLogo nav={l2nav} />
              <span>{l2nav.display}</span>
            </li>
          ))}
        </ul>

        {/* L3 Content */}
        {hoveredL2Index !== null && !sidebarl4Nav.state && (
          <ul className={styles.l3NavigationList}>
            {sidebarl2Nav.navigation[hoveredL2Index]?.sub_navigation?.map(
              (l3nav, l3Index) => (
                <li
                  key={l3Index}
                  className={`${styles["sidebar__navigation--item"]} ${styles.fontBody} b2`}
                >
                  {convertActionToUrl(l3nav?.action) ? (
                    <FDKLink
                      className={styles.navLink}
                      action={l3nav?.action}
                      onClick={() => {
                        goBack("l1");
                        closeSidebarNav();
                      }}
                    >
                      {l3nav.display}
                    </FDKLink>
                  ) : (
                    <span
                      className={styles.spanL4}
                      onClick={() => {
                        if (l3nav.sub_navigation?.length > 0) {
                          redirectToMenu(l3nav, "l4");
                        }
                      }}
                    >
                      {l3nav.display}
                      {l3nav?.sub_navigation?.length > 0 && (
                        <ArrowDownIcon
                          className={`${styles.arrowRightIcon} ${styles.sidebarIcon} ${styles.menuIcon}`}
                        />
                      )}
                    </span>
                  )}
                </li>
              )
            )}
          </ul>
        )}
      </div>
    ) : (
      // 🟢 If parent does NOT have "hasTabs" → show normal L2 layout
      <div key="l2_Nav" className={styles.l2Normal}>
        <div
          onClick={() => goBack("l1")}
          className={`${styles["sidebar__navigation--item"]} ${styles.title}
            ${styles.flexAlignCenter} ${styles.justifyStart} ${styles.fontBody} b1`}
          style={{ display: sidebarl2Nav.title ? "flex" : "none" }}
        >
          <ArrowDownIcon
            className={`${styles.arrowLeftIcon} ${styles.sidebarIcon} ${styles.menuIcon}`}
          />
          <span>{sidebarl2Nav.title}</span>
        </div>

        <ul>
          {sidebarl2Nav.navigation.map((l2nav, l2Index) => (
            <li
              key={l2Index}
              className={`${styles["sidebar__navigation--item"]} ${styles.fontBody} b2`}
            >
              {convertActionToUrl(l2nav?.action) ? (
                <FDKLink
                  className={styles.navLink}
                  action={l2nav?.action}
                  onClick={() => {
                    goBack("l1");
                    closeSidebarNav();
                  }}
                >
                  {l2nav.display}
                </FDKLink>
              ) : (
                <span
                  onClick={() => {
                    if (l2nav.sub_navigation?.length > 0) {
                      redirectToMenu(l2nav, "l3");
                    }
                  }}
                >
                  {l2nav.display}
                  {l2nav?.sub_navigation?.length > 0 && (
                    <ArrowDownIcon
                      className={`${styles.arrowRightIcon} ${styles.sidebarIcon} ${styles.menuIcon}`}
                    />
                  )}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    )}
  </>
)}



{sidebarl4Nav.state && (
  <div key="l4_Nav" className={styles.l4Panel}>
    <div
      onClick={() => goBack("l3")}
      className={`${styles["sidebar__navigation--item"]} ${styles.title}
        ${styles.flexAlignCenter} ${styles.justifyStart} ${styles.fontBody} b1`}
    >
      <ArrowDownIcon
        className={`${styles.arrowLeftIcon} ${styles.sidebarIcon} ${styles.menuIcon}`}
      />
      <span>{sidebarl4Nav.title}</span>
    </div>

    <ul className={styles.l4NavigationList}>
      {sidebarl4Nav.navigation.map((l4nav, l4Index) => (
        <li
          key={l4Index}
          className={`${styles["sidebar__navigation--item"]} ${styles.fontBody} b2 ${
                  l4nav?.image ? styles.hasImage : ""
                }`}
        >
          {convertActionToUrl(l4nav?.action) ? (
            <FDKLink
              action={l4nav?.action}
              onClick={() => {
                goBack("l1");
                closeSidebarNav();
              }}

               className={`${styles.navLink}`}
            >
              <NavLogo nav={l4nav} />
              {l4nav.display}
            </FDKLink>
          ) : (
            <span
              onClick={() => {
                if (l4nav.sub_navigation?.length > 0) {
                  redirectToMenu(l4nav, "l4");
                }
              }}
            >
              {l4nav.display}
              {l4nav?.sub_navigation?.length > 0 && (
                <ArrowDownIcon
                  className={`${styles.arrowRightIcon} ${styles.sidebarIcon} ${styles.menuIcon}`}
                />
              )}
            </span>
          )}
        </li>
      ))}
    </ul>
  </div>
)}




          </nav>









          <div className={styles.sidebar__footer}>
             <button
              type="button"
              className={`${styles["sidebar__footer--item"]}  ${styles.flexAlignCenter} ${styles.fontBody} h5`}
              onClick={() => {
               window.location.href = "/sections/book-an-eye-test";
                setShowSidebar(false);
              }}
            >
               <div className={styles.svgiconContainer}>
                <img 
                    src={EyeTestIcon} 
                    alt="Eye Testing Icon" 
                    className={`${styles.menuIcon}  ${styles.sidebarIcon}${styles.wishlist}`}
                  />
              </div>
              <span>Eye Testing</span>
            </button>

            <button
              type="button"
              className={`${styles["sidebar__footer--item"]} ${styles.account} ${styles.flexAlignCenter} ${styles.fontBody} h5`}
              style={{ display: "flex" }}
              onClick={() => {
                checkLogin("profile_mobile");
                setShowSidebar(false);
              }}
            >
              <div className={styles.svgiconContainer}>
              <UserIcon
                className={`${styles.user} ${styles["sidebar-icon"]} ${styles.menuIcon}`}
              />
              </div>
              <span>{t("resource.header.account_text")}</span>
            </button>

            <button
              type="button"
              className={`${styles["sidebar__footer--item"]}  ${styles.flexAlignCenter} ${styles.fontBody} h5`}
              onClick={() => {
               window.location.href = "/contact-us";
                setShowSidebar(false);
              }}
            >
               <div className={styles.svgiconContainer}>
              <ContactSidebar
                className={`${styles.menuIcon}  ${styles.sidebarIcon}${styles.wishlist}`}
              />
              </div>
              <span>Contact Us</span>
            </button>
            
            <div className={`${styles.mobile} ${styles.i18Wrapper} ${styles.languageWrapper}`} >
              <I18Dropdown fpi={fpi} languageIscCode={languageIscCode}></I18Dropdown>
            </div>
          </div>
        </motion.div>
      </div>
      {/* eslint-disable jsx-a11y/no-static-element-interactions */}
      <div
        className={`${styles.overlay} ${showSidebar ? styles.show : ""} `}
        onClick={closeSidebarNav}
      />
    </div>
  );
}


const NavLogo = ({ nav }) => {
  const logo = nav?.image;

  if (!nav?.image) {
    return null;
  }

  return (
    <img
      className={styles.navLogo}
      src={logo}
      alt={nav.display}
      loading="lazy"
      fetchpriority="low"
    />
  );
};


export default Navigation;
