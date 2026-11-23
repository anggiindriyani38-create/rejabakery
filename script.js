// ==================================
// DATA PRODUK
// ==================================
const daftarProduk = [
    { id: 1, nama: "Roti Tawar Putih", deskripsi: "Roti tawar empuk, 1 bungkus isi 6 lembar", harga: 8500, stok: 20, icon: "🍞" },
    { id: 2, nama: "Roti Tawar Gandum", deskripsi: "Sehat dan lezat dengan serat alami", harga: 9500, stok: 15, icon: "🌾" },
    { id: 3, nama: "Donat Coklat", deskripsi: "Donat empuk dengan isian coklat lumer", harga: 3000, stok: 30, icon: "🍩" },
    { id: 4, nama: "Roti Pisang Coklat", deskripsi: "Perpaduan pisang segar dan coklat", harga: 4500, stok: 25, icon: "🥐" },
    { id: 5, nama: "Croissant Keju", deskripsi: "Kulit renyah dengan lelehan keju gurih", harga: 7000, stok: 12, icon: "🥐" },
    { id: 6, nama: "Bolu Gulung Coklat", deskripsi: "Kue bolu lembut dengan krim coklat", harga: 18000, stok: 8, icon: "🍰" },
    { id: 7, nama: "Roti Sobek Coklat", deskripsi: "Isian coklat di setiap bagian roti", harga: 12000, stok: 10, icon: "🍫" },
    { id: 8, nama: "Kue Lapis Legit", deskripsi: "Resep asli, 15 lapisan sempurna", harga: 65000, stok: 5, icon: "🎂" }
];

// ==================================
// KERANJANG & PESANAN (disimpan di localStorage)
// ==================================
let keranjang = JSON.parse(localStorage.getItem('keranjang')) || [];
let pesanan = JSON.parse(localStorage.getItem('pesanan')) || [];

// ==================================
// INISIALISASI SAAT HALAMAN DIBUKA
// ==================================
document.addEventListener('DOMContentLoaded', () => {
    renderProduk();
    renderKeranjang();
    renderPesanan();
    updateJumlahKeranjang();
    initLogin();
    registerServiceWorker();
});

// ==================================
// TAMPILKAN DAFTAR PRODUK
// ==================================
function renderProduk() {
    const wadah = document.getElementById('daftar-produk');
    if (!wadah) return;
    
    wadah.innerHTML = daftarProduk.map(produk => `
        <div class="produk-card">
            <div class="produk-gambar">${produk.icon}</div>
            <div class="produk-info">
                <h3>${produk.nama}</h3>
                <p class="produk-desc">${produk.deskripsi}</p>
                <p class="produk-harga">Rp ${produk.harga.toLocaleString('id-ID')}</p>
                <p class="produk-stok">Stok: ${produk.stok} tersedia</p>
                <button class="btn-tambah" onclick="tambahKeKeranjang(${produk.id})" 
                    ${produk.stok === 0 ? 'disabled' : ''}>
                    ${produk.stok === 0 ? 'Habis' : '+ Tambah ke Keranjang'}
                </button>
            </div>
        </div>
    `).join('');
}

// ==================================
// TAMBAH PRODUK KE KERANJANG
// ==================================
function tambahKeKeranjang(idProduk) {
    const produk = daftarProduk.find(p => p.id === idProduk);
    if (!produk) return;
    
    const itemDiKeranjang = keranjang.find(item => item.id === idProduk);
    
    if (itemDiKeranjang) {
        if (itemDiKeranjang.jumlah < produk.stok) {
            itemDiKeranjang.jumlah++;
        } else {
            alert('Maaf, stok tidak mencukupi!');
            return;
        }
    } else {
        keranjang.push({
            id: produk.id,
            nama: produk.nama,
            harga: produk.harga,
            jumlah: 1,
            stok: produk.stok
        });
    }
    
    simpanKeranjang();
    renderKeranjang();
    updateJumlahKeranjang();
}

// ==================================
// UBAH JUMLAH DI KERANJANG
// ==================================
function ubahJumlah(idProduk, operasi) {
    const item = keranjang.find(i => i.id === idProduk);
    if (!item) return;
    
    if (operasi === 'kurang') {
        item.jumlah--;
        if (item.jumlah <= 0) {
            hapusDariKeranjang(idProduk);
            return;
        }
    } else if (operasi === 'tambah') {
        const produk = daftarProduk.find(p => p.id === idProduk);
        if (item.jumlah < produk.stok) {
            item.jumlah++;
        } else {
            alert('Stok tidak mencukupi!');
            return;
        }
    }
    
    simpanKeranjang();
    renderKeranjang();
    updateJumlahKeranjang();
}

// ==================================
// HAPUS DARI KERANJANG
// ==================================
function hapusDariKeranjang(idProduk) {
    keranjang = keranjang.filter(item => item.id !== idProduk);
    simpanKeranjang();
    renderKeranjang();
    updateJumlahKeranjang();
}

// ==================================
// SIMPAN KERANJANG KE LOCALSTORAGE
// ==================================
function simpanKeranjang() {
    localStorage.setItem('keranjang', JSON.stringify(keranjang));
}

// ==================================
// TAMPILKAN KERANJANG
// ==================================
function renderKeranjang() {
    const wadah = document.getElementById('isi-keranjang');
    const wadahTotal = document.getElementById('total-bayar');
    const wadahHarga = document.getElementById('total-harga');
    const btnCheckout = document.getElementById('btn-checkout');
    
    if (!wadah) return;
    
    if (keranjang.length === 0) {
        wadah.innerHTML = '<p class="kosong">Keranjang masih kosong, silakan pilih produk terlebih dahulu</p>';
        if (wadahTotal) wadahTotal.style.display = 'none';
        return;
    }
    
    wadah.innerHTML = keranjang.map(item => `
        <div class="keranjang-item">
            <div class="item-kiri">
                <div class="item-nama">${item.nama}</div>
                <div class="item-harga">Rp ${item.harga.toLocaleString('id-ID')} × ${item.jumlah} = Rp ${(item.harga * item.jumlah).toLocaleString('id-ID')}</div>
            </div>
            <div class="jumlah-kontrol">
                <button onclick="ubahJumlah(${item.id}, 'kurang')">−</button>
                <span>${item.jumlah}</span>
                <button onclick="ubahJumlah(${item.id}, 'tambah')">+</button>
            </div>
            <button class="btn-hapus" onclick="hapusDariKeranjang(${item.id})">Hapus</button>
        </div>
    `).join('');
    
    // Hitung total
    const total = keranjang.reduce((sum, item) => sum + (item.harga * item.jumlah), 0);
    if (wadahTotal) {
        wadahTotal.style.display = 'block';
        wadahHarga.textContent = total.toLocaleString('id-ID');
    }
    
    // Pasang event checkout
    if (btnCheckout) {
        btnCheckout.onclick = prosesCheckout;
    }
}

// ==================================
// UPDATE ANGKA ICON KERANJANG DI NAV
// ==================================
function updateJumlahKeranjang() {
    const elemen = document.getElementById('jumlah-keranjang');
    if (elemen) {
        const totalItem = keranjang.reduce((sum, item) => sum + item.jumlah, 0);
        elemen.textContent = totalItem;
    }
}

// ==================================
// PROSES CHECKOUT / PESANAN
// ==================================
function prosesCheckout() {
    if (keranjang.length === 0) {
        alert('Keranjang masih kosong!');
        return;
    }
    
    const total = keranjang.reduce((sum, item) => sum + (item.harga * item.jumlah), 0);
    const nomorPesanan = 'ORD-' + Date.now();
    const tanggal = new Date().toLocaleString('id-ID');
    
    const pesananBaru = {
        id: nomorPesanan,
        tanggal: tanggal,
        items: [...keranjang],
        total: total,
        status: 'Diproses'
    };
    
    pesanan.unshift(pesananBaru);
    localStorage.setItem('pesanan', JSON.stringify(pesanan));
    
    // Kosongkan keranjang
    keranjang = [];
    simpanKeranjang();
    
    alert(`Pesanan berhasil!\nNo. Pesanan: ${nomorPesanan}\nTotal: Rp ${total.toLocaleString('id-ID')}`);
    
    renderKeranjang();
    updateJumlahKeranjang();
    renderPesanan();
    
    // Scroll ke riwayat pesanan
    document.getElementById('pesanan').scrollIntoView({ behavior: 'smooth' });
}

// ==================================
// TAMPILKAN RIWAYAT PESANAN
// ==================================
function renderPesanan() {
    const wadah = document.getElementById('daftar-pesanan');
    if (!wadah) return;
    
    if (pesanan.length === 0) {
        wadah.innerHTML = '<p class="kosong">Belum ada pesanan</p>';
        return;
    }
    
    wadah.innerHTML = pesanan.map(p => `
        <div class="pesanan-card">
            <div class="pesanan-header">
                <span class="pesanan-id">${p.id}</span>
                <span class="pesanan-tanggal">${p.tanggal}</span>
            </div>
            <span class="pesanan-status">${p.status}</span>
            <div class="pesanan-detail">
                ${p.items.map(item => `${item.nama} × ${item.jumlah}`).join('<br>')}
                <strong><br>Total: Rp ${p.total.toLocaleString('id-ID')}</strong>
            </div>
        </div>
    `).join('');
}

// ==================================
// FITUR LOGIN ADMIN
// ==================================
function initLogin() {
    const formLogin = document.getElementById('form-login');
    if (!formLogin) return; // Bukan halaman login, keluar fungsi
    
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const pesanError = document.getElementById('pesan-error');
        
        // Data login admin (bisa diubah sesuai keinginan)
        const admin = {
            username: 'admin',
            password: 'admin123'
        };
        
        if (username === admin.username && password === admin.password) {
            // Simpan status login ke localStorage
            localStorage.setItem('adminLogin', 'sukses');
            pesanError.textContent = 'Berhasil masuk! Mengalihkan...';
            pesanError.style.color = 'var(--hijau)';
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            pesanError.textContent = 'Username atau password salah!';
        }
    });
}

// ==================================
// SERVICE WORKER UNTUK PWA
// ==================================
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(reg => console.log('✅ Service Worker terdaftar:', reg.scope))
                .catch(err => console.log('❌ Service Worker gagal:', err));
        });
    }
}
