export default function ShadcnIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      aria-label="shadcn"
      viewBox="0 0 256 256"
      strokeWidth="16"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m208 128-80 80M192 40 40 192"
      ></path>
    </svg>
  );
}
