
import { useCallback, useState } from "react";

const API_URL = import.meta.env.VITE_API_BASE_URL||"http://127.0.0.1:8000/api";

const formAwal = {
  nama_turnamen: "",
  deskripsi: "",
  hadiah: "",
  biaya_daftar: "",
  mode: "",
  jumlah_tim: "",
  tanggal_mulai: "",
  tanggal_selesai: "",
};

function HalamanAdminTurnamen({
  akun,
  bukaHalaman,
  logoutAdmin
}) {  
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [turnamen, setTurnamen] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(formAwal);

  // State khusus untuk file logo.
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  
          // Mengambil token login.
        const ambilToken = () => {
          const token = localStorage.getItem("token");

          if (!token) {
            throw new Error("Sesi login tidak ditemukan. Silakan login kembali.");
          }

          return token;
        };

  // Menghapus preview sementara dari browser.
  const hapusPreviewLama = () => {
    if (logoPreview && logoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }
  };

  // Mengambil daftar turnamen.
  const ambilTurnamen = useCallback(async () => {
    setLoading(true);

    try {
      const token = ambilToken();

      const response = await fetch(`${API_URL}/tournaments`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const hasil = await response.json();

      if (!response.ok) {
        throw new Error(hasil.message || "Gagal mengambil data turnamen.");
      }

      setTurnamen(hasil.data || []);
    } catch (error) {
      console.error("Error mengambil turnamen:", error);
      alert(error.message || "Tidak dapat mengambil data turnamen.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Menangani perubahan input biasa.
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((formSebelumnya) => ({
      ...formSebelumnya,
      [name]: value,
    }));
  };

  // Memilih gambar logo dari komputer.
  const handleLogoChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar.");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 2 MB.");
      e.target.value = "";
      return;
    }

    hapusPreviewLama();

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  // Menyimpan turnamen baru atau perubahan turnamen.
  const simpanTurnamen = async (e) => {
    e.preventDefault();

    try {
      const token = ambilToken();

      const url = editId
        ? `${API_URL}/tournaments/${editId}`
        : `${API_URL}/tournaments`;

      // Gunakan FormData agar gambar bisa dikirim ke Laravel.
      const formData = new FormData();

      formData.append("nama_turnamen", form.nama_turnamen);
      formData.append("deskripsi", form.deskripsi);
      formData.append("hadiah", form.hadiah);
      formData.append("biaya_daftar", form.biaya_daftar);
      formData.append("mode", form.mode);
      formData.append("jumlah_tim", form.jumlah_tim);
      formData.append("tanggal_mulai", form.tanggal_mulai);

      if (form.tanggal_selesai) {
        formData.append("tanggal_selesai", form.tanggal_selesai);
      }

      // Kirim logo hanya jika pengguna memilih gambar baru.
      if (logoFile) {
        formData.append("logo", logoFile);
      }

      // Laravel lebih aman menerima multipart melalui POST
      // dengan method spoofing untuk proses update.
      if (editId) {
        formData.append("_method", "PUT");
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const hasil = await response.json();

      console.log("Hasil simpan turnamen:", hasil);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sesi login berakhir. Silakan login kembali.");
        }

        if (response.status === 403) {
          throw new Error("Akses ditolak. Akun ini bukan admin.");
        }

        if (response.status === 422 && hasil.errors) {
          const pesanValidasi = Object.values(hasil.errors)
            .flat()
            .join("\n");

          throw new Error(pesanValidasi);
        }

        throw new Error(hasil.message || "Gagal menyimpan turnamen.");
      }

      alert(
        editId
          ? "Turnamen berhasil diubah!"
          : "Turnamen berhasil ditambahkan!"
      );

      hapusPreviewLama();
      setForm({ ...formAwal });
      setEditId(null);
      setLogoFile(null);
      setLogoPreview("");

      await ambilTurnamen();
    } catch (error) {
      console.error("Error menyimpan turnamen:", error);
      alert(error.message || "Tidak dapat terhubung ke Laravel.");
    }
  };

  // Mengisi form ketika tombol EDIT ditekan.
  const editTurnamen = (item) => {
    hapusPreviewLama();

    setEditId(item.id);

    setForm({
      nama_turnamen: item.nama_turnamen || "",
      deskripsi: item.deskripsi || "",
      hadiah: item.hadiah ?? "",
      biaya_daftar: item.biaya_daftar ?? "",
      mode: item.mode || "",
      jumlah_tim: item.jumlah_tim ?? "",
      tanggal_mulai: item.tanggal_mulai || "",
      tanggal_selesai: item.tanggal_selesai || "",
    });

    // Tampilkan logo lama jika tersedia.
    setLogoFile(null);
    setLogoPreview(item.logo_url || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Menghapus turnamen.
  const hapusTurnamen = async (id) => {
    const yakin = window.confirm(
      "Apakah kamu yakin ingin menghapus turnamen ini?"
    );

    if (!yakin) return;

    try {
      const token = ambilToken();

      const response = await fetch(`${API_URL}/tournaments/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const hasil = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sesi login berakhir. Silakan login kembali.");
        }

        if (response.status === 403) {
          throw new Error("Akses ditolak. Akun ini bukan admin.");
        }

        throw new Error(hasil.message || "Gagal menghapus turnamen.");
      }

      alert("Turnamen berhasil dihapus!");

      await ambilTurnamen();
    } catch (error) {
      console.error("Error menghapus turnamen:", error);
      alert(error.message || "Tidak dapat terhubung ke Laravel.");
    }
  };

  // Membatalkan proses edit.
  const batalEdit = () => {
    hapusPreviewLama();

    setEditId(null);
    setForm({ ...formAwal });
    setLogoFile(null);
    setLogoPreview("");
  };

  return (
    <main className="admin-page">
      {/* HEADER ADMIN UNTUK HP */}
      <div className="admin-mobile-header">
        <div className="admin-mobile-logo">
          FREE FIRE
        </div>

        <button
          className="admin-mobile-menu-button"
          onClick={() => setAdminMenuOpen(true)}
        >
          ☰
        </button>
      </div>

      {/* SIDEBAR */}
      <aside
        className={`admin-sidebar ${
          adminMenuOpen ? "admin-sidebar-open" : ""
        }`}
      >
        <button
          className="admin-mobile-close"
          onClick={() => setAdminMenuOpen(false)}
        >
          ✕
        </button>

        <div className="admin-logo">
          <strong>FREE FIRE</strong>
          <span>TOURNAMENT</span>
        </div>

        <nav className="admin-nav">
          <button
            onClick={() => {
              setAdminMenuOpen(false);
              bukaHalaman("admin");
            }}
          >
            🏠 Dashboard
          </button>

          <button
            className="admin-nav-active"
            onClick={() => setAdminMenuOpen(false)}
          >
            🏆 Turnamen
          </button>

          <button
            onClick={() => {
              setAdminMenuOpen(false);
              bukaHalaman("admin-peserta");
            }}
          >
            👥 Peserta
          </button>

          
          <button
            onClick={() => {
              setAdminMenuOpen(false);
              bukaHalaman("admin-pertandingan");
            }}
          >
            ⚔️ Pertandingan
          </button>

          <button
            onClick={() => {
              setAdminMenuOpen(false);
              bukaHalaman("admin-berita");
            }}
          >
            📰 Berita
          </button>

          <button
            onClick={() => {
              setAdminMenuOpen(false);
              bukaHalaman("admin-braket");
            }}
          >
            🏅 Braket
          </button>


          <button
              onClick={() => {
                setAdminMenuOpen(false);
                bukaHalaman("admin-room");
              }}
            >
              💬 Room
            </button>

          <button onClick={() => setAdminMenuOpen(false)}>
            ⚙️ Pengaturan
          </button>
        </nav>

        {/* INFORMASI ADMIN DAN TOMBOL KELUAR */}
        <div className="admin-sidebar-bottom">

          <p>Admin</p>

          <small>
            {akun?.email}
          </small>

          <button
            className="admin-logout-button"
            onClick={logoutAdmin}
          >
            🚪 Keluar
          </button>

        </div>

      </aside>

      {/* KONTEN UTAMA */}
      <section className="admin-content">
        <header className="admin-topbar">
          <div>
            <h1>Kelola Turnamen</h1>
            <p>Kelola seluruh turnamen Free Fire.</p>
          </div>
        </header>

        {/* FORM TAMBAH DAN EDIT */}
        <section className="admin-panel">
          <div className="admin-panel-header">
            <h2>
              {editId ? "Edit Turnamen" : "Tambah Turnamen"}
            </h2>
          </div>

          <form onSubmit={simpanTurnamen} className="admin-form">
            <input
              type="text"
              name="nama_turnamen"
              placeholder="Nama Turnamen"
              value={form.nama_turnamen}
              onChange={handleChange}
              required
            />

            <textarea
              name="deskripsi"
              placeholder="Deskripsi Turnamen"
              value={form.deskripsi}
              onChange={handleChange}
            />

            <input
              type="number"
              name="hadiah"
              placeholder="Hadiah"
              value={form.hadiah}
              onChange={handleChange}
              min="0"
              required
            />

            <input
              type="number"
              name="biaya_daftar"
              placeholder="Biaya Pendaftaran"
              value={form.biaya_daftar}
              onChange={handleChange}
              min="0"
              required
            />

            <input
              type="text"
              name="mode"
              placeholder="Mode (Solo / Duo / Squad)"
              value={form.mode}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="jumlah_tim"
              placeholder="Jumlah Tim"
              value={form.jumlah_tim}
              onChange={handleChange}
              min="1"
              required
            />

            <label>Tanggal Mulai</label>

            <input
              type="date"
              name="tanggal_mulai"
              value={form.tanggal_mulai}
              onChange={handleChange}
              required
            />

            <label>Tanggal Selesai</label>

            <input
              type="date"
              name="tanggal_selesai"
              value={form.tanggal_selesai}
              onChange={handleChange}
            />

            {/* INPUT UPLOAD LOGO */}
            <label htmlFor="logo-turnamen">
              Logo Turnamen
            </label>

            <input
              id="logo-turnamen"
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              onChange={handleLogoChange}
            />

            <small>
              Format JPG, JPEG, PNG, atau WEBP. Maksimal 2 MB.
            </small>

            {/* PREVIEW LOGO */}
            {logoPreview && (
              <div className="logo-preview-container">
                <p>Preview Logo:</p>

                <img
                  src={logoPreview}
                  alt="Preview logo turnamen"
                  className="logo-preview"
                />
              </div>
            )}

            <div className="admin-form-buttons">
              <button type="submit">
                {editId
                  ? "SIMPAN PERUBAHAN"
                  : "+ TAMBAH TURNAMEN"}
              </button>

              {editId && (
                <button type="button" onClick={batalEdit}>
                  BATAL EDIT
                </button>
              )}
            </div>
          </form>
        </section>

        {/* DAFTAR TURNAMEN */}
        <section className="admin-panel">
          <div className="admin-panel-header">
            <h2>Daftar Turnamen</h2>

            <button
              type="button"
              onClick={ambilTurnamen}
              disabled={loading}
            >
              {loading ? "MEMUAT..." : "TAMPILKAN TURNAMEN"}
            </button>
          </div>

          {loading && <p>Memuat data turnamen...</p>}

          {!loading && turnamen.length === 0 && (
            <p>Belum ada data turnamen.</p>
          )}

          <div className="admin-tournament-grid">
            {turnamen.map((item) => (
              <div
                key={item.id}
                className="admin-tournament-card"
              >
                <div className="admin-tournament-logo">
                  {item.logo_url ? (
                    <img
                      src={item.logo_url}
                      alt={`Logo ${item.nama_turnamen}`}
                    />
                  ) : (
                    <span>🏆</span>
                  )}
                </div>

                <h2>{item.nama_turnamen}</h2>

                <p>{item.deskripsi}</p>

                <div className="admin-tournament-info">
                  <span>Hadiah</span>
                  <strong>
                    Rp
                    {Number(item.hadiah || 0).toLocaleString("id-ID")}
                  </strong>
                </div>

                <div className="admin-tournament-info">
                  <span>Biaya Daftar</span>
                  <strong>
                    Rp
                    {Number(item.biaya_daftar || 0).toLocaleString("id-ID")}
                  </strong>
                </div>

                <div className="admin-tournament-info">
                  <span>Mode</span>
                  <strong>{item.mode}</strong>
                </div>

                <div className="admin-tournament-info">
                  <span>Jumlah Tim</span>
                  <strong>{item.jumlah_tim}</strong>
                </div>

                <div className="admin-tournament-info">
                  <span>Status</span>
                  <strong>{item.status || "Belum ditentukan"}</strong>
                </div>

                <div className="admin-card-buttons">
                  <button
                    type="button"
                    onClick={() => editTurnamen(item)}
                  >
                    EDIT
                  </button>

                  <button
                    type="button"
                    onClick={() => hapusTurnamen(item.id)}
                  >
                    HAPUS
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

export default HalamanAdminTurnamen;
