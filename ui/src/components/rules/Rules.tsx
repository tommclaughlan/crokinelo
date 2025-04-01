import {XMarkIcon} from "@heroicons/react/24/solid";

interface RulesProps {
  setShowRules: (isShown: boolean) => void;
}

function Rules({ setShowRules }: RulesProps) {

  return (
    <div className="flex flex-col z-10 absolute bottom-[30px] top-0 left-0 right-0">
      <div className="bg-white rounded-lg shadow-2xl m-4 p-4 h-full overflow-auto">
          <header className="border-b border-secondary p-4 flex flex-row justify-between">
              <p className="text-2xl">
                  The Rules
              </p>
              <XMarkIcon className="size-6 cursor-pointer" onClick={() => setShowRules(false)}></XMarkIcon>
          </header>
          <section className="p-4">
              <p>Crokinole is a game for 2 players, or 2 teams of 2, where each team takes turns to shoot a disc at an
              opponent's disc, or into the central hole. The aim of the game is to end with a higher score than the opposing team.</p>
              <p className="font-bold">Basic Rules</p>
              <p>On your turn, you must try to strike an opponents disc with your shot. If your disc, or another disc involved in the shot,
              does not strike an opposing disc during the turn, the shot is declared invalid.</p>
              <p>If no opposing discs are on the board, then you must shoot towards the central area. If the disc, or any disc moved during the turn
              does not end within the central area, the shot is declared invalid. A piece is deemed inside the central area if it is at least
              partially within the area.</p>
              <p>If a shot is declared invalid during a players turn, all of that players discs involved in the shot are removed from the board.</p>
              <p>If at any point during a valid shot a disc ends in the central hole, that disc is removed immediately and the team who controls that
              disc is awarded 20 points.</p>
              <p className="font-bold">House Rules</p>
              <p>To determine which team starts the game, each player will attempt to shoot a disc into the central hole. Whichever player is closest decides who goes first.</p>
              <p className="font-bold">Scoring</p>
              <p>The sections on the board decrease in value from the centre, starting with the central hole which is worth 20 points.
              The sections then decrease to 15, 10 and 5 points, and any pieces outside or partially outside of the playing are are worth 0.</p>
              <p>If a disc lies on the boundary between 2 scoring zones then it is deemed to be the lower score.</p>
              <p>A game is defined as 1 round of 12 counters per team. At the end of a game, record the total scores per team and submit this to the tracker.
              Ties are permitted, and will be factored into the Elo calculation.</p>
          </section>
      </div>
    </div>
    );
}

export default Rules;
