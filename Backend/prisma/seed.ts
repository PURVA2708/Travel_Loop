import { PrismaClient, ActivityCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CITIES: Array<{
  name: string;
  country: string;
  region: string;
  costIndex: number;
  popularityScore: number;
  imageUrl?: string;
  lat: number;
  lng: number;
  activities: Array<{ name: string; category: ActivityCategory; cost: number; durationMinutes: number; imageUrl?: string }>;
}> = [
  {
    name: 'Mumbai',
    country: 'India',
    region: 'Maharashtra',
    costIndex: 1.1,
    popularityScore: 95,
    imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&auto=format&fit=crop&q=80',
    lat: 19.076,
    lng: 72.8777,
    activities: [
      { name: 'Gateway of India walking tour', category: 'sightseeing', cost: 0, durationMinutes: 90 },
      { name: 'Street food trail at Mohammed Ali Road', category: 'food', cost: 800, durationMinutes: 150 },
      { name: 'Elephanta Caves ferry trip', category: 'culture', cost: 1200, durationMinutes: 240 },
      { name: 'Marine Drive sunset', category: 'sightseeing', cost: 0, durationMinutes: 60 },
    ],
  },
  {
    name: 'Goa',
    country: 'India',
    region: 'Goa',
    costIndex: 0.9,
    popularityScore: 98,
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
    lat: 15.2993,
    lng: 74.124,
    activities: [
      { name: 'Scuba diving at Grande Island', category: 'adventure', cost: 3500, durationMinutes: 180 },
      { name: 'Baga Beach party night', category: 'nightlife', cost: 1500, durationMinutes: 240 },
      { name: 'Old Goa churches heritage walk', category: 'culture', cost: 300, durationMinutes: 120 },
      { name: 'Beach shack seafood dinner', category: 'food', cost: 1200, durationMinutes: 90 },
    ],
  },
  {
    name: 'Jaipur',
    country: 'India',
    region: 'Rajasthan',
    costIndex: 0.8,
    popularityScore: 90,
    imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80',
    lat: 26.9124,
    lng: 75.7873,
    activities: [
      { name: 'Amber Fort elephant ride', category: 'sightseeing', cost: 900, durationMinutes: 120 },
      { name: 'Hawa Mahal photo stop', category: 'sightseeing', cost: 50, durationMinutes: 45 },
      { name: 'Rajasthani thali dinner with folk dance', category: 'food', cost: 1000, durationMinutes: 120 },
      { name: 'Hot air balloon ride', category: 'adventure', cost: 9500, durationMinutes: 90 },
    ],
  },
  {
    name: 'Kerala Backwaters',
    country: 'India',
    region: 'Kerala',
    costIndex: 1.0,
    popularityScore: 88,
    imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80',
    lat: 9.4981,
    lng: 76.3388,
    activities: [
      { name: 'Houseboat overnight stay', category: 'sightseeing', cost: 8000, durationMinutes: 1440 },
      { name: 'Kerala Sadhya lunch', category: 'food', cost: 400, durationMinutes: 60 },
      { name: 'Kathakali dance show', category: 'culture', cost: 500, durationMinutes: 90 },
      { name: 'Canoe village tour', category: 'adventure', cost: 1200, durationMinutes: 150 },
    ],
  },
  {
    name: 'Manali',
    country: 'India',
    region: 'Himachal Pradesh',
    costIndex: 0.85,
    popularityScore: 85,
    imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80',
    lat: 32.2432,
    lng: 77.1892,
    activities: [
      { name: 'Solang Valley paragliding', category: 'adventure', cost: 2500, durationMinutes: 60 },
      { name: 'Rohtang Pass day trip', category: 'sightseeing', cost: 1800, durationMinutes: 480 },
      { name: 'River rafting on the Beas', category: 'adventure', cost: 1000, durationMinutes: 90 },
      { name: 'Old Manali cafe hopping', category: 'food', cost: 700, durationMinutes: 180 },
    ],
  },
  {
    name: 'Paris',
    country: 'France',
    region: 'Europe',
    costIndex: 1.7,
    popularityScore: 99,
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80',
    lat: 48.8566,
    lng: 2.3522,
    activities: [
      { name: 'Eiffel Tower summit access', category: 'sightseeing', cost: 3000, durationMinutes: 120 },
      { name: 'Louvre Museum guided tour', category: 'culture', cost: 2200, durationMinutes: 180 },
      { name: 'Seine river dinner cruise', category: 'food', cost: 8000, durationMinutes: 150 },
    ],
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    region: 'East Asia',
    costIndex: 1.6,
    popularityScore: 96,
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80',
    lat: 35.6762,
    lng: 139.6503,
    activities: [
      { name: 'Shibuya Crossing & Harajuku walk', category: 'sightseeing', cost: 0, durationMinutes: 150 },
      { name: 'Tsukiji Outer Market sushi breakfast', category: 'food', cost: 2500, durationMinutes: 90 },
      { name: 'teamLab digital art museum', category: 'culture', cost: 3200, durationMinutes: 120 },
    ],
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    region: 'Southeast Asia',
    costIndex: 0.95,
    popularityScore: 97,
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80',
    lat: -8.3405,
    lng: 115.092,
    activities: [
      { name: 'Uluwatu Temple sunset & Kecak dance', category: 'culture', cost: 700, durationMinutes: 120 },
      { name: 'Tegalalang rice terrace walk', category: 'sightseeing', cost: 200, durationMinutes: 90 },
      { name: 'Surfing lesson at Kuta Beach', category: 'adventure', cost: 1800, durationMinutes: 120 },
      { name: 'Beach club sunset party', category: 'nightlife', cost: 2000, durationMinutes: 240 },
    ],
  },
  {
    name: 'Dubai',
    country: 'UAE',
    region: 'Middle East',
    costIndex: 1.6,
    popularityScore: 93,
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80',
    lat: 25.2048,
    lng: 55.2708,
    activities: [
      { name: 'Burj Khalifa observation deck', category: 'sightseeing', cost: 6000, durationMinutes: 90 },
      { name: 'Desert safari with BBQ dinner', category: 'adventure', cost: 5500, durationMinutes: 300 },
      { name: 'Dubai Mall & Fountain show', category: 'sightseeing', cost: 0, durationMinutes: 120 },
    ],
  },
];

async function main() {
  console.log('🌱 Seeding demo users...');
  const passwordHash = await bcrypt.hash('password123', 10);
  
  await prisma.user.upsert({
    where: { email: 'demo@globetrotter.app' },
    update: {},
    create: {
      name: 'Demo Traveler',
      email: 'demo@globetrotter.app',
      passwordHash,
      role: 'user',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@globetrotter.com' },
    update: {},
    create: {
      name: 'Admin Sarah',
      email: 'admin@globetrotter.com',
      passwordHash,
      role: 'admin',
    },
  });

  console.log('🏙️ Seeding cities & activities...');
  for (const cityData of CITIES) {
    let city = await prisma.city.findFirst({ where: { name: cityData.name } });
    if (!city) {
      city = await prisma.city.create({
        data: {
          name: cityData.name,
          country: cityData.country,
          region: cityData.region,
          costIndex: cityData.costIndex,
          popularityScore: cityData.popularityScore,
          lat: cityData.lat,
          lng: cityData.lng,
          imageUrl: cityData.imageUrl || null,
        },
      });
    }

    for (const activity of cityData.activities) {
      const existing = await prisma.activity.findFirst({
        where: { cityId: city.id, name: activity.name },
      });
      if (!existing) {
        await prisma.activity.create({
          data: {
            cityId: city.id,
            name: activity.name,
            category: activity.category,
            cost: activity.cost,
            durationMinutes: activity.durationMinutes,
            imageUrl: activity.imageUrl || null,
          },
        });
      }
    }
  }

  console.log(`✅ Seeded ${CITIES.length} cities with activities successfully!`);
}

main()
  .catch((err) => {
    console.error('❌ Seed error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
