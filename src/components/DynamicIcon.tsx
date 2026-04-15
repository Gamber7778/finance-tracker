'use client';

import {
  Home, ShoppingCart, Coffee, Dumbbell, Pill, Bus, CreditCard,
  ShoppingBag, Shirt, MoreHorizontal, Banknote, Laptop, TrendingUp,
  Gift, Plus, Heart, Star, Zap, Music, Book, Camera, Phone, Wifi,
  Globe, Briefcase, GraduationCap, Plane, Car, Bike, Utensils, Wine,
  Gamepad2, Tv, Dog, Baby, Stethoscope, HelpCircle, type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Home, ShoppingCart, Coffee, Dumbbell, Pill, Bus, CreditCard,
  ShoppingBag, Shirt, MoreHorizontal, Banknote, Laptop, TrendingUp,
  Gift, Plus, Heart, Star, Zap, Music, Book, Camera, Phone, Wifi,
  Globe, Briefcase, GraduationCap, Plane, Car, Bike, Utensils, Wine,
  Gamepad2, Tv, Dog, Baby, Stethoscope,
};

interface DynamicIconProps {
  name: string;
  size?: number;
  className?: string;
}

export default function DynamicIcon({ name, size = 20, className }: DynamicIconProps) {
  const Icon = iconMap[name] || HelpCircle;
  return <Icon size={size} className={className} />;
}
