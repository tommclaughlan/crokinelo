import React from "react";
import "./latestGamesTicker.css";
import { useFetchGames } from "../../services/apiService";
import LoadingSpinner from "../loadingSpinner/LoadingSpinner";

const LatestGamesTicker = () => {
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
            (elem) => {
                const datePlayed = new Date(
                    parseInt(elem._id.substring(0, 8), 16) * 1000
                );

                return (
                    <div>
                        <div className="flex flex-row justify-center gap-2">
                            <div>
                                {renderPlayers(elem.teams[0])}
                            </div>
                            <div>
                                {`${elem.score[0]} - ${elem.score[1]}`}
                            </div>
                            <div>
                                {renderPlayers(elem.teams[1])}
                            </div>
                        </div>
                        <p className="text-center text-xs text-grey">
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

    const carouselItems = renderGames();

    return (
        <div>
        <article className="mt-3 shadow-md fixed bottom-0 h-36px w-full flex">
            <div className="bg-secondary pt-1 sm:pt-2 w-1/6 sm:text-sm text-xs text-center z-10">
                <p>Latest Games</p>
            </div>
            <div className="w-5/6">
                {!isGamesLoading && gamesData ? (
                <div className="flex flex-row w-full marquee-container bg-white relative overflow-x-hidden border border-border-lilac border-b-0 border-t-1 border-x-0">
                {/* Two of the same data are used to make the marquee appear infinitely repeating */}
                    <div className="flex flex-row animate-marquee marquee-content whitespace-nowrap text-sm text-center px-7 gap-14">{carouselItems?.length && carouselItems}</div>
                    <div className="flex flex-row animate-marquee2 marquee-content whitespace-nowrap text-sm text-center px-7 gap-14">{carouselItems?.length && carouselItems}</div>
                </div>
                ) : (
                    <LoadingSpinner />
                )}
            </div>
        </article>
        </div>
    );
};

export default LatestGamesTicker;
