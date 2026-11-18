import "./HalamanAdminRoom.css";
import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import RoomTurnamen from "./RoomTurnamen";

function HalamanAdminRoom({ akun, bukaHalaman, logoutAdmin }) {
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [turnamen, setTurnamen] = useState([]);
  const [turnamenTerpilih, setTurnamenTerpilih] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const ambilTurnamen = async () => {
      try {
        const hasil = await apiRequest("/tournaments");
        setTurnamen(hasil.data || []);
      } catch (err) {
        setError(err.message || "Gagal mengambil daftar turnamen.");
      } finally {
        setLoading(false);
      }
    };

    ambilTurnamen();
  }, []);

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

  {/* SIDEBAR ADMIN */}
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
      <button onClick={() => {
        setAdminMenuOpen(false);
        bukaHalaman("admin");
      }}>
        🏠 Dashboard
      </button>

      <button onClick={() => {
        setAdminMenuOpen(false);
        bukaHalaman("admin-turnamen");
      }}>
        🏆 Turnamen
      </button>

      <button onClick={() => {
        setAdminMenuOpen(false);
        bukaHalaman("admin-peserta");
      }}>
        👥 Peserta
      </button>

      <button onClick={() => {
        setAdminMenuOpen(false);
        bukaHalaman("admin-pertandingan");
      }}>
        ⚔️ Pertandingan
      </button>

      <button onClick={() => {
        setAdminMenuOpen(false);
        bukaHalaman("admin-berita");
      }}>
        📰 Berita
      </button>

      <button onClick={() => {
        setAdminMenuOpen(false);
        bukaHalaman("admin-braket");
      }}>
        🏅 Braket
      </button>

      <button className="admin-nav-active">
        💬 Room
      </button>

      <button onClick={() => {
        setAdminMenuOpen(false);
        bukaHalaman("admin-pengaturan");
      }}>
        ⚙️ Pengaturan
      </button>
    </nav>

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

  

      <section className="admin-content">
        <header className="admin-topbar">
          <div>
            <h1>Room Turnamen</h1>
            <p>Pilih turnamen untuk membuka ruang percakapan.</p>
          </div>
        </header>

        {!turnamenTerpilih ? (
          <section className="admin-panel">
            <h2>Daftar Room Turnamen</h2>

            {loading && <p>Memuat daftar turnamen...</p>}

            {error && <p className="room-error">{error}</p>}

            {!loading && !error && turnamen.length === 0 && (
              <p>Belum ada turnamen.</p>
            )}

            <div className="admin-tournament-grid">
              {turnamen.map((item) => (
                <div className="admin-tournament-card" key={item.id}>
                  <h2>{item.nama_turnamen}</h2>

                  <p>{item.deskripsi}</p>

                  <button
                    type="button"
                    onClick={() => setTurnamenTerpilih(item)}
                  >
                    BUKA ROOM
                  </button>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="admin-panel">
            <button
              type="button"
              onClick={() => setTurnamenTerpilih(null)}
            >
              ← KEMBALI KE DAFTAR ROOM
            </button>

            <h2>{turnamenTerpilih.nama_turnamen}</h2>

            <RoomTurnamen
              tournamentId={turnamenTerpilih.id}
              akun={akun}
            />
          </section>
        )}
      </section>
    </main>
  );
}

export default HalamanAdminRoom;
