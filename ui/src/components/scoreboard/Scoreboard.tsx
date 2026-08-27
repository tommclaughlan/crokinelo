import {useNavigate} from "react-router-dom";
import {useFetchAllStats, useFetchUsers} from "../../services/apiService";
import LoadingSpinner from "../loadingSpinner/LoadingSpinner";
import "./Scoreboard.css";
import {IAllStats, IUser} from "../../services/apiTypes";
import FormList from "../formList/FormList";

interface ScoreboardProps {
    seasonId?: string;
}

const formatWinPercentage = (winPer: number) => `${(winPer * 100).toFixed(2)}%`;

const Scoreboard = ({ seasonId }: ScoreboardProps) => {
    const { isLoading: isUsersLoading, data: userData } = useFetchUsers(seasonId);
    const { isLoading: isStatsLoading, data: statData } = useFetchAllStats(seasonId);
    const navigate = useNavigate();

    const handleRowClicked = (rowData: IUser) => {
        if (seasonId) {
            navigate(`/season/${seasonId}/player/${rowData._id}`);
        }
        else {
            navigate(`/player/${rowData._id}`);
        }
    };

    const renderScoreboard = () => {
        if (userData) {
            let previousElo = -1;
            let currentRank = 0;
            return userData.map((elem, index, array) => {
                const isEqualToPreviousElo = elem.elo === previousElo;

                if (!isEqualToPreviousElo) {
                    currentRank = index + 1;
                    previousElo = elem.elo;
                }

                const ranking = currentRank;

                const displayRank = isEqualToPreviousElo ? "-" : ranking;

                const myStats: IAllStats | undefined = statData?.[elem.username];
                const games = myStats?.results;

                let wins: number = myStats?.wins ?? 0;
                let ties: number = myStats?.ties ?? 0;
                let losses: number = myStats?.losses ?? 0;

                const winPercentage = formatWinPercentage(myStats?.winPer ?? 0);

                const played = games?.length ?? 0;

                let rowColour = index % 2 === 0 ? "bg-white " : "";
                if (ranking === 1) rowColour = "bg-green-200 ";
                if (ranking === userData.length) rowColour = "bg-red-200 ";

                return (
                    <tr
                        className={rowColour + "tr border border-border-lilac border-b-1 border-t-0 border-r-0 border-l-0"}
                        key={elem._id}
                        data-item={elem}
                        onClick={() => handleRowClicked(elem)}
                    >
                        <td className="td text-right pr-8">{ranking === 1 ? "⭐" : ""} {displayRank}</td>
                        <td className="td truncate">{elem.username}</td>
                        <td className="td text-right font-light font-mono max-w-5">
                            {played}
                        </td>
                        <td className="td text-right font-light font-mono max-w-6">
                            {isStatsLoading ? "-" : winPercentage}
                        </td>
                        <td className="td text-right font-light font-mono max-w-2">
                            {wins}
                        </td>
                        <td className="td text-right font-light font-mono max-w-2">
                            {losses}
                        </td>
                        <td className="td text-right font-light font-mono max-w-2">
                            {ties}
                        </td>
                        <td className="td text-right font-bold font-mono max-w-4">{elem.elo}</td>
                        <td className="td text-right max-w-9 pr-2">
                            {isStatsLoading || !myStats ? (
                                "-"
                            ) : (
                                <FormList results={myStats.results}/>
                            )}
                        </td>
                    </tr>
                );
            });
        }
    };

    return (
        <>
            <table className="table-auto">
                <thead className="thead border border-border-lilac border-b-1 border-t-0 border-r-0 border-l-0">
                    <tr className="tr">
                        <th className="th text-right pr-8">Rank</th>
                        <th className="th text-left">Username</th>
                        <th className="th text-right max-w-5">Played</th>
                        <th className="th text-right max-w-6">Win %</th>
                        <th className="th text-right max-w-2">W</th>
                        <th className="th text-right max-w-2">L</th>
                        <th className="th text-right max-w-2">T</th>
                        <th className="th text-right max-w-4">ELO</th>
                        <th className="th text-right max-w-9 pr-2">Form</th>
                    </tr>
                </thead>
                {!isUsersLoading && (
                    <tbody className="tbody">{renderScoreboard()}</tbody>
                )}
            </table>
            {isUsersLoading && <LoadingSpinner />}
        </>
    );
};

export default Scoreboard;
