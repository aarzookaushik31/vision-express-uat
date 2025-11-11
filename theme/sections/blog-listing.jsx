import React, { useState } from "react";
import "@gofynd/theme-template/pages/blog/blog.css";
import { FETCH_BLOGS_LIST } from "../queries/blogQuery";
import useBlog from "../page-layouts/blog/useBlog";
import { useFPI } from "fdk-core/utils";
import styles from "../styles/sections/blog-listing.less";
import Clock from "../assets/images/clockblack.png";
import Calender from "../assets/images/Calendarblack.png";

export function Component({ props }) {
  const fpi = useFPI();

  const {
    blogs,
    isLoading,
    isBlogPageLoading,
  } = useBlog({ fpi, props });


  console.log(blogs);

 const [blogItems, setBlogItems] = useState(blogs?.items || []);
const [pageInfo, setPageInfo] = useState(blogs?.page || { current: 1, has_next: false, size: 6 });

React.useEffect(() => {
  if (blogs?.items) {
    setBlogItems(blogs.items);
    setPageInfo(blogs.page); 
  }
}, [blogs]);

const handleLoadMore = async () => {
  if (!pageInfo?.has_next) return;

  const nextPage = pageInfo.current + 1;

  const payload = {
    pageSize: pageInfo.size || 6,
    pageNo: nextPage,
  };

  try {
    const response = await fpi.executeGQL(FETCH_BLOGS_LIST, payload, {
      skipStoreUpdate: true,
    });

    const newBlogs = response?.data?.applicationContent?.blogs;
    const newItems = newBlogs?.items || [];

    setBlogItems((prev) => [...prev, ...newItems]);
    setPageInfo(newBlogs?.page || pageInfo); // update pagination info
  } catch (error) {
    console.error("Failed to load more blogs:", error);
  }
};


const getEstimatedReadingTime = (blog) => {
  try {
    if (blog.reading_time) return blog.reading_time;

    const htmlContent = blog?.content?.[0]?.value || "";
    const text = htmlContent.replace(/<[^>]+>/g, " "); 
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200)); 
  } catch {
    return 1;
  }
};


  

  return (
    <div className={styles.blogListing}>
      {props?.title?.value && (
        <h2 className={styles.blogTitle}>{props.title.value}</h2>
      )}

        <nav className={styles.breadcrumbs} aria-label="breadcrumb">
            <ol>
              <li><a href="/">Home /</a></li>
              <li className={styles.active}>Blogs</li>
            </ol>
          </nav>

      {isLoading || isBlogPageLoading ? (
        <p>Loading blogs...</p>
      ) : blogItems.length === 0 ? (
        <p>No blogs found.</p>
      ) : (
        <>
          <div className={styles.blogGrid}>
            {blogItems.map((blog) => (
              <a href={`/blog/${blog.slug}`} key={blog.id} className={styles.blogCard}>
                <h2 className={styles.blogCardTitle}>{blog.title}</h2>

                <div className={styles.blogImage}>
                  <img
                    src={blog?.feature_image?.secure_url || props?.fallback_image.value}
                    alt={blog.title}
                  />
                </div>

 <div className={styles.blogInfoContainer}>
                <div className={styles.blogMeta}>
                  <span>
                     <img
                                src={Calender}
                                alt='calender'
                              />

                    {new Date(blog.publish_date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
        
             
    <span>
  <img src={Clock} alt="clock" /> {getEstimatedReadingTime(blog)} min read
</span>
 
                </div>

                {blog?.tags?.length > 0 && (
                  <div className={styles.blogTags}>
                    {blog.tags.map((tag, idx) => (
                      <span key={idx} className={styles.blogTag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                </div>
              </a>
            ))}
          </div>

          {pageInfo?.has_next && (
  <div className={styles.loadMoreWrapper}>
    <button
      className={styles.loadMoreBtn}
      onClick={handleLoadMore}
    >
      View More Posts
    </button>
  </div>
)}

        </>
      )}
    </div>
  );
}

export const settings = {
  label: "Custom Blog Listing",
  props: [
    {
      id: "title",
      type: "text",
      value: "Blogs",
      default: "t:resource.default_values.the_unparalleled_shopping_experience",
      label: "t:resource.common.heading",
    },
    {
      type: "image_picker",
      id: "fallback_image",
      label: "t:resource.sections.blog.fallback_image",
      default: "",
    },
  ],
};

Component.serverFetch = async ({ fpi, router }) => {
  try {
    const payload = {
      pageSize: 6,
      pageNo: 1,
    };

  const response = await fpi.executeGQL(FETCH_BLOGS_LIST, payload, {
      skipStoreUpdate: true,
    });

    return response;
    
  } catch (error) {
    console.log("UAT serverFetch error:", error);
  }
};


export default Component;
