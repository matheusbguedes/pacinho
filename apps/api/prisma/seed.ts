import { prisma } from "@/lib/prisma";
import { Objective, UserRole } from "@prisma-client";
import bcrypt from "bcrypt";

function atDayOffset(daysFromNow: number, hour: number, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, minute, 0, 0);
  return date;
}

const DEMO_PEOPLE = [
  {
    name: "Ana Corrêa",
    email: "ana@pacinho.app",
    city: "São Paulo",
    region: "Pinheiros",
    age: 27,
    bio: "Treino de manhã cedo. Topo um café depois da corrida.",
    objective: Objective.DATING,
    pace: "5:20/km",
    distance_km: 8,
    media: [
      "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=900&q=80",
      "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=900&q=80",
    ],
  },
  {
    name: "Bruno Lima",
    email: "bruno@pacinho.app",
    city: "São Paulo",
    region: "Ibirapuera",
    age: 29,
    bio: "Longão no domingo e after de conversa leve.",
    objective: Objective.FRIENDSHIP,
    pace: "5:00/km",
    distance_km: 12,
    media: [
      "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=900&q=80",
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&q=80",
    ],
  },
  {
    name: "Clara Nunes",
    email: "clara@pacinho.app",
    city: "São Paulo",
    region: "Vila Madalena",
    age: 25,
    bio: "Pace confortável, playlist boa e zero pressão.",
    objective: Objective.TRAINING,
    pace: "5:45/km",
    distance_km: 5,
    media: [
      "https://images.unsplash.com/photo-1594882645126-14020914d58d?w=900&q=80",
      "https://images.unsplash.com/photo-1483721310020-03333e577078?w=900&q=80",
      "https://images.unsplash.com/photo-1461896836934-ffe607ba6851?w=900&q=80",
    ],
  },
  {
    name: "Diego Santos",
    email: "diego@pacinho.app",
    city: "São Paulo",
    region: "Moema",
    age: 31,
    bio: "Procuro alguém pra manter a frequência de treino.",
    objective: Objective.TRAINING,
    pace: "4:50/km",
    distance_km: 10,
    media: [
      "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=900&q=80",
    ],
  },
] as const;

async function seed() {
  const password = await bcrypt.hash("pacinho123", 10);

  await prisma.user.upsert({
    where: { email: "admin@pacinho.app" },
    update: {},
    create: {
      name: "Admin Pacinho",
      email: "admin@pacinho.app",
      password,
      role: UserRole.ADMIN,
      city: "São Paulo",
      region: "Pinheiros",
      age: 28,
      objective: Objective.FRIENDSHIP,
      pace: "5:30/km",
      distance_km: 10,
    },
  });

  await prisma.user.upsert({
    where: { email: "runner@pacinho.app" },
    update: {},
    create: {
      name: "Corredor Demo",
      email: "runner@pacinho.app",
      password,
      role: UserRole.USER,
      city: "São Paulo",
      region: "Ibirapuera",
      age: 26,
      bio: "Treino de terça e quinta. Topo um café depois.",
      objective: Objective.DATING,
      pace: "5:00/km",
      distance_km: 5,
    },
  });

  for (const person of DEMO_PEOPLE) {
    const user = await prisma.user.upsert({
      where: { email: person.email },
      update: {
        name: person.name,
        city: person.city,
        region: person.region,
        age: person.age,
        bio: person.bio,
        objective: person.objective,
        pace: person.pace,
        distance_km: person.distance_km,
      },
      create: {
        name: person.name,
        email: person.email,
        password,
        role: UserRole.USER,
        city: person.city,
        region: person.region,
        age: person.age,
        bio: person.bio,
        objective: person.objective,
        pace: person.pace,
        distance_km: person.distance_km,
      },
    });

    await prisma.userMedia.deleteMany({ where: { user_id: user.id } });

    await prisma.userMedia.createMany({
      data: person.media.map((url, index) => ({
        user_id: user.id,
        url,
        sort_order: index,
      })),
    });
  }

  const demoEvents = [
    {
      name: "Run and Bass SP",
      starts_at: atDayOffset(2, 7),
      location: "Parque Ibirapuera, São Paulo",
      distance_km: 5,
      organizer: "Run and Bass",
      ticket_url: "https://example.com/ingressos",
    },
    {
      name: "Treino leve na Paulista",
      starts_at: atDayOffset(3, 6, 30),
      location: "Av. Paulista, São Paulo",
      distance_km: 8,
      organizer: "Pacinho Crew",
      ticket_url: null,
    },
    {
      name: "Sunset run Vila Madalena",
      starts_at: atDayOffset(5, 18),
      location: "Vila Madalena, São Paulo",
      distance_km: 6,
      organizer: "Night Runners",
      ticket_url: null,
    },
    {
      name: "Longão do Ibirapuera",
      starts_at: atDayOffset(7, 7),
      location: "Parque Ibirapuera, São Paulo",
      distance_km: 15,
      organizer: "Pacinho",
      ticket_url: null,
    },
    {
      name: "Track session Interlagos",
      starts_at: atDayOffset(9, 8),
      location: "Autódromo de Interlagos",
      distance_km: 10,
      organizer: "Track Club SP",
      ticket_url: "https://example.com/track",
    },
    {
      name: "Corrida do café Pinheiros",
      starts_at: atDayOffset(11, 8, 30),
      location: "Pinheiros, São Paulo",
      distance_km: 5,
      organizer: "Café Run Club",
      ticket_url: null,
    },
  ];

  for (const event of demoEvents) {
    const existing = await prisma.event.findFirst({
      where: { name: event.name },
    });

    if (existing) {
      await prisma.event.update({
        where: { id: existing.id },
        data: {
          starts_at: event.starts_at,
          location: event.location,
          distance_km: event.distance_km,
          organizer: event.organizer,
          ticket_url: event.ticket_url,
        },
      });
      continue;
    }

    await prisma.event.create({ data: event });
  }

  console.log("Database seeded successfully");
  await prisma.$disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
