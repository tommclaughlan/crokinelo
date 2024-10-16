import { useState } from "react";
import Scoreboard from "../../components/scoreboard/Scoreboard";
import Modal from "../../components/modal/Modal";
import RegisterUser from "../../components/registerUser/RegisterUser";
import SubmitScore from "../../components/submitScore/SubmitScore";
import LatestGames from "../../components/latestGames/LatestGames";
import Page from "../../layouts/Page";

import "./Home.css";

function Home() {
  const [showRegister, setShowRegister] = useState(false);
  const [showSubmit, setShowSubmitScore] = useState(false);
  const [showSubmit1v1, setShowSubmit1v1Score] = useState(false);

  const button = (classes: string, text: string, callback: Function) => {
    return (
      <button
        className={classes + " p-2 rounded-md m-2"}
        type="button"
        onClick={() => callback(true)}
      >
        {text}
      </button>
    );
  };

  return (
    <>
      <Modal show={showRegister} handleClose={() => setShowRegister(false)}>
        <RegisterUser setShowRegister={setShowRegister} />
      </Modal>
      <Modal show={showSubmit} handleClose={() => setShowSubmitScore(false)}>
        <SubmitScore setShowSubmitScore={setShowSubmitScore} is1v1={false} />
      </Modal>
      <Modal
        show={showSubmit1v1}
        handleClose={() => setShowSubmit1v1Score(false)}
      >
        <SubmitScore setShowSubmitScore={setShowSubmit1v1Score} is1v1={true} />
      </Modal>
      <Page>
        <div className="py-2 md:py-12">
          <div className="flex flex-col md:flex-row">
            <div className="flex flex-col">
              {button(
                "bg-secondary",
                "Submit 1v1 Result",
                setShowSubmit1v1Score
              )}
              {button("bg-secondary", "Submit 2v2 Result", setShowSubmitScore)}
              {button("bg-tertiary", "Register User", setShowRegister)}
            </div>
            <div className="flex-grow">
              <LatestGames />
            </div>
          </div>
        </div>
        <Scoreboard />
      </Page>
    </>
  );
}

export default Home;
