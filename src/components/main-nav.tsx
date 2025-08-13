
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutGrid,
  CheckCircle,
  Camera,
  Bot,
  Gamepad2,
  Trophy,
  Tv,
  User,
  Users,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutGrid },
  { href: "/tasks", label: "Tasks", icon: CheckCircle },
  { href: "/food-scanner", label: "Food Scanner", icon: Camera },
  { href: "/plan-generator", label: "AI Plans", icon: Bot },
  { href: "/live-classes", label: "Live Classes", icon: Tv },
];

const secondaryNavItems = [
    { href: "/friends", label: "Friends", icon: Users },
    { href: "/pixel-zone", label: "Pixel Zone", icon: Gamepad2 },
    { href: "/scoreboard", label: "Scoreboard", icon: Trophy },
    { href: "/profile", label: "Profile", icon: User },
]

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <nav
        className={cn("flex flex-col space-y-1")}
        {...props}
      >
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} passHref>
            <Button
              variant={pathname === item.href ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
      <div className="mt-auto space-y-1">
         {secondaryNavItems.map((item) => (
          <Link key={item.href} href={item.href} passHref>
            <Button
              variant={pathname === item.href ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
