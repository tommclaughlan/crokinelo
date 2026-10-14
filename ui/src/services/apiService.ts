import { UseMutationOptions, useMutation, useQuery } from "react-query";
import {
    AllStatsResponse,
    IGameRequest,
    IGamesResponse,
    IUpdateResponse,
    IUserRequest,
    IUsersResponse,
} from "./apiTypes";

const requestParams: string[] = [];

if (process.env.NODE_ENV !== "production") {
    requestParams.push("test=true");
}

const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL ??
    "https://t6jhp0e39a.execute-api.eu-west-1.amazonaws.com/default/elo";

export const CURRENT_SEASON = 4;

const paramsToString = (params: ReadonlyArray<string>) =>
    params.reduce((acc, param, index) => {
        if (index === 0) {
            acc += "?";
        } else {
            acc += "&";
        }

        acc += param;

        return acc;
    }, "") ?? "";

export const useFetchUsers = (seasonId?: string) => {
    const params = [...requestParams];

    if (seasonId) {
        params.push("usersDb=users" + seasonId);
    }
    return useQuery<IUsersResponse>("users", () =>
        fetch(
            `${API_BASE_URL}/getUsers${paramsToString(params)}`
        ).then((res) => res.json())
    );
}

export const useFetchGames = (id?: string, seasonId?: string) => {
    const params = [...requestParams];

    if (id) {
        params.push(`userId=${id}`);
    }

    if (seasonId) {
        params.push("gamesDb=games" + seasonId);
        params.push("usersDb=users" + seasonId);
    }

    const queryKey = id ? `games-${id}` : "games";

    return useQuery<IGamesResponse>(queryKey, () =>
        fetch(
            `${API_BASE_URL}/retrieveGames${paramsToString(params)}`
        ).then((res) => res.json())
    );
};

export const useFetchAllStats = (seasonId?: string) => {
    const params = [...requestParams];

    if (seasonId) {
        params.push("gamesDb=games" + seasonId);
    }
    return useQuery<AllStatsResponse>("allStats", () =>
        fetch(
            `${API_BASE_URL}/retrieveAllStats${paramsToString(params)}`
        ).then((res) => res.json())
    );
}

export const useRegisterUser = (
    options:
        | Omit<
            UseMutationOptions<IUsersResponse, string, IUserRequest>,
            "mutationFn"
        >
        | undefined
) =>
    useMutation<IUsersResponse, string, IUserRequest>(
        (user) =>
            fetch(
                `${API_BASE_URL}/registerUser${paramsToString(requestParams)}`,
                {
                    mode: "cors",
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: user.username,
                        elo: 1000,
                        userOffice: user.userOffice
                    }),
                }
            ).then((res) => res.json()),
        options
    );

export const useSubmitResult = (
    options:
        | Omit<
            UseMutationOptions<
                IUpdateResponse,
                string,
                ReadonlyArray<IGameRequest>
            >,
            "mutationFn"
        >
        | undefined
) =>
    useMutation<IUpdateResponse, string, ReadonlyArray<IGameRequest>>(
        (games) => {
            return fetch(
                `${API_BASE_URL}/updateElo${paramsToString(requestParams)}`,
                {
                    mode: "cors",
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(games),
                }
            ).then((res) => res.json())
        },
        options
    );
