
import { useCallback, useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_BASE_URL||"http://127.0.0.1:8000/api";

function HalamanAdminJadwalBraket({
    turnamenId,
    kelompokBabak,
    ambilBraket
}) {
    const [babakAktif, setBabakAktif] = useState("");
    const [tanggal, setTanggal] = useState("");
    const [jam, setJam] = useState("");
    const [proses, setProses] = useState(false);
    const [daftarJadwal, setDaftarJadwal] = useState([]);

    const babakTerpilih = kelompokBabak.some(
        (item) => item.babak === babakAktif
    )
        ? babakAktif
        : kelompokBabak[0]?.babak || "";

    const ambilToken = () => {
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("Sesi login tidak ditemukan. Silakan login kembali.");
        }

        return token;
    };

    const namaBabak = (babak) => {
        const daftarNama = {
            "32_besar": "32 BESAR",
            "16_besar": "16 BESAR",
            "8_besar": "8 BESAR",
            "perempat_final": "PEREMPAT FINAL",
            "semifinal": "SEMIFINAL",
            "final": "FINAL"
        };

        return daftarNama[babak] || babak.replaceAll("_", " ").toUpperCase();
    };

    // Mengambil jadwal dari tabel jadwal_babaks
    const ambilJadwalBabak = useCallback(async () => {
        if (!turnamenId) {
            setDaftarJadwal([]);
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/jadwal-turnamen/${turnamenId}`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json"
                    }
                }
            );

            const hasil = await response.json();

            if (!response.ok) {
                throw new Error(
                    hasil.message || "Gagal mengambil jadwal babak."
                );
            }

            setDaftarJadwal(hasil.data || []);
        } catch (error) {
            console.error("Gagal mengambil jadwal babak:", error);
        }
    }, [turnamenId]);

    // Mengambil jadwal ketika turnamen berubah
useEffect(() => {
    const controller = new AbortController();

    const muatJadwal = async () => {
        try {
            const response = await fetch(
                `${API_URL}/jadwal-turnamen/${turnamenId}`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json"
                    },
                    signal: controller.signal
                }
            );

            const hasil = await response.json();

            if (!response.ok) {
                throw new Error(
                    hasil.message || "Gagal mengambil jadwal babak."
                );
            }

            setDaftarJadwal(hasil.data || []);
        } catch (error) {
            if (error.name !== "AbortError") {
                console.error("Gagal mengambil jadwal babak:", error);
            }
        }
    };

    if (turnamenId) {
        muatJadwal();
    }

    return () => controller.abort();
}, [turnamenId]);
    const kelompokAktif = kelompokBabak.find(
        (item) => item.babak === babakTerpilih
    );

    

    // Mengambil jadwal berdasarkan babak yang dipilih
    const jadwalTersimpan = daftarJadwal.find(
        (item) => item.babak === babakTerpilih
    );

    const tanggalTersimpan = jadwalTersimpan?.tanggal || "";

    const jamTersimpan =
        jadwalTersimpan?.jam &&
        jadwalTersimpan.jam !== "00:00:00"
            ? jadwalTersimpan.jam.slice(0, 5)
            : "";

    const tanggalForm = tanggal || tanggalTersimpan;
    const jamForm = jam || jamTersimpan;

    const pilihBabak = (babak) => {
        setBabakAktif(babak);
        setTanggal("");
        setJam("");
    };

    const simpanJadwal = async () => {
        if (!turnamenId || !babakTerpilih) {
            alert("Pilih turnamen dan babak terlebih dahulu.");
            return;
        }

        if (!tanggalForm || !jamForm) {
            alert("Tanggal dan jam harus diisi.");
            return;
        }

        if (!window.confirm(
            `Simpan jadwal seluruh pertandingan ${namaBabak(babakTerpilih)}?`
        )) {
            return;
        }

        try {
            setProses(true);

            const response = await fetch(
                `${API_URL}/braket/${turnamenId}/babak/${babakTerpilih}/jadwal`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${ambilToken()}`
                    },
                    body: JSON.stringify({
                        tanggal: tanggalForm,
                        jam: jamForm
                    })
                }
            );

            const hasil = await response.json();

            if (!response.ok) {
                throw new Error(hasil.message || "Gagal menyimpan jadwal.");
            }

            alert(
                `${hasil.message}\nJumlah pertandingan: ${hasil.jumlah_pertandingan}`
            );

            setTanggal("");
            setJam("");

            // Perbarui data jadwal dari tabel jadwal_babaks
            await ambilJadwalBabak();
            await ambilBraket();
        } catch (error) {
            console.error("Gagal menyimpan jadwal:", error);
            alert(error.message);
        } finally {
            setProses(false);
        }
    };

    const batalkanJadwal = async () => {
        if (!turnamenId || !babakTerpilih) {
            alert("Pilih babak terlebih dahulu.");
            return;
        }

        if (!window.confirm(
            `Batalkan jadwal seluruh pertandingan ${namaBabak(babakTerpilih)}?`
        )) {
            return;
        }

        try {
            setProses(true);

            const response = await fetch(
                `${API_URL}/braket/${turnamenId}/babak/${babakTerpilih}/jadwal`,
                {
                    method: "DELETE",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${ambilToken()}`
                    }
                }
            );

            const hasil = await response.json();

            if (!response.ok) {
                throw new Error(hasil.message || "Gagal membatalkan jadwal.");
            }

            setTanggal("");
            setJam("");

            alert(hasil.message || "Jadwal berhasil dibatalkan.");

            // Perbarui data jadwal dari tabel jadwal_babaks
            await ambilJadwalBabak();
            await ambilBraket();
        } catch (error) {
            console.error("Gagal membatalkan jadwal:", error);
            alert(error.message);
        } finally {
            setProses(false);
        }
    };

    
return (
    <section className="admin-panel bracket-panel jadwal-babak-panel">
        <div className="jadwal-babak-header">
            <div>
                <span className="jadwal-babak-label">MANAJEMEN TURNAMEN</span>
                <h2>Pengaturan Jadwal Babak</h2>
                <p>
                    Atur tanggal dan waktu pertandingan untuk setiap babak.
                </p>
            </div>
        </div>

        {!kelompokBabak.length ? (
            <div className="jadwal-babak-empty">
                <p>Belum ada babak pertandingan yang dapat dijadwalkan.</p>
            </div>
        ) : (
            <>
                <div className="jadwal-babak-form">
                    <div className="jadwal-babak-field">
                        <label>Pilih Babak</label>
                        <select
                            value={babakTerpilih}
                            onChange={(e) => pilihBabak(e.target.value)}
                            disabled={proses}
                        >
                            {kelompokBabak.map((kelompok) => (
                                <option
                                    key={kelompok.babak}
                                    value={kelompok.babak}
                                >
                                    {namaBabak(kelompok.babak)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="jadwal-babak-info">
                        <div>
                            <small>BABAK TERPILIH</small>
                            <strong>{namaBabak(babakTerpilih)}</strong>
                        </div>

                        <div>
                            <small>JUMLAH PERTANDINGAN</small>
                            <strong>
                                {kelompokAktif?.pertandingan.length || 0} Pertandingan
                            </strong>
                        </div>

                        <div>
                            <small>JADWAL SAAT INI</small>
                            <strong>
                                {tanggalTersimpan && jamTersimpan
                                    ? `${tanggalTersimpan} pukul ${jamTersimpan}`
                                    : "Belum diatur"}
                            </strong>
                        </div>
                    </div>

                    <div className="jadwal-babak-input-grid">
                        <div className="jadwal-babak-field">
                            <label>Tanggal Pertandingan</label>
                            <input
                                type="date"
                                value={tanggalForm}
                                onChange={(e) => setTanggal(e.target.value)}
                                disabled={proses}
                            />
                        </div>

                        <div className="jadwal-babak-field">
                            <label>Jam Pertandingan</label>
                            <input
                                type="time"
                                value={jamForm}
                                onChange={(e) => setJam(e.target.value)}
                                disabled={proses}
                            />
                        </div>
                    </div>

                    <div className="jadwal-babak-actions">
                        <button
                            type="button"
                            className="jadwal-babak-save"
                            onClick={simpanJadwal}
                            disabled={proses}
                        >
                            {proses ? "MENYIMPAN..." : "SIMPAN JADWAL BABAK"}
                        </button>

                        <button
                            type="button"
                            className="jadwal-babak-cancel"
                            onClick={batalkanJadwal}
                            disabled={proses}
                        >
                            {proses ? "MEMPROSES..." : "BATALKAN JADWAL BABAK"}
                        </button>
                    </div>
                </div>
            </>
        )}
    </section>
);

}

export default HalamanAdminJadwalBraket;
