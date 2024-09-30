import React, { useState } from "react";
import "./carousel.css";

interface CarouselProps {
    items: ReadonlyArray<React.ReactNode>;
}

const Carousel = ({ items }: CarouselProps) => {
    const [index, setIndex] = useState(0);
    const length = items?.length;

    const handlePrevious = () => {
        const newIndex = index - 1;
        setIndex(newIndex < 0 ? length - 1 : newIndex);
    };

    const handleNext = () => {
        const newIndex = index + 1;
        setIndex(newIndex >= length ? 0 : newIndex);
    };

    const button = (text: string, callback: React.MouseEventHandler<HTMLButtonElement>) => {
        return <button
            className="rounded-full border border-secondary text-secondary hover:text-white hover:bg-secondary p-2 pl-4 pr-4"
            onClick={callback}
        >
            {text}
        </button>
    }

    return (
        <div className="flex flex-column w-full">
            <div className="p-2">
                {button("⇦", handlePrevious)}
            </div>
            <div className="flex-grow text-center">{items?.length && items[index]}</div>
            <div className="p-2">
                {button("⇨", handleNext)}
            </div>
        </div>
    );
};

export default Carousel;
