require("dotenv").config({ path: ".env" });
process.env.DATABASE_URL = process.env.DIRECT_URL;
const { prisma } = require('../src/lib/prisma');

const faqs = [
  // BLOG 1
  { blogPostId: "260465c4-6ee1-4e26-9bb8-e00d91347cff", language: "EN", order: 1, question: "Why is loyalty important in beauty salons?", answer: "Consistency ensures the specialist understands your personal style, skin reactions, and preferences without you having to explain them every time." },
  { blogPostId: "260465c4-6ee1-4e26-9bb8-e00d91347cff", language: "EN", order: 2, question: "What makes Guzeloba salons special?", answer: "Guzeloba offers a close-knit community vibe, making beauty salons feel like a safe, familiar space rather than just a commercial business." },
  { blogPostId: "260465c4-6ee1-4e26-9bb8-e00d91347cff", language: "DE", order: 1, question: "Warum ist Treue in Kosmetikstudios wichtig?", answer: "Beständigkeit stellt sicher, dass der Experte Ihren persönlichen Stil und Ihre Vorlieben kennt, ohne dass Sie sich jedes Mal neu erklären müssen." },
  { blogPostId: "260465c4-6ee1-4e26-9bb8-e00d91347cff", language: "DE", order: 2, question: "Was macht die Salons in Guzeloba besonders?", answer: "Guzeloba bietet eine enge Gemeinschaftsatmosphäre, wodurch sich Kosmetikstudios eher wie ein vertrauter Raum als ein rein kommerzielles Geschäft anfühlen." },
  { blogPostId: "260465c4-6ee1-4e26-9bb8-e00d91347cff", language: "RU", order: 1, question: "Почему преданность важна в салонах красоты?", answer: "Постоянство гарантирует, что специалист понимает ваш личный стиль, реакцию кожи и предпочтения без необходимости каждый раз объяснять их." },
  { blogPostId: "260465c4-6ee1-4e26-9bb8-e00d91347cff", language: "RU", order: 2, question: "Что делает салоны Гюзелоба особенными?", answer: "Гюзелоба предлагает атмосферу сплоченного сообщества, благодаря чему салоны красоты воспринимаются как безопасное, знакомое пространство." },

  // BLOG 2
  { blogPostId: "55054c9d-3c45-4a6a-ba03-47a61e4e649c", language: "EN", order: 1, question: "How does the Mediterranean climate affect beauty routines?", answer: "High humidity and sun require lightweight, long-lasting products. Heavy makeup melts quickly, leading to a preference for structural, permanent touches." },
  { blogPostId: "55054c9d-3c45-4a6a-ba03-47a61e4e649c", language: "EN", order: 2, question: "What is the core of Antalya's beauty standard?", answer: "Effortless, natural glowing skin that looks perfect whether you're at the beach or a dinner party." },
  { blogPostId: "55054c9d-3c45-4a6a-ba03-47a61e4e649c", language: "DE", order: 1, question: "Wie beeinflusst das mediterrane Klima die Beauty-Routinen?", answer: "Hohe Luftfeuchtigkeit erfordert leichte, lang anhaltende Produkte. Starkes Make-up schmilzt schnell, was zu einer Vorliebe für permanente Berührungen führt." },
  { blogPostId: "55054c9d-3c45-4a6a-ba03-47a61e4e649c", language: "DE", order: 2, question: "Was ist der Kern des Schönheitsstandards in Antalya?", answer: "Mühelose, natürlich strahlende Haut, die perfekt aussieht, egal ob am Strand oder auf einer Party." },
  { blogPostId: "55054c9d-3c45-4a6a-ba03-47a61e4e649c", language: "RU", order: 1, question: "Как средиземноморский климат влияет на уход за собой?", answer: "Высокая влажность требует легких и стойких продуктов. Плотный макияж быстро тает, поэтому предпочтение отдается перманентным процедурам." },
  { blogPostId: "55054c9d-3c45-4a6a-ba03-47a61e4e649c", language: "RU", order: 2, question: "В чем суть стандарта красоты Анталии?", answer: "Легкая, естественно сияющая кожа, которая выглядит идеально, находитесь ли вы на пляже или на ужине." },

  // BLOG 3
  { blogPostId: "2ef65724-d6fe-43bb-83b1-591f9299d5e8", language: "EN", order: 1, question: "How does the Antalya climate affect eyelash extensions?", answer: "High humidity accelerates the curing process of the adhesive. Without professional climate control in the studio, lashes can become brittle and fall off prematurely." },
  { blogPostId: "2ef65724-d6fe-43bb-83b1-591f9299d5e8", language: "EN", order: 2, question: "What is lash mapping?", answer: "Lash mapping is a custom design process that considers your eye shape, bone structure, and natural lash direction to create the most flattering extension style." },
  { blogPostId: "2ef65724-d6fe-43bb-83b1-591f9299d5e8", language: "DE", order: 1, question: "Wie wirkt sich das Klima in Antalya auf Wimpernverlängerungen aus?", answer: "Hohe Luftfeuchtigkeit beschleunigt den Aushärtungsprozess des Klebers. Ohne professionelle Klimakontrolle im Studio können die Wimpern brüchig werden und vorzeitig ausfallen." },
  { blogPostId: "2ef65724-d6fe-43bb-83b1-591f9299d5e8", language: "DE", order: 2, question: "Was ist Lash Mapping?", answer: "Lash Mapping ist ein individueller Designprozess, der Ihre Augenform, Knochenstruktur und die natürliche Wimpernwuchsrichtung berücksichtigt, um den schmeichelhaftesten Stil zu kreieren." },
  { blogPostId: "2ef65724-d6fe-43bb-83b1-591f9299d5e8", language: "RU", order: 1, question: "Как климат Анталии влияет на наращивание ресниц?", answer: "Высокая влажность ускоряет процесс отвердения клея. Без профессионального климат-контроля в студии ресницы могут стать хрупкими и преждевременно выпасть." },
  { blogPostId: "2ef65724-d6fe-43bb-83b1-591f9299d5e8", language: "RU", order: 2, question: "Что такое Lash Mapping?", answer: "Lash mapping — это процесс индивидуального дизайна, учитывающий форму ваших глаз, структуру костей и направление роста натуральных ресниц для создания идеального стиля." }
];

async function insertFaqs() {
  for (const f of faqs) {
    const exists = await prisma.faq.findFirst({
      where: { blogPostId: f.blogPostId, language: f.language, question: f.question }
    });
    if (!exists) {
      await prisma.faq.create({ data: f });
      console.log("✅ Added FAQ:", f.question);
    }
  }
  await prisma.$disconnect();
}
insertFaqs();
