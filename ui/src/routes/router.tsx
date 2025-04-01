import { createHashRouter } from "react-router-dom";
import PlayerStats from "../pages/playerStats/PlayerStats";
import NotFoundPage from "../pages/notFoundPage/NotFoundPage";
import Maintenance from "../pages/maintenance/Maintenance";

const routes = [
    {
        path: "/",
        element: <Maintenance />,
    },
    {
        path: "player/:id",
        element: <PlayerStats />,
    },
    {
        path: "*",
        element: <NotFoundPage />,
    },
];

export default createHashRouter(routes);
