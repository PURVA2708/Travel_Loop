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
      { name: 'Gateway of India walking tour', category: 'sightseeing', cost: 0, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1598434192043-71111c1b3f41?w=800&auto=format&fit=crop&q=80' },
      { name: 'Street food trail at Mohammed Ali Road', category: 'food', cost: 800, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1750949135629-0345e050c353?w=800&auto=format&fit=crop&q=80' },
      { name: 'Elephanta Caves ferry trip', category: 'culture', cost: 1200, durationMinutes: 240, imageUrl: 'https://images.unsplash.com/photo-1766590596275-cd4e94e124f6?w=800&auto=format&fit=crop&q=80' },
      { name: 'Marine Drive sunset', category: 'sightseeing', cost: 0, durationMinutes: 60, imageUrl: 'https://images.unsplash.com/photo-1522582935453-38011c9348e9?w=800&auto=format&fit=crop&q=80' },
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
      { name: 'Scuba diving at Grande Island', category: 'adventure', cost: 3500, durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1682687982049-b3d433368cd1?w=800&auto=format&fit=crop&q=80' },
      { name: 'Baga Beach party night', category: 'nightlife', cost: 1500, durationMinutes: 240, imageUrl: 'https://images.unsplash.com/photo-1569918970203-ea053ffda098?w=800&auto=format&fit=crop&q=80' },
      { name: 'Old Goa churches heritage walk', category: 'culture', cost: 300, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1714203101116-b5e56a8f03aa?w=800&auto=format&fit=crop&q=80' },
      { name: 'Beach shack seafood dinner', category: 'food', cost: 1200, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1645060809993-461b21c1921c?w=800&auto=format&fit=crop&q=80' },
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
      { name: 'Amber Fort elephant ride', category: 'sightseeing', cost: 900, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1461603950871-cd64bcf7acf0?w=800&auto=format&fit=crop&q=80' },
      { name: 'Hawa Mahal photo stop', category: 'sightseeing', cost: 50, durationMinutes: 45, imageUrl: 'https://images.unsplash.com/photo-1524229321985-1e1989075d9b?w=800&auto=format&fit=crop&q=80' },
      { name: 'Rajasthani thali dinner with folk dance', category: 'food', cost: 1000, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1606843046080-45bf7a23c39f?w=800&auto=format&fit=crop&q=80' },
      { name: 'Hot air balloon ride', category: 'adventure', cost: 9500, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1737819605143-d639efcdb5c5?w=800&auto=format&fit=crop&q=80' },
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
      { name: 'Houseboat overnight stay', category: 'sightseeing', cost: 8000, durationMinutes: 1440, imageUrl: 'https://images.unsplash.com/photo-1785932413547-cdd1159e1f1e?w=800&auto=format&fit=crop&q=80' },
      { name: 'Kerala Sadhya lunch', category: 'food', cost: 400, durationMinutes: 60, imageUrl: 'https://images.unsplash.com/photo-1741376509109-e9edd6f24f5f?w=800&auto=format&fit=crop&q=80' },
      { name: 'Kathakali dance show', category: 'culture', cost: 500, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1741387863815-de06ebdbe8d9?w=800&auto=format&fit=crop&q=80' },
      { name: 'Canoe village tour', category: 'adventure', cost: 1200, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1785932413547-cdd1159e1f1e?w=800&auto=format&fit=crop&q=80' },
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
      { name: 'Solang Valley paragliding', category: 'adventure', cost: 2500, durationMinutes: 60, imageUrl: 'https://images.unsplash.com/photo-1497267049703-01d7eb538c99?w=800&auto=format&fit=crop&q=80' },
      { name: 'Rohtang Pass day trip', category: 'sightseeing', cost: 1800, durationMinutes: 480, imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80' },
      { name: 'River rafting on the Beas', category: 'adventure', cost: 1000, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1772405545687-7b6ff09c4931?w=800&auto=format&fit=crop&q=80' },
      { name: 'Old Manali cafe hopping', category: 'food', cost: 700, durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1753459843733-e511502eca0d?w=800&auto=format&fit=crop&q=80' },
    ],
  },
  {
    name: 'Udaipur',
    country: 'India',
    region: 'Rajasthan',
    costIndex: 0.95,
    popularityScore: 82,
    imageUrl: 'https://images.unsplash.com/photo-1695956353120-54ce5e91632b?w=800&auto=format&fit=crop&q=80',
    lat: 24.5854,
    lng: 73.7125,
    activities: [
      { name: 'Lake Pichola boat ride', category: 'sightseeing', cost: 700, durationMinutes: 60, imageUrl: 'https://images.unsplash.com/photo-1695956353120-54ce5e91632b?w=800&auto=format&fit=crop&q=80' },
      { name: 'City Palace guided tour', category: 'culture', cost: 500, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1695956353120-54ce5e91632b?w=800&auto=format&fit=crop&q=80' },
      { name: 'Rooftop dinner overlooking the lake', category: 'food', cost: 1800, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1679505512042-07792fede259?w=800&auto=format&fit=crop&q=80' },
    ],
  },
  {
    name: 'Rishikesh',
    country: 'India',
    region: 'Uttarakhand',
    costIndex: 0.75,
    popularityScore: 80,
    imageUrl: 'https://images.unsplash.com/photo-1607406374368-809f8ec7f118?w=800&auto=format&fit=crop&q=80',
    lat: 30.0869,
    lng: 78.2676,
    activities: [
      { name: 'White water rafting', category: 'adventure', cost: 900, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1772405545687-7b6ff09c4931?w=800&auto=format&fit=crop&q=80' },
      { name: 'Ganga Aarti at Triveni Ghat', category: 'culture', cost: 0, durationMinutes: 60, imageUrl: 'https://images.unsplash.com/photo-1716573260891-23ad993e8833?w=800&auto=format&fit=crop&q=80' },
      { name: 'Bungee jumping at Jumpin Heights', category: 'adventure', cost: 3500, durationMinutes: 60, imageUrl: 'https://images.unsplash.com/photo-1569399753478-4540866026c9?w=800&auto=format&fit=crop&q=80' },
      { name: 'Sunrise yoga session', category: 'sightseeing', cost: 300, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1484452330304-377cdeb05340?w=800&auto=format&fit=crop&q=80' },
    ],
  },
  {
    name: 'Bangkok',
    country: 'Thailand',
    region: 'Southeast Asia',
    costIndex: 1.0,
    popularityScore: 96,
    imageUrl: 'https://images.unsplash.com/photo-1755251042986-91270ffd76f5?w=800&auto=format&fit=crop&q=80',
    lat: 13.7563,
    lng: 100.5018,
    activities: [
      { name: 'Grand Palace & Wat Phra Kaew', category: 'culture', cost: 600, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1690299490301-2eb3865bee58?w=800&auto=format&fit=crop&q=80' },
      { name: 'Chatuchak weekend market', category: 'sightseeing', cost: 0, durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1747396108292-8e271c4e82c0?w=800&auto=format&fit=crop&q=80' },
      { name: 'Street food tour in Chinatown', category: 'food', cost: 1200, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1765761870400-c7ed80f1def2?w=800&auto=format&fit=crop&q=80' },
      { name: 'Khao San Road nightlife', category: 'nightlife', cost: 1000, durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1508213637674-c9e63239da23?w=800&auto=format&fit=crop&q=80' },
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
      { name: 'Eiffel Tower summit access', category: 'sightseeing', cost: 3000, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1690022938772-e903dcd9a56e?w=800&auto=format&fit=crop&q=80' },
      { name: 'Louvre Museum guided tour', category: 'culture', cost: 2200, durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1564557823522-1319c627a1e3?w=800&auto=format&fit=crop&q=80' },
      { name: 'Seine river dinner cruise', category: 'food', cost: 8000, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1765275266954-aa42dd69382d?w=800&auto=format&fit=crop&q=80' },
    ],
  },
  {
    name: 'Rome',
    country: 'Italy',
    region: 'Europe',
    costIndex: 1.5,
    popularityScore: 94,
    imageUrl: 'https://images.unsplash.com/photo-1576507271147-48237d97f182?w=800&auto=format&fit=crop&q=80',
    lat: 41.9028,
    lng: 12.4964,
    activities: [
      { name: 'Colosseum & Roman Forum tour', category: 'culture', cost: 3200, durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1460722665083-c2599113f7e0?w=800&auto=format&fit=crop&q=80' },
      { name: 'Trastevere food walk', category: 'food', cost: 2500, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1745752727106-356ebbd8e297?w=800&auto=format&fit=crop&q=80' },
      { name: 'Vatican Museums & Sistine Chapel', category: 'culture', cost: 2800, durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1748149803636-42fe67dca2df?w=800&auto=format&fit=crop&q=80' },
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
      { name: 'Shibuya Crossing & Harajuku walk', category: 'sightseeing', cost: 0, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1764418658791-771bb04efdcd?w=800&auto=format&fit=crop&q=80' },
      { name: 'Tsukiji Outer Market sushi breakfast', category: 'food', cost: 2500, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1705056132737-6d2df2218726?w=800&auto=format&fit=crop&q=80' },
      { name: 'teamLab digital art museum', category: 'culture', cost: 3200, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1748334455032-1fbc62295ead?w=800&auto=format&fit=crop&q=80' },
    ],
  },
  {
    name: 'Singapore',
    country: 'Singapore',
    region: 'Southeast Asia',
    costIndex: 1.55,
    popularityScore: 91,
    imageUrl: 'https://images.unsplash.com/photo-1574227492706-f65b24c3688a?w=800&auto=format&fit=crop&q=80',
    lat: 1.3521,
    lng: 103.8198,
    activities: [
      { name: 'Gardens by the Bay light show', category: 'sightseeing', cost: 0, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1572148884483-794c9b6c6963?w=800&auto=format&fit=crop&q=80' },
      { name: 'Sentosa island day pass', category: 'adventure', cost: 4000, durationMinutes: 360, imageUrl: 'https://images.unsplash.com/photo-1662385825401-d529115306a4?w=800&auto=format&fit=crop&q=80' },
      { name: 'Hawker centre food crawl', category: 'food', cost: 1500, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1739857554154-80c15b7b1af7?w=800&auto=format&fit=crop&q=80' },
    ],
  },
  {
    name: 'London',
    country: 'United Kingdom',
    region: 'Europe',
    costIndex: 1.75,
    popularityScore: 92,
    imageUrl: 'https://images.unsplash.com/photo-1758543144598-9d954f44799a?w=800&auto=format&fit=crop&q=80',
    lat: 51.5072,
    lng: -0.1276,
    activities: [
      { name: 'Tower of London tour', category: 'culture', cost: 3000, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1747857340643-6072b555d34b?w=800&auto=format&fit=crop&q=80' },
      { name: 'West End musical show', category: 'nightlife', cost: 6000, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1758884085332-876824194c9c?w=800&auto=format&fit=crop&q=80' },
      { name: 'Borough Market food tasting', category: 'food', cost: 2000, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1761901808305-9f39a02e82dd?w=800&auto=format&fit=crop&q=80' },
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
      { name: 'Uluwatu Temple sunset & Kecak dance', category: 'culture', cost: 700, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1604842937136-1648761a6256?w=800&auto=format&fit=crop&q=80' },
      { name: 'Tegalalang rice terrace walk', category: 'sightseeing', cost: 200, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&auto=format&fit=crop&q=80' },
      { name: 'Surfing lesson at Kuta Beach', category: 'adventure', cost: 1800, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1567520595865-0da8e017f2c3?w=800&auto=format&fit=crop&q=80' },
      { name: 'Beach club sunset party', category: 'nightlife', cost: 2000, durationMinutes: 240, imageUrl: 'https://images.unsplash.com/photo-1571984405176-5958bd9ac31d?w=800&auto=format&fit=crop&q=80' },
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
      { name: 'Burj Khalifa observation deck', category: 'sightseeing', cost: 6000, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1749273858638-ea678cb48e94?w=800&auto=format&fit=crop&q=80' },
      { name: 'Desert safari with BBQ dinner', category: 'adventure', cost: 5500, durationMinutes: 300, imageUrl: 'https://images.unsplash.com/photo-1758124270360-3d13c31b74f8?w=800&auto=format&fit=crop&q=80' },
      { name: 'Dubai Mall & Fountain show', category: 'sightseeing', cost: 0, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1605461659470-4536815b7c98?w=800&auto=format&fit=crop&q=80' },
    ],
  },
  {
    name: 'New York',
    country: 'United States',
    region: 'North America',
    costIndex: 1.85,
    popularityScore: 95,
    imageUrl: 'https://images.unsplash.com/photo-1574771343329-f6f08f96d3da?w=800&auto=format&fit=crop&q=80',
    lat: 40.7128,
    lng: -74.006,
    activities: [
      {
        name: 'Statue of Liberty & Ellis Island ferry',
        category: 'sightseeing',
        cost: 2000,
        durationMinutes: 240,
        imageUrl: 'https://images.unsplash.com/photo-1574771343329-f6f08f96d3da?w=800&auto=format&fit=crop&q=80',
      },
      {
        name: 'Top of the Rock observation deck',
        category: 'sightseeing',
        cost: 3200,
        durationMinutes: 90,
        imageUrl: 'https://images.unsplash.com/photo-1570304816841-906a17d7b067?w=800&auto=format&fit=crop&q=80',
      },
      {
        name: 'Broadway show experience',
        category: 'nightlife',
        cost: 9500,
        durationMinutes: 180,
        imageUrl: 'https://images.unsplash.com/photo-1762417420653-2517eaa74468?w=800&auto=format&fit=crop&q=80',
      },
      {
        name: 'Central Park bike tour',
        category: 'adventure',
        cost: 2800,
        durationMinutes: 120,
        imageUrl: 'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=800&auto=format&fit=crop&q=80',
      },
      {
        name: 'Times Square food truck crawl',
        category: 'food',
        cost: 1800,
        durationMinutes: 90,
        imageUrl: 'https://images.unsplash.com/photo-1551733182-2aa49e453e3d?w=800&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    name: 'Sydney',
    country: 'Australia',
    region: 'Oceania',
    costIndex: 1.5,
    popularityScore: 90,
    imageUrl: 'https://images.unsplash.com/photo-1744476381749-e4090481c85f?w=800&auto=format&fit=crop&q=80',
    lat: -33.8688,
    lng: 151.2093,
    activities: [
      {
        name: 'Sydney Opera House guided tour',
        category: 'culture',
        cost: 2200,
        durationMinutes: 90,
        imageUrl: 'https://images.unsplash.com/photo-1744476381749-e4090481c85f?w=800&auto=format&fit=crop&q=80',
      },
      {
        name: 'Sydney Harbour Bridge climb',
        category: 'adventure',
        cost: 15000,
        durationMinutes: 210,
        imageUrl: 'https://images.unsplash.com/photo-1531033056439-63578c0d9f22?w=800&auto=format&fit=crop&q=80',
      },
      {
        name: 'Bondi Beach surf lesson',
        category: 'adventure',
        cost: 4500,
        durationMinutes: 120,
        imageUrl: 'https://images.unsplash.com/photo-1527731149372-fae504a1185f?w=800&auto=format&fit=crop&q=80',
      },
      {
        name: 'Taronga Zoo ferry & visit',
        category: 'sightseeing',
        cost: 3000,
        durationMinutes: 240,
        imageUrl: 'https://images.unsplash.com/photo-1575699914911-0027c7b95fb6?w=800&auto=format&fit=crop&q=80',
      },
      {
        name: 'Darling Harbour seafood dinner',
        category: 'food',
        cost: 5200,
        durationMinutes: 90,
        imageUrl: 'https://images.unsplash.com/photo-1651323018466-b36b7df1d2b1?w=800&auto=format&fit=crop&q=80',
      },
    ],
  },
];

async function main() {
  console.log('🌱 Seeding demo users...');
  const passwordHash = await bcrypt.hash('password123', 10);
  
  await prisma.user.upsert({
    where: { email: 'demo@globetrotter.app' },
    update: { name: 'User 1' },
    create: {
      name: 'User 1',
      email: 'demo@globetrotter.app',
      passwordHash,
      role: 'user',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@globetrotter.com' },
    update: { name: 'Admin' },
    create: {
      name: 'Admin',
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
    } else if (!city.imageUrl && cityData.imageUrl) {
      city = await prisma.city.update({
        where: { id: city.id },
        data: { imageUrl: cityData.imageUrl },
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
      } else if (!existing.imageUrl && activity.imageUrl) {
        await prisma.activity.update({
          where: { id: existing.id },
          data: { imageUrl: activity.imageUrl },
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
