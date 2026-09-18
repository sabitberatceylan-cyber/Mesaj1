import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { renkler, bosluk } from '../theme';

export default function GirisEkrani({ baslangicAdres, baslangicToken, onBaglan }) {
  const [sunucuAdres, setSunucuAdres] = useState(baslangicAdres || '');
  const [token, setToken] = useState(baslangicToken || '');
  const [hata, setHata] = useState('');

  function gonder() {
    const adres = sunucuAdres.trim().replace(/\/+$/, '');
    const tok = token.trim();

    if (!adres) return setHata('Sunucu adresini gir.');
    if (!/^https?:\/\//i.test(adres)) {
      return setHata("Adres http:// veya https:// ile baslamali.");
    }
    if (!tok) return setHata('Token gir.');

    setHata('');
    onBaglan({ sunucuAdres: adres, token: tok });
  }

  return (
    <KeyboardAvoidingView
      style={styles.kok}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.icerik} keyboardShouldPersistTaps="handled">
        <Text style={styles.baslik}>Mesaj</Text>
        <Text style={styles.altBaslik}>Kendi sunucuna bağlan</Text>

        <View style={styles.alanGrubu}>
          <Text style={styles.etiket}>SUNUCU ADRESİ</Text>
          <TextInput
            style={styles.girdi}
            placeholder="https://xxxx.trycloudflare.com"
            placeholderTextColor={renkler.metinSoluk}
            value={sunucuAdres}
            onChangeText={setSunucuAdres}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
        </View>

        <View style={styles.alanGrubu}>
          <Text style={styles.etiket}>TOKEN</Text>
          <TextInput
            style={styles.girdi}
            placeholder="ornek: 3131"
            placeholderTextColor={renkler.metinSoluk}
            value={token}
            onChangeText={setToken}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />
        </View>

        {!!hata && <Text style={styles.hataMetni}>{hata}</Text>}

        <TouchableOpacity style={styles.buton} onPress={gonder} activeOpacity={0.7}>
          <Text style={styles.butonMetni}>Bağlan</Text>
        </TouchableOpacity>

        <Text style={styles.ipucu}>
          Sunucu adresi Cloudflare Tunnel'ı her başlattığında değişir.
          Değiştiğinde buraya yeni adresi yapıştırman yeterli.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kok: { flex: 1, backgroundColor: renkler.arkaplan },
  icerik: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: bosluk.lg,
  },
  baslik: {
    color: renkler.metin,
    fontSize: 40,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 1,
  },
  altBaslik: {
    color: renkler.metinSoluk,
    fontSize: 14,
    textAlign: 'center',
    marginTop: bosluk.xs,
    marginBottom: bosluk.xl,
  },
  alanGrubu: { marginBottom: bosluk.md },
  etiket: {
    color: renkler.metinSoluk,
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: bosluk.xs,
  },
  girdi: {
    backgroundColor: renkler.yuzey,
    color: renkler.metin,
    borderWidth: 1,
    borderColor: renkler.cizgi,
    borderRadius: 10,
    paddingHorizontal: bosluk.md,
    paddingVertical: 14,
    fontSize: 16,
  },
  hataMetni: {
    color: renkler.hata,
    fontSize: 13,
    marginBottom: bosluk.md,
  },
  buton: {
    backgroundColor: renkler.kendiBalon,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: bosluk.sm,
  },
  butonMetni: {
    color: renkler.kendiBalonMetin,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  ipucu: {
    color: renkler.metinSoluk,
    fontSize: 12,
    textAlign: 'center',
    marginTop: bosluk.xl,
    lineHeight: 18,
  },
});
