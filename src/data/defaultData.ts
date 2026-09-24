export interface CatItem {
  id: number | string;
  name: string;
  age: string;
  backstory: string;
  personality: string;
  status: string;
  image: string;
}

export interface MenuItem {
  id: number | string;
  title: string;
  category: 'Coffee & Beverages' | 'Hot Mains' | 'Pastries & Treats';
  price: number;
  desc: string;
  image: string;
}

export interface MissionItem {
  id: number | string;
  title: string;
  status: 'Completed' | 'In Progress' | 'Scheduled';
  desc: string;
  date: string;
  image: string;
}

export interface OrderItem {
  id: number;
  name: string;
  phone: string;
  type: string;
  items: { id: number | string; title: string; price: number; qty: number }[];
  subtotal: number;
  timestamp: string;
}

export interface DonationItem {
  id: number;
  donor: string;
  amount: number;
  note: string;
  timestamp: string;
}

export interface AppState {
  fund: {
    target: number;
    raised: number;
  };
  cats: CatItem[];
  menu: MenuItem[];
  missions: MissionItem[];
  orders: OrderItem[];
  donations: DonationItem[];
}

export const DEFAULT_DATA: AppState = {
  fund: {
    target: 3500,
    raised: 1850,
  },
  cats: [
    {
      id: 1,
      name: "Oyen",
      age: "2 Yrs",
      backstory: "Rescued from a drain with a high fever. Now chief cuddle officer.",
      personality: "Playful, Affectionate",
      status: "Resident Ambassador",
      image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 2,
      name: "Mochi",
      age: "1.5 Yrs",
      backstory: "Found wandering in a food court. Loves catnip and warm laps.",
      personality: "Gentle, Vocal",
      status: "Resident Ambassador",
      image: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 3,
      name: "Kuro",
      age: "3 Yrs",
      backstory: "TNR rescue who decided he preferred cafe life over street life.",
      personality: "Calm, Observer",
      status: "Resident Ambassador",
      image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 4,
      name: "Luna",
      age: "8 Mos",
      backstory: "Rescued during a heavy storm. Loves chasing feather wands.",
      personality: "Energetic, Curious",
      status: "Resident Ambassador",
      image: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 5,
      name: "Boba",
      age: "2.5 Yrs",
      backstory: "Recovered from a severe eye infection. Fully healed and happy.",
      personality: "Sweet, Nap Lover",
      status: "Resident Ambassador",
      image: "https://images.unsplash.com/photo-1561948955-570b270e7c36?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 6,
      name: "Simba",
      age: "4 Yrs",
      backstory: "Ex-colony leader who now loves sleeping in sunny window spots.",
      personality: "Majestic, Chill",
      status: "Resident Ambassador",
      image: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 7,
      name: "Tofu",
      age: "1 Yr",
      backstory: "Surrendered kitten who warmed everyone's heart instantly.",
      personality: "Cuddly, Silly",
      status: "Resident Ambassador",
      image: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 8,
      name: "Pepper",
      age: "3.5 Yrs",
      backstory: "Rescued during our PJ Seksyen 14 TNR drive. Healthy & thriving.",
      personality: "Independent, Smart",
      status: "Resident Ambassador",
      image: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&w=600&q=80",
    },
  ],
  menu: [
    {
      id: 101,
      title: "Pherbies Signature Latte",
      category: "Coffee & Beverages",
      price: 13.00,
      desc: "Double espresso with silky steamed milk & cat paw latte art.",
      image: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 102,
      title: "Matcha Cloud Latte",
      category: "Coffee & Beverages",
      price: 14.50,
      desc: "Uji matcha layered with fresh milk and velvety cream foam.",
      image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 103,
      title: "Smoked Duck Butter Pasta",
      category: "Hot Mains",
      price: 22.00,
      desc: "Rich garlic butter spaghetti topped with tender smoked duck slices.",
      image: "https://images.unsplash.com/photo-1621996346565-e3d5d6281292?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 104,
      title: "Oyen's Salted Egg Chicken Rice",
      category: "Hot Mains",
      price: 19.50,
      desc: "Crispy chicken bites coated in aromatic curry leaf salted egg cream.",
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 105,
      title: "Purr-fect Butter Croissant",
      category: "Pastries & Treats",
      price: 8.50,
      desc: "Flaky, buttery French croissant baked fresh daily in-house.",
      image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 106,
      title: "Cat-nip Cupcake (Human Friendly!)",
      category: "Pastries & Treats",
      price: 9.00,
      desc: "Moist chocolate cupcake decorated with handmade cat ears.",
      image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=500&q=80",
    },
  ],
  missions: [
    {
      id: 201,
      title: "PJ Seksyen 17 Commercial TNR Drive",
      status: "Completed",
      desc: "Successfully trapped, vaccinated, and neutered 6 neighborhood strays this month.",
      date: "Sept 2026",
      image: "https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 202,
      title: "Emergency Vet Care: Milo's Leg Recovery",
      status: "In Progress",
      desc: "Milo underwent surgery for a fractured hip. Medical bill total: RM 1,200.",
      date: "Ongoing",
      image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 203,
      title: "Monthly Tofu Litter & Vitamin Supply Run",
      status: "Scheduled",
      desc: "Ordering 40 bags of eco-tofu litter and multivitamins for October.",
      date: "Oct 2026",
      image: "https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=600&q=80",
    },
  ],
  orders: [],
  donations: [
    {
      id: 1,
      donor: "Farhan & Bella",
      amount: 50,
      note: "For Oyen's favorite treats!",
      timestamp: "Today",
    },
    {
      id: 2,
      donor: "Aina S.",
      amount: 100,
      note: "TNR spay support for upcoming PJ colony drive",
      timestamp: "Yesterday",
    },
  ],
};
