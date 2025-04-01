import React from "react";
import Page from "../../layouts/Page";
import maintenanceIcon from "./maintenance-icon.png";

import "./Maintenance.css";

function Maintenance() {
    return (
        <Page>
            <div className="flex flex-col align-middle justify-center text-center">
                <div className="flex text-center justify-center">
                    <img
                        className="maintenance-icon"
                        src={maintenanceIcon}
                        alt="Maintenance icon"
                    />
                </div>
                <p className="is-size-1">
                    We've got something special in store for you.
                </p>
                <p className="is-size-5">
                    The CLAM Crokinole Elo Extravaganza is currently down
                    for maintenance.
                </p>
                <p className="is-size-5">Please check back soon.</p>
            </div>
        </Page>
    );
}

export default Maintenance;
