import React from "react";
import "./latestGames.css";
import Carousel from "../carousel/Carousel";
import { useFetchGames } from "../../services/apiService";
import LoadingSpinner from "../loadingSpinner/LoadingSpinner";

const LatestGames = () => {
    const { isLoading: isGamesLoading, data: gamesData } = useFetchGames();

    const renderPlayers = (players: ReadonlyArray<string>) => {
        let playersString = "";
        for (let i = 0; i < players.length; i++) {
            if (i > 0) {
                playersString += ` & ${players[i]}`;
            } else {
                playersString = players[i];
            }
        }
        return playersString;
    };

    const renderGames = () => {
        if (!gamesData) {
            return [];
        }

        const games: ReadonlyArray<React.ReactNode> = gamesData.map(
            (elem, index, array) => {
                const datePlayed = new Date(
                    parseInt(elem._id.substring(0, 8), 16) * 1000
                );

                return (
                    <div>
                        <div className="columns is-mobile">
                            <div className="column">
                                {renderPlayers(elem.teams[0])}
                            </div>
                            <div className="column">
                                {`${elem.score[0]} - ${elem.score[1]}`}
                            </div>
                            <div className="column">
                                {renderPlayers(elem.teams[1])}
                            </div>
                        </div>
                        <p className="has-text-centered">
                            {`Played at: ${datePlayed.toLocaleTimeString(
                                "en-UK"
                            )} ${datePlayed.toLocaleDateString("en-UK")}`}
                        </p>
                    </div>
                );
            }
        );

        return games;
    };

    return (
        <div>
        <article className="m-3 rounded-lg shadow-md">
            <div className="bg-secondary p-1 pl-4">
                <p>Latest Games</p>
            </div>
            <div className="p-2 w-full">
                {!isGamesLoading && gamesData ? (
                    <Carousel items={renderGames()} />
                ) : (
                    <LoadingSpinner />
                )}
            </div>
        </article>
        </div>
    );
};

export default LatestGames;
