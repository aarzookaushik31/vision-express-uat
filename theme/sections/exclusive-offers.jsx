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
import styles from "../styles/sections/exclusive-offers.less";
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
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: true,
        swipeToSlide: true,
        autoplay: !!autoplay?.value,
        autoplaySpeed: (slide_interval?.value ?? 3) * 1000,
        pauseOnHover: true,
        cssEase: "linear",
        arrows: blocksData.length > 1,
        dots: blocksData.length > 1,
        centerMode: false,
        variableWidth: false,
        swipe: false, 
        fade: true,
        nextArrow: <SliderRightIcon />,
        prevArrow: <SliderLeftIcon />,
        responsive: [
        {
            breakpoint: 800,
            settings: {
            arrows: false,
            pauseOnHover: false,
            swipe: blocksData.length > 1,
            swipeToSlide: false,
            touchThreshold: 80,
            draggable: false,
            touchMove: true,
            slidesToShow: 1,
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
    <section style={dynamicStyles} className={`${styles.mainoffers} exclusive-collections-section`}>
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
        <div className={styles.slideContenttt}>
            <FyImage
            src={getDesktopImage(block, index)}
            sources={getImgSrcSet(block, globalConfig, index)}
            defer={index < 1 ? false : true}
            alt={`slide-${index}`}
            isFixedAspectRatio={false}
            className={styles.collectionss}
            />
          <div
            className={`${styles.textOverlayy} ${
              block?.props?.center_align_text?.value ? styles.centerText : ""
            }`}
          >
            <>
              {block?.props?.brand_img?.value && (
                <img
                  src={block.props.brand_img.value}
                  alt="Brand Logo"
                  className={styles.brand_name}
                />
              )}
              {block?.props?.heading?.value && (
                <h2
                  style={{ color: block?.props?.heading_color?.value || "#000000" }}
                  dangerouslySetInnerHTML={{ __html: block.props.heading.value }}
                />
              )}
              {block?.props?.subheading?.value && (
                <p style={{ color: block?.props?.subheading_color?.value || "#000000" }}>
                  {block.props.subheading.value}
                </p>
              )}
            </>         

            <div className={styles.buttons}>
                {block?.props?.button_1_text?.value && (
                <FDKLink to={block?.props?.button_1_link?.value || "#"} className={styles.primaryBtn}>
                    {block.props.button_1_text.value}
                </FDKLink>
                )}
                {block?.props?.button_2_text?.value && (
                <FDKLink to={block?.props?.button_2_link?.value || "#"} className={styles.secondaryBtn}>
                    {block.props.button_2_text.value}
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
  label: "Exclusive Collections",
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
            type: "image_picker",
            id: "brand_img",
            label: "Brand image",
            default: "",  
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
          type: "checkbox",
          id: "center_align_text",
          label: "Center Align Text",
          default: false
        },
        {
          type: "color",
          id: "heading_color",
          label: "Heading Text Color",
          default: "#000000"
        },
        {
          type: "color",
          id: "subheading_color",
          label: "Subheading Text Color",
          default: "#000000"
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