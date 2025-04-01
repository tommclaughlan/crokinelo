import { useFormik } from "formik";
import { useQueryClient } from "react-query";
import Select from "react-select";
import {
  useFetchAllStats,
  useFetchUsers,
  useSubmitResult,
} from "../../services/apiService";

import LoadingSpinner from "../loadingSpinner/LoadingSpinner";
import { I1v1GameForm, IGameForm, IUser } from "../../services/apiTypes";

const gameFormToGameRequest = (game: IGameForm) => ({
  teams: [
    {
      players: [game.teamOnePlayerOne, game.teamOnePlayerTwo],
      score: game.teamOneScore,
    },
    {
      players: [game.teamTwoPlayerOne, game.teamTwoPlayerTwo],
      score: game.teamTwoScore,
    },
  ],
});

const gameFormToGameRequest1v1 = (game: I1v1GameForm) => ({
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
  is1v1: boolean;
}

function SubmitScore({ setShowSubmitScore, is1v1 }: SubmitScoreProps) {
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
      teamOnePlayerTwo: "",
      teamTwoPlayerOne: "",
      teamTwoPlayerTwo: "",
      scoreMin: "",
      players: "",
    },
    validate: (values) => {
      const errors: {
        scoreMin?: string;
        players?: string;
      } = {};
      if (values.teamOneScore < 0 || values.teamTwoScore < 0) {
        errors.scoreMin = "Score cannot be below 0!";
      }
      const players = is1v1
        ? new Set([values.teamOnePlayerOne, values.teamTwoPlayerOne])
        : new Set([
            values.teamOnePlayerOne,
            values.teamOnePlayerTwo,
            values.teamTwoPlayerOne,
            values.teamTwoPlayerTwo,
          ]);

      if ((!is1v1 && players.size !== 4) || (is1v1 && players.size !== 2)) {
        errors.players = "All players must be filled in";
      }
      return errors;
    },
    onSubmit: (values) => {
      if (is1v1) {
        submitResult([gameFormToGameRequest1v1(values)]);
      } else {
        submitResult([gameFormToGameRequest(values)]);
      }
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
      <div className="bg-white rounded-lg shadow-2xl m-4">
        <header className="border-b border-secondary p-4">
          <p className="text-2xl">
            Submit Score
          </p>
        </header>
        <section className="p-4">
          <form>
            <div className="flex flex-row items-center justify-center p-2">
              <div>
                <div className="flex flex-row">
                  <div className="flex flex-col">
                    <label htmlFor="teamOneScore" className="p-4">
                      {is1v1 ? "Player One" : "Team One"}
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
                    <label className="p-4" htmlFor="teamTwoScore">
                      {is1v1 ? "Player Two" : "Team Two"}
                    </label>
                  </div>
                </div>
              </div>
            </div>
            {formik.errors.scoreMin ? (
              <div className="text-center text-accent-red p-2">
                {formik.errors.scoreMin}
              </div>
            ) : null}
            <div className="flex flex-row">
              <div className="flex flex-col flex-grow">
                <div className="p-2">
                  <Select
                    className="border border-secondary rounded-md"
                    placeholder="Player One"
                    menuPortalTarget={document.body}
                    options={formatOptions(users ?? [])}
                    onChange={(selected) => {
                      formik.setFieldValue("teamOnePlayerOne", selected?.value);
                    }}
                  />
                </div>
                {is1v1 ? null : (
                  <div className="p-2">
                    <Select
                      className="border border-secondary rounded-md"
                      placeholder="Player Two"
                      menuPortalTarget={document.body}
                      options={formatOptions(users ?? [])}
                      onChange={(selected) => {
                        formik.setFieldValue(
                          "teamOnePlayerTwo",
                          selected?.value
                        );
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-col flex-grow">
                <div className="p-2">
                  <Select
                    className="border border-secondary rounded-md"
                    placeholder={is1v1 ? "Player Two" : "Player One"}
                    menuPortalTarget={document.body}
                    options={formatOptions(users ?? [])}
                    onChange={(selected) => {
                      formik.setFieldValue("teamTwoPlayerOne", selected?.value);
                    }}
                  />
                </div>
                {is1v1 ? null : (
                  <div className="p-2">
                    <Select
                      className="border border-secondary rounded-md"
                      placeholder="Player Two"
                      menuPortalTarget={document.body}
                      options={formatOptions(users ?? [])}
                      onChange={(selected) => {
                        formik.setFieldValue(
                          "teamTwoPlayerTwo",
                          selected?.value
                        );
                      }}
                    />
                  </div>
                )}
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
            {isPostLoading ? <LoadingSpinner size="small" /> : "Submit"}
          </button>
        </footer>
      </div>
    </div>
  );
}

export default SubmitScore;
