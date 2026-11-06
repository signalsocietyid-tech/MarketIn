import Image from "next/image";
import { cn } from "@/lib/utils";

/** 3D icons from Microsoft Fluent Emoji (MIT), stored in /public/icons/3d. */
export type Icon3DName =
  | "office_building"
  | "chart_increasing"
  | "video_camera"
  | "busts_in_silhouette"
  | "delivery_truck"
  | "link"
  | "megaphone"
  | "memo"
  | "magnifying_glass_tilted_left"
  | "handshake"
  | "rocket"
  | "shield"
  | "card_index_dividers"
  | "desktop_computer"
  | "page_facing_up"
  | "bar_chart"
  | "briefcase"
  | "credit_card"
  | "classical_building"
  | "check_mark_button"
  | "clipboard"
  | "star"
  | "spiral_calendar"
  | "people_hugging"
  | "inbox_tray"
  | "telescope"
  | "department_store";

/**
 * A 3D icon that gently floats and, inside a `group`, lifts and tilts on hover.
 * `delay` (seconds) staggers the float so neighbouring icons don't move in sync.
 */
export function Icon3D({
  name,
  size = 64,
  delay = 0,
  float = true,
  className,
}: {
  name: Icon3DName;
  size?: number;
  delay?: number;
  float?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn("relative inline-flex shrink-0", float && "motion-safe:animate-float", className)}
      style={{ width: size, height: size, animationDelay: `${-delay}s` }}
    >
      {/* Soft contact shadow */}
      <span aria-hidden className="absolute inset-x-[18%] bottom-[-6%] h-[14%] rounded-full bg-brand-900/20 blur-md" />
      <Image
        src={`/icons/3d/${name}.png`}
        alt=""
        width={size}
        height={size}
        className="relative drop-shadow-[0_10px_14px_rgb(186_74_20/0.22)] transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1.2)] group-hover:-translate-y-1.5 group-hover:-rotate-6 group-hover:scale-110"
      />
    </span>
  );
}
