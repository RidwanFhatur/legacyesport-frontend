function MatchCard({
  nama,
  team1,
  team2,
  jam
}) {
  return (
    <div className="match-card">

      <div className="match-left">

        <div className="match-title">
          {nama}
        </div>

        <div className="teams">

          {team1}

          <strong>VS</strong>

          {team2}

        </div>

      </div>

      <div className="match-time">

        <strong>
          {jam}
        </strong>

        <span>
          WIB
        </span>

      </div>

      <div className="match-buttons">

        <button>
          TEAM LIST
        </button>

        <button className="live">
          LIVESTREAM
        </button>

      </div>

    </div>
  );
}

export default MatchCard;