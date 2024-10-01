import React from "react";
import { useFormik } from "formik";
import { useQueryClient } from "react-query";
import Select from "react-select";
import {
    useFetchAllStats,
    useFetchUsers,
    useSubmitResult,
} from "../../services/apiService";

import "./submit1v1Score.css";
import LoadingSpinner from "../loadingSpinner/LoadingSpinner";
import {I1v1GameForm, IUser} from "../../services/apiTypes";

const gameFormToGameRequest = (game: I1v1GameForm) => ({
    teams: [
        {
            players: [game.teamOnePlayerOne],
            score: game.teamOneScore,
        },
        {
            players: [game.teamTwoPlayerOne],
            score: game.teamTwoScore,
        },
    ],
});

interface SubmitScoreProps {
    setShowSubmitScore: (isShown: boolean) => void;
}

function Submit1v1Score({ setShowSubmitScore }: SubmitScoreProps) {
    const queryClient = useQueryClient();

    const { data: users } = useFetchUsers();
    const { refetch: refetchAllStats } = useFetchAllStats();

    const { mutate: submitResult, isLoading: isPostLoading } = useSubmitResult({
        onSuccess: (data) => {
            queryClient.setQueryData("users", data.users);
            queryClient.setQueryData("games", data.games);

            refetchAllStats();

            setShowSubmitScore(false);
        },
        onError: (error) => {
            console.log(error);
        },
    });

    const formik = useFormik({
        initialValues: {
            teamOneScore: 0,
            teamTwoScore: 0,
            teamOnePlayerOne: "",
            teamTwoPlayerOne: "",
            score: "",
            players: "",
        },
        validate: (values) => {
            const errors: {
                score?: string;
                players?: string;
            } = {};
            if (values.teamOneScore !== 2 && values.teamTwoScore !== 2) {
                errors.score = "One score must be 2!";
            }
            const players = new Set([
                values.teamOnePlayerOne,
                values.teamTwoPlayerOne,
            ]);
            if (players.size !== 2) {
                errors.players =
                    "All players must be filled in";
            }
            return errors;
        },
        onSubmit: (values) => {
            submitResult([gameFormToGameRequest(values)]);
        },
    });

    const formatOptions = (options: ReadonlyArray<IUser>) => {
        if (options) {
            const formattedOptions = options.map((elem, index, array) => {
                return {
                    label: elem.username,
                    value: elem.username,
                };
            });
            return formattedOptions;
        }
    };

    return (
        <div className="flex flex-col z-10">
            <div className="bg-white rounded-lg shadow-2xl">
                <header className="border-b border-secondary p-4">
                    <p className="text-2xl">
                        Submit Score (Just put 2-0 if you can't remember)
                    </p>
                </header>
                <section className="p-4">
                    <form>
                        <div className="flex flex-row items-center justify-center p-2">
                            <div>
                                <div className="flex flex-row">
                                    <div className="flex flex-col">
                                        <label
                                            className="p-4"
                                            htmlFor="teamOneScore"
                                        >
                                            Player One
                                        </label>
                                    </div>
                                    <input
                                        className="p-2 rounded-lg border border-secondary"
                                        id="teamOneScore"
                                        name="teamOneScore"
                                        type="number"
                                        max={10}
                                        min={0}
                                        onChange={formik.handleChange}
                                        value={formik.values.teamOneScore}
                                    />
                                </div>
                            </div>
                            <div className="pl-6 pr-6">
                                <p className="text-center">-</p>
                            </div>
                            <div>
                                <div className="flex flex-row">
                                    <input
                                        className="p-2 rounded-lg border border-secondary"
                                        id="teamTwoScore"
                                        name="teamTwoScore"
                                        type="number"
                                        max={10}
                                        min={0}
                                        onChange={formik.handleChange}
                                        value={formik.values.teamTwoScore}
                                    />
                                    <div className="flex flex-col">
                                        <label
                                            className="p-4"
                                            htmlFor="teamTwoScore"
                                        >
                                            Player Two
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {formik.errors.score ? (
                            <div className="text-center text-accent-red p-2">
                                {formik.errors.score}
                            </div>
                        ) : null}
                        <div className="flex flex-row">
                            <div className="flex flex-col flex-grow">
                                <div className="p-2">
                                    <Select
                                        className="border border-secondary rounded-md"
                                        placeholder="Player One"
                                        classNames={{
                                            menuPortal: (state) => "z-50",
                                        }}
                                        menuPortalTarget={document.body}
                                        options={formatOptions(users ?? [])}
                                        onChange={(selected) => {
                                            formik.setFieldValue(
                                                "teamOnePlayerOne",
                                                selected?.value
                                            );
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col flex-grow">
                                <div className="p-2">
                                    <Select
                                        className="border border-secondary rounded-md"
                                        placeholder="Player Two"
                                        classNames={{
                                            menuPortal: (state) => "z-50",
                                        }}
                                        menuPortalTarget={document.body}
                                        options={formatOptions(users ?? [])}
                                        onChange={(selected) => {
                                            formik.setFieldValue(
                                                "teamTwoPlayerOne",
                                                selected?.value
                                            );
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        {formik.errors.players ? (
                            <div className="text-center text-accent-red p-2">
                                {formik.errors.players}
                            </div>
                        ) : null}
                    </form>
                </section>
                <footer className="border-t border-secondary text-right">
                    <button
                        className="bg-primary text-white rounded-lg p-2 pl-6 pr-6 m-4"
                        type="button"
                        onClick={formik.submitForm}
                        disabled={isPostLoading}
                    >
                        {isPostLoading ? <LoadingSpinner size="small"/> : "Submit"}
                    </button>
                </footer>
            </div>
        </div>
        );
    }

    export default Submit1v1Score;
