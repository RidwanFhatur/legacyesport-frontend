
import { useCallback, useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000/api";

function HalamanAdminPertandingan({
    akun,
    bukaHalaman,
    logoutAdmin
}) {
    const [adminMenuOpen, setAdminMenuOpen] = useState(false);

    const [turnamen, setTurnamen] = useState([]);
    const [turnamenId, setTurnamenId] = useState("");

    const [pertandingan, setPertandingan] = useState([]);
    const [matchId, setMatchId] = useState("");

    const [tanggal, setTanggal] = useState("");
    const [jam, setJam] = useState("");

    const [loading, setLoading] = useState(false);
    const [menyimpan, setMenyimpan] = useState(false);

    // State edit skor dan streaming
    const [editMatchId, setEditMatchId] = useState("");
    const [skorTim1, setSkorTim1] = useState("");
    const [skorTim2, setSkorTim2] = useState("");
    const [statusEdit, setStatusEdit] = useState("belum_dimulai");
    const [linkStream, setLinkStream] = useState("");

    // Mengambil token login
    const ambilToken = () => {
       const token = localStorage.getItem("token");

        if (!token) {
            throw new Error(
                "Sesi login tidak ditemukan. Silakan login kembali."
            );
        }

        return token;
    };

    // Mengambil pertandingan dari braket
    const ambilBraket = useCallback(async (id) => {
        if (!id) {
            setPertandingan([]);
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/braket/${id}`, {
                cache: "no-store",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${ambilToken()}`,
                    "Cache-Control": "no-cache"
                }
            });

            const hasil = await response.json();
            console.log("HASIL UPDATE SKOR:", hasil);

            if (!response.ok) {
                throw new Error(
                    hasil.message || "Gagal mengambil braket."
                );
            }

            const dataPertandingan =
                hasil.pertandingan ||
                hasil.data?.pertandingan ||
                hasil.data ||
                [];

            setPertandingan(
                Array.isArray(dataPertandingan)
                    ? dataPertandingan
                    : []
            );

            setMatchId("");
        } catch (error) {
            console.error("Error mengambil braket:", error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Mengambil daftar turnamen
    useEffect(() => {
        const controller = new AbortController();

        const loadTurnamen = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error(
                        "Sesi login tidak ditemukan. Silakan login kembali."
                    );
                }

                const response = await fetch(
                    `${API_URL}/tournaments`,
                    {
                        signal: controller.signal,
                        headers: {
                            Accept: "application/json",
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const hasil = await response.json();

                if (!response.ok) {
                    throw new Error(
                        hasil.message || "Gagal mengambil turnamen."
                    );
                }

                setTurnamen(hasil.data || []);
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error(
                        "Error mengambil turnamen:",
                        error
                    );
                    alert(error.message);
                }
            }
        };

        loadTurnamen();

        return () => {
            controller.abort();
        };
    }, []);

    // Ketika admin memilih turnamen
    const handlePilihTurnamen = (e) => {
        const id = e.target.value;

        setTurnamenId(id);
        setMatchId("");
        setTanggal("");
        setJam("");
        setEditMatchId("");

        ambilBraket(id);
    };

    // Mengambil nama tim
    const namaTim = (item, nomor) => {
        if (nomor === 1) {
            return (
                item.tim_pertama?.nama_tim ||
                item.nama_tim_1 ||
                "Menunggu peserta"
            );
        }

        return (
            item.tim_kedua?.nama_tim ||
            item.nama_tim_2 ||
            "Menunggu peserta"
        );
    };

    // Memastikan kedua tim sudah terisi
    const timSudahLengkap = (item) => {
        return Boolean(
            item.registration_tim_1 &&
            item.registration_tim_2
        );
    };

    // Pertandingan yang belum dijadwalkan
                        
            // Memeriksa apakah tanggal dan jam belum diatur
            const jadwalBelumDiatur = (item) => {
                const tanggalKosong =
                    !item.tanggal ||
                    item.tanggal === "0000-00-00";

                const jamKosong =
                    !item.jam ||
                    item.jam === "00:00" ||
                    item.jam === "00:00:00";

                return tanggalKosong || jamKosong;
            };

            // Pertandingan yang belum dijadwalkan
            const pertandinganBelumDijadwalkan = pertandingan.filter(
                (item) => {
                    return (
                        item.babak &&
                        timSudahLengkap(item) &&
                        item.status !== "selesai" &&
                        jadwalBelumDiatur(item)
                    );
                }
            );

            // Pertandingan yang sudah dijadwalkan
            const pertandinganTerjadwal = pertandingan.filter(
                (item) => {
                    return (
                        item.babak &&
                        timSudahLengkap(item) &&
                        !jadwalBelumDiatur(item)
                    );
                }
            );


    // Membuka form edit
    const bukaFormEdit = (item) => {
        setEditMatchId(item.id);
        setSkorTim1(item.skor_tim_1 ?? "");
        setSkorTim2(item.skor_tim_2 ?? "");
        setStatusEdit(item.status || "belum_dimulai");
        setLinkStream(item.link_stream || "");
    };

    // Menyimpan jadwal pertandingan
    const simpanJadwal = async (e) => {
        e.preventDefault();

        if (!matchId) {
            alert("Silakan pilih pertandingan terlebih dahulu.");
            return;
        }

        if (!tanggal || !jam) {
            alert("Tanggal dan jam harus diisi.");
            return;
        }

        setMenyimpan(true);

        try {
            const response = await fetch(
                `${API_URL}/braket/pertandingan/${matchId}/jadwal`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${ambilToken()}`
                    },
                    body: JSON.stringify({
                        tanggal,
                        jam
                    })
                }
            );

            const hasil = await response.json();

            if (!response.ok) {
                if (response.status === 422 && hasil.errors) {
                    throw new Error(
                        Object.values(hasil.errors).flat().join("\n")
                    );
                }

                throw new Error(
                    hasil.message ||
                    "Gagal menyimpan jadwal pertandingan."
                );
            }

            alert(
                hasil.message || "Jadwal berhasil disimpan!"
            );

            setMatchId("");
            setTanggal("");
            setJam("");

            await ambilBraket(turnamenId);

            console.log("DATA PERTANDINGAN SETELAH UPDATE:");
        } catch (error) {
            console.error("Error menyimpan jadwal:", error);
            alert(error.message);
        } finally {
            setMenyimpan(false);
        }
    };

    // Menyimpan skor, status, dan link streaming
   
const simpanEditPertandingan = async (e) => {
    e.preventDefault();

    if (!editMatchId) {
        alert("Pertandingan belum dipilih.");
        return;
    }

    setMenyimpan(true);

    try {
        const perubahan = {
            skor_tim_1:
                skorTim1 === "" ? null : Number(skorTim1),

            skor_tim_2:
                skorTim2 === "" ? null : Number(skorTim2),

            status: statusEdit,
            link_stream: linkStream.trim() || null
        };

        const response = await fetch(
            `${API_URL}/pertandingans/${editMatchId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${ambilToken()}`
                },
                body: JSON.stringify(perubahan)
            }
        );

        const hasil = await response.json();

        if (!response.ok) {
            if (response.status === 422 && hasil.errors) {
                throw new Error(
                    Object.values(hasil.errors).flat().join("\n")
                );
            }

            throw new Error(
                hasil.message || "Gagal memperbarui pertandingan."
            );
        }

        // Ambil data pertandingan terbaru dari respons Laravel
        const dataTerbaru = hasil.data;

        console.log("DATA PERTANDINGAN TERBARU:", dataTerbaru);

        // Langsung perbarui kartu pertandingan
        setPertandingan((dataLama) =>
            dataLama.map((item) =>
                String(item.id) === String(editMatchId)
                    ? {
                        ...item,
                        ...(dataTerbaru || {}),
                        ...perubahan
                    }
                    : item
            )
        );

        // Tutup form edit
        setEditMatchId("");
        setSkorTim1("");
        setSkorTim2("");
        setStatusEdit("belum_dimulai");
        setLinkStream("");

        alert(
            hasil.message ||
            "Pertandingan berhasil diperbarui."
        );

    } catch (error) {
        console.error("Error mengedit pertandingan:", error);
        alert(error.message);
    } finally {
        setMenyimpan(false);
    }
};


    // Membatalkan jadwal tanpa menghapus pertandingan braket
    const batalkanJadwal = async (id) => {
        const yakin = window.confirm(
            "Yakin ingin membatalkan jadwal ini? Pertandingan tetap ada di braket."
        );

        if (!yakin) return;

        setMenyimpan(true);

        try {
            const response = await fetch(
                `${API_URL}/braket/pertandingan/${id}/jadwal`,
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
                throw new Error(
                    hasil.message || "Gagal membatalkan jadwal."
                );
            }

            alert(
                hasil.message || "Jadwal berhasil dibatalkan."
            );

            setEditMatchId("");

            await ambilBraket(turnamenId);
        } catch (error) {
            console.error(
                "Error membatalkan jadwal:",
                error
            );
            alert(error.message);
        } finally {
            setMenyimpan(false);
        }
    };

    // Menghapus pertandingan
    const hapusPertandingan = async (id) => {
        const yakin = window.confirm(
            "Yakin ingin menghapus pertandingan ini? Data pertandingan juga akan dihapus dari braket."
        );

        if (!yakin) return;

        setMenyimpan(true);

        try {
            const response = await fetch(
                `${API_URL}/pertandingans/${id}`,
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
                throw new Error(
                    hasil.message || "Gagal menghapus pertandingan."
                );
            }

            alert(
                hasil.message || "Pertandingan berhasil dihapus."
            );

            setEditMatchId("");

            await ambilBraket(turnamenId);
        } catch (error) {
            console.error(
                "Error menghapus pertandingan:",
                error
            );
            alert(error.message);
        } finally {
            setMenyimpan(false);
        }
    };

    // Nama babak
    const namaBabak = (babak) => {
        const daftar = {
            "32_besar": "32 Besar",
            "16_besar": "16 Besar",
            "8_besar": "8 Besar",
            "perempat_final": "Perempat Final",
            "semifinal": "Semifinal",
            "final": "Final"
        };

        return daftar[babak] || babak || "Babak";
    };

    return (
        <main className="admin-page admin-pertandingan-page">

            {/* HEADER ADMIN UNTUK HP */}
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
                    <strong>FREE FIRE</strong>
                    <span>TOURNAMENT</span>
                </div>

                <nav className="admin-nav">
                    <button onClick={() => {
                        setAdminMenuOpen(false);
                        bukaHalaman("admin");
                    }}>
                        🏠 Dashboard
                    </button>

                    <button onClick={() => {
                        setAdminMenuOpen(false);
                        bukaHalaman("admin-turnamen");
                    }}>
                        🏆 Turnamen
                    </button>

                    <button onClick={() => {
                        setAdminMenuOpen(false);
                        bukaHalaman("admin-peserta");
                    }}>
                        👥 Peserta
                    </button>

                    <button
                        className="admin-nav-active"
                        onClick={() => setAdminMenuOpen(false)}
                    >
                        ⚔️ Pertandingan
                    </button>

                    <button onClick={() => {
                        setAdminMenuOpen(false);
                        bukaHalaman("admin-berita");
                    }}>
                        📰 Berita
                    </button>

                    <button onClick={() => {
                        setAdminMenuOpen(false);
                        bukaHalaman("admin-braket");
                    }}>
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

                    <button onClick={() => setAdminMenuOpen(false)}>
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
            
            {/* KONTEN UTAMA */}
            <section className="admin-content">

                <header className="admin-topbar">
                    <div>
                        <h1>Kelola Jadwal Pertandingan</h1>
                        <p>
                            Pilih pertandingan dari braket, lalu tentukan
                            tanggal dan jam pertandingan.
                        </p>
                    </div>
                </header>

                {/* PILIH TURNAMEN */}
                <section className="admin-panel admin-match-panel">
                    <div className="admin-panel-header">
                        <h2>Pilih Turnamen</h2>
                    </div>

                    <div className="admin-form">
                        <label>Turnamen</label>

                        <select
                            value={turnamenId}
                            onChange={handlePilihTurnamen}
                        >
                            <option value="">
                                Pilih Turnamen
                            </option>

                            {turnamen.map((item) => (
                                <option
                                    key={item.id}
                                    value={item.id}
                                >
                                    {item.nama_turnamen}
                                </option>
                            ))}
                        </select>
                    </div>
                </section>

                {/* FORM JADWAL */}
                {turnamenId && (
                    <section className="admin-panel admin-match-panel">
                        <div className="admin-panel-header">
                            <h2>Buat Jadwal Pertandingan</h2>
                        </div>

                        {loading ? (
                            <p>Memuat pertandingan dari braket...</p>
                        ) : (
                            <form
                                className="admin-form"
                                onSubmit={simpanJadwal}
                            >
                                <label>Pilih Pertandingan</label>

                                <select
                                    value={matchId}
                                    onChange={(e) =>
                                        setMatchId(e.target.value)
                                    }
                                    required
                                >
                                    <option value="">
                                        Pilih pertandingan
                                    </option>

                                    {pertandinganBelumDijadwalkan.map(
                                        (item) => (
                                            <option
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {namaBabak(item.babak)} -
                                                {` ${namaTim(item, 1)} vs ${namaTim(item, 2)}`}
                                            </option>
                                        )
                                    )}
                                </select>

                                {pertandinganBelumDijadwalkan.length === 0 && (
                                    <p>
                                        Belum ada pertandingan yang siap
                                        dijadwalkan. Pastikan kedua tim sudah
                                        terisi di braket.
                                    </p>
                                )}

                                <div className="admin-match-input-grid">
                                    <div>
                                        <label>
                                            Tanggal Pertandingan
                                        </label>

                                        <input
                                            type="date"
                                            value={tanggal}
                                            onChange={(e) =>
                                                setTanggal(e.target.value)
                                            }
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label>
                                            Jam Pertandingan
                                        </label>

                                        <input
                                            type="time"
                                            value={jam}
                                            onChange={(e) =>
                                                setJam(e.target.value)
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                {/* TOMBOL SIMPAN JADWAL */}
                                <div className="admin-form-buttons">
                                    <button
                                        type="submit"
                                        disabled={
                                            menyimpan ||
                                            pertandinganBelumDijadwalkan.length === 0
                                        }
                                    >
                                        {menyimpan
                                            ? "MENYIMPAN..."
                                            : "SIMPAN JADWAL"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>
                )}

                {/* DAFTAR JADWAL */}
                <section className="admin-panel admin-match-panel">

                    <div className="admin-panel-header">
                        <h2>Daftar Jadwal Pertandingan</h2>

                        <button
                            type="button"
                            onClick={() => ambilBraket(turnamenId)}
                            disabled={loading || !turnamenId}
                        >
                            {loading ? "MEMUAT..." : "MUAT ULANG"}
                        </button>
                    </div>

                    {!turnamenId && (
                        <p>
                            Pilih turnamen terlebih dahulu untuk melihat jadwal.
                        </p>
                    )}

                    {turnamenId &&
                        !loading &&
                        pertandinganTerjadwal.length === 0 && (
                            <p>
                                Belum ada pertandingan yang dijadwalkan.
                            </p>
                        )}

                    <div className="admin-match-list">

                        {pertandinganTerjadwal.map((item) => (
                            <article
                                className="admin-match-card"
                                key={item.id}
                            >

                                <div className="admin-match-card-top">
                                    <span>
                                        {namaBabak(item.babak)} -
                                        Pertandingan {item.nomor_pertandingan}
                                    </span>

                                    <span
                                        className={`admin-match-status status-${item.status}`}
                                    >
                                        {item.status === "selesai"
                                            ? "Selesai"
                                            : item.status === "sedang_berlangsung"
                                                ? "Sedang Berlangsung"
                                                : "Belum Dimulai"}
                                    </span>
                                </div>

                                <div className="admin-match-versus">
                                    <div>
                                        <strong>
                                            {namaTim(item, 1)}
                                        </strong>
                                        <span>Tim 1</span>
                                    </div>

                                    <div className="admin-match-score">
                                        {item.skor_tim_1 ?? "-"}
                                        <span>:</span>
                                        {item.skor_tim_2 ?? "-"}
                                    </div>

                                    <div>
                                        <strong>
                                            {namaTim(item, 2)}
                                        </strong>
                                        <span>Tim 2</span>
                                    </div>
                                </div>

                                <div className="admin-match-date">
                                    <span>
                                        📅 {item.tanggal}
                                    </span>

                                    <span>
                                        🕒 {item.jam?.slice(0, 5)}
                                    </span>
                                </div>

                                {/* TOMBOL PENGELOLAAN PERTANDINGAN */}
                                {/* TOMBOL PENGELOLAAN PERTANDINGAN */}
                            
                            {/* TOMBOL PENGELOLAAN PERTANDINGAN */}
                            <div className="admin-form-buttons">

                                <button
                                    type="button"
                                    onClick={() => bukaFormEdit(item)}
                                >
                                    EDIT PERTANDINGAN
                                </button>

                                <button
                                    type="button"
                                    onClick={() => batalkanJadwal(item.id)}
                                    disabled={menyimpan}
                                >
                                    BATALKAN JADWAL
                                </button>

                                <button
                                    type="button"
                                    onClick={() => hapusPertandingan(item.id)}
                                    disabled={menyimpan}
                                >
                                    HAPUS PERTANDINGAN
                                </button>

                            </div>


                            </article>
                        ))}

                    </div>
                </section>

                {/* FORM EDIT SKOR DAN LIVE STREAMING */}
                {editMatchId && (
                    <section className="admin-panel admin-match-panel">

                        <div className="admin-panel-header">
                            <h2>Edit Pertandingan</h2>
                        </div>

                        <form
                            className="admin-form"
                            onSubmit={simpanEditPertandingan}
                        >

                            <div className="admin-match-input-grid">
                                <div>
                                    <label>Skor Tim 1</label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={skorTim1}
                                        onChange={(e) =>
                                            setSkorTim1(e.target.value)
                                        }
                                        placeholder="Masukkan skor tim 1"
                                    />
                                </div>

                                <div>
                                    <label>Skor Tim 2</label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={skorTim2}
                                        onChange={(e) =>
                                            setSkorTim2(e.target.value)
                                        }
                                        placeholder="Masukkan skor tim 2"
                                    />
                                </div>
                            </div>

                            
                        <label>Status Pertandingan</label>

                        <select
                            value={statusEdit}
                            onChange={(e) =>
                                setStatusEdit(e.target.value)
                            }
                        >
                            <option value="belum_dimulai">
                                Belum Dimulai
                            </option>

                            <option value="sedang_berlangsung">
                                Sedang Berlangsung
                            </option>

                            <option value="selesai">
                                Selesai
                            </option>
                        </select>


                            <label>Link Live Streaming</label>

                            <input
                                type="url"
                                value={linkStream}
                                onChange={(e) =>
                                    setLinkStream(e.target.value)
                                }
                                placeholder="https://youtube.com/live/..."
                            />

                            <div className="admin-form-buttons">
                                <button
                                    type="submit"
                                    disabled={menyimpan}
                                >
                                    {menyimpan
                                        ? "MENYIMPAN..."
                                        : "SIMPAN PERUBAHAN"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setEditMatchId("")}
                                    disabled={menyimpan}
                                >
                                    BATAL
                                </button>
                            </div>

                        </form>
                    </section>
                )}

            </section>
        </main>
    );
}

export default HalamanAdminPertandingan;
