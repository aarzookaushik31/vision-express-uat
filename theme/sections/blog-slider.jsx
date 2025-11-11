import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { useFPI } from "fdk-core/utils";
import { FETCH_BLOGS_LIST } from "../queries/blogQuery";
import styles from "../styles/sections/blog-slider.less";
import Clock from "../assets/images/clockwhite.png";
import Calender from "../assets/images/calenderwhite.png";

export function Component({ props }) {
  const fpi = useFPI();
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const response = await fpi.executeGQL(
        FETCH_BLOGS_LIST,
        { pageNo: 1, pageSize: 6 },
        { skipStoreUpdate: true }
      );
      const blogsData = response?.data?.applicationContent?.blogs?.items || [];
      setBlogs(blogsData);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const settings = {
    dots: true,
    arrows: true,
    infinite: blogs.length > 3,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: "0px",
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  return (
    <div className={`${styles.blogSliderSection} blog-slider-section`}>
      {props?.title?.value && (
        <h2 className={styles.heading}>{props.title.value}</h2>
      )}
      {props?.description?.value && (
        <p className={styles.subHeading}>{props.description.value}</p>
      )}

      {isLoading ? (
        <div className={styles.loading}>Loading blogs...</div>
      ) : (
        <Slider {...settings} className={styles.sliderWrapper}>
          {blogs.map((blog, idx) => {
            const imageUrl =
              blog?.feature_image?.secure_url ||
              props?.fallback_image?.value ||
              "";

            const readingTime = blog.reading_time
              ? `${blog.reading_time} min read`
              : "5 min read"; // fallback

            const publishDate = blog.publish_date
              ? new Date(blog.publish_date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "";

            return (
              <div key={blog.id || idx} className={styles.blogCard}>
                <div className={styles.imageWrapper}>
                  <img src={imageUrl} alt={blog.title} />
                </div>
                <div className={styles.content}>
                  <div className={`${styles.meta} blog-meta`}>
                    {publishDate && <span> <img src={Calender} alt='calender' />  {publishDate} </span>}
                    <span>  <img src={Clock} alt="clock" /> {readingTime}</span>
                  </div>
                  <div className={styles.blogCardContent}>
                  <h3 className={`${styles.title} blog-title`}>{blog.title}</h3>



                          {Array.isArray(blog.content) && blog.content.length > 0 && (() => {
  const firstBlock = blog.content.find(block => block.type === "html");
  if (!firstBlock) return null;

  const plainText = firstBlock.value.replace(/<[^>]+>/g, "");
  const words = plainText.split(" ");
  const limitedText = words.slice(0, 12).join(" ") + (words.length > 12 ? "..." : "");

  return (
    <div className={`${styles.summary} blog-summary`}>
      {limitedText}
    </div>
  );
})()}
   

                  </div>
                </div>
              </div>
            );
          })}
        </Slider>
      )}
    </div>
  );
}

export const settings = {
  label: "Blog Slider",
  props: [
    {
      id: "title",
      type: "text",
      value: "The Visionary Edit",
      label: "Section Heading",
    },
    {
      id: "description",
      type: "text",
      value:
        "Your go-to guide for eye care, eyewear trends, and vision tips. From eye health essentials to fashion-forward frames—see it all here.",
      label: "Section Description",
    },
    {
      id: "fallback_image",
      type: "image_picker",
      label: "Fallback Blog Image",
      default: "",
    },
  ],
};

Component.serverFetch = async ({ fpi }) => {
  try {
    const payload = { pageSize: 6, pageNo: 1 };
    const response = await fpi.executeGQL(FETCH_BLOGS_LIST, payload, {
      skipStoreUpdate: true,
    });
    return response?.data?.applicationContent?.blogs || { items: [] };
  } catch (error) {
    console.log("serverFetch error:", error);
  }
};

export default Component;
