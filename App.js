import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import GirisEkrani from './screens/GirisEkrani';
import SohbetEkrani from './screens/SohbetEkrani';
import { ayarlariYukle, ayarlariKaydet, ayarlariTemizle } from './lib/depolama';
import { renkler } from './theme';

export default function App() {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [ayarlar, setAyarlar] = useState(null); // { sunucuAdres, token }

  useEffect(() => {
    (async () => {
      const kayitli = await ayarlariYukle();
      if (kayitli) setAyarlar(kayitli);
      setYukleniyor(false);
    })();
  }, []);

  const baglan = useCallback(async (yeniAyarlar) => {
    await ayarlariKaydet(yeniAyarlar);
    setAyarlar(yeniAyarlar);
  }, []);

  const adresGuncelle = useCallback(
    async (yeniAdres) => {
      const guncel = { ...ayarlar, sunucuAdres: yeniAdres };
      await ayarlariKaydet(guncel);
      setAyarlar(guncel);
    },
    [ayarlar]
  );

  const cikisYap = useCallback(async () => {
    await ayarlariTemizle();
    setAyarlar(null);
  }, []);

  if (yukleniyor) {
    return (
      <View style={styles.yukleniyorKok}>
        <ActivityIndicator color={renkler.metin} size="large" />
        <ExpoStatusBar style="light" />
      </View>
    );
  }

  return (
    <View style={styles.kok}>
      <StatusBar barStyle="light-content" backgroundColor={renkler.arkaplan} />
      <ExpoStatusBar style="light" />
      {ayarlar ? (
        <SohbetEkrani
          sunucuAdres={ayarlar.sunucuAdres}
          token={ayarlar.token}
          onCikis={cikisYap}
          onAdresGuncelle={adresGuncelle}
        />
      ) : (
        <GirisEkrani
          baslangicAdres={ayarlar?.sunucuAdres}
          baslangicToken={ayarlar?.token}
          onBaglan={baglan}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  kok: { flex: 1, backgroundColor: renkler.arkaplan },
  yukleniyorKok: { flex: 1, backgroundColor: renkler.arkaplan, justifyContent: 'center', alignItems: 'center' },
});
