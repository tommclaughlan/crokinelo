import { useState } from "react";
import AgScoreboard from "../../components/ag-scoreboard/AgScoreboard";
import Modal from "../../components/modal/Modal";
import RegisterUser from "../../components/registerUser/RegisterUser";
import SubmitScore from "../../components/submitScore/SubmitScore";
import LatestGamesTicker from "../../components/latestGames/LatestGamesTicker";
import Page from "../../layouts/Page";

import "./Home.css";
import SubmitButton from "../../components/submit-button/SubmitButton";

function Home() {
  const [showRegister, setShowRegister] = useState(false);
  const [showSubmit, setShowSubmitScore] = useState(false);
  const [showSubmit1v1, setShowSubmit1v1Score] = useState(false);

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
        <div className="pb-10">
          <Page>
            <div className=" py-5 flex flex-col sm:flex-row gap-5">
                <SubmitButton onClick={() => setShowSubmit1v1Score(true)} text={"Submit 1v1"} />
                <SubmitButton onClick={() => setShowSubmitScore(true)} text={"Submit 2v2"} />
                <SubmitButton onClick={() => setShowRegister(true)} text={"Register"} type={"secondary"} />
            </div>
            <AgScoreboard />
          </Page>
        </div>
      <LatestGamesTicker />
    </>
  );
}

export default Home;
