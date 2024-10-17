"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Skeleton } from "@/components/ui/skeleton";

const components = [
  {
    title: "Years",
    href: "/dashboard/years",
    description: "Add, remove or edit vehicles fabrication years.",
  },
  {
    title: "Brands",
    href: "/dashboard/makes",
    description: "Create and manage vehicle brands.",
  },
  {
    title: "Models",
    href: "/dashboard/models",
    description: "Create and manage vehicle models.",
  },
  {
    title: "Cylinders",
    href: "/dashboard/cylinders",
    description: "Edit and manage the engine cylinders.",
  },
  {
    title: "Displacement",
    href: "/dashboard/displacement",
    description: "Edit and create engines displacements.",
  },
  {
    title: "Transmission",
    href: "/dashboard/transmission",
    description: "Manage and create transmissions.",
  },
  {
    title: "Drives",
    href: "/dashboard/drives",
    description: "Manage and create drives of cars.",
  },
  {
    title: "Trims",
    href: "/dashboard/trims",
    description: "Define vehicle trims before creating a vehicle.",
  },
];

// Manual function to decode the JWT token
function decodeJWT(token: string) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
}

export function DashboardNav() {
  const router = useRouter();
  const pathname = usePathname(); // Get the current path
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token");

    if (token) {
      try {
        const decoded = decodeJWT(token);
        setRole(decoded.role);

        // If token is expired or role is invalid, redirect to login
        if (!decoded.role || decoded.exp * 1000 < Date.now()) {
          Cookies.remove("token");
          router.push("/auth/login");
        }
      } catch {
        Cookies.remove("token");
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    } else {
      router.push("/auth/login");
    }
  }, [router]);

  if (isLoading) {
    return <Skeleton className="h-10 mx-2" />;
  }

  if (!role) {
    return null;
  }

  const isActive = (href: string) => pathname === href;

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/dashboard" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                isActive("/dashboard") && "bg-accent text-accent-foreground"
              )}
            >
              Dashboard
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        {/* Show the Vehicles link only if the user has the role "admin" */}
        {role === "admin" && (
          <>
            <NavigationMenuItem>
              <Link href="/dashboard/vehicles" legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    isActive("/dashboard/vehicles") && "bg-accent text-accent-foreground"
                  )}
                >
                  Vehicles
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Components</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {components.map((component) => (
                    <ListItem
                      key={component.title}
                      title={component.title}
                      href={component.href}
                      isActive={isActive(component.href)}
                    >
                      {component.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </>
        )}
        {role === "client" && (
          <>
            <NavigationMenuItem>
              <Link href="/dashboard/apikey" legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    isActive("/dashboard/apikey") && "bg-accent text-accent-foreground"
                  )}
                >
                  ApiKey
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/dashboard/billing" legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    isActive("/dashboard/billing") && "bg-accent text-accent-foreground"
                  )}
                >
                  Billing
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/dashboard/settings" legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    isActive("/dashboard/settings") && "bg-accent text-accent-foreground"
                  )}
                >
                  Settings
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<typeof Link> & {
    title: string;
    isActive: boolean;
    className?: string;
  }
>(({ className, title, children, isActive, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink>
        <Link
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors",
            isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});

ListItem.displayName = "ListItem";
