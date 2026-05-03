# SHADE Classroom 🕵️‍♂️ (v1.0 Beta)

SHADE Classroom dostlarınızla eyni otaqda oynaya biləcəyiniz, real-vaxt (real-time) sosial deduksiya və söz oyunudur. Bu versiya oyunun **İlk Beta Versiyasıdır (v1.0)**.

## Oyun Haqqında

Oyunda oyunçular iki qrupa bölünür:
- **✅ Vətəndaşlar:** Gizli sözü (məsələn, "Pizza") görən və onu izah edərək digər vətəndaşları tapmağa, eyni zamanda imposterləri ifşa etməyə çalışan oyunçular.
- **🔴 İmposterlər:** Gizli sözü bilməyən, ancaq sözün aid olduğu **kateqoriyanı** (məsələn, "Yeməklər") bilən oyunçular. Onların məqsədi vətəndaşlar kimi davranıb gizli sözü təxmin etmək və diqqəti öz üzərilərindən yayındırmaqdır.

Oyun heç bir səsvermə ekranı və ya taymer olmadan tamamən "real həyatda" davam edir. Ekranda yalnız lazım olan məlumatlar göstərilir, qalan hər şey müzakirə üzərində qurulur.

## Xüsusiyyətlər (Features)
- 🚀 **Real-Time Multiplayer:** Socket.io ilə eyni anda çoxlu oyunçu dəstəyi.
- 🎨 **Tünd Mövzu və Neon UI:** Gecə oyunları və partilər üçün uyğun dizayn.
- 🔒 **Gizlilik:** Telefonunuzun ekranındakı söz "Gizlilik qorunur" rejimində arxada gizlədilir. Yalnız (👁️) düyməsinə basıb saxladığınız zaman görünür.
- 🤝 **İmposter İttifaqı:** İmposterlər istərsə bir-birini görə bilərlər.

## Necə Oynamaq Olar?
1. Bir nəfər **"Otaq Yarat"** düyməsinə basır və 4 rəqəmli otaq kodu əldə edir.
2. Digər dostlar **"Otağa Qoşul"** edib bu kodu daxil edirlər.
3. Host oyun tənzimləmələrini (İmposter sayı, kateqoriyalar) seçir və oyunu başladır.
4. Hər kəs telefonunda gələn **Kartı görmək üçün basıb saxla** funksiyası ilə roluna və sözünə (və ya ipucusuna) baxır.
5. "İlk danışan" kimi təyin olunan oyunçudan başlayaraq hər kəs sözlə bağlı bir cümlə deyir.
6. Müzakirələrdən sonra imposterin kim olduğuna səs verilir.
7. Host **"Oyunu Bitir"** düyməsinə basaraq əsl İmposterlərin kim olduğunu ekranda hamıya açıqlayır.

---

## Serveri və Frontendi Necə Host Etmək Olar? (Dostlarla Oynamaq Üçün Təlimat)

Oyunu uzaqdan və fərqli cihazlarda oynamaq üçün backend (server) və frontend (client) hissələrini fərqli platformalarda pulsuz host edə bilərsiniz.

### 1. Backend (Server) Hostinqi (Railway, Koyeb və ya Fly.io)
Çünki server Node.js və Socket.io istifadə edir, onu 24/7 və ya sorğu əsasında aktiv ola biləcək bir platformada yükləməlisiniz. (Render bəzi regionlarda dəstəyi dayandırdığı üçün bu alternativlərdən birini seçə bilərsiniz).
- **Tövsiyə olunan:** [Railway.app](https://railway.app), [Koyeb.com](https://koyeb.com) və ya [Fly.io](https://fly.io).
- **Quraşdırma (Məsələn, Railway.app):**
  1. Yalnız `server` qovluğunu ayrı bir GitHub repozitoriyasına yükləyin (və ya repoda Root Directory olaraq `server` seçin).
  2. Railway.app-da yeni "Project" yaradın və "Deploy from GitHub repo" seçin.
  3. GitHub reposunu seçin və Railway onu avtomatik analiz edib Node.js olduğunu anlayacaq.
  4. Start Command olaraq `node index.js` təyin edin.
  5. Deploy etdikdən sonra Railway sizə bir URL verəcək (məsələn: `https://kostebek-server.up.railway.app`). Bu sizin backend URL-iniz olacaq.

### 2. Frontend (Client) Hostinqi (Vercel və ya Netlify)
Frontend React və Vite üzərində qurulub, statik fayllar olduğu üçün Vercel-də pulsuz host edə bilərsiniz.
- **Quraşdırma:**
  1. `client` qovluğunu GitHub-a yükləyin.
  2. [Vercel.com](https://vercel.com) saytına daxil olub yeni layihə (Add New Project) əlavə edin.
  3. Yüklədiyiniz repozitoriyanı seçin. Root Directory kimi `client` təyin edin.
  4. **Ən vacib addım:** "Environment Variables" (Mühit Dəyişənləri) bölməsinə daxil olun.
     - Key: `VITE_SOCKET_URL`
     - Value: Bayaq Railway-dən aldığınız backend URL-i (məsələn: `https://kostebek-server.up.railway.app`)
  5. Deploy edin. 

Bununla da oyun tamamilə onlayn olacaq və dostlarınızla onlayn otaqlar yaradıb oynaya biləcəksiniz!

---
**Versiya:** v1.0 (Beta)
