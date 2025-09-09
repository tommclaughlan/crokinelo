import React, {useState} from "react";
import { QUOTES } from "./constants";
import { ReactComponent as HomeSvg } from '../icons/home-solid.svg';

import "./Page.css";
import {HomeIcon} from "@heroicons/react/24/solid";
import {useNavigate} from "react-router-dom";
import Modal from "../components/modal/Modal";
import Rules from "../components/rules/Rules";

const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

interface PageProps {
    children?: React.ReactNode;
}

function Page({ children }: PageProps) {
    const navigate = useNavigate();
    const [showRules, setShowRules] = useState(false);
    return (
        <div className="flex flex-col items-center">
            <Modal show={showRules} handleClose={() => setShowRules(false)}>
                <Rules setShowRules={setShowRules} />
            </Modal>
            <div className="bg-primary text-white sm:py-2 flex flex-row justify-between items-center header">
                <HomeSvg onClick={() => navigate("/")} className="home-icon cursor-pointer"></HomeSvg>
                <div className="text-center flex-grow-1 max-w-[75%]">
                    <p className="text-3xl font-semibold truncate" title={randomQuote}>{randomQuote}</p>
                    <p className="text-xl opacity-65 hidden sm:block">
                        Puttin' croks in 'oles since 2024
                    </p>
                </div>
                <div onClick={() => setShowRules(true)} className="cursor-pointer text-2xl text-white-50 font-bold">?</div>
            </div>
            <div className="container page-body flex flex-col">
                {children}
            </div>
        </div>
    );
}

export default Page;
