export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "*Vehinder",
  description:
    "Beautifully designed components built with Radix UI and Tailwind CSS.",
  mainNav: [
    {
      title: "About",
      href: "/",
    },{
      title: "Princing",
      href: "/",
    },{
      title: "Docs",
      href: "/",
    },
  ],
  links: {
    twitter: "https://twitter.com/shadcn",
    github: "https://github.com/shadcn/ui",
    docs: "https://ui.shadcn.com",
  },
}
