import { useState, useEffect, useRef, useMemo } from "react";

// Proxy aman untuk GSAP (tanpa menggunakan sintaks ?. yang membuat browser lama crash)
const gsapObj = {
  to: (...args) => window.gsap ? window.gsap.to(...args) : null,
  from: (...args) => window.gsap ? window.gsap.from(...args) : null,
  fromTo: (...args) => window.gsap ? window.gsap.fromTo(...args) : null,
};

// Fungsi aman untuk LocalStorage (mencegah crash di Incognito/Private Mode browser HP)
const safeGetSessions = () => {
  try {
    return JSON.parse(localStorage.getItem("ruang_tenang_sessions") || "[]");
  } catch (err) {
    console.warn("Storage tidak dapat diakses", err);
    return [];
  }
};

const safeSaveSessions = (sessions) => {
  try {
    localStorage.setItem("ruang_tenang_sessions", JSON.stringify(sessions));
  } catch (err) {
    console.warn("Gagal menyimpan data. Mungkin browser dalam mode privat.", err);
  }
};

const RENUNGAN = [
  "Tubuhmu tahu kapan ia butuh istirahat. Dengarkan.",
  "Bunga teratai mekar menembus lumpur. Ketenanganmu tumbuh menembus tekanan.",
  "Kamu tidak harus menanggung semuanya sendiri.",
  "Saat kamu memilih untuk jeda, kamu memilih untuk hadir sepenuhnya.",
  "Dedikasi tanpa perawatan diri adalah lilin yang membakar dirinya dari kedua ujung.",
  "Kecapean itu nyata. Tapi begitu juga kekuatan yang ada dalam dirimu.",
  "Perjalanan seribu mil dimulai dari satu langkah — dan satu napas dalam.",
  "Keberanian terbesar seorang guru adalah mengakui ketika butuh istirahat.",
  "Perasaanmu valid. Pengalamanmu nyata. Dan kamu tidak sendiri.",
  "Kamu adalah akar yang menopang pohon-pohon kecil itu untuk tumbuh tinggi.",
  "Hari yang berat adalah bukti bahwa kamu sedang mengerjakan sesuatu yang berarti.",
  "Mindfulness bukan tentang tidak merasakan — ini tentang merasakan dengan sadar.",
  "Marah itu manusiawi. Yang penting adalah bagaimana kamu memilih meresponsnya.",
  "Kamu bisa menjadi penuh kasih tanpa kehilangan dirimu sendiri.",
  "Setiap guru yang reflektif adalah guru yang terus berkembang.",
  "Lingkungan belajar yang aman dimulai dari hati guru yang aman.",
  "Kamu berharga — tidak hanya saat mengajar, tapi setiap saat.",
  "Istirahat adalah bagian dari produktivitas, bukan lawannya.",
  "Perbedaan yang kamu buat mungkin tidak terlihat hari ini, tapi ia akan tumbuh.",
  "Kamu adalah pembangun fondasi — pekerjaan yang paling penting di dunia.",
  "Setiap hari kamu hadir adalah hari yang bermakna bagi seseorang.",
  "Pilih satu hal kecil yang membuatmu bahagia hari ini — kamu layak mendapatkannya.",
  "Rasa frustrasimu adalah tanda bahwa kamu peduli.",
  "Anak-anak tidak membutuhkan guru sempurna — mereka membutuhkan guru yang hadir.",
  "Di balik setiap tantangan di kelas, ada kesempatan untuk tumbuh.",
  "Setiap kata lembut yang kamu ucapkan menanam benih kebaikan.",
  "Kamu tidak perlu menyelesaikan semuanya hari ini. Satu langkah sudah cukup.",
  "Pikiran yang tenang menghasilkan pilihan yang lebih bijak.",
  "Ketegangan di bahumu adalah pengingat untuk berhenti dan bernapas.",
  "Ingat: kamu juga sedang belajar, dan itu hal yang indah.",
  "Anak-anak melihat lebih dari yang kamu sadari — dan mereka melihat kebaikanmu.",
  "Kamu tidak harus memiliki semua jawaban untuk menjadi guru yang baik.",
  "Setiap guru yang merawat kesehatan mentalnya sedang menjadi role model bagi muridnya.",
  "Kehadiranmu yang penuh perhatian adalah bentuk cinta terbesar untuk murid-muridmu.",
  "Menjaga keseimbangan emosi adalah bagian dari profesionalisme seorang pendidik.",
  "Jangan bandingkan perjalananmu dengan guru lain. Jalanmu unik dan berharga.",
  "Kamu membawa pulang cerita hari ini — pastikan kamu juga membawa pulang kedamaian.",
  "Setiap detik kamu memilih sabar adalah investasi untuk masa depan anak bangsa.",
  "Kata-katamu kepada dirimu sendiri sama pentingnya dengan kata-katamu ke murid.",
  "Saat kamu tenang, seluruh ruangan merasakannya.",
  "Merawat diri bukan egois — itu adalah syarat untuk bisa memberi.",
  "Kamu tidak harus kuat setiap hari. Lemah pun adalah bagian dari manusia.",
  "Hari ini mungkin sulit, tapi kamu sudah melewati hari-hari sulit sebelumnya.",
  "Setiap napas yang kamu ambil adalah kesempatan baru untuk memilih tenang.",
  "Guru yang bahagia menciptakan kelas yang bahagia.",
  "Apa yang kamu rasakan hari ini tidak menentukan siapa kamu selamanya.",
  "Kelembutan bukan kelemahan — ia adalah kekuatan yang paling tahan lama.",
  "Kamu sudah memberi banyak hari ini. Izinkan dirimu untuk menerima juga.",
  "Setiap momen kecil ketenangan yang kamu ciptakan adalah warisan nyata.",
  "Kamu layak diperlakukan dengan kasih sayang — termasuk oleh dirimu sendiri.",
  "Berhenti sejenak bukan berarti menyerah. Itu berarti kamu bijaksana.",
  "Cinta yang kamu berikan kepada murid-muridmu dimulai dari cinta kepada dirimu.",
  "Tidak semua yang sulit itu buruk. Beberapa hal sulit membuatmu tumbuh.",
  "Guru yang reflektif adalah guru yang paling berdampak.",
  "Kamu tidak harus sempurna untuk memberikan dampak yang sempurna.",
  "Setiap guru pernah merasa kewalahan. Kamu tidak sendiri dalam ini.",
  "Rahasia kelas yang damai adalah guru yang menemukan damai dalam dirinya.",
  "Kasihmu kepada anak-anak itu nyata — dan mereka merasakannya.",
  "Satu hari yang berat tidak menghapus ribuan hari baik yang telah kamu berikan.",
  "Kamu sedang menulis cerita yang akan diingat muridmu seumur hidup.",
];

const QUOTES = [
  "Napas dalam-dalam adalah langkah pertama menuju kedamaian.",
  "Kamu tidak harus sempurna untuk menjadi guru yang luar biasa.",
  "Setiap hari adalah kesempatan baru untuk tumbuh bersama anak-anak.",
  "Ketenangan dalam dirimu adalah ketenangan yang kamu berikan kepada muridmu.",
  "Satu langkah kecil dalam kesabaran bisa mengubah hari seorang anak.",
  "Energi positifmu adalah hadiah terbesar bagi anak-anak di kelasmu.",
  "Kamu sudah melakukan lebih dari yang kamu sadari hari ini.",
  "Jeda sejenak bukan kelemahan, itu kekuatan.",
  "Guru yang merawat diri adalah guru yang bisa merawat orang lain.",
  "Setiap momen sulit mengajarimu sesuatu yang berharga.",
  "Kasih sayang yang kamu berikan akan selalu diingat anak-anak itu.",
  "Kamu bukan hanya guru — kamu adalah pelita dalam gelap.",
  "Hari ini boleh berat. Besok adalah lembaran baru.",
  "Kehadiranmu yang tenang adalah kekuatan paling nyata di kelas.",
  "Sayangi dirimu seperti kamu menyayangi murid-muridmu.",
  "Tidak ada guru sempurna, tapi ada guru yang ikhlas — dan kamu salah satunya.",
  "Jika kamu merawat dirimu, kamu sedang merawat generasi masa depan.",
  "Setiap napas dalam adalah hadiah untukmu sendiri.",
  "Kelasmu adalah dunia kecil penuh keajaiban — dan kamulah arsitek keajaiban itu.",
  "Kamu boleh lelah, asalkan tidak menyerah.",
  "Kecemasan hari ini tidak mendefinisikan siapa kamu besok.",
  "Ketika kamu memilih tenang, kamu memilih masa depan yang lebih baik untuk muridmu.",
  "Kamu sudah cukup. Kamu sudah berusaha keras.",
  "Mengajar dengan hati adalah seni yang tidak semua orang bisa lakukan — tapi kamu bisa.",
  "Kelas yang penuh cinta dimulai dari guru yang mencintai dirinya sendiri.",
  "Anak-anak belajar bukan hanya dari pelajaranmu, tapi dari cara kamu bersikap.",
  "Senyummu hari ini bisa mengubah cara seorang anak memandang dunia.",
  "Ketika kelasmu berisik, ingat: kegembiraan anak-anak itu nyata dan bermakna.",
  "Mulai hari dengan satu napas dalam, dan lihat bagaimana itu mengubah segalanya.",
  "Tubuhmu adalah rumahmu — rawatlah ia dengan kasih sayang.",
  "Setiap pelajaran yang gagal adalah data berharga untuk perjalananmu berikutnya.",
  "Kamu sedang menulis cerita yang akan diingat muridmu seumur hidup.",
  "Setiap guru muda yang berjuang hari ini sedang menjadi guru kuat di masa depan.",
];

const FOOTER_QUOTES = [
  { title: "Dunia PAUD itu dinamis.", body: "Kekacauan di kelas adalah tanda anak-anak bereksplorasi. Tarik napas." },
  { title: "Kamu tidak sendiri.", body: "Setiap guru pernah merasakan hari yang berat. Kamu adalah bagian dari komunitas yang peduli." },
  { title: "Satu langkah sudah cukup.", body: "Kamu tidak perlu menyelesaikan semuanya hari ini. Langkah kecilmu bermakna besar." },
  { title: "Perasaanmu valid.", body: "Merasa kewalahan bukan berarti kamu gagal. Itu berarti kamu manusia yang peduli." },
  { title: "Kamu sudah melakukan yang terbaik.", body: "Di tengah semua keterbatasan hari ini, kamu tetap hadir. Itu luar biasa." },
  { title: "Jeda adalah bagian dari mengajar.", body: "Guru yang beristirahat adalah guru yang bisa kembali dengan lebih baik." },
  { title: "Ingat mengapa kamu mulai.", body: "Di balik semua tantangan, ada cinta yang membuatmu terus memilih hadir setiap hari." },
  { title: "Anak-anak belajar dari caramu bersikap.", body: "Saat kamu memilih tenang, kamu mengajarkan ketenangan. Itu pelajaran terpenting." },
  { title: "Kamu adalah pelita.", body: "Bahkan di hari yang terasa paling gelap, cahayamu tetap menyentuh hati anak-anak itu." },
  { title: "Kelas yang ribut tanda kehidupan.", body: "Suara anak-anak itu adalah musik. Kamu yang memimpin orkestra ini." },
  { title: "Boleh merasa lelah.", body: "Tapi ingat: kelelahanmu hari ini adalah bukti betapa besar kasihmu kepada profesi ini." },
  { title: "Istirahat bukan kelemahan.", body: "Pohon yang kuat pun butuh tanah yang subur. Rawat dirimu agar terus bisa memberi." },
  { title: "Setiap hari adalah lembaran baru.", body: "Apa yang terjadi tadi tidak menentukan siapa kamu. Besok, kamu bisa memulai lagi." },
  { title: "Kasihmu nyata.", body: "Anak-anak merasakannya bahkan ketika kata-kata tidak cukup untuk mengungkapkannya." },
  { title: "Jeda, sadari, pilih.", body: "Tiga langkah sederhana yang bisa mengubah seluruh jalannya harimu." },
  { title: "Kamu lebih kuat dari yang kamu kira.", body: "Kamu sudah melewati hari-hari sulit sebelumnya — dan kamu akan melewati ini juga." },
  { title: "Beri dirimu ruang.", body: "Kamu tidak harus memiliki semua jawaban. Bertumbuh bersama anak-anak juga adalah mengajar." },
  { title: "Pilihanmu hari ini bermakna.", body: "Memilih untuk jeda dan refleksi adalah tanda guru yang benar-benar profesional." },
  { title: "Kamu membentuk masa depan.", body: "Setiap interaksi kecilmu dengan anak-anak itu adalah investasi untuk generasi yang akan datang." },
  { title: "Teruslah berjalan.", body: "Bahkan langkah yang paling pelan pun membawa kemajuan. Kamu sedang bergerak maju." },
  { title: "Dunia butuh guru sepertimu.", body: "Yang mau berhenti, merefleksi, dan terus belajar. Itu sangat langka dan sangat berharga." },
  { title: "Napas adalah jawabannya.", body: "Ketika semuanya terasa berat, satu napas dalam bisa mengembalikan kejernihan pikiranmu." },
  { title: "Kamu berharga.", body: "Tidak hanya sebagai guru, tapi sebagai manusia. Rawat dirimu dengan kasih yang sama kamu berikan ke murid." },
  { title: "Momen sulit adalah guru terbaik.", body: "Setiap tantangan di kelas menyimpan pelajaran yang tidak ada di buku manapun." },
  { title: "Kamu tidak harus sempurna.", body: "Kamu hanya perlu hadir, tulus, dan terus belajar. Itu sudah lebih dari cukup." },
];

const WELL_BEING_MESSAGES = {
  frustrasi: [
    "WELLBEINGMU MINGGU INI TERASA CUKUP MENGHAMBAT. JANGAN LUPA UNTUK MENGAPRESIASI USAHAMU.",
    "BANYAK HAL YANG MENGHAMBATMU MINGGU INI, YA? MARI KITA BERI RUANG UNTUK BERNAPAS.",
    "RASANYA MINGGU INI CUKUP MELELAHKAN, TETAP SABAR DENGAN DIRIMU SENDIRI.",
    "RASA FRUSTRASI SEDANG MENDOMINASI HARIMU. MARI MELAMBAT DAN URAI BENANG KUSUTNYA.",
    "JANGAN TERLALU KERAS PADA DIRI SENDIRI SAAT SEMUANYA TERASA SULIT MINGGU INI."
  ],
  sedih: [
    "ADA BEBAN EMOSIONAL YANG TERASA BELAKANGAN INI. VALIDKAN PERASAANMU, KAMU TIDAK SENDIRI.",
    "MINGGU INI TERASA CUKUP BERAT UNTUK HATIMU. MEMBERI WAKTU UNTUK PULIH ITU PENTING.",
    "BANYAK KESEDIHAN YANG MUNCUL, JANGAN TERLALU KERAS PADA DIRIMU SENDIRI.",
    "HATI YANG SEDIH BUTUH DIRANGKUL. MARI KITA JAGA DIRIMU LEBIH LEMBUT MINGGU INI.",
    "TIDAK APA-APA UNTUK MERASA RAPUH. WELLBEINGMU SEDANG BUTUH PERHATIAN EKSTRA."
  ],
  cemas: [
    "BANYAK PIKIRAN YANG BERLALU-LALANG MINGGU INI. MARI KEMBALI KE SAAT INI, NAPAS DEMI NAPAS.",
    "KECEMASANMU ADALAH SINYAL UNTUK MELAMBAT. KAMU TIDAK PERLU MENGENDALIKAN SEMUANYA SEKALIGUS.",
    "MINGGU INI MUNGKIN TERASA TIDAK MENENTU, TETAPLAH FOKUS PADA SATU LANGKAH KECIL.",
    "RASA KHAWATIR SEDANG TINGGI. INGATLAH BAHWA KAMU MAMPU MELEWATI KETIDAKPASTIAN INI.",
    "WELLBEINGMU SEDANG DIUJI OLEH KECEMASAN. MARI BERLATIH GROUNDING UNTUK KEMBALI TENANG."
  ],
  marah: [
    "ADA GEJOLAK EMOSI YANG CUKUP INTENS MINGGU INI. TENANGKAN DIRIMU, KAMU PUNYA KENDALI.",
    "ENERGI AMARAHMU SEDANG TINGGI. INGAT, DIRIMU JAUH LEBIH BESAR DARIPADA SITUASINYA.",
    "MINGGU INI TERASA CUKUP PANAS UNTUK EMOSIMU. AMBIL JEDA UNTUK MENDINGINKAN HATI.",
    "RASA MARAH ADALAH TANDA ADA BATASAN YANG DILANGGAR. MARI KELOLA DENGAN BIJAK.",
    "WELLBEINGMU BUTUH RUANG UNTUK MELEPASKAN KETEGANGAN. JANGAN PENDAM SENDIRIAN."
  ],
  kecewa: [
    "MINGGU INI PENUH DENGAN EKSPEKTASI YANG BELUM TERJAWAB. BERBAIK HATILAH PADA DIRIMU SENDIRI.",
    "PERASAAN KECEWA ITU MANUSIAWI. MARI FOKUS PADA APA YANG BISA DIPERBAIKI, SATU LANGKAH KECIL.",
    "TIDAK SEMUA HAL BERJALAN SESUAI RENCANA, DAN ITU TIDAK APA-APA. KAMU TETAP BERHARGA.",
    "RASA KECEWA SEDANG MENYELIMUTI MINGGU INI. TERIMA PERASAAN ITU, LALU PELAN-PELAN LEPASKAN.",
    "WELLBEINGMU TERDAMPAK OLEH HARAPAN YANG GUGUR. MARI KITA BANGUN KEMBALI PELAN-PELAN."
  ],
  cukup_baik: [
    "WELLBEINGMU CUKUP TERJAGA MINGGU INI. TERUSLAH PRAKTIKKAN KESADARAN DIRI INI!",
    "MINGGU YANG STABIL! KEHADIRANMU YANG TENANG SANGAT BERHARGA BAGI MURID-MURIDMU.",
    "KAMU MELALUI MINGGU INI DENGAN SANGAT BAIK. PERTAHANKAN RITME KETENANGANMU.",
    "KERJA BAGUS! KAMU MAMPU MENJAGA KESEIMBANGAN EMOSIMU DI TENGAH KESIBUKAN.",
    "ENERGI POSITIFMU MENDOMINASI! TERUSLAH MENJADI SUMBER KEHANGATAN DI KELAS."
  ]
};

const ENCOURAGEMENTS = [
  "Setiap perasaan yang kamu alami adalah valid.", "Kamu lebih kuat dari badai yang sedang kamu lewati.", "Hari yang berat bukan berarti kamu guru yang buruk.", "Langkah kecilmu hari ini adalah kemenangan.", "Tidak apa-apa untuk sesekali merasa lelah.",
  "Kamu sedang bertumbuh melalui tantangan ini.", "Murid-muridmu beruntung memilikimu yang peduli.", "Air mata adalah cara hati membersihkan diri.", "Keberanianmu untuk hadir hari ini sangat luar biasa.", "Jangan lupa, kamu juga manusia biasa.",
  "Peluk dirimu sendiri, kamu sudah bekerja keras.", "Kesabaranmu akan membuahkan hasil yang manis.", "Momen ini akan berlalu, dan kamu akan baik-baik saja.", "Cahayamu tetap terang meski sedang meredup.", "Izinkan dirimu bernapas sejenak.",
  "Kamu tidak harus sempurna setiap saat.", "Kegagalan kecil hari ini adalah pelajaran untuk esok.", "Kamu sedang menanam benih kebaikan yang tak terlihat.", "Waktu istirahat bukan berarti kamu menyerah.", "Berbaik hatilah pada dirimu sendiri hari ini.",
  "Setiap detak jantungmu membawa harapan baru.", "Kamu layak mendapatkan ketenangan.", "Beban ini tidak harus kamu pikul sendirian.", "Matahari akan bersinar lagi esok hari.", "Hargai dirimu karena sudah mencoba yang terbaik.",
  "Kelembutanmu pada diri sendiri adalah kekuatan sejati.", "Tidak ada badai yang bertahan selamanya.", "Perjalananmu unik dan indah apa adanya.", "Kamu berhak merasa sedih, marah, atau kecewa.", "Satu napas dalam bisa merubah arah harimu.",
  "Pikiran yang kalut butuh waktu untuk mereda.", "Kamu adalah arsitek kebahagiaanmu sendiri.", "Terima kasih sudah tidak menyerah hari ini.", "Anak-anak melihat ketulusanmu, percayalah.", "Ruang kelasmu adalah tempat penuh keajaiban berkatmu.",
  "Jangan biarkan satu momen mendefinisikan seluruh harimu.", "Kamu sedang belajar menjadi versi terbaikmu.", "Kesalahan adalah batu loncatan menuju kebijaksanaan.", "Tenanglah, kamu sudah melakukan hal yang luar biasa.", "Momen kelam ini hanya sebagian kecil dari ceritamu.",
  "Setiap kali kamu memilih bangkit, kamu menjadi lebih kuat.", "Biarkan dirimu merasakan, lalu lepaskan perlahan.", "Kamu adalah pelindung bagi mimpi-mimpi kecil mereka.", "Jeda adalah bagian penting dari produktivitas.", "Kamu memiliki ruang untuk membuat kesalahan.",
  "Kasih sayangmu meninggalkan jejak abadi.", "Kamu jauh melebihi keraguanmu sendiri.", "Bernapaslah, kamu sudah melangkah sejauh ini.", "Pekerjaanmu mengubah masa depan, itu hal besar.", "Kemampuanmu merefleksikan diri adalah bukti kepedulianmu.",
  "Kamu selalu bisa memulai kembali setiap pagi.", "Percayalah pada proses penyembuhanmu sendiri.", "Hatimu yang tulus tidak akan pernah salah.", "Hargai keringat dan lelahmu hari ini.", "Kamu berhak bahagia, bahkan di hari kerja yang sibuk."
];

const AFFIRMATIONS = [
  "Saya mengizinkan diri saya untuk beristirahat.", "Saya adalah guru yang cukup dan berharga.", "Emosi saya tidak mengendalikan saya.", "Saya melepaskan apa yang tidak bisa saya kontrol.", "Saya pantas mendapatkan kedamaian pikiran.",
  "Setiap hari saya belajar hal baru.", "Saya memilih untuk merespons dengan tenang.", "Saya memaafkan diri saya atas kesalahan hari ini.", "Tubuh dan pikiran saya pantas untuk dirawat.", "Saya menerima diri saya seutuhnya, saat kuat maupun lemah.",
  "Saya adalah sumber energi positif di kelas.", "Saya memiliki kemampuan untuk mengatasi kelas yang menantang.", "Saya bersyukur atas kesempatan mendidik hari ini.", "Saya memilih untuk fokus pada kebaikan kecil.", "Kesehatan mental saya adalah prioritas utama.",
  "Saya memancarkan kelembutan dan kesabaran.", "Saya layak mendapatkan ruang untuk bernapas.", "Pikiran saya jernih dan tenang.", "Saya adalah tempat yang aman bagi murid-murid saya.", "Saya berhak untuk berkata 'tidak' demi keseimbangan diri.",
  "Saya melepaskan beban yang bukan milik saya.", "Saya bangga dengan progres yang saya capai.", "Saya dikelilingi oleh dukungan dan cinta.", "Saya cukup, lebih dari cukup.", "Saya mengampuni diri saya karena menjadi manusiawi.",
  "Saya menghargai setiap emosi yang datang dan pergi.", "Saya memiliki kekuatan untuk mengubah hari ini.", "Saya memilih melihat peluang dalam setiap masalah.", "Saya menyayangi diri saya sama seperti saya menyayangi orang lain.", "Saya bebas dari keharusan untuk selalu sempurna.",
  "Setiap napas yang saya ambil membawa kedamaian.", "Saya bersyukur atas ketangguhan yang saya miliki.", "Saya mengontrol respon saya, bukan sebaliknya.", "Saya memberikan diri saya izin untuk tumbuh secara perlahan.", "Saya adalah pembawa perubahan yang positif.",
  "Saya merayakan kemenangan kecil saya hari ini.", "Saya pantas dihargai dan dihormati.", "Saya memilih kedamaian daripada kesempurnaan.", "Saya melepaskan rasa bersalah masa lalu.", "Saya terhubung dengan kebijaksanaan batin saya.",
  "Saya menyadari batasan energi saya dan menghormatinya.", "Saya aman di momen saat ini.", "Saya bernapas membuang stres, menghirup tenang.", "Saya memegang kendali atas kebahagiaan saya.", "Saya mengapresiasi tubuh saya yang menopang saya.",
  "Saya percaya bahwa esok akan lebih baik.", "Saya layak menerima kasih sayang dari diri sendiri.", "Saya menyambut tantangan dengan pikiran terbuka.", "Saya memilih untuk melepaskan segala ketegangan.", "Saya adalah individu yang berkembang dan belajar setiap harinya.",
  "Saya mencintai profesi saya tanpa kehilangan diri saya.", "Saya memiliki keberanian untuk meminta bantuan.", "Saya menghormati perasaan saya yang sedang berproses.", "Saya bersedia melepaskan harapan yang tidak realistis.", "Saya damai, saya hadir, saya siap."
];

const SUGGESTIONS_BY_EMOTION = {
  sedih: [
    "Coba tuliskan perasaan sedihmu di jurnal khusus.", "Dengarkan musik favorit yang bisa menenangkan hatimu.", "Bicaralah dengan sahabat atau rekan kerja yang suportif.", "Izinkan dirimu menangis jika itu melegakan.", "Lakukan aktivitas yang memanjakan diri, seperti mandi air hangat.",
    "Beri dirimu pelukan fisik (butterfly hug) selama 1 menit.", "Ingat kembali 3 hal kecil yang membuatmu tersenyum hari ini."
  ],
  marah: [
    "Lakukan teknik pernapasan 4-7-8 untuk menetralkan detak jantung.", "Coba berjalan kaki sebentar keluar ruangan untuk mencari udara segar.", "Luapkan emosimu dengan mencoret-coret kertas lalu membuangnya.", "Minum segelas air dingin dengan perlahan.", "Hindari merespons atau mengambil keputusan saat emosi memuncak.",
    "Beri jeda 5 menit di ruangan yang sepi sebelum kembali ke kelas.", "Kepalkan tanganmu kuat-kuat selama 5 detik, lalu lepaskan perlahan."
  ],
  cemas: [
    "Praktikkan teknik grounding 5-4-3-2-1 untuk kembali ke masa kini.", "Fokuskan pikiranmu pada apa yang bisa kamu kontrol hari ini.", "Tarik napas dalam, lalu rasakan kaki berpijak kuat di lantai.", "Kurangi konsumsi kafein atau kopi untuk sementara waktu.", "Tuliskan hal yang kamu cemaskan, lalu cari 1 solusi kecil.",
    "Letakkan tangan di dada dan rasakan detak jantungmu melambat.", "Lakukan peregangan tubuh ringan (stretching) selama 3 menit."
  ],
  frustrasi: [
    "Ambil jarak dari tugas atau situasi tersebut selama 10 menit.", "Pecah tugas atau masalah yang besar menjadi langkah-langkah sangat kecil.", "Ubah lingkungan fisikmu sejenak, misalnya berpindah kursi atau ruangan.", "Dengarkan podcast atau tonton video pendek yang menghibur.", "Bicarakan kebingunganmu dengan rekan guru lain untuk perspektif baru.",
    "Tarik napas dalam dan akui bahwa wajar merasa buntu.", "Lakukan aktivitas repetitif yang menenangkan, seperti merapikan meja."
  ],
  kecewa: [
    "Turunkan standar kesempurnaanmu untuk hari ini.", "Sadari bahwa ekspektasi kadang tidak sesuai dengan realitas anak usia dini.", "Evaluasi kembali apa yang telah berjalan baik, sekecil apapun itu.", "Ingat bahwa satu kegagalan tidak mendefinisikan kemampuan mengajarmu.", "Berhenti membandingkan kelasmu dengan kelas guru lain.",
    "Lakukan sesuatu yang pasti berhasil kamu lakukan untuk membangun rasa percaya diri.", "Tidur lebih awal malam ini untuk mereset energi."
  ],
  cukup_baik: [
    "Pertahankan rutinitas baik yang sedang kamu jalankan hari ini.", "Bagikan energi positifmu dengan memberikan pujian tulus pada murid atau rekan kerja.", "Catat apa yang membuat harimu baik agar bisa diulang di lain waktu.", "Luangkan waktu ekstra untuk bermain dan tertawa bersama anak-anak.", "Manfaatkan energi ini untuk merencanakan aktivitas seru esok hari.",
    "Beri apresiasi pada dirimu sendiri: 'Saya melakukan pekerjaan hebat hari ini!'", "Teruslah hadir sepenuhnya dan nikmati momen-momen kecil di kelas."
  ]
};

const EMOTION_OPTIONS = [
  { emoji: "😤", label: "Frustrasi", value: "frustrasi" },
  { emoji: "😢", label: "Sedih", value: "sedih" },
  { emoji: "😰", label: "Cemas", value: "cemas" },
  { emoji: "😠", label: "Marah", value: "marah" },
  { emoji: "😔", label: "Kecewa", value: "kecewa" },
  { emoji: "😊", label: "Cukup Baik", value: "cukup_baik" },
];

const BODY_PARTS = ["Kepala", "Dada", "Bahu", "Perut", "Tangan", "Kaki"];

const RESPONSE_TYPES = [
  { icon: "⚡", label: "Spontan / Reaktif", value: "spontan" },
  { icon: "😌", label: "Cukup Tenang", value: "cukup_tenang" },
  { icon: "🌱", label: "Ingin Diperbaiki", value: "ingin_diperbaiki" },
];

const NEXT_RESPONSES = [
  { icon: "💬", label: "Bicara lebih pelan", value: "bicara_lebih_pelan" },
  { icon: "⏸️", label: "Memberi jeda terlebih dulu", value: "memberi_jeda" },
  { icon: "🤗", label: "Mendekati anak dengan tenang", value: "mendekati_tenang" },
  { icon: "🔄", label: "Minta bantuan kolega", value: "minta_bantuan" },
  { icon: "✍️", label: "Menulis perasaan dulu", value: "menulis_perasaan" },
];

const SELF_CARE = [
  { icon: "🌬️", label: "Tarik Napas", value: "napas" },
  { icon: "💧", label: "Minum Air", value: "air" },
  { icon: "🧘", label: "Duduk Tenang", value: "diam" },
  { icon: "🚶", label: "Jalan Sebentar", value: "jalan" },
  { icon: "☕", label: "Minum Teh", value: "teh" },
  { icon: "🎵", label: "Dengarkan Musik", value: "musik" },
];

const RESPONSE_QUOTES = {
  spontan: [
    "Reaksi spontan adalah tanda bahwa kamu peduli. Sekarang kamu punya kesempatan untuk memilih lagi.",
    "Tidak apa-apa bereaksi spontan — yang penting kamu menyadarinya sekarang. Itu langkah luar biasa.",
    "Tubuhmu bereaksi lebih cepat dari pikiranmu. Kini pikiranmu sudah ikut — dan kamu bisa memilih lebih baik.",
  ],
  cukup_tenang: [
    "Luar biasa! Menjaga ketenangan di momen sulit adalah keahlian yang tidak mudah. Kamu melakukannya dengan baik.",
    "Kamu berhasil menjaga dirimu tetap tenang — itu bukan hal kecil. Itu adalah kekuatan sejati.",
    "Tetap tenang di tengah badai adalah seni. Dan kamu sudah mempraktikkannya hari ini.",
  ],
  ingin_diperbaiki: [
    "Kesadaran untuk ingin lebih baik adalah awal dari semua perubahan. Kamu sudah setengah jalan.",
    "Keinginanmu untuk diperbaiki adalah tanda guru yang luar biasa. Teruslah bertumbuh.",
    "Guru yang ingin terus berkembang adalah guru yang paling berdampak. Kamu ada di jalur yang tepat.",
  ],
};

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
// Gunakan cara konvensional array find untuk WebView tua (tanpa ?.)
const getEmotionEmoji = (val) => {
  const e = EMOTION_OPTIONS.find(item => item.value === val);
  return e ? e.emoji : "💭";
};
const getEmotionLabel = (val) => {
  const e = EMOTION_OPTIONS.find(item => item.value === val);
  return e ? e.label : val;
};

function BreathingGuide({ onDone }) {
  const [phase, setPhase] = useState("idle");
  const [count, setCount] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [totalCycles, setTotalCycles] = useState(3);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const timerRef = useRef(null);

  const PHASES = [
    { name: "Tarik Napas", instruction: "Hirup udara perlahan lewat hidung", duration: 4, color: "#4a9d7f", bg: "#e8f5ef" },
    { name: "Tahan", instruction: "Tahan napas, rasakan ketenangannya", duration: 4, color: "#7b6fad", bg: "#f0eef8" },
    { name: "Hembuskan", instruction: "Keluarkan perlahan lewat mulut", duration: 6, color: "#d4845a", bg: "#fdf0e8" },
  ];

  useEffect(() => {
    if (phase !== "running") return;
    const currentPhase = PHASES[phaseIndex];
    if (count < currentPhase.duration) {
      timerRef.current = setTimeout(() => setCount((c) => c + 1), 1000);
    } else {
      const nextPhase = (phaseIndex + 1) % PHASES.length;
      if (nextPhase === 0) {
        const nextCycle = cycle + 1;
        if (nextCycle >= totalCycles) { setPhase("done"); return; }
        setCycle(nextCycle);
      }
      setPhaseIndex(nextPhase);
      setCount(0);
    }
    return () => clearTimeout(timerRef.current);
  }, [phase, count, phaseIndex, cycle, totalCycles]);

  const start = () => { setPhase("running"); setCount(0); setCycle(0); setPhaseIndex(0); };

  const currentPhase = PHASES[phaseIndex];
  const progress = phase === "running" ? (count / currentPhase.duration) * 100 : 0;
  const circumference = 2 * Math.PI * 52;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      {phase === "idle" && (
        <div style={{ width: "100%", borderRadius: 16, padding: "16px", background: "#f0faf6", boxSizing: "border-box" }}>
          <p style={{ fontSize: 14, fontWeight: 600, textAlign: "center", marginBottom: 12, color: "#2d5a45" }}>Pilih berapa siklus napas:</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            {[3, 5, 7].map((n) => (
              <button
                key={n}
                onClick={() => setTotalCycles(n)}
                onMouseEnter={(e) => { if(totalCycles !== n) gsapObj.to(e.currentTarget, { scale: 1.02, duration: 0.15, ease: "power2.out", overwrite: "auto" }) }}
                onMouseLeave={(e) => { if(totalCycles !== n) gsapObj.to(e.currentTarget, { scale: 1, duration: 0.15, ease: "power2.out", overwrite: "auto" }) }}
                style={{
                  background: totalCycles === n ? "#4a9d7f" : "#ffffff",
                  color: totalCycles === n ? "#ffffff" : "#4a9d7f",
                  border: `2px solid ${totalCycles === n ? "#4a9d7f" : "#a8d5c2"}`,
                  borderRadius: "12px",
                  padding: "10px 24px",
                  fontWeight: 700,
                  fontSize: "16px",
                  cursor: "pointer",
                  transition: "background 0.2s, color 0.2s"
                }}
              >
                {n}×
              </button>
            ))}
          </div>
          <p style={{ fontSize: 12, textAlign: "center", margin: "12px 0 0 0", color: "#7a9a8a" }}>
            {totalCycles} siklus · Tarik {PHASES[0].duration}s → Tahan {PHASES[1].duration}s → Hembuskan {PHASES[2].duration}s
          </p>
        </div>
      )}

      {(phase === "idle" || phase === "running") && (
        <div
          style={{
            transition: "transform 1.5s ease-in-out",
            transform: phase === "running" && phaseIndex === 0
              ? "translateY(-12px) scale(1.08)"
              : phase === "running" && phaseIndex === 2
              ? "translateY(6px) scale(0.94)"
              : "translateY(0px) scale(1)",
          }}
        >
          <svg width="72" height="80" viewBox="0 0 72 80" fill="none">
            <rect x="22" y="60" width="28" height="18" rx="4" fill="#c8a87a" />
            <rect x="18" y="56" width="36" height="8" rx="3" fill="#b8946a" />
            <ellipse cx="36" cy="58" rx="14" ry="4" fill="#8b6340" />
            <path d="M36 58 Q34 44 36 30" stroke="#4a9d7f" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <ellipse cx="28" cy="42" rx="10" ry="6" fill="#5aba8f" transform="rotate(-30 28 42)" />
            <ellipse cx="44" cy="36" rx="10" ry="6" fill="#4a9d7f" transform="rotate(25 44 36)" />
            <ellipse cx="30" cy="30" rx="8" ry="5" fill="#6dcaa0" transform="rotate(-15 30 30)" />
            <ellipse cx="38" cy="24" rx="6" ry="4" fill="#5aba8f" transform="rotate(10 38 24)" />
          </svg>
        </div>
      )}

      {phase === "idle" && (
        <button
          onClick={start}
          onMouseEnter={(e) => gsapObj.to(e.currentTarget, { scale: 1.02, y: -2, backgroundColor: "#3d8a6e", duration: 0.15, ease: "power2.out", overwrite: "auto" })}
          onMouseLeave={(e) => gsapObj.to(e.currentTarget, { scale: 1, y: 0, backgroundColor: "#4a9d7f", duration: 0.15, ease: "power2.out", overwrite: "auto" })}
          style={{
            background: "#4a9d7f",
            color: "#ffffff",
            border: "none",
            borderRadius: "999px",
            padding: "14px 40px",
            fontWeight: 700,
            fontSize: "15px",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(74,157,127,0.40)",
          }}
        >
          🌬️ Mulai Latihan Napas
        </button>
      )}

      {phase === "running" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: "100%" }}>
          <div
            style={{ width: "100%", borderRadius: 16, padding: "12px 16px", textAlign: "center", background: currentPhase.bg, border: `1.5px solid ${currentPhase.color}30`, boxSizing: "border-box" }}
          >
            <p style={{ fontWeight: 700, fontSize: 16, color: currentPhase.color, margin: 0 }}>{currentPhase.name}</p>
            <p style={{ fontSize: 12, margin: "4px 0 0 0", color: currentPhase.color + "cc" }}>{currentPhase.instruction}</p>
          </div>

          <div style={{ position: "relative", width: 128, height: 128 }}>
            <svg viewBox="0 0 120 120" width="128" height="128" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="60" cy="60" r="52" fill="none" stroke="#e8efe8" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="52" fill="none"
                stroke={currentPhase.color} strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress / 100)}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.9s linear" }}
              />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 36, fontWeight: 300, color: currentPhase.color, lineHeight: 1 }}>
                {currentPhase.duration - count}
              </span>
              <span style={{ fontSize: 11, color: "#7a9a8a", marginTop: 2 }}>detik</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {Array.from({ length: totalCycles }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 28, height: 8, borderRadius: 4,
                  background: i < cycle ? "#4a9d7f" : i === cycle ? currentPhase.color : "#d8ebe3",
                  transition: "background 0.4s",
                }}
              />
            ))}
          </div>
          <p style={{ fontSize: 12, color: "#7a9a8a", margin: 0 }}>Siklus {cycle + 1} dari {totalCycles}</p>
        </div>
      )}

      {phase === "done" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "8px 0" }}>
          <div style={{ fontSize: 48 }}>🌿</div>
          <p style={{ color: "#4a9d7f", fontWeight: 700, fontSize: 18, margin: 0 }}>Bagus sekali!</p>
          <p style={{ color: "#7a9a8a", fontSize: 14, textAlign: "center", margin: 0 }}>
            Napasmu sudah lebih teratur.<br />Lanjut ke langkah berikutnya.
          </p>
          <button
            onClick={onDone}
            onMouseEnter={(e) => gsapObj.to(e.currentTarget, { scale: 1.02, y: -2, duration: 0.15, ease: "power2.out", overwrite: "auto" })}
            onMouseLeave={(e) => gsapObj.to(e.currentTarget, { scale: 1, y: 0, duration: 0.15, ease: "power2.out", overwrite: "auto" })}
            style={{
              background: "#4a9d7f", color: "#ffffff", border: "none",
              borderRadius: "999px", padding: "12px 32px", fontWeight: 700,
              fontSize: 14, cursor: "pointer",
              boxShadow: "0 4px 14px rgba(74,157,127,0.35)",
            }}
          >
            Lanjut →
          </button>
          <button
            onClick={() => { setPhase("idle"); setCount(0); setCycle(0); setPhaseIndex(0); }}
            style={{ fontSize: 12, color: "#9ab5a8", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
          >
            Ulangi
          </button>
        </div>
      )}
    </div>
  );
}

function OptionPill({ selected, onClick, children, selectedColor = "#4a9d7f" }) {
  const pillRef = useRef(null);

  useEffect(() => {
    gsapObj.to(pillRef.current, {
      backgroundColor: selected ? selectedColor : "#ffffff",
      color: selected ? "#ffffff" : "#3d5a4a",
      borderColor: selected ? selectedColor : "#b8d4c8",
      boxShadow: selected ? `0 2px 10px ${selectedColor}40` : "none",
      scale: selected ? 1.02 : 1,
      duration: 0.2,
      ease: "power2.out",
      overwrite: "auto"
    });
  }, [selected, selectedColor]);

  const handleEnter = () => { if (!selected) gsapObj.to(pillRef.current, { scale: 1.02, y: -1, boxShadow: "0 4px 8px rgba(0,0,0,0.05)", duration: 0.15, ease: "power2.out", overwrite: "auto" }); };
  const handleLeave = () => { if (!selected) gsapObj.to(pillRef.current, { scale: 1, y: 0, boxShadow: "none", duration: 0.15, ease: "power2.out", overwrite: "auto" }); };

  return (
    <button
      ref={pillRef}
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "9px 14px", borderRadius: 12, fontSize: 13, fontWeight: 600,
        cursor: "pointer",
        border: "2px solid #b8d4c8",
        background: "#ffffff",
        color: "#3d5a4a"
      }}
    >
      {children}
    </button>
  );
}

function StepCard({ number, title, subtitle, accentColor = "#4a9d7f", bgColor = "#f6fdf9", children, completed }) {
  const [open, setOpen] = useState(true);
  const cardRef = useRef(null);
  const contentRef = useRef(null);

  const onCardEnter = () => gsapObj.to(cardRef.current, { y: -2, boxShadow: "0 6px 16px rgba(0,0,0,0.06)", duration: 0.2, ease: "power2.out", overwrite: "auto" });
  const onCardLeave = () => gsapObj.to(cardRef.current, { y: 0, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", duration: 0.2, ease: "power2.out", overwrite: "auto" });

  useEffect(() => {
    if (open && contentRef.current) {
      gsapObj.fromTo(contentRef.current, 
        { opacity: 0, y: -10 }, 
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [open]);

  return (
    <div 
      ref={cardRef}
      onMouseEnter={onCardEnter}
      onMouseLeave={onCardLeave}
      style={{
        borderRadius: 20, overflow: "hidden",
        border: completed ? `1.5px solid ${accentColor}` : "1.5px solid #e0ece6",
        background: completed ? bgColor : "#ffffff",
        boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
      }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 14,
          padding: "16px 20px", background: "none", border: "none", cursor: "pointer", textAlign: "left",
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: completed ? accentColor : accentColor + "22",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: completed ? "#fff" : accentColor,
          fontWeight: 800, fontSize: 14, flexShrink: 0,
          border: `2px solid ${completed ? accentColor : accentColor + "55"}`,
        }}>
          {completed ? "✓" : number}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, color: "#1e3a2a", margin: 0, fontSize: 14, letterSpacing: 0.3 }}>{title}</p>
          {subtitle && <p style={{ fontSize: 11, color: "#7a9a8a", margin: "2px 0 0" }}>{subtitle}</p>}
        </div>
        <span style={{ color: "#9ab5a8", fontSize: 12, transition: "transform 0.3s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
      </button>
      {open && <div ref={contentRef} style={{ padding: "0 20px 20px" }}>{children}</div>}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: 13, fontWeight: 700, color: "#3d5a4a", marginBottom: 10, marginTop: 4 }}>{children}</p>
  );
}

function HistoryPage({ onBack }) {
  const [sessions, setSessions] = useState(() => safeGetSessions());
  const [expandedId, setExpandedId] = useState(null);
  const pageRef = useRef(null);

  const [insightData, setInsightData] = useState({
    encouragement: "", affirmation: "", suggestion: "", wellbeingMsg: ""
  });

  // Menganalisis 5 sesi terakhir
  const dominantEmotion = useMemo(() => {
    if (sessions.length < 5) return null;
    const last5 = sessions.slice(0, 5); 
    const counts = {};
    
    last5.forEach(s => {
      if (s.emotions && s.emotions.length > 0) {
        s.emotions.forEach(e => {
          counts[e] = (counts[e] || 0) + 1;
        });
      }
    });

    if (Object.keys(counts).length === 0) return null;
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  }, [sessions]);

  useEffect(() => {
    if (dominantEmotion) {
      const suggestions = SUGGESTIONS_BY_EMOTION[dominantEmotion] || SUGGESTIONS_BY_EMOTION["sedih"];
      const wbMsgs = WELL_BEING_MESSAGES[dominantEmotion] || WELL_BEING_MESSAGES["sedih"];
      
      setInsightData({
        encouragement: rand(ENCOURAGEMENTS),
        affirmation: rand(AFFIRMATIONS),
        suggestion: rand(suggestions),
        wellbeingMsg: rand(wbMsgs)
      });
    }
  }, [dominantEmotion]);

  // Entrance Animasi Halus
  useEffect(() => {
    if (pageRef.current) {
      gsapObj.fromTo(pageRef.current.children,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: "power2.out" }
      );
    }
  }, []);

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if(window.confirm("Apakah kamu yakin ingin menghapus catatan sesi ini?")) {
      const updated = sessions.filter(s => s.id !== id);
      setSessions(updated);
      safeSaveSessions(updated);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + " · " +
           date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  const renderExpandedContent = (el) => {
    if (el && !el.dataset.animated) {
      el.dataset.animated = "true";
      gsapObj.fromTo(el, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fcf9f2", paddingBottom: 40 }}>
      {/* Navbar */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "#fff", borderBottom: "1px solid #e0ece6", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "#4a9d7f", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>← Kembali</button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🗓️</span>
            <span style={{ fontWeight: 800, color: "#1e3a2a", fontSize: 15 }}>Semua Sesi</span>
          </div>
          <div style={{ width: 60 }} />
        </div>
      </div>

      <div ref={pageRef} style={{ maxWidth: 600, margin: "0 auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
        
        {/* === INSIGHT CARD WARM TONES === */}
        {dominantEmotion && (
          <div style={{ 
            background: "linear-gradient(135deg, #fffbf5, #fdf5ea)", 
            borderRadius: 20, 
            border: "1.5px solid #f0e0d0", 
            padding: 24, 
            boxShadow: "0 4px 14px rgba(138, 90, 48, 0.06)",
            marginBottom: 8
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 22 }}>✨</span>
              <h3 style={{ margin: 0, color: "#8a5a30", fontSize: 16, fontWeight: 800 }}>Insight 5 Sesi Terakhirmu</h3>
            </div>
            
            <p style={{ color: "#5a3a20", fontSize: 14, lineHeight: 1.6, margin: "0 0 16px" }}>
              Dari catatanmu belakangan ini, sepertinya kamu cukup sering merasa 
              <strong style={{ color: "#8a5a30", background: "#f8ecd8", padding: "2px 8px", borderRadius: 8, marginLeft: 6, display: "inline-flex", alignItems: "center", gap: 4 }}>
                {getEmotionEmoji(dominantEmotion)} {getEmotionLabel(dominantEmotion)}
              </strong>.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              
              {/* Well-Being Analysis */}
              <div style={{ background: "#d4845a", padding: "12px 14px", borderRadius: 12, border: "1px solid #c4744a", textAlign: "center" }}>
                <p style={{ margin: 0, color: "#ffffff", fontSize: 12, fontWeight: 800, letterSpacing: 0.5, lineHeight: 1.5 }}>
                  {insightData.wellbeingMsg}
                </p>
              </div>

              {/* Afirmasi */}
              <div style={{ background: "#e8f5ef", padding: 14, borderRadius: 12, border: "1px solid #c8ddd4" }}>
                <p style={{ margin: "0 0 4px", color: "#2d5a45", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 }}>💡 Afirmasi Untukmu</p>
                <p style={{ margin: 0, color: "#1e3a2a", fontSize: 13, fontWeight: 700 }}>"{insightData.affirmation}"</p>
              </div>

              {/* Penyemangat & Saran */}
              <div style={{ background: "#fff", padding: 14, borderRadius: 12, border: "1px solid #f0e0d0" }}>
                <p style={{ margin: "0 0 4px", color: "#8a5a30", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 }}>🌱 Pesan & Saran Tindakan</p>
                <p style={{ margin: "0 0 8px", color: "#a66033", fontSize: 13, fontStyle: "italic", lineHeight: 1.5 }}>
                  "{insightData.encouragement}"
                </p>
                <p style={{ margin: 0, color: "#5a3a20", fontSize: 13, lineHeight: 1.5, borderTop: "1px solid #f0e0d0", paddingTop: 8 }}>
                  Mungkin bisa dicoba: {insightData.suggestion}
                </p>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: 4 }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: "#1e3a2a", margin: "0 0 4px" }}>Riwayat Ketenanganmu</h2>
          <p style={{ color: "#6a8a78", fontSize: 14, margin: 0 }}>Melihat kembali perjalanan mindfulness-mu.</p>
        </div>

        {sessions.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 20, padding: "40px 20px", textAlign: "center", border: "1px dashed #c8ddd4" }}>
            <span style={{ fontSize: 40, display: "block", marginBottom: 12 }}>🌱</span>
            <p style={{ color: "#1e3a2a", fontWeight: 700, fontSize: 16, margin: "0 0 6px" }}>Belum ada sesi tersimpan</p>
            <p style={{ color: "#7a9a8a", fontSize: 13, margin: 0 }}>Selesaikan satu sesi Ruang Tenang untuk menyimpan catatan pertamamu.</p>
          </div>
        ) : (
          sessions.map((session) => {
            const isExpanded = expandedId === session.id;
            const firstEmotion = session.emotions && session.emotions[0];
            return (
              <div key={session.id} style={{
                background: "#fff", borderRadius: 16, border: "1.5px solid #e0ece6",
                boxShadow: "0 2px 10px rgba(0,0,0,0.04)", overflow: "hidden"
              }}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : session.id)}
                  style={{
                    width: "100%", textAlign: "left", padding: "16px 20px", background: isExpanded ? "#f6fdf9" : "#fff",
                    border: "none", borderBottom: isExpanded ? "1px solid #e0ece6" : "none",
                    display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", gap: 12
                  }}
                >
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%", background: "#e8f5ef", color: "#4a9d7f",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0
                    }}>
                      {getEmotionEmoji(firstEmotion)}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: "#1e3a2a", fontSize: 14, margin: "0 0 2px" }}>
                        {formatDate(session.timestamp)}
                      </p>
                      <p style={{ color: "#7a9a8a", fontSize: 12, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "240px" }}>
                        {session.moment || "Tidak ada detail kejadian"}
                      </p>
                    </div>
                  </div>
                  <span style={{ color: "#9ab5a8", fontSize: 12, transition: "transform 0.3s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
                </button>

                {isExpanded && (
                  <div ref={renderExpandedContent} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 800, color: "#7a9a8a", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Kejadian</p>
                      <p style={{ fontSize: 14, color: "#2d4a3a", lineHeight: 1.6, background: "#f8fdf9", padding: 12, borderRadius: 10, border: "1px solid #e8f5ef", margin: 0 }}>
                        {session.moment || "-"}
                      </p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 800, color: "#7a9a8a", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Emosi</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {session.emotions && session.emotions.length > 0 ? session.emotions.map(e => (
                            <span key={e} style={{ background: "#f0eef8", color: "#5a4a8a", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 12, border: "1px solid #d0c8f0" }}>
                              {e.replace(/_/g, " ")}
                            </span>
                          )) : <span style={{ fontSize: 12, color: "#9ab5a8" }}>-</span>}
                        </div>
                      </div>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 800, color: "#7a9a8a", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Tubuh</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {session.bodyParts && session.bodyParts.length > 0 ? session.bodyParts.map(b => (
                            <span key={b} style={{ background: "#fdf0e8", color: "#8a5a30", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 12, border: "1px solid #f0d0b8" }}>
                              {b}
                            </span>
                          )) : <span style={{ fontSize: 12, color: "#9ab5a8" }}>-</span>}
                        </div>
                      </div>
                    </div>

                    <div>
                      <p style={{ fontSize: 11, fontWeight: 800, color: "#7a9a8a", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Respon Diri</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {session.responseType && session.responseType.map(r => (
                          <span key={r} style={{ background: "#e8f0fa", color: "#2d4a6a", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 12, border: "1px solid #b8d0e8" }}>
                            {r.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                      {session.nextResponseDetail && (
                        <p style={{ fontSize: 13, color: "#4a6a5a", marginTop: 8, fontStyle: "italic", borderLeft: "3px solid #b8d0e8", paddingLeft: 10 }}>
                          "{session.nextResponseDetail}"
                        </p>
                      )}
                    </div>

                    {((session.selfCare && session.selfCare.length > 0) || session.compassionReason) ? (
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 800, color: "#7a9a8a", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Self-Care & Kasih Sayang</p>
                        {session.selfCare && session.selfCare.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                            {session.selfCare.map(s => (
                              <span key={s} style={{ background: "#fde8f0", color: "#8a3060", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 12, border: "1px solid #f0b8d0" }}>
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                        {session.compassionReason && (
                          <p style={{ fontSize: 13, color: "#8a3060", margin: 0, background: "#fff0f4", padding: 10, borderRadius: 10 }}>
                            "Tidak apa-apa karena {session.compassionReason}"
                          </p>
                        )}
                      </div>
                    ) : null}

                    {session.additionalNotes && (
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 800, color: "#7a9a8a", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Catatan Tambahan</p>
                        <p style={{ fontSize: 13, color: "#5a7a6a", background: "#f5f5e8", padding: 10, borderRadius: 10, margin: 0, border: "1px solid #e8e8d8" }}>
                          {session.additionalNotes}
                        </p>
                      </div>
                    )}

                    <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
                      <button 
                        onClick={(e) => handleDelete(session.id, e)}
                        style={{ background: "none", border: "1px solid #f0b8b8", color: "#c0392b", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                      >
                        Hapus Sesi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function LandingPage({ onStart, onHistory }) {
  const [quote] = useState(() => rand(QUOTES));
  const [renungan] = useState(() => rand(RENUNGAN));
  const pageRef = useRef(null);

  useEffect(() => {
    if (pageRef.current) {
      gsapObj.fromTo(pageRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#fcf9f2", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 16px", position: "relative", overflow: "hidden" }}>
      {/* Top Right Nav Button */}
      <div style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
        <button 
          onClick={onHistory}
          onMouseEnter={(e) => gsapObj.to(e.currentTarget, { scale: 1.02, y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", duration: 0.15, ease: "power2.out", overwrite: "auto" }) }
          onMouseLeave={(e) => gsapObj.to(e.currentTarget, { scale: 1, y: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", duration: 0.15, ease: "power2.out", overwrite: "auto" }) }
          style={{ background: "#fff", border: "1.5px solid #d8ebe3", color: "#4a9d7f", padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          <span>🗓️</span> Semua Sesi
        </button>
      </div>

      <div style={{ position: "absolute", top: -80, left: -80, width: 280, height: 280, background: "#d4eadf", borderRadius: "50%", opacity: 0.3, filter: "blur(40px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -80, right: -80, width: 320, height: 320, background: "#e8d4c4", borderRadius: "50%", opacity: 0.3, filter: "blur(40px)", pointerEvents: "none" }} />

      <div ref={pageRef} style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 440, display: "flex", flexDirection: "column", alignItems: "center", gap: 24, marginTop: 24 }}>

        {/* Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", padding: "8px 20px", borderRadius: 999, border: "1px solid #d8ebe3", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <span style={{ fontSize: 18 }}>🌿</span>
          <span style={{ color: "#4a9d7f", fontWeight: 700, fontSize: 14 }}>Ruang Tenang</span>
        </div>

        {/* Title */}
        <div style={{ textAlign: "center", padding: "0 8px" }}>
          <h1 className="rt-h1" style={{ fontSize: 34, fontWeight: 900, color: "#1e3a2a", lineHeight: 1.2, margin: 0 }}>
            Situational<br /><span style={{ color: "#4a9d7f" }}>Mindfulness Tool</span>
          </h1>
          <p style={{ color: "#6a8a78", fontSize: 14, marginTop: 10, lineHeight: 1.6 }}>Alat bantu mindfulness untuk guru PAUD<br />saat momen-momen menantang.</p>
        </div>

        {/* Afirmasi */}
        <div style={{ width: "100%", background: "#fff", borderRadius: 22, padding: "24px 20px", border: "1px solid #e0ece6", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", position: "relative" }}>
          <div style={{ position: "absolute", top: -12, left: 18, background: "#4a9d7f", color: "#fff", fontSize: 10, fontWeight: 800, padding: "4px 14px", borderRadius: 999, letterSpacing: 0.8 }}>AFIRMASI HARI INI</div>
          <div style={{ display: "flex", gap: 10, marginTop: 8, alignItems: "flex-start" }}>
            <p style={{ color: "#1e3a2a", fontSize: 14, fontStyle: "italic", lineHeight: 1.7, margin: 0, flex: 1 }}>
              <span style={{ color: "#4a9d7f", fontSize: 22, fontFamily: "Georgia, serif", fontStyle: "normal", verticalAlign: "bottom" }}>"</span>{quote}<span style={{ color: "#4a9d7f", fontSize: 22, fontFamily: "Georgia, serif", fontStyle: "normal", verticalAlign: "bottom" }}>"</span>
            </p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onStart}
          onMouseEnter={(e) => gsapObj.to(e.currentTarget, { scale: 1.02, y: -2, backgroundColor: "#3d8a6e", duration: 0.15, ease: "power2.out", overwrite: "auto" })}
          onMouseLeave={(e) => gsapObj.to(e.currentTarget, { scale: 1, y: 0, backgroundColor: "#4a9d7f", duration: 0.15, ease: "power2.out", overwrite: "auto" })}
          style={{
            width: "100%", background: "#4a9d7f", color: "#ffffff", border: "none",
            borderRadius: 16, padding: "16px 24px", fontWeight: 800, fontSize: 16,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: "0 6px 20px rgba(74,157,127,0.40)", letterSpacing: 0.2,
          }}
        >
          <span>💛</span> Mulai Sesi Tenang
        </button>
        <p style={{ color: "#9ab5a8", fontSize: 12, margin: "-8px 0 0", textAlign: "center" }}>Digunakan saat momen berat, bukan setiap hari.</p>

        {/* Renungan */}
        <div style={{ width: "100%", background: "#fff8ee", borderRadius: 18, padding: "18px 20px", border: "1px solid #e4d9c8" }}>
          <p style={{ color: "#a08060", fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 8px" }}>Renungan Untukmu</p>
          <p style={{ color: "#6a5840", fontSize: 14, fontStyle: "italic", lineHeight: 1.7, margin: 0 }}>
            <span style={{ color: "#c8a87a", fontSize: 18, fontFamily: "Georgia, serif", fontStyle: "normal" }}>"</span>
            {renungan}
            <span style={{ color: "#c8a87a", fontSize: 18, fontFamily: "Georgia, serif", fontStyle: "normal" }}>"</span>
          </p>
        </div>

        {/* Value grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%" }}>
          {[
            { icon: "🌱", label: "Merawat Pertumbuhan" },
            { icon: "☀️", label: "Membawa Kehangatan" },
            { icon: "💚", label: "Hadir Sepenuhnya" },
            { icon: "🕊️", label: "Memilih Tenang" },
          ].map((v) => (
            <div key={v.label} style={{ background: "#fff", borderRadius: 16, padding: "14px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 7, border: "1px solid #e8efe8", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <span style={{ fontSize: 22 }}>{v.icon}</span>
              <p style={{ color: "#5a7a6a", fontSize: 11, textAlign: "center", fontWeight: 700, margin: 0, lineHeight: 1.4 }}>{v.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MindfulnessPage({ onBack, onSaveSuccess, onHistory }) {
  const pageRef = useRef(null);
  const [data, setData] = useState({
    breathingDone: false,
    emotions: [],
    bodyParts: [],
    bodyOther: "",
    moment: "",
    responseType: [],
    nextResponses: [],
    nextResponseDetail: "",
    compassionReason: "",
    selfCare: [],
    additionalNotes: "",
  });

  const [footerQuote] = useState(() => rand(FOOTER_QUOTES));
  const [responseQuote, setResponseQuote] = useState(null);

  const update = (key, val) => setData((d) => ({ ...d, [key]: val }));

  const handleResponseType = (val) => {
    const newVal = data.responseType.includes(val) ? [] : [val];
    update("responseType", newVal);
    if (newVal.length > 0 && RESPONSE_QUOTES[val]) {
      setResponseQuote(rand(RESPONSE_QUOTES[val]));
    } else {
      setResponseQuote(null);
    }
  };

  useEffect(() => {
    if (pageRef.current) {
      gsapObj.fromTo(pageRef.current.children,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: "power2.out" }
      );
    }
  }, []);

  const allStepsComplete =
    data.emotions.length > 0 && data.moment.length > 10 &&
    data.responseType.length > 0 && data.selfCare.length > 0;

  const saveSession = () => {
    const newSession = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...data
    };
    
    const existing = safeGetSessions();
    safeSaveSessions([newSession, ...existing]);
    onSaveSuccess();
  };

  const inp = {
    width: "100%", border: "1.5px solid #c8ddd4", borderRadius: 12,
    padding: "11px 14px", fontSize: 14, color: "#1e3a2a",
    background: "#fff", outline: "none", boxSizing: "border-box",
    fontFamily: "inherit", WebkitAppearance: "none", appearance: "none",
    lineHeight: 1.6,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fcf9f2" }}>
      {/* Navbar */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "#fff", borderBottom: "1px solid #e0ece6", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "#4a9d7f", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>← Beranda</button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🌿</span>
            <span style={{ fontWeight: 800, color: "#1e3a2a", fontSize: 15 }}>Ruang Tenang</span>
          </div>
          <button onClick={onHistory} style={{ background: "none", border: "none", color: "#4a9d7f", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>🗓️ Sesi</button>
        </div>
      </div>

      <div ref={pageRef} style={{ maxWidth: 600, margin: "0 auto", padding: "16px 12px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Greeting */}
        <div style={{ background: "linear-gradient(135deg, #e8f8f0 0%, #f0faf6 100%)", borderRadius: 24, padding: 24, border: "1px solid #c8e8d8", display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#4a9d7f22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>🪴</div>
          <div>
            <p style={{ fontWeight: 800, color: "#1e3a2a", fontSize: 18, margin: 0 }}>Halo, Guru Hebat!</p>
            <p style={{ color: "#5a8a72", fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>Ambil jeda sejenak. Alat ini hadir menemanimu saat momen kelas yang menantang.</p>
          </div>
        </div>

        {/* ── STEP 1: PAUSE ── */}
        <StepCard number="1" title="PAUSE — Jeda Dulu" subtitle="Tarik napas perlahan sebelum melanjutkan" accentColor="#4a9d7f" bgColor="#f0fdf8" completed={data.breathingDone}>
          <p style={{ fontSize: 13, color: "#6a8a78", marginBottom: 16 }}>
            Lakukan latihan napas: <strong style={{ color: "#4a9d7f" }}>Tarik → Tahan → Hembuskan</strong>
          </p>
          {!data.breathingDone ? (
            <BreathingGuide onDone={() => update("breathingDone", true)} />
          ) : (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <p style={{ color: "#4a9d7f", fontWeight: 700, fontSize: 15 }}>✓ Latihan napas selesai!</p>
              <button onClick={() => update("breathingDone", false)} style={{ fontSize: 12, color: "#9ab5a8", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", marginTop: 6 }}>Ulangi</button>
            </div>
          )}
        </StepCard>

        {/* ── STEP 2: AWARENESS ── */}
        <StepCard number="2" title="SADAR DIRI — Awareness" subtitle="Kenali apa yang sedang kamu rasakan" accentColor="#7b6fad" bgColor="#f5f3fc" completed={data.emotions.length > 0 && data.bodyParts.length > 0}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Emotion */}
            <div>
              <SectionLabel>Aku sedang merasa:</SectionLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {EMOTION_OPTIONS.map((opt) => (
                  <OptionPill
                    key={opt.value}
                    selected={data.emotions.includes(opt.value)}
                    onClick={() => {
                      const cur = data.emotions;
                      update("emotions", cur.includes(opt.value) ? cur.filter((v) => v !== opt.value) : [...cur, opt.value]);
                    }}
                    selectedColor="#c0392b"
                  >
                    <span style={{ fontSize: 20 }}>{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </OptionPill>
                ))}
              </div>
            </div>

            {/* Body parts */}
            <div>
              <SectionLabel>Di bagian tubuh mana aku merasakannya?</SectionLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {BODY_PARTS.map((b) => (
                  <OptionPill
                    key={b}
                    selected={data.bodyParts.includes(b.toLowerCase())}
                    onClick={() => {
                      const v = b.toLowerCase();
                      const cur = data.bodyParts;
                      update("bodyParts", cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]);
                    }}
                    selectedColor="#c0392b"
                  >
                    {b}
                  </OptionPill>
                ))}
              </div>
              <input
                style={{ ...inp, marginTop: 10 }}
                placeholder="Atau tuliskan bagian tubuh lainnya..."
                value={data.bodyOther}
                onChange={(e) => update("bodyOther", e.target.value)}
              />
            </div>

            {/* Body map */}
            <div style={{ background: "linear-gradient(135deg, #f5f3fc, #ede8fa)", borderRadius: 16, padding: 16, display: "flex", justifyContent: "center", border: "1px solid #d0c8f0" }}>
              <svg viewBox="0 0 120 220" style={{ width: 88 }} fill="none">
                <ellipse cx="60" cy="25" rx="18" ry="22" fill={data.bodyParts.includes("kepala") ? "#c0392b" : "#d0c8f0"} />
                <rect x="45" y="47" width="30" height="50" rx="8" fill={data.bodyParts.includes("dada") ? "#c0392b" : "#d0c8f0"} />
                <rect x="20" y="50" width="22" height="38" rx="8" fill={data.bodyParts.includes("bahu") ? "#c0392b" : "#d0c8f0"} />
                <rect x="78" y="50" width="22" height="38" rx="8" fill={data.bodyParts.includes("bahu") ? "#c0392b" : "#d0c8f0"} />
                <rect x="47" y="97" width="26" height="42" rx="8" fill={data.bodyParts.includes("perut") ? "#c0392b" : "#d0c8f0"} />
                <rect x="35" y="139" width="20" height="50" rx="8" fill={data.bodyParts.includes("kaki") ? "#c0392b" : "#d0c8f0"} />
                <rect x="65" y="139" width="20" height="50" rx="8" fill={data.bodyParts.includes("kaki") ? "#c0392b" : "#d0c8f0"} />
                <rect x="14" y="88" width="16" height="40" rx="7" fill={data.bodyParts.includes("tangan") ? "#c0392b" : "#d0c8f0"} />
                <rect x="90" y="88" width="16" height="40" rx="7" fill={data.bodyParts.includes("tangan") ? "#c0392b" : "#d0c8f0"} />
              </svg>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", paddingLeft: 14, gap: 6 }}>
                {BODY_PARTS.map((b) => (
                  <div key={b} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: data.bodyParts.includes(b.toLowerCase()) ? "#c0392b" : "#d0c8f0", flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: data.bodyParts.includes(b.toLowerCase()) ? "#c0392b" : "#9a8aba", fontWeight: data.bodyParts.includes(b.toLowerCase()) ? 700 : 400 }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </StepCard>

        {/* ── STEP 3: MOMENT ── */}
        <StepCard number="3" title="MOMEN YANG TERJADI" subtitle="Tanpa menghakimi — fokus ke kejadian" accentColor="#d4845a" bgColor="#fdf5ee" completed={data.moment.length > 10}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ fontSize: 13, color: "#7a6a5a", margin: 0 }}>Apa yang baru saja terjadi? Ceritakan dengan jujur tanpa menyalahkan diri atau orang lain.</p>
            <textarea
              rows={5}
              style={{ ...inp, resize: "none", lineHeight: 1.7 }}
              placeholder="Contoh: Tadi ada murid yang tidak mau mendengarkan dan saya merasa..."
              value={data.moment}
              onChange={(e) => update("moment", e.target.value)}
            />
            {/* High-contrast hint */}
            <div style={{ background: "#d4845a", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
              <p style={{ fontSize: 13, color: "#ffffff", fontWeight: 700, margin: 0 }}>Fokus ke kejadian, bukan menyalahkan diri sendiri atau orang lain.</p>
            </div>
          </div>
        </StepCard>

        {/* ── STEP 4: CONSCIOUS RESPONSE ── */}
        <StepCard number="4" title="RESPON SADAR" subtitle="Refleksikan dan rencanakan langkah selanjutnya" accentColor="#5a8fc0" bgColor="#f0f6fd" completed={data.responseType.length > 0}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Response type — single select */}
            <div>
              <SectionLabel>Responku tadi:</SectionLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {RESPONSE_TYPES.map((opt) => (
                  <OptionPill
                    key={opt.value}
                    selected={data.responseType.includes(opt.value)}
                    onClick={() => handleResponseType(opt.value)}
                    selectedColor="#5a8fc0"
                  >
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                  </OptionPill>
                ))}
              </div>

              {/* Dynamic quote based on selected response */}
              {responseQuote && (
                <div style={{ marginTop: 14, background: "linear-gradient(135deg, #e8f0fa, #f0f6fd)", borderRadius: 14, padding: "14px 16px", border: "1.5px solid #b8d0e8" }}>
                  <p style={{ fontSize: 13, color: "#2d4a6a", fontStyle: "italic", lineHeight: 1.7, margin: 0 }}>
                    <span style={{ color: "#5a8fc0", fontSize: 20, fontFamily: "Georgia, serif", fontStyle: "normal" }}>"</span>
                    {responseQuote}
                    <span style={{ color: "#5a8fc0", fontSize: 20, fontFamily: "Georgia, serif", fontStyle: "normal" }}>"</span>
                  </p>
                </div>
              )}
            </div>

            {/* Next response — multi select */}
            <div>
              <SectionLabel>Jika diulang, aku ingin mencoba:</SectionLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {NEXT_RESPONSES.map((opt) => (
                  <OptionPill
                    key={opt.value}
                    selected={data.nextResponses.includes(opt.value)}
                    onClick={() => {
                      const cur = data.nextResponses;
                      const hasVal = cur.includes(opt.value);
                      const newVal = hasVal ? cur.filter((v) => v !== opt.value) : [...cur, opt.value];
                      update("nextResponses", newVal);
                    }}
                    selectedColor="#5a8fc0"
                  >
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                  </OptionPill>
                ))}
              </div>
            </div>

            {/* Detail field — always visible when next responses picked */}
            {data.nextResponses.length > 0 && (
              <div>
                <SectionLabel>Ceritakan rencanamu lebih detail:</SectionLabel>
                <textarea
                  rows={4}
                  style={{ ...inp, resize: "none", lineHeight: 1.7 }}
                  placeholder="Contoh: Saya akan mengambil napas dalam dulu sebelum bicara, dan akan memilih kata-kata yang lebih lembut..."
                  value={data.nextResponseDetail}
                  onChange={(e) => update("nextResponseDetail", e.target.value)}
                />
              </div>
            )}

            <div style={{ background: "#e8f0fa", borderRadius: 12, padding: "12px 16px", textAlign: "center", border: "1px solid #c0d8f0" }}>
              <p style={{ color: "#3d6a9a", fontSize: 13, fontWeight: 700, margin: 0 }}>✨ Aku bisa memilih respon yang lebih baik.</p>
            </div>
          </div>
        </StepCard>

        {/* ── STEP 5: SELF-COMPASSION ── */}
        <StepCard number="5" title="SELF-COMPASSION" subtitle="Kasih sayang untuk diri sendiri" accentColor="#c0608a" bgColor="#fdf0f6" completed={data.selfCare.length > 0}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Compassion reason — textarea */}
            <div>
              <SectionLabel>Tidak apa-apa aku merasa seperti ini karena:</SectionLabel>
              <textarea
                rows={5}
                style={{ ...inp, resize: "none", lineHeight: 1.7 }}
                placeholder={"Contoh: Hari ini jadwalku sangat padat dan aku lelah...\n\nAku sudah berusaha keras untuk anak-anak walau kondisiku sedang tidak ideal...\n\nIni adalah reaksi manusiawi dan aku berhak merasakannya..."}
                value={data.compassionReason}
                onChange={(e) => update("compassionReason", e.target.value)}
              />
            </div>

            {/* Self care — icon grid */}
            <div>
              <SectionLabel>Hal kecil yang akan aku lakukan untuk diriku sekarang:</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 8 }}>
                {SELF_CARE.map((opt) => {
                  const sel = data.selfCare.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        const cur = data.selfCare;
                        update("selfCare", cur.includes(opt.value) ? cur.filter((v) => v !== opt.value) : [...cur, opt.value]);
                      }}
                      onMouseEnter={(e) => { if(!sel) gsapObj.to(e.currentTarget, { scale: 1.02, y: -2, duration: 0.15, ease: "power2.out", overwrite: "auto" }) }}
                      onMouseLeave={(e) => { if(!sel) gsapObj.to(e.currentTarget, { scale: 1, y: 0, duration: 0.15, ease: "power2.out", overwrite: "auto" }) }}
                      style={{
                        background: sel ? "#fff0f4" : "#fff",
                        border: `2px solid ${sel ? "#c0608a" : "#d8c0cc"}`,
                        borderRadius: 14, padding: "14px 8px",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                        cursor: "pointer",
                        boxShadow: sel ? "0 2px 10px rgba(192,96,138,0.25)" : "none",
                        transform: sel ? "scale(1.02)" : "scale(1)",
                        transition: "border 0.2s, background 0.2s, box-shadow 0.2s"
                      }}
                    >
                      <span style={{ fontSize: 24 }}>{opt.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: sel ? 700 : 500, color: sel ? "#c0608a" : "#7a6a72", textAlign: "center", lineHeight: 1.3 }}>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ background: "linear-gradient(135deg, #fde8f0, #fdf0f6)", borderRadius: 14, padding: "14px 18px", textAlign: "center", border: "1.5px solid #f0c0d4" }}>
              <p style={{ color: "#c0608a", fontWeight: 800, fontSize: 14, margin: 0 }}>🤗 Aku berharga.</p>
              <p style={{ color: "#c0608a", fontSize: 12, marginTop: 4 }}>Aku sudah melakukan yang terbaik hari ini.</p>
            </div>
          </div>
        </StepCard>

        {/* ── CATATAN TAMBAHAN ── */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #e0ece6", padding: 20, boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <p style={{ fontWeight: 700, color: "#1e3a2a", marginBottom: 12, fontSize: 14 }}>📌 Catatan Tambahan <span style={{ color: "#9ab5a8", fontWeight: 400 }}>(opsional)</span></p>
          <textarea
            rows={6}
            style={{ ...inp, resize: "vertical", lineHeight: 1.7, minHeight: 120 }}
            placeholder={"Tulis apapun yang ingin kamu catat dari sesi ini...\n\nBisa berupa:\n- Hal yang ingin kamu ingat\n- Perasaan yang belum tersampaikan\n- Rencana untuk esok hari\n- Apapun yang terasa penting untukmu"}
            value={data.additionalNotes}
            onChange={(e) => update("additionalNotes", e.target.value)}
          />
        </div>

        {/* ── DYNAMIC FOOTER QUOTE ── */}
        <div style={{ background: "#fff8f0", borderRadius: 20, border: "1px solid #f0e0d0", padding: "18px 20px", display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#fde0e8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 18 }}>❤️</span>
          </div>
          <div>
            <p style={{ color: "#8a4a30", fontWeight: 800, fontSize: 14, margin: 0 }}>{footerQuote.title}</p>
            <p style={{ color: "#a07060", fontSize: 13, marginTop: 5, lineHeight: 1.6 }}>{footerQuote.body}</p>
          </div>
        </div>

        {/* ── PROGRESS + SIMPAN ── */}
        <div style={{ background: "#fff", borderRadius: 20, border: allStepsComplete ? "1.5px solid #4a9d7f" : "1.5px solid #e0ece6", padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <p style={{ fontWeight: 700, color: "#1e3a2a", textAlign: "center", margin: "0 0 6px", fontSize: 15 }}>
            {allStepsComplete ? "🎉 Sesi Selesai!" : "Progress Sesimu"}
          </p>
          <p style={{ color: "#7a9a8a", fontSize: 12, textAlign: "center", margin: "0 0 14px" }}>
            {allStepsComplete ? "Kamu sudah melewati semua langkah. Simpan ringkasanmu!" : "Lengkapi semua langkah untuk menyimpan ringkasan sesi."}
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20, width: "100%" }}>
            {[
              { done: data.emotions.length > 0, label: "Emosi" },
              { done: data.moment.length > 10, label: "Momen" },
              { done: data.responseType.length > 0, label: "Respon" },
              { done: data.selfCare.length > 0, label: "Self-care" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flex: 1 }}>
                <div style={{ width: "100%", height: 7, borderRadius: 4, background: s.done ? "#4a9d7f" : "#d8ebe3", transition: "background 0.4s" }} />
                <span style={{ fontSize: 10, color: s.done ? "#4a9d7f" : "#b0c8be", fontWeight: s.done ? 800 : 500, whiteSpace: "nowrap" }}>{s.done ? "✓ " : ""}{s.label}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              onClick={saveSession}
              disabled={!allStepsComplete}
              onMouseEnter={(e) => { if(allStepsComplete) gsapObj.to(e.currentTarget, { scale: 1.02, y: -2, backgroundColor: "#3d8a6e", duration: 0.15, ease: "power2.out", overwrite: "auto" }) }}
              onMouseLeave={(e) => { if(allStepsComplete) gsapObj.to(e.currentTarget, { scale: 1, y: 0, backgroundColor: "#4a9d7f", duration: 0.15, ease: "power2.out", overwrite: "auto" }) }}
              style={{
                width: "100%",
                background: allStepsComplete ? "#4a9d7f" : "#e0ece6",
                color: allStepsComplete ? "#ffffff" : "#9ab5a8",
                border: "none",
                borderRadius: 16,
                padding: "16px 24px",
                fontWeight: 800,
                fontSize: 15,
                cursor: allStepsComplete ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                boxShadow: allStepsComplete ? "0 6px 20px rgba(74,157,127,0.3)" : "none",
              }}
            >
              <span style={{ fontSize: 18 }}>💾</span> Simpan Ringkasan Sesi
            </button>
          </div>
        </div>

        <div style={{ height: 32 }} />
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("landing"); // Pages: "landing", "mindfulness", "history"
  const [gsapReady, setGsapReady] = useState(false);

  // Inject responsive global styles once and load GSAP
  useEffect(() => {
    const id = "ruangtenang-global";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html { -webkit-text-size-adjust: 100%; }
        body { margin: 0; padding: 0; overflow-x: hidden; }
        input, textarea, button, select {
          font-family: 'Nunito', 'Segoe UI', sans-serif;
          -webkit-appearance: none;
          appearance: none;
        }
        textarea { resize: vertical; }
        /* Fluid type scale */
        @media (max-width: 480px) {
          .rt-h1 { font-size: 28px !important; }
          .rt-card-pad { padding: 16px !important; }
          .rt-grid-3 { grid-template-columns: 1fr 1fr !important; }
          .rt-pill-wrap { gap: 6px !important; }
        }
      `;
      document.head.appendChild(style);
    }

    // Load GSAP via CDN dengan penanganan error
    if (window.gsap) {
      setGsapReady(true);
    } else {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";
      script.onload = () => setGsapReady(true);
      script.onerror = () => {
        console.warn("Gagal memuat animasi GSAP. Aplikasi akan dilanjutkan tanpa animasi.");
        setGsapReady(true); // Tetap izinkan aplikasi terbuka!
      };
      document.head.appendChild(script);
    }
  }, []);

  if (!gsapReady) {
    return (
      <div style={{ minHeight: "100vh", background: "#fcf9f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "'Nunito', sans-serif", color: "#4a9d7f", fontWeight: 700 }}>Memuat antarmuka...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Nunito', 'Segoe UI', sans-serif", WebkitFontSmoothing: "antialiased" }}>
      {page === "landing" && (
        <LandingPage 
          onStart={() => setPage("mindfulness")} 
          onHistory={() => setPage("history")}
        />
      )}
      {page === "mindfulness" && (
        <MindfulnessPage 
          onBack={() => setPage("landing")} 
          onHistory={() => setPage("history")}
          onSaveSuccess={() => setPage("history")}
        />
      )}
      {page === "history" && (
        <HistoryPage 
          onBack={() => setPage("landing")} 
        />
      )}
    </div>
  );
}