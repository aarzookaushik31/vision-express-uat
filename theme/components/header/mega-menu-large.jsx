import React, { useEffect, useMemo, useState } from "react";
import { useFPI, useGlobalStore } from "fdk-core/utils";
import { FDKLink } from "fdk-core/components";
import styles from "./styles/mega-menu-large.less";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import ArrowDownIcon from "../../assets/images/arrow-down.svg";
import VecareLogo from "../../assets/images/vecarelogo.png";

const VECARE_LABEL = "ve care protect";

const isVecareProtect = (text) =>
  typeof text === "string" &&
  text.trim().replace(/\s+/g, " ").toLowerCase() === VECARE_LABEL;

function MegaMenuLarge({ headerNavigation, l1MenuClassName = "" }) {
  useEffect(() => {
    const navItems = document.querySelectorAll(`.${styles.navigationItem} a`);

    const handleClick = () => {
      const hoveredMenus = document.querySelectorAll(
        `.${styles.navigationItem}:hover`
      );
      hoveredMenus.forEach((item) => {
        item.style.pointerEvents = "none";
        setTimeout(() => {
          item.style.pointerEvents = "auto";
        }, 200);
      });
    };

    navItems.forEach((link) => link.addEventListener("click", handleClick));

    return () => {
      navItems.forEach((link) =>
        link.removeEventListener("click", handleClick)
      );
    };
  }, []);

  return (
    <div className={`${styles.headerNavigation}`}>
      {headerNavigation.map((menu, index) => (
        <div
          key={index}
          link={menu.link}
          className={`${styles.navigationItem}`}
        >
          <div
            className={`${styles.l1Category} ${l1MenuClassName} menu-item-custom`}
          >
         <h5 className={`${styles.l1CategoryHeading}`}>
  <FDKLink action={menu?.action}>
    {isVecareProtect(menu.display) ? (
      <img
        className={styles.l1Logo}
        src={VecareLogo}
        alt={menu.display}
        width={"90px"}
        height={"40px"}
      />
    ) : (
      menu.display
    )}
  </FDKLink>
</h5>
            {!!menu?.sub_navigation?.length && (
              <ArrowDownIcon
                className={`${styles.menuIcon} ${styles.dropdownIcon}`}
              />
            )}
          </div>
          <Megamenu navigation={menu} />
        </div>
      ))}
    </div>
  );
}

const Megamenu = ({ navigation }) => {
  const fpi = useFPI();
  const { themeHeaderHeight = 105 } = useGlobalStore(fpi.getters.CUSTOM_VALUE);

  // L2 items WITHOUT an image render as text columns.
  // L2 items WITH an image render as banner cards on the right
  // (label is baked into the image itself, so no text overlay).
  const { columnItems, bannerItems } = useMemo(() => {
    const columns = [];
    const banners = [];
    navigation?.sub_navigation?.forEach((l2Menu) => {
      if (l2Menu?.image) {
        banners.push(l2Menu);
      } else {
        columns.push(l2Menu);
      }
    });
    return { columnItems: columns, bannerItems: banners };
  }, [navigation?.sub_navigation]);

  if (!navigation?.sub_navigation?.length) {
    return null;
  }

  const dynamicStyles = {
    "--theme-header-height": `${themeHeaderHeight}px`,
  };

  return (
    <div
      className={`${styles.megamenuWrapper} ${styles.simpleDropdown}`}
      style={dynamicStyles}
    >
      <div className={styles.megamenuContainer}>
        {navigation?.display && (
          <div className={styles.megamenuHeading}>
            <NavLogo nav={navigation} />
            <h2>{navigation.display}</h2>
          </div>
        )}

        <div className={styles.megamenuContent}>
          {!!columnItems.length && (
            <div className={styles.l2Content}>
              {columnItems.map((l2Menu, l2index) => (
                <div
                  key={`${l2Menu.display}_${l2index}`}
                  className={styles.l2Block}
                >
                  <FDKLink
                    action={l2Menu?.action}
                    className={styles.l2NavigationItem}
                  >
                    <div className={styles.l2NavigationText}>
                      {l2Menu.display}
                    </div>
                  </FDKLink>

                 {!!l2Menu?.sub_navigation?.length && (
  <div className={styles.l3NavigationBlock}>
    {l2Menu.sub_navigation.map((l3Menu, l3index) => (
      <L3Item key={`${l3Menu.display}_${l3index}`} l3Menu={l3Menu} />
    ))}
  </div>
)}
                </div>
              ))}
            </div>
          )}

          {!!bannerItems.length && (
            <div className={styles.navigationImageGroup}>
              {bannerItems.map((banner, bIndex) => (
                <div
                  key={`banner_${bIndex}`}
                  className={styles.navigationImage}
                >
                  <FDKLink action={banner?.action}>
                    <img
                      src={banner.image}
                      defer={true}
                      alt={banner?.display}
                    />
                  </FDKLink>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


const L3Item = ({ l3Menu }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasL4 = !!l3Menu?.sub_navigation?.length;

  // No L4 children: normal link, same as before
  if (!hasL4) {
    return (
      <FDKLink action={l3Menu?.action} className={styles.l3NavigationItem}>
        <div className={styles.l3NavigationTextnotabs}>{l3Menu.display}</div>
      </FDKLink>
    );
  }

  // Has L4 children: no link, the whole row toggles the dropdown
  return (
    <div className={`${styles.l3Block} ${isOpen ? styles.l3Open : ""}`}>
      <button
        type="button"
        className={styles.l3Row}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className={styles.l3NavigationTextnotabs}>{l3Menu.display}</span>
        <ArrowDownIcon className={styles.l3Icon} />
      </button>

      <div className={styles.l4NavigationBlock}>
        {l3Menu.sub_navigation.map((l4Menu, l4index) => (
          <FDKLink
            key={`${l4Menu.display}_${l4index}`}
            action={l4Menu?.action}
            className={styles.l4NavigationItem}
          >
            <div className={styles.l4NavigationText}>{l4Menu.display}</div>
          </FDKLink>
        ))}
      </div>
    </div>
  );
};




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

export default MegaMenuLarge;