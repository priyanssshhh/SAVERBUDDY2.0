import React from "react";
import "./BackgroundVideo.css";

function BackgroundVideo() {
  return (
    <div className="video-wrapper">
      <video
        className="background-video"
        autoPlay
        loop
        muted
        playsInline
      >
        {/* ✅ Correct public folder reference */}
        <source src={`${import.meta.env.BASE_URL}pigvid.mp4`} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Light overlay for readability */}
      <div className="video-overlay"></div>
    </div>
  );
}

export default BackgroundVideo;
