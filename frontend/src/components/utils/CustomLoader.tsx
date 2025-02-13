import React from "react";

const CustomLoader = ({ size = 24, className = "" }) => {
  return (
    <div className={className}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-spin"
      >
        <g>
          <path
            opacity="0.5"
            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
            stroke="#1fe5ff"
            strokeWidth="1.5"
          />
          <path
            d="M15.5 9L15.6716 9.17157C17.0049 10.5049 17.6716 11.1716 17.6716 12C17.6716 12.8284 17.0049 13.4951 15.6716 14.8284L15.5 15"
            stroke="#1fe5ff"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M13.2942 7.17041L12.0001 12L10.706 16.8297"
            stroke="#1fe5ff"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M8.49994 9L8.32837 9.17157C6.99504 10.5049 6.32837 11.1716 6.32837 12C6.32837 12.8284 6.99504 13.4951 8.32837 14.8284L8.49994 15"
            stroke="#1fe5ff"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
};

export default CustomLoader;
