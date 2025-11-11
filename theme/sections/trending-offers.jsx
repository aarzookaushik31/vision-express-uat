import React, { useMemo } from "react";
import { FDKLink } from "fdk-core/components";
import Slider from "react-slick";
import SliderRightIcon from "../assets/images/glide-arrow-right.svg";
import SliderLeftIcon from "../assets/images/glide-arrow-left.svg";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import placeholderDesktop1 from "../assets/images/placeholder/slideshow-desktop1.jpg";
import placeholderDesktop2 from "../assets/images/placeholder/slideshow-desktop2.jpg";
import placeholderMobile1 from "../assets/images/placeholder/slideshow-mobile1.jpg";
import placeholderMobile2 from "../assets/images/placeholder/slideshow-mobile2.jpg";
import styles from "../styles/sections/trending-offers.less";
import { useGlobalStore } from "fdk-core/utils";

const placeholderImagesDesktop = [placeholderDesktop1, placeholderDesktop2];
const placeholderImagesMobile = [placeholderMobile1, placeholderMobile2];

function getMobileImage(block, index) {
  return (
    block?.props?.mobile_image?.value ||
    placeholderImagesMobile[index % placeholderImagesMobile.length]
  );
}
function getDesktopImage(block, index) {
  return (
    block?.props?.image?.value ||
    placeholderImagesDesktop[index % placeholderImagesDesktop.length]
  );
}

function getImgSrcSet(block, globalConfig, index) {
  if (globalConfig?.img_hd) {
    return [
      { breakpoint: { min: 501 } },
      { breakpoint: { max: 540 }, url: getMobileImage(block, index) },
    ];
  }
  return [
    { breakpoint: { min: 1728 }, width: 3564 },
    { breakpoint: { min: 1512 }, width: 3132 },
    { breakpoint: { min: 1296 }, width: 2700 },
    { breakpoint: { min: 1080 }, width: 2250 },
    { breakpoint: { min: 900 }, width: 1890 },
    { breakpoint: { min: 720 }, width: 1530 },
    { breakpoint: { max: 180 }, width: 450, url: getMobileImage(block, index) },
    { breakpoint: { max: 360 }, width: 810, url: getMobileImage(block, index) },
    {
      breakpoint: { max: 540 },
      width: 1170,
      url: getMobileImage(block, index),
    },
  ];
}

export function Component({ props, blocks, globalConfig, preset }) {
  const blocksData = blocks.length === 0 ? preset?.blocks : blocks;
  const {
    autoplay,
    slide_interval,
    padding_top,
    padding_bottom,
    open_in_new_tab,
  } = props;
  const shouldOpenInNewTab =
    open_in_new_tab?.value === true || open_in_new_tab?.value === "true";
  const { themeHeaderHeight = 0 } = useGlobalStore(fpi.getters.CUSTOM_VALUE);
  const { sections } = useGlobalStore(fpi.getters.PAGE);
const config = useMemo(
  () => ({
    speed: 400,
    slidesToScroll: 1,
    infinite: true,
    swipeToSlide: true,
    autoplay: !!autoplay?.value,
    autoplaySpeed: (slide_interval?.value ?? 3) * 1000,
    pauseOnHover: true,
    cssEase: "linear",
    centerPadding: '0px',
     slidesToShow: 2,

    arrows: blocksData.length > 1,
    dots: blocksData.length > 1,
    centerMode: false,
    variableWidth: false,
    nextArrow: <SliderRightIcon />,
    prevArrow: <SliderLeftIcon />,
    responsive: [
      {
        breakpoint: 800,
        settings: {
          arrows: false,
          pauseOnHover: false,
          swipe: blocksData.length > 1,
          centerPadding: "0",
          centerMode: false,
          slidesToShow: 1,
          swipeToSlide: false,
           variableWidth: false,
          touchThreshold: 80,
          draggable: false,
          touchMove: true
        },
      },
    ],
  }),
  [autoplay?.value, slide_interval?.value, blocksData]
);



  const dynamicStyles = {
    paddingTop: `${padding_top?.value ?? 0}px`,
    paddingBottom: `${padding_bottom?.value ?? 16}px`,
    marginTop:
      sections[0]?.name === "image-slideshow" &&
      globalConfig?.transparent_header
        ? `-${themeHeaderHeight}px`
        : "",
    "--slick-dots": `${blocksData?.length * 22 + 10}px`,
  };

  return (
    <section style={dynamicStyles} className={`${styles.mainoffers} custom-offers-section`}>
      {props?.main_heading?.value && (
        <h2 className={styles.sectionHeading}>{props.main_heading.value}</h2>
      )}
      <Slider {...config} initialSlide={0} className={styles.slideshowSlider}>
        {blocksData?.map((block, index) => (
          <FDKLink
            to={block?.props?.redirect_link?.value ?? ""}
            target={shouldOpenInNewTab ? "_blank" : "_self"}
            key={index}
            className={styles.slideWrapper}
          >
            <div className={styles.slideContentt}>
              <FyImage
                src={getDesktopImage(block, index)}
                sources={getImgSrcSet(block, globalConfig, index)}
                defer={index < 1 ? false : true}
                alt={`slide-${index}`}
                isFixedAspectRatio={false}
                className="secondImageStyle"
              />
              <div className={styles.textOverlayy} style={{
                marginTop: block?.props?.custom_margin?.value || "0px"
              }}>
                <div>
                  <>
                    {block?.props?.heading?.value && (
                      <h2 dangerouslySetInnerHTML={{ __html: block.props.heading.value }} />
                    )}
                    {block?.props?.subheading?.value && (
                      <p>{block.props.subheading.value}</p>
                    )}
                  </>
                </div>
                <div className={styles.buttons}>
                  {block?.props?.button_1_text?.value && (
                    <FDKLink
                      to={block?.props?.button_1_link?.value || "#"}
                      className={styles.primaryBtn}
                      style={{
                        backgroundColor: block?.props?.button_1_bg?.value || "#000000",
                      }}
                    >
                      <span
                        style={{
                          color: block?.props?.button_1_color?.value || "#000000",
                        }}
                      >
                        {block.props.button_1_text.value}
                      </span>
                    </FDKLink>
                  )}
                  {block?.props?.button_2_text?.value && (
                    <FDKLink
                      to={block?.props?.button_2_link?.value || "#"}
                      className={styles.secondaryBtn}
                      style={{
                        backgroundColor: block?.props?.button_2_bg?.value || "#FFFFFF",
                      }}
                    >
                      <span
                        style={{
                          color: block?.props?.button_2_color?.value || "#000000",
                        }}
                      >
                        {block.props.button_2_text.value}
                      </span>
                    </FDKLink>
                  )}
                </div>
              </div>
            </div>
          </FDKLink>
        ))}
      </Slider>
    </section>
  );
}

export const settings = {
  label: "Trending Offers",
  blocks: [
    {
      name: "Offer Card",
      type: "gallery",
      props: [
        {
          type: "image_picker",
          id: "image",
          label: "t:resource.common.desktop_image",
          default: "",
          options: {
            aspect_ratio: "16:5",
          },
        },
        {
          type: "image_picker",
          id: "mobile_image",
          label: "t:resource.common.mobile_image",
          default: "",
          options: {
            aspect_ratio: "3:4",
          },
        },
        {
          type: "url",
          id: "redirect_link",
          label: "t:resource.sections.image_slideshow.slide_link",
        },
        {
        type: "text",
        id: "heading",
        label: "Heading Text",
        default: "",
        },
        {
        type: "text",
        id: "subheading",
        label: "Subheading Text",
        default: "",
        },
        {
        type: "text",
        id: "button_1_text",
        label: "Primary Button Text",
        default: "Explore Eyewear",
        },
        {
        type: "url",
        id: "button_1_link",
        label: "Primary Button Link",
        default: "#",
        },
        {
        type: "text",
        id: "button_2_text",
        label: "Secondary Button Text",
        default: "Check in Store",
        },
        {
        type: "url",
        id: "button_2_link",
        label: "Secondary Button Link",
        default: "#",
        },
        {
          type: "color",
          id: "button_1_bg",
          label: "Primary Button Background Color",
          default: "#000000"
        },
        {
          type: "color",
          id: "button_2_bg",
          label: "Secondary Button Background Color",
          default: "#FFFFFF"
        },
        {
          type: "color",
          id: "button_1_color",
          label: "Primary Button Text Color",
          default: "#000000"
        },
        {
          type: "color",
          id: "button_2_color",
          label: "Secondary Button Text Color",
          default: "#FFFFFF"
        },
        {
          type: "text",
          id: "custom_margin",
          label: "Custom Margin for Text Overlay",
          default: "0px",
        }
      ],
    },
  ],
  props: [
    {
      type: "text",
      id: "main_heading",
      label: "Section Title",
      default: "Trending Offers",
    },
    {
      type: "checkbox",
      id: "autoplay",
      default: true,
      label: "t:resource.common.auto_play_slides",
      info: "t:resource.sections.image_slideshow.check_to_autoplay_slides",
    },
    {
      type: "range",
      id: "slide_interval",
      min: 1,
      max: 10,
      step: 1,
      unit: "sec",
      label: "t:resource.common.change_slides_every",
      default: 3,
      info: "t:resource.sections.image_slideshow.autoplay_slide_duration",
    },
    {
      type: "range",
      id: "padding_top",
      min: 0,
      max: 100,
      step: 1,
      unit: "px",
      label: "t:resource.sections.image_slideshow.top_margin",
      default: 0,
      info: "t:resource.sections.image_slideshow.top_margin_info",
    },
    {
      type: "range",
      id: "padding_bottom",
      min: 0,
      max: 100,
      step: 1,
      unit: "px",
      label: "t:resource.sections.categories.bottom_padding",
      default: 16,
      info: "t:resource.sections.categories.bottom_padding_for_section",
    },
    {
      type: "checkbox",
      id: "open_in_new_tab",
      default: false,
      label: "t:resource.sections.image_slideshow.open_links_in_new_tab",
      info: "t:resource.sections.image_slideshow.open_links_in_new_tab_info",
    },
    {
        type: "text",
        id: "main_heading",
        label: "Main Heading",
        default: "Trending Offers",
    }
  ],
  preset: {
    blocks: [
      {
        name: "Offer Card",
        props: {
          image: {
            type: "image_picker",
            value: "",
          },
          mobile_image: {
            type: "image_picker",
            value: "",
          },
        },
      },
      {
        name: "Offer Card",
        props: {
          image: {
            type: "image_picker",
            value: "",
          },
          mobile_image: {
            type: "image_picker",
            value: "",
          },
        },
      },
    ],
  },
};
export default Component;