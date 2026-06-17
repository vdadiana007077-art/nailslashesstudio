import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import fs from "fs";
import path from "path";

async function main() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(__dirname, `../scratch/backup-${timestamp}`);
  fs.mkdirSync(backupDir, { recursive: true });

  console.log(`Backup dizini: ${backupDir}`);

  // 1. BlogPost tablosu
  const posts = await prisma.blogPost.findMany({ include: { translations: true, categories: true, faqs: true } });
  fs.writeFileSync(path.join(backupDir, "blog_posts.json"), JSON.stringify(posts, null, 2));
  console.log(`BlogPost: ${posts.length} kayıt yedeklendi`);

  // 2. BlogCategory tablosu
  const cats = await prisma.blogCategory.findMany({ include: { translations: true } });
  fs.writeFileSync(path.join(backupDir, "blog_categories.json"), JSON.stringify(cats, null, 2));
  console.log(`BlogCategory: ${cats.length} kayıt yedeklendi`);

  // 3. BlogPostCategory tablosu
  const postCats = await prisma.blogPostCategory.findMany();
  fs.writeFileSync(path.join(backupDir, "blog_post_categories.json"), JSON.stringify(postCats, null, 2));
  console.log(`BlogPostCategory: ${postCats.length} kayıt yedeklendi`);

  // 4. FAQ tablosu (blog ilişkili)
  const faqs = await prisma.faq.findMany({ where: { blogPostId: { not: null } } });
  fs.writeFileSync(path.join(backupDir, "blog_faqs.json"), JSON.stringify(faqs, null, 2));
  console.log(`FAQ (blog): ${faqs.length} kayıt yedeklendi`);

  console.log(`\nBACKUP TAMAMLANDI: ${backupDir}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
