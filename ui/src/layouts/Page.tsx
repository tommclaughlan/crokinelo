import React, {useState} from "react";
import { QUOTES } from "./constants";
import { ReactComponent as HomeSvg } from '../icons/home-icon.svg';

import "./Page.css";
import {useNavigate, useParams} from "react-router-dom";
import Modal from "../components/modal/Modal";
import Rules from "../components/rules/Rules";
import {CURRENT_SEASON} from "../services/apiService";

const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

interface PageProps {
    children?: React.ReactNode;
}

function Page({ children }: PageProps) {
    const navigate = useNavigate();
    const [showRules, setShowRules] = useState(false);
    const seasonId = useParams().seasonId;

    const handleSeasonSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const season = event.target.value;
        if (parseInt(season) === CURRENT_SEASON) {
            navigate("/", { replace: true });
            return;
        }
        navigate(`/season/${season}`, { replace: true });
    }

    const renderSeasonSelect = () => {
        const options = [];
        for (let season=1; season<=CURRENT_SEASON; season++) {
            options.push(<option className="text-black" value={season} key={season}>{season}</option>);
        }
        return (
            <div className="p-4 w-full text-right">
                <label htmlFor="seasons" className="p-4">Season</label>
                <select name="seasons" className="text-black bg-white p-4"  value={seasonId ?? CURRENT_SEASON} onSelectCapture={handleSeasonSelect} onChange={handleSeasonSelect}>
                    {options}
                </select>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center">
            <Modal show={showRules} handleClose={() => setShowRules(false)}>
                <Rules setShowRules={setShowRules} />
            </Modal>
            <div className="bg-primary text-white sm:py-2 flex flex-row justify-between items-center header">
                <span className="flex flex-row space-x-4">
                    <HomeSvg onClick={() => navigate("/")} className="home-icon cursor-pointer"></HomeSvg>
                </span>
                <div className="text-center flex-grow-1 max-w-[75%]">
                    <p className="text-3xl font-semibold truncate" title={randomQuote}>{randomQuote}</p>
                    <p className="text-xl opacity-65 hidden sm:block">
                        Puttin' croks in 'oles since 2024
                    </p>
                </div>
                <div onClick={() => setShowRules(true)} className="cursor-pointer text-2xl text-white-50 font-bold">?</div>
            </div>
            <div className="container page-body flex flex-col">
                {renderSeasonSelect()}
                {children}
            </div>
        </div>
    );
}

export default Page;
