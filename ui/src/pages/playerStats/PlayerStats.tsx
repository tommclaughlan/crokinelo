import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Page from "../../layouts/Page";
import LoadingSpinner from "../../components/loadingSpinner/LoadingSpinner";
import FormList from "../../components/formList/FormList";
import {
  useFetchAllStats,
  useFetchGames,
  useFetchUsers,
} from "../../services/apiService";
import {
  IGamesResponse,
  IGame,
  IUser,
  IAllStats,
} from "../../services/apiTypes";
import EloChart, { ChartData } from "../../components/eloChart/eloChart";
import { useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import { bottts } from "@dicebear/collection";

const STARTING_ELO: number = 1000;

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
    <div className="player-overview-value font-bold text-xl truncate max-w-full">
      {children}
    </div>
  </div>
);

const GameCard = ({
  game,
  currentPlayer,
  elo,
  eloDiff,
}: {
  game: IGame;
  currentPlayer?: string;
  elo: number;
  eloDiff: string;
}) => {
  const currentPlayerIndex = [...game.teams[0], ...game.teams[1]].findIndex(
    (username) => username === currentPlayer
  );
  const isOneVOne = game.teams[0].length === 1 && game.teams[1].length === 1;

  return (
    <div className="grid mb:grid-rows-4 sm:grid-cols-9 mb-4 gap-3 border border-border-lilac border-b-1 border-t-0 border-r-0 border-l-0 justify-center">
      <div className="sm:col-span-6">
        <div className="font-semibold text-base grid grid-cols-3 game-results">
          <div className="no-wrap team-one">
            <div
              className={"truncate" + (currentPlayerIndex === 0 ? "font-bold" : "")}
            >
              {game.teams[0][0]}
            </div>
            {isOneVOne ? null : (
              <div className="invisible sm:visible">&nbsp;&&nbsp;</div>
            )}
            <div
              className={"truncate" + (currentPlayerIndex === 1 ? "font-bold" : "")}
            >
              {game.teams[0][1]}
            </div>
          </div>
          <div className="no-wrap score font-bold">{`${game.score[0]}-${game.score[1]}`}</div>
          <div className="no-wrap team-two">
            <div
              className={"truncate" + (currentPlayerIndex === 2 ? "font-bold" : "")}
            >
              {game.teams[1][0]}
            </div>
            {isOneVOne ? null : (
              <div className="is-hidden-mobile">&nbsp;&&nbsp;</div>
            )}
            <div
              className={"truncate" + (currentPlayerIndex === 3 ? "font-bold" : "")}
            >
              {game.teams[1][1]}
            </div>
          </div>
        </div>
      </div>
      <div className="text-2xl text-center">{elo}</div>
      <div className="text-2xl text-center">
        <span className={getEloColor(eloDiff)}>{eloDiff}</span>
      </div>
      <div className="text-base text-center">
        {`${formatDate(game.creationDate)} - ${formatTime(game.creationDate)}`}
      </div>
    </div>
  );
};
export interface IGameStats extends IGame {
  eloDiff: string;
}

const processGames = (
  games: IGamesResponse,
  currentPlayer: string
): IGameStats[] => {
  return games.map((game, index) => {
    const currentElo = game.newElos[currentPlayer];
    const previousElo =
      index < games.length - 1
        ? games[index + 1].newElos[currentPlayer]
        : STARTING_ELO;
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
  return games
    .map((d) => d)
    .reverse()
    .map((game, index) => {
      return { t: index, elo: game.newElos[currentPlayer ?? ""] };
    });
};

const renderRecentGames = (games: IGamesResponse, currentPlayer?: string) => {
  let processedGames: IGameStats[] = [];
  let filteredGames: any[] = currentPlayer
    ? games.filter(
        (game) =>
          game.teams[0].includes(currentPlayer) ||
          game.teams[1].includes(currentPlayer)
      )
    : [];
  if (currentPlayer) {
    processedGames = processGames(filteredGames, currentPlayer);
  }

  return currentPlayer === undefined || games.length === 0 ? (
    <div>No recent games to show</div>
  ) : (
    <div>
      {processedGames.map((game) => (
        <GameCard
          game={game}
          currentPlayer={currentPlayer}
          key={game._id}
          elo={game.newElos[currentPlayer]}
          eloDiff={game.eloDiff}
        />
      ))}
    </div>
  );
};

function PlayerStats() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<IUser | null>(null);
  const [userStats, setUserStats] = useState<IAllStats | null>(null);

  const { data: users, isFetching } = useFetchUsers();
  const { data: stats } = useFetchAllStats();
  const { data: games, isFetching: isGamesFetching } = useFetchGames(id);

  const avatar = useMemo(() => {
    return createAvatar(bottts, {
      size: 256,
      seed: user?.username,
    }).toDataUri();
  }, [user?.username]);

  useEffect(() => {
    setUserStats((user && stats && stats[user.username]) ?? null);
  }, [user, setUserStats, stats]);

  useEffect(() => {
    if (isFetching || !users || !id) {
      return;
    }

    const foundUser =
      users && id ? users.find((data) => data._id === id) ?? null : null;

    setUser(foundUser);

    if (!foundUser) {
      navigate("/not-found");
    }
  }, [isFetching, users, user, id, navigate]);

  const lastGameDate =
    userStats?.results && userStats.results.length > 0
      ? formatDate(userStats.results[0].creationDate)
      : "-";

  let setsFor: number = 0;
  let setsAgainst: number = 0;

  if (games) {
    setsFor = games.reduce((sum: number, game: IGame) => {
      const idx = game.teams.findIndex(
        (team) => team.find((player) => player === user?.username) !== undefined
      );
      return sum + game.score[idx];
    }, 0);

    setsAgainst = games.reduce((sum: number, game: IGame) => {
      const idx = game.teams.findIndex(
        (team) => team.find((player) => player === user?.username) === undefined
      );
      return sum + game.score[idx];
    }, 0);
  }

  if (isFetching && !users) {
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

  return (
    <Page>
      <div className="section px-0 py-0 sm:px-6 sm:py-12">
        <div className="w-full p-3 sm:border border-b border-secondary sm:rounded-xl">
          <div className="grid sm:grid-cols-2 w-full py-4">
            <div className="sm:ml-4">
              <div className="flex">
                <div className="avatar w-50 sm:w-auto flex-wrap">
                  {user?.username ? (
                    <img src={avatar} alt="Avatar" />
                  ) : (
                    <LoadingSpinner />
                  )}
                </div>
                <div className="md:ml-4 w-full">
                  <PlayerDetail label="Username">{user?.username}</PlayerDetail>
                  <PlayerDetail label="Office">
                    {isGamesFetching
                      ? null
                      : user?.userOffice
                      ? user.userOffice
                      : "Newcastle"}
                  </PlayerDetail>
                  <PlayerDetail label="Elo">{user?.elo}</PlayerDetail>
                  <PlayerDetail label="Last Game">{lastGameDate}</PlayerDetail>
                </div>
              </div>
              <div>
                <h2 className="has-text-centered font-bold">
                  ELO History
                </h2>
                <EloChart
                  data={processEloForChart(games ?? [], user?.username)}
                ></EloChart>
              </div>
            </div>
            <div className="ml-4">
              <PlayerDetail label="Games Played">
                {userStats?.gamesCount ?? 0}
              </PlayerDetail>
              <PlayerDetail label="Win Rate">
                {formatWinPercentage(userStats?.winPer ?? 0)}
              </PlayerDetail>
              <PlayerDetail label="Form">
                <FormList results={userStats?.results || []} />
              </PlayerDetail>
              <div>
                <PlayerDetail label="Sets Won">{setsFor}</PlayerDetail>
                <PlayerDetail label="Sets Lost">{setsAgainst}</PlayerDetail>
                <PlayerDetail label="Set Difference">
                  {setsFor - setsAgainst}
                </PlayerDetail>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full p-3 mt-4 sm:border border-secondary rounded-xl">
          <h3 className="player-stat-section-header text-3xl font-semibold mb-3">
            Recent Games
          </h3>
          {isGamesFetching && !games ? (
            <LoadingSpinner />
          ) : (
            renderRecentGames(games ?? [], user?.username)
          )}
        </div>
      </div>
    </Page>
  );
}

export default PlayerStats;
