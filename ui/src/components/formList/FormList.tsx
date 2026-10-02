import React from "react";
import "./FormList.css";
import { IStatResult } from "../../services/apiTypes";

interface FormListProps {
    results: ReadonlyArray<IStatResult>;
}

export default function FormList({ results }: FormListProps) {
    let formList: React.ReactNode[] = [];

    if (results) {
        let gameIndex = 0;
        while (gameIndex < 8) {
            if (gameIndex >= results.length) {
                formList.push(
                    <span className="form-result border-none none" key={gameIndex} />);
            }
            else {
                const isWin = results[gameIndex].myVerdict === 1;
                const isTie = results[gameIndex].myVerdict === 0.5;

                const myScore = results[gameIndex].myScore;
                const opponentScore = results[gameIndex].opponentScore;

                const magnitudeMin = 10;
                const magnitudeMax = 50 + magnitudeMin;
                const winMagnitude = Math.min(Math.abs(myScore - opponentScore) + magnitudeMin, magnitudeMax) / magnitudeMax;

                const parentClass = isTie ? "tie" : isWin ? "win" : "loss";

                formList.push(
                    <span className={`form-result border-none ${parentClass}`}
                          style={{opacity: isTie ? 1 : winMagnitude}}
                          key={gameIndex}
                          title={`${myScore} - ${opponentScore}`}
                    />
                );
            }
            gameIndex++;
        }
    }

    return <>{formList}</>;
}
