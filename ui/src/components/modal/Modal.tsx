import React from "react";
import "./modal.css";

interface ModalProps {
    handleClose: () => void;
    show: boolean;
    children: React.ReactNode;
}

const Modal = ({ handleClose, show, children }: ModalProps) => {
    const showHideClassName = show ? "flex w-screen h-screen flex-col fixed justify-center items-center" : "hidden";

    return (
        <div className={showHideClassName}>
            <div className="absolute left-0 right-0 top-0 bottom-0 bg-black opacity-50" onClick={handleClose} />
            {children}
        </div>
    );
};

export default Modal;
