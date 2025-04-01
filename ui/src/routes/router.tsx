import { createHashRouter } from "react-router-dom";
import PlayerStats from "../pages/playerStats/PlayerStats";
import NotFoundPage from "../pages/notFoundPage/NotFoundPage";
import Home from "../pages/home/Home";

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
        path: "*",
        element: <NotFoundPage />,
    },
];

export default createHashRouter(routes);
