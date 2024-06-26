import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

console.log("Seeding database...");

try {
  await prisma.user.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.postEngagement.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.datum.deleteMany({});

  console.log("seeding user...");
  const user = await prisma.user.create({
    data: {
      email: "admin@example.com",
      role: "admin",
    },
  });

  console.log("seeding tags and posts...");

  await prisma.category.createMany({
    data: [
      { name: "Politics" },
      { name: "Entertainment" },
      { name: "Media" },
      { name: "Music" },
    ],
  });

  const categories = await prisma.category.findMany();

  await prisma.tag.createMany({
    data: [
      {
        name: "#trump",
        categoryId: categories.find((c) => c.name === "Politics")!.id,
      },
      {
        name: "#biden",
        categoryId: categories.find((c) => c.name === "Politics")!.id,
      },
      {
        name: "#kardashian",
        categoryId: categories.find((c) => c.name === "Entertainment")!.id,
      },
      {
        name: "#cnn",
        categoryId: categories.find((c) => c.name === "Media")!.id,
      },
      {
        name: "#foxnews",
        categoryId: categories.find((c) => c.name === "Media")!.id,
      },
      {
        name: "#eminem",
        categoryId: categories.find((c) => c.name === "Music")!.id,
      },
      {
        name: "#drake",
        categoryId: categories.find((c) => c.name === "Music")!.id,
      },
    ],
  });

  const tags = await prisma.tag.findMany();

  await prisma.post.createMany({
    data: [
      {
        title: "Trump do this",
        text: "Trump do that",
        mediaIcon: "instagram",
        URL: "https://www.instagram.com",
        thumbnailURL: "https://picsum.photos/seed/picsum0/200/200",
        tagId: tags.find((t) => t.name === "#trump")!.id,

        postUsername: "BBC",
        postUserLogoURL:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGbOTqp-l8Z_b8JlWG3ISTit5469kJdftW15BOG9OF0JpU72bH_8Z2cNrcLdKCt2UqG2U&usqp=CAU",
        createdById: user.id,
      },
      {
        title: "Biden do this",
        text: "Biden do that",
        mediaIcon: "twitter",
        URL: "https://www.twitter.com",
        thumbnailURL: "https://picsum.photos/seed/picsum/200/200",
        tagId: tags.find((t) => t.name === "#biden")!.id,
        postUsername: "CNN",
        postUserLogoURL:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/CNN_International_logo.svg/600px-CNN_International_logo.svg.png",
        createdById: user.id,
      },
      {
        title: "Kardashian do this",
        text: "Kardashian do that",
        mediaIcon: "youtube",
        URL: "https://www.youtube.com",
        thumbnailURL: "https://picsum.photos/seed/picsum1/200/200",
        tagId: tags.find((t) => t.name === "#kardashian")!.id,
        postUsername: "username3",
        postUserLogoURL: "https://www.youtube.com",
        createdById: user.id,
      },
      {
        title: "Kardashian do this again",
        text: "Kardashian do that again",
        mediaIcon: "youtube",
        URL: "https://www.youtube.com",
        thumbnailURL: "https://picsum.photos/seed/picsum12/200/200",
        tagId: tags.find((t) => t.name === "#kardashian")!.id,
        postUsername: "username44",
        postUserLogoURL: "https://www.youtube.com",
        createdById: user.id,
      },
      {
        title: "CNN do this",
        text: "CNN do that",
        mediaIcon: "tiktok",
        URL: "https://www.tiktok.com",
        thumbnailURL: "https://picsum.photos/seed/picsum2/200/200",
        tagId: tags.find((t) => t.name === "#cnn")!.id,
        postUsername: "username4",
        postUserLogoURL: "https://www.tiktok.com",
        createdById: user.id,
      },
      {
        title: "Fox News do this",
        text: "Fox News do that",
        mediaIcon: "facebook",
        URL: "https://www.facebook.com",
        thumbnailURL: "https://picsum.photos/seed/picsum3/200/200",
        tagId: tags.find((t) => t.name === "#foxnews")!.id,
        postUsername: "username5",
        postUserLogoURL: "https://www.facebook.com",
        createdById: user.id,
      },
      {
        title: "Eminem do this",
        text: "Eminem do that",
        mediaIcon: "instagram",
        URL: "https://www.instagram.com",
        thumbnailURL: "https://picsum.photos/seed/picsum4/200/200",
        tagId: tags.find((t) => t.name === "#eminem")!.id,
        postUsername: "username6",
        postUserLogoURL: "https://www.instagram.com",
        createdById: user.id,
      },
      {
        title: "Drake do this",
        text: "Drake do that",
        mediaIcon: "twitter",
        URL: "https://www.twitter.com",
        thumbnailURL: "https://picsum.photos/seed/picsum5/200/200",
        tagId: tags.find((t) => t.name === "#drake")!.id,
        postUsername: "username7",
        postUserLogoURL: "https://www.twitter.com",
        createdById: user.id,
      },
    ],
  });

  const createdPosts = await prisma.post.findMany();

  const dateTimeArray = Array.from({ length: 5 }, (_, i) => ({
    datetime: new Date(2024, 4, 1, i),
  }));

  await Promise.all(
    dateTimeArray.map((data) =>
      prisma.datum.create({
        data: {
          dateTime: data.datetime,

          tags: {
            connect: tags
              .filter(() => Math.random() > 0.5)
              .map((tag) => ({ id: tag.id })),
          },
        },
      }),
    ),
  );

  const datums = await prisma.datum.findMany({ include: { tags: true } });

  const postEngagementsToSeed = [];

  for (const post of createdPosts) {
    const datumsOfTheTagOfThePost = datums.filter((datum) => {
      return datum.tags.some((tag) => tag.id === post.tagId);
    });

    if (!datumsOfTheTagOfThePost) continue;
    postEngagementsToSeed.push(
      ...datumsOfTheTagOfThePost.map((datum) => ({
        datumId: datum.id,
        postId: post.id,
        amount: Math.floor(Math.random() * 100),
      })),
    );
  }

  await prisma.postEngagement.createMany({
    data: postEngagementsToSeed,
  });

  console.log("Database seeded successfully");
} catch (error) {
  console.log("Error seeding database", error);
}
