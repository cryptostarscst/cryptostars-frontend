import React from "react";
import "./styles/SkinsModal.css";
import skinImages from "./utils/skinImages";

export default function SkinsModal({ activeSkin, skins, onClose, userData }) {
  const getImage = (name) => {
    const clean = name.replace("skin_", "");
    return skinImages[clean] || skinImages["usuario_inicial"];
  };

  const rewardByWin = (totalWins) => {
    if (totalWins <= 10) return 100;
    if (totalWins <= 30) return 250;
    if (totalWins <= 100) return 500;
    if (totalWins <= 500) return 1000;
    if (totalWins <= 1000) return 2500;
    return 5000;
  };

  const getVictories = (skinName) => {
    const key = `skinsVitorias.${skinName}`;
    return userData?.[key] || 0;
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Your Skins</h2>

        <div className="skins-ticker">
          <div className="skins-track">
            {skins
              .filter((s) => s !== activeSkin.name)
              .map((name, index) => (
                <div key={index} className="skin-preview">
                  <img src={getImage(name)} alt={name} />
                  <p>{name.replace("skin_", "").replace(/_/g, " ")}</p>
                  <span>{getVictories(name)} wins</span>
                </div>
              ))}
          </div>
        </div>

        <div className="central-skin">
          <img src={getImage(activeSkin.name)} alt={activeSkin.name} />
          <p>{activeSkin.name.replace("skin_", "").replace(/_/g, " ")}</p>
          <span>{getVictories(activeSkin.name)} completed wins. .</span>
          <span>    + {rewardByWin(getVictories(activeSkin.name))} CST added to each tournament won  </span>
        </div>
      </div>
    </div>
  );
}