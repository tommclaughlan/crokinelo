import React from "react";
import "./modal.css";

interface ModalProps {
    handleClose: () => void;
    show: boolean;
    children: React.ReactNode;
}

const Modal = ({ handleClose, show, children }: ModalProps) => {
    const showHideClassName = show ? "flex fixed" : "hidden";

    return (
        <div className={showHideClassName}>
            <div className="absolute w-screen h-screen bg-black opacity-30" onClick={handleClose} />
            {children}
        </div>
    );
};

export default Modal;
