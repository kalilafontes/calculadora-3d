import type { SVGProps } from "react";

export type AppIconName =
  | "bolt"
  | "bookmark"
  | "box"
  | "chart"
  | "check"
  | "filament"
  | "info"
  | "moon"
  | "refresh"
  | "sparkle"
  | "sun"
  | "tag";

interface AppIconProps extends SVGProps<SVGSVGElement> {
  name: AppIconName;
  size?: number;
}

export function AppIcon({ name, size = 20, ...props }: AppIconProps) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
  };

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      {...props}
    >
      {name === "sparkle" ? (
        <path {...common} d="m12 3 1.35 5.65L19 10l-5.65 1.35L12 17l-1.35-5.65L5 10l5.65-1.35L12 3Z" />
      ) : null}
      {name === "filament" ? (
        <>
          <path {...common} d="M6 8.2h12M6.5 8.2v7.1c0 2.05 2.46 3.7 5.5 3.7s5.5-1.65 5.5-3.7V8.2" />
          <ellipse {...common} cx="12" cy="6.3" rx="6" ry="2.3" />
          <path {...common} d="M8.2 12.2h7.6M8.2 15.2h7.6" />
        </>
      ) : null}
      {name === "refresh" ? (
        <>
          <path {...common} d="M19.2 8.3A7.5 7.5 0 1 0 19.5 14" />
          <path {...common} d="M19.2 4.8v3.8h-3.8" />
        </>
      ) : null}
      {name === "tag" ? (
        <path {...common} d="m4 5.5 6.8-.5L20 14.2 14.2 20 5 10.8 4 5.5Zm4.1 3.7h.01" />
      ) : null}
      {name === "check" ? <path {...common} d="m5 12.5 4.2 4.2L19 7" /> : null}
      {name === "bolt" ? <path {...common} d="m13.3 2.8-7 10h5.2l-.8 8.4 7-10h-5.2l.8-8.4Z" /> : null}
      {name === "box" ? (
        <path {...common} d="m4.5 7.5 7.5-4 7.5 4v9l-7.5 4-7.5-4v-9Zm0 0 7.5 4 7.5-4M12 11.5v9" />
      ) : null}
      {name === "chart" ? (
        <>
          <path {...common} d="M4 19.5h16" />
          <path {...common} d="M6.5 17v-4.5M11 17V8M15.5 17v-6.5M20 17V5" />
        </>
      ) : null}
      {name === "bookmark" ? <path {...common} d="M6.5 4.5h11v15l-5.5-3.2-5.5 3.2v-15Z" /> : null}
      {name === "info" ? (
        <>
          <circle {...common} cx="12" cy="12" r="8.5" />
          <path {...common} d="M12 10.8v5M12 7.8h.01" />
        </>
      ) : null}
      {name === "moon" ? <path {...common} d="M19.5 15.3A7.5 7.5 0 0 1 8.7 4.5 7.5 7.5 0 1 0 19.5 15.3Z" /> : null}
      {name === "sun" ? (
        <>
          <circle {...common} cx="12" cy="12" r="3.2" />
          <path {...common} d="M12 2.8v2M12 19.2v2M21.2 12h-2M4.8 12h-2M18.5 5.5l-1.4 1.4M6.9 17.1l-1.4 1.4M18.5 18.5l-1.4-1.4M6.9 6.9 5.5 5.5" />
        </>
      ) : null}
    </svg>
  );
}
