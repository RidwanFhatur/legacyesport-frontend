
import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import "./HalamanLogin.css";

function HalamanLogin({
    bukaHalaman,
    setAkun,
    setSudahLogin
}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const [pesanError, setPesanError] = useState("");
    const [sisaPercobaan, setSisaPercobaan] = useState(null);
    const [waktuKunci, setWaktuKunci] = useState(0);

    // Hitung mundur penguncian login
    useEffect(() => {
        if (waktuKunci <= 0) return;

        const timer = setInterval(() => {
            setWaktuKunci((sebelumnya) =>
                Math.max(sebelumnya - 1, 0)
            );
        }, 1000);

        return () => clearInterval(timer);
    }, [waktuKunci]);

    const handleLogin = async (e) => {
        e.preventDefault();

        setPesanError("");
        setSisaPercobaan(null);

        if (username.trim() === "" || password === "") {
            setPesanError("Email dan password wajib diisi.");
            return;
        }

        if (waktuKunci > 0) {
            setPesanError(
                `Login terkunci. Silakan tunggu ${waktuKunci} detik.`
            );
            return;
        }

        try {
            setLoading(true);

            const hasil = await apiRequest("/login", {
                method: "POST",
                body: {
                    email: username.trim(),
                    password: password
                }
            });

            // Simpan token
            localStorage.setItem("token", hasil.token);

            // Simpan informasi akun
            setAkun(hasil.data);
            setSudahLogin(true);

            alert("Login berhasil!");

            // Arahkan berdasarkan role
           if (hasil.data.role === "admin") {
                bukaHalaman("admin");
            } else {
                bukaHalaman("beranda");
            }

        } catch (error) {
            console.error("Error login:", error);

            if (error.status === 401) {
                setPesanError(
                    error.message || "Email atau password salah."
                );

                if (error.data?.attempts_remaining !== undefined) {
                    setSisaPercobaan(
                        error.data.attempts_remaining
                    );
                }

            } else if (error.status === 429) {
                const detik =
                    Number(error.retryAfter) || 30;

                setWaktuKunci(detik);

                setPesanError(
                    `Terlalu banyak percobaan login. Silakan tunggu ${detik} detik.`
                );

            } else if (error.status === 503) {
                setPesanError(
                    "Website sedang dalam pemeliharaan. Silakan coba lagi nanti."
                );

            } else {
                setPesanError(
                    error.message || "Login gagal. Silakan coba lagi."
                );
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="page login-page">

            <div className="login-card">

                <div className="login-icon">
                    👤
                </div>

                <h1>LOGIN</h1>

                <p className="login-subtitle">
                    Login untuk melanjutkan ke akun kamu.
                </p>

                <form onSubmit={handleLogin}>

                    <div className="register-input-group">
                        <label>
                            Email<span>*</span>
                        </label>

                        <input
                            type="email"
                            placeholder="Masukkan email"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setPesanError("");
                                setSisaPercobaan(null);
                            }}
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
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setPesanError("");
                            }}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {/* PESAN ERROR */}
                    {pesanError && (
                        <div
                            style={{
                                background: "#3b1717",
                                color: "#ff7777",
                                padding: "12px",
                                borderRadius: "8px",
                                marginBottom: "15px",
                                fontSize: "14px"
                            }}
                        >
                            {pesanError}
                        </div>
                    )}

                    {/* SISA PERCOBAAN */}
                    {sisaPercobaan !== null && (
                        <p style={{ color: "#ffd32e" }}>
                            Sisa percobaan login: {sisaPercobaan}
                        </p>
                    )}

                    {/* HITUNG MUNDUR */}
                    {waktuKunci > 0 && (
                        <p style={{ color: "#ffd32e" }}>
                            Coba login kembali dalam {waktuKunci} detik.
                        </p>
                    )}

                    <button
                        type="submit"
                        className="login-submit-button"
                        disabled={loading || waktuKunci > 0}
                    >
                        {loading
                            ? "SEDANG LOGIN..."
                            : waktuKunci > 0
                                ? `TUNGGU ${waktuKunci} DETIK`
                                : "LOGIN"}
                    </button>

                </form>

                <div className="login-register">
                    <span>Belum punya akun?</span>

                    <button
                        type="button"
                        onClick={() => bukaHalaman("daftar")}
                    >
                        DAFTAR
                    </button>
                </div>

            </div>
        </main>
    );
}

export default HalamanLogin;
