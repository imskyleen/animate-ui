export default function ComponentsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 36"
      fill="transparent"
      stroke="currentColor"
      strokeWidth={2}
      {...props}
    >
      <path d="M5 35h30c2.2 0 4-1.8 4-4V5c0-2.2-1.8-4-4-4H5C2.8 1 1 2.8 1 5v26c0 2.2 1.8 4 4 4"></path>
      <path d="M25 26H11c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2"></path>
      <path d="M27 22h2c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2H15c-1.1 0-2 .9-2 2v2"></path>
    </svg>
  );
}
