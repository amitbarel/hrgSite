import { useCallback, useState } from "react";
import { useApi } from "../api.js";
import PageHero from "../components/PageHero.jsx";
import SectionHead from "../components/SectionHead.jsx";
import Filters from "../components/Filters.jsx";
import PlayerCard from "../components/PlayerCard.jsx";
import Status from "../components/Status.jsx";
import PlayerModal from "../components/PlayerModal.jsx";

const ALL = "הכל";

export default function Squad() {
  const { data: players, loading, error } = useApi("/players");
  const [filter, setFilter] = useState(ALL);
  const [open, setOpen] = useState(null); // השחקן שהחלון שלו פתוח
  const close = useCallback(() => setOpen(null), []);

  const groups = players ? [...new Set(players.map(p => p.group))] : [];
  const shown = filter === ALL ? groups : [filter];

  return (
    <>
      <PageHero en="The Squad" title="הסגל" sub={players ? `${players.length} שחקנים בעונת 2026/27` : "עונת 2026/27"} />
      <section className="section squad">
        <div className="container">
          <SectionHead en="Season 26/27" title="שחקני הקבוצה">
            {players && <Filters options={[ALL, ...groups]} value={filter} onChange={setFilter} />}
          </SectionHead>
          <Status loading={loading} error={error} />
          <div key={filter} className="player-grid fade-swap">
            {shown.map(g => {
              const list = players.filter(p => p.group === g);
              return (
                <section key={g} className="squad-group">
                  <h3 className="squad-group-title">{g} <span>{list.length}</span></h3>
                  <div className="player-row">{list.map(p => <PlayerCard key={p.id} player={p} onOpen={setOpen} />)}</div>
                </section>
              );
            })}
          </div>
        </div>
      </section>
      <PlayerModal player={open} onClose={close} />
    </>
  );
}
