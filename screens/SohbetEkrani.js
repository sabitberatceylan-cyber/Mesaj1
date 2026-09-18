import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
  AppState,
} from 'react-native';
import { renkler, bosluk } from '../theme';

function wsAdresiYap(httpAdres, token) {
  const wsBase = httpAdres.replace(/^https:/i, 'wss:').replace(/^http:/i, 'ws:');
  return `${wsBase}/?token=${encodeURIComponent(token)}`;
}

function saatFormatla(zamanMs) {
  const d = new Date(zamanMs);
  return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

export default function SohbetEkrani({ sunucuAdres, token, onCikis, onAdresGuncelle }) {
  const [mesajlar, setMesajlar] = useState([]); // {id, gonderen, metin, zaman, durum}
  const [metin, setMetin] = useState('');
  const [baglandi, setBaglandi] = useState(false);
  const [benimAdim, setBenimAdim] = useState(null);
  const [ayarAcik, setAyarAcik] = useState(false);
  const [yeniAdres, setYeniAdres] = useState(sunucuAdres);

  const wsRef = useRef(null);
  const listeRef = useRef(null);
  const kapatildiMi = useRef(false);
  const geciciSayac = useRef(0);
  const yenidenBaglanZamanlayici = useRef(null);

  const gecmisiCek = useCallback(async () => {
    try {
      const res = await fetch(
        `${sunucuAdres}/gecmis?token=${encodeURIComponent(token)}&limit=200`
      );
      if (!res.ok) return;
      const veri = await res.json();
      setMesajlar((mevcut) => {
        const mevcutIdler = new Set(mevcut.map((m) => m.id));
        const yeniler = veri
          .filter((m) => !mevcutIdler.has(m.id))
          .map((m) => ({ ...m, durum: 'gonderildi' }));
        return [...yeniler, ...mevcut].sort((a, b) => a.zaman - b.zaman);
      });
    } catch (e) {
      // sessizce gec, websocket zaten canli veriyi getirecek
    }
  }, [sunucuAdres, token]);

  const baglan = useCallback(() => {
    if (kapatildiMi.current) return;
    clearTimeout(yenidenBaglanZamanlayici.current);

    const ws = new WebSocket(wsAdresiYap(sunucuAdres, token));
    wsRef.current = ws;

    ws.onopen = () => {
      setBaglandi(true);
      gecmisiCek();
    };

    ws.onmessage = (olay) => {
      let veri;
      try {
        veri = JSON.parse(olay.data);
      } catch {
        return;
      }

      if (veri.tip === 'hosgeldin') {
        setBenimAdim(veri.kullanici);
        return;
      }

      if (veri.tip === 'mesaj') {
        setMesajlar((mevcut) => {
          if (mevcut.some((m) => m.id === veri.id)) return mevcut;
          return [
            ...mevcut,
            { id: veri.id, gonderen: veri.gonderen, metin: veri.metin, zaman: veri.zaman, durum: 'gonderildi' },
          ];
        });
        return;
      }

      if (veri.tip === 'onay') {
        setMesajlar((mevcut) =>
          mevcut.map((m) =>
            m.gecici === veri.gecici
              ? { ...m, id: veri.id, durum: veri.iletildi ? 'iletildi' : 'beklemede', gecici: undefined }
              : m
          )
        );
      }
    };

    ws.onclose = () => {
      setBaglandi(false);
      if (!kapatildiMi.current) {
        yenidenBaglanZamanlayici.current = setTimeout(baglan, 2500);
      }
    };

    ws.onerror = () => {
      // onclose zaten tetiklenecek, burada ekstra islem gerekmiyor
    };
  }, [sunucuAdres, token, gecmisiCek]);

  useEffect(() => {
    kapatildiMi.current = false;
    baglan();

    const altAbonelik = AppState.addEventListener('change', (durum) => {
      if (durum === 'active' && wsRef.current?.readyState !== WebSocket.OPEN) {
        baglan();
      }
    });

    return () => {
      kapatildiMi.current = true;
      clearTimeout(yenidenBaglanZamanlayici.current);
      wsRef.current?.close();
      altAbonelik.remove();
    };
  }, [baglan]);

  function gonder() {
    const gonderilecek = metin.trim();
    if (!gonderilecek || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const geciciId = `g-${Date.now()}-${geciciSayac.current++}`;
    const simdi = Date.now();

    setMesajlar((mevcut) => [
      ...mevcut,
      { gecici: geciciId, gonderen: benimAdim, metin: gonderilecek, zaman: simdi, durum: 'gonderiliyor' },
    ]);

    wsRef.current.send(JSON.stringify({ tip: 'mesaj', metin: gonderilecek, gecici: geciciId }));
    setMetin('');
  }

  function mesajOgesi({ item }) {
    const benim = item.gonderen === benimAdim;
    return (
      <View style={[styles.balonSatir, benim ? styles.sagaYasli : styles.solaYasli]}>
        <View style={[styles.balon, benim ? styles.kendiBalon : styles.digerBalon]}>
          <Text style={benim ? styles.kendiBalonMetin : styles.digerBalonMetin}>{item.metin}</Text>
          <View style={styles.altSatir}>
            <Text style={[styles.saat, benim && styles.saatKendi]}>{saatFormatla(item.zaman)}</Text>
            {benim && item.durum === 'gonderiliyor' && <Text style={styles.durumIkon}> ○</Text>}
            {benim && item.durum === 'beklemede' && <Text style={styles.durumIkon}> ✓</Text>}
            {benim && item.durum === 'iletildi' && <Text style={styles.durumIkon}> ✓✓</Text>}
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.kok}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <View style={styles.header}>
        <View style={styles.headerSol}>
          <View style={[styles.durumNoktasi, { backgroundColor: baglandi ? renkler.basarili : renkler.metinSoluk }]} />
          <Text style={styles.headerBaslik}>{baglandi ? 'Bağlı' : 'Bağlanıyor...'}</Text>
        </View>
        <TouchableOpacity onPress={() => setAyarAcik(true)}>
          <Text style={styles.ayarIkon}>⚙</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listeRef}
        data={mesajlar}
        keyExtractor={(item) => String(item.id ?? item.gecici)}
        renderItem={mesajOgesi}
        contentContainerStyle={styles.mesajListesi}
        onContentSizeChange={() => listeRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.girdiSatiri}>
        <TextInput
          style={styles.mesajGirdi}
          placeholder="Mesaj yaz..."
          placeholderTextColor={renkler.metinSoluk}
          value={metin}
          onChangeText={setMetin}
          multiline
        />
        <TouchableOpacity style={styles.gonderButon} onPress={gonder} activeOpacity={0.7}>
          <Text style={styles.gonderButonMetin}>Gönder</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={ayarAcik} animationType="slide" transparent>
        <View style={styles.modalArkaplan}>
          <View style={styles.modalKutu}>
            <Text style={styles.modalBaslik}>Ayarlar</Text>

            <Text style={styles.etiket}>SUNUCU ADRESİ</Text>
            <TextInput
              style={styles.girdi}
              value={yeniAdres}
              onChangeText={setYeniAdres}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={styles.buton}
              onPress={() => {
                const temiz = yeniAdres.trim().replace(/\/+$/, '');
                setAyarAcik(false);
                if (temiz && temiz !== sunucuAdres) onAdresGuncelle(temiz);
              }}
            >
              <Text style={styles.butonMetni}>Kaydet</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.ikincilButon} onPress={() => setAyarAcik(false)}>
              <Text style={styles.ikincilButonMetni}>Kapat</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cikisButon} onPress={onCikis}>
              <Text style={styles.cikisButonMetni}>Çıkış yap</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kok: { flex: 1, backgroundColor: renkler.arkaplan },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: bosluk.md,
    paddingTop: Platform.OS === 'ios' ? 54 : 16,
    paddingBottom: bosluk.sm,
    borderBottomWidth: 1,
    borderBottomColor: renkler.cizgi,
    backgroundColor: renkler.yuzey,
  },
  headerSol: { flexDirection: 'row', alignItems: 'center' },
  durumNoktasi: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  headerBaslik: { color: renkler.metin, fontSize: 15, fontWeight: '600' },
  ayarIkon: { color: renkler.metin, fontSize: 20 },

  mesajListesi: { padding: bosluk.md, paddingBottom: bosluk.lg },
  balonSatir: { marginBottom: bosluk.sm, flexDirection: 'row' },
  sagaYasli: { justifyContent: 'flex-end' },
  solaYasli: { justifyContent: 'flex-start' },
  balon: { maxWidth: '78%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  kendiBalon: { backgroundColor: renkler.kendiBalon, borderBottomRightRadius: 4 },
  digerBalon: {
    backgroundColor: renkler.digerBalon,
    borderWidth: 1,
    borderColor: renkler.cizgi,
    borderBottomLeftRadius: 4,
  },
  kendiBalonMetin: { color: renkler.kendiBalonMetin, fontSize: 15 },
  digerBalonMetin: { color: renkler.digerBalonMetin, fontSize: 15 },
  altSatir: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 },
  saat: { fontSize: 10, color: renkler.metinSoluk },
  saatKendi: { color: '#555555' },
  durumIkon: { fontSize: 10, color: '#555555' },

  girdiSatiri: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: bosluk.sm,
    borderTopWidth: 1,
    borderTopColor: renkler.cizgi,
    backgroundColor: renkler.yuzey,
  },
  mesajGirdi: {
    flex: 1,
    backgroundColor: renkler.arkaplan,
    color: renkler.metin,
    borderWidth: 1,
    borderColor: renkler.cizgi,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 120,
    marginRight: bosluk.sm,
  },
  gonderButon: {
    backgroundColor: renkler.kendiBalon,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  gonderButonMetin: { color: renkler.kendiBalonMetin, fontWeight: '700', fontSize: 14 },

  modalArkaplan: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalKutu: {
    backgroundColor: renkler.yuzey,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: bosluk.lg,
    paddingBottom: 40,
  },
  modalBaslik: { color: renkler.metin, fontSize: 18, fontWeight: '700', marginBottom: bosluk.md },
  etiket: { color: renkler.metinSoluk, fontSize: 11, letterSpacing: 1, marginBottom: bosluk.xs },
  girdi: {
    backgroundColor: renkler.arkaplan,
    color: renkler.metin,
    borderWidth: 1,
    borderColor: renkler.cizgi,
    borderRadius: 10,
    paddingHorizontal: bosluk.md,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: bosluk.md,
  },
  buton: { backgroundColor: renkler.kendiBalon, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  butonMetni: { color: renkler.kendiBalonMetin, fontWeight: '700', fontSize: 15 },
  ikincilButon: { paddingVertical: 14, alignItems: 'center' },
  ikincilButonMetni: { color: renkler.metinSoluk, fontSize: 14 },
  cikisButon: { paddingVertical: 10, alignItems: 'center', marginTop: bosluk.sm },
  cikisButonMetni: { color: renkler.hata, fontSize: 13 },
});
