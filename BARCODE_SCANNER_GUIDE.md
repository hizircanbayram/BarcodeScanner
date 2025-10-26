# GS1-DataMatrix Barcode Scanner - Kılavuz

## Proje Özellikleri

✅ **GS1-DataMatrix Barkodu Okuma** - Kamera üzerinden DataMatrix formatındaki barkodları tarar
✅ **Yeşil Dikdörtgen Overlay** - Algılanan barkodun etrafına yeşil dikdörtgen çizer
✅ **Real-time Takip** - Kamera hareket ettiğinde dikdörtgen barkodu takip eder
✅ **Cross-Platform** - Android ve iOS için Expo üzerinde çalışır
✅ **TypeScript Desteği** - Tam TypeScript desteği ile güvenli kod yazma

## Proje Yapısı

```
BarcodeScanner/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab navigation layout
│   │   ├── barcode.tsx          # Barcode scanner tab page
│   │   ├── index.tsx            # Home tab
│   │   └── explore.tsx          # Explore tab
│   ├── _layout.tsx              # Root layout
│   └── modal.tsx                # Modal screen
├── components/
│   └── BarcodeScanner.tsx       # Main barcode scanner component
├── app.json                     # Expo configuration
├── package.json                 # Dependencies
└── tsconfig.json               # TypeScript configuration
```

## Kurulum

Proje zaten kurulmuştur. Paketler yüklüdür:

- ✅ `expo-camera` - Kamera erişimi
- ✅ `react-native-vision-camera` - Yüksek performanslı kamera
- ✅ `vision-camera-code-scanner` - Barkod taraması
- ✅ `react-native-svg` - Grafik çizimi (yeşil dikdörtgen için)
- ✅ Diğer tüm gerekli paketler

## Çalıştırma

### Expo Development Server Başlat

```bash
cd BarcodeScanner
npm start --port 8083
```

### Test Cihazında Çalıştırma

#### Android Emülatörü
```bash
npm run android
```

#### iOS Simulator (macOS gerekli)
```bash
npm run ios
```

#### Expo Go Uygulaması ile Test
1. Android/iOS'te **Expo Go** uygulamasını yükle
2. Terminal'de sunucu çalışırken **"a"** tuşuna basarak Android'e bağlan veya **"i"** tuşuna basarak iOS'a bağlan
3. QR kodunu tara

## Component Detayları

### BarcodeScanner.tsx

**Özellikleri:**
- `expo-camera` kullanarak kamera akışını işler
- `onBarcodeScanned` callback ile barkod algılaması yapar
- Algılanan barkodun konumunu (x, y, width, height) almış olur
- SVG kullanarak yeşil dikdörtgen çizer
- Barkod değerini ve konumunu ekranda gösterir

**Key States:**
- `scannedBarcodes` - Algılanan barkodların listesi
- `permission` - Kamera izin durumu

**Barcode Bounds (Konum):**
- `x, y` - Barkodun sol üst köşesinin koordinatları
- `width, height` - Barkodun genişlik ve yüksekliği

## Real-time Takip Mantığı

1. **Kamera Akışı**: CameraView her frame'de yeni veriler sunmaktadır
2. **Barkod Algılama**: `onBarcodeScanned` callback'i barkod algılandığında çağrılır
3. **Bounds Güncelleme**: Her algılamada yeni koordinatlar alınır
4. **SVG Render**: State değiştiğinde SVG otomatik güncellenir
5. **Yeşil Dikdörtgen**: Kamera hareket ettiğinde dikdörtgen otomatik takip eder

## Izinler (Permissions)

Uygulama çalışmak için aşağıdaki izinlere ihtiyaç duyar:

- **CAMERA** - Kamera erişimi (DataMatrix taraması için)

Uygulamayı ilk başlatırken izin istemi alacaksınız.

## GS1-DataMatrix Format

DataMatrix (2D barkod):
- Kare şeklinde 2D barkod formatı
- 10-2335 karakter içerebilir
- GS1 uyumlu barkod standardı
- Sık olarak lojistik ve sağlık sektöründe kullanılır

## Sorun Giderme

### Barkod Algılanmıyor
- Kamerayı barkoda doğru yönlendirin
- Yeterli aydınlatma sağlayın
- Barkod net ve açık olduğundan emin olun
- Kameraların izni verildiğinden emin olun

### Dikdörtgen Görünmüyor
- SVG kütüphanesinin doğru yüklendiğinden emin olun
- `react-native-svg` paketinin yüklü olduğunu kontrol edin
- `npm install` çalıştırın

### Port Çakışması
Eğer 8083 portu zaten kullanıldığında hata alırsanız:
```bash
npm start --port 8084
```

## Gelecek Geliştirmeler (Opsiyonel)

- [ ] QR kod desteği ekleme
- [ ] Birden çok barkod algılama
- [ ] Barkod history/kayıt (veritabanı)
- [ ] Vibration/haptic feedback
- [ ] Torch (flaş) kontrolü
- [ ] Barkod tarama hızını optimize etme
- [ ] ML Kit veya başka ML çözümleri ile daha iyi algılama

## Referanslar

- [Expo Camera Docs](https://docs.expo.dev/versions/latest/sdk/camera/)
- [React Native Vision Camera](https://react-native-vision-camera.com/)
- [React Native SVG](https://github.com/react-native-svg/react-native-svg)
- [GS1 DataMatrix](https://www.gs1.org/)

---

**Not:** Bu proje development ortamında test edilmiştir. Production için gerekli optimizasyonlar yapılmalıdır.
