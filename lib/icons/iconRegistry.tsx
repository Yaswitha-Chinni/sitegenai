import React from "react";
import {
  Search,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Check,
  CheckCircle2,
  Plus,
  Download,
  Share2,
  ExternalLink,
  RefreshCw,
  Copy,
  Trash2,
  ShoppingCart,
  ShoppingBag,
  CreditCard,
  Tag,
  DollarSign,
  Award,
  Mail,
  Phone,
  MessageSquare,
  Send,
  Bell,
  Star,
  Heart,
  Camera,
  Film,
  Play,
  Eye,
  Sparkles,
  Flame,
  Droplet,
  Zap,
  Menu,
  Home,
  Compass,
  MapPin,
  Globe,
  Layers,
  Layout,
  Briefcase,
  Users,
  Shield,
  ShieldCheck,
  Clock,
  Sliders,
  Settings,
  Laptop,
  Smartphone,
  Terminal,
  Server,
  Coffee,
  LucideProps,
} from "lucide-react";

export interface IconDefinition {
  name: string;
  label: string;
  category: "actions" | "commerce" | "communication" | "media" | "navigation" | "business";
  keywords: string[];
  component: React.ComponentType<LucideProps>;
}

export const ICON_REGISTRY: IconDefinition[] = [
  // Actions
  { name: "Search", label: "Search", category: "actions", keywords: ["find", "magnifier", "lookup", "explore"], component: Search },
  { name: "ArrowRight", label: "Arrow Right", category: "actions", keywords: ["next", "forward", "cta", "go"], component: ArrowRight },
  { name: "ArrowLeft", label: "Arrow Left", category: "actions", keywords: ["back", "previous", "return"], component: ArrowLeft },
  { name: "Check", label: "Check", category: "actions", keywords: ["tick", "ok", "confirm", "done"], component: Check },
  { name: "CheckCircle2", label: "Check Circle", category: "actions", keywords: ["verified", "approved", "success"], component: CheckCircle2 },
  { name: "Plus", label: "Plus", category: "actions", keywords: ["add", "new", "create", "insert"], component: Plus },
  { name: "Download", label: "Download", category: "actions", keywords: ["save", "export", "file", "disk"], component: Download },
  { name: "Share2", label: "Share", category: "actions", keywords: ["social", "link", "network"], component: Share2 },
  { name: "ExternalLink", label: "External Link", category: "actions", keywords: ["open", "new tab", "url"], component: ExternalLink },
  { name: "RefreshCw", label: "Refresh", category: "actions", keywords: ["sync", "reload", "update"], component: RefreshCw },
  { name: "Copy", label: "Copy", category: "actions", keywords: ["duplicate", "clone"], component: Copy },

  // Commerce
  { name: "ShoppingCart", label: "Shopping Cart", category: "commerce", keywords: ["buy", "store", "ecommerce", "basket"], component: ShoppingCart },
  { name: "ShoppingBag", label: "Shopping Bag", category: "commerce", keywords: ["order", "retail", "shop"], component: ShoppingBag },
  { name: "CreditCard", label: "Credit Card", category: "commerce", keywords: ["pay", "payment", "billing", "checkout"], component: CreditCard },
  { name: "Tag", label: "Tag / Discount", category: "commerce", keywords: ["price", "offer", "sale", "badge"], component: Tag },
  { name: "DollarSign", label: "Currency", category: "commerce", keywords: ["money", "cost", "pricing", "usd"], component: DollarSign },
  { name: "Award", label: "Award / Trophy", category: "commerce", keywords: ["badge", "quality", "certified", "winner"], component: Award },

  // Communication
  { name: "Mail", label: "Email", category: "communication", keywords: ["contact", "inbox", "message", "letter"], component: Mail },
  { name: "Phone", label: "Phone", category: "communication", keywords: ["call", "contact", "support", "mobile"], component: Phone },
  { name: "MessageSquare", label: "Message / Chat", category: "communication", keywords: ["support", "talk", "feedback"], component: MessageSquare },
  { name: "Send", label: "Send", category: "communication", keywords: ["submit", "dispatch", "paper airplane"], component: Send },
  { name: "Bell", label: "Notification", category: "communication", keywords: ["alert", "alarm", "updates"], component: Bell },

  // Media
  { name: "Star", label: "Star / Rating", category: "media", keywords: ["favorite", "review", "score", "grade"], component: Star },
  { name: "Heart", label: "Heart / Like", category: "media", keywords: ["love", "favorite", "wishlist"], component: Heart },
  { name: "Sparkles", label: "Sparkles / AI", category: "media", keywords: ["magic", "special", "premium", "new"], component: Sparkles },
  { name: "Flame", label: "Flame / Hot", category: "media", keywords: ["trending", "popular", "fire", "hearth"], component: Flame },
  { name: "Droplet", label: "Droplet", category: "media", keywords: ["water", "milk", "liquid", "pure"], component: Droplet },
  { name: "Zap", label: "Lightning", category: "media", keywords: ["fast", "speed", "power", "energy"], component: Zap },
  { name: "Coffee", label: "Coffee / Cafe", category: "media", keywords: ["drink", "tea", "latte", "breakfast"], component: Coffee },
  { name: "Camera", label: "Camera / Photo", category: "media", keywords: ["picture", "image", "photography"], component: Camera },
  { name: "Film", label: "Film / Video", category: "media", keywords: ["cinema", "movie", "reel"], component: Film },
  { name: "Play", label: "Play", category: "media", keywords: ["start", "video", "media"], component: Play },

  // Navigation
  { name: "Menu", label: "Menu", category: "navigation", keywords: ["hamburger", "sidebar", "nav"], component: Menu },
  { name: "Home", label: "Home", category: "navigation", keywords: ["landing", "main", "house"], component: Home },
  { name: "Compass", label: "Compass", category: "navigation", keywords: ["explore", "discover", "direction"], component: Compass },
  { name: "MapPin", label: "Location", category: "navigation", keywords: ["address", "map", "pin", "place"], component: MapPin },
  { name: "Globe", label: "Globe", category: "navigation", keywords: ["worldwide", "international", "web"], component: Globe },
  { name: "Layers", label: "Layers", category: "navigation", keywords: ["stack", "structure", "architecture"], component: Layers },
  { name: "Layout", label: "Layout", category: "navigation", keywords: ["grid", "template", "page"], component: Layout },

  // Business & Tech
  { name: "Briefcase", label: "Business", category: "business", keywords: ["work", "company", "portfolio", "jobs"], component: Briefcase },
  { name: "Users", label: "Users / Team", category: "business", keywords: ["people", "community", "clients", "group"], component: Users },
  { name: "ShieldCheck", label: "Shield / Security", category: "business", keywords: ["secure", "guarantee", "safe", "privacy"], component: ShieldCheck },
  { name: "Clock", label: "Clock / Time", category: "business", keywords: ["hours", "schedule", "timing", "fast"], component: Clock },
  { name: "Settings", label: "Settings", category: "business", keywords: ["gear", "config", "options"], component: Settings },
  { name: "Sliders", label: "Sliders / Controls", category: "business", keywords: ["adjust", "filter", "parameters"], component: Sliders },
  { name: "Terminal", label: "Terminal / Code", category: "business", keywords: ["cli", "developer", "api", "console"], component: Terminal },
  { name: "Server", label: "Server / Cloud", category: "business", keywords: ["database", "hosting", "infrastructure"], component: Server },
  { name: "Laptop", label: "Laptop", category: "business", keywords: ["computer", "pc", "tech", "device"], component: Laptop },
  { name: "Smartphone", label: "Smartphone", category: "business", keywords: ["mobile", "cell", "phone", "app"], component: Smartphone },
];

const ICON_MAP = new Map<string, React.ComponentType<LucideProps>>(
  ICON_REGISTRY.map((i) => [i.name.toLowerCase(), i.component])
);

export function renderRegisteredIcon(
  iconName?: string,
  props: LucideProps = { size: 18 }
): React.ReactNode {
  if (!iconName) return null;
  const Component = ICON_MAP.get(iconName.toLowerCase());
  if (!Component) return null;
  return <Component {...props} />;
}
