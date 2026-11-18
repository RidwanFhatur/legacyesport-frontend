
import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000/api";

function HalamanPertandingan() {
  const [pertandingan, setPertandingan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pesan, setPesan] = useState("");

  useEffect(() => {
    const ambilPertandingan = async () => {
      try {
        const response = await fetch(`${API_URL}/pertandingans`, {
          headers: {
            Accept: "application/json",
          },
        });

        const hasil = await response.json();

        if (!response.ok) {
          throw new Error(
            hasil.message || "Gagal mengambil data pertandingan."
          );
        }

        const daftarPertandingan = Array.isArray(hasil.data)
          ? hasil.data
          : [];

        // Hanya menampilkan pertandingan biasa, bukan pertandingan braket.
       const pertandinganBiasa = daftarPertandingan.filter((item) => {
  return (
    item.nama_tim_1 &&
    item.nama_tim_2 &&
    item.nama_tim_1 !== "Menunggu peserta" &&
    item.nama_tim_2 !== "Menunggu peserta" &&
    item.tanggal &&
    item.jam &&
    item.jam !== "00:00:00"
  );
});

        // Mengurutkan pertandingan berdasarkan tanggal dan jam.
        pertandinganBiasa.sort((a, b) => {
          const waktuA = `${a.tanggal || ""} ${a.jam || ""}`;
          const waktuB = `${b.tanggal || ""} ${b.jam || ""}`;

          return waktuA.localeCompare(waktuB);
        });

        setPertandingan(pertandinganBiasa);
      } catch (error) {
        console.error("Gagal mengambil pertandingan:", error);
        setPesan(error.message || "Gagal mengambil data pertandingan.");
      } finally {
        setLoading(false);
      }
    };

    ambilPertandingan();
  }, []);

  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";
    return tanggal.split("-").reverse().join("-");
  };

  const formatJam = (jam) => {
    if (!jam) return "-";
    return jam.substring(0, 5);
  };

  const namaStatus = (status) => {
    const daftarStatus = {
      belum_dimulai: "BELUM DIMULAI",
      sedang_berlangsung: "SEDANG BERLANGSUNG",
      selesai: "SELESAI",
    };

    return daftarStatus[status] || status || "-";
  };

  return (
    <main className="page halaman-pertandingan">
      <h1>PERTANDINGAN</h1>

      <p className="page-description">
        Jadwal dan hasil pertandingan turnamen.
      </p>

      {loading && (
        <p className="match-info">
          Memuat pertandingan...
        </p>
      )}

      {!loading && pesan && (
        <p className="match-info match-error">
          {pesan}
        </p>
      )}

      {!loading && !pesan && pertandingan.length === 0 && (
        <div className="match-empty">
          <h3>Belum Ada Pertandingan</h3>
          <p>
            Pertandingan yang dibuat dan dikelola oleh admin
            akan muncul di halaman ini.
          </p>
        </div>
      )}

      <div className="match-list">
        {pertandingan.map((item) => (
          <article className="match-card" key={item.id}>
            <div className="match-card-header">
              <div>
                <h3>
                  {item.tournament?.nama_turnamen || "Turnamen"}
                </h3>
              </div>

              <span className={`match-status ${item.status}`}>
                {namaStatus(item.status)}
              </span>
            </div>

            <div className="match-teams">
              <div className="match-team">
                <strong>{item.nama_tim_1 || "-"}</strong>
                <span>Tim 1</span>
              </div>

              <div className="match-score">
                <strong>
                  {item.skor_tim_1 ?? "-"}
                  {" : "}
                  {item.skor_tim_2 ?? "-"}
                </strong>
              </div>

              <div className="match-team">
                <strong>{item.nama_tim_2 || "-"}</strong>
                <span>Tim 2</span>
              </div>
            </div>

            <div className="match-card-footer">
              <span>
                Tanggal: {formatTanggal(item.tanggal)}
              </span>

              <span>
                Jam: {formatJam(item.jam)}
              </span>
            </div>

            {item.link_stream && (
              <a
                className="match-stream-button"
                href={item.link_stream}
                target="_blank"
                rel="noopener noreferrer"
              >
                TONTON LIVESTREAM
              </a>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}

export default HalamanPertandingan;
