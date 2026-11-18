
import { useState } from "react";
import { apiRequest } from "../services/api";

function HalamanDaftar({ bukaHalaman }) {
    const [nama, setNama] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleDaftar = async (e) => {
        e.preventDefault();

        // Periksa apakah semua kolom sudah diisi
        if (
            nama.trim() === "" ||
            username.trim() === "" ||
            password === "" ||
            konfirmasiPassword === ""
        ) {
            alert("Semua data wajib diisi.");
            return;
        }

        // Periksa kecocokan password
        if (password !== konfirmasiPassword) {
            alert("Konfirmasi password tidak sesuai.");
            return;
        }

        // Laravel mensyaratkan password minimal 6 karakter
        if (password.length < 6) {
            alert("Password minimal 6 karakter.");
            return;
        }

        try {
            setLoading(true);

            // Kirim data pendaftaran akun ke Laravel
            const hasil = await apiRequest("/register", {
                method: "POST",
                body: {
                    name: nama.trim(),
                    email: username.trim(),
                    password: password
                }
            });

            alert(hasil.message || "Registrasi berhasil!");

            // Kosongkan formulir
            setNama("");
            setUsername("");
            setPassword("");
            setKonfirmasiPassword("");

            // Arahkan ke halaman login
            bukaHalaman("login");

        } catch (error) {
            console.error("Error registrasi:", error);
            alert(error.message || "Registrasi gagal.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="page login-page">

            <button
                type="button"
                className="back-button"
                onClick={() => bukaHalaman("login")}
            >
                ← KEMBALI
            </button>

            <div className="login-card">

                <div className="login-icon">
                    👤
                </div>

                <h1>DAFTAR AKUN</h1>

                <p className="login-subtitle">
                    Buat akun untuk mengikuti turnamen.
                </p>

                <form onSubmit={handleDaftar}>

                    <div className="register-input-group">
                        <label>
                            Nama Lengkap <span>*</span>
                        </label>

                        <input
                            type="text"
                            placeholder="Masukkan nama lengkap"
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                            autoComplete="name"
                            required
                        />
                    </div>

                    <div className="register-input-group">
                        <label>
                            Email <span>*</span>
                        </label>

                        <input
                            type="email"
                            placeholder="Masukkan email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="register-input-group">
                        <label>
                            Password <span>*</span>
                        </label>

                        <input
                            type="password"
                            placeholder="Masukkan password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                            minLength={6}
                            required
                        />
                    </div>

                    <div className="register-input-group">
                        <label>
                            Konfirmasi Password <span>*</span>
                        </label>

                        <input
                            type="password"
                            placeholder="Ulangi password"
                            value={konfirmasiPassword}
                            onChange={(e) =>
                                setKonfirmasiPassword(e.target.value)
                            }
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-submit-button"
                        disabled={loading}
                    >
                        {loading ? "SEDANG MENDAFTAR..." : "DAFTAR"}
                    </button>

                </form>

                <div className="login-register">
                    <span>Sudah punya akun?</span>

                    <button
                        type="button"
                        onClick={() => bukaHalaman("login")}
                    >
                        LOGIN
                    </button>
                </div>

            </div>
        </main>
    );
}

export default HalamanDaftar;
