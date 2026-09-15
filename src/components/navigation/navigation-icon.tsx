import type { NavigationIcon as NavigationIconName } from "@/config/navigation";

export interface NavigationIconProps {
  name: NavigationIconName | "more";
  className?: string;
}

export function NavigationIcon({ name, className }: NavigationIconProps) {
  const commonProps = {
    className,
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "home":
      return <svg {...commonProps}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" /></svg>;
    case "calendar":
      return <svg {...commonProps}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></svg>;
    case "brain":
      return <svg {...commonProps}><path d="M9.5 4.5A3 3 0 0 0 4 6a3 3 0 0 0-1 5.8A3.5 3.5 0 0 0 7 17h2.5ZM14.5 4.5A3 3 0 0 1 20 6a3 3 0 0 1 1 5.8 3.5 3.5 0 0 1-4 5.2h-2.5ZM9.5 4.5V20M14.5 4.5V20" /></svg>;
    case "politics":
      return <svg {...commonProps}><path d="m12 3 9 5H3Z" /><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18M2 18h20" /></svg>;
    case "language":
      return <svg {...commonProps}><path d="M4 5h8M8 3v2c0 4-2 7-5 9M6 9c1.5 2 3.5 3.5 6 4M14 19l3.5-9 3.5 9M15.2 16h4.6" /></svg>;
    case "recitation":
      return <svg {...commonProps}><path d="M6 4h12a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" /><path d="M8 8h8M8 12h6M8 16h4" /></svg>;
    case "article":
      return <svg {...commonProps}><path d="M5 3h11l3 3v15H5Z" /><path d="M15 3v4h4M8 11h8M8 15h8M8 19h5" /></svg>;
    case "book":
      return <svg {...commonProps}><path d="M4 5a3 3 0 0 1 3-2h5v17H7a3 3 0 0 0-3 2ZM20 5a3 3 0 0 0-3-2h-5v17h5a3 3 0 0 1 3 2Z" /></svg>;
    case "timer":
      return <svg {...commonProps}><circle cx="12" cy="13" r="8" /><path d="M9 2h6M12 5v8l4 2" /></svg>;
    case "world":
      return <svg {...commonProps}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></svg>;
    case "knowledge":
      return <svg {...commonProps}><path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" /><path d="M8 7h8M8 11h8M8 15h5" /></svg>;
    case "health":
      return <svg {...commonProps}><path d="M12 21S4 16.5 4 9.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 8 3.5C20 16.5 12 21 12 21Z" /></svg>;
    case "finance":
      return <svg {...commonProps}><circle cx="12" cy="12" r="9" /><path d="M15 8.5c-.7-.7-1.7-1-3-1-1.7 0-3 1-3 2.3 0 3.5 6 1.4 6 4.8 0 1.4-1.3 2.4-3.2 2.4-1.2 0-2.4-.4-3.2-1.2M12 5.5v13" /></svg>;
    case "growth":
      return <svg {...commonProps}><path d="M4 20V10M10 20V6M16 20V3M22 20H2" /></svg>;
    case "more":
      return <svg {...commonProps}><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></svg>;
  }
}
