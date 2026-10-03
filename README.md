# Flora Camera

Proyek kedua: kamera memenuhi layar, bunga tumbuh di posisi tangan. Proyek pertama tetap terpisah. Hosting GitHub Pages, tanpa backend atau akun pengunjung.

## Gerakan

1. Buka telapak selama sekitar satu detik: mawar tumbuh di atas telapak dan mengikuti tangan. Genggam untuk menguncupkan.
2. Cubit jempol dan telunjuk, tahan, lalu lepaskan: cahaya berubah menjadi lili, bunga kecil, dan kelopak.
3. Angkat hanya telunjuk dan gerakkan: lukis jejak bunga di udara.
4. Buka dua telapak berdekatan selama satu detik: buket besar muncul dengan lingkar bunga berbentuk hati. Pisahkan atau tutup tangan sebelum mengulang; jeda minimal tujuh detik.

Tombol kecil menyediakan warna, suara, foto, pergantian kamera, dan jeda. Ketuk area kamera untuk menyembunyikan atau menampilkan tombol. Foto disimpan hanya ketika tombol foto ditekan, berisi video dan bunga tanpa tombol UI. Video tidak direkam atau diunggah.

## Jalankan lokal

Node 20+:

```powershell
cd D:\HandGestureAI\flora-camera
node server.mjs
```

Buka http://localhost:8788. Untuk HP gunakan tautan GitHub Pages HTTPS. Browser harus mendapat izin kamera. Internet diperlukan untuk modul/WASM/model MediaPipe dan tidak untuk mengirim video. Gunakan Chrome Android atau Safari iPhone terbaru. Akurasi berbeda menurut kamera, cahaya, dan posisi tangan; ini efek visual berbasis heuristik landmark, bukan pengukuran sentuhan fisik.

Kamera berhenti saat tab disembunyikan atau halaman ditinggalkan. Tekan Buka kamera untuk melanjutkan. Kamera belakang ditampilkan tanpa cermin. Posisi landmark memperhitungkan object-fit cover dan crop portrait. Pelacakan dibatasi sekitar 12 FPS, efek digambar terpisah pada requestAnimationFrame. Partikel, bunga, dan kepadatan piksel dibatasi agar beban tetap terkontrol.

## Uji

```powershell
npm install
npm test
# Server lokal harus berjalan untuk pengujian browser.
node tests/browser.mjs
node tests/model.mjs
```

Tes browser memakai Chrome lokal, video sintetis berlabel, dan fixture landmark untuk memeriksa keseluruhan alur efek. Tes model memuat MediaPipe asli dan menjalankan inferensi pada video kosong sintetis. Tes tersebut tidak membuktikan ketepatan gesture tangan manusia. Screenshot di artifacts hanya untuk QA, tidak ikut dipublikasikan.

Workflow GitHub Actions menerbitkan public/ setiap push main. Semua asset lokal memakai path relatif sehingga mendukung subpath GitHub Pages.

Referensi API: https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker/web_js

Kelopak, daun, cahaya, dan bunga digambar secara prosedural dengan Canvas 2D.
