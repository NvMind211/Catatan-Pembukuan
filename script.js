// ===== 1. SAMBUNGAN KE SUPABASE =====
const SUPABASE_URL = "https://djmegnrttqrtegmievqb.supabase.co";
const SUPABASE_KEY = "sb_publishable_TtTv_6UdEcGhIKDlaYTdlg_jjtXlajD";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let catatanList = [];

// ===== 2. TOMBOL-TOMBOL =====
document.getElementById("tombolMasuk").addEventListener("click", masuk);
document.getElementById("tombolKeluar").addEventListener("click", keluar);
document.getElementById("tombolSimpan").addEventListener("click", simpanCatatan);

// ===== 3. LOGIN & LOGOUT =====
async function masuk() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await db.auth.signInWithPassword({ email, password });

  if (error) {
    alert("Gagal masuk: " + error.message);
    return;
  }
  await mulaiAplikasi();
}

async function keluar() {
  await db.auth.signOut();
  catatanList = [];
  document.getElementById("areaApp").classList.add("hidden");
  document.getElementById("areaLogin").classList.remove("hidden");
}

async function mulaiAplikasi() {
  document.getElementById("areaLogin").classList.add("hidden");
  document.getElementById("areaApp").classList.remove("hidden");
  await muatData();
}

async function cekLogin() {
  const { data } = await db.auth.getSession();
  if (data.session) {
    await mulaiAplikasi();
  }
}
cekLogin();

// ===== 4. AMBIL, SIMPAN, HAPUS DATA =====
async function muatData() {
  const { data, error } = await db
    .from("catatan")
    .select("*")
    .order("tanggal", { ascending: false });

  if (error) {
    alert("Gagal memuat data: " + error.message);
    return;
  }
  catatanList = data;
  tampilkanData();
}

async function simpanCatatan() {
  const tanggal = document.getElementById("tanggal").value;
  const jenis = document.getElementById("jenis").value;
  const metode = document.getElementById("metode").value;
  const kode = document.getElementById("kode").value;
  const keterangan = document.getElementById("keterangan").value;
  const jumlah = Number(document.getElementById("jumlah").value);

  if (tanggal === "" || jenis === "" || metode === "" || kode === "" || keterangan === "" || jumlah <= 0) {
    alert("Semua wajib diisi !!!");
    return;
  }

  const { error } = await db
    .from("catatan")
    .insert({ tanggal, jenis, metode, kode, keterangan, jumlah });

  if (error) {
    alert("Gagal menyimpan: " + error.message);
    return;
  }

  document.getElementById("keterangan").value = "";
  document.getElementById("jumlah").value = "";

  await muatData();
}

async function hapusCatatan(id) {
  if (!confirm("Yakin mau hapus catatan ini?")) return;

  const { error } = await db.from("catatan").delete().eq("id", id);

  if (error) {
    alert("Gagal menghapus: " + error.message);
    return;
  }
  await muatData();
}

// ===== 5. TAMPILAN =====
function tampilkanData() {
  const daftar = document.getElementById("daftar");
  daftar.innerHTML = "";

  let totalMasuk = 0;
  let totalKeluar = 0;

  for (let i = 0; i < catatanList.length; i++) {
    const item = catatanList[i];
    const jumlah = Number(item.jumlah);

    if (item.jenis === "pemasukan") {
      totalMasuk = totalMasuk + jumlah;
    } else {
      totalKeluar = totalKeluar + jumlah;
    }

    const baris = document.createElement("li");
    baris.textContent =
      item.tanggal + " | " + item.jenis + " | " +
      item.keterangan + " | " + formatRupiah(jumlah);

    const tombolHapus = document.createElement("button");
    tombolHapus.textContent = "Hapus";
    tombolHapus.className = "hapus";
    tombolHapus.addEventListener("click", function () {
      hapusCatatan(item.id);
    });

    baris.appendChild(tombolHapus);
    daftar.appendChild(baris);
  }

  document.getElementById("totalMasuk").textContent = formatRupiah(totalMasuk);
  document.getElementById("totalKeluar").textContent = formatRupiah(totalKeluar);
  document.getElementById("saldo").textContent = formatRupiah(totalMasuk - totalKeluar);
}

function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}