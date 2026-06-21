require("dotenv").config({ path: ".env" });
process.env.DATABASE_URL = process.env.DIRECT_URL;
const { prisma } = require('../src/lib/prisma');

async function main() {
  const post = await prisma.blogPost.findFirst({
    where: { translations: { some: { slug: 'biab-tirnak-antalya' } } },
    include: { faqs: true }
  });
  
  if (!post) {
    console.log("Post not found.");
    return;
  }

  const answersMap = {
    "BIAB ile protez tırnak aynı şey midir?": "Hayır, BIAB (Builder in a Bottle) kendi tırnağınızın üzerine uygulanan besleyici ve güçlendirici bir jeldir. Protez tırnak gibi yapay bir uzatma işlemi değildir, tırnağın doğal uzamasını destekler.",
    "BIAB kaç hafta dayanır?": "Doğru uygulama ve düzenli bakım ile BIAB tırnaklar ortalama 3 ile 4 hafta arasında dayanıklılığını korur. Tırnak uzama hızınıza göre bu süre değişebilir.",
    "BIAB üzerine renk uygulanabilir mi?": "Evet, kesinlikle! BIAB üzerine istediğiniz renk kalıcı oje uygulanabilir veya doğal nude tonlarında bırakılarak şeffaf/parlatıcı ile kullanılabilir.",
    "BIAB tırnak kırılmasını engeller mi?": "Evet, BIAB tırnak üzerinde esnek fakat çok güçlü bir koruyucu katman oluşturur. Bu sayede ince, zayıf ve kolay kırılan tırnakların kırılmasını büyük ölçüde engeller.",
    "BIAB doğal görünür mü?": "BIAB, yapısı gereği tırnağınızın doğal formuna tam uyum sağlar. Kalın veya kaba durmaz, kendi tırnağınız gibi oldukça doğal ve estetik bir görünüme sahiptir.",
    "BIAB sonrası bakım gerekir mi?": "BIAB uygulamasından sonra tırnak eti yağı (cuticle oil) kullanmak ve aşırı kimyasallardan kaçınmak (eldiven kullanımı gibi) tırnak sağlığınızı ve işlemin ömrünü uzatır.",
    "Deniz ve havuz BIAB'a zarar verir mi?": "Kısa süreli deniz ve havuz aktiviteleri BIAB uygulamasına zarar vermez. Ancak sürekli olarak sıcak suya ve klora maruz kalmak zamanla kalıcılığı azaltabilir.",
    "BIAB ince tırnaklar için uygun mudur?": "BIAB özellikle ince, yıpranmış ve uzamayan tırnaklar için en ideal uygulamadır. Tırnak yüzeyini güçlendirerek kırılmadan sağlıklı bir şekilde uzamalarına yardımcı olur.",
    "BIAB çıkarılırken tırnağa zarar verir mi?": "Uzman bir teknisyen tarafından profesyonel solüsyonlar veya cihazlar (frezeler) ile doğru teknikle çıkarıldığında BIAB doğal tırnağınıza hiçbir zarar vermez.",
    "Antalya'da BIAB neden bu kadar popüler?": "Antalya'nın sıcak, deniz ve havuz odaklı yaşam tarzı, uzun ömürlü ve dayanıklı tırnaklara ihtiyacı artırmaktadır. BIAB hem estetik hem de dayanıklı olduğu için çok tercih edilmektedir."
  };

  for (const faq of post.faqs) {
    if (faq.language === 'TR') {
      const answer = answersMap[faq.question];
      if (answer) {
        await prisma.faq.update({
          where: { id: faq.id },
          data: { answer: answer }
        });
        console.log('✅ Güncellendi: ' + faq.question);
      }
    }
  }

  console.log("FAQ cevapları başarıyla eklendi.");
  await prisma.$disconnect();
}
main().catch(console.error);
