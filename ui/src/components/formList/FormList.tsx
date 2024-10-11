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
        while (gameIndex < 6 && gameIndex < results.length) {
            const isWin = results[gameIndex].myScore === 2;

            const character = isWin ? "W" : "L";

            const parentClass = isWin ? "bg-accent-green" : "bg-accent-red";

            formList.push(
                <span className={`form-result border-secondary border md:border-none ${parentClass}`} key={gameIndex}>
                    <span className="invisible md:visible">{character}</span>
                </span>
            );
            gameIndex++;
        }
    }

    return <>{formList}</>;
}
