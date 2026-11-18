
import { useEffect, useState } from "react";
import "./App.css";
import { apiRequest } from "./services/api";

import HalamanAdminBerita from "./pages/HalamanAdminBerita";
import Beranda from "./pages/Beranda";
import HalamanAdminPeserta from "./pages/HalamanAdminPeserta";
import HalamanAdminTurnamen from "./pages/HalamanAdminTurnamen";
import HalamanTurnamen from "./pages/HalamanTurnamen";
import DetailTurnamen from "./pages/DetailTurnamen";
import HalamanPertandingan from "./pages/HalamanPertandingan";
import HalamanAkun from "./pages/HalamanAkun";
import HalamanPendaftaran from "./pages/HalamanPendaftaran";
import HalamanLogin from "./pages/HalamanLogin";
import HalamanDaftar from "./pages/HalamanDaftar";
import HalamanAdmin from "./pages/HalamanAdmin";
import HalamanAdminPertandingan from "./pages/HalamanAdminPertandingan";
import HalamanAdminBraket from "./pages/HalamanAdminBraket";
import HalamanAdminRoom from "./pages/HalamanAdminRoom";
import HalamanAdminPengaturan from "./pages/HalamanAdminPengaturan";

function App() {
  // Menentukan halaman yang sedang dibuka
  const [page, setPage] = useState("beranda");
  const [turnamenTerpilih, setTurnamenTerpilih] = useState(null);

  // Menu hamburger
  const [menuOpen, setMenuOpen] = useState(false);

  // Data akun
const [akun, setAkun] = useState(null);
const [sudahLogin, setSudahLogin] = useState(false);
const [sedangMemeriksaLogin, setSedangMemeriksaLogin] = useState(true);

  // Pengaturan identitas Website
  const [siteSettings, setSiteSettings] = useState({
    site_name: "FREE FIRE TOURNAMENT",
    site_logo_url: "",
    site_description: "",
    footer_text: "",
    copyright_text: "",
  });

  const ambilSiteSettings = async () => {
  try {
    const hasil = await apiRequest("/site-settings", {
      method: "GET",
    });

    setSiteSettings({
      site_name: hasil.data.site_name || "LEGACY ESPORTS",
      site_logo_url: hasil.data.site_logo_url || "",
      site_description: hasil.data.site_description || "",
      footer_text: hasil.data.footer_text || "",
      copyright_text: hasil.data.copyright_text || "",
    });
  } catch (error) {
    console.error(
      "Gagal mengambil identitas Website:",
      error.message
    );
  }
};

  // Mengambil identitas Website dari Laravel
// Mengambil identitas Website saat aplikasi dibuka
useEffect(() => {
  let masihAktif = true;

  const muatSiteSettings = async () => {
    try {
      const hasil = await apiRequest("/site-settings", {
        method: "GET",
      });

      if (!masihAktif) return;

      setSiteSettings({
        site_name: hasil.data.site_name || "LEGACY ESPORTS",
        site_logo_url: hasil.data.site_logo_url || "",
        site_description: hasil.data.site_description || "",
        footer_text: hasil.data.footer_text || "",
        copyright_text: hasil.data.copyright_text || "",
      });
    } catch (error) {
      if (!masihAktif) return;

      console.error(
        "Gagal mengambil identitas Website:",
        error.message
      );
    }
  };

  muatSiteSettings();

  return () => {
    masihAktif = false;
  };
}, []);

    // Memulihkan sesi login ketika website dibuka atau di-refresh
  useEffect(() => {
    const pulihkanLogin = async () => {
      const token = localStorage.getItem("token");

      // Jika tidak ada token, pengguna belum login
      if (!token) {
        setAkun(null);
        setSudahLogin(false);
        setPage("beranda");
        setSedangMemeriksaLogin(false);
        return;
      }

      try {
        const hasil = await apiRequest("/user", {
          method: "GET",
          token: token,
        });

       // Mengembalikan data akun dari Laravel
      setAkun(hasil.data);
      setSudahLogin(true);

      // Mengarahkan halaman berdasarkan role akun
      if (hasil.data.role === "admin") {
        setPage("admin");
      } else {
        setPage("beranda");
      }
      } catch (error) {
        console.error("Gagal memulihkan login:", error);

        // Hanya hapus token jika token tidak valid
        if (error.status === 401) {
          localStorage.removeItem("token");
          setAkun(null);
          setSudahLogin(false);
        }

      } finally {
        setSedangMemeriksaLogin(false);
      }
    };

    pulihkanLogin();
  }, []);

  // Fungsi logout admin
  const logoutAdmin = () => {
    localStorage.removeItem("token");

    setAkun(null);
    setSudahLogin(false);
    setMenuOpen(false);
    setPage("login");
  };

  // Memeriksa halaman admin
  const isAdminPage = [
    "admin",
    "admin-turnamen",
    "admin-peserta",
    "admin-pertandingan",
    "admin-berita",
    "admin-braket",
    "admin-room",
    "admin-pengaturan",
  ].includes(page);

  // Memeriksa halaman Login dan Daftar
const isAuthPage = ["login", "daftar"].includes(page);

  // Fungsi untuk pindah halaman
 
const bukaHalaman = (halaman, data = null) => {
  setPage(halaman);
  setMenuOpen(false);

  // Perbarui turnamen hanya jika data baru diberikan.
  // Jika kembali dari pendaftaran, pertahankan turnamen sebelumnya.
  if (
    (halaman === "detail-turnamen" ||
      halaman === "pendaftaran") &&
    data !== null &&
    data !== undefined
  ) {
    setTurnamenTerpilih(data);
  }
};


   // Menunggu pemeriksaan sesi login selesai
  if (sedangMemeriksaLogin) {
    return (
      <div className="app">
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#ffd32e",
            fontSize: "16px",
          }}
        >
          Memeriksa akun...
        </div>
      </div>
    );
  }

  return (
    <div className="app">

      {/* ================= HEADER ================= */}

          {!isAdminPage && !isAuthPage && (
        <header className="header">

          <div className="header-site-identity">

            {siteSettings.site_logo_url && (
              <img
                src={siteSettings.site_logo_url}
                alt="Logo Website"
                className="header-site-logo"
              />
            )}

            <div className="header-site-text">
              <strong>
                {siteSettings.site_name}
              </strong>

              {siteSettings.site_description && (
                <small>
                  {siteSettings.site_description}
                </small>
              )}
            </div>

          </div>

          <button
            className="menu-button"
            onClick={() => setMenuOpen(true)}
            aria-label="Buka menu"
          >
            ☰
          </button>

        </header>
      )}

      {/* ================= MENU ================= */}

      {!isAdminPage && !isAuthPage && menuOpen && (
        <div
          className="menu-overlay"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="side-menu"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="menu-header">
              <h2>MENU</h2>

              <button
                className="close-button"
                onClick={() => setMenuOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="menu-list">

              {akun?.role === "admin" ? (
                <>
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

                  <button onClick={() => bukaHalaman("admin-berita")}>
                    📰 Berita
                  </button>

                  <button onClick={() => bukaHalaman("admin-pengaturan")}>
                    ⚙️ Pengaturan
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => bukaHalaman("beranda")}>
                    🏠 Beranda
                  </button>

                  <button onClick={() => bukaHalaman("turnamen")}>
                    🏆 Turnamen
                  </button>

                  <button onClick={() => bukaHalaman("pertandingan")}>
                    ⚔️ Pertandingan
                  </button>

                  

                  <button onClick={() => bukaHalaman("akun")}>
                    👤 Akun
                  </button>
                </>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ================= ISI HALAMAN ================= */}

      {page === "beranda" && (
        <Beranda bukaHalaman={bukaHalaman} />
      )}

      {page === "turnamen" && (
        <HalamanTurnamen bukaHalaman={bukaHalaman} />
      )}

      {page === "detail-turnamen" && (
        <DetailTurnamen
          bukaHalaman={bukaHalaman}
          turnamenId={turnamenTerpilih}
          akun={akun}
        />
      )}

      {page === "pendaftaran" && (
        <HalamanPendaftaran
          bukaHalaman={bukaHalaman}
          turnamen={turnamenTerpilih}
        />
      )}

      {page === "pertandingan" && (
        <HalamanPertandingan />
      )}

      {page === "akun" && (
        <HalamanAkun
          bukaHalaman={bukaHalaman}
          akun={akun}
          sudahLogin={sudahLogin}
          setSudahLogin={setSudahLogin}
          setAkun={setAkun}
        />
      )}

      {page === "admin" && (
        akun?.role === "admin" ? (
          <HalamanAdmin
            akun={akun}
            bukaHalaman={bukaHalaman}
            logoutAdmin={logoutAdmin}
          />
        ) : (
          <HalamanAkun
            bukaHalaman={bukaHalaman}
            akun={akun}
            sudahLogin={sudahLogin}
            setSudahLogin={setSudahLogin}
            setAkun={setAkun}
          />
        )
      )}

      {page === "admin-turnamen" && (
        akun?.role === "admin" ? (
          <HalamanAdminTurnamen
            akun={akun}
            bukaHalaman={bukaHalaman}
            logoutAdmin={logoutAdmin}
          />
        ) : (
          <HalamanAkun
            bukaHalaman={bukaHalaman}
            akun={akun}
            sudahLogin={sudahLogin}
            setSudahLogin={setSudahLogin}
            setAkun={setAkun}
          />
        )
      )}

      {page === "admin-peserta" && (
        akun?.role === "admin" ? (
          <HalamanAdminPeserta
            akun={akun}
            bukaHalaman={bukaHalaman}
            logoutAdmin={logoutAdmin}
          />
        ) : (
          <HalamanAkun
            bukaHalaman={bukaHalaman}
            akun={akun}
            sudahLogin={sudahLogin}
            setSudahLogin={setSudahLogin}
            setAkun={setAkun}
          />
        )
      )}

      {page === "admin-pertandingan" && (
        akun?.role === "admin" ? (
          <HalamanAdminPertandingan
            akun={akun}
            bukaHalaman={bukaHalaman}
            logoutAdmin={logoutAdmin}
          />
        ) : (
          <HalamanAkun
            bukaHalaman={bukaHalaman}
            akun={akun}
            sudahLogin={sudahLogin}
            setSudahLogin={setSudahLogin}
            setAkun={setAkun}
          />
        )
      )}

      {page === "admin-braket" && (
        akun?.role === "admin" ? (
          <HalamanAdminBraket
            akun={akun}
            bukaHalaman={bukaHalaman}
            logoutAdmin={logoutAdmin}
          />
        ) : (
          <HalamanAkun
            bukaHalaman={bukaHalaman}
            akun={akun}
            sudahLogin={sudahLogin}
            setSudahLogin={setSudahLogin}
            setAkun={setAkun}
          />
        )
      )}

      {page === "admin-room" && (
        akun?.role === "admin" ? (
          <HalamanAdminRoom
            akun={akun}
            bukaHalaman={bukaHalaman}
            logoutAdmin={logoutAdmin}
          />
        ) : (
          <HalamanAkun
            bukaHalaman={bukaHalaman}
            akun={akun}
            sudahLogin={sudahLogin}
            setSudahLogin={setSudahLogin}
            setAkun={setAkun}
          />
        )
      )}

      {/* HALAMAN PENGATURAN ADMIN */}
      {page === "admin-pengaturan" && (
        akun?.role === "admin" ? (
         <HalamanAdminPengaturan
          akun={akun}
          bukaHalaman={bukaHalaman}
          logoutAdmin={logoutAdmin}
          ambilSiteSettings={ambilSiteSettings}
        />
        ) : (
          <HalamanAkun
            bukaHalaman={bukaHalaman}
            akun={akun}
            sudahLogin={sudahLogin}
            setSudahLogin={setSudahLogin}
            setAkun={setAkun}
          />
        )
      )}

      {page === "login" && (
        <HalamanLogin
          bukaHalaman={bukaHalaman}
          akun={akun}
          setAkun={setAkun}
          setSudahLogin={setSudahLogin}
        />
      )}

      {page === "daftar" && (
        <HalamanDaftar
          bukaHalaman={bukaHalaman}
          setAkun={setAkun}
        />
      )}

      {page === "admin-berita" && (
        akun?.role === "admin" ? (
          <HalamanAdminBerita
            akun={akun}
            bukaHalaman={bukaHalaman}
            logoutAdmin={logoutAdmin}
          />
        ) : (
          <HalamanAkun
            bukaHalaman={bukaHalaman}
            akun={akun}
            sudahLogin={sudahLogin}
            setSudahLogin={setSudahLogin}
            setAkun={setAkun}
          />
        )
      )}

      {/* ================= FOOTER WEBSITE ================= */}

      {!isAdminPage && !isAuthPage && (
  <footer className="site-footer">

          <div className="site-footer-main">

            <div className="site-footer-identity">

              {siteSettings.site_logo_url && (
                <img
                  src={siteSettings.site_logo_url}
                  alt="Logo Website"
                  className="site-footer-logo"
                />
              )}

              <h3>
                {siteSettings.site_name}
              </h3>

            </div>

            {siteSettings.footer_text && (
              <p className="site-footer-description">
                {siteSettings.footer_text}
              </p>
            )}

          </div>

          {siteSettings.copyright_text && (
            <div className="site-footer-bottom">
              <p>{siteSettings.copyright_text}</p>
            </div>
          )}

        </footer>
      )}

    </div>
  );
}

export default App;
