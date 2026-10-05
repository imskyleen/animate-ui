export default function TextIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M23.6 25.2h-.7c-1.6 0-2.9-1.3-2.9-2.9v-8.6c0-1.6 1.3-2.9 2.9-2.9h.7M16.4 25.2h.7c1.6 0 2.9-1.3 2.9-2.9v-.7M16.4 10.8h.7c1.6 0 2.9 1.3 2.9 2.9v.7"></path>
    </svg>
  );
}
