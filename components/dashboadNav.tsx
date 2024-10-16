"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Years",
    href: "/dashboard/years",
    description:
      "Add, remove or edit vehicles fabrication years.",
  },
  {
    title: "Brands",
    href: "/dashboard/brands",
    description:
      "Create and manage vehicle brands.",
  },
  {
    title: "Models",
    href: "/dashboard/models",
    description:
      "Create and manage vehicle models.",
  },
  {
    title: "Cylinders",
    href: "/dashboard/cylinders",
    description: "Edit and manage the en gines cylinders.",
  },
  {
    title: "Displacement",
    href: "/dashboard/displacement",
    description:
      "Edit and create engines displacements.",
  },
  {
    title: "Transmission",
    href: "/dashboard/transmission",
    description:
      "Manage and create transmitions.",
  },
  {
    title: "Drives",
    href: "/dashboard/drives",
    description:
      "Manage and create drives of cars.",
  },
  {
    title: "Trims",
    href: "/dashboard/trims",
    description:
      "Define vehicle trims before create a vehicle.",
  },
]

export function DashboardNav() {
  return (
    <>
    
    <NavigationMenu>
      <NavigationMenuList>
      <NavigationMenuItem>
          <Link href="/dashboard/vehicles" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Vehicles
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              {components.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/docs" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Documentation
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
    
    </>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
