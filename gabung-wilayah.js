const fs = require('fs');
const path = require('path');

const baseDir = './data-indonesia-master';

// Step 1: Build mapping kode kabupaten/kota ke nama dan koordinat
let kodeKabKotaMap = {};
['kabupaten', 'kota'].forEach(folder => {
  const dir = path.join(baseDir, folder);
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.json')) {
      const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (item.id && item.nama) {
            // Kode kab/kota: 4 digit pertama dari id
            const kode = String(item.id).slice(0, 4);
            kodeKabKotaMap[kode] = {
              nama: item.nama.toLowerCase()
            };
          }
        });
      }
    }
  });
});

// Step 2: Build wilayah detail map dengan parent dari kode
let wilayahDetailMap = {};
const jenisMap = {
  kabupaten: 'kabupaten',
  kota: 'kota',
  kecamatan: 'kecamatan',
  kelurahan: 'kelurahan'
};

Object.keys(jenisMap).forEach(folder => {
  const dir = path.join(baseDir, folder);
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.json')) {
      const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (item.nama && item.id) {
            let key = item.nama.toLowerCase().replace(/^(kec\.?|kel\.?|kab\.?|kota)\s*/i, '').trim();
            let parent = '';
            if (jenisMap[folder] === 'kecamatan' || jenisMap[folder] === 'kelurahan') {
              // Ambil kode kab/kota dari id kecamatan/kelurahan
              const kodeKabKota = String(item.id).slice(0, 4);
              if (kodeKabKotaMap[kodeKabKota]) {
                parent = kodeKabKotaMap[kodeKabKota].nama;
              }
            }
            wilayahDetailMap[key] = {
              jenis: jenisMap[folder],
              parent: parent
            };
          }
        });
      }
    }
  });
});

fs.writeFileSync('wilayah_detail.json', JSON.stringify(wilayahDetailMap, null, 2));
console.log('Total entri wilayah_detail_map:', Object.keys(wilayahDetailMap).length);