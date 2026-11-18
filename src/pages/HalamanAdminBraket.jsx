
import { useCallback, useEffect, useMemo, useState } from "react";
import HalamanAdminJadwalBraket from "./HalamanAdminJadwalBraket";

const API_URL = "http://127.0.0.1:8000/api";

// Mengelompokkan pertandingan berdasarkan babak.
   const urutanBabak = [
    "32_besar",
    "16_besar",
    "8_besar",
    "perempat_final",
    "semifinal",
    "final"
];

function HalamanAdminBraket({
    akun,
    bukaHalaman,
    logoutAdmin
}) {
    const [adminMenuOpen, setAdminMenuOpen] = useState(false);

    const [turnamen, setTurnamen] = useState([]);
    const [turnamenId, setTurnamenId] = useState("");

    const [braket, setBraket] = useState([]);
    const [pilihanPemenang, setPilihanPemenang] = useState({});

    const [loadingTurnamen, setLoadingTurnamen] = useState(false);
    const [loadingBraket, setLoadingBraket] = useState(false);
    const [membuatBraket, setMembuatBraket] = useState(false);
    const [menyimpanPemenang, setMenyimpanPemenang] = useState(null);

    // Mengambil token login dari localStorage.
        const ambilToken = () => {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Sesi login tidak ditemukan. Silakan login kembali.");
            }

            return token;
        };

    // Mengambil daftar turnamen.
    const ambilTurnamen = useCallback(async () => {
        setLoadingTurnamen(true);

        try {
            const token = ambilToken();

            const response = await fetch(`${API_URL}/tournaments`, {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            const hasil = await response.json();

            if (!response.ok) {
                throw new Error(hasil.message || "Gagal mengambil turnamen.");
            }

            const daftar = hasil.data || [];

            setTurnamen(daftar);

            // Otomatis memilih turnamen pertama.
            if (daftar.length > 0) {
                setTurnamenId((sebelumnya) =>
                    sebelumnya || String(daftar[0].id)
                );
            }
        } catch (error) {
            console.error("Error mengambil turnamen:", error);
            alert(error.message);
        } finally {
            setLoadingTurnamen(false);
        }
    }, []);

    // Mengambil data braket berdasarkan turnamen.
    const ambilBraket = useCallback(async () => {
        if (!turnamenId) {
            setBraket([]);
            return;
        }

        setLoadingBraket(true);

        try {
            const token = ambilToken();

            const response = await fetch(
                `${API_URL}/braket/${turnamenId}`,
                {
                    cache: "no-store",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                        "Cache-Control": "no-cache"
                    }
                }
            );

            const hasil = await response.json();

            if (!response.ok) {
                throw new Error(hasil.message || "Gagal mengambil data braket.");
            }

            setBraket(hasil.data || []);
            setPilihanPemenang({});
        } catch (error) {
            console.error("Error mengambil braket:", error);
            alert(error.message);
        } finally {
            setLoadingBraket(false);
        }
    }, [turnamenId]);

    // Memuat turnamen saat halaman dibuka.
    // Memuat turnamen saat halaman dibuka.
useEffect(() => {
    const timer = setTimeout(() => {
        ambilTurnamen();
    }, 0);

    return () => clearTimeout(timer);
}, [ambilTurnamen]);

// Memuat braket ketika turnamen dipilih.
useEffect(() => {
    if (!turnamenId) return;

    const timer = setTimeout(() => {
        ambilBraket();
    }, 0);

    return () => clearTimeout(timer);
}, [turnamenId, ambilBraket]);

    // Membuat braket otomatis.
    const buatBraket = async () => {
        const yakin = window.confirm(
            "Buat braket otomatis untuk turnamen ini? Pastikan peserta sudah terverifikasi."
        );

        if (!yakin) return;
        
        const turnamenAktif = turnamen.find(
            (item) => String(item.id) === String(turnamenId)
        );

        if (!turnamenAktif) {
            alert("Silakan pilih turnamen terlebih dahulu.");
            return;
        }

        console.log("Turnamen yang akan dibuatkan braket:", {
            id: turnamenAktif.id,
            nama: turnamenAktif.nama_turnamen,
            kapasitas: turnamenAktif.jumlah_tim
        });

        try {
            setMembuatBraket(true);

            const token = ambilToken();

            const response = await fetch(
                `${API_URL}/braket/${turnamenId}/generate`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        konfirmasi: true
                    })
                }
            );

            const hasil = await response.json();

            if (!response.ok) {
                throw new Error(hasil.message || "Gagal membuat braket.");
            }

           alert(
                `${hasil.message}\n` +
                `Turnamen: ${turnamenAktif.nama_turnamen}\n` +
                `ID Turnamen: ${turnamenAktif.id}\n` +
                `Kapasitas Braket: ${hasil.kapasitas_braket} tim\n` +
                `Jumlah Peserta: ${hasil.jumlah_peserta}\n` +
                `Jumlah Pertandingan: ${hasil.jumlah_pertandingan}`
            );

            await ambilBraket();
                    } catch (error) {
                        console.error("Error membuat braket:", error);
                        alert(error.message);
                    } finally {
                        setMembuatBraket(false);
                    }
                };

    // Menentukan pemenang pertandingan.
    const tentukanPemenang = async (item) => {
        const pemenangId = pilihanPemenang[item.id];

        if (!pemenangId) {
            alert("Silakan pilih tim yang menang terlebih dahulu.");
            return;
        }

        const yakin = window.confirm(
            "Apakah kamu yakin ingin menentukan tim ini sebagai pemenang?"
        );

        if (!yakin) return;

        try {
            setMenyimpanPemenang(item.id);

            const token = ambilToken();

            const response = await fetch(
                `${API_URL}/braket/pertandingan/${item.id}/pemenang`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        pemenang_registration_id: Number(pemenangId)
                    })
                }
            );

            const hasil = await response.json();

            if (!response.ok) {
                throw new Error(hasil.message || "Gagal menentukan pemenang.");
            }

            alert(hasil.message || "Pemenang berhasil ditentukan.");

            // Ambil data terbaru agar posisi pemenang diperbarui.
            await ambilBraket();
        } catch (error) {
            console.error("Error menentukan pemenang:", error);
            alert(error.message);
        } finally {
            setMenyimpanPemenang(null);
        }
    };

    // Mengubah nama babak menjadi tulisan yang mudah dibaca.
    const namaBabak = (babak) => {
        const daftarNama = {
            "32_besar": "32 BESAR",
            "16_besar": "16 BESAR",
            "perempat_final": "PEREMPAT FINAL",
            "semifinal": "SEMIFINAL",
            "final": "FINAL"
        };

        return daftarNama[babak] || (babak || "BABAK").replaceAll("_", " ").toUpperCase();
    };

    // Mengubah status pertandingan.
    const namaStatus = (status) => {
        if (status === "selesai") return "Selesai";
        if (status === "sedang_berlangsung") return "Sedang Berlangsung";
        return "Belum Dimulai";
    };

    // Mengambil nama tim dari data pertandingan.
    const namaTim = (item, posisi) => {
        const relasi = posisi === 1
            ? item.tim_pertama
            : item.tim_kedua;

        const nama = posisi === 1
            ? item.nama_tim_1
            : item.nama_tim_2;

        const registrationId = posisi === 1
            ? item.registration_tim_1
            : item.registration_tim_2;

        return relasi?.nama_tim || nama || (
            registrationId ? "Tim peserta" : "Menunggu peserta"
        );
    };



    const kelompokBabak = useMemo(() => {
        return urutanBabak
            .filter((babak) => braket.some((item) => item.babak === babak))
            .map((babak) => ({
                babak,
                pertandingan: braket
                    .filter((item) => item.babak === babak)
                    .sort(
                        (a, b) =>
                            (a.nomor_pertandingan || 0) -
                            (b.nomor_pertandingan || 0)
                    )
            }));
    }, [braket]);

    const turnamenDipilih = turnamen.find(
        (item) => String(item.id) === String(turnamenId)
    );

    return (
        <main className="admin-page admin-braket-page">

            {/* HEADER ADMIN UNTUK HP */}
            <div className="admin-mobile-header">
                <div className="admin-mobile-logo">FREE FIRE</div>

                <button
                    className="admin-mobile-menu-button"
                    onClick={() => setAdminMenuOpen(true)}
                >
                    ☰
                </button>
            </div>

            {/* SIDEBAR */}
            <aside className={`admin-sidebar ${adminMenuOpen ? "admin-sidebar-open" : ""}`}>
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

                    <button onClick={() => {
                        setAdminMenuOpen(false);
                        bukaHalaman("admin-pertandingan");
                    }}>
                        ⚔️ Pertandingan
                    </button>

                    <button onClick={() => {
                        setAdminMenuOpen(false);
                        bukaHalaman("admin-berita");
                    }}>
                        📰 Berita
                    </button>

                    <button
                    className="admin-nav-active"
                    onClick={() => {
                        setAdminMenuOpen(false);
                        bukaHalaman("admin-braket");
                    }}
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
                        <h1>Kelola Braket</h1>
                        <p>Atur babak pertandingan dan tentukan tim yang lolos.</p>
                    </div>
                </header>

                {/* PILIH TURNAMEN */}
                <section className="admin-panel bracket-panel">
                    <div className="admin-panel-header">
                        <h2>Pilih Turnamen</h2>

                        <button
                            type="button"
                            onClick={ambilBraket}
                            disabled={loadingBraket || !turnamenId}
                        >
                            {loadingBraket ? "MEMUAT..." : "MUAT ULANG"}
                        </button>
                    </div>

                    <label>Turnamen</label>

                    <select
                        value={turnamenId}
                        onChange={(e) => setTurnamenId(e.target.value)}
                        disabled={loadingTurnamen}
                    >
                        <option value="">
                            {loadingTurnamen
                                ? "Memuat turnamen..."
                                : "Pilih Turnamen"}
                        </option>

                        {turnamen.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.nama_turnamen}
                            </option>
                        ))}
                    </select>

                    {turnamenDipilih && (
                        <div className="bracket-tournament-info">
                            <strong>{turnamenDipilih.nama_turnamen}</strong>
                            <span>
                                Kapasitas Turnamen: {turnamenDipilih.jumlah_tim ?? 0} Tim
                            </span>
                            <span>
                                Kapasitas Braket: {
                                    braket.length > 0
                                        ? braket.length + 1
                                        : turnamenDipilih.jumlah_tim
                                } Tim
                            </span>
                        </div>
                    )}
                </section>

                {/* BUAT BRAKET */}
                {turnamenId && !loadingBraket && braket.length === 0 && (
                    <section className="admin-panel bracket-empty">
                        <div className="bracket-empty-icon">🏆</div>

                        <h2>Braket Belum Dibuat</h2>

                        <p>
                            Belum ada susunan pertandingan untuk turnamen ini.
                            Tekan tombol di bawah untuk membuat braket otomatis
                            berdasarkan peserta yang sudah terverifikasi.
                        </p>

                        <button
                            type="button"
                            className="bracket-create-button"
                            onClick={buatBraket}
                            disabled={membuatBraket}
                        >
                            {membuatBraket
                                ? "SEDANG MEMBUAT..."
                                : "+ BUAT BRAKET OTOMATIS"}
                        </button>
                    </section>
                )}

                {/* DAFTAR BRAKET */}
                {loadingBraket && (
                    <section className="admin-panel">
                        <p>Memuat data braket...</p>
                    </section>
                )}

                {!loadingBraket && braket.length > 0 && (
                    <section className="admin-panel bracket-panel">
                        <div className="admin-panel-header">
                            <h2>Bagan Pertandingan</h2>
                            <span className="bracket-total">
                                {braket.length} Pertandingan
                            </span>
                        </div>
                    <div className="bracket-rounds-container">
                        {kelompokBabak.map((kelompok) => (
                            <div
                                className="bracket-round"
                                key={kelompok.babak}
                            >
                                <h3>{namaBabak(kelompok.babak)}</h3>

                                <div className="bracket-match-grid">
                                    {kelompok.pertandingan.map((item) => {
                                        const tim1 = namaTim(item, 1);
                                        const tim2 = namaTim(item, 2);

                                        const idTim1 = item.registration_tim_1;
                                        const idTim2 = item.registration_tim_2;

                                        const sudahSelesai = item.status === "selesai";

                                        const pemenangId = item.pemenang_registration_id;

                                        const namaPemenang =
                                            item.pemenang?.nama_tim ||
                                            (Number(pemenangId) === Number(idTim1) ? tim1 : null) ||
                                            (Number(pemenangId) === Number(idTim2) ? tim2 : null);

                                        return (
                                            <article
                                                className="bracket-match-card"
                                                key={item.id}
                                            >
                                                <div className="bracket-match-heading">
                                                    <strong>
                                                        Pertandingan #{item.nomor_pertandingan || item.id}
                                                    </strong>

                                                    <span className={`admin-match-status status-${item.status}`}>
                                                        {namaStatus(item.status)}
                                                    </span>
                                                </div>

                                                <div className="bracket-team-row">
                                                    <span>{tim1}</span>

                                                    {Number(pemenangId) === Number(idTim1) &&
                                                        pemenangId !== null && (
                                                            <strong className="bracket-winner">
                                                                PEMENANG
                                                            </strong>
                                                        )}
                                                </div>

                                                <div className="bracket-team-row">
                                                    <span>{tim2}</span>

                                                    {Number(pemenangId) === Number(idTim2) &&
                                                        pemenangId !== null && (
                                                            <strong className="bracket-winner">
                                                                PEMENANG
                                                            </strong>
                                                        )}
                                                </div>

                                                {sudahSelesai && namaPemenang && (
                                                    <div className="bracket-result">
                                                        Pemenang: <strong>{namaPemenang}</strong>
                                                    </div>
                                                )}

                                                {!sudahSelesai && idTim1 && idTim2 && (
                                                    <div className="bracket-winner-form">
                                                        <label>Pilih Pemenang</label>

                                                        <select
                                                            value={pilihanPemenang[item.id] || ""}
                                                            onChange={(e) =>
                                                                setPilihanPemenang((sebelumnya) => ({
                                                                    ...sebelumnya,
                                                                    [item.id]: e.target.value
                                                                }))
                                                            }
                                                        >
                                                            <option value="">
                                                                Pilih Tim Pemenang
                                                            </option>

                                                            <option value={idTim1}>
                                                                {tim1}
                                                            </option>

                                                            <option value={idTim2}>
                                                                {tim2}
                                                            </option>
                                                        </select>

                                                        <button
                                                            type="button"
                                                            onClick={() => tentukanPemenang(item)}
                                                            disabled={menyimpanPemenang === item.id}
                                                        >
                                                            {menyimpanPemenang === item.id
                                                                ? "MENYIMPAN..."
                                                                : "TENTUKAN PEMENANG"}
                                                        </button>
                                                    </div>
                                                )}

                                                {!sudahSelesai && (!idTim1 || !idTim2) && (
                                                    <p className="bracket-waiting">
                                                        Menunggu peserta atau pertandingan sebelumnya.
                                                    </p>
                                                )}
                                            </article>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                    </section>
                )}

                                {/* PENGATURAN JADWAL PER BABAK */}
                {!loadingBraket && braket.length > 0 && (
                    <HalamanAdminJadwalBraket
                        key={turnamenId}
                        turnamenId={turnamenId}
                        kelompokBabak={kelompokBabak}
                        braket={braket}
                        ambilBraket={ambilBraket}
                    />
                )}

            </section>
    
    
        </main>
    
                
);

}

export default HalamanAdminBraket;
