import { PrismaClient, ActivityCategory, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting GlobeTrotter database seed...');

  // 1. Clean existing records (in order of foreign key dependency)
  await prisma.tripActivity.deleteMany({});
  await prisma.tripStop.deleteMany({});
  await prisma.tripExpense.deleteMany({});
  await prisma.shareLink.deleteMany({});
  await prisma.tripCollaborator.deleteMany({});
  await prisma.trip.deleteMany({});
  await prisma.savedDestination.deleteMany({});
  await prisma.activity.deleteMany({});
  await prisma.city.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🧹 Cleaned existing database tables.');

  // 2. Create Demo Users
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const demoUser = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'alex@globetrotter.com',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      languagePref: 'en',
      role: Role.USER,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin Sarah',
      email: 'admin@globetrotter.com',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
      languagePref: 'en',
      role: Role.ADMIN,
    },
  });

  console.log('👤 Created demo users: alex@globetrotter.com & admin@globetrotter.com (password: Password123!)');

  // 3. Create Cities Catalog
  const citiesData = [
    {
      name: 'Paris',
      country: 'France',
      region: 'Europe',
      description: 'The City of Light dazzles with iconic monuments, world-class art museums, charming bistros, and romantic Seine river walks.',
      costIndex: 3.8,
      popularityScore: 98,
      imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80',
      lat: 48.8566,
      lng: 2.3522,
    },
    {
      name: 'Tokyo',
      country: 'Japan',
      region: 'Asia',
      description: 'A neon-lit metropolis blending futuristic skyscraper districts with ancient Shinto shrines and legendary culinary traditions.',
      costIndex: 3.5,
      popularityScore: 97,
      imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80',
      lat: 35.6762,
      lng: 139.6503,
    },
    {
      name: 'Rome',
      country: 'Italy',
      region: 'Europe',
      description: 'An open-air living museum packed with Colosseum gladiatorial history, Vatican treasures, and espresso-scented cobblestone alleys.',
      costIndex: 3.2,
      popularityScore: 95,
      imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80',
      lat: 41.9028,
      lng: 12.4964,
    },
    {
      name: 'Bali',
      country: 'Indonesia',
      region: 'Asia',
      description: 'Island paradise of emerald terraced rice paddies, serene spiritual temples, surf breaks, and world-class wellness retreats.',
      costIndex: 1.8,
      popularityScore: 94,
      imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80',
      lat: -8.4095,
      lng: 115.1889,
    },
    {
      name: 'New York City',
      country: 'United States',
      region: 'North America',
      description: 'The energetic global capital of Broadway theater, Central Park foliage, soaring rooftop bars, and vibrant cultural boroughs.',
      costIndex: 4.5,
      popularityScore: 96,
      imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop&q=80',
      lat: 40.7128,
      lng: -74.0060,
    },
    {
      name: 'Goa',
      country: 'India',
      region: 'Asia',
      description: 'Sun-drenched coastal haven renowned for golden sandy shores, Portuguese heritage villas, fresh seafood shacks, and vibrant beach parties.',
      costIndex: 1.5,
      popularityScore: 91,
      imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
      lat: 15.2993,
      lng: 74.1240,
    },
    {
      name: 'Barcelona',
      country: 'Spain',
      region: 'Europe',
      description: 'Catalonian capital famous for Gaudí architectural wonders like Sagrada Família, lively tapas quarters, and Mediterranean beaches.',
      costIndex: 2.9,
      popularityScore: 93,
      imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&auto=format&fit=crop&q=80',
      lat: 41.3879,
      lng: 2.1699,
    },
    {
      name: 'Kyoto',
      country: 'Japan',
      region: 'Asia',
      description: 'The cultural heart of Japan boasting thousands of classical Buddhist temples, bamboo groves, geisha districts, and peaceful zen gardens.',
      costIndex: 3.1,
      popularityScore: 90,
      imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80',
      lat: 35.0116,
      lng: 135.7681,
    },
    {
      name: 'Dubai',
      country: 'United Arab Emirates',
      region: 'Middle East',
      description: 'Futuristic oasis of record-breaking Burj Khalifa heights, luxury desert safaris, ultra-modern malls, and marina promenades.',
      costIndex: 4.0,
      popularityScore: 92,
      imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80',
      lat: 25.2048,
      lng: 55.2708,
    },
    {
      name: 'Amsterdam',
      country: 'Netherlands',
      region: 'Europe',
      description: 'Picturesque canal ring lined with narrow 17th-century townhouses, cycling trails, Van Gogh art, and relaxed cafe culture.',
      costIndex: 3.4,
      popularityScore: 89,
      imageUrl: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=800&auto=format&fit=crop&q=80',
      lat: 52.3676,
      lng: 4.9041,
    },
    {
      name: 'London',
      country: 'United Kingdom',
      region: 'Europe',
      description: 'Historic and cosmopolitan capital with Royal palaces, West End theatre shows, River Thames bridges, and buzzing street markets.',
      costIndex: 4.2,
      popularityScore: 95,
      imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&q=80',
      lat: 51.5074,
      lng: -0.1278,
    },
    {
      name: 'Sydney',
      country: 'Australia',
      region: 'Oceania',
      description: 'Stunning harbor city celebrated for the Sydney Opera House sails, Bondi Beach waves, coastal walking tracks, and sunny lifestyle.',
      costIndex: 3.7,
      popularityScore: 88,
      imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&auto=format&fit=crop&q=80',
      lat: -33.8688,
      lng: 151.2093,
    },
  ];

  const createdCities: Record<string, string> = {};

  for (const c of citiesData) {
    const city = await prisma.city.create({
      data: c,
    });
    createdCities[c.name] = city.id;
  }

  console.log(`🏙️ Created ${citiesData.length} global cities.`);

  // 4. Create Activities Catalog
  const activitiesData = [
    // Paris
    {
      cityName: 'Paris',
      name: 'Eiffel Tower Summit & Champagne Experience',
      description: 'Skip-the-line guided ascent to the 276m summit with panoramic city views and a celebratory glass of champagne.',
      category: ActivityCategory.SIGHTSEEING,
      cost: 45.0,
      durationMinutes: 120,
      imageUrl: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
    },
    {
      cityName: 'Paris',
      name: 'Louvre Masterpieces Guided Tour',
      description: 'Expert-led small group exploration of Mona Lisa, Venus de Milo, and Winged Victory with priority access.',
      category: ActivityCategory.CULTURE,
      cost: 65.0,
      durationMinutes: 150,
      imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
    },
    {
      cityName: 'Paris',
      name: 'Montmartre Artisanal Food & Wine Tasting Walk',
      description: 'Stroll through bohemian Montmartre sampling fresh croissants, AOC cheeses, macarons, and vintage Bordeaux wines.',
      category: ActivityCategory.FOOD,
      cost: 75.0,
      durationMinutes: 180,
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
    },
    {
      cityName: 'Paris',
      name: 'Seine River Sunset Jazz Cruise',
      description: 'Evening boat cruise along illuminated Notre-Dame and bridges with live acoustic jazz and French wine.',
      category: ActivityCategory.NIGHTLIFE,
      cost: 55.0,
      durationMinutes: 90,
      imageUrl: 'https://images.unsplash.com/photo-1520939817895-060bdef4bf1a?w=800&auto=format&fit=crop&q=80',
      rating: 4.7,
    },

    // Tokyo
    {
      cityName: 'Tokyo',
      name: 'Tsukiji Outer Market Culinary Safari',
      description: 'Savor melt-in-the-mouth sashimi, wagyu skewers, tamagoyaki, and fresh matcha with an expert local foodie.',
      category: ActivityCategory.FOOD,
      cost: 60.0,
      durationMinutes: 180,
      imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
    },
    {
      cityName: 'Tokyo',
      name: 'Shibuya Sky & Harajuku Culture Walk',
      description: '360-degree glass rooftop observation deck overlooking the Shibuya Scramble followed by Takeshita street discovery.',
      category: ActivityCategory.SIGHTSEEING,
      cost: 35.0,
      durationMinutes: 120,
      imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
    },
    {
      cityName: 'Tokyo',
      name: 'Mount Fuji & Hakone Day Adventure',
      description: 'Scenic bullet train and cable car trip to Fuji 5th station with Lake Ashi pirate boat cruise.',
      category: ActivityCategory.ADVENTURE,
      cost: 110.0,
      durationMinutes: 480,
      imageUrl: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
    },
    {
      cityName: 'Tokyo',
      name: 'Shinjuku Golden Gai Izakaya Bar Crawl',
      description: 'Navigate the atmospheric alleyways of Golden Gai and Omoide Yokocho for craft sake, yakitori, and local banter.',
      category: ActivityCategory.NIGHTLIFE,
      cost: 50.0,
      durationMinutes: 180,
      imageUrl: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&auto=format&fit=crop&q=80',
      rating: 4.7,
    },

    // Rome
    {
      cityName: 'Rome',
      name: 'Colosseum & Roman Forum Gladiator Arena Tour',
      description: 'Direct arena floor entrance with exclusive underground chambers walkthrough led by an archaeologist.',
      category: ActivityCategory.CULTURE,
      cost: 58.0,
      durationMinutes: 150,
      imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
    },
    {
      cityName: 'Rome',
      name: 'Trastevere Sunset Pizza & Pasta Masterclass',
      description: 'Hands-on pasta and tiramisu cooking workshop in a traditional Trastevere palazzo with unlimited Chianti.',
      category: ActivityCategory.FOOD,
      cost: 70.0,
      durationMinutes: 180,
      imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
    },
    {
      cityName: 'Rome',
      name: 'Vatican Museums & Sistine Chapel Early VIP Access',
      description: 'Beat the crowds into Michelangelo’s Sistine Chapel and St. Peter’s Basilica before public opening.',
      category: ActivityCategory.CULTURE,
      cost: 85.0,
      durationMinutes: 180,
      imageUrl: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
    },

    // Bali
    {
      cityName: 'Bali',
      name: 'Mount Batur Sunrise Volcano Trek',
      description: 'Early morning hike up Mount Batur crater to watch the sunrise above the clouds with volcanic-steam breakfast.',
      category: ActivityCategory.ADVENTURE,
      cost: 40.0,
      durationMinutes: 300,
      imageUrl: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
    },
    {
      cityName: 'Bali',
      name: 'Ubud Rice Terrace Jungle Swing & Waterfall Bathing',
      description: 'Tegallalang terraced swing photo session followed by refreshing swim beneath hidden Tegenungan falls.',
      category: ActivityCategory.SIGHTSEEING,
      cost: 25.0,
      durationMinutes: 240,
      imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80',
      rating: 4.7,
    },
    {
      cityName: 'Bali',
      name: 'Canggu Beach Sunset Surf & Beach Club Party',
      description: 'Private surf lesson on Echo Beach waves followed by VIP sunset daybed at Finns Beach Club.',
      category: ActivityCategory.NIGHTLIFE,
      cost: 45.0,
      durationMinutes: 240,
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
    },

    // New York City
    {
      cityName: 'New York City',
      name: 'Summit One Vanderbilt Immersive Skydeck',
      description: 'Multi-sensory mirrored observation deck 1,000 feet above Midtown Manhattan with views of the Empire State.',
      category: ActivityCategory.SIGHTSEEING,
      cost: 42.0,
      durationMinutes: 90,
      imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
    },
    {
      cityName: 'New York City',
      name: 'Broadway Front-Row Musical Experience',
      description: 'Reserved orchestra seat for an award-winning Broadway production in the heart of Times Square.',
      category: ActivityCategory.CULTURE,
      cost: 130.0,
      durationMinutes: 150,
      imageUrl: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
    },
    {
      cityName: 'New York City',
      name: 'Brooklyn Bridge & DUMBO Food Tasting Tour',
      description: 'Walk across the iconic suspension bridge to taste authentic New York pizza, lobster rolls, and artisanal chocolate.',
      category: ActivityCategory.FOOD,
      cost: 65.0,
      durationMinutes: 180,
      imageUrl: 'https://images.unsplash.com/photo-1518235506717-e1ed3306a89b?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
    },

    // Goa
    {
      cityName: 'Goa',
      name: 'Grande Island Scuba Diving & Dolphin Sightseeing',
      description: 'Boat expedition to Arabian Sea coral reefs with certified PADI dive instructor and dolphin watching.',
      category: ActivityCategory.ADVENTURE,
      cost: 30.0,
      durationMinutes: 360,
      imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
      rating: 4.7,
    },
    {
      cityName: 'Goa',
      name: 'Old Goa Portuguese Heritage & Spice Plantation Walk',
      description: 'Explore UNESCO Basilica of Bom Jesus, Se Cathedral, and an aromatic spice plantation with buffet lunch.',
      category: ActivityCategory.CULTURE,
      cost: 20.0,
      durationMinutes: 240,
      imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
      rating: 4.6,
    },
    {
      cityName: 'Goa',
      name: 'Anjuna Beach Sunset Shacks & Psytrance Night',
      description: 'Cocktails at Curlies and Shiva Valley under neon lights listening to international DJs by the crashing waves.',
      category: ActivityCategory.NIGHTLIFE,
      cost: 25.0,
      durationMinutes: 240,
      imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
      rating: 4.6,
    },

    // Barcelona
    {
      cityName: 'Barcelona',
      name: 'Sagrada Família Fast-Track & Towers Tour',
      description: 'Audio-guided deep dive into Antoni Gaudí’s masterpiece with elevator access to the Nativity Tower.',
      category: ActivityCategory.CULTURE,
      cost: 38.0,
      durationMinutes: 120,
      imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
    },
    {
      cityName: 'Barcelona',
      name: 'El Born Tapas Crawl & Sangria Workshop',
      description: 'Learn to mix authentic Spanish sangria while visiting 4 local bodegas for Iberian jamón, patatas bravas, and pinchos.',
      category: ActivityCategory.FOOD,
      cost: 55.0,
      durationMinutes: 180,
      imageUrl: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
    },

    // Kyoto
    {
      cityName: 'Kyoto',
      name: 'Fushimi Inari 10,000 Torii Gates Sunset Hike',
      description: 'Photographic mountain pilgrimage through vibrant vermilion shrine gates with tranquil mountain lookouts.',
      category: ActivityCategory.SIGHTSEEING,
      cost: 20.0,
      durationMinutes: 150,
      imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
    },
    {
      cityName: 'Kyoto',
      name: 'Traditional Tea Ceremony in Gion Geisha District',
      description: 'Authentic matcha preparation ritual wearing a silk kimono in an authentic 150-year-old wooden Machiya.',
      category: ActivityCategory.CULTURE,
      cost: 48.0,
      durationMinutes: 90,
      imageUrl: 'https://images.unsplash.com/photo-1578637387939-43c525550085?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
    },

    // Dubai
    {
      cityName: 'Dubai',
      name: 'Red Dunes 4x4 Desert Safari & Bedouin BBQ Dinner',
      description: 'Dune bashing, sandboarding, camel riding, and henna painting under stars with fire shows and tanoura dancing.',
      category: ActivityCategory.ADVENTURE,
      cost: 65.0,
      durationMinutes: 360,
      imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
    },
    {
      cityName: 'Dubai',
      name: 'Burj Khalifa 148th Floor At the Top SKY Lounge',
      description: 'World’s highest observation lounge with dedicated guest ambassador and gourmet delicacies.',
      category: ActivityCategory.SIGHTSEEING,
      cost: 95.0,
      durationMinutes: 90,
      imageUrl: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
    },

    // Amsterdam
    {
      cityName: 'Amsterdam',
      name: 'Historic Canal Cruise with Dutch Cheese & Wine',
      description: 'Open-boat luxury cruise through UNESCO Herengracht and Prinsengracht canals with aged Gouda cheese.',
      category: ActivityCategory.SIGHTSEEING,
      cost: 32.0,
      durationMinutes: 75,
      imageUrl: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=800&auto=format&fit=crop&q=80',
      rating: 4.7,
    },
    {
      cityName: 'Amsterdam',
      name: 'Jordaan Countryside Windmill Bike Tour',
      description: 'Pedal through tulip fields and historic Zaanse Schans wooden windmills with a clogs carving demonstration.',
      category: ActivityCategory.ADVENTURE,
      cost: 45.0,
      durationMinutes: 240,
      imageUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
    },

    // London
    {
      cityName: 'London',
      name: 'Tower of London & Crown Jewels Early Access',
      description: 'Beating crowds with the Yeoman Warder Beefeater opening ceremony and viewing of the royal monarch diamonds.',
      category: ActivityCategory.CULTURE,
      cost: 40.0,
      durationMinutes: 150,
      imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
    },
    {
      cityName: 'London',
      name: 'Soho & Covent Garden West End Pub Tour',
      description: 'Discover 300-year-old Victorian taverns frequented by Charles Dickens, sampling British cask ales and ciders.',
      category: ActivityCategory.NIGHTLIFE,
      cost: 35.0,
      durationMinutes: 180,
      imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&auto=format&fit=crop&q=80',
      rating: 4.7,
    },

    // Sydney
    {
      cityName: 'Sydney',
      name: 'Sydney Harbour BridgeClimb Experience',
      description: 'Climb the iconic steel arches 134m above sea level for breathtaking 360-degree views of the Opera House and harbor.',
      category: ActivityCategory.ADVENTURE,
      cost: 180.0,
      durationMinutes: 210,
      imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
    },
    {
      cityName: 'Sydney',
      name: 'Bondi to Coogee Coastal Walk & Beach BBQ',
      description: 'Dramatic cliffside walking trail past ocean pools, Tamarama, and Bronte beaches with fresh Aussie burger lunch.',
      category: ActivityCategory.SIGHTSEEING,
      cost: 28.0,
      durationMinutes: 180,
      imageUrl: 'https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
    },
  ];

  for (const act of activitiesData) {
    const cityId = createdCities[act.cityName];
    if (cityId) {
      await prisma.activity.create({
        data: {
          cityId,
          name: act.name,
          description: act.description,
          category: act.category,
          cost: act.cost,
          durationMinutes: act.durationMinutes,
          imageUrl: act.imageUrl,
          rating: act.rating,
        },
      });
    }
  }

  console.log(`🎯 Created ${activitiesData.length} categorized activities.`);

  // 5. Seed Saved Destinations for Alex
  const parisId = createdCities['Paris'];
  const tokyoId = createdCities['Tokyo'];
  const baliId = createdCities['Bali'];

  if (parisId) {
    await prisma.savedDestination.create({
      data: {
        userId: demoUser.id,
        cityId: parisId,
      },
    });
  }
  if (tokyoId) {
    await prisma.savedDestination.create({
      data: {
        userId: demoUser.id,
        cityId: tokyoId,
      },
    });
  }
  if (baliId) {
    await prisma.savedDestination.create({
      data: {
        userId: demoUser.id,
        cityId: baliId,
      },
    });
  }

  console.log('❤️ Seeded 3 saved destinations for demo user Alex.');
  console.log('✅ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
