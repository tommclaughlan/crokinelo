import {useNavigate} from "react-router-dom";
import {useFetchAllStats, useFetchUsers} from "../../services/apiService";
import LoadingSpinner from "../loadingSpinner/LoadingSpinner";
import "./Scoreboard.css";
import {IUser} from "../../services/apiTypes";
import FormList from "../formList/FormList";

interface ScoreboardProps {
    seasonId?: string;
}

const getIcon = (index: number) => {
    switch (index) {
        case 1:
            return "🥇";
        case 2:
            return "🥈";
        case 3:
            return "🥉";
        default:
            return "";
    }
};

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

                const displayRank = isEqualToPreviousElo ? "" : ranking;

                const icon = getIcon(ranking);

                const myStats = statData?.[elem.username];

                const winPercentage = formatWinPercentage(myStats?.winPer ?? 0);

                return (
                    <tr
                        className={(index % 2 === 0 ? "bg-white " : "") + "tr border border-border-lilac border-b-1 border-t-0 border-r-0 border-l-0"}
                        key={elem._id}
                        data-item={elem}
                        onClick={() => handleRowClicked(elem)}
                    >
                        <td className="td medal">{icon}</td>
                        <td className="td text-center">{displayRank}</td>
                        <td className="td truncate">{elem.username}</td>
                        <td className="td text-right">{elem.elo}</td>
                        <td className="td text-center">
                            {isStatsLoading ? "-" : winPercentage}
                        </td>
                        <td className="td">
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
                        <th className="th"></th>
                        <th className="th text-center">Rank</th>
                        <th className="th text-left max-w-1/4">Username</th>
                        <th className="th text-right">ELO</th>
                        <th className="th text-center">Win %</th>
                        <th className="th text-left">Form</th>
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
