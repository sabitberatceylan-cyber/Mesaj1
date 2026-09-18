import AsyncStorage from '@react-native-async-storage/async-storage';

const ANAHTAR = 'mesaj-app-ayarlar';

// Cihazda kalici olarak saklanan tek sey: sunucu adresi ve token.
// Boylece Cloudflare adresi degistiginde kullanici sadece ayarlar
// ekranindan yeni adresi girer, uygulamayi yeniden kurmasina gerek kalmaz.
export async function ayarlariYukle() {
  try {
    const ham = await AsyncStorage.getItem(ANAHTAR);
    if (!ham) return null;
    return JSON.parse(ham);
  } catch (e) {
    console.warn('Ayarlar okunamadi:', e);
    return null;
  }
}

export async function ayarlariKaydet(ayarlar) {
  try {
    await AsyncStorage.setItem(ANAHTAR, JSON.stringify(ayarlar));
  } catch (e) {
    console.warn('Ayarlar kaydedilemedi:', e);
  }
}

export async function ayarlariTemizle() {
  try {
    await AsyncStorage.removeItem(ANAHTAR);
  } catch (e) {
    console.warn('Ayarlar silinemedi:', e);
  }
}
