
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_BASE_URL|| "http://127.0.0.1:8000/api";

function HalamanTurnamen({ bukaHalaman }) {
    const [turnamen, setTurnamen] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const ambilTurnamen = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(`${API_URL}/tournaments`, {
                    headers: {
                        Accept: "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error("Gagal mengambil data turnamen.");
                }

                const hasil = await response.json();

                setTurnamen(
                    Array.isArray(hasil.data) ? hasil.data : []
                );
            } catch (error) {
                console.error("Error mengambil turnamen:", error);
                setError(error.message || "Gagal mengambil data turnamen.");
            } finally {
                setLoading(false);
            }
        };

        ambilTurnamen();
    }, []);

    return (
        <main className="page">
            <h1>TURNAMEN</h1>

            <p className="page-description">
                Daftar turnamen Free Fire yang tersedia.
            </p>

            {loading ? (
                <p style={{ textAlign: "center" }}>
                    Memuat turnamen...
                </p>
            ) : error ? (
                <p style={{ textAlign: "center", color: "#ff6b6b" }}>
                    {error}
                </p>
            ) : turnamen.length === 0 ? (
                <p style={{ textAlign: "center" }}>
                    Belum ada turnamen yang tersedia.
                </p>
            ) : (
                <div className="all-tournaments">
                    {turnamen.map((item) => (
                        <div
                            className="big-tournament-card"
                            key={item.id}
                        >
                            <div className="big-logo">
                                {item.logo_url ? (
                                    <img
                                        src={item.logo_url}
                                        alt={`Logo ${item.nama_turnamen}`}
                                        className="big-logo-image"
                                    />
                                ) : (
                                    "FF"
                                )}
                            </div>

                            <div>
                                <h2>{item.nama_turnamen}</h2>

                                <p>
                                    Hadiah: Rp
                                    {Number(item.hadiah || 0).toLocaleString("id-ID")}
                                </p>

                                <p>Mode: {item.mode}</p>

                                <p>{item.jumlah_tim} Tim</p>

                                <button
                                    className="detail-button"
                                    onClick={() => {
                                        bukaHalaman("detail-turnamen", item.id);
                                    }}
                                >
                                    LIHAT TURNAMEN
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}

export default HalamanTurnamen;
