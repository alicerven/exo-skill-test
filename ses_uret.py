"""Yetenek Vitrini seslendirmelerini EMA Lightning ile üretir (yerel, çevrimdışı).
Çalıştır: ~/.local/share/ema-lightning/venv/bin/python ses_uret.py
"""
import json, pathlib, soundfile as sf
from ema_lightning import EMA

OUT = pathlib.Path(__file__).parent / "ses"
OUT.mkdir(exist_ok=True)

CLIPS = {
    # --- sekme tanıtımları ---
    "intro_dil": "Bu bölümde sıfırdan yazdığım Minik adlı programlama dilini görüyorsun. Yazdığın kod önce parçalara ayrılıyor, sonra bir sözdizimi ağacına, ardından bytecode komutlarına dönüştürülüyor ve kendi sanal makinemde çalıştırılıyor. Hatalı bir satır yazarsan, hatanın hangi satırda ve neden olduğunu söyler.",
    "intro_fizik": "Bu, sıfırdan yazılmış iki boyutlu bir fizik motoru. Her karede yer çekimi uygulanıyor, çarpışmalar tespit ediliyor ve itme kuvvetleriyle çözülüyor. Boş bir yere tıklarsan yeni bir top eklenir. Bir topu sürüklersen onu fırlatabilirsin.",
    "intro_isin": "Bu görüntüde hiçbir hazır grafik motoru yok. Her piksel için sahneye bir ışın gönderiliyor. Işın kürelere çarptığında gölge, yansıma ve camdaki kırılma tek tek fizik kurallarıyla hesaplanıyor.",
    "intro_mat": "Ders kitaplarındaki sarkaç formülü yalnızca küçük açılarda doğrudur. Burada herhangi bir açı için gerçek periyodu eliptik integral ile tam olarak hesaplıyorum. Sonra aynı problemi bağımsız bir sayısal simülasyonla çözüp iki sonucun eşleştiğini gösteriyorum. Sarı sarkaç gerçek hareketi, mavi sarkaç ise ders kitabı yaklaşımını gösteriyor.",
    "intro_oyun": "Fener Bekçisi'ne hoş geldin. Kasabanın feneri söndü ve sokaklarda Gölgeler dolaşıyor. Yaşlı bekçi Nuri ile konuş, kayıp mercek parçalarını bul ve feneri yeniden yak. Gölgeler seni görürse kovalar. Gözden kaybolursan seni son gördükleri yerde ararlar.",
    "intro_ajan": "Bu bölüm, bir işi bir ajan ekibiyle nasıl yürüttüğümü gösteriyor. Planlayıcı işi parçalara böler, işçiler paralel çalışır, denetçi her sonucu farklı bir yöntemle kontrol eder. Hatalı çalışan bir ajan yakalanırsa karantinaya alınır ve işi başka bir ajana verilir.",
    "intro_model": "Burada hiçbir yapay zekâ kütüphanesi kullanmadan, tarayıcının içinde küçük bir sinir ağı eğitiyorum. Eğit düğmesine bastığında model, örnek cümlelerden olumlu ve olumsuz yorumları ayırt etmeyi öğrenir. Sonra kendi cümleni yazıp sonucu görebilirsin.",

    # --- matematik: çözüm anlatımı ---
    "mat_cozum": "Adım bir: enerjinin korunumundan sarkacın açısal hızını yazıyor ve periyodu bir integral olarak elde ediyoruz. Adım iki: uygun bir değişken dönüşümüyle bu integral, birinci tür tam eliptik integrale dönüşüyor. Adım üç: eliptik integrali aritmetik geometrik ortalama yöntemiyle hesaplıyoruz. Bu yöntem çok hızlı yakınsar; birkaç adımda on beş basamak doğruluğa ulaşır. Son olarak aynı denklemi Runge Kutta yöntemiyle sayısal olarak çözüyoruz. İki sonuç arasındaki fark milyonda birden çok daha küçük. Yani çözüm doğrulanmış oluyor.",

    # --- ajan ekibi anlatıcısı ---
    "ag_basla": "Ekip çalışmaya başladı. Planlayıcı işi parçalara böldü ve işçilere dağıtıyor.",
    "ag_red": "Dikkat! Denetçi hatalı bir sonuç yakaladı. Hatalı ajan karantinaya alındı, yerine yeni bir ajan başlatıldı.",
    "ag_bitti": "Görev tamamlandı. Tüm parçalar doğrulandı ve sonuç, bilinen değerle birebir eşleşti.",

    # --- oyun diyalogları ---
    "g_i1": "Kıyı kasabası, gece yarısı. Fener üç gecedir sönük.",
    "g_i2": "Yaşlı bekçi Nuri seni kulübesinin önünde bekliyor.",
    "g_n0_1": "Sonunda biri geldi! Fırtına fenerin merceğini paramparça etti.",
    "g_n0_2": "Üç mercek parçası kasabanın sokaklarına dağıldı. Parlayan mavi taşlar onlar.",
    "g_n0_3": "Ama dikkat et. Işık sönünce Gölgeler sokaklara indi. Seni görürlerse peşine düşerler.",
    "g_n0_4": "Duvarların arkasına saklan. Görüşlerini kesersen izini kaybeder, son gördükleri yeri ararlar.",
    "g_n0_5": "Görev: üç mercek parçasını topla.",
    "g_n1_3": "Üç parça daha kaldı. Gölgelerden uzak dur!",
    "g_n1_2": "İki parça daha kaldı. Gölgelerden uzak dur!",
    "g_n1_1": "Bir parça daha kaldı. Gölgelerden uzak dur!",
    "g_n2_1": "Üçünü de bulmuşsun! Ellerin titriyor ama başardın.",
    "g_n2_2": "Merceği birleştirdim. Şimdi sağ üstteki fenere git ve onu yak.",
    "g_n2_3": "Görev güncellendi: feneri yak.",
    "g_n3": "Fener seni bekliyor evlat!",
    "g_l1": "Merceği yerine oturttun. Fener yeniden parlıyor!",
    "g_l2": "Işık sokaklara yayılırken Gölgeler dağılıp yok oluyor.",
    "g_l3": "Kasaba kurtuldu. Son.",
    "g_kilit": "Fenerin kapısı kilitli. Mercek olmadan burada yapacak bir şey yok.",
    "g_kayip1": "Gölgeler seni sardı. Kasaba karanlıkta kaldı.",
    "g_kayip2": "Oyun bitti.",
    "g_parca": "Bir mercek parçası buldun!",
    "g_hepsi": "Tüm parçalar toplandı! Nuri'ye dön.",
    "g_vurus": "Bir Gölge sana dokundu!",
}

tts = EMA()
manifest = {}
for i, (key, text) in enumerate(CLIPS.items()):
    sp = tts.say(text, seed=7, sample_rate=24000)
    path = OUT / f"{key}.mp3"
    sf.write(path, sp.audio, sp.sample_rate, format="MP3")
    manifest[key] = round(float(sp.duration), 2)
    print(f"[{i+1}/{len(CLIPS)}] {key}: {sp.duration:.1f} sn")
(OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=1))
print("toplam", round(sum(manifest.values()), 1), "sn")
