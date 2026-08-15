import React from "react";
import "./BackgroundVideo.css";

function BackgroundVideo() {
  return (
    <div className="video-wrapper">
      <video className="background-video" autoPlay loop muted playsInline>
        <source src={`${import.meta.env.BASE_URL}pigvid.mp4`} type="video/mp4" />
      </video>
      <div className="video-overlay" />
    </div>
  );
}

export default BackgroundVideo;