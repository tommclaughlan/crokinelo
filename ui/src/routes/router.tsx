import { createHashRouter } from "react-router-dom";
import PlayerStats from "../pages/playerStats/PlayerStats";
import NotFoundPage from "../pages/notFoundPage/NotFoundPage";
import Home from "../pages/home/Home";
import SeasonStats from "../pages/seasonStats/SeasonStats";

const routes = [
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "player/:id",
        element: <PlayerStats />,
    },
    {
        path: "season/:seasonId",
        element: <SeasonStats />,
    },
    {
        path: "season/:seasonId/player/:id",
        element: <PlayerStats />,
    },
    {
        path: "*",
        element: <NotFoundPage />,
    },
];

export default createHashRouter(routes);
