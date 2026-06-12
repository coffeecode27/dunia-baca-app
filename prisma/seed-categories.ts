import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL! }) })

const categories = [
  { id: "manga-komik", name: "Manga & Komik", description: "Komik Jepang (Manga), Manhwa, Manhua, serta komik lokal dan barat." },
  { id: "light-novel", name: "Light Novel", description: "Novel ringan populer yang dilengkapi dengan ilustrasi gaya anime." },
  { id: "novel-cerpen", name: "Novel & Cerpen", description: "Karya fiksi umum, prosa, roman, dan kumpulan cerita pendek." },
  { id: "fantasi", name: "Fantasi", description: "Dunia paralel, sihir, mitologi, makhluk legenda, dan petualangan epik." },
  { id: "sci-fi", name: "Fiksi Ilmiah (Sci-Fi)", description: "Cerita bertema masa depan, teknologi tinggi, luar angkasa, dan distopia." },
  { id: "misteri-thriller", name: "Misteri & Thriller", description: "Kisah detektif, pemecahan teka-teki, kriminal, dan ketegangan." },
  { id: "romance", name: "Romance", description: "Kisah drama percintaan, hubungan emosional, dan dinamika asmara." },
  { id: "horor", name: "Horor", description: "Cerita mistis, urban legend, supranatural, dan kisah menegangkan." },
  { id: "puisi-sastra", name: "Puisi & Sastra", description: "Antologi puisi, sajak, dan karya sastra klasik maupun modern." },
  { id: "self-improvement", name: "Self-Improvement", description: "Pengembangan diri, motivasi, produktivitas, dan pembentukan kebiasaan positif." },
  { id: "psikologi", name: "Psikologi Populer", description: "Memahami perilaku manusia, kesehatan mental, dan emosi secara ringan." },
  { id: "finansial-investasi", name: "Finansial & Investasi", description: "Pengelolaan keuangan pribadi, tips menabung, investasi, dan bisnis." },
  { id: "karier-bisnis", name: "Karier & Kewirausahaan", description: "Tips dunia kerja, kepemimpinan, strategi bisnis, dan freelance." },
  { id: "filsafat", name: "Filsafat Populer", description: "Pemikiran bijak, stoikisme, dan pandangan hidup yang dikemas ringan." },
  { id: "pemrograman-tech", name: "Pemrograman & Teknologi", description: "Tutorial coding, arsitektur software, tips tech-stack, dan seputar AI." },
  { id: "desain-kreatif", name: "Desain & Kreatif", description: "UI/UX, ilustrasi, desain grafis, fotografi, dan seni visual." },
  { id: "digital-marketing", name: "Digital Marketing", description: "SEO, content creation, social media strategy, dan copywriting." },
  { id: "kesehatan-kebugaran", name: "Kesehatan & Kebugaran", description: "Pola hidup sehat, tips olahraga, diet, nutrisi, dan meditasi." },
  { id: "kuliner", name: "Kuliner & Resep", description: "Buku memasak, panduan baking, tips dapur, dan eksplorasi rasa." },
  { id: "wisata-traveling", name: "Wisata & Traveling", description: "Panduan perjalanan, jurnal petualangan, dan tips menjelajah tempat baru." },
  { id: "biografi-memoar", name: "Biografi & Memoar", description: "Kisah nyata perjalanan hidup tokoh inspiratif dan berpengaruh." },
  { id: "sejarah-populer", name: "Sejarah Populer", description: "Catatan sejarah dunia dan lokal yang ditulis dengan gaya mendongeng." },
]

async function main() {
  for (const c of categories) {
    await prisma.category.upsert({ where: { id: c.id }, update: c, create: c })
  }
  console.log(`Seeded ${categories.length} categories`)
  await prisma.$disconnect()
}

main()
