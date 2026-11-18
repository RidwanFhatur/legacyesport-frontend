import { useState, useEffect } from "react";
import { apiRequest } from "../services/api";

function formatTanggal(tanggal) {
  if (!tanggal) return "-";

  return new Date(`${tanggal}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatStatus(status) {
  const daftarStatus = {
    terverifikasi: "Terverifikasi",
    menunggu_verifikasi: "Menunggu Verifikasi",
    menunggu_pembayaran: "Menunggu Pembayaran",
    ditolak: "Ditolak",
    dibuka: "Dibuka",
    penuh: "Penuh",
    belum_dimulai: "Belum Mulai",
  };

  return daftarStatus[status] || status || "-";
}

function HalamanAdmin({ akun, bukaHalaman, logoutAdmin }) {

  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [memuat, setMemuat] = useState(true);
  const [errorDashboard, setErrorDashboard] = useState("");

useEffect(() => {
  const ambilDataDashboard = async () => {
    try {
      setMemuat(true);
      setErrorDashboard("");

      const hasil = await apiRequest("/admin/dashboard");

      setDashboard(hasil);
    } catch (error) {
      console.error("Gagal mengambil dashboard:", error);
      setErrorDashboard(error.message || "Gagal mengambil data dashboard.");
    } finally {
      setMemuat(false);
    }
  };

  ambilDataDashboard();
}, []);

  return (
    <main className="admin-page">

      {/* =========================================
          HEADER ADMIN UNTUK HP
      ========================================= */}

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


      {/* =========================================
          SIDEBAR ADMIN
      ========================================= */}

      <aside
        className={`admin-sidebar ${
          adminMenuOpen ? "admin-sidebar-open" : ""
        }`}
      >

        {/* TOMBOL CLOSE KHUSUS HP */}

        <button
          className="admin-mobile-close"
          onClick={() => setAdminMenuOpen(false)}
        >
          ✕
        </button>


        {/* LOGO */}

        <div className="admin-logo">

          <strong>
            FREE FIRE
          </strong>

          <span>
            TOURNAMENT
          </span>

        </div>


        {/* MENU ADMIN */}

        <nav className="admin-nav">

          <button
            className="admin-nav-active"
            onClick={() => {
              setAdminMenuOpen(false);
              bukaHalaman("admin");
            }}
          >
            🏠 Dashboard
          </button>


          <button
            onClick={() => {
              setAdminMenuOpen(false);
              bukaHalaman("admin-turnamen");
            }}
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


          <button
            onClick={() => setAdminMenuOpen(false)}
          >
            ⚙️ Pengaturan
          </button>

        </nav>


        {/* INFORMASI ADMIN */}

        <div className="admin-sidebar-bottom">

        <p>
          Admin
        </p>

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


      {/* =========================================
          KONTEN ADMIN
      ========================================= */}

      <section className="admin-content">


        {/* HEADER */}

        <header className="admin-topbar">

          <div>

            <h1>
              Dashboard Admin
            </h1>

            <p>
              Selamat datang, {akun?.name}
            </p>

          </div>


          <div className="admin-profile">

            <span>
              👤
            </span>

            <div>

              <strong>
                {akun?.name}
              </strong>

              <small>
                Administrator
              </small>

            </div>

          </div>

        </header>

        {errorDashboard && (
          <p style={{ color: "#ff6b6b", margin: "15px 0" }}>
            Gagal memuat dashboard: {errorDashboard}
          </p>
        )}


        {/* =========================================
            STATISTIK
        ========================================= */}

        
       <section className="admin-stat-grid">

          <div className="admin-stat-card green">
            <span>📰</span>
            <div>
              <strong>{dashboard?.statistik?.total_berita ?? 0}</strong>
              <p>Total Berita</p>
            </div>
          </div>

          <div className="admin-stat-card purple">
            <span>⚔️</span>
            <div>
              <strong>{dashboard?.statistik?.total_pertandingan ?? 0}</strong>
              <p>Total Pertandingan</p>
            </div>
          </div>

          <div className="admin-stat-card blue">
            <span>👥</span>
            <div>
              <strong>{dashboard?.statistik?.total_peserta ?? 0}</strong>
              <p>Total Peserta</p>
            </div>
          </div>

          <div className="admin-stat-card yellow">
            <span>🏆</span>
            <div>
              <strong>{dashboard?.statistik?.total_turnamen ?? 0}</strong>
              <p>Total Turnamen</p>
            </div>
          </div>

        </section>


      
        {/* DATA DASHBOARD */}

       <section className="admin-dashboard-grid">

          {/* PENDAFTAR TERBARU */}
          <div className="admin-panel">

            <div className="admin-panel-header">
              <h2>Pendaftar Terbaru</h2>
              <button onClick={() => bukaHalaman("admin-peserta")}>
                Lihat Semua →
              </button>
            </div>

            {memuat ? (
              <p>Memuat data...</p>
            ) : dashboard?.pendaftar_terbaru?.length > 0 ? (
              dashboard.pendaftar_terbaru.map((item) => (
                <div className="admin-list-item" key={item.id}>
                  <div className="admin-list-icon">👤</div>

                  <div>
                    <strong>{item.nama_tim}</strong>
                    <small>{item.tournament?.nama_turnamen || "-"}</small>
                  </div>

                  <span className={`status-badge ${
                    item.status_pembayaran === "terverifikasi"
                      ? "terverifikasi"
                      : item.status_pembayaran === "ditolak"
                      ? "ditolak"
                      : "menunggu"
                  }`}>
                    {formatStatus(item.status_pembayaran)}
                  </span>
                </div>
              ))
            ) : (
              <p>Belum ada pendaftar.</p>
            )}

          </div>


          {/* TURNAMEN TERBARU */}
          <div className="admin-panel">

            <div className="admin-panel-header">
              <h2>Turnamen Terbaru</h2>
              <button onClick={() => bukaHalaman("admin-turnamen")}>
                Lihat Semua →
              </button>
            </div>

            {memuat ? (
              <p>Memuat data...</p>
            ) : dashboard?.turnamen_terbaru?.length > 0 ? (
              dashboard.turnamen_terbaru.map((item) => (
                <div className="admin-list-item" key={item.id}>
                  <div className="admin-list-icon">🏆</div>

                  <div>
                    <strong>{item.nama_turnamen}</strong>
                    <small>
                      {formatTanggal(item.tanggal_mulai)}
                      {" - "}
                      {formatTanggal(item.tanggal_selesai)}
                    </small>
                  </div>

                  <span className={`status-badge ${
                    item.status === "dibuka"
                      ? "dibuka"
                      : item.status === "penuh"
                      ? "penuh"
                      : "menunggu"
                  }`}>
                    {formatStatus(item.status)}
                  </span>
                </div>
              ))
            ) : (
              <p>Belum ada turnamen.</p>
            )}

          </div>

        </section>


      </section>

    </main>
  );
}

export default HalamanAdmin;