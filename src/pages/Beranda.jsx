
import { useEffect, useRef, useState } from "react";

const API_URL = "http://127.0.0.1:8000/api";
const SERVER_URL = "http://127.0.0.1:8000";

function Beranda({ bukaHalaman }) {
  const [berita, setBerita] = useState([]);
  const [loadingBerita, setLoadingBerita] = useState(true);
  const [errorBerita, setErrorBerita] = useState("");
  const [beritaAktif, setBeritaAktif] = useState(0);

  // Data turnamen dari database
const [turnamen, setTurnamen] = useState([]);
const [loadingTurnamen, setLoadingTurnamen] = useState(true);
const [errorTurnamen, setErrorTurnamen] = useState("");

// Data pertandingan dari database
const [pertandingan, setPertandingan] = useState([]);
const [loadingPertandingan, setLoadingPertandingan] = useState(true);
const [errorPertandingan, setErrorPertandingan] = useState("");

  const sliderRef = useRef(null);

  // Mengambil berita dari Laravel
  useEffect(() => {
    const ambilBerita = async () => {
      try {
        const response = await fetch(`${API_URL}/news`, {
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil berita dari server.");
        }

        const data = await response.json();

        // Mendukung respons berupa array langsung atau { data: [...] }
        const daftarBerita = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
            ? data.data
            : [];

        setBerita(daftarBerita);
        setBeritaAktif(0);
      } catch (error) {
        console.error("Error mengambil berita:", error);
        setErrorBerita(
          "Berita belum bisa dimuat. Periksa koneksi ke server."
        );
      } finally {
        setLoadingBerita(false);
      }
    };

    ambilBerita();
  }, []);

                // Mengambil turnamen dari Laravel
              useEffect(() => {
                  const ambilTurnamen = async () => {
                      try {
                          const response = await fetch(`${API_URL}/tournaments`, {
                              headers: {
                                  Accept: "application/json",
                              },
                          });

                          if (!response.ok) {
                              throw new Error("Gagal mengambil data turnamen.");
                          }

                          const hasil = await response.json();

                          const daftarTurnamen = Array.isArray(hasil)
                              ? hasil
                              : Array.isArray(hasil.data)
                                  ? hasil.data
                                  : [];

                          setTurnamen(daftarTurnamen);
                      } catch (error) {
                          console.error("Error mengambil turnamen:", error);
                          setErrorTurnamen(
                              "Turnamen belum bisa dimuat. Periksa koneksi server."
                          );
                      } finally {
                          setLoadingTurnamen(false);
                      }
                  };

                  ambilTurnamen();
              }, []);
 
             // Mengambil pertandingan dari Laravel
              useEffect(() => {
                  const ambilPertandingan = async () => {
                      try {
                          const response = await fetch(`${API_URL}/pertandingans`, {
                              headers: {
                                  Accept: "application/json",
                              },
                          });

                          if (!response.ok) {
                              const detail = await response.text();
                              throw new Error(`HTTP ${response.status}: ${detail}`);
                          }

                          const hasil = await response.json();

                          const daftarPertandingan = Array.isArray(hasil.data)
                              ? hasil.data
                              : [];

                          setPertandingan(daftarPertandingan);

                          console.log("Data pertandingan:", daftarPertandingan);
                      } catch (error) {
                          console.error("Error mengambil pertandingan:", error);

                          setErrorPertandingan(
                              "Pertandingan belum bisa dimuat. Periksa koneksi server."
                          );
                      } finally {
                          setLoadingPertandingan(false);
                      }
                  };

                    ambilPertandingan();
              }, []);

                // FILTER PERTANDINGAN YANG SUDAH DIJADWALKAN
                const pertandinganTampil = pertandingan.filter((item) => {
                    return (
                        item.babak &&
                        item.registration_tim_1 &&
                        item.registration_tim_2 &&
                        item.jam &&
                        item.jam !== "00:00:00"
                    );
                });

// Mengubah lokasi gambar menjadi URL yang bisa dibuka
// Mengubah lokasi gambar menjadi URL yang bisa dibuka
const gambarBerita = (gambar) => {
    // Jika gambar kosong atau bukan teks, jangan tampilkan gambar
    if (typeof gambar !== "string" || gambar.trim() === "") {
        return "";
    }

    // Jika gambar sudah berupa URL lengkap
    if (
        gambar.startsWith("http://") ||
        gambar.startsWith("https://")
    ) {
        return gambar;
    }

    // Menghilangkan garis miring di awal path
    const path = gambar.replace(/^\/+/, "");

    // Jika path sudah mengandung storage/
    if (path.startsWith("storage/")) {
        return `${SERVER_URL}/${path}`;
    }

    // Path dari Laravel biasanya: news/nama-file.jpg
    return `${SERVER_URL}/storage/${path}`;
};


  // Memperbarui indikator saat berita digeser
  const handleScrollBerita = () => {
    const slider = sliderRef.current;

    if (!slider) return;

    const lebarSlide = slider.clientWidth;

    if (!lebarSlide) return;

    const index = Math.round(
      slider.scrollLeft / lebarSlide
    );

    setBeritaAktif(index);
  };

  // Berpindah ke berita tertentu melalui titik indikator
  const pilihBerita = (index) => {
    const slider = sliderRef.current;

    if (!slider) return;

    const slide = slider.children[index];

    if (slide) {
      slider.scrollTo({
        left: slide.offsetLeft - slider.offsetLeft,
        behavior: "smooth",
      });
    }

    setBeritaAktif(index);
  };

  return (
    <main>
      {/* ================= BERITA CAROUSEL ================= */}

      <section className="news-section">

        {loadingBerita ? (
          <div className="news-banner">
            <div className="news-content">
             
              <h1>Memuat berita...</h1>
            </div>
          </div>  
        ) : errorBerita ? (
          <div className="news-banner">
            <div className="news-content">
             
              <h1>Berita belum tersedia</h1>
              <p>{errorBerita}</p>
            </div>
          </div>
        ) : berita.length === 0 ? (
          <div className="news-banner">
            <div className="news-content">
           
              <h1>Belum ada berita</h1>
              <p>Berita terbaru akan ditampilkan di sini.</p>
            </div>
          </div>
        ) : (
          <>
            {/* SLIDER BERITA */}

            <div
              className="news-slider"
              ref={sliderRef}
              onScroll={handleScrollBerita}
            >
              {berita.map((item, index) => {
                const gambar =
                  gambarBerita(item.image_url || item.image);

                return (
                  <article
                    className="news-slide"
                    key={item.id || index}
                  >
                    {gambar && (
                      <img
                        src={gambar}
                        alt={item.title || "Gambar berita"}
                        className="news-slide-image"
                      />
                    )}

                    <div className="news-slide-overlay"></div>

                    <div className="news-slide-content">
                      
                      <h1>{item.title}</h1>

                      <p>{item.content}</p>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* INDIKATOR BERITA */}

            {berita.length > 1 && (
              <div className="news-slider-indicators">
                <span className="news-slider-number">
                  {beritaAktif + 1} / {berita.length}
                </span>

                <div className="news-slider-dots">
                  {berita.map((item, index) => (
                    <button
                      type="button"
                      key={item.id || index}
                      className={
                        beritaAktif === index ? "active" : ""
                      }
                      onClick={() => pilihBerita(index)}
                      aria-label={`Lihat berita ${index + 1}`}
                    />
                  ))}
                </div>

                <span className="news-slider-hint">
                  Geser untuk berita lainnya
                </span>
              </div>
            )}
          </>
        )}
      </section>
      
{/* ================= TURNAMEN ================= */}

<section className="section">
    <div className="section-title">
        <h2>TURNAMEN</h2>

        <button onClick={() => bukaHalaman("turnamen")}>
            Lihat Semua
        </button>
    </div>

          <div className="tournament-list">
              {loadingTurnamen ? (
                  <p>Memuat turnamen...</p>
              ) : errorTurnamen ? (
                  <p>{errorTurnamen}</p>
              ) : turnamen.length === 0 ? (
                  <p>Belum ada turnamen tersedia.</p>
              ) : (
                  turnamen.slice(0, 3).map((item) => (
                      <div className="tournament-card" key={item.id}>
                          <div className="tournament-logo">
                              {item.logo_url ? (
                                  <img
                                      src={item.logo_url}
                                      alt={`Logo ${item.nama_turnamen}`}
                                      className="tournament-logo-image"
                                  />
                              ) : (
                                  "FF"
                              )}
                          </div>

                          <div className="tournament-info">
                              <h3>{item.nama_turnamen}</h3>

                              <p>
                                  {item.mode || "Mode belum ditentukan"}
                              </p>

                              <p>
                                  Hadiah: {item.hadiah || "Belum ditentukan"}
                              </p>
                          </div>
                      </div>
                  ))
              )}
          </div>
      </section>

    
          {/* ================= PERTANDINGAN ================= */}

          <section className="section">
              <div className="section-title">
                  <h2>PERTANDINGAN</h2>

                  <button onClick={() => bukaHalaman("pertandingan")}>
                      Lihat Semua
                  </button>
              </div>

             
                <div className="match-list">
                    {loadingPertandingan ? (
                        <p>Memuat pertandingan...</p>
                    ) : errorPertandingan ? (
                        <p>{errorPertandingan}</p>
                    ) : pertandinganTampil.length === 0 ? (
                        <p>Belum ada pertandingan yang dijadwalkan.</p>
                    ) : (
                        pertandinganTampil.slice(0, 3).map((item) => {
                            const tim1 =
                                item.tim_pertama?.nama_tim ||
                                item.nama_tim_1 ||
                                "-";

                            const tim2 =
                                item.tim_kedua?.nama_tim ||
                                item.nama_tim_2 ||
                                "-";

                            const daftarBabak = {
                                final: "Final",
                                semifinal: "Semi Final",
                                perempat_final: "Perempat Final",
                                penyisihan: "Penyisihan",
                            };

                            const daftarStatus = {
                                belum_dimulai: "Belum Dimulai",
                                sedang_berlangsung: "Berlangsung",
                                selesai: "Selesai",
                            };

                            return (
                                <article className="match-card" key={item.id}>
                                    <div className="match-card-header">
                                        <div>
                                            <h3>
                                                {item.tournament?.nama_turnamen ||
                                                    item.nama_turnamen ||
                                                    "Turnamen"}
                                            </h3>

                                            <span>
                                                {daftarBabak[item.babak] || item.babak}
                                            </span>
                                        </div>

                                        <span className={`match-status ${item.status}`}>
                                            {daftarStatus[item.status] || item.status}
                                        </span>
                                    </div>

                                    <div className="match-teams">
                                        <div className="match-team">
                                            <strong>{tim1}</strong>
                                            <span>Tim 1</span>
                                        </div>

                                        <div className="match-score">
                                            <strong>
                                                {item.skor_tim_1 ?? "-"} : {item.skor_tim_2 ?? "-"}
                                            </strong>
                                        </div>

                                        <div className="match-team">
                                            <strong>{tim2}</strong>
                                            <span>Tim 2</span>
                                        </div>
                                    </div>

                                    <div className="match-card-footer">
                                        <span>
                                            Tanggal: {item.tanggal || "-"}
                                        </span>

                                        <span>
                                            Jam: {item.jam ? item.jam.substring(0, 5) : "-"}
                                        </span>
                                    </div>

                                    {item.link_stream && (
                                        <a
                                            href={item.link_stream}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="match-stream-button"
                                        >
                                            TONTON LIVESTREAM
                                        </a>
                                    )}
                                </article>
                            );
                        })
                    )}
                </div>

          </section>

    </main>
  );
}

export default Beranda;
