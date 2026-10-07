# Paylaşım rehberi

Hazır olanlar:
- `video/exo-vitrin.mp4`: 73 saniyelik tanıtım videosu (1280×720, H.264 + AAC, X ile uyumlu, 5 MB)
- `video/kapak.jpg`: videonun açılış karesi
- `README.md`, `LICENSE`, `.gitignore`: GitHub deposu için

---

## 1. GitHub'a yükle (git kurmadan, tarayıcıdan)

1. https://github.com/new adresinde depo adı olarak `yetenek-vitrini` yaz, **Public** seç, başka hiçbir şeyi işaretleme ve **Create repository** de.
2. Açılan sayfada **"uploading an existing file"** bağlantısına tıkla.
3. `yetenek-vitrini` klasörünün **içindeki** her şeyi sürükleyip bırak. Klasör yapısı korunur.
   - **Hariç tut:** `video/kayit.webm` (34 MB). Ham kayıt, gerekmiyor; zaten GitHub'ın 25 MB web yükleme sınırını aşıyor.
4. **Commit changes** de.

## 2. GitHub Pages'i aç (canlı link)

1. Depoda **Settings → Pages** bölümüne git.
2. *Source:* **Deploy from a branch**. *Branch:* **main**, klasör **/ (root)**. **Save** de.
3. 1–2 dakika sonra link hazır olur: `https://KULLANICI_ADIN.github.io/yetenek-vitrini/`
4. `README.md` ve `LICENSE` içindeki `KULLANICI_ADI` yazan yerleri kendi kullanıcı adınla değiştir. GitHub'da dosyayı açıp kalem simgesine tıklaman yeterli.
5. Linki telefonda da açıp test et. Seslerin çalması için sayfaya bir kez dokunmak gerekebilir; bu, tarayıcıların otomatik ses çalma kuralı.

## 3. X'te paylaş

**İpuçları**
- Videoyu doğrudan X'e yükle. YouTube linki koyma; yerel video çok daha fazla etkileşim alır.
- Linki ana tweete koy. Premium hesaplarda link içeren tweetlerin erişimi daha az düşüyor; yine de emin olmak istersen linki ilk yanıta da ekleyebilirsin.
- Zamanlama önemli: model yeni çıktı. Ne kadar erken paylaşırsan o kadar iyi.
- `@opencode` hesabını etiketle. Hesap adını paylaşmadan önce X'te doğrula.

### Ana tweet (İngilizce, önerilen)

> OpenCode just added a free stealth model called "exo", so I spent my first session stress-testing it.
>
> One HTML file. Zero libraries. 7 working demos, all from scratch:
>
> 🧠 its own programming language (lexer → parser → bytecode VM)
> ⚙️ a 2D physics engine
> ✨ a ray tracer with glass refraction
> 📐 exact large-angle pendulum period, verified numerically
> 🎮 a playable story game with FSM + pathfinding enemies
> 🤖 an agent team that catches a deliberately broken worker
> 📊 a neural net trained live in the browser
>
> + Turkish voiceover, generated locally.
>
> The part that impressed me most: it tested its own work. Its classifier first scored 29% on the test set, it figured out why (mirrored train/test sentences), fixed the dataset and got it to 73%.
>
> Try it yourself 👇
> https://KULLANICI_ADIN.github.io/yetenek-vitrini/
>
> @opencode

### Devam yanıtları (thread, isteğe bağlı)

**2/**
> How it went: I asked "what's the most you can do?", then "build a minimal example of each, testable from one HTML page".
>
> It planned 7 demos, wrote ~1,000 lines, opened them in a browser, checked console errors and outputs, and fixed what was broken before handing it over. Several turns, not one prompt.

**3/**
> My favorite detail is the agent demo. One worker is secretly configured to return wrong results. The reviewer re-checks every chunk with a *different* algorithm (Miller–Rabin vs. a sieve), catches the fake prime, quarantines the worker and spawns a replacement.
>
> Final count: 148,933 primes below 2M, which matches the known value exactly.

**4/**
> Even the promo video was made by the model: it wrote a "director" script that auto-plays every demo (including an autopilot for the game), mixes in the voice clips and records it all in the browser.
>
> While recording, it caught and fixed two of its own bugs: the first 30 seconds were missing, and the game's autopilot got stuck 3 pixels from its target.

**5/**
> Honest notes:
> • the agents in demo 6 are deterministic programs, not LLMs. It's the coordination pattern
> • the ML dataset is tiny on purpose (112 sentences)
> • voiceover is AI-generated (EMA Lightning, offline Turkish TTS)
>
> Next: I'll turn some of these into real products, one step at a time. Follow along 🛠️

### Türkçe versiyon (Türk geliştirici topluluğu için)

> OpenCode'a ücretsiz olarak yeni bir "stealth" model geldi: exo. İlk oturumumda sınırlarını test ettim.
>
> Tek HTML dosyası, sıfır kütüphane, 7 çalışan demo:
>
> 🧠 kendi programlama dili (lexer → parser → bytecode VM)
> ⚙️ 2B fizik motoru
> ✨ cam kırılmalı ray tracer
> 📐 büyük açılı sarkacın tam periyodu, sayısal olarak doğrulanmış
> 🎮 düşman yapay zekâlı, hikâyeli, oynanabilir bir oyun
> 🤖 hatalı ajanı yakalayan bir ajan ekibi
> 📊 tarayıcıda canlı eğitilen bir sinir ağı
>
> Üstüne Türkçe seslendirme (yerel, çevrimdışı TTS).
>
> En etkileyici kısmı: kendi işini test etti. Modelin sınıflandırıcısı ilk denemede test setinde %29 aldı; nedenini buldu, veri setini düzeltti ve %73'e çıkardı.
>
> Kendin dene 👇
> https://KULLANICI_ADIN.github.io/yetenek-vitrini/

---

**Not:** Videoda ilk ~33 saniye sessiz. Konuşma yalnızca oyun ve ajan bölümlerinde var. X'te videolar genellikle sessiz başlar, yani bu sorun değil. Ama istersen telifsiz bir arka plan müziği ekleyebilirim.
