require("dotenv").config({ path: ".env" });
process.env.DATABASE_URL = process.env.DIRECT_URL;
const { prisma } = require('../src/lib/prisma');

async function main() {
  const translations = [
    // -------------------------------------------------------------
    // BLOG 7: kalici-oje-antalya (bf65513d-0829-4640-bc0d-96fa59ea6d64)
    // -------------------------------------------------------------
    {
      blogPostId: 'bf65513d-0829-4640-bc0d-96fa59ea6d64',
      language: 'EN',
      title: 'Gel Polish in Antalya: Sun, Sea, and Long-Lasting Care',
      slug: 'gel-polish-antalya-guide',
      seoTitle: 'Gel Polish in Antalya: Long-Lasting Nails for the Beach',
      seoDesc: 'Discover why gel polish is the best choice for your Antalya vacation. Learn how to protect your manicure from sun, saltwater, and sand.',
      ogTitle: 'The Ultimate Guide to Gel Polish in Antalya',
      ogDesc: 'Keep your nails looking flawless during your holiday in Antalya. Everything you need to know about gel polish and aftercare.',
      excerpt: 'Discover why gel polish is the best choice for your Antalya vacation and learn how to protect your manicure from sun, saltwater, and sand.',
      content: `<h2>The Perfect Holiday Manicure</h2>
<p>When you are in a sunny, coastal city like Antalya, the last thing you want to worry about is your nail polish chipping. Between the salty Mediterranean sea, chlorinated pools, and constant sunshine, regular nail polish doesn't stand a chance. This is why gel polish (often referred to as Kalıcı Oje in Turkey) has become an absolute necessity for locals and tourists alike.</p>
<h2>How Gel Polish Withstands the Beach</h2>
<p>Gel polish is cured under a UV or LED lamp, creating a hard, durable layer over your natural nails. Unlike traditional polish that can soften in water or fade under the harsh sun, a high-quality gel manicure in Antalya will remain glossy and intact for up to 3 weeks. It provides a protective barrier, preventing your nails from peeling or breaking while you enjoy your beach activities.</p>
<h2>Choosing the Right Color for Antalya</h2>
<p>The vibrant energy of Antalya calls for fun, bright colors. Pastel shades, neon pinks, and classic bright reds are incredibly popular during the summer months. However, it is important to note that prolonged exposure to direct sunlight can sometimes cause certain neon or white gel polishes to slightly yellow. A professional nail technician will apply a high-quality UV-blocking top coat to ensure your color stays crisp and vibrant.</p>
<h2>Aftercare Tips for Long-Lasting Results</h2>
<p>While gel polish is incredibly durable, a little extra care goes a long way. After a long day at Lara Beach or swimming in a pool, make sure to rinse your hands with fresh water to remove salt and chlorine residue. Apply cuticle oil every night before bed to keep your skin hydrated and prevent the gel from lifting at the edges. By following these simple steps, your holiday manicure will look freshly done until it is time for a refill.</p>`
    },
    {
      blogPostId: 'bf65513d-0829-4640-bc0d-96fa59ea6d64',
      language: 'DE',
      title: 'Gel-Lack in Antalya: Sonne, Meer und lang anhaltende Pflege',
      slug: 'gel-lack-antalya-ratgeber',
      seoTitle: 'Gel-Lack in Antalya: Langanhaltende Nägel für den Strand',
      seoDesc: 'Entdecken Sie, warum Gel-Lack die beste Wahl für Ihren Urlaub in Antalya ist. Schützen Sie Ihre Maniküre vor Sonne, Salzwasser und Sand.',
      ogTitle: 'Der ultimative Leitfaden für Gel-Lack in Antalya',
      ogDesc: 'Behalten Sie makellose Nägel während Ihres Urlaubs in Antalya. Alles, was Sie über Gel-Lack und Pflege wissen müssen.',
      excerpt: 'Entdecken Sie, warum Gel-Lack die beste Wahl für Ihren Urlaub in Antalya ist und schützen Sie Ihre Maniküre vor Sonne, Salzwasser und Sand.',
      content: `<h2>Die perfekte Urlaubsmaniküre</h2>
<p>Wenn Sie sich in einer sonnigen Küstenstadt wie Antalya befinden, ist abblätternder Nagellack das Letzte, worüber Sie sich Sorgen machen möchten. Zwischen dem salzigen Mittelmeer, gechlorten Pools und ständigem Sonnenschein hat normaler Nagellack keine Chance. Aus diesem Grund ist Gel-Lack (in der Türkei oft als Kalıcı Oje bezeichnet) für Einheimische und Touristen gleichermaßen zu einer absoluten Notwendigkeit geworden.</p>
<h2>Wie Gel-Lack dem Strand standhält</h2>
<p>Gel-Lack wird unter einer UV- oder LED-Lampe ausgehärtet und bildet eine harte, dauerhafte Schicht über Ihren Naturnägeln. Im Gegensatz zu herkömmlichem Lack, der im Wasser weich werden oder unter der grellen Sonne verblassen kann, bleibt eine hochwertige Gel-Maniküre in Antalya bis zu 3 Wochen lang glänzend und intakt. Sie bietet eine Schutzbarriere und verhindert, dass Ihre Nägel splittern oder brechen, während Sie Ihre Strandaktivitäten genießen.</p>
<h2>Die richtige Farbwahl für Antalya</h2>
<p>Die pulsierende Energie von Antalya verlangt nach lustigen, leuchtenden Farben. Pastelltöne, Neon-Pink und klassisches leuchtendes Rot sind in den Sommermonaten unglaublich beliebt. Es ist jedoch wichtig zu beachten, dass längere direkte Sonneneinstrahlung manchmal dazu führen kann, dass bestimmte Neon- oder weiße Gel-Lacke leicht vergilben. Ein professioneller Nageltechniker trägt einen hochwertigen UV-blockierenden Überlack auf, um sicherzustellen, dass Ihre Farbe klar und lebendig bleibt.</p>
<h2>Pflegetipps für langanhaltende Ergebnisse</h2>
<p>Obwohl Gel-Lack unglaublich haltbar ist, ist ein wenig zusätzliche Pflege sehr hilfreich. Spülen Sie Ihre Hände nach einem langen Tag am Lara Beach oder nach dem Schwimmen im Pool mit Süßwasser ab, um Salz- und Chlorrückstände zu entfernen. Tragen Sie jeden Abend vor dem Schlafengehen Nagelöl auf, um Ihre Haut mit Feuchtigkeit zu versorgen und ein Abheben des Gels an den Rändern zu verhindern.</p>`
    },
    {
      blogPostId: 'bf65513d-0829-4640-bc0d-96fa59ea6d64',
      language: 'RU',
      title: 'Гель-лак в Анталии: Солнце, море и стойкий уход',
      slug: 'gel-lak-antalya-gid',
      seoTitle: 'Гель-лак в Анталии: Идеальный маникюр для отпуска на море',
      seoDesc: 'Узнайте, почему гель-лак — лучший выбор для отпуска в Анталии. Советы по защите маникюра от солнца, соленой воды и песка.',
      ogTitle: 'Полное руководство по гель-лаку в Анталии',
      ogDesc: 'Сохраните идеальный маникюр во время отпуска в Анталии. Все, что вам нужно знать о гель-лаке и правильном уходе.',
      excerpt: 'Узнайте, почему гель-лак — лучший выбор для отпуска в Анталии, и как защитить маникюр от солнца, соленой воды и песка.',
      content: `<h2>Идеальный маникюр для отпуска</h2>
<p>Когда вы находитесь в таком солнечном прибрежном городе, как Анталия, отслаивающийся лак для ногтей — это последнее, о чем хочется думать. Соленое Средиземное море, хлорированные бассейны и постоянное солнце не оставляют шансов обычному лаку. Именно поэтому гель-лак (часто называемый в Турции Kalıcı Oje) стал абсолютной необходимостью как для местных жителей, так и для туристов.</p>
<h2>Как гель-лак выдерживает пляж</h2>
<p>Гель-лак сушится под УФ- или LED-лампой, создавая твердое, прочное покрытие на натуральных ногтях. В отличие от традиционного лака, который может размягчиться в воде или выцвести на ярком солнце, качественный гель-маникюр в Анталии остается глянцевым и безупречным до 3 недель. Он создает защитный барьер, предотвращая слоение или поломку ногтей во время активного отдыха на пляже.</p>
<h2>Выбор правильного цвета для Анталии</h2>
<p>Яркая энергетика Анталии требует веселых, сочных оттенков. Пастельные тона, неоново-розовый и классический ярко-красный невероятно популярны в летние месяцы. Однако важно отметить, что длительное воздействие прямых солнечных лучей может вызвать легкое пожелтение некоторых неоновых или белых гель-лаков. Профессиональный мастер обязательно нанесет высококачественное финишное покрытие с УФ-фильтром, чтобы цвет оставался чистым и ярким.</p>
<h2>Советы по уходу для стойкого результата</h2>
<p>Хотя гель-лак невероятно долговечен, немного дополнительного ухода не повредит. После долгого дня на пляже Лара или купания в бассейне обязательно ополосните руки пресной водой, чтобы удалить остатки соли и хлора. Каждую ночь перед сном наносите масло для кутикулы, чтобы кожа оставалась увлажненной, а гель не отслаивался по краям.</p>`
    },

    // -------------------------------------------------------------
    // BLOG 8: guzeloba-nail-studio (cd35c3d1-4db3-494e-82fc-6f1deff569dd)
    // -------------------------------------------------------------
    {
      blogPostId: 'cd35c3d1-4db3-494e-82fc-6f1deff569dd',
      language: 'EN',
      title: 'Why Location Matters When Choosing a Nail Studio in Guzeloba',
      slug: 'guzeloba-nail-studio-location',
      seoTitle: 'Nail Studio in Guzeloba: Why Location is Crucial for Your Beauty Needs',
      seoDesc: 'Looking for a nail studio in Guzeloba? Discover why choosing a conveniently located salon saves you time, reduces stress, and ensures regular maintenance.',
      ogTitle: 'Finding the Best Nail Studio in Guzeloba',
      ogDesc: 'Learn why the location of your beauty salon in Guzeloba is just as important as the quality of service. Book your appointment today.',
      excerpt: 'Discover why choosing a conveniently located nail studio in Guzeloba saves you time, reduces stress, and ensures regular nail maintenance.',
      content: `<h2>The Importance of Convenience</h2>
<p>When searching for a nail studio in Guzeloba, many people focus entirely on the quality of nail art or the price list. While these factors are undeniably important, the physical location of the salon plays a surprisingly crucial role in your overall experience and long-term nail health. Guzeloba is a bustling, expansive neighborhood in Antalya, and navigating traffic just for a manicure can quickly turn a relaxing treat into a stressful chore.</p>
<h2>Consistency in Nail Care</h2>
<p>Beautiful, healthy nails require consistency. Whether you get BIAB, gel polish, or acrylics, you need to visit your nail technician every 3 to 4 weeks for maintenance and refills. If your chosen nail studio is located far away or in an area with terrible parking, you are much more likely to delay your appointments. Delaying a refill can lead to overgrown, imbalanced nails which are prone to painful breaking and lifting.</p>
<h2>A Stress-Free Beauty Day</h2>
<p>Going to a beauty salon should be a moment of self-care and relaxation. A centrally located nail studio in Guzeloba allows you to seamlessly integrate your beauty routine into your daily life. You can drop by after grabbing a coffee, during a lunch break, or while running errands. Easy access and available parking mean you arrive at your appointment calm and ready to be pampered, rather than flustered from a difficult commute.</p>
<h2>Building a Relationship with Your Local Salon</h2>
<p>Choosing a neighborhood salon fosters a sense of community. When you frequent a local Guzeloba nail studio, the staff gets to know you, your style preferences, and the specific needs of your natural nails. This ongoing relationship leads to better, more personalized service, ensuring that every visit leaves you feeling confident and beautiful.</p>`
    },
    {
      blogPostId: 'cd35c3d1-4db3-494e-82fc-6f1deff569dd',
      language: 'DE',
      title: 'Warum der Standort bei der Wahl eines Nagelstudios in Guzeloba wichtig ist',
      slug: 'guzeloba-nagelstudio-standort',
      seoTitle: 'Nagelstudio in Guzeloba: Warum der Standort entscheidend ist',
      seoDesc: 'Suchen Sie ein Nagelstudio in Guzeloba? Entdecken Sie, warum ein günstig gelegener Salon Zeit spart, Stress reduziert und regelmäßige Pflege gewährleistet.',
      ogTitle: 'Das beste Nagelstudio in Guzeloba finden',
      ogDesc: 'Erfahren Sie, warum der Standort Ihres Kosmetikstudios in Guzeloba genauso wichtig ist wie die Servicequalität. Buchen Sie noch heute.',
      excerpt: 'Entdecken Sie, warum ein günstig gelegenes Nagelstudio in Guzeloba Zeit spart, Stress reduziert und eine regelmäßige Nagelpflege gewährleistet.',
      content: `<h2>Die Bedeutung der Bequemlichkeit</h2>
<p>Bei der Suche nach einem Nagelstudio in Guzeloba konzentrieren sich viele Menschen ausschließlich auf die Qualität der Nail Art oder die Preisliste. Obwohl diese Faktoren unbestreitbar wichtig sind, spielt der physische Standort des Salons eine überraschend entscheidende Rolle für Ihr Gesamterlebnis und die langfristige Gesundheit Ihrer Nägel. Guzeloba ist ein belebtes, weitläufiges Viertel in Antalya, und der Umgang mit dem Verkehr nur für eine Maniküre kann eine entspannende Behandlung schnell in eine stressige Pflicht verwandeln.</p>
<h2>Beständigkeit in der Nagelpflege</h2>
<p>Schöne, gesunde Nägel erfordern Beständigkeit. Egal, ob Sie BIAB, Gel-Lack oder Acryl bekommen, Sie müssen Ihren Nageltechniker alle 3 bis 4 Wochen zur Pflege und zum Auffüllen besuchen. Wenn das von Ihnen gewählte Nagelstudio weit entfernt ist oder sich in einer Gegend mit schrecklichen Parkmöglichkeiten befindet, werden Sie Ihre Termine viel eher aufschieben. Das Aufschieben einer Auffüllung kann zu herausgewachsenen, unausgeglichenen Nägeln führen, die anfällig für schmerzhaftes Brechen und Abheben sind.</p>
<h2>Ein stressfreier Beauty-Tag</h2>
<p>Der Besuch in einem Kosmetikstudio sollte ein Moment der Selbstpflege und Entspannung sein. Ein zentral gelegenes Nagelstudio in Guzeloba ermöglicht es Ihnen, Ihre Beauty-Routine nahtlos in Ihren Alltag zu integrieren. Einfacher Zugang und verfügbare Parkplätze bedeuten, dass Sie ruhig und bereit zum Verwöhnen zu Ihrem Termin ankommen, anstatt nach einem schwierigen Arbeitsweg aufgeregt zu sein.</p>
<h2>Aufbau einer Beziehung zu Ihrem lokalen Salon</h2>
<p>Die Wahl eines Salons in der Nachbarschaft fördert das Gemeinschaftsgefühl. Wenn Sie häufig ein lokales Nagelstudio in Guzeloba besuchen, lernt das Personal Sie, Ihre Stilvorlieben und die spezifischen Bedürfnisse Ihrer Naturnägel kennen. Diese fortlaufende Beziehung führt zu einem besseren, personalisierteren Service, der sicherstellt, dass Sie sich nach jedem Besuch sicher und schön fühlen.</p>`
    },
    {
      blogPostId: 'cd35c3d1-4db3-494e-82fc-6f1deff569dd',
      language: 'RU',
      title: 'Почему расположение имеет значение при выборе маникюрного салона в Гюзелоба',
      slug: 'guzeloba-manikyur-salon-raspolozhenie',
      seoTitle: 'Маникюрный салон в Гюзелоба: Почему так важно удобное расположение',
      seoDesc: 'Ищете маникюрный салон в Гюзелоба? Узнайте, почему удобно расположенная студия экономит ваше время, снижает стресс и помогает поддерживать регулярный уход.',
      ogTitle: 'Как найти лучший маникюрный салон в Гюзелоба',
      ogDesc: 'Узнайте, почему расположение салона красоты в Гюзелоба так же важно, как и качество услуг. Запишитесь на прием сегодня.',
      excerpt: 'Узнайте, почему удобно расположенная маникюрная студия в Гюзелоба экономит время, снижает стресс и гарантирует регулярный уход за ногтями.',
      content: `<h2>Важность удобства</h2>
<p>При поиске маникюрного салона в Гюзелоба многие люди полностью сосредотачиваются на качестве дизайна ногтей или прайс-листе. Хотя эти факторы, несомненно, важны, физическое расположение салона играет удивительно важную роль в вашем общем впечатлении и долгосрочном здоровье ногтей. Гюзелоба — это шумный, обширный район в Анталии, и стояние в пробках только ради маникюра может быстро превратить расслабляющую процедуру в стрессовую рутину.</p>
<h2>Регулярность в уходе за ногтями</h2>
<p>Красивые и здоровые ногти требуют регулярности. Независимо от того, делаете ли вы покрытие BIAB, гель-лак или наращивание, вам нужно посещать мастера каждые 3-4 недели для коррекции. Если выбранная вами студия находится далеко или в районе с плохой парковкой, вы с гораздо большей вероятностью будете откладывать визиты. Откладывание коррекции приводит к перенашиванию материала, что чревато болезненными поломками и отслойками.</p>
<h2>День красоты без стресса</h2>
<p>Поход в салон красоты должен быть моментом заботы о себе и расслабления. Удачно расположенная маникюрная студия в Гюзелоба позволяет легко интегрировать бьюти-рутину в повседневную жизнь. Удобный подъезд и наличие парковки означают, что вы прибудете на прием спокойной и готовой к процедурам, а не уставшей от сложной дороги.</p>
<h2>Создание отношений с местным салоном</h2>
<p>Выбор салона по соседству способствует укреплению чувства общности. Когда вы часто посещаете местную студию маникюра в Гюзелоба, персонал узнает вас, ваши стилевые предпочтения и специфические особенности ваших натуральных ногтей. Это постоянное взаимодействие приводит к более качественному и индивидуальному обслуживанию.</p>`
    },

    // -------------------------------------------------------------
    // BLOG 9: kas-laminasyonu-lara (de1f1761-c8f8-4c77-9dea-da1160177228)
    // -------------------------------------------------------------
    {
      blogPostId: 'de1f1761-c8f8-4c77-9dea-da1160177228',
      language: 'EN',
      title: 'Why Brow Lamination is Becoming Popular in Lara',
      slug: 'brow-lamination-lara-trends',
      seoTitle: 'Brow Lamination in Lara: The Trend for Fuller, Thicker Eyebrows',
      seoDesc: 'Discover why Brow Lamination is the hottest beauty trend in Lara, Antalya. Learn how this treatment creates perfectly styled, fuller-looking eyebrows effortlessly.',
      ogTitle: 'Brow Lamination Lara: Achieve Perfectly Styled Brows',
      ogDesc: 'Say goodbye to unruly eyebrows. Find out everything about the Brow Lamination procedure in Lara, including benefits and aftercare.',
      excerpt: 'Discover why Brow Lamination is the hottest beauty trend in Lara, Antalya, and how it creates perfectly styled, fuller eyebrows effortlessly.',
      content: `<h2>The Rise of Fluffy Brows</h2>
<p>In recent years, the beauty standard has shifted from heavily drawn, perfectly arched eyebrows to a more natural, fluffy, and full look. In Lara, one of Antalya's most chic districts, Brow Lamination has quickly become the go-to treatment for achieving this coveted style. If you have unruly, thinning, or downward-growing eyebrow hairs, brow lamination acts like a "perm" for your brows, setting them in a uniform, upward direction.</p>
<h2>How Brow Lamination Works</h2>
<p>The procedure is non-invasive and completely painless. A certified technician in Lara will first apply a lifting cream that breaks down the bonds in the eyebrow hairs, allowing them to be manipulated into a new shape. Next, the hairs are brushed upward and set in place with a neutralizing solution. The final step often involves a nourishing keratin treatment and an optional brow tint to add depth and dimension. The entire process takes under an hour.</p>
<h2>The Perfect Match for the Antalya Lifestyle</h2>
<p>One of the main reasons Brow Lamination is so popular in Lara is its compatibility with the active, beach-oriented lifestyle of Antalya. Waking up with perfectly styled brows that don't wash off in the sea or melt under the summer sun is incredibly freeing. You can confidently skip the eyebrow gel and pencil in your morning makeup routine.</p>
<h2>Longevity and Aftercare</h2>
<p>A professional brow lamination can last anywhere from 4 to 8 weeks, depending on your natural hair growth cycle. To ensure the best results, it is crucial to keep your brows completely dry for the first 24 hours after the treatment. Afterward, you simply need to brush them into place every morning using a spoolie. Applying a hydrating brow serum nightly will keep the hairs healthy and prolong the lifting effect.</p>`
    },
    {
      blogPostId: 'de1f1761-c8f8-4c77-9dea-da1160177228',
      language: 'DE',
      title: 'Warum Brow Lifting in Lara immer beliebter wird',
      slug: 'brow-lifting-lara-trends',
      seoTitle: 'Brow Lifting in Lara: Der Trend für vollere, dickere Augenbrauen',
      seoDesc: 'Entdecken Sie, warum Brow Lifting der heißeste Beauty-Trend in Lara, Antalya, ist. Erfahren Sie, wie diese Behandlung perfekt gestylte Augenbrauen kreiert.',
      ogTitle: 'Brow Lifting Lara: Erreichen Sie perfekt gestylte Augenbrauen',
      ogDesc: 'Verabschieden Sie sich von widerspenstigen Augenbrauen. Erfahren Sie alles über das Brow Lifting in Lara, einschließlich Vorteile und Pflege.',
      excerpt: 'Entdecken Sie, warum Brow Lifting der heißeste Beauty-Trend in Lara, Antalya ist und wie diese Behandlung perfekt gestylte Augenbrauen kreiert.',
      content: `<h2>Der Aufstieg der flauschigen Augenbrauen</h2>
<p>In den letzten Jahren hat sich das Schönheitsideal von stark nachgezogenen, perfekt geschwungenen Augenbrauen hin zu einem natürlicheren, flauschigeren und volleren Look gewandelt. In Lara, einem der schicksten Viertel Antalyas, hat sich das Brow Lifting (Augenbrauenlaminierung) schnell zur bevorzugten Behandlung entwickelt, um diesen begehrten Stil zu erreichen. Wenn Sie widerspenstige, dünner werdende oder nach unten wachsende Augenbrauenhärchen haben, wirkt das Brow Lifting wie eine "Dauerwelle" für Ihre Brauen und fixiert sie in einer gleichmäßigen, nach oben gerichteten Richtung.</p>
<h2>Wie Brow Lifting funktioniert</h2>
<p>Das Verfahren ist nicht-invasiv und völlig schmerzfrei. Ein zertifizierter Techniker in Lara trägt zunächst eine Lifting-Creme auf, die die Verbindungen in den Augenbrauenhärchen aufbricht, so dass sie in eine neue Form gebracht werden können. Anschließend werden die Härchen nach oben gebürstet und mit einer neutralisierenden Lösung fixiert. Der letzte Schritt umfasst oft eine nährende Keratinbehandlung und eine optionale Augenbrauenfärbung, um Tiefe und Dimension hinzuzufügen. Der gesamte Prozess dauert weniger als eine Stunde.</p>
<h2>Die perfekte Ergänzung für den Antalya-Lifestyle</h2>
<p>Einer der Hauptgründe, warum Brow Lifting in Lara so beliebt ist, ist seine Kompatibilität mit dem aktiven, strandorientierten Lebensstil von Antalya. Mit perfekt gestylten Brauen aufzuwachen, die sich nicht im Meer abwaschen oder unter der Sommersonne schmelzen, ist unglaublich befreiend. Sie können Augenbrauengel und -stift in Ihrer morgendlichen Make-up-Routine getrost weglassen.</p>
<h2>Haltbarkeit und Pflege</h2>
<p>Ein professionelles Brow Lifting kann je nach Ihrem natürlichen Haarwachstumszyklus zwischen 4 und 8 Wochen halten. Um die besten Ergebnisse zu erzielen, ist es wichtig, Ihre Brauen in den ersten 24 Stunden nach der Behandlung absolut trocken zu halten. Danach müssen Sie sie nur noch jeden Morgen mit einem Bürstchen in Form bringen. Die abendliche Anwendung eines feuchtigkeitsspendenden Augenbrauenserums hält die Härchen gesund und verlängert den Lifting-Effekt.</p>`
    },
    {
      blogPostId: 'de1f1761-c8f8-4c77-9dea-da1160177228',
      language: 'RU',
      title: 'Почему ламинирование бровей набирает популярность в Ларе',
      slug: 'laminirovanie-brovey-lara-trendi',
      seoTitle: 'Ламинирование бровей в Ларе: Тренд на густые и ухоженные брови',
      seoDesc: 'Узнайте, почему ламинирование бровей — самый горячий бьюти-тренд в Ларе, Анталия. Как эта процедура без усилий создает идеально уложенные брови.',
      ogTitle: 'Ламинирование бровей Лара: Идеально уложенные брови',
      ogDesc: 'Попрощайтесь с непослушными бровями. Узнайте все о процедуре ламинирования бровей в Ларе, включая преимущества и уход.',
      excerpt: 'Узнайте, почему ламинирование бровей — самый горячий бьюти-тренд в Ларе, Анталия, и как процедура создает идеально уложенные брови.',
      content: `<h2>Тенденция на пушистые брови</h2>
<p>В последние годы стандарты красоты сместились от сильно прорисованных, идеально изогнутых бровей к более естественному, пушистоому и густому виду. В Ларе, одном из самых шикарных районов Анталии, ламинирование бровей быстро стало основной процедурой для достижения этого желанного стиля. Если у вас непослушные, истончающиеся или растущие вниз волоски, ламинирование действует как "химическая завивка", фиксируя их в едином направлении вверх.</p>
<h2>Как работает ламинирование бровей</h2>
<p>Процедура неинвазивна и совершенно безболезненна. Сертифицированный мастер в Ларе сначала наносит лифтинг-крем, который разрушает связи в волосках, позволяя придать им новую форму. Затем волоски зачесываются вверх и фиксируются нейтрализующим раствором. Последний шаг часто включает питательный кератиновый уход и опциональное окрашивание бровей для придания глубины. Весь процесс занимает менее часа.</p>
<h2>Идеально для образа жизни в Анталии</h2>
<p>Одна из главных причин популярности ламинирования бровей в Ларе — это совместимость с активным пляжным образом жизни Анталии. Просыпаться с идеально уложенными бровями, которые не смываются в море и не плавятся под летним солнцем, — это невероятное чувство свободы. Вы можете смело отказаться от геля и карандаша для бровей в своем утреннем макияже.</p>
<h2>Стойкость и уход</h2>
<p>Профессиональное ламинирование может держаться от 4 до 8 недель, в зависимости от цикла роста ваших волос. Для обеспечения наилучших результатов крайне важно сохранять брови абсолютно сухими в течение первых 24 часов после процедуры. В дальнейшем вам просто нужно каждое утро расчесывать их щеточкой. Нанесение увлажняющей сыворотки на ночь сохранит волоски здоровыми и продлит эффект лифтинга.</p>`
    }
  ];

  const faqs = [
    // BLOG 7
    { blogPostId: 'bf65513d-0829-4640-bc0d-96fa59ea6d64', language: 'EN', order: 1, question: 'Does gel polish ruin your natural nails?', answer: 'No, gel polish itself does not ruin nails. Damage is usually caused by improper removal, such as picking or peeling the gel off.' },
    { blogPostId: 'bf65513d-0829-4640-bc0d-96fa59ea6d64', language: 'EN', order: 2, question: 'Can I go to the beach immediately after getting gel polish in Antalya?', answer: 'Yes! Because gel polish is fully cured under a UV lamp, it is completely dry when you leave the salon. You can swim right away.' },
    { blogPostId: 'bf65513d-0829-4640-bc0d-96fa59ea6d64', language: 'DE', order: 1, question: 'Zerstört Gel-Lack die Naturnägel?', answer: 'Nein, Gel-Lack an sich ruiniert die Nägel nicht. Schäden entstehen meist durch unsachgemäße Entfernung, wie z.B. Abkratzen oder Abziehen.' },
    { blogPostId: 'bf65513d-0829-4640-bc0d-96fa59ea6d64', language: 'DE', order: 2, question: 'Kann ich sofort nach dem Gel-Lack in Antalya an den Strand gehen?', answer: 'Ja! Da der Gel-Lack unter einer UV-Lampe vollständig ausgehärtet wird, ist er sofort trocken. Sie können direkt schwimmen gehen.' },
    { blogPostId: 'bf65513d-0829-4640-bc0d-96fa59ea6d64', language: 'RU', order: 1, question: 'Портит ли гель-лак натуральные ногти?', answer: 'Нет, сам по себе гель-лак не портит ногти. Повреждения обычно вызваны неправильным снятием, например, отковыриванием.' },
    { blogPostId: 'bf65513d-0829-4640-bc0d-96fa59ea6d64', language: 'RU', order: 2, question: 'Можно ли идти на пляж сразу после нанесения гель-лака в Анталии?', answer: 'Да! Поскольку гель-лак полностью высыхает под УФ-лампой, вы можете сразу идти купаться.' },

    // BLOG 8
    { blogPostId: 'cd35c3d1-4db3-494e-82fc-6f1deff569dd', language: 'EN', order: 1, question: 'How often should I visit a nail studio?', answer: 'For most services like gel polish, BIAB, or acrylics, it is recommended to visit your nail technician every 3 to 4 weeks.' },
    { blogPostId: 'cd35c3d1-4db3-494e-82fc-6f1deff569dd', language: 'EN', order: 2, question: 'Is parking available at Guzeloba Nail Studios?', answer: 'While it depends on the specific salon, premium studios in Guzeloba usually offer convenient parking options for their clients.' },
    { blogPostId: 'cd35c3d1-4db3-494e-82fc-6f1deff569dd', language: 'DE', order: 1, question: 'Wie oft sollte ich ein Nagelstudio besuchen?', answer: 'Für die meisten Dienstleistungen wird empfohlen, Ihren Nageltechniker alle 3 bis 4 Wochen aufzusuchen.' },
    { blogPostId: 'cd35c3d1-4db3-494e-82fc-6f1deff569dd', language: 'DE', order: 2, question: 'Gibt es Parkplätze bei Nagelstudios in Guzeloba?', answer: 'Premium-Studios in Guzeloba bieten in der Regel bequeme Parkmöglichkeiten für ihre Kunden.' },
    { blogPostId: 'cd35c3d1-4db3-494e-82fc-6f1deff569dd', language: 'RU', order: 1, question: 'Как часто нужно посещать маникюрный салон?', answer: 'Для большинства услуг рекомендуется посещать мастера каждые 3-4 недели.' },
    { blogPostId: 'cd35c3d1-4db3-494e-82fc-6f1deff569dd', language: 'RU', order: 2, question: 'Есть ли парковка возле салонов в Гюзелоба?', answer: 'Премиум-студии в Гюзелоба обычно предоставляют удобную парковку для своих клиентов.' },

    // BLOG 9
    { blogPostId: 'de1f1761-c8f8-4c77-9dea-da1160177228', language: 'EN', order: 1, question: 'Is brow lamination painful?', answer: 'Not at all. Brow lamination is a completely pain-free, non-invasive procedure.' },
    { blogPostId: 'de1f1761-c8f8-4c77-9dea-da1160177228', language: 'EN', order: 2, question: 'Can I wash my face after brow lamination?', answer: 'You must avoid getting your eyebrows wet for the first 24 hours. After that, you can wash your face normally.' },
    { blogPostId: 'de1f1761-c8f8-4c77-9dea-da1160177228', language: 'DE', order: 1, question: 'Ist Brow Lifting schmerzhaft?', answer: 'Überhaupt nicht. Brow Lifting ist ein völlig schmerzfreies, nicht-invasives Verfahren.' },
    { blogPostId: 'de1f1761-c8f8-4c77-9dea-da1160177228', language: 'DE', order: 2, question: 'Kann ich mein Gesicht nach dem Brow Lifting waschen?', answer: 'Sie müssen vermeiden, Ihre Augenbrauen in den ersten 24 Stunden nass zu machen. Danach können Sie Ihr Gesicht normal waschen.' },
    { blogPostId: 'de1f1761-c8f8-4c77-9dea-da1160177228', language: 'RU', order: 1, question: 'Болезненно ли ламинирование бровей?', answer: 'Совсем нет. Ламинирование бровей — это абсолютно безболезненная и неинвазивная процедура.' },
    { blogPostId: 'de1f1761-c8f8-4c77-9dea-da1160177228', language: 'RU', order: 2, question: 'Можно ли умывать лицо после ламинирования?', answer: 'Вам следует избегать намокания бровей в первые 24 часа. После этого вы можете умываться как обычно.' }
  ];

  for (const t of translations) {
    const existing = await prisma.blogPostTranslation.findFirst({
      where: { blogPostId: t.blogPostId, language: t.language }
    });

    if (!existing) {
      // Find the main post to get its image for ogImage
      const post = await prisma.blogPost.findUnique({ where: { id: t.blogPostId } });
      const langCode = t.language.toLowerCase();
      const canonicalUrl = `https://nailslashesstudio.com/${langCode}/blog/${t.slug}`;
      
      const fullData = {
        ...t,
        canonical: canonicalUrl,
        ogImage: post?.image || null
      };

      await prisma.blogPostTranslation.create({ data: fullData });
      console.log(`✅ Added ${t.language} translation for ${t.slug}`);
    } else {
      console.log(`⚠️ ${t.language} translation already exists for ${t.slug}`);
    }
  }

  for (const f of faqs) {
    const exists = await prisma.faq.findFirst({
      where: { blogPostId: f.blogPostId, language: f.language, question: f.question }
    });
    if (!exists) {
      await prisma.faq.create({ data: f });
      console.log('✅ Added FAQ:', f.question);
    }
  }

  await prisma.$disconnect();
  console.log('AŞAMA 3 TAMAMLANDI: 3 blog x 3 eksik dil = 9 içerik başarıyla veritabanına eklendi.');
}

main().catch(console.error);
