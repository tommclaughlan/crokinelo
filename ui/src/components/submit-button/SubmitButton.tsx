import LoadingSpinner from "../loadingSpinner/LoadingSpinner";

import './SubmitButton.css';

interface SubmitButtonProps {
    onClick: () => void;
    text: string;
    disabled?: boolean;
    type?: string;
}

const SubmitButton = ({ onClick, text, disabled, type }: SubmitButtonProps) => {
    let className = "submit-button";

    if (type) {
        className += " " + type;
    } else {
        className += " primary";
    }

    return (
        <button
            className={"keycap-container"}
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

export default SubmitButton;