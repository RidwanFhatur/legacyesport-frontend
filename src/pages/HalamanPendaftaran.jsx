import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

function HalamanPendaftaran({
  bukaHalaman,
  turnamen
}) {
  const formatRupiah = (angka) => {
  return `Rp${Number(angka || 0).toLocaleString("id-ID")}`;
};

  const [tahap, setTahap] = useState(1);
  const [statusPembayaran, setStatusPembayaran] = useState(false);

  // Foto QRIS dari pengaturan admin
  const [qrisUrl, setQrisUrl] = useState("");

  useEffect(() => {
    const ambilQris = async () => {
      try {
        const hasil = await apiRequest("/site-settings");

        setQrisUrl(hasil?.data?.qris_url || "");
      } catch (error) {
        console.error("Gagal mengambil QRIS:", error);
      }
    };

    ambilQris();
  }, []);

  const [namaTim, setNamaTim] = useState("");
  const [nickname, setNickname] = useState("");
  const [namaLeader, setNamaLeader] = useState("");
  const [noHp, setNoHp] = useState("");
  const [logo, setLogo] = useState(null);

  const [metodePembayaran, setMetodePembayaran] = useState("");
  const [namaPemilik, setNamaPemilik] = useState("");
  const [nomorPembayaran, setNomorPembayaran] = useState("");

  const [buktiPembayaran, setBuktiPembayaran] = useState(null);
const [previewBukti, setPreviewBukti] = useState("");


  /* ================= UPLOAD LOGO ================= */

  const handleLogo = (e) => {

    const file = e.target.files[0];

    if (file) {
      setLogo(URL.createObjectURL(file));
    }

  };


  /* ================= LANJUT TAHAP 1 ================= */

  const lanjutKePembayaran = () => {

    if (
      namaTim === "" ||
      nickname === "" ||
      namaLeader === "" ||
      noHp === ""
    ) {

      alert("Silakan lengkapi data tim terlebih dahulu.");

      return;
    }

    setTahap(2);

  };

  
const simpanPendaftaran = async () => {
  if (!turnamen?.id) {
    alert("Data turnamen tidak ditemukan.");
    return;
  }

  if (
    !namaTim ||
    !nickname ||
    !namaLeader ||
    !noHp ||
    !metodePembayaran ||
    !namaPemilik ||
    !nomorPembayaran ||
    !buktiPembayaran
  ) {
    alert("Lengkapi semua data dan unggah bukti pembayaran.");
    return;
  }

  try {
    const token = sessionStorage.getItem("token");

    // FormData digunakan untuk mengirim data sekaligus file gambar
    const formData = new FormData();

    formData.append("tournament_id", turnamen.id);
    formData.append("nama_tim", namaTim);
    formData.append("nickname_leader", nickname);
    formData.append("nama_leader", namaLeader);
    formData.append("no_hp", noHp);
    formData.append("metode_pembayaran", metodePembayaran.toLowerCase());
    formData.append("nama_pemilik_pembayaran", namaPemilik);
    formData.append("nomor_pembayaran", nomorPembayaran);
    formData.append("bukti_pembayaran", buktiPembayaran);

    const hasil = await apiRequest("/registrations", {
      method: "POST",
      token,
      body: formData,
    });

    console.log("Pendaftaran berhasil:", hasil);

    setStatusPembayaran(true);

  } catch (error) {
    console.error("Error pendaftaran:", error);
    alert(error.message || "Pendaftaran gagal.");
  }
};

  


  /* ================================================= */
  /*                     RETURN                        */
  /* ================================================= */

  return (
    <main className="register-page">

      {/* ================= HEADER ================= */}

      <div className="register-header">

        <button
          className="register-back"
         onClick={() => {
            if (tahap === 3) {
              setTahap(2);
            } else if (tahap === 2) {
              setTahap(1);
            } else {
              bukaHalaman("detail-turnamen");
            }
}}
        >
          ←
        </button>

        <h1>Daftar Turnamen</h1>

      </div>


      {/* ================= INFO TURNAMEN ================= */}

      <section className="register-tournament-card">

        <div className="register-tournament-top">

            <div className="register-tournament-logo">
              {turnamen?.logo_url ? (
                <img
                  src={turnamen.logo_url}
                  alt={`Logo ${turnamen.nama_turnamen}`}
                />
              ) : (
                <span>FF</span>
              )}
            </div>

         <div className="register-tournament-title">
            <h2 style={{ color: "#ffffff" }}>
              {turnamen?.nama_turnamen || "Turnamen"}
            </h2>
          </div>
        </div>


        <div className="register-tournament-info">

          <span className="status-badge">
            ● Pendaftaran Dibuka
          </span>

         <span className="team-count">
        👥 Mode {turnamen?.mode || "-"}
          </span>

         <span className="price-badge">
            {formatRupiah(turnamen?.biaya_daftar)}/Tim
          </span>

        </div>

      </section>


      {/* ================= STEPPER ================= */}

      <div className="register-steps">

        <div
          className={`step ${tahap >= 1 ? "active" : ""}`}
        >

          <div className="step-number">
            1
          </div>

          <span>Data Tim</span>

        </div>


        <div
          className={`step-line ${
            tahap >= 2 ? "step-line-active" : ""
          }`}
        ></div>


        <div
          className={`step ${tahap >= 2 ? "active" : ""}`}
        >

          <div className="step-number">
            2
          </div>

          <span>Data Leader</span>

        </div>


        <div className="step-line"></div>

<div className={`step ${tahap >= 3 ? "active" : ""}`}>
        

          <div className="step-number">
            3
          </div>

          <span>Pembayaran</span>

        </div>

      </div>


      {/* ================================================= */}
      {/*                  TAHAP 1 DATA TIM                  */}
      {/* ================================================= */}

      {tahap === 1 && (

        <section className="register-form-card">

          <h2>Data Tim</h2>

          <p className="register-subtitle">
            Isi identitas tim dan kontak leader.
          </p>


          {/* ================= LOGO ================= */}

          <div className="logo-upload-area">

            <div className="logo-preview">

              {logo ? (

                <img
                  src={logo}
                  alt="Logo Tim"
                />

              ) : (

                <>
                  <div className="upload-icon">
                    ↑
                  </div>

                  <span>
                    Logo Tim
                  </span>
                </>

              )}

            </div>


            <label
              htmlFor="logoTim"
              className="upload-button"
            >
              Upload Logo
            </label>


            <input
              id="logoTim"
              type="file"
              accept="image/*"
              onChange={handleLogo}
              hidden
            />

          </div>


          {/* ================= NAMA TIM ================= */}

          <div className="register-input-group">

            <label>
              Nama Tim <span>*</span>
            </label>

            <input
              type="text"
              placeholder="Masukkan nama tim"
              value={namaTim}
              onChange={(e) =>
                setNamaTim(e.target.value)
              }
            />

          </div>


          {/* ================= NICKNAME ================= */}

          <div className="register-input-group">

            <label>
              Nickname FF Leader <span>*</span>
            </label>

            <input
              type="text"
              placeholder="Masukkan nickname FF"
              value={nickname}
              onChange={(e) =>
                setNickname(e.target.value)
              }
            />

          </div>


          {/* ================= NAMA LEADER ================= */}

          <div className="register-input-group">

            <label>
              Nama Lengkap Leader <span>*</span>
            </label>

            <input
              type="text"
              placeholder="Masukkan nama lengkap"
              value={namaLeader}
              onChange={(e) =>
                setNamaLeader(e.target.value)
              }
            />

          </div>


          {/* ================= NO HP ================= */}

          <div className="register-input-group">

            <label>
              No. HP / WhatsApp <span>*</span>
            </label>

            <input
              type="tel"
              placeholder="Nomor HP aktif"
              value={noHp}
              onChange={(e) =>
                setNoHp(e.target.value)
              }
            />

          </div>


          {/* ================= PREVIEW ================= */}

          <div className="team-preview-title">
            PREVIEW TIM
          </div>


          <div className="team-preview">

            <div className="preview-logo">

              {logo ? (

                <img
                  src={logo}
                  alt="Preview"
                />

              ) : (

                "○"

              )}

            </div>


            <div className="preview-info">

              <strong>
                {namaTim || "Nama tim belum diisi"}
              </strong>

              <span>
                {nickname
                  ? `Nickname leader: ${nickname}`
                  : "Nickname leader —"
                }
              </span>

            </div>

          </div>


          {/* ================= LANJUT ================= */}

          <button
            className="register-next-button"
            onClick={lanjutKePembayaran}
          >
            Lanjut →
          </button>

        </section>

      )}


      {/* ================================================= */}
      {/*             TAHAP 2 DATA PENERIMA HADIAH          */}
      {/* ================================================= */}

      {tahap === 2 && (

        <section className="register-form-card">

          <h2>Data Penerima Hadiah</h2>

          <p className="register-subtitle">
            Data ini digunakan untuk mengirim hadiah apabila
            tim kamu memenangkan turnamen.
          </p>


          {/* ================= METODE PEMBAYARAN ================= */}

          <div className="payment-method-grid">

            <button
              className={`payment-method ${
                metodePembayaran === "DANA"
                  ? "payment-active"
                  : ""
              }`}
              onClick={() =>
                setMetodePembayaran("DANA")
              }
            >

              <div className="payment-icon dana">
                DANA
              </div>

              <span>
                DANA
              </span>

            </button>


            <button
              className={`payment-method ${
                metodePembayaran === "GOPAY"
                  ? "payment-active"
                  : ""
              }`}
              onClick={() =>
                setMetodePembayaran("GOPAY")
              }
            >

              <div className="payment-icon gopay">
                GO
              </div>

              <span>
                GOPAY
              </span>

            </button>


            <button
              className={`payment-method ${
                metodePembayaran === "OVO"
                  ? "payment-active"
                  : ""
              }`}
              onClick={() =>
                setMetodePembayaran("OVO")
              }
            >

              <div className="payment-icon ovo">
                OVO
              </div>

              <span>
                OVO
              </span>

            </button>


            <button
              className={`payment-method ${
                metodePembayaran === "BANK"
                  ? "payment-active"
                  : ""
              }`}
              onClick={() =>
                setMetodePembayaran("BANK")
              }
            >

              <div className="payment-icon bank">
                BANK
              </div>

              <span>
                BANK
              </span>

            </button>

          </div>


          {/* ================= NAMA PEMILIK ================= */}

          <div className="register-input-group">

            <label>
              Nama Pemilik <span>*</span>
            </label>

            <input
              type="text"
              placeholder="Sesuai akun e-wallet"
              value={namaPemilik}
              onChange={(e) =>
                setNamaPemilik(e.target.value)
              }
            />

          </div>


          {/* ================= NOMOR PEMBAYARAN ================= */}

          <div className="register-input-group">

            <label>
              {metodePembayaran === "BANK"
                ? "Nomor Rekening"
                : "Nomor " + (
                    metodePembayaran || "E-Wallet"
                  )
              }

              <span> *</span>
            </label>

            <input
              type="text"
              placeholder={
                metodePembayaran === "BANK"
                  ? "Masukkan nomor rekening"
                  : "08xxxxxxxxxx"
              }
              value={nomorPembayaran}
              onChange={(e) =>
                setNomorPembayaran(e.target.value)
              }
            />

          </div>


          {/* ================= LANJUT ================= */}

          <button
            className="register-next-button"
            onClick={() => {

              if (
                metodePembayaran === "" ||
                namaPemilik === "" ||
                nomorPembayaran === ""
              ) {

                alert(
                  "Silakan lengkapi data penerima hadiah."
                );

                return;
              }

              setTahap(3);

            }}
          >
            Lanjut →
          </button>

        </section>

      )}


    {/* ================================================= */}
{/*                 TAHAP 3 PEMBAYARAN               */}
{/* ================================================= */}

{tahap === 3 && !statusPembayaran && (

  <section className="register-form-card">

    <h2>Pembayaran</h2>

    <p className="register-subtitle">
      Silakan lakukan pembayaran sesuai nominal di bawah.
    </p>

    {/* ================= RINGKASAN PEMBAYARAN ================= */}

    <div className="payment-summary">

      <div>
        <span>Nama Tim</span>
        <strong>{namaTim}</strong>
      </div>

      <div>
        <span>Leader</span>
        <strong>{nickname}</strong>
      </div>

      <div>
        <span>Penerima Hadiah</span>
        <strong>{namaPemilik}</strong>
      </div>

      <div>
        <span>Metode Hadiah</span>
        <strong>{metodePembayaran}</strong>
      </div>

      <div>
        <span>Biaya Pendaftaran</span>
        <strong>
            {formatRupiah(turnamen?.biaya_daftar)}
       </strong>
      </div>

    </div>


    {/* ================= QRIS ================= */}

    <div className="qris-section">

      <h3>SCAN QRIS</h3>

      <p>
        Scan QRIS menggunakan aplikasi pembayaran
        yang mendukung QRIS.
      </p>

        <div className="qris-box">

          {qrisUrl ? (
            <div className="qris-dummy">

              <div className="qris-title">
                QRIS
              </div>

              <img
                src={qrisUrl}
                alt="QRIS Pembayaran"
                style={{
                  width: "100%",
                  maxWidth: "280px",
                  height: "auto",
                  objectFit: "contain",
                  borderRadius: "10px",
                  background: "#ffffff",
                  padding: "10px"
                }}
              />

              <strong>
                {formatRupiah(turnamen?.biaya_daftar)}
              </strong>

            </div>
          ) : (
            <div className="qris-dummy">

              <div className="qris-title">
                QRIS
              </div>

              <p>
                QRIS belum tersedia. Silakan hubungi admin.
              </p>

            </div>
          )}

        </div>
      <p className="qris-note">
        Pastikan nominal pembayaran sesuai
        dengan jumlah yang tertera.
      </p>

    </div>

    {/* ================= UPLOAD BUKTI PEMBAYARAN ================= */}

<div className="register-input-group">

  <label>
    Bukti Pembayaran <span>*</span>
  </label>

  <input
    type="file"
    accept="image/png,image/jpeg"
    onChange={(e) => {
      const file = e.target.files[0];

      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran gambar maksimal 2 MB.");
        e.target.value = "";
        return;
      }

      setBuktiPembayaran(file);
      setPreviewBukti(URL.createObjectURL(file));
    }}
  />

  {previewBukti && (
    <div className="payment-proof-preview">

      <p>Preview Bukti Pembayaran:</p>

      <img
        src={previewBukti}
        alt="Bukti Pembayaran"
        style={{
          width: "100%",
          maxWidth: "300px",
          borderRadius: "10px",
          marginTop: "10px"
        }}
      />

    </div>
  )}

</div>

    {/* ================= TOMBOL ================= */}

    <button
      className="register-next-button"
      onClick={simpanPendaftaran}
    >
      SAYA SUDAH BAYAR →
    </button>

  </section>

)}


{/* ================================================= */}
{/*              STATUS PEMBAYARAN                   */}
{/* ================================================= */}

{tahap === 3 && statusPembayaran && (

  <section className="register-form-card payment-success-card">

    <div className="success-icon">
      ✓
    </div>

    <h2>Pembayaran Diterima</h2>

    <p className="register-subtitle">
  Pembayaran kamu sudah diterima dan sedang menunggu verifikasi admin.
</p>


    {/* ================= STATUS ================= */}

    <div className="verification-status">

      <span className="status-dot"></span>

      <div>
        <strong>MENUNGGU VERIFIKASI</strong>

        <p>
          Admin akan memeriksa pembayaran
          kamu terlebih dahulu.
        </p>
      </div>

    </div>


    {/* ================= DETAIL ================= */}

    <div className="payment-summary">

      <div>
        <span>Nama Tim</span>
        <strong>{namaTim}</strong>
      </div>

      <div>
        <span>Leader</span>
        <strong>{nickname}</strong>
      </div>

      <div>
        <span>Pembayaran</span>
        <strong>
          {formatRupiah(turnamen?.biaya_daftar)}
        </strong>
      </div>

      <div>
        <span>Status</span>
        <strong>Menunggu Verifikasi</strong>
      </div>

    </div>


    <button
      className="register-next-button"
      onClick={() => bukaHalaman("turnamen")}
    >
      KEMBALI KE TURNAMEN
    </button>

  </section>

)}
    </main>
  );
}

export default HalamanPendaftaran;