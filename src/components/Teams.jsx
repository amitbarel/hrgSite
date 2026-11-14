import { teamLogo, OUR_TEAM_ID } from "../utils.js";

const nameOf = t => (t.id === OUR_TEAM_ID ? 'הפועל ר"ג' : t.name);

export function ScoreBox({ score, small = false }) {
  return (
    <div className={`score-box${small ? " small" : ""}`}>
      <span>{score[0]}</span><i>-</i><span>{score[1]}</span>
    </div>
  );
}

// שתי הקבוצות עם משהו באמצע (תוצאה או VS). הקבוצה המארחת מימין
export function MatchTeams({ game, middle }) {
  return (
    <div className="match-teams">
      <div className="team"><img src={teamLogo(game.home)} alt="" loading="lazy" /><span>{nameOf(game.home)}</span></div>
      {middle}
      <div className="team"><img src={teamLogo(game.away)} alt="" loading="lazy" /><span>{nameOf(game.away)}</span></div>
    </div>
  );
}

export function FixtureTeams({ game, middle }) {
  return (
    <div className="fx-teams">
      <div className="fx-team"><img src={teamLogo(game.home)} alt="" loading="lazy" /><span>{nameOf(game.home)}</span></div>
      {middle}
      <div className="fx-team"><img src={teamLogo(game.away)} alt="" loading="lazy" /><span>{nameOf(game.away)}</span></div>
    </div>
  );
}
