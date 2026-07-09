import {useParams} from "react-router-dom";
import Page from "../../layouts/Page";
import Scoreboard from "../../components/scoreboard/Scoreboard";


function SeasonStats() {
    const id = useParams().seasonId;

    return (
        <div className="pb-10" key={id}>
            <Page>
                <h1 className="h-14 text-4xl p-3">Season {id} scoreboard</h1>
                <Scoreboard seasonId={id}/>
            </Page>
        </div>
    );
}

export default SeasonStats;
