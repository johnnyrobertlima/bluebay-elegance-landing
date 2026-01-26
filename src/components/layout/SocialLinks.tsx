
import { Instagram, Facebook, MessageCircle, Music } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialLinksProps {
  variant?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SocialLinks = ({
  variant = "horizontal",
  size = "md",
  className,
}: SocialLinksProps) => {
  const socialLinks = [
    {
      name: "Instagram",
      href: "https://www.instagram.com/bluebayoficial",
      icon: Instagram,
      color: "hover:bg-pink-500",
    },
    {
      name: "Facebook",
      href: "https://www.facebook.com/bluebaycomercial",
      icon: Facebook,
      color: "hover:bg-blue-600",
    },
    {
      name: "TikTok",
      href: "https://www.tiktok.com/@bluebayoficial",
      icon: Music,
      color: "hover:bg-black",
    },
    {
      name: "WhatsApp",
      href: "https://wa.me/551126189778",
      icon: MessageCircle,
      color: "hover:bg-green-500",
    },
  ];

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <div
      className={cn(
        "flex gap-3",
        variant === "vertical" && "flex-col",
        className
      )}
    >
      {socialLinks.map((social) => (
        <a
          key={social.name}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex items-center justify-center rounded-full bg-muted text-foreground transition-all duration-300 hover:text-white hover:scale-110",
            sizeClasses[size],
            social.color
          )}
          aria-label={social.name}
        >
          <social.icon className={iconSizes[size]} />
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
