import React from "react";
import styles from "./styles/blog-detail.less";
import Clock from "../../assets/images/Clock.png";
import Calender from "../../assets/images/CalendarDots.png";
import Placeholder from "../../assets/images/placeholder.png";

import { FETCH_BLOGS_LIST } from "../../queries/blogQuery";
import useBlog from "../../page-layouts/blog/useBlog";
import { useFPI } from "fdk-core/utils";
import ClockBlack from "../../assets/images/clockblack.png";
import CalenderBlack from "../../assets/images/Calendarblack.png";

function BlogDetail({ blogDetails, isBlogDetailsLoading }) {
  if (isBlogDetailsLoading) {
    return <div className={styles.blogDetailLoading}>Loading...</div>;
  }

  if (!blogDetails) {
    return <div className={styles.blogDetailEmpty}>No blog found.</div>;
  }
  const { title, content, publish_date, feature_image, reading_time, tags } = blogDetails;



  const fpi = useFPI();
  const { blogs, isLoading, isBlogPageLoading } = useBlog({ fpi});

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


const currentBlogId = blogDetails?.id;
const currentBlogSlug = blogDetails?.slug;


const blogItems =
  blogs?.items
    ?.filter((b) => b.id !== currentBlogId && b.slug !== currentBlogSlug)
    .slice(0, 3) || [];




  const calculateReadingTime = (contentArray) => {
    if (!Array.isArray(contentArray)) return 2; 
    let totalText = "";

    contentArray.forEach((block) => {
      if (block.type === "html" && block.value) {
        const plainText = block.value.replace(/<[^>]+>/g, " ");
        totalText += " " + plainText;
      }
    });

    const wordCount = totalText.trim().split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200);
    return minutes || 2; 
  };

  const effectiveReadingTime =
    reading_time || `${calculateReadingTime(content)} min read`;

  return (
    <div className={styles.blogDetail}>
      {/* Breadcrumbs */}
      <div className={styles.blogBreadcrumb}>
        <a href="/" className={styles.breadcrumbLink}>Home</a>
        <span className={styles.breadcrumbSeparator}>/</span>
        <a href="/blogs" className={styles.breadcrumbLink}>Blogs</a>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>{title}</span>
      </div>

      {/* Banner */}
      {feature_image?.secure_url && (
        <div className={styles.blogDetailBanner}>
          <img
            src={feature_image?.secure_url}
            alt={title}
            className={styles.blogDetailBannerImg}
          />
        </div>
      )}

      {/* Content */}
      <div className={styles.blogDetailContent}>
        <h1 className={styles.blogDetailTitle}>{title}</h1>

        <div className={styles.blogDetailMeta}>
         {Array.isArray(tags) && tags.length > 0 && (
            <div className={styles.blogDetailTags}>
              {tags.map((tag, idx) => (
                <span key={idx} className={styles.blogDetailTag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
          {publish_date && (
            <span className={styles.blogDetailDate}>
              <img
            src={Calender}
            alt='calender'
          />
            {new Date(publish_date).toLocaleDateString()}
            </span>
          )}
          {effectiveReadingTime && (
            <span className={styles.blogDetailReadingTime}>
            
           <img
            src={Clock}
            alt="clock"
          />
             {effectiveReadingTime}
            </span>
          )}
        </div>

        {/* Blog Body */}
        <div className={styles.blogDetailBody}>
          {Array.isArray(content) &&
            content.map((block, index) =>
              block.type === "html" ? (
                <div
                  key={index}
                  dangerouslySetInnerHTML={{ __html: block.value }}
                />
              ) : null
            )}
        </div>
      </div>





     <div className={styles.blogListingcards}>
             <h2 className={styles.blogTitle}>Recent Blogs</h2>
     
           {isLoading || isBlogPageLoading ? (
             <p>Loading blogs...</p>
           ) : blogItems.length === 0 ? (
             <p>No blogs found.</p>
           ) : (
             <div className={styles.blogGrid}>
               {blogItems.map((blog) => (
                 <a
                   href={`/blog/${blog.slug}`}
                   key={blog.id}
                   className={styles.blogCard}
                 >
                   <h2 className={styles.blogCardTitle}>{blog.title}</h2>
     
                   <div className={styles.blogImage}>
                     <img
                       src={
                         blog?.feature_image?.secure_url || Placeholder
                       }
                       alt={blog.title}
                     />
                   </div>
     
                   <div className={styles.blogInfoContainer}>
                     <div className={styles.blogMeta}>
                       <span>
                         <img src={CalenderBlack} alt="calender" />
                         {new Date(blog.publish_date).toLocaleDateString("en-GB", {
                           day: "2-digit",
                           month: "short",
                           year: "numeric",
                         })}
                       </span>
                       <span>
                         <img src={ClockBlack} alt="clock" />{" "}
                         {getEstimatedReadingTime(blog)} min read
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
           )}
         </div>
        
      
    </div>
  );
}


BlogDetail.serverFetch = async ({ fpi }) => {
  try {
    const payload = {
      pageSize: 3,
      pageNo: 1,
    };

    const response = await fpi.executeGQL(FETCH_BLOGS_LIST, payload, {
      skipStoreUpdate: true,
    });

    return response;
  } catch (error) {
    console.log(error);
  }
};

export default BlogDetail;
