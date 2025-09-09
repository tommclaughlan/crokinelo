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
            const isWin = results[gameIndex].myVerdict === 1;
            const isTie = results[gameIndex].myVerdict === 0.5;

            const parentClass = isTie ? "tie" : isWin ? "win" : "loss";

            formList.push(
                <span className={`form-result border-secondary border md:border-none ${parentClass}`} key={gameIndex} />
            );
            gameIndex++;
        }
    }

    return <>{formList}</>;
}
