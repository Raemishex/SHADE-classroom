# SHADE Classroom 🕵️‍♂️ (v2.0)

SHADE Classroom dostlarınızla eyni otaqda oynaya biləcəyiniz, real-vaxt (real-time) sosial deduksiya və söz oyunudur.

## Oyun Haqqında

Oyunda oyunçular iki qrupa bölünür:
- **✅ Vətəndaşlar:** Gizli sözü (məsələn, "Pizza") görən və onu izah edərək digər vətəndaşları tapmağa, eyni zamanda imposterləri ifşa etməyə çalışan oyunçular.
- **🔴 İmposterlər:** Gizli sözü bilməyən, ancaq sözün aid olduğu **kateqoriyanı** (məsələn, "Yeməklər") bilən oyunçular. Onların məqsədi vətəndaşlar kimi davranıb gizli sözü təxmin etmək və diqqəti öz üzərilərindən yayındırmaqdır.

Oyun heç bir səsvermə ekranı və ya taymer olmadan tamamən "real həyatda" davam edir. Ekranda yalnız lazım olan məlumatlar göstərilir, qalan hər şey müzakirə üzərində qurulur.

---

## v2.0 — Yeniliklər və Dəyişikliklər 🚀

### 🎨 Tam Yenilənmiş Dizayn (Neon Noir Glass)
- Bütün interfeys sıfırdan yenidən dizayn edilib: qaranlıq glassmorphism temalı, neon işıqlar, premium tipografiya (Rajdhani, Syne, Space Mono).
- Hər səhifə üçün hamar keçid animasiyaları (page transitions) əlavə olunub.
- Mobil cihazlara tam uyğunlaşdırılmış responsive dizayn.

### 🔒 Təkmilləşdirilmiş Gizlilik Sistemi
- Oyun ekranında (GamePage) yuxarıdakı rol paneli artıq **tamamilə neytral** görünür — kənardan baxan birinin sizin imposter və ya vətəndaş olduğunuzu bilməsi mümkün deyil.
- Gizli söz və kateqoriya `••••••••` ilə maskalanır. Yalnız 👁️ (Peek) düyməsinə basıldıqda açılır.

### 🎯 İmposter Mexanikası Təkmilləşdirmələri
- **İmposter sayı 1-dən 5-ə qədər** dəstəklənir (əvvəl yalnız 1-2 idi).
- **Ədalətli paylanma alqoritmi:** İmposter rolu artıq hər raundda tarix əsasında paylanır — ən az imposter olmuş oyunçulara növbəti raundlarda prioritet verilir. Eyni oyunçunun ardıcıl imposter olma problemi həll edildi.
- **İmposter İpucu rejimi:** Host tərəfindən açılıb-bağlana bilən yeni tənzimləmə. Bağlı olduqda imposterə kateqoriya göstərilmir — oyun daha çətin olur.

### 🤝 İmposter İttifaqı
- İmposterlər istəyə bağlı olaraq bir-birini görə bilər (Host tərəfindən aktivləşdirilir).

### 👢 Oyunçunu Çıxartma (Kick)
- Host artıq Lobby-dən AFK qalan, xətdə olmayan və ya istənməyən oyunçuları **otaqdan çıxara bilər** (X düyməsi).

### 📋 Otaq Kodu Kopyalama
- Otaq koduna kliklədikdə avtomatik olaraq **clipboard-ə kopyalanır** və "Kopyalandı!" bildirişi göstərilir.

### ⬅️ Geri Düyməsi
- Lobby ekranında sol üst küncdə **geri oxu** düyməsi əlavə olunub — otaqdan çıxmaq üçün istifadə olunur.

### 📡 Bağlantı İndikatoru
- İnternet bağlantısı kəsildikdə ekranın yuxarısında **"Bağlantı kəsildi"** bildirişi avtomatik görünür.

### 🏷️ Kateqoriya Sayğacı
- Lobby-də seçilmiş kateqoriyaların sayı açıq şəkildə göstərilir (məsələn, "Kateqoriyalar (3/10)").

---

## Xüsusiyyətlər (Features)
- 🚀 **Real-Time Multiplayer:** Socket.io ilə eyni anda çoxlu oyunçu dəstəyi.
- 🎨 **Neon Noir Glass UI:** Gecə oyunları və partilər üçün premium dizayn.
- 🔒 **Gizlilik:** Telefonunuzun ekranındakı söz arxada gizlədilir. Yalnız 👁️ düyməsinə basıb saxladığınız zaman görünür.
- 🤝 **İmposter İttifaqı:** İmposterlər istərsə bir-birini görə bilərlər.
- 👢 **Kick Sistemi:** Host istənməyən oyunçuları otaqdan çıxara bilər.
- 📋 **Kopyalama:** Otaq kodu bir klik ilə kopyalanır.
- ⚖️ **Ədalətli Paylanma:** İmposter rolu bərabər paylanır, eyni oyunçu ardıcıl seçilmir.

## Necə Oynamaq Olar?
1. Bir nəfər **"Otaq Yarat"** düyməsinə basır və 4 rəqəmli otaq kodu əldə edir.
2. Digər dostlar **"Otağa Qoşul"** edib bu kodu daxil edirlər.
3. Host oyun tənzimləmələrini (İmposter sayı, kateqoriyalar, İttifaq, İpucu rejimi) seçir və oyunu başladır.
4. Hər kəs telefonunda gələn **Kartı görmək üçün basıb saxla** funksiyası ilə roluna və sözünə (və ya ipucusuna) baxır.
5. "İlk danışan" kimi təyin olunan oyunçudan başlayaraq hər kəs sözlə bağlı bir cümlə deyir.
6. Müzakirələrdən sonra imposterin kim olduğuna səs verilir.
7. Host **"Oyunu Bitir"** düyməsinə basaraq əsl İmposterlərin kim olduğunu ekranda hamıya açıqlayır.
