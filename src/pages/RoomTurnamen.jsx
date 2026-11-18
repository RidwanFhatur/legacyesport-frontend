
import { useEffect, useRef, useState } from "react";
import { apiRequest } from "../services/api";


function RoomTurnamen({ tournamentId, akun }) {
  const [pesan, setPesan] = useState([]);
  const [isiPesan, setIsiPesan] = useState("");
  const [jenisPesan, setJenisPesan] = useState("pesan");
  const [loading, setLoading] = useState(true);
  const [mengirim, setMengirim] = useState(false);
  const [error, setError] = useState("");

  const bagianChat = useRef(null);
  const admin = akun?.role === "admin";

  // Mengambil pesan dari Laravel
  useEffect(() => {
    let aktif = true;

    const ambilPesan = async () => {
      try {
        const hasil = await apiRequest(`/room/${tournamentId}`);

        if (aktif) {
          setPesan(hasil.data || []);
          setError("");
        }
      } catch (err) {
        if (aktif) {
          setError(err.message || "Gagal mengambil pesan Room.");
        }
      } finally {
        if (aktif) {
          setLoading(false);
        }
      }
    };

    if (tournamentId) {
      ambilPesan();

      // Memperbarui pesan setiap 3 detik
      const interval = setInterval(ambilPesan, 3000);

      return () => {
        aktif = false;
        clearInterval(interval);
      };
    }

    return () => {
      aktif = false;
    };
  }, [tournamentId]);

  // Mengarahkan tampilan ke pesan terbaru
  useEffect(() => {
    if (bagianChat.current) {
      bagianChat.current.scrollTop =
        bagianChat.current.scrollHeight;
    }
  }, [pesan]);

  // Mengirim pesan atau pengumuman
  const kirimPesan = async (e) => {
    e.preventDefault();

    if (!isiPesan.trim() || mengirim) return;

    try {
      setMengirim(true);

      const endpoint =
        admin && jenisPesan === "pengumuman"
          ? `/room/${tournamentId}/announcements`
          : `/room/${tournamentId}/messages`;

      await apiRequest(endpoint, {
        method: "POST",
        body: {
          message: isiPesan.trim(),
        },
      });

      setIsiPesan("");

      // Ambil pesan terbaru setelah berhasil mengirim
      const hasil = await apiRequest(`/room/${tournamentId}`);
      setPesan(hasil.data || []);

      setError("");
    } catch (err) {
      setError(err.message || "Pesan gagal dikirim.");
    } finally {
      setMengirim(false);
    }
  };

  return (
    <section className="detail-section room-section">

      <div className="room-heading">
        <div>
          <h2>ROOM TURNAMEN</h2>
          <p>Tempat komunikasi peserta dan admin turnamen.</p>
        </div>

        <span className="room-online">
          ROOM AKTIF
        </span>
      </div>

      {loading && (
        <p className="room-info">
          Memuat percakapan...
        </p>
      )}

      {!loading && error && (
        <div className="room-error">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="room-chat" ref={bagianChat}>

            {pesan.length === 0 && (
              <div className="room-empty">
                <h3>Belum Ada Percakapan</h3>
                <p>
                  Jadilah yang pertama mengirim pesan di Room ini.
                </p>
              </div>
            )}

            {pesan.map((item) => {
              const pesanAdmin =
                item.type === "pengumuman";

              const pesanSendiri =
                Number(item.user_id) === Number(akun?.id);

              return (
                <div
                  className={`room-message ${
                    pesanSendiri ? "room-message-own" : ""
                  } ${pesanAdmin ? "room-announcement" : ""}`}
                  key={item.id}
                >
                  <div className="room-message-header">
                    <strong>
                      {item.sender?.name || "Pengguna"}
                    </strong>

                    {pesanAdmin && (
                      <span>ADMIN</span>
                    )}
                  </div>

                  <p>{item.message}</p>

                  <small>
                    {item.created_at
                      ? new Date(item.created_at).toLocaleString(
                          "id-ID",
                          {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : ""}
                  </small>
                </div>
              );
            })}

          </div>

          <form
            className="room-form"
            onSubmit={kirimPesan}
          >

            {admin && (
              <select
                value={jenisPesan}
                onChange={(e) => setJenisPesan(e.target.value)}
              >
                <option value="pesan">Pesan Biasa</option>
                <option value="pengumuman">Pengumuman Admin</option>
              </select>
            )}

            <div className="room-input-wrapper">
              <input
                type="text"
                value={isiPesan}
                onChange={(e) => setIsiPesan(e.target.value)}
                placeholder="Tulis pesan..."
                maxLength={2000}
                disabled={mengirim}
              />

              <button
                type="submit"
                disabled={mengirim || !isiPesan.trim()}
              >
                {mengirim ? "..." : "KIRIM"}
              </button>
            </div>

          </form>
        </>
      )}

    </section>
  );
}

export default RoomTurnamen;
