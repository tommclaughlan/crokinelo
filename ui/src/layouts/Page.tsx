import React from "react";
import { QUOTES } from "./constants";

import "./Page.css";

const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

interface PageProps {
    children?: React.ReactNode;
}

function Page({ children }: PageProps) {
    return (
        <div className="flex flex-col items-center">
            <div className="bg-primary text-white w-full text-center p-6">
                <p className="text-3xl font-semibold">{randomQuote}</p>
                <p className="text-xl opacity-65">
                    Puttin' croks in 'oles since 2024
                </p>
            </div>
            <div className="flex flex-col w-content">
                {children}
            </div>
        </div>
    );
}

export default Page;
