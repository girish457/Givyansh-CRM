import { LucideTrendingUp, LucideCpu, LucideLayers, LucideGlobe } from "lucide-react";
import React from "react";

export interface BlogPostType {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  content: string;
  date: string;
  category: string;
  readTime: string;
  color: string;
  icon: any;
  author: string;
  image: string;
}

export const blogPosts: BlogPostType[] = [
  {
    id: "scaling-patterns",
    title: "Engineering High-Velocity Team Scaling Patterns",
    subtitle: "THE FUTURE OF RECRUITMENT AUTOMATION",
    desc: "Explore our detailed whitepaper on how neural sorting and structured data isolation are defining the next decade of agency productivity.",
    content: "At the core of every billion-dollar recruitment enterprise lies a hidden architecture. As scaling demands increase, simple CRM logic fails to provide the necessary isolation and velocity required to dominate fragmented markets. Data isolation is no longer just a security requirement; it's a performance strategy. By architecting Givyansh on a multi-tenant, isolated database model, we ensure that team nodes can operate at full speed without cross-query latency.",
    date: "MAR 25, 2026",
    category: "Insights",
    readTime: "15 MIN",
    color: "#10b981",
    author: "Givyansh Research Unit",
    image: "/images/blog_hero.png",
    icon: React.createElement(LucideTrendingUp, { size: 20 })
  },
  {
    id: "revenue-acceleration",
    title: "Scaling Your Recruitment Agency to $10M",
    subtitle: "THE REVENUE BLUEPRINT",
    desc: "Practical steps to manage high-velocity teams using Givyansh's structured hierarchy and neural CRM logic.",
    content: "Building a $10M agency requires more than just good recruiters; it requires a predictive engine. We look at the metrics that matter: daily neural mapping, automated submittal-to-interview ratios, and cascading MD permissions. The difference between a stagnant $1M firm and a $10M powerhouse is the speed at which data turns into decisions. Givyansh provides that speed through our proprietary hierarchy system.",
    date: "MAR 24, 2026",
    category: "Scaling",
    readTime: "8 MIN",
    color: "#10b981",
    author: "Strategy Lab",
    image: "/images/blog_hero.png",
    icon: React.createElement(LucideTrendingUp, { size: 20 })
  },
  {
    id: "multi-tenancy-tech",
    title: "Why Multi-Tenancy Matters in 2026",
    subtitle: "INFRASTRUCTURE DEEP-DIVE",
    desc: "Understanding deep-level data isolation and isolated database infrastructure for modern global enterprise recruiting.",
    content: "In 2026, security is the new marketing. Clients demand that their candidate pools are isolated from every other firm on the platform. We explain how Givyansh's single-tenant logic within a multi-tenant cloud provides military-grade security without compromising on the speed and shared intelligence of a global network. This is the new standard for enterprise-grade recruitment technology.",
    date: "MAR 22, 2026",
    category: "Technology",
    readTime: "12 MIN",
    color: "#2563eb",
    author: "Core Engineering",
    image: "/images/blog_hero.png",
    icon: React.createElement(LucideCpu, { size: 20 })
  },
  {
    id: "team-hub-architecture",
    title: "The Architecture of Team Hubs",
    subtitle: "OPERATIONAL EXCELLENCE",
    desc: "How structured reporting and automated MD-to-Recruiter permissions eliminate operational friction and data leaks.",
    content: "Team Hubs are the building blocks of the Givyansh ecosystem. By defining clear boundaries for data visibility, we allow large firms to co-exist in the same environment without 'candidate stealing' or internal friction. Automated permissions mean your MD can see the global board, while recruiters stay focused on their specific niche pools. It's about organized velocity and absolute data integrity.",
    date: "MAR 18, 2026",
    category: "Operations",
    readTime: "6 MIN",
    color: "#8b5cf6",
    author: "Ops Management",
    image: "/images/blog_hero.png",
    icon: React.createElement(LucideLayers, { size: 20 })
  }
];
