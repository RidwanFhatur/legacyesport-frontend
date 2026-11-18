import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import RoomTurnamen from "./RoomTurnamen";
import "./DetailTurnamen.css";

function DetailTurnamen({ bukaHalaman, turnamenId, akun }) {
  const [tabAktif, setTabAktif] = useState("deskripsi");
  const [turnamen, setTurnamen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [braket, setBraket] = useState([]);
  const [loadingBraket, setLoadingBraket] = useState(false);
  const [errorBraket, setErrorBraket] = useState("");
  const [jadwalBraket, setJadwalBraket] = useState([]);
  const [loadingJadwal, setLoadingJadwal] = useState(false);
  const [errorJadwal, setErrorJadwal] = useState("");

 
useEffect(() => {
  const ambilDetailTurnamen = async () => {
    // Bisa menerima ID angka atau objek turnamen
    const idTurnamen =
      typeof turnamenId === "object"
        ? turnamenId?.id
        : turnamenId;

    if (!idTurnamen) {
      setTurnamen(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:8000/api/tournaments",
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil detail turnamen.");
      }

      const hasil = await response.json();
      const data = Array.isArray(hasil.data) ? hasil.data : [];

      const ditemukan = data.find(
        (item) => Number(item.id) === Number(idTurnamen)
      );

      setTurnamen(ditemukan || null);

    } catch (error) {
      console.error("Gagal mengambil detail turnamen:", error);
      setTurnamen(null);
    } finally {
      setLoading(false);
    }
  };

  ambilDetailTurnamen();
}, [turnamenId]);

        
      useEffect(() => {
        const ambilBraket = async () => {
          try {
            setLoadingBraket(true);
            setErrorBraket("");

            const token = sessionStorage.getItem("token");

            const hasil = await apiRequest(`/braket/${turnamenId}`, {
              token,
            });

            const data =
              hasil.pertandingan ||
              hasil.data?.pertandingan ||
              (Array.isArray(hasil.data) ? hasil.data : []);

            setBraket(data);
          } catch (error) {
            console.error("Gagal mengambil data braket:", error);
            setErrorBraket(error.message || "Gagal mengambil data braket.");
          } finally {
            setLoadingBraket(false);
          }
        };

        if (turnamenId && tabAktif === "braket") {
          ambilBraket();
        }
      }, [turnamenId, tabAktif]);

      
// Mengambil jadwal braket dari database
useEffect(() => {
  const ambilJadwal = async () => {
    const idTurnamen =
      typeof turnamenId === "object"
        ? turnamenId?.id
        : turnamenId;

    if (!idTurnamen) return;

    try {
      setLoadingJadwal(true);
      setErrorJadwal("");

      const response = await fetch(
        `http://127.0.0.1:8000/api/jadwal-turnamen/${idTurnamen}`,
        {
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      const hasil = await response.json();

      if (!response.ok) {
        throw new Error(
          hasil.message || "Gagal mengambil jadwal turnamen."
        );
      }

      setJadwalBraket(
        Array.isArray(hasil.data) ? hasil.data : []
      );
    } catch (error) {
      console.error("Gagal mengambil jadwal:", error);
      setErrorJadwal(
        error.message || "Gagal mengambil jadwal turnamen."
      );
    } finally {
      setLoadingJadwal(false);
    }
  };

  if (tabAktif === "jadwal") {
    ambilJadwal();
  }
}, [turnamenId, tabAktif]);


const daftarNamaBabak = {
  "32_besar": "32 BESAR",
  "16_besar": "16 BESAR",
  "8_besar": "8 BESAR",
  perempat_final: "PEREMPAT FINAL",
  semifinal: "SEMIFINAL",
  final: "FINAL",
};

const urutanBabak = [
  "32_besar",
  "16_besar",
  "8_besar",
  "perempat_final",
  "semifinal",
  "final",
];

const kelompokBabak = urutanBabak
  .map((babak) => ({
    babak,
    pertandingan: braket
      .filter((item) => item.babak === babak)
      .sort(
        (a, b) =>
          Number(a.nomor_pertandingan) -
          Number(b.nomor_pertandingan)
      ),
  }))
  .filter((kelompok) => kelompok.pertandingan.length > 0);

    const handleDaftar = () => {
  // Jika belum login, arahkan ke halaman login
  if (!akun) {
    bukaHalaman("login");
    return;
  }

  // Jika sudah login, buka halaman pendaftaran
  bukaHalaman("pendaftaran", turnamen);
};

  if (loading) {
    return (
      <main className="page">
        <p style={{ textAlign: "center" }}>
          Memuat detail turnamen...
        </p>
      </main>
    );
  }

  if (!turnamen) {
    return (
      <main className="page">
        <p style={{ textAlign: "center" }}>
          Turnamen tidak ditemukan.
        </p>

        <button onClick={() => bukaHalaman("turnamen")}>
          KEMBALI
        </button>
      </main>
    );
  }

  return (
    <main className="page">

      <button
        className="back-button"
        onClick={() => bukaHalaman("turnamen")}
      >
        ← KEMBALI
      </button>

        <div className="detail-header">

            <div className="detail-logo">
                {turnamen.logo_url ? (
                    <img
                        src={turnamen.logo_url}
                        alt={`Logo ${turnamen.nama_turnamen}`}
                        className="detail-logo-image"
                    />
                ) : (
                    "FF"
                )}
            </div>

            <div className="detail-title-content">
                <div className="detail-title-row">
                    <h1>{turnamen.nama_turnamen}</h1>

                    <button
                        className="detail-register-button"
                        onClick={handleDaftar}
                    >
                        DAFTAR
                    </button>
                </div>

                <p>{turnamen.deskripsi}</p>
            </div>

        </div>

      <div className="detail-info-grid">

        <div className="info-box">
          <span>HADIAH</span>

          <strong>
  Rp{Number(turnamen.hadiah || 0).toLocaleString("id-ID")}
</strong>
        </div>

        <div className="info-box">
          <span>PENDAFTARAN</span>

         <strong>
  Rp{Number(turnamen.biaya_daftar || 0).toLocaleString("id-ID")}
</strong>
        </div>

        <div className="info-box">

          <strong>
            {turnamen.mode}
          </strong>

        </div>

        <div className="info-box">

          <span>JUMLAH TIM</span>

          <strong>
            {turnamen.jumlah_tim} TIM
          </strong>

        </div>

      </div>

      <div className="detail-tabs">

        <button
          className={
            tabAktif === "deskripsi"
              ? "active-tab"
              : ""
          }
          onClick={() => setTabAktif("deskripsi")}
        >
          DESKRIPSI
        </button>

        <button
          className={
            tabAktif === "braket"
              ? "active-tab"
              : ""
          }
          onClick={() => setTabAktif("braket")}
        >
          BRAKET
        </button>

        <button
          className={
            tabAktif === "jadwal"
              ? "active-tab"
              : ""
          }
          onClick={() => setTabAktif("jadwal")}
        >
          JADWAL
        </button>

        <button
            className={
              tabAktif === "room"
                ? "active-tab"
                : ""
            }
            onClick={() => setTabAktif("room")}
          >
            ROOM
          </button>

      </div>

      {tabAktif === "deskripsi" && (

        <section className="detail-section">

          <h2>TENTANG TURNAMEN</h2>

          <p>
            {turnamen.deskripsi}
          </p>

          <h3>INFORMASI TURNAMEN</h3>

          <div className="rules-list">

            <div>
              <span>Nama Turnamen</span>
              <strong>
                {turnamen.nama_turnamen}
              </strong>
            </div>

            <div>
              <span>Mode</span>
              <strong>
                {turnamen.mode}
              </strong>
            </div>

            <div>
              <span>Jumlah Tim</span>
              <strong>
                {turnamen.jumlah_tim} Tim
              </strong>
            </div>

            <div>
              <span>Pendaftaran</span>
              <strong>
                {turnamen.biaya_daftar}
              </strong>
            </div>

            <div>
              <span>Total Hadiah</span>
              <strong>
                {turnamen.hadiah}
              </strong>
            </div>

          </div>

        </section>

      )}

      
{tabAktif === "braket" && (
  <section className="detail-section">

    <h2>BRAKET {turnamen.nama_turnamen}</h2>

    {loadingBraket && (
      <p>Memuat braket turnamen...</p>
    )}

    {!loadingBraket && errorBraket && (
      <p>{errorBraket}</p>
    )}

    {!loadingBraket && !errorBraket && braket.length === 0 && (
      <div className="bracket-empty">
        <h3>Braket Belum Dibuat</h3>
        <p>
          Braket akan muncul setelah admin membuat
          bagan turnamen.
        </p>
      </div>
    )}

    {!loadingBraket && !errorBraket && braket.length > 0 && (
      <div className="bracket-preview">

        {kelompokBabak.map((kelompok) => (
          <div
            className="bracket-round"
            key={kelompok.babak}
          >
            <h3>
              {daftarNamaBabak[kelompok.babak] || kelompok.babak}
            </h3>

            {kelompok.pertandingan.map((item) => {
              const tim1 =
                item.tim_pertama?.nama_tim || "Menunggu peserta";

              const tim2 =
                item.tim_kedua?.nama_tim || "Menunggu peserta";

              const pemenang = item.pemenang_registration_id;

              const tim1Menang =
                pemenang &&
                Number(pemenang) === Number(item.registration_tim_1);

              const tim2Menang =
                pemenang &&
                Number(pemenang) === Number(item.registration_tim_2);

              return (
                <div className="bracket-match" key={item.id}>

                  <div className={`bracket-team ${tim1Menang ? "bracket-winner" : ""}`}>
                    <span>{tim1}</span>
                    {tim1Menang && <strong>PEMENANG</strong>}
                  </div>

                  <div className={`bracket-team ${tim2Menang ? "bracket-winner" : ""}`}>
                    <span>{tim2}</span>
                    {tim2Menang && <strong>PEMENANG</strong>}
                  </div>

                </div>
              );
            })}
          </div>
        ))}

      </div>
    )}

  </section>
)}



{tabAktif === "jadwal" && (
  <section className="detail-section">

    <h2>
      JADWAL {turnamen.nama_turnamen}
    </h2>

    {loadingJadwal && (
      <p>Memuat jadwal pertandingan...</p>
    )}

    {!loadingJadwal && errorJadwal && (
      <p>{errorJadwal}</p>
    )}

    {!loadingJadwal &&
      !errorJadwal &&
      jadwalBraket.length === 0 && (
        <div className="bracket-empty">
          <h3>Jadwal Belum Tersedia</h3>
          <p>
            Jadwal setiap babak akan muncul setelah
            admin mengatur tanggal dan jam pertandingan.
          </p>
        </div>
      )}

    {!loadingJadwal &&
      !errorJadwal &&
      jadwalBraket.length > 0 && (
        <div className="detail-schedule">

          {urutanBabak.map((babak) => {
            const jadwal = jadwalBraket.find(
              (item) => item.babak === babak
            );

            // Tampilkan hanya babak yang sudah memiliki jadwal
            if (!jadwal) {
              return null;
            }

            return (
              <div key={babak}>

                <strong>
                  {daftarNamaBabak[babak] || babak}
                </strong>

                <span>
                  {new Date(
                    `${jadwal.tanggal}T00:00:00`
                  ).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>

                <b>
                  {jadwal.jam.slice(0, 5)} WIB
                </b>

              </div>
            );
          })}

        </div>
      )}

  </section>
)}



      {tabAktif === "room" && (
        <RoomTurnamen
          tournamentId={turnamen.id}
          akun={akun}
        />
      )}

    </main>
  );


  
}



export default DetailTurnamen;