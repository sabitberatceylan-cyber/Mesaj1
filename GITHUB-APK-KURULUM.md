# GitHub Üzerinden Otomatik APK Derleme

Bu yöntemde derleme senin bilgisayarında değil, GitHub'ın ücretsiz
sunucusunda yapılır. Windows'taki npm/PowerShell dertleriyle uğraşmana
gerek kalmaz.

## 1. GitHub'da yeni depo (repository) oluştur

1. https://github.com adresine git, hesabın yoksa ücretsiz aç
2. Sağ üstten **+** → **New repository**
3. İsim ver (örn. `mesaj-app`), **Private** seçebilirsin, **Create repository**'e bas
4. Açılan sayfada "…or push an existing repository" kısmındaki adresi not al,
   şuna benzer: `https://github.com/kullaniciadin/mesaj-app.git`

## 2. Projeyi GitHub'a gönder

Bu klasörün içinde terminal aç (CMD), sırayla:

```
git init
git add .
git commit -m "ilk surum"
git branch -M main
git remote add origin https://github.com/KULLANICI-ADIN/mesaj-app.git
git push -u origin main
```

Git kurulu değilse https://git-scm.com/downloads adresinden indir, kur,
terminali kapatıp yeniden aç, sonra tekrar dene. Push sırasında GitHub
kullanıcı adı/şifre yerine bir "token" isteyebilir — istemesi durumunda
haber ver, o adımı birlikte yaparız.

## 3. Derlemeyi izle

1. GitHub'da deponun sayfasına git
2. Üstteki **Actions** sekmesine tıkla
3. "APK Derle" adında bir çalışma göreceksin, üstünde turuncu ⏳ (çalışıyor)
   simgesi olacak — 5-8 dakika sürebilir
4. Yeşil ✓ olunca tıkla, en altta **Artifacts** bölümünde
   **mesaj-apk** adında bir zip göreceksin, indir

## 4. Telefona kur

1. İndirdiğin zip'i aç, içinden `app-debug.apk` çıkacak
2. Bu dosyayı telefonuna aktar (WhatsApp'tan kendine atmak, Google Drive,
   USB kablo — hangisi kolaysa)
3. Telefonda dosyaya dokun, "bilinmeyen kaynaklardan yükleme"ye izin ver,
   kur

## Değişiklik yaptığımda ne olacak?

Ben kodda güncelleme yaptıkça, sana güncellenmiş dosyaları vereceğim,
sen onları klasöre koyup şunu çalıştırman yeterli:

```
git add .
git commit -m "guncelleme"
git push
```

Bu otomatik olarak yeni bir derleme başlatır, birkaç dakika sonra
Actions sekmesinden yeni APK'yı indirirsin.

## Not

Bu derleme "debug" (test) sürümü üretir — hızlı ve imzasız, telefonuna
kurup denemek için birebir uygundur. İleride Play Store'a koymak ya da
"gerçek" bir sürüm çıkarmak istersen imzalı (release) sürüm için ayrı
bir adım gerekir, o zaman onu da ayarlarız.
