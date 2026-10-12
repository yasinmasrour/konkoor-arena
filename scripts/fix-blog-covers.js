// scripts/fix-blog-covers.js
const prisma = require("../src/config/prisma");

async function fixCovers() {
  const posts = await prisma.blogPost.findMany({
    where: {
      coverImage: { contains: "%2F" },
    },
  });

  console.log(`Found ${posts.length} posts with broken covers`);

  for (const post of posts) {
    const fixed = post.coverImage.replace(/%2F/gi, "/").split("?")[0];

    await prisma.blogPost.update({
      where: { id: post.id },
      data: { coverImage: fixed },
    });

    console.log(`✅ Fixed: ${post.slug}`);
  }

  console.log("Done!");
}

fixCovers()
  .catch(console.error)
  .finally(() => process.exit(0));
