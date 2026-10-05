export default function ImageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      strokeWidth="4"
      viewBox="0 0 37.85 37.85"
      {...props}
    >
      <rect
        width="33.85"
        height="33.85"
        x="2"
        y="2"
        fill="none"
        stroke="currentColor"
        strokeMiterlimit="10"
        rx="4.39"
        ry="4.39"
      ></rect>
      <circle
        cx="13.28"
        cy="13.28"
        r="3.76"
        fill="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></circle>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        d="m35.85 24.57-5.8-5.8a3.76 3.76 0 0 0-5.32 0L7.64 35.85h24.01a4.2 4.2 0 0 0 4.2-4.2z"
      ></path>
    </svg>
  );
}
