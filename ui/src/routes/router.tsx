import { createHashRouter } from "react-router-dom";
import PlayerStats from "../pages/playerStats/PlayerStats";
import NotFoundPage from "../pages/notFoundPage/NotFoundPage";
import Home from "../pages/home/Home";
import SeasonStats from "../pages/seasonStats/SeasonStats";
import PlayerComparison from "../pages/playerComparison/playerCompasrison";

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
        path: "compare/:id1/:id2",
        element: <PlayerComparison />,
    },
    {
        path: "season/:seasonId/compare/:id1/:id2",
        element: <PlayerComparison />,
    },
    {
        path: "*",
        element: <NotFoundPage />,
    },
];

export default createHashRouter(routes);
