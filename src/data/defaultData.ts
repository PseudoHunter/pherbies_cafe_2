export interface Cat {
  id: string;
  name: string;
  estimatedAge: string;
  gender: 'Male' | 'Female';
  status: 'Permanent Resident' | 'Up for Adoption' | 'Medical Recovery';
  photoUrl: string;
  rescueStory: string;
  personality: string;
  favoriteTreat: string;
  arrivalDate: string;
  medicalNotes?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'Coffee & Drinks' | 'Pastries & Mains' | 'Cat Treats';
  price: number; // in MYR (RM)
  description: string;
  tags: string[]; // e.g. "Best Seller", "Signature", "Vegan Option"
  imageUrl: string;
  available: boolean;
}

export interface TnrLog {
  id: string;
  date: string;
  location: string;
  catsNeutered: number;
  notes: string;
  photoUrl: string;
  status: 'Completed' | 'Scheduled';
}

export interface DonationPledge {
  id: string;
  donorName: string;
  amount: number;
  message: string;
  date: string;
  isAnonymous?: boolean;
}

export interface ImpactBreakdown {
  vetBills: number;
  catFood: number;
  tofuLitter: number;
  vitamins: number;
}

export interface Announcement {
  enabled: boolean;
  text: string;
  highlightText?: string;
  linkText?: string;
  linkSection?: string;
}

export interface AppData {
  impact: {
    monthlyTarget: number;
    currentRaised: number;
    breakdown: ImpactBreakdown;
    totalCatsRescued: number;
    totalTnrCount: number;
    activeColoniesMonitored: number;
  };
  cats: Cat[];
  menu: MenuItem[];
  tnrLogs: TnrLog[];
  announcement: Announcement;
  recentDonations: DonationPledge[];
}

export const DEFAULT_APP_DATA: AppData = {
  impact: {
    monthlyTarget: 3500,
    currentRaised: 2680,
    breakdown: {
      vetBills: 1450,
      catFood: 680,
      tofuLitter: 350,
      vitamins: 200,
    },
    totalCatsRescued: 48,
    totalTnrCount: 76,
    activeColoniesMonitored: 5,
  },
  announcement: {
    enabled: true,
    text: "Pherbies Rescue Mission: 100% of cafe beverage sales this weekend support our upcoming Subang colony TNR spay drive!",
    highlightText: "Upcoming Drive",
    linkText: "See TNR Log",
    linkSection: "tnr-log",
  },
  cats: [
    {
      id: "cat-1",
      name: "Pherbie",
      estimatedAge: "3 Years",
      gender: "Male",
      status: "Permanent Resident",
      photoUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80",
      rescueStory: "The founding mascot and namesake of our cafe. Rescued in 2023 shivering behind an alley wet market with a fractured tail and respiratory infection. After 3 months of veterinary care, he claimed the main velvet armchair as his royal seat.",
      personality: "Calm, regal, loves gentle chin scritches and greeting guests at the entrance.",
      favoriteTreat: "Freeze-dried salmon cubes",
      arrivalDate: "March 2023",
      medicalNotes: "Fully healed, up to date on vaccinations and regular dental care.",
    },
    {
      id: "cat-2",
      name: "Mochi",
      estimatedAge: "2 Years",
      gender: "Female",
      status: "Permanent Resident",
      photoUrl: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=800&q=80",
      rescueStory: "Saved during a torrential monsoon evening trapped in a roadside stormwater drain in Petaling Jaya. Mochi purrs like a soft lawnmower the instant you look at her.",
      personality: "Extreme cuddler, will quietly climb onto your lap while you sip your matcha latte.",
      favoriteTreat: "Goat milk puree",
      arrivalDate: "November 2023",
      medicalNotes: "Microchipped, spayed, zero ongoing health issues.",
    },
    {
      id: "cat-3",
      name: "Oyen (The Explorer)",
      estimatedAge: "1.5 Years",
      gender: "Male",
      status: "Up for Adoption",
      photoUrl: "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=800&q=80",
      rescueStory: "Originally trapped during our neighborhood TNR spay mission. The vet observed that instead of hissing, Oyen gave headbutts to every nurse. Clearly a domestic sweetheart who deserved an indoor family.",
      personality: "Cheeky, energetic, loves feather wands and chasing paper balls.",
      favoriteTreat: "Chicken & pumpkin shreds",
      arrivalDate: "June 2024",
      medicalNotes: "Neutered, dewormed, negative for FIV/FeLV.",
    },
    {
      id: "cat-4",
      name: "Luna",
      estimatedAge: "9 Months",
      gender: "Female",
      status: "Up for Adoption",
      photoUrl: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=800&q=80",
      rescueStory: "Found alongside two littermates under an outdoor Mamak stall during a hot afternoon. Nursed with kitten formula and socialized with cafe regulars.",
      personality: "High-flying acrobat, inquisitive, adores warm sunny windowsill naps.",
      favoriteTreat: "Crispy catnip biscuits",
      arrivalDate: "August 2024",
      medicalNotes: "Spayed, fully vaccinated, litter-box champion.",
    },
    {
      id: "cat-5",
      name: "Ciko",
      estimatedAge: "4 Years",
      gender: "Male",
      status: "Medical Recovery",
      photoUrl: "https://images.unsplash.com/photo-1561948955-570b270e7c36?auto=format&fit=crop&w=800&q=80",
      rescueStory: "Rescued in August 2024 with a severely infected paw and tendon inflammation from an old wire fence injury. Proceeds from this month are funding his weekly antibiotic checkups and joint supplements.",
      personality: "Gentle soul with a deep, soothing purr. Prefers quiet corners and soft fleece blankets.",
      favoriteTreat: "Tuna loin flakes",
      arrivalDate: "August 2024",
      medicalNotes: "Under veterinary laser therapy & joint mobility supplements (RM 420 spent so far).",
    },
    {
      id: "cat-6",
      name: "Belacan",
      estimatedAge: "2.5 Years",
      gender: "Female",
      status: "Permanent Resident",
      photoUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=80",
      rescueStory: "A feisty tortoiseshell found foraging behind a hawker center. While initially shy, she has developed into our head barista inspector, sitting near the glass partition to supervise milk steaming.",
      personality: "Opinionated, selective cuddler, master observer of the universe.",
      favoriteTreat: "Freeze-dried duck liver",
      arrivalDate: "January 2024",
      medicalNotes: "Healthy, spayed, regular dental descaling completed.",
    },
    {
      id: "cat-7",
      name: "Boba",
      estimatedAge: "1 Year",
      gender: "Male",
      status: "Up for Adoption",
      photoUrl: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80",
      rescueStory: "A round, chubby cheeks boy surrendered when an elderly neighbor moved into a no-pets facility. Boba adjusted seamlessly to cafe life and loves greeting gentle children.",
      personality: "Extremely docile, mellow, sleeps like a croissant on the coffee table.",
      favoriteTreat: "Pureed chicken broth",
      arrivalDate: "July 2024",
      medicalNotes: "Neutered, vaccinated, loves brush sessions.",
    },
    {
      id: "cat-8",
      name: "Kopi",
      estimatedAge: "7 Months",
      gender: "Male",
      status: "Medical Recovery",
      photoUrl: "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?auto=format&fit=crop&w=800&q=80",
      rescueStory: "Rescued 3 weeks ago with severe conjunctivitis and undernourishment. Thanks to your donations, his eyes are now 90% cleared and he is gaining 150g every week!",
      personality: "Playful little rascal who thinks shoelaces are dangerous cobras that must be conquered.",
      favoriteTreat: "Kitten recovery paste",
      arrivalDate: "September 2024",
      medicalNotes: "Eye antibiotic drops 2x daily; weight monitoring in progress.",
    },
  ],
  menu: [
    {
      id: "menu-1",
      name: "Pandan Gula Melaka Latte",
      category: "Coffee & Drinks",
      price: 14.50,
      description: "House espresso infused with freshly pressed pandan leaf extract, organic Sarawak Gula Melaka, and velvety oat milk.",
      tags: ["Signature", "Best Seller"],
      imageUrl: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80",
      available: true,
    },
    {
      id: "menu-2",
      name: "Iced Sea Salt Caramel Macchiato",
      category: "Coffee & Drinks",
      price: 15.00,
      description: "Double ristretto over fresh milk, layered with artisan salted butter caramel and delicate Himalayan pink salt foam.",
      tags: ["Popular"],
      imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80",
      available: true,
    },
    {
      id: "menu-3",
      name: "Matcha Strawberry Cloud Latte",
      category: "Coffee & Drinks",
      price: 16.00,
      description: "Uji ceremonial grade matcha whisked to order over house-made organic strawberry compote and creamy whipped coconut cream.",
      tags: ["Vegan Option", "Signature"],
      imageUrl: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80",
      available: true,
    },
    {
      id: "menu-4",
      name: "Sabah Ranau Pour-Over Coffee",
      category: "Coffee & Drinks",
      price: 13.50,
      description: "Single origin Arabica harvested from the foothills of Mount Kinabalu. Tasting notes of dried fig, mandarin peel, and cocoa nibs.",
      tags: ["Local Single Origin"],
      imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
      available: true,
    },
    {
      id: "menu-5",
      name: "Artisan Sourdough with Kaya & Salted Butter",
      category: "Pastries & Mains",
      price: 12.00,
      description: "48-hour slow-fermented crusty sourdough slices toasted to golden perfection, served with slow-cooked duck egg pandan kaya and SCS butter.",
      tags: ["Best Seller", "Local Heritage"],
      imageUrl: "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80",
      available: true,
    },
    {
      id: "menu-6",
      name: "Truffle Mushroom Croissant Toastie",
      category: "Pastries & Mains",
      price: 18.50,
      description: "Flaky French butter croissant stuffed with sauteed king oyster mushrooms, melted mild Swiss gruyere, and white truffle oil.",
      tags: ["Chef's Pick"],
      imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80",
      available: true,
    },
    {
      id: "menu-7",
      name: "Burnt Basque Pandan Cheesecake",
      category: "Pastries & Mains",
      price: 16.00,
      description: "Caramelized charred exterior with a rich, molten cream cheese center infused with fresh screwpine essence.",
      tags: ["Sweet Tooth"],
      imageUrl: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80",
      available: true,
    },
    {
      id: "menu-8",
      name: "Creamy Tom Yum Tiger Prawn Fettuccine",
      category: "Pastries & Mains",
      price: 24.50,
      description: "Al dente pasta tossed in an aromatic lemongrass, kaffir lime, and coconut cream broth with fresh grilled Sabah prawns.",
      tags: ["House Main"],
      imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
      available: true,
    },
    {
      id: "menu-9",
      name: "Freeze-Dried Pure Salmon Bites (Cat Treat)",
      category: "Cat Treats",
      price: 8.00,
      description: "100% human-grade wild Alaskan salmon gently freeze-dried to lock in Omega-3 fatty acids. Cafe-safe treat to feed resident rescue cats.",
      tags: ["Kitty Approved", "Vet Safe"],
      imageUrl: "https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?auto=format&fit=crop&w=600&q=80",
      available: true,
    },
    {
      id: "menu-10",
      name: "Goat Milk & Pumpkin Churu Bowl (Cat Treat)",
      category: "Cat Treats",
      price: 7.00,
      description: "Lactose-free pasture-raised goat milk blended with steamed organic pumpkin puree. Supports digestion and hydration for cats in the lounge.",
      tags: ["Vet Safe", "Hydration Boost"],
      imageUrl: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80",
      available: true,
    },
  ],
  tnrLogs: [
    {
      id: "tnr-1",
      date: "September 2024",
      location: "Taman Melawati Wet Market Colony",
      catsNeutered: 6,
      notes: "Successfully trapped and transported 4 females and 2 males for spay/neuter surgery. Ear-tipped, rabies vaccinated, and returned safely to the designated community feeder area.",
      photoUrl: "https://images.unsplash.com/photo-1570824104453-508955ab713e?auto=format&fit=crop&w=600&q=80",
      status: "Completed",
    },
    {
      id: "tnr-2",
      date: "August 2024",
      location: "SS15 Subang Back-Alley Colony",
      catsNeutered: 8,
      notes: "Partnered with local shopkeepers. 8 cats spayed/neutered. Discovered young kitten (now resident 'Kopi') suffering from eye infection, who was brought in for immediate clinical rehabilitation.",
      photoUrl: "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?auto=format&fit=crop&w=600&q=80",
      status: "Completed",
    },
    {
      id: "tnr-3",
      date: "July 2024",
      location: "Damansara Perdana Commercial Hub",
      catsNeutered: 5,
      notes: "Full health assessment and deworming administered by collaborating clinic in Petaling Jaya. All 5 individuals recovered well overnight before safe release.",
      photoUrl: "https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?auto=format&fit=crop&w=600&q=80",
      status: "Completed",
    },
    {
      id: "tnr-4",
      date: "October 2024 (Upcoming)",
      location: "Ampang Jaya Residential Perimeter",
      catsNeutered: 7,
      notes: "Pre-trapping feeding schedules established with resident aunties. 7 humane drop-traps prepped with veterinary slots reserved.",
      photoUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=600&q=80",
      status: "Scheduled",
    },
  ],
  recentDonations: [
    {
      id: "pledge-1",
      donorName: "Farah & Imran",
      amount: 150,
      message: "Sending love to dear Ciko! Get well soon little brave paw.",
      date: "Today, 10:14 AM",
    },
    {
      id: "pledge-2",
      donorName: "Wei Lun",
      amount: 50,
      message: "For this month's tofu litter supply! Love visiting on weekends.",
      date: "Yesterday",
    },
    {
      id: "pledge-3",
      donorName: "Siti Nurhaliza Fan",
      amount: 100,
      message: "Thank you for the incredible TNR work you do for our neighborhood strays.",
      date: "2 days ago",
    },
    {
      id: "pledge-4",
      donorName: "Uncle Roger Coffee Regular",
      amount: 80,
      message: "Best pandan latte and sweet kitties in town. Keep going!",
      date: "3 days ago",
    },
  ],
};
