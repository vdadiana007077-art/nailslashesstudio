import "dotenv/config";
import { prisma } from "./src/lib/prisma";

const missingTranslations = [
  {
    serviceId: "8d446b08-b438-464b-82b6-e46af39cddc9",
    translations: [
      { language: "EN", name: "Basic Manicure", slug: "basic-manicure", description: "Basic manicure is a practical care application that ensures nails are cleaned, shaped, and completed with basic hand care steps. Ideal for clients seeking a natural and well-groomed look." },
      { language: "DE", name: "Einfache Maniküre", slug: "einfache-manikuere", description: "Die einfache Maniküre ist eine praktische Pflegeanwendung, bei der die Nägel gereinigt, in Form gebracht und mit grundlegenden Handpflegeschritten abgeschlossen werden. Ideal für Kunden, die einen natürlichen und gepflegten Look wünschen." },
      { language: "RU", name: "Базовый маникюр", slug: "bazovyy-manikyur", description: "Базовый маникюр - это практичная процедура ухода, которая включает очистку, придание формы ногтям и базовый уход за руками. Идеально подходит для клиентов, предпочитающих естественный и ухоженный вид." }
    ]
  },
  {
    serviceId: "ed7d5865-93a1-471e-a63a-5177636c794a",
    translations: [
      { language: "EN", name: "Basic Pedicure", slug: "basic-pedicure", description: "Basic pedicure offers a healthier and more well-groomed appearance by shaping and cleaning toenails and applying basic care procedures." },
      { language: "DE", name: "Einfache Pediküre", slug: "einfache-pedikuere", description: "Die einfache Pediküre bietet ein gesünderes und gepflegteres Aussehen durch Formen und Reinigen der Zehennägel sowie die Anwendung grundlegender Pflegeverfahren." },
      { language: "RU", name: "Базовый педикюр", slug: "bazovyy-pedikyur", description: "Базовый педикюр обеспечивает здоровый и ухоженный вид благодаря приданию формы и очистке ногтей на ногах, а также применению базовых процедур ухода." }
    ]
  },
  {
    serviceId: "4df8c987-4b99-4802-853d-5d994f8f0c6b",
    translations: [
      { language: "EN", name: "Manicure + Gel Polish", slug: "manicure-gel-polish", description: "Manicure and gel polish application combines nail care with a long-lasting, shiny, and aesthetic look. Suitable for clients who want practicality and an elegant appearance in their daily lives." },
      { language: "DE", name: "Maniküre + Shellac", slug: "manikuere-shellac", description: "Maniküre und Shellac-Anwendung kombinieren Nagelpflege mit einem lang anhaltenden, glänzenden und ästhetischen Look. Geeignet für Kunden, die im Alltag auf Praktikabilität und ein elegantes Erscheinungsbild Wert legen." },
      { language: "RU", name: "Маникюр + Гель-лак", slug: "manikyur-gel-lak", description: "Маникюр и покрытие гель-лаком сочетают в себе уход за ногтями с долговечным, блестящим и эстетичным видом. Подходит для клиентов, которые ценят практичность и элегантность в повседневной жизни." }
    ]
  },
  {
    serviceId: "b3aafcc6-9296-4492-b855-1e910b2d58ad",
    translations: [
      { language: "EN", name: "Pedicure + Gel Polish", slug: "pedicure-gel-polish", description: "Pedicure and gel polish service completes foot care with an aesthetic and long-lasting color appearance. It is a comfortable application especially preferred during summer months and holidays." },
      { language: "DE", name: "Pediküre + Shellac", slug: "pedikuere-shellac", description: "Pediküre und Shellac vervollständigen die Fußpflege mit einem ästhetischen und lang anhaltenden Farbergebnis. Es ist eine komfortable Anwendung, die besonders in den Sommermonaten und im Urlaub bevorzugt wird." },
      { language: "RU", name: "Педикюр + Гель-лак", slug: "pedikyur-gel-lak", description: "Педикюр и покрытие гель-лаком дополняют уход за ногами эстетичным и стойким цветом. Это комфортная процедура, особенно популярная в летние месяцы и период отпусков." }
    ]
  },
  {
    serviceId: "0f767206-2690-416a-a3e0-f3223d4b19c8",
    translations: [
      { language: "EN", name: "Manicure + Gel Strengthening", slug: "manicure-gel-strengthening", description: "Manicure and gel strengthening application helps natural nails look more durable, smooth, and well-groomed. It is an aesthetic and protective option for nails prone to breakage." },
      { language: "DE", name: "Maniküre + Gelverstärkung", slug: "manikuere-gelverstaerkung", description: "Maniküre und Gelverstärkung helfen natürlichen Nägeln, widerstandsfähiger, glatter und gepflegter auszusehen. Es ist eine ästhetische und schützende Option für Nägel, die zum Brechen neigen." },
      { language: "RU", name: "Маникюр + Укрепление гелем", slug: "manikyur-ukreplenie-gelem", description: "Маникюр и укрепление гелем помогают натуральным ногтям выглядеть более прочными, гладкими и ухоженными. Это эстетичный и защитный вариант для ногтей, склонных к ломкости." }
    ]
  },
  {
    serviceId: "728672f3-e192-4a24-a4a5-f15dd581aba0",
    translations: [
      { language: "EN", name: "Pedicure + Gel Strengthening", slug: "pedicure-gel-strengthening", description: "Pedicure and gel strengthening service provides a smoother, durable, and well-groomed appearance on toenails. Suitable for clients seeking long-term aesthetic results." },
      { language: "DE", name: "Pediküre + Gelverstärkung", slug: "pedikuere-gelverstaerkung", description: "Pediküre und Gelverstärkung sorgen für ein glatteres, widerstandsfähiges und gepflegtes Aussehen der Zehennägel. Geeignet für Kunden, die langfristige ästhetische Ergebnisse wünschen." },
      { language: "RU", name: "Педикюр + Укрепление гелем", slug: "pedikyur-ukreplenie-gelem", description: "Педикюр и укрепление гелем обеспечивают гладкий, прочный и ухоженный вид ногтей на ногах. Подходит для клиентов, ищущих долгосрочные эстетические результаты." }
    ]
  },
  {
    serviceId: "fb4c00dc-91af-4d14-9ae4-3c2d9d0451e9",
    translations: [
      { language: "EN", name: "Classic Silk Lashes", slug: "classic-silk-lashes", description: "Classic silk lash application is ideal for clients who want more prominent and aesthetic lashes without giving up a natural look. It offers a simple and elegant result suitable for daily use." },
      { language: "DE", name: "Klassische Wimpernverlängerung (1:1)", slug: "klassische-wimpernverlaengerung", description: "Die klassische Wimpernverlängerung ist ideal für Kunden, die markantere und ästhetische Wimpern wünschen, ohne auf ein natürliches Aussehen zu verzichten. Sie bietet ein einfaches und elegantes Ergebnis für den Alltag." },
      { language: "RU", name: "Классическое наращивание ресниц", slug: "klassicheskoe-naraschivanie-resnits", description: "Классическое наращивание ресниц идеально подходит для клиентов, которые хотят более выразительные и эстетичные ресницы, не отказываясь от естественного вида. Обеспечивает простой и элегантный результат на каждый день." }
    ]
  },
  {
    serviceId: "d4e19dbd-a2a2-4429-8d76-7f431d9f456a",
    translations: [
      { language: "EN", name: "Medium Volume Silk Lashes", slug: "medium-volume-silk-lashes", description: "Medium volume silk lashes offer a fuller and more prominent look compared to the classic application. It is a balanced option for both daily use and those who want a more striking lash effect." },
      { language: "DE", name: "Medium Volumen Wimpernverlängerung", slug: "medium-volumen-wimpernverlaengerung", description: "Die Medium Volumen Wimpernverlängerung bietet im Vergleich zur klassischen Anwendung ein volleres und markanteres Aussehen. Sie ist eine ausgewogene Option für den Alltag und für diejenigen, die einen auffälligeren Wimperneffekt wünschen." },
      { language: "RU", name: "Наращивание ресниц Средний объем", slug: "sredniy-obyem-naraschivanie-resnits", description: "Наращивание ресниц среднего объема предлагает более густой и выразительный вид по сравнению с классикой. Это сбалансированный вариант как для повседневного использования, так и для тех, кто хочет более яркий эффект." }
    ]
  },
  {
    serviceId: "48ffbc9e-adfa-4778-8b02-8472395051d4",
    translations: [
      { language: "EN", name: "Mega Volume Silk Lashes", slug: "mega-volume-silk-lashes", description: "Mega volume silk lash application is designed for clients who want an intense and stunning lash look. It is a powerful option for special occasions, photoshoots, or those who want prominent looks." },
      { language: "DE", name: "Mega Volumen Wimpernverlängerung", slug: "mega-volumen-wimpernverlaengerung", description: "Die Mega Volumen Wimpernverlängerung ist für Kunden konzipiert, die einen intensiven und atemberaubenden Wimpern-Look wünschen. Sie ist eine starke Option für besondere Anlässe, Fotoshootings oder markante Blicke." },
      { language: "RU", name: "Наращивание ресниц Мега объем", slug: "mega-obyem-naraschivanie-resnits", description: "Мега-объемное наращивание ресниц создано для клиентов, желающих получить густой и потрясающий вид ресниц. Это отличный выбор для особых случаев, фотосессий или выразительного взгляда." }
    ]
  },
  {
    serviceId: "1b8f2e78-ea55-46ec-a1f1-84639865db08",
    translations: [
      { language: "EN", name: "Eyebrow Shaping + Lifting + Tinting", slug: "eyebrow-shaping-lifting-tinting", description: "Eyebrow shaping, lifting, and tinting ensure eyebrows look more organized, prominent, and harmonious with facial features. Suitable for clients who want a natural yet effective eyebrow design." },
      { language: "DE", name: "Augenbrauen zupfen + Lifting + Färben", slug: "augenbrauen-lifting-faerben", description: "Augenbrauen zupfen, Lifting und Färben sorgen dafür, dass die Augenbrauen organisierter, markanter und harmonischer mit den Gesichtszügen wirken. Geeignet für Kunden, die ein natürliches, aber effektives Augenbrauendesign wünschen." },
      { language: "RU", name: "Коррекция бровей + Ламинирование + Окрашивание", slug: "korrektsiya-brovey-laminirovanie-okrashivanie", description: "Коррекция бровей, ламинирование и окрашивание делают брови более ухоженными, выразительными и гармонирующими с чертами лица. Подходит для клиентов, желающих получить естественный, но эффектный дизайн бровей." }
    ]
  },
  {
    serviceId: "0285885a-de01-4eb2-855d-a4d2818f5d84",
    translations: [
      { language: "EN", name: "Lash Lifting + Tinting", slug: "lash-lifting-tinting", description: "Lash lifting and tinting is a care application that makes natural lashes look more lifted, prominent, and vibrant. Ideal for clients who do not want silk lashes but seek an effective look." },
      { language: "DE", name: "Wimpernlifting + Färben", slug: "wimpernlifting-faerben", description: "Wimpernlifting und Färben ist eine Pflegeanwendung, die natürliche Wimpern angehobener, markanter und lebendiger aussehen lässt. Ideal für Kunden, die keine Wimpernverlängerung wünschen, aber einen effektiven Look suchen." },
      { language: "RU", name: "Ламинирование ресниц + Окрашивание", slug: "laminirovanie-resnits-okrashivanie", description: "Ламинирование и окрашивание ресниц — это процедура ухода, которая делает натуральные ресницы более приподнятыми, выразительными и яркими. Идеально подходит для клиентов, которые не хотят наращивать ресницы, но ищут эффектный вид." }
    ]
  }
];

async function main() {
  for (const service of missingTranslations) {
    for (const t of service.translations) {
      await prisma.serviceTranslation.upsert({
        where: {
          serviceId_language: {
            serviceId: service.serviceId,
            language: t.language as any
          }
        },
        update: {
          name: t.name,
          slug: t.slug,
          description: t.description,
          seoTitle: t.name,
          seoDesc: t.description.substring(0, 160)
        },
        create: {
          serviceId: service.serviceId,
          language: t.language as any,
          name: t.name,
          slug: t.slug,
          description: t.description,
          seoTitle: t.name,
          seoDesc: t.description.substring(0, 160)
        }
      });
    }
  }
  console.log("All missing translations inserted successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
