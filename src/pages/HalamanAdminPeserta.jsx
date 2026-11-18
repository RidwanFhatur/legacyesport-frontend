import { useState } from "react";
import { apiRequest } from "../services/api";

function HalamanAdminPeserta({
  akun,
  bukaHalaman,
  logoutAdmin
}) {
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  const [peserta, setPeserta] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sudahDitampilkan, setSudahDitampilkan] = useState(false);
  const [prosesStatus, setProsesStatus] = useState(null);
  const [buktiDipilih, setBuktiDipilih] = useState(null);

  const ambilPeserta = async () => {
  try {
    setLoading(true);

   const token = localStorage.getItem("token");
    const hasil = await apiRequest("/registrations", {
      token,
    });

    setPeserta(hasil.data || []);
    setSudahDitampilkan(true);

  } catch (error) {
    console.error("Gagal mengambil peserta:", error);

    alert(
      error.message || "Gagal mengambil data peserta dari server."
    );
  } finally {
    setLoading(false);
  }
};

  const ubahStatusPembayaran = async (id, status) => {
  try {
    setProsesStatus(id);

    const token = localStorage.getItem("token");

    await apiRequest(`/registrations/${id}`, {
      method: "PUT",
      token,
      body: {
        status_pembayaran: status,
      },
    });

    setPeserta((dataLama) =>
      dataLama.map((item) =>
        item.id === id
          ? {
              ...item,
              status_pembayaran: status,
            }
          : item
      )
    );

    alert(
      status === "terverifikasi"
        ? "Pembayaran berhasil diverifikasi."
        : "Pembayaran ditolak."
    );

  } catch (error) {
    console.error("Gagal mengubah status:", error);

    alert(
      error.message || "Gagal mengubah status pembayaran."
    );
  } finally {
    setProsesStatus(null);
  }
};

const urlBukti = (path) => {
  if (!path) return "";

  return `http://127.0.0.1:8000/storage/${path}`;
};

  return (
    <main className="admin-page admin-peserta-page">

      {/* HEADER MOBILE */}
      <div className="admin-mobile-header">
        <div className="admin-mobile-logo">
          FREE FIRE ADMIN
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
          <span>FREE FIRE</span>
          <strong>ADMIN</strong>
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
            onClick={() => {
              setAdminMenuOpen(false);
              bukaHalaman("admin-turnamen");
            }}
          >
            🏆 Turnamen
          </button>

          <button
            className="admin-nav-active"
            onClick={() => {
              setAdminMenuOpen(false);
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
            onClick={() => bukaHalaman("admin-braket")}
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
            onClick={() => {
              setAdminMenuOpen(false);
              bukaHalaman("admin-pengaturan");
            }}
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
      <section className="admin-content">

        <div className="admin-topbar">

          <div>
            <h1>Peserta</h1>

            <p>
              Kelola peserta yang mengikuti turnamen.
            </p>
          </div>

        </div>

        {/* CARD */}
        <div className="admin-card">

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap",
              marginBottom: "20px"
            }}
          >

            <div>
              <h2 style={{ marginBottom: "5px" }}>
                Daftar Peserta
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#9ca3af",
                  fontSize: "14px"
                }}
              >
                Data peserta yang telah melakukan pendaftaran.
              </p>
            </div>

            <button
              className="admin-primary-button"
              onClick={ambilPeserta}
              disabled={loading}
            >
              {loading
                ? "MEMUAT..."
                : "TAMPILKAN PESERTA"}
            </button>

          </div>

          {/* BELUM DITAMPILKAN */}
          {!sudahDitampilkan && (
            <div className="admin-empty">

              <div className="admin-empty-icon">
                👥
              </div>

              <h3>
                Data Peserta Belum Ditampilkan
              </h3>

              <p>
                Klik tombol TAMPILKAN PESERTA untuk
                mengambil data peserta dari server.
              </p>

            </div>
          )}

          {/* SUDAH DITAMPILKAN TAPI KOSONG */}
          {sudahDitampilkan && peserta.length === 0 && (
            <div className="admin-empty">

              <div className="admin-empty-icon">
                📋
              </div>

              <h3>
                Belum Ada Peserta
              </h3>

              <p>
                Belum ada peserta yang mendaftar
                turnamen.
              </p>

            </div>
          )}

          {/* DATA PESERTA */}
          {sudahDitampilkan && peserta.length > 0 && (
            <div className="peserta-table-wrapper">

             <table className="peserta-table">

                <thead>

                  <tr
                    style={{
                      borderBottom: "1px solid #292e38",
                      textAlign: "left"
                    }}
                  >

                    <th style={{ padding: "14px" }}>
                      No
                    </th>

                    <th style={{ padding: "14px" }}>
                      Nama Tim
                    </th>

                    <th style={{ padding: "14px" }}>
                      Nickname Leader
                    </th>

                    <th style={{ padding: "14px" }}>
                      Nama Leader
                    </th>

                    <th style={{ padding: "14px" }}>
                      No HP
                    </th>

                    <th style={{ padding: "14px" }}>
                      Turnamen
                    </th>

                    <th style={{ padding: "14px" }}>
                    Pembayaran
                  </th>

                  <th style={{ padding: "14px" }}>
                    Bukti Pembayaran
                  </th>

                  <th style={{ padding: "14px" }}>
                    Aksi
                  </th>

                  </tr>

                </thead>

                <tbody>

                  {peserta.map((item, index) => (

                    <tr
                      key={item.id}
                      style={{
                        borderBottom:
                          "1px solid #292e38"
                      }}
                    >

                      <td style={{ padding: "14px" }}>
                        {index + 1}
                      </td>

                      <td
                        style={{
                          padding: "14px",
                          fontWeight: "700"
                        }}
                      >
                        {item.nama_tim}
                      </td>

                      <td style={{ padding: "14px" }}>
                        {item.nickname_leader}
                      </td>

                      <td style={{ padding: "14px" }}>
                        {item.nama_leader}
                      </td>

                      <td style={{ padding: "14px" }}>
                        {item.no_hp}
                      </td>

                      <td style={{ padding: "14px" }}>
                        {item.tournament?.nama_turnamen ||
                          "-"}
                      </td>

                      <td style={{ padding: "14px" }}>

                        <span
                          style={{
                            display: "inline-block",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            background:
                              "#242934",
                            fontSize: "12px",
                            fontWeight: "700"
                          }}
                        >
                          {item.status_pembayaran ||
                            "Belum ada status"}
                        </span>

                      </td>
          <td style={{ padding: "14px" }}>
  {item.bukti_pembayaran ? (
    <button
      onClick={() =>
        setBuktiDipilih(urlBukti(item.bukti_pembayaran))
      }
      style={{
        border: "none",
        borderRadius: "6px",
        padding: "8px 12px",
        background: "#facc15",
        color: "#111827",
        fontWeight: "700",
        cursor: "pointer",
      }}
    >
      🖼️ Lihat Bukti
    </button>
  ) : (
    <span style={{ color: "#9ca3af", fontSize: "13px" }}>
      Belum ada bukti
    </span>
  )}
</td>

           <td style={{ padding: "14px" }}>

          {item.status_pembayaran === "menunggu_verifikasi" ? (
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >

              <button
                onClick={() =>
                  ubahStatusPembayaran(
                    item.id,
                    "terverifikasi"
                  )
                }
                disabled={prosesStatus === item.id}
                style={{
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  background: "#22c55e",
                  color: "#fff",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                {prosesStatus === item.id
                  ? "..."
                  : "✓ Verifikasi"}
              </button>

              <button
                onClick={() =>
                  ubahStatusPembayaran(
                    item.id,
                    "ditolak"
                  )
                }
                disabled={prosesStatus === item.id}
                style={{
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  background: "#ef4444",
                  color: "#fff",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                ✕ Tolak
              </button>

            </div>
          ) : (
            <span
              style={{
                color: "#9ca3af",
                fontSize: "13px",
              }}
            >
              Tidak ada aksi
            </span>
          )}

        </td>

         </tr>

       ))}

            </tbody>
                    </table>

              </div>
              )}

                </div>

       </section>

{/* POPUP BUKTI PEMBAYARAN */}
{buktiDipilih && (
  <div
    onClick={() => setBuktiDipilih(null)}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.85)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
      padding: "20px",
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: "#171c27",
        padding: "20px",
        borderRadius: "12px",
        maxWidth: "600px",
        width: "100%",
        textAlign: "center",
      }}
    >
      <h2 style={{ color: "#fff" }}>
        Bukti Pembayaran
      </h2>

      <img
        src={buktiDipilih}
        alt="Bukti Pembayaran Peserta"
        style={{
          width: "100%",
          maxHeight: "65vh",
          objectFit: "contain",
          borderRadius: "8px",
          marginTop: "15px",
        }}
      />

      <button
        onClick={() => setBuktiDipilih(null)}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "#ef4444",
          color: "#fff",
          border: "none",
          borderRadius: "7px",
          fontWeight: "700",
          cursor: "pointer",
        }}
      >
        TUTUP
      </button>
    </div>
  </div>
)}

</main>
        
    );
 }

 export default HalamanAdminPeserta;