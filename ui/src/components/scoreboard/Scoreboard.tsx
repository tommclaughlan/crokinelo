import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFetchAllStats, useFetchUsers } from "../../services/apiService";
import LoadingSpinner from "../loadingSpinner/LoadingSpinner";
import "./Scoreboard.css";
import { IUser } from "../../services/apiTypes";
import FormList from "../formList/FormList";
import Select from "react-select";

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

const Scoreboard = () => {
    const { isLoading: isUsersLoading, data: userData } = useFetchUsers();
    const { isLoading: isStatsLoading, data: statData } = useFetchAllStats();
    const navigate = useNavigate();

    const [selectedOffice, setSelectedOffice] = useState<string>("All Offices");

    const offices = ["All Offices", "Bristol", "Newcastle"];

    const formatOptions = (options: string[]) => {
      if (options) {
        const formattedOptions = options.map((elem) => {
          return {
            label: elem,
            value: elem,
          };
        });
        return formattedOptions;
      }
    };
  
    const filteredUsers = (): IUser[] => {
      if (!userData) return []; 
      if (selectedOffice === "All Offices") {
        return [...userData]
      }
      if (selectedOffice === "Newcastle") {
        return userData?.filter(item => item.userOffice === selectedOffice || item.userOffice === undefined);
      }
      return userData?.filter(item => item.userOffice === selectedOffice);
    };

    const handleRowClicked = (rowData: IUser) => {
        navigate(`/player/${rowData._id}`);
    };

    const renderScoreboard = () => {
        if (userData) {
            let previousElo = -1;
            let currentRank = 0;
            const users = filteredUsers().map((elem, index, array) => {
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
                        <td className="td">{icon}</td>
                        <td className="td text-center">{displayRank}</td>
                        <td className="td">{elem.username}</td>
                        <td className="td text-right">{elem.elo}</td>
                        <td className="td text-center">
                            {isStatsLoading ? "-" : winPercentage}
                        </td>
                        <td className="td">
                            {isStatsLoading || !myStats ? (
                                "-"
                            ) : (
                                <FormList results={myStats.results} />
                            )}
                        </td>
                    </tr>
                );
            });
            return users;
        }
    };

    return (
        <>
                  <Select
                  className="border border-secondary rounded-md w-auto self-end"
                  placeholder="Select an office"
                  defaultValue={{ value: "All Offices", label: "All Offices" }}
                  options={formatOptions(offices)}
                  classNames={{
                    menuPortal: (state) => "z-50",
                  }}
                  menuPortalTarget={document.body}
                  onChange={(selected) => {
                    setSelectedOffice(selected?.value ? selected.value : "All Offices");
                  }}
                />
            <table className="table-auto">
                <thead className="thead border border-border-lilac border-b-1 border-t-0 border-r-0 border-l-0">
                    <tr className="tr">
                        <th className="th"></th>
                        <th className="th text-center">Rank</th>
                        <th className="th text-left">Username</th>
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
