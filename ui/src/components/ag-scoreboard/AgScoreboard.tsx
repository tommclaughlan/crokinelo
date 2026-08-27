import {useFetchAllStats, useFetchUsers} from "../../services/apiService";
import {useNavigate} from "react-router-dom";
import {IAllStats, IStatResult} from "../../services/apiTypes";
import {AgGridProvider, AgGridReact} from "ag-grid-react";
import {AllCommunityModule, ColDef, RowClickedEvent, themeAlpine} from "ag-grid-community";
import {useState} from "react";
import FormList from "../formList/FormList";

interface AgScoreboardProps {
    seasonId?: string;
}

interface RowData {
    _id: string;
    ranking: number | "-";
    name: string;
    played: number;
    winPercentage: number;
    wins: number;
    ties: number;
    losses: number;
    elo: number;
    results: readonly IStatResult[];
}

const formatWinPercentage = (winPer: number) => `${(winPer * 100).toFixed(1)}%`;

const theme = themeAlpine
    .withParams({
        fontFamily: "Google Sans",
        cellFontSize: 18,
        fontSize: 18,
        headerFontSize: 18,
        oddRowBackgroundColor: "var(--background-color)",
        headerBackgroundColor: "#ffffff"
    });

const AgScoreboard = ({ seasonId }: AgScoreboardProps) => {
    const { data: userData } = useFetchUsers(seasonId);
    const { data: statData } = useFetchAllStats(seasonId);
    const navigate = useNavigate();

    const compareForm = (a: IStatResult[], b: IStatResult[]) => {
        let aWins = a.slice(0, 8).filter(elem => elem.myVerdict === 1).length;
        let aLosses = a.slice(0, 8).filter(elem => elem.myVerdict === 0).length;
        let bWins = b.slice(0, 8).filter(elem => elem.myVerdict === 1).length;
        let bLosses = b.filter(elem => elem.myVerdict === 0).length;

        let aScore = aWins - aLosses;
        let bScore = bWins - bLosses;

        if (aScore === bScore) {
            return 0;
        }
        return aScore > bScore ? 1 : -1;
    }

    const modules = [AllCommunityModule];
    const [colDefs] = useState<ColDef<RowData>[]>([
        {
            field: "ranking",
            headerName: "",
            valueFormatter: params => params.value,
            width: 75,
            resizable: false
        },
        {
            field: "name",
            flex: 1,
            minWidth: 150,
            resizable: false
        },
        {
            field: "played",
            headerName: "P",
            width: 100,
            resizable: false,
            type: "rightAligned"
        },
        {
            field: "wins",
            headerName: "W",
            width: 65,
            resizable: false,
            type: "rightAligned"
        },
        {
            field: "ties",
            headerName: "T",
            width: 65,
            resizable: false,
            type: "rightAligned"
        },
        {
            field: "losses",
            headerName: "L",
            width: 65,
            resizable: false,
            type: "rightAligned"
        },
        {
            field: "winPercentage",
            headerName: "Win %",
            width: 140,
            valueFormatter: params => formatWinPercentage(params.value),
            resizable: false,
            type: "rightAligned"
        },
        {
            field: "elo",
            width: 120,
            minWidth: 120,
            cellRenderer: ({ value }: any) => <b>{value}</b>,
            pinned: "right",
            resizable: false,
            type: "rightAligned"
        },
        {
            field: "results",
            headerName: "Form",
            cellRenderer: ({ value }: any) => value ? <FormList results={value} /> : "-",
            width: 130,
            resizable: false,
            comparator: compareForm,
            hide: seasonId === "1"
        },
    ]);

    const handleRowClicked = (event: RowClickedEvent) => {
        const rowData: RowData = event.data;
        if (seasonId) {
            navigate(`/season/${seasonId}/player/${rowData._id}`);
        }
        else {
            navigate(`/user/${rowData._id}`);
        }
    }

    const getRowData = (): RowData[] => {
        if (userData && statData) {
            let previousElo = -1;
            let currentRank = 0;
            return userData.map<RowData>((elem, index, array) => {
                const isEqualToPreviousElo = elem.elo === previousElo;

                if (!isEqualToPreviousElo) {
                    currentRank = index + 1;
                    previousElo = elem.elo;
                }

                const ranking = currentRank;

                const displayRank = isEqualToPreviousElo ? "-" : ranking;

                const myStats: IAllStats | undefined = statData[elem.username];
                const games = myStats?.results;

                let wins: number = myStats?.wins ?? 0;
                let ties: number = myStats?.ties ?? 0;
                let losses: number = myStats?.losses ?? 0;

                const played = games?.length ?? 0;

                return {
                    _id: elem._id,
                    ranking: displayRank,
                    name: elem.username,
                    played: played,
                    winPercentage: myStats?.winPer ?? 0,
                    wins: wins,
                    ties: ties,
                    losses: losses,
                    elo: elem.elo,
                    results: myStats?.results ?? [],
                };
            }).filter((elem: RowData) => elem.played > 0);
        }
        return [];
    };

    return (
        <AgGridProvider modules={modules}>
            <div style={{ height: '65vh' }}>
                <AgGridReact
                    theme={theme}
                    rowData={getRowData()}
                    columnDefs={colDefs}
                    onRowClicked={handleRowClicked}
                />
            </div>
        </AgGridProvider>
    )
};

export default AgScoreboard;