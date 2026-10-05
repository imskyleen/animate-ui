export default function BackgroundIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 36"
      fill="transparent"
      stroke="currentColor"
      strokeWidth={2}
      {...props}
    >
      <path d="M1 5c0-2.2 1.8-4 4-4h30c2.2 0 4 1.8 4 4v26c0 2.2-1.8 4-4 4H5c-2.2 0-4-1.8-4-4z"></path>
      <circle cx="16.2" cy="12.3" r="3.8"></circle>
      <path d="m38.9 23.6-5.8-5.8c-1.5-1.5-3.9-1.5-5.3 0L10.6 35"></path>
    </svg>
  );
}
