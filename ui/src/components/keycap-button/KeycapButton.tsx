import LoadingSpinner from "../loadingSpinner/LoadingSpinner";

import './KeycapButton.css';

interface KeycapButtonProps {
    onClick: () => void;
    text: string;
    disabled?: boolean;
    type?: string;
}

const KeycapButton = ({ onClick, text, disabled, type }: KeycapButtonProps) => {
    let className = "keycap-button";

    if (type) {
        className += " " + type;
    } else {
        className += " primary";
    }

    return (
        <button
            className={"keycap-container flex-auto"}
            type="button"
            onClick={onClick}
            disabled={disabled}
        >
            <div className={className}>
              <span>
            {disabled ? <LoadingSpinner size="small" /> : text}
              </span>
            </div>
        </button>
    )
}

export default KeycapButton;