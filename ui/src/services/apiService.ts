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

export const useFetchUsers = () =>
    useQuery<IUsersResponse>("users", () =>
        fetch(
            `https://t6jhp0e39a.execute-api.eu-west-1.amazonaws.com/default/elo/getUsers${paramsToString(
                requestParams
            )}`
        ).then((res) => res.json())
    );

export const useFetchGames = (id?: string) => {
    const params = [...requestParams];

    if (id) {
        params.push(`userId=${id}`);
    }

    const queryKey = id ? `games-${id}` : "games";

    return useQuery<IGamesResponse>(queryKey, () =>
        fetch(
            `https://t6jhp0e39a.execute-api.eu-west-1.amazonaws.com/default/elo/retrieveGames${paramsToString(
                params
            )}`
        ).then((res) => res.json())
    );
};

export const useFetchAllStats = () =>
    useQuery<AllStatsResponse>("allStats", () =>
        fetch(
            `https://t6jhp0e39a.execute-api.eu-west-1.amazonaws.com/default/elo/retrieveAllStats${paramsToString(
                requestParams
            )}`
        ).then((res) => res.json())
    );

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
                `https://t6jhp0e39a.execute-api.eu-west-1.amazonaws.com/default/elo/registerUser${paramsToString(
                    requestParams
                )}`,
                {
                    mode: "cors",
                    method: "POST",
                    headers: {
                        Accept: "application/json",
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
                `https://t6jhp0e39a.execute-api.eu-west-1.amazonaws.com/default/elo/updateElo${paramsToString(
                    requestParams
                )}`,
                {
                    mode: "cors",
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                    },
                    body: JSON.stringify(games),
                }
            ).then((res) => res.json())
        },
        options
    );
