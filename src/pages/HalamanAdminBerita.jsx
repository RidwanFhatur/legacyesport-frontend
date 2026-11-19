import "./HalamanAdminBerita.css";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_BASE_URL + "/news"||"http://127.0.0.1:8000/api/news";
const SERVER_URL = import.meta.env.VITE_SERVER_BASE_URL;

function HalamanAdminBerita({
  akun,
  bukaHalaman,
  logoutAdmin
}) {
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [berita, setBerita] = useState([]);
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [gambar, setGambar] = useState(null);
  const [gambarLama, setGambarLama] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pesan, setPesan] = useState("");
  const [error, setError] = useState("");

  const ambilToken = () => localStorage.getItem("token");

  const ambilBerita = async () => {
    setLoading(true);
    setError("");

    try {
        const response = await fetch(API_URL, {
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });

        const hasil = await response.json();

        if (!response.ok) {
            throw new Error(
                hasil.message || "Gagal mengambil daftar berita."
            );
        }

        // Membaca data jika berbentuk array atau object data
        const daftarBerita = Array.isArray(hasil)
            ? hasil
            : Array.isArray(hasil.data)
                ? hasil.data
                : [];

        setBerita(daftarBerita);

    } catch (err) {
        console.error("Gagal mengambil berita:", err);
        setError(err.message);
    } finally {
        setLoading(false);
    }
};
  
useEffect(() => {
    let masihAktif = true;

    const muatBerita = async () => {
        try {
            const response = await fetch(API_URL, {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            const hasil = await response.json();

            if (!response.ok) {
                throw new Error(
                    hasil.message || "Gagal mengambil daftar berita."
                );
            }

            const daftarBerita = Array.isArray(hasil)
                ? hasil
                : Array.isArray(hasil.data)
                    ? hasil.data
                    : [];

            if (masihAktif) {
                setBerita(daftarBerita);
                setError("");
            }

        } catch (err) {
            if (masihAktif) {
                console.error("Gagal mengambil berita:", err);
                setError(err.message);
            }
        } finally {
            if (masihAktif) {
                setLoading(false);
            }
        }
    };

    muatBerita();

    return () => {
        masihAktif = false;
    };
}, []);




  const resetForm = () => {
    setJudul("");
    setIsi("");
    setGambar(null);
    setGambarLama("");
    setEditId(null);
};

 
const simpanBerita = async (event) => {
    event.preventDefault();
    setPesan("");
    setError("");

    const token = ambilToken();

    if (!token) {
        setError("Token login tidak ditemukan. Silakan login kembali.");
        return;
    }

    try {
        const formData = new FormData();

        formData.append("title", judul);
        formData.append("content", isi);

        if (gambar) {
            formData.append("image", gambar);
        }

        // Laravel menerima upload file melalui POST.
        // Untuk edit, gunakan _method PUT.
        if (editId) {
            formData.append("_method", "PUT");
        }

        const url = editId
            ? `${API_URL}/${editId}`
            : API_URL;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Berita gagal disimpan."
            );
        }

        setPesan(data.message || "Berita berhasil disimpan.");

        resetForm();
        await ambilBerita();

    } catch (err) {
        setError(err.message);
    }
};


 const mulaiEdit = (item) => {
    setEditId(item.id);
    setJudul(item.title || "");
    setIsi(item.content || "");
    setGambar(null);
    setGambarLama(item.image || "");
    setPesan("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
};

  const hapusBerita = async (id) => {
    const yakin = window.confirm(
      "Yakin ingin menghapus berita ini?"
    );

    if (!yakin) return;

    const token = ambilToken();

    if (!token) {
      setError("Token login tidak ditemukan. Silakan login kembali.");
      return;
    }

    setPesan("");
    setError("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Berita gagal dihapus.");
      }

      setPesan(data.message || "Berita berhasil dihapus.");

      if (editId === id) resetForm();

      await ambilBerita();
    } catch (err) {
      setError(err.message);
    }
  };
  console.log("JUMLAH STATE BERITA:", berita.length);
  console.log("ISI STATE BERITA:", berita);

  return (
  <main className="admin-page admin-berita-page">

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
        <span>ADMIN</span>
      </div>

      <nav className="admin-nav">

        <button onClick={() => bukaHalaman("admin")}>
          🏠 Dashboard
        </button>

        <button onClick={() => bukaHalaman("admin-turnamen")}>
          🏆 Turnamen
        </button>

        <button onClick={() => bukaHalaman("admin-peserta")}>
          👥 Peserta
        </button>

        <button onClick={() => bukaHalaman("admin-pertandingan")}>
          ⚔️ Pertandingan
        </button>

        <button
          className="admin-nav-active"
          onClick={() => setAdminMenuOpen(false)}
        >
          📰 Berita
        </button>

        <button onClick={() => bukaHalaman("admin-braket")}>
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

        <button
            onClick={() => setAdminMenuOpen(false)}
          >
            ⚙️ Pengaturan
          </button>

      </nav>

      {/* INFORMASI ADMIN DAN TOMBOL KELUAR */}
      <div className="admin-sidebar-bottom">
        <p>Admin</p>
        <small>{akun?.email}</small>

        <button
          className="admin-logout-button"
          onClick={logoutAdmin}
        >
          🚪 Keluar
        </button>
      </div>
    </aside>

    {/* CONTENT */}

      <section className="admin-content admin-news-page">
        <header className="admin-topbar">
          <div>
            <h1>Kelola Berita</h1>
            <p>Halo, {akun?.name || "Admin"}. Kelola berita turnamen di sini.</p>
          </div>

          <button onClick={() => bukaHalaman("admin")}>
            ← Dashboard
          </button>
        </header>

        <section className="admin-panel admin-news-form-panel">
          <h2>{editId ? "Edit Berita" : "Tambah Berita"}</h2>

          {pesan && <p className="news-success">{pesan}</p>}
          {error && <p className="news-error">{error}</p>}

          <form onSubmit={simpanBerita} className="admin-news-form">
            <label htmlFor="news-title">Judul berita</label>
            <input
              id="news-title"
              value={judul}
              onChange={(event) => setJudul(event.target.value)}
              placeholder="Contoh: Turnamen Free Fire Dibuka!"
              maxLength={255}
              required
            />

            <label htmlFor="news-content">Isi berita</label>
            <textarea
              id="news-content"
              value={isi}
              onChange={(event) => setIsi(event.target.value)}
              placeholder="Tulis isi berita..."
              rows={5}
              required
            />

            
            <label htmlFor="news-image">Upload foto berita (opsional)</label>

            <input
                id="news-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                    setGambar(event.target.files[0] || null);
                }}
            />

            {gambarLama && !gambar && (
                <div className="news-image-preview">
                    <p>Foto saat ini:</p>
                    <img
                        src={`${SERVER_URL}/storage/${gambarLama}`}
                        alt="Foto berita sebelumnya"
                    />
                </div>
            )}

            {gambar && (
                <div className="news-image-preview">
                    <p>Foto yang dipilih:</p>
                    <img
                        src={URL.createObjectURL(gambar)}
                        alt="Preview foto baru"
                    />
                </div>
            )}


            <div className="admin-news-form-actions">
              <button type="submit">
                {editId ? "Simpan Perubahan" : "Tambah Berita"}
              </button>

              {editId && (
                <button type="button" onClick={resetForm}>
                  Batal Edit
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="admin-panel admin-news-list-panel">
          <div className="admin-panel-header">
            <h2>Daftar Berita ({berita.length})</h2>

            <button onClick={ambilBerita} disabled={loading}>
              {loading ? "Memuat..." : "Muat Ulang"}
            </button>
          </div>

          {loading ? (
            <p>Memuat berita...</p>
          ) : berita.length === 0 ? (
            <p>Belum ada berita.</p>
          ) : (
            <div className="admin-news-list">
              {berita.map((item) => (
                <article className="admin-news-item" key={item.id}>
                {item.image && (
                      <img
                          src={
                              item.image.startsWith("http")
                                  ? item.image
                                  : `${SERVER_URL}/storage/${item.image}`
                          }
                          alt={item.title}
                          className="admin-news-photo"
                      />
                  )}

                  <div className="admin-news-item-content">
                    <h3>{item.title}</h3>
                    <p>{item.content}</p>

                    <small>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString("id-ID")
                        : ""}
                    </small>

                    <div className="admin-news-item-actions">
                      <button onClick={() => mulaiEdit(item)}>
                        Edit
                      </button>

                      <button
                        className="admin-news-delete"
                        onClick={() => hapusBerita(item.id)}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default HalamanAdminBerita;
