import { useEffect, useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import { bottts } from "@dicebear/collection";
import { useNavigate, useParams } from "react-router-dom";
import EloChart, { ChartData } from "../../components/eloChart/eloChart";
import FormList from "../../components/formList/FormList";
import LoadingSpinner from "../../components/loadingSpinner/LoadingSpinner";
import Page from "../../layouts/Page";
import {
	useFetchAllStats,
	useFetchGames,
	useFetchUsers,
} from "../../services/apiService";
import { IAllStats, IGame, IGamesResponse, IUser } from "../../services/apiTypes";

const STARTING_ELO = 1000;

interface IGameStats extends IGame {
	eloDiff: string;
}

interface IPointTotals {
	pointsFor: number;
	pointsAgainst: number;
}

interface IHeadToHeadSummary {
	playerOneWins: number;
	playerTwoWins: number;
	draws: number;
	sameTeamGames: number;
}

const formatWinPercentage = (winPer: number) => `${(winPer * 100).toFixed(2)}%`;
const formatDate = (date: string) => new Date(date).toLocaleDateString("en-UK");
const formatTime = (date: string) =>
	new Date(date).toLocaleTimeString("en-UK").slice(0, 5);

const getEloColor = (eloDiff: string) => {
	if (eloDiff === "+0") {
		return "text-black";
	}
	if (eloDiff[0] === "+") {
		return "text-accent-green";
	}
	return "text-accent-red";
};

const PlayerDetail = ({
	label,
	children,
}: {
	label: string;
	children?: React.ReactNode;
}) => (
	<div className="player-overview-col flex justify-between border border-border-lilac border-b-1 border-t-0 border-r-0 border-l-0">
		<div className="player-overview-label text-base pr-1">{`${label}: `}</div>
		<div className="player-overview-value text-xl truncate max-w-full">{children}</div>
	</div>
);

const processGames = (games: IGamesResponse, currentPlayer: string): IGameStats[] => {
	return games
		.filter(
			(game) =>
				game.teams[0].includes(currentPlayer) || game.teams[1].includes(currentPlayer)
		)
		.slice(0, 20)
		.map((game, index, arr) => {
			const currentElo = game.newElos[currentPlayer];
			const previousElo =
				index < arr.length - 1 ? arr[index + 1].newElos[currentPlayer] : STARTING_ELO;
			const eloDiff = currentElo - previousElo;

			return {
				...game,
				eloDiff: eloDiff >= 0 ? `+${eloDiff}` : `${eloDiff}`,
			};
		});
};

const processEloForChart = (
	games: IGamesResponse,
	currentPlayer?: string
): ChartData[] => {
	if (!currentPlayer) {
		return [];
	}

	return games
		.filter(
			(game) =>
				game.teams[0].includes(currentPlayer) || game.teams[1].includes(currentPlayer)
		)
		.slice(0, 20)
		.reverse()
		.map((game, index) => {
			return { t: index, elo: game.newElos[currentPlayer] };
		});
};

const calculatePointTotals = (games: IGamesResponse, currentPlayer?: string): IPointTotals => {
	if (!currentPlayer) {
		return {
			pointsFor: 0,
			pointsAgainst: 0,
		};
	}

	return games.reduce(
		(acc, game) => {
			const playerTeamIndex = game.teams.findIndex((team) => team.includes(currentPlayer));

			if (playerTeamIndex === -1) {
				return acc;
			}

			const opponentTeamIndex = playerTeamIndex === 0 ? 1 : 0;

			return {
				pointsFor: acc.pointsFor + game.score[playerTeamIndex],
				pointsAgainst: acc.pointsAgainst + game.score[opponentTeamIndex],
			};
		},
		{
			pointsFor: 0,
			pointsAgainst: 0,
		}
	);
};

const getSharedGames = (
	gamesOne: IGamesResponse,
	gamesTwo: IGamesResponse,
	playerOne?: string,
	playerTwo?: string
): IGame[] => {
	if (!playerOne || !playerTwo) {
		return [];
	}

	const gameIds = new Set(gamesTwo.map((game) => game._id));

	return gamesOne
		.filter((game) => {
			if (!gameIds.has(game._id)) {
				return false;
			}

			const allPlayers = [...game.teams[0], ...game.teams[1]];
			return allPlayers.includes(playerOne) && allPlayers.includes(playerTwo);
		})
		.sort(
			(a, b) =>
				new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()
		);
};

const summarizeHeadToHead = (
	sharedGames: ReadonlyArray<IGame>,
	playerOne?: string,
	playerTwo?: string
): IHeadToHeadSummary => {
	if (!playerOne || !playerTwo) {
		return {
			playerOneWins: 0,
			playerTwoWins: 0,
			draws: 0,
			sameTeamGames: 0,
		};
	}

	return sharedGames.reduce(
		(acc, game) => {
			const teamOne = game.teams[0];
			const teamTwo = game.teams[1];
			const playerOneTeam = teamOne.includes(playerOne) ? 0 : teamTwo.includes(playerOne) ? 1 : -1;
			const playerTwoTeam = teamOne.includes(playerTwo) ? 0 : teamTwo.includes(playerTwo) ? 1 : -1;

			if (playerOneTeam === -1 || playerTwoTeam === -1) {
				return acc;
			}

			if (playerOneTeam === playerTwoTeam) {
				return {
					...acc,
					sameTeamGames: acc.sameTeamGames + 1,
				};
			}

			if (game.score[playerOneTeam] === game.score[playerTwoTeam]) {
				return {
					...acc,
					draws: acc.draws + 1,
				};
			}

			if (game.score[playerOneTeam] > game.score[playerTwoTeam]) {
				return {
					...acc,
					playerOneWins: acc.playerOneWins + 1,
				};
			}

			return {
				...acc,
				playerTwoWins: acc.playerTwoWins + 1,
			};
		},
		{
			playerOneWins: 0,
			playerTwoWins: 0,
			draws: 0,
			sameTeamGames: 0,
		}
	);
};

const getLastGameDate = (stats?: IAllStats | null) => {
	if (!stats?.results?.length) {
		return "-";
	}
	return formatDate(stats.results[0].creationDate);
};

const GameRow = ({
	game,
	player,
	elo,
	eloDiff,
}: {
	game: IGame;
	player?: string;
	elo: number;
	eloDiff: string;
}) => {
	const allPlayers = [...game.teams[0], ...game.teams[1]];
	const playerIndex = player ? allPlayers.findIndex((username) => username === player) : -1;
	const isOneVOne = game.teams[0].length === 1 && game.teams[1].length === 1;

	return (
		<div className="grid mb:grid-rows-4 sm:grid-cols-9 mb-4 gap-3 border border-border-lilac border-b-1 border-t-0 border-r-0 border-l-0 justify-center">
			<div className="sm:col-span-6">
				<div className="text-lg grid grid-cols-3 game-results">
					<div className="no-wrap team-one">
						<div className={playerIndex === 0 ? "truncate font-bold" : "truncate"}>
							{game.teams[0][0]}
						</div>
						{isOneVOne ? null : <div className="invisible sm:visible">&nbsp;&amp;&amp;&nbsp;</div>}
						<div className={playerIndex === 1 ? "truncate font-bold" : "truncate"}>
							{game.teams[0][1]}
						</div>
					</div>
					<div className="no-wrap score text-2xl">{`${game.score[0]}-${game.score[1]}`}</div>
					<div className="no-wrap team-two">
						<div className={playerIndex === 2 ? "truncate font-bold" : "truncate"}>
							{game.teams[1][0]}
						</div>
						{isOneVOne ? null : <div className="is-hidden-mobile">&nbsp;&amp;&amp;&nbsp;</div>}
						<div className={playerIndex === 3 ? "truncate font-bold" : "truncate"}>
							{game.teams[1][1]}
						</div>
					</div>
				</div>
			</div>
			<div className="text-3xl text-center">{elo}</div>
			<div className="text-xl text-center">
				<span className={getEloColor(eloDiff)}>{eloDiff}</span>
			</div>
			<div className="text-base text-center">
				{`${formatDate(game.creationDate)} - ${formatTime(game.creationDate)}`}
			</div>
		</div>
	);
};

const SharedGameRow = ({ game, playerOne, playerTwo }: { game: IGame; playerOne?: string; playerTwo?: string }) => {
	const allPlayers = [...game.teams[0], ...game.teams[1]];
	const highlights = new Set([playerOne, playerTwo]);

	return (
		<div className="mb-4 border border-border-lilac border-b-1 border-t-0 border-r-0 border-l-0 pb-2">
			<div className="text-lg grid grid-cols-3 game-results">
				<div className="no-wrap team-one">
					{game.teams[0].map((name) => (
						<div key={`${game._id}-${name}`} className={highlights.has(name) ? "font-bold truncate" : "truncate"}>
							{name}
						</div>
					))}
				</div>
				<div className="no-wrap score text-2xl text-center">{`${game.score[0]}-${game.score[1]}`}</div>
				<div className="no-wrap team-two">
					{game.teams[1].map((name) => (
						<div key={`${game._id}-${name}`} className={highlights.has(name) ? "font-bold truncate" : "truncate"}>
							{name}
						</div>
					))}
				</div>
			</div>
			<div className="text-sm text-center mt-1">{`${formatDate(game.creationDate)} - ${formatTime(game.creationDate)}`}</div>
			{allPlayers.includes(playerOne ?? "") && allPlayers.includes(playerTwo ?? "") ? null : (
				<div className="text-xs text-center text-accent-red">Unexpected shared game data</div>
			)}
		</div>
	);
};

const CombinedStatLine = ({
	label,
	leftValue,
	rightValue,
	leftCompareValue,
	rightCompareValue,
	preferLowerBetter = false,
}: {
	label: string;
	leftValue?: React.ReactNode;
	rightValue?: React.ReactNode;
	leftCompareValue?: number;
	rightCompareValue?: number;
	preferLowerBetter?: boolean;
}) => (
	<div className="grid grid-cols-3 gap-3 items-center border border-border-lilac border-b-1 border-t-0 border-r-0 border-l-0 py-2">
		<div
			className={`text-center text-xl truncate ${
				leftCompareValue === undefined || rightCompareValue === undefined
					? ""
					: leftCompareValue === rightCompareValue
					? "text-black"
					: preferLowerBetter
					? leftCompareValue < rightCompareValue
						? "text-accent-green"
						: "text-accent-red"
					: leftCompareValue > rightCompareValue
					? "text-accent-green"
					: "text-accent-red"
			}`}
		>
			{leftValue}
		</div>
		<div className="text-center text-base font-semibold">{label}</div>
		<div
			className={`text-center text-xl truncate ${
				leftCompareValue === undefined || rightCompareValue === undefined
					? ""
					: leftCompareValue === rightCompareValue
					? "text-black"
					: preferLowerBetter
					? rightCompareValue < leftCompareValue
						? "text-accent-green"
						: "text-accent-red"
					: rightCompareValue > leftCompareValue
					? "text-accent-green"
					: "text-accent-red"
			}`}
		>
			{rightValue}
		</div>
	</div>
);

const PlayerPanel = ({
	user,
	userStats,
	games,
	avatar,
	showContainer = true,
	showChart = true,
	showStats = true,
	mirrorLayout = false,
}: {
	user?: IUser | null;
	userStats?: IAllStats | null;
	games: IGamesResponse;
	avatar: string;
	showContainer?: boolean;
	showChart?: boolean;
	showStats?: boolean;
	mirrorLayout?: boolean;
}) => {
	const points = calculatePointTotals(games, user?.username);

	return (
		<div
			className={
				showContainer
					? "w-full h-full p-3 sm:border border-b border-secondary sm:rounded-xl"
					: "w-full h-full p-4"
			}
		>
		<div className={`flex items-center justify-center${mirrorLayout ? " flex-row-reverse" : ""}`}>
			<div className="avatar w-20 sm:w-auto flex-wrap p-2">
				{user?.username ? <img src={avatar} alt="Avatar" /> : <LoadingSpinner />}
			</div>
			<div className={mirrorLayout ? "md:mr-4 w-full max-w-md" : "md:ml-4 w-full max-w-md"}>
					<PlayerDetail label="Username">{user?.username ?? "-"}</PlayerDetail>
					<PlayerDetail label="Elo">{user?.elo ?? 0}</PlayerDetail>
					<PlayerDetail label="Last Game">{getLastGameDate(userStats)}</PlayerDetail>
				</div>
			</div>

			{showChart ? (
				<div className="mt-4">
					<h2 className="has-text-centered font-bold">ELO History</h2>
					<EloChart data={processEloForChart(games, user?.username)}></EloChart>
				</div>
			) : null}

			{showStats ? (
				<div className="mt-4">
					<PlayerDetail label="Games Played">{userStats?.gamesCount ?? 0}</PlayerDetail>
					<PlayerDetail label="Win Rate">{formatWinPercentage(userStats?.winPer ?? 0)}</PlayerDetail>
					<PlayerDetail label="Form">
						<FormList results={userStats?.results || []} />
					</PlayerDetail>
					<PlayerDetail label="Points Won">{points.pointsFor}</PlayerDetail>
					<PlayerDetail label="Points Conceded">{points.pointsAgainst}</PlayerDetail>
					<PlayerDetail label="Point Difference">{points.pointsFor - points.pointsAgainst}</PlayerDetail>
				</div>
			) : null}
		</div>
	);
};

function PlayerComparison() {
	const { id1, id2, seasonId } = useParams();
	const navigate = useNavigate();

	const { data: users, isFetching: isUsersFetching } = useFetchUsers(seasonId);
	const { data: allStats, isFetching: isStatsFetching } = useFetchAllStats(seasonId);
	const { data: gamesOne, isFetching: isGamesOneFetching } = useFetchGames(id1, seasonId);
	const { data: gamesTwo, isFetching: isGamesTwoFetching } = useFetchGames(id2, seasonId);

	const playerOne = useMemo(
		() => (users && id1 ? users.find((user) => user._id === id1) ?? null : null),
		[users, id1]
	);
	const playerTwo = useMemo(
		() => (users && id2 ? users.find((user) => user._id === id2) ?? null : null),
		[users, id2]
	);

	useEffect(() => {
		if (isUsersFetching || !users) {
			return;
		}

		if (!id1 || !id2 || !playerOne || !playerTwo) {
			navigate("/not-found");
		}
	}, [id1, id2, isUsersFetching, navigate, playerOne, playerTwo, users]);

	const playerOneStats = playerOne && allStats ? allStats[playerOne.username] ?? null : null;
	const playerTwoStats = playerTwo && allStats ? allStats[playerTwo.username] ?? null : null;

	const playerOneAvatar = useMemo(() => {
		return createAvatar(bottts, {
			size: 256,
			seed: playerOne?.username,
		}).toDataUri();
	}, [playerOne?.username]);

	const playerTwoAvatar = useMemo(() => {
		return createAvatar(bottts, {
			size: 256,
			seed: playerTwo?.username,
		}).toDataUri();
	}, [playerTwo?.username]);

	const sharedGames = useMemo(
		() =>
			getSharedGames(
				gamesOne ?? [],
				gamesTwo ?? [],
				playerOne?.username,
				playerTwo?.username
			),
		[gamesOne, gamesTwo, playerOne?.username, playerTwo?.username]
	);

	const headToHead = useMemo(
		() => summarizeHeadToHead(sharedGames, playerOne?.username, playerTwo?.username),
		[playerOne?.username, playerTwo?.username, sharedGames]
	);

	const pointsOne = useMemo(
		() => calculatePointTotals(gamesOne ?? [], playerOne?.username),
		[gamesOne, playerOne?.username]
	);
	const pointsTwo = useMemo(
		() => calculatePointTotals(gamesTwo ?? [], playerTwo?.username),
		[gamesTwo, playerTwo?.username]
	);

	const playerOneChart = useMemo(
		() => processEloForChart(gamesOne ?? [], playerOne?.username),
		[gamesOne, playerOne?.username]
	);
	const playerTwoChart = useMemo(
		() => processEloForChart(gamesTwo ?? [], playerTwo?.username),
		[gamesTwo, playerTwo?.username]
	);

	const isLoading =
		(isUsersFetching && !users) ||
		(isStatsFetching && !allStats) ||
		(isGamesOneFetching && !gamesOne) ||
		(isGamesTwoFetching && !gamesTwo);

	if (isLoading) {
		return (
			<Page>
				<div className="section">
					<div className="container">
						<LoadingSpinner />
					</div>
				</div>
			</Page>
		);
	}

	if (!playerOne || !playerTwo) {
		return null;
	}

	const areSamePlayers = playerOne._id === playerTwo._id;

	return (
		<Page>
			<div className="section px-0 py-0 sm:px-6 sm:py-12">
				<div className="w-full p-3 mb-4 sm:border border-secondary rounded-xl">
					<h1 className="text-3xl font-semibold">Player Comparison</h1>
					<div className="text-base mt-2">
						{playerOne.username} vs {playerTwo.username}
					</div>
					{areSamePlayers ? (
						<div className="text-accent-red mt-2">
							Please choose two different players to compare.
						</div>
					) : null}
				</div>

				<div className="w-full p-3 sm:border border-secondary rounded-xl">
					<div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-0 divide-y xl:divide-y-0 xl:divide-x divide-border-lilac">
					<PlayerPanel
						user={playerOne}
						userStats={playerOneStats}
						games={gamesOne ?? []}
						avatar={playerOneAvatar}
						showContainer={false}
						showChart={false}
						showStats={false}
					/>
					<PlayerPanel
						user={playerTwo}
						userStats={playerTwoStats}
						games={gamesTwo ?? []}
						avatar={playerTwoAvatar}
						showContainer={false}
						showChart={false}
						showStats={false}
						mirrorLayout
					/>
					</div>

					<div className="mt-4">
						<h2 className="has-text-centered font-bold">ELO History</h2>
						<EloChart
							data={playerOneChart}
							comparisonData={playerTwoChart}
							primaryLabel={playerOne.username}
							secondaryLabel={playerTwo.username}
						/>
					</div>

					<div className="mt-4">
						<CombinedStatLine
							label="Elo"
							leftValue={playerOne.elo}
							rightValue={playerTwo.elo}
							leftCompareValue={playerOne.elo}
							rightCompareValue={playerTwo.elo}
						/>
						<CombinedStatLine
							label="Games Played"
							leftValue={playerOneStats?.gamesCount ?? 0}
							rightValue={playerTwoStats?.gamesCount ?? 0}
							leftCompareValue={playerOneStats?.gamesCount ?? 0}
							rightCompareValue={playerTwoStats?.gamesCount ?? 0}
						/>
						<CombinedStatLine
							label="Win Rate"
							leftValue={formatWinPercentage(playerOneStats?.winPer ?? 0)}
							rightValue={formatWinPercentage(playerTwoStats?.winPer ?? 0)}
							leftCompareValue={playerOneStats?.winPer ?? 0}
							rightCompareValue={playerTwoStats?.winPer ?? 0}
						/>
						<CombinedStatLine
							label="Form"
							leftValue={<FormList results={playerOneStats?.results || []} />}
							rightValue={<FormList results={playerTwoStats?.results || []} />}
						/>
						<CombinedStatLine
							label="Points Won"
							leftValue={pointsOne.pointsFor}
							rightValue={pointsTwo.pointsFor}
							leftCompareValue={pointsOne.pointsFor}
							rightCompareValue={pointsTwo.pointsFor}
						/>
						<CombinedStatLine
							label="Points Conceded"
							leftValue={pointsOne.pointsAgainst}
							rightValue={pointsTwo.pointsAgainst}
							leftCompareValue={pointsOne.pointsAgainst}
							rightCompareValue={pointsTwo.pointsAgainst}
							preferLowerBetter
						/>
						<CombinedStatLine
							label="Point Difference"
							leftValue={pointsOne.pointsFor - pointsOne.pointsAgainst}
							rightValue={pointsTwo.pointsFor - pointsTwo.pointsAgainst}
							leftCompareValue={pointsOne.pointsFor - pointsOne.pointsAgainst}
							rightCompareValue={pointsTwo.pointsFor - pointsTwo.pointsAgainst}
						/>
					</div>
				</div>

				<div className="w-full p-3 mt-4 sm:border border-secondary rounded-xl">
					<h3 className="text-3xl font-semibold mb-3">Shared Games</h3>
					<div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
						<PlayerDetail label={`${playerOne.username} Wins`}>
							{headToHead.playerOneWins}
						</PlayerDetail>
						<PlayerDetail label={`${playerTwo.username} Wins`}>
							{headToHead.playerTwoWins}
						</PlayerDetail>
						<PlayerDetail label="Draws">{headToHead.draws}</PlayerDetail>
						<PlayerDetail label="Same Team Games">
							{headToHead.sameTeamGames}
						</PlayerDetail>
					</div>

					{sharedGames.length === 0 ? (
						<div>No shared games found for this pair.</div>
					) : (
						sharedGames.slice(0, 20).map((game) => (
							<SharedGameRow
								key={`shared-${game._id}`}
								game={game}
								playerOne={playerOne.username}
								playerTwo={playerTwo.username}
							/>
						))
					)}
				</div>
			</div>
		</Page>
	);
}

export default PlayerComparison;
