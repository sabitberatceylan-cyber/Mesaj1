# Mesaj Uygulaması — Kurulum ve APK Alma

## 1. Node.js gerekli araçları kur

Bilgisayarında zaten Node.js var (sunucu için kurmuştun). Şimdi Expo'nun
komut satırı aracını global olarak kur:

```
npm install -g eas-cli
```

## 2. Bu klasörde paketleri yükle

Bu proje klasörünün içinde (server klasöründen farklı, ayrı bir klasör):

```
npm install
```

(Windows'ta PowerShell script hatası verirse, sunucuda yaptığın gibi CMD
kullan ya da `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` çalıştır.)

## 3. Telefonunda deneme (APK'ya gerek kalmadan)

Gerçek APK derlemeden önce telefonunda canlı test etmek istersen:

1. Telefonuna **Expo Go** uygulamasını indir (Play Store'dan bedava)
2. Bilgisayarında:
   ```
   npx expo start
   ```
3. Çıkan QR kodu Expo Go içinden tara — uygulama telefonunda açılır

Bu modda değişiklik yaptığımda anında telefonunda görürsün, APK
derlemene gerek kalmaz. Geliştirme aşamasında bunu kullanmanı öneririm.

## 4. Gerçek APK derleme

Test ettiğin ve beğendiğin an APK'ya dönüştürelim:

```
eas login
```

(Expo hesabın yoksa `eas login` sırasında ücretsiz hesap oluşturman
istenecek — sadece e-posta yeterli.)

```
eas build -p android --profile preview
```

Bu komut derlemeyi Expo'nun sunucularında yapar (birkaç dakika sürer),
bitince sana bir indirme linki verir. O linkten `.apk` dosyasını indirip
telefonuna atman yeterli. Android "bilinmeyen kaynaklardan yükleme"ye
izin vermeni isteyebilir — kur derken onaylarsın.

## 5. Uygulamayı kullanma

Uygulamayı ilk açtığında:

- **Sunucu Adresi**: Cloudflare Tunnel'ın verdiği adres
  (örn. `https://upon-bug-boys-honest.trycloudflare.com`)
- **Token**: sunucudaki `server.js` içine yazdığın token (örn. `3131` veya `1313`)

Bağlandıktan sonra bu bilgiler telefonda saklanır, tekrar girmen gerekmez.

## Cloudflare adresi değiştiğinde ne yapacaksın?

Ücretsiz Cloudflare Tunnel her yeniden başlatıldığında yeni bir adres
verir. Adres değiştiğinde:

1. Uygulamada sağ üstteki **⚙ (dişli)** ikonuna dokun
2. Yeni adresi yapıştır, **Kaydet**'e bas

Uygulamayı yeniden kurmana gerek yok. (Kalıcı bir domain alırsan bu adım
tamamen ortadan kalkar — istersen sonra onu da ayarlarız.)

## Klasör yapısı

```
App.js                  — ana ekran yönlendirmesi
theme.js                 — renkler (siyah/beyaz tema burada)
lib/depolama.js          — telefonda ayar saklama
screens/GirisEkrani.js   — sunucu adresi + token girme ekranı
screens/SohbetEkrani.js  — asıl mesajlaşma ekranı
```

Renkleri değiştirmek istersen sadece `theme.js` dosyasına dokunman yeterli.
