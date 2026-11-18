
import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

function HalamanAdminPengaturan({
  akun,
  bukaHalaman,
  logoutAdmin,
  ambilSiteSettings,
}) {
  const [tabAktif, setTabAktif] = useState("profil");
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  // Pengaturan QRIS
  const [qrisFile, setQrisFile] = useState(null);
  const [previewQris, setPreviewQris] = useState("");
  const [sedangMenyimpanQris, setSedangMenyimpanQris] = useState(false);
  const [pesanQris, setPesanQris] = useState("");
  const [jenisPesanQris, setJenisPesanQris] = useState("");

  // Pengaturan keamanan
  const [batasLogin, setBatasLogin] = useState("3");
  const [maintenance, setMaintenance] = useState(false);

  // Pengaturan identitas website
  const [namaWebsite, setNamaWebsite] = useState("");
  const [logoWebsite, setLogoWebsite] = useState(null);
  const [previewLogo, setPreviewLogo] = useState("");
  const [logoLama, setLogoLama] = useState("");
  const [deskripsiWebsite, setDeskripsiWebsite] = useState("");
  const [teksFooter, setTeksFooter] = useState("");
  const [teksCopyright, setTeksCopyright] = useState("");

  // Status Website
  const [sedangMenyimpanWebsite, setSedangMenyimpanWebsite] =
    useState(false);
  const [pesanWebsite, setPesanWebsite] = useState("");
  const [jenisPesanWebsite, setJenisPesanWebsite] = useState("");

  // Status keamanan
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [sedangMenyimpan, setSedangMenyimpan] = useState(false);
  const [pesanPengaturan, setPesanPengaturan] = useState("");
  const [jenisPesanPengaturan, setJenisPesanPengaturan] = useState("");

  // Form ubah password
  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");

  // Status ubah password
  const [sedangMengubahPassword, setSedangMengubahPassword] =
    useState(false);
  const [pesanPassword, setPesanPassword] = useState("");
  const [jenisPesanPassword, setJenisPesanPassword] = useState("");

  // Mengambil pengaturan keamanan
  useEffect(() => {
    const ambilPengaturan = async () => {
      try {
        setSedangMemuat(true);

        const hasil = await apiRequest("/admin/settings", {
          method: "GET",
        });

        setBatasLogin(String(hasil.data.login_max_attempts));
        setMaintenance(Boolean(hasil.data.maintenance_mode));
      } catch (error) {
        setPesanPengaturan(
          error.message || "Gagal mengambil pengaturan website."
        );
        setJenisPesanPengaturan("error");
      } finally {
        setSedangMemuat(false);
      }
    };

    ambilPengaturan();
  }, []);

  // Mengambil identitas Website ketika tab dibuka
  useEffect(() => {
    if (tabAktif !== "website") return;

    let masihAktif = true;

    const ambilPengaturanWebsite = async () => {
      try {
        const hasil = await apiRequest("/admin/settings", {
          method: "GET",
        });

        if (!masihAktif) return;

        setNamaWebsite(hasil.data.site_name || "");
        setDeskripsiWebsite(hasil.data.site_description || "");
        setTeksFooter(hasil.data.footer_text || "");
        setTeksCopyright(hasil.data.copyright_text || "");

        setLogoLama(hasil.data.site_logo_url || "");
        setPreviewLogo(hasil.data.site_logo_url || "");
      } catch (error) {
        if (!masihAktif) return;

        setPesanWebsite(
          error.message || "Gagal mengambil pengaturan Website."
        );
        setJenisPesanWebsite("error");
      }
    };

    ambilPengaturanWebsite();

    return () => {
      masihAktif = false;
    };
  }, [tabAktif]);

  // Mengambil QRIS ketika tab pembayaran dibuka
  useEffect(() => {
    if (tabAktif !== "pembayaran") return;

    let masihAktif = true;

    const ambilQris = async () => {
      try {
        setPesanQris("");

        const hasil = await apiRequest("/admin/settings/qris", {
          method: "GET",
        });

        if (!masihAktif) return;

        const url = hasil.data?.qris_url || "";
        setPreviewQris(url);
      } catch (error) {
        if (!masihAktif) return;

        setPesanQris(
          error.message || "Gagal mengambil foto QRIS."
        );
        setJenisPesanQris("error");
      }
    };

    ambilQris();

    return () => {
      masihAktif = false;
    };
  }, [tabAktif]);

  // Memilih foto QRIS
  const handlePilihQris = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setPesanQris("Format gambar harus JPG, PNG, atau WEBP.");
      setJenisPesanQris("error");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setPesanQris("Ukuran gambar maksimal 2 MB.");
      setJenisPesanQris("error");
      e.target.value = "";
      return;
    }

    setQrisFile(file);
    setPreviewQris(URL.createObjectURL(file));
    setPesanQris("");
    setJenisPesanQris("");
  };

  // Menyimpan foto QRIS
  const handleSimpanQris = async () => {
    if (!qrisFile) {
      setPesanQris("Pilih foto QRIS terlebih dahulu.");
      setJenisPesanQris("error");
      return;
    }

    try {
      setSedangMenyimpanQris(true);
      setPesanQris("");
      setJenisPesanQris("");

      const formData = new FormData();
      formData.append("qris_image", qrisFile);

      const hasil = await apiRequest("/admin/settings/qris", {
        method: "POST",
        body: formData,
      });

      const url = hasil.data?.qris_url || "";

      setPreviewQris(url);
      setQrisFile(null);

      setPesanQris(hasil.message || "QRIS berhasil disimpan.");
      setJenisPesanQris("success");
    } catch (error) {
      setPesanQris(
        error.message || "Gagal menyimpan QRIS."
      );
      setJenisPesanQris("error");
    } finally {
      setSedangMenyimpanQris(false);
    }
  };

  // Menyimpan pengaturan keamanan
  const handleSimpanPengaturan = async () => {
    setPesanPengaturan("");
    setJenisPesanPengaturan("");

    try {
      setSedangMenyimpan(true);

      const hasil = await apiRequest("/admin/settings", {
        method: "PUT",
        body: {
          login_max_attempts: Number(batasLogin),
          maintenance_mode: maintenance,
        },
      });

      setBatasLogin(String(hasil.data.login_max_attempts));
      setMaintenance(Boolean(hasil.data.maintenance_mode));

      setPesanPengaturan(
        hasil.message || "Pengaturan berhasil disimpan."
      );
      setJenisPesanPengaturan("success");
    } catch (error) {
      setPesanPengaturan(
        error.message || "Gagal menyimpan pengaturan."
      );
      setJenisPesanPengaturan("error");
    } finally {
      setSedangMenyimpan(false);
    }
  };

  // Memilih logo Website
  const handlePilihLogo = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPesanWebsite("File harus berupa gambar.");
      setJenisPesanWebsite("error");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setPesanWebsite("Ukuran logo maksimal 2 MB.");
      setJenisPesanWebsite("error");
      return;
    }

    setLogoWebsite(file);
    setPreviewLogo(URL.createObjectURL(file));
    setPesanWebsite("");
    setJenisPesanWebsite("");
  };

  // Menyimpan identitas Website
  const handleSimpanWebsite = async () => {
    setPesanWebsite("");
    setJenisPesanWebsite("");

    if (!namaWebsite.trim()) {
      setPesanWebsite("Nama Website wajib diisi.");
      setJenisPesanWebsite("error");
      return;
    }

    try {
      setSedangMenyimpanWebsite(true);

      const formData = new FormData();

      formData.append("site_name", namaWebsite);
      formData.append("site_description", deskripsiWebsite);
      formData.append("footer_text", teksFooter);
      formData.append("copyright_text", teksCopyright);

      if (logoWebsite) {
        formData.append("site_logo", logoWebsite);
      }

      formData.append("_method", "PUT");

      const hasil = await apiRequest("/admin/settings", {
        method: "POST",
        body: formData,
      });

      setNamaWebsite(hasil.data.site_name || "");
      setDeskripsiWebsite(hasil.data.site_description || "");
      setTeksFooter(hasil.data.footer_text || "");
      setTeksCopyright(hasil.data.copyright_text || "");

      setLogoLama(hasil.data.site_logo_url || "");
      setPreviewLogo(hasil.data.site_logo_url || "");
      setLogoWebsite(null);

      // Memperbarui identitas website di seluruh halaman
      await ambilSiteSettings();

      setPesanWebsite(
        hasil.message || "Pengaturan Website berhasil disimpan."
      );
      setJenisPesanWebsite("success");
    } catch (error) {
      setPesanWebsite(
        error.message || "Gagal menyimpan pengaturan Website."
      );
      setJenisPesanWebsite("error");
    } finally {
      setSedangMenyimpanWebsite(false);
    }
  };

  // Fungsi ubah password
  const handleUbahPassword = async (e) => {
    e.preventDefault();

    setPesanPassword("");
    setJenisPesanPassword("");

    if (passwordBaru !== konfirmasiPassword) {
      setPesanPassword("Konfirmasi password baru tidak cocok.");
      setJenisPesanPassword("error");
      return;
    }

    if (passwordBaru.length < 8) {
      setPesanPassword("Password baru minimal 8 karakter.");
      setJenisPesanPassword("error");
      return;
    }

    try {
      setSedangMengubahPassword(true);

      const hasil = await apiRequest("/ubah-password", {
        method: "POST",
        body: {
          password_lama: passwordLama,
          password_baru: passwordBaru,
          password_baru_confirmation: konfirmasiPassword,
        },
      });

      setPesanPassword(
        hasil.message || "Password berhasil diubah."
      );
      setJenisPesanPassword("success");

      setPasswordLama("");
      setPasswordBaru("");
      setKonfirmasiPassword("");
    } catch (error) {
      setPesanPassword(
        error.message ||
          "Gagal mengubah password. Periksa kembali password lama."
      );
      setJenisPesanPassword("error");
    } finally {
      setSedangMengubahPassword(false);
    }
  };

  return (

<main className="admin-page">

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

  {/* SIDEBAR ADMIN */}
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

      <button onClick={() => {
        setAdminMenuOpen(false);
        bukaHalaman("admin-braket");
      }}>
        🏅 Braket
      </button>

      <button onClick={() => {
        setAdminMenuOpen(false);
        bukaHalaman("admin-room");
      }}>
        💬 Room
      </button>

      <button className="admin-nav-active">
        ⚙️ Pengaturan
      </button>

    </nav>

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
            <h1>Pengaturan</h1>
            <p>Kelola pengaturan akun dan website.</p>
          </div>
        </header>

        {/* TAB PENGATURAN */}
        <div className="pengaturan-tabs">
          <button
            className={tabAktif === "profil" ? "aktif" : ""}
            onClick={() => setTabAktif("profil")}
          >
            👤 Profil Admin
          </button>

          <button
            className={tabAktif === "keamanan" ? "aktif" : ""}
            onClick={() => setTabAktif("keamanan")}
          >
            🔒 Keamanan
          </button>

          <button
            className={tabAktif === "website" ? "aktif" : ""}
            onClick={() => setTabAktif("website")}
          >
            🌐 Website
          </button>

          <button
            className={tabAktif === "pembayaran" ? "aktif" : ""}
            onClick={() => setTabAktif("pembayaran")}
          >
            💳 Pembayaran
          </button>
        </div>

        <section className="admin-panel pengaturan-panel">
          {/* PROFIL ADMIN */}
          {tabAktif === "profil" && (
            <div className="profil-admin-container">
              <div className="profil-admin-header">
                <div>
                  <span className="profil-label">
                    ACCOUNT SETTINGS
                  </span>
                  <h2>Profil Administrator</h2>
                  <p>Informasi akun pengelola turnamen.</p>
                </div>

                <span className="profil-status">
                  <span className="profil-status-dot"></span>
                  Akun Admin
                </span>
              </div>

              <div className="profil-admin-card">
                <div className="profil-admin-cover"></div>

                <div className="profil-admin-identity">
                  <div className="profil-admin-avatar">
                    {(akun?.name || "Admin")
                      .trim()
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((kata) => kata[0]?.toUpperCase())
                      .join("")}
                  </div>

                  <div className="profil-admin-identity-text">
                    <h3>{akun?.name || "Administrator"}</h3>
                    <p>{akun?.email || "-"}</p>
                  </div>

                  <span className="profil-role">
                    ADMINISTRATOR
                  </span>
                </div>

                <div className="profil-admin-divider"></div>

                <div className="profil-info-grid">
                  <div className="profil-info-item">
                    <span className="profil-info-icon">👤</span>
                    <div>
                      <small>Nama Pengguna</small>
                      <strong>{akun?.name || "Administrator"}</strong>
                    </div>
                  </div>

                  <div className="profil-info-item">
                    <span className="profil-info-icon">✉️</span>
                    <div>
                      <small>Email Akun</small>
                      <strong>{akun?.email || "-"}</strong>
                    </div>
                  </div>

                  <div className="profil-info-item">
                    <span className="profil-info-icon">🛡️</span>
                    <div>
                      <small>Hak Akses</small>
                      <strong>Administrator</strong>
                    </div>
                  </div>

                  <div className="profil-info-item">
                    <span className="profil-info-icon">⚙️</span>
                    <div>
                      <small>Pengelolaan Akun</small>
                      <strong>Panel Admin</strong>
                    </div>
                  </div>
                </div>

                <div className="profil-admin-footer">
                  <div>
                    <strong>Keamanan Akun</strong>
                    <p>Pastikan password akun selalu terjaga.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setTabAktif("keamanan")}
                  >
                    🔒 Kelola Keamanan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* KEAMANAN */}
          {tabAktif === "keamanan" && (
            <div className="keamanan-layout">
              <div className="keamanan-card">
                <h2>🔒 Keamanan Website</h2>

                <p>Atur keamanan akun dan akses website.</p>

                {sedangMemuat ? (
                  <p>Memuat pengaturan dari database...</p>
                ) : (
                  <>
                    <div className="keamanan-item">
                      <div>
                        <strong>Batas Percobaan Login</strong>
                        <p>
                          Jumlah percobaan login yang gagal.
                        </p>
                      </div>

                      <select
                        value={batasLogin}
                        onChange={(e) =>
                          setBatasLogin(e.target.value)
                        }
                      >
                        <option value="3">3 kali</option>
                        <option value="5">5 kali</option>
                        <option value="10">10 kali</option>
                      </select>
                    </div>

                    <div className="keamanan-item">
                      <div>
                        <strong>Mode Maintenance</strong>
                        <p>
                          Website akan masuk mode perawatan.
                        </p>
                      </div>

                      <label className="pengaturan-switch">
                        <input
                          type="checkbox"
                          checked={maintenance}
                          onChange={(e) =>
                            setMaintenance(e.target.checked)
                          }
                        />
                        <span></span>
                      </label>
                    </div>

                    {pesanPengaturan && (
                      <p
                        className={
                          jenisPesanPengaturan === "success"
                            ? "pesan-password sukses"
                            : "pesan-password error"
                        }
                      >
                        {pesanPengaturan}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={handleSimpanPengaturan}
                      disabled={sedangMenyimpan}
                    >
                      {sedangMenyimpan
                        ? "Menyimpan..."
                        : "💾 Simpan Pengaturan"}
                    </button>
                  </>
                )}
              </div>

              {/* FORM UBAH PASSWORD */}
              <div className="keamanan-card">
                <h2>🔐 Ubah Password Admin</h2>

                <p>
                  Gunakan password yang kuat untuk keamanan akun.
                </p>

                <form
                  className="password-form"
                  onSubmit={handleUbahPassword}
                >
                  <label>Password Lama</label>

                  <input
                    type="password"
                    value={passwordLama}
                    onChange={(e) =>
                      setPasswordLama(e.target.value)
                    }
                    placeholder="Masukkan password lama"
                    required
                  />

                  <label>Password Baru</label>

                  <input
                    type="password"
                    value={passwordBaru}
                    onChange={(e) =>
                      setPasswordBaru(e.target.value)
                    }
                    placeholder="Masukkan password baru"
                    minLength={8}
                    required
                  />

                  <label>Konfirmasi Password</label>

                  <input
                    type="password"
                    value={konfirmasiPassword}
                    onChange={(e) =>
                      setKonfirmasiPassword(e.target.value)
                    }
                    placeholder="Konfirmasi password baru"
                    minLength={8}
                    required
                  />

                  {pesanPassword && (
                    <p
                      className={
                        jenisPesanPassword === "success"
                          ? "pesan-password sukses"
                          : "pesan-password error"
                      }
                    >
                      {pesanPassword}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={sedangMengubahPassword}
                  >
                    {sedangMengubahPassword
                      ? "Sedang Mengubah..."
                      : "🔒 Ubah Password"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* WEBSITE */}
          {tabAktif === "website" && (
            <div className="website-settings-container">
              <div className="website-settings-header">
                <div>
                  <span className="profil-label">
                    WEBSITE IDENTITY
                  </span>
                  <h2>Pengaturan Website</h2>
                  <p>
                    Atur identitas website yang akan ditampilkan
                    kepada pengunjung.
                  </p>
                </div>
              </div>

              <div className="website-settings-card">
                <div className="website-logo-setting">
                  <div>
                    <h3>Logo Website</h3>
                    <p>
                      Pilih gambar logo dengan format JPG, PNG,
                      atau WEBP. Maksimal 2 MB.
                    </p>
                  </div>

                  <div className="website-logo-preview">
                    {previewLogo || logoLama ? (
                      <img
                        src={previewLogo || logoLama}
                        alt="Preview Logo Website"
                      />
                    ) : (
                      <span>LOGO</span>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handlePilihLogo}
                  />

                  {logoWebsite && (
                    <small>
                      File dipilih: {logoWebsite.name}
                    </small>
                  )}
                </div>

                <div className="website-form-divider"></div>

                <div className="website-form-group">
                  <label>Nama Website</label>
                  <input
                    type="text"
                    value={namaWebsite}
                    onChange={(e) =>
                      setNamaWebsite(e.target.value)
                    }
                    placeholder="Contoh: Free Fire Tournament"
                    maxLength={255}
                  />
                </div>

                <div className="website-form-group">
                  <label>Deskripsi Website</label>
                  <textarea
                    value={deskripsiWebsite}
                    onChange={(e) =>
                      setDeskripsiWebsite(e.target.value)
                    }
                    placeholder="Masukkan deskripsi singkat website..."
                    rows={4}
                    maxLength={2000}
                  />
                  <small>
                    Deskripsi singkat mengenai website turnamen.
                  </small>
                </div>

                <div className="website-form-group">
                  <label>Teks Footer</label>
                  <textarea
                    value={teksFooter}
                    onChange={(e) =>
                      setTeksFooter(e.target.value)
                    }
                    placeholder="Masukkan teks yang akan ditampilkan pada footer..."
                    rows={3}
                    maxLength={2000}
                  />
                </div>

                <div className="website-form-group">
                  <label>Teks Copyright</label>
                  <input
                    type="text"
                    value={teksCopyright}
                    onChange={(e) =>
                      setTeksCopyright(e.target.value)
                    }
                    placeholder="Contoh: © 2026 Free Fire Tournament"
                    maxLength={500}
                  />
                </div>

                {pesanWebsite && (
                  <p
                    className={
                      jenisPesanWebsite === "success"
                        ? "pesan-password sukses"
                        : "pesan-password error"
                    }
                  >
                    {pesanWebsite}
                  </p>
                )}

                <div className="website-form-actions">
                  <button
                    type="button"
                    onClick={handleSimpanWebsite}
                    disabled={sedangMenyimpanWebsite}
                  >
                    {sedangMenyimpanWebsite
                      ? "Menyimpan..."
                      : "💾 Simpan Pengaturan Website"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PEMBAYARAN QRIS */}
          {tabAktif === "pembayaran" && (
            <div className="website-settings-container">
              <div className="website-settings-header">
                <div>
                  <span className="profil-label">
                    PAYMENT SETTINGS
                  </span>
                  <h2>Pengaturan QRIS</h2>
                  <p>
                    Atur foto QRIS untuk pembayaran pendaftaran
                    semua turnamen.
                  </p>
                </div>
              </div>

              <div className="website-settings-card">
                <div className="website-form-group">
                  <label>Foto QRIS Pembayaran</label>

                  <p>
                    Pilih foto QRIS dengan format JPG, PNG,
                    atau WEBP. Maksimal 2 MB.
                  </p>

                  <div
                    style={{
                      margin: "20px 0",
                      padding: "20px",
                      background: "#f5f5f5",
                      borderRadius: "14px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      minHeight: "200px",
                    }}
                  >
                    {previewQris ? (
                      <img
                        src={previewQris}
                        alt="Preview QRIS Pembayaran"
                        style={{
                          width: "100%",
                          maxWidth: "280px",
                          maxHeight: "350px",
                          objectFit: "contain",
                          borderRadius: "10px",
                        }}
                      />
                    ) : (
                      <p style={{ color: "#555" }}>
                        Belum ada foto QRIS.
                      </p>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handlePilihQris}
                  />

                  {qrisFile && (
                    <small>
                      File dipilih: {qrisFile.name}
                    </small>
                  )}
                </div>

                {pesanQris && (
                  <p
                    className={
                      jenisPesanQris === "success"
                        ? "pesan-password sukses"
                        : "pesan-password error"
                    }
                  >
                    {pesanQris}
                  </p>
                )}

                <div className="website-form-actions">
                  <button
                    type="button"
                    onClick={handleSimpanQris}
                    disabled={!qrisFile || sedangMenyimpanQris}
                  >
                    {sedangMenyimpanQris
                      ? "Menyimpan..."
                      : "💾 Simpan QRIS"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default HalamanAdminPengaturan;
