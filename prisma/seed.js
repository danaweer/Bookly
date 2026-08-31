import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";


const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
}); // a must have for prisma 7

const prisma = new PrismaClient({ adapter }); //creating an instance from the prismaClient to talk to the database

const books = [
  {
    title: "Atomic Habits",
    overview:
      "A practical guide to building good habits and breaking bad ones through small daily improvements.",
    releaseYear: 2018,
    genres: ["Self-Help", "Productivity"],
    author: "James Clear",
  },
  {
    title: "Clean Code",
    overview:
      "A handbook of agile software craftsmanship and writing maintainable code.",
    releaseYear: 2008,
    genres: ["Programming", "Software Engineering"],
    author: "Robert C. Martin",
  },
  {
    title: "The Pragmatic Programmer",
    overview:
      "Essential software engineering principles and practical development techniques.",
    releaseYear: 1999,
    genres: ["Programming", "Software Engineering"],
    author: "Andrew Hunt",
  },
  {
    title: "Deep Work",
    overview:
      "Learn how focused work leads to extraordinary productivity in a distracted world.",
    releaseYear: 2016,
    genres: ["Productivity", "Self-Help"],
    author: "Cal Newport",
  },
  {
    title: "The Psychology of Money",
    overview:
      "Explores how behavior influences financial success more than knowledge.",
    releaseYear: 2020,
    genres: ["Finance", "Psychology"],
    author: "Morgan Housel",
  },
  {
    title: "Think and Grow Rich",
    overview:
      "Classic lessons on mindset, success, and personal achievement.",
    releaseYear: 1937,
    genres: ["Business", "Self-Help"],
    author: "Napoleon Hill",
  },
  {
    title: "Rich Dad Poor Dad",
    overview:
      "Contrasting financial philosophies that reshape the way people think about money.",
    releaseYear: 1997,
    genres: ["Finance", "Business"],
    author: "Robert Kiyosaki",
  },
  {
    title: "The Lean Startup",
    overview:
      "A framework for building startups through continuous innovation and experimentation.",
    releaseYear: 2011,
    genres: ["Business", "Entrepreneurship"],
    author: "Eric Ries",
  },
  {
    title: "The Martian",
    overview:
      "An astronaut stranded on Mars fights to survive using science and ingenuity.",
    releaseYear: 2011,
    genres: ["Science Fiction", "Adventure"],
    author: "Andy Weir",
  },
  {
    title: "Project Hail Mary",
    overview:
      "A lone astronaut must save humanity through science and unexpected friendship.",
    releaseYear: 2021,
    genres: ["Science Fiction"],
    author: "Andy Weir",
  },
];

const main = async () => {
    console.log("Seeding Books...");

    const password = "SeedPassword123!";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const seedUser = await prisma.user.upsert({
        where: {
            email: "seed@example.com",
        },
        update: {},
        create: {
            name: "Seed User",
            email: "seed@example.com",
            password: hashedPassword,
        },
    });

    for (const book of books) {
      await prisma.book.upsert({//upsert is a Smart insert-or-update depending on existence.
          where: { // the where clause needs a compound unique key
              title_author_releaseYear: { // unique field to update at
                  title: book.title, //which contains an object of 3 comp ids
                  author: book.author,
                  releaseYear: book.releaseYear,
              },
          },
          update: {}, // nothing to update (or specify fields)
          create: {
            ...book,
            createdById: seedUser.id
          } // create if not found
      });
      console.log(`Seeded book: ${book.title}`); //log each book that is created
    }

    console.log("Seeding Completed!"); //log that the seeding of all the books is completed
};

main()
    .catch((err) => {
        console.error(err);
        process.exit(1); //Terminate this Node process because an error occurred. and it is not closing the server as it is not running an Express server
    })
    .finally(async() => {
        await prisma.$disconnect();
    }); //whether it failed or not we must close the db connection

    //books array → book information only
    //seedUser → created separately
    //upsert → combine book + seedUser.id