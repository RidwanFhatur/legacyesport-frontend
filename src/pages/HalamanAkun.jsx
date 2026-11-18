import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

function HalamanAkun({
  bukaHalaman,
  akun,
  sudahLogin,
  setSudahLogin,
  setAkun
}) {

 const [pendaftaran, setPendaftaran] = useState([]);
const [pendaftaranDipilih, setPendaftaranDipilih] = useState(null);
const [loadingPendaftaran, setLoadingPendaftaran] = useState(false);

useEffect(() => {
  const ambilPendaftaran = async () => {
    if (!sudahLogin || !akun) return;

    try {
      setLoadingPendaftaran(true);

      const token = sessionStorage.getItem("token");

      const hasil = await apiRequest("/registrations", {
        token,
      });

      setPendaftaran(hasil.data || []);
    } catch (error) {
      console.error("Gagal mengambil pendaftaran:", error);
    } finally {
      setLoadingPendaftaran(false);
    }
  };

  ambilPendaftaran();
}, [sudahLogin, akun]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    setAkun(null);
    setSudahLogin(false);
    bukaHalaman("akun");
  };

  // ================= BELUM LOGIN =================

  if (!sudahLogin || !akun) {
    return (
      <main className="page account-page">

        <div className="account-icon">
          👤
        </div>

        <h1>AKUN</h1>

        <p>
          Silakan login terlebih dahulu untuk melihat akun.
        </p>

        <button
          className="login-button"
          onClick={() => bukaHalaman("login")}
        >
          LOGIN
        </button>

      </main>
    );
  }

  // ================= SUDAH LOGIN =================

  return (
    <main className="page account-page">

      <div className="account-icon">
        👤
      </div>

      <h1>AKUN</h1>

      <div className="account-user-info">

        <h2>
          {akun.name}
        </h2>

        <p>
          @{akun.email}
        </p>

      </div>

     {loadingPendaftaran ? (
  <div className="account-menu-card">
    <div className="account-menu-text">
      <h3>Memuat Pendaftaran...</h3>
      <p>Sedang mengambil data dari server.</p>
    </div>
  </div>
) : pendaftaran.length === 0 ? (
  <>
    <div className="account-menu-card">
      <div className="account-menu-icon">🏆</div>
      <div className="account-menu-text">
        <h3>Turnamen Saya</h3>
        <p>Belum ada turnamen yang diikuti.</p>
      </div>
    </div>

    <div className="account-menu-card">
      <div className="account-menu-icon">📋</div>
      <div className="account-menu-text">
        <h3>Status Tim</h3>
        <p>Belum ada tim yang terdaftar.</p>
      </div>
    </div>
  </>
) : (
  pendaftaran.map((item) => (
    <div className="account-menu-card" key={item.id}>
      <div className="account-menu-icon">🏆</div>

      <div className="account-menu-text">
        <h3>
          {item.tournament?.nama_turnamen || "Turnamen"}
        </h3>

        <p>
          Nama Tim: {item.nama_tim}
        </p>

       <div className="account-payment-status">
        <span
          className={`status-pembayaran ${item.status_pembayaran}`}
        >
          {item.status_pembayaran === "terverifikasi"
            ? "✓ Terverifikasi"
            : item.status_pembayaran === "ditolak"
            ? "✕ Ditolak"
            : item.status_pembayaran === "menunggu_verifikasi"
            ? "◷ Menunggu Verifikasi"
            : "Belum Membayar"}
        </span>
        
      </div>
            <button
        className="account-detail-button"
        onClick={() => setPendaftaranDipilih(item)}
      >
        LIHAT DETAIL
      </button>
            </div>
          </div>
        ))
      )}
          {/* POPUP DETAIL PENDAFTARAN */}
      {pendaftaranDipilih && (
        <div
          className="account-detail-overlay"
          onClick={() => setPendaftaranDipilih(null)}
        >
          <div
            className="account-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="account-detail-header">
              <h2>Detail Pendaftaran</h2>

              <button
                onClick={() => setPendaftaranDipilih(null)}
              >
                ✕
              </button>
            </div>

            <div className="account-detail-content">
              <p>
                <strong>Turnamen:</strong>{" "}
                {pendaftaranDipilih.tournament?.nama_turnamen || "-"}
              </p>

              <p>
                <strong>Nama Tim:</strong>{" "}
                {pendaftaranDipilih.nama_tim || "-"}
              </p>

              <p>
                <strong>Nickname Leader:</strong>{" "}
                {pendaftaranDipilih.nickname_leader || "-"}
              </p>

              <p>
                <strong>Nama Leader:</strong>{" "}
                {pendaftaranDipilih.nama_leader || "-"}
              </p>

              <p>
                <strong>Nomor HP:</strong>{" "}
                {pendaftaranDipilih.no_hp || "-"}
              </p>

              <p>
                <strong>Metode Pembayaran:</strong>{" "}
                {pendaftaranDipilih.metode_pembayaran || "-"}
              </p>

              <p>
                <strong>Status Pembayaran:</strong>{" "}
                {pendaftaranDipilih.status_pembayaran || "-"}
              </p>
            </div>

            <button
              className="account-detail-close"
              onClick={() => setPendaftaranDipilih(null)}
            >
              TUTUP
            </button>
          </div>
        </div>
      )}

      {/* TOMBOL LOGOUT */}
      <button
        className="login-button"
        onClick={handleLogout}
      >
        LOGOUT
      </button>

    </main>
  );
}

export default HalamanAkun;