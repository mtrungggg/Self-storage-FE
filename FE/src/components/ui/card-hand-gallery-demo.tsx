"use client";

import {
  CardHandGallery,
  type FanCardItem,
} from "@/components/ui/card-hand-gallery";

const cards: FanCardItem[] = [
  {
    id: "deep-field",
    src: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80",
    title: "Secure Storage Unit",
    description:
      "Climate-controlled personal storage with 24/7 CCTV surveillance and individual PIN keypad access.",
  },
  {
    id: "city-exposure",
    src: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=600&q=80",
    title: "Commercial Locker",
    description:
      "Heavy-duty storage space engineered for business inventory, equipment, and archive records.",
  },
  {
    id: "motion-study",
    src: "https://images.unsplash.com/photo-1590247813693-5541d1c609fd?auto=format&fit=crop&w=600&q=80",
    title: "Climate Control",
    description:
      "Humidity and temperature regulation system protecting sensitive electronics and wooden furnishings.",
  },
  {
    id: "kinetic-bloom",
    src: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    title: "Flexible Renewal",
    description:
      "Instant monthly extensions with automated VietQR payment confirmation and zero lock-in penalties.",
  },
  {
    id: "paper-flight",
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    title: "24/7 Dedicated Support",
    description:
      "Priority customer ticket handling and direct on-site facility manager assistance whenever needed.",
  },
];

export default function CardHandGalleryDemo() {
  return (
    <div className="flex w-full items-center justify-center bg-background px-6 py-10">
      <CardHandGallery cards={cards} className="max-w-5xl" />
    </div>
  );
}
