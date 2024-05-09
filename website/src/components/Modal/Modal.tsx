import React from "react";
import "./Modal.css";

export default function Modal({
  message,
  visible,
  onClick,
  labelPrimary = "Ok",
  labelSecondary,
  className = "",
}: {
  message: string;
  visible: boolean;
  onClick: (primary: boolean) => void;
  labelPrimary?: string;
  labelSecondary?: string;
  className?: string;
}) {
  return (
    <div className={`modal ${visible ? "visible" : ""} ${className}`}>
      <p>{message}</p>
      <div className="modal-buttons">
        <button
          type="button"
          className={labelSecondary ? "btn-primary" : ""}
          onClick={() => onClick(true)}
        >
          {labelPrimary}
        </button>
        {labelSecondary && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onClick(false)}
          >
            {labelSecondary}
          </button>
        )}
      </div>
    </div>
  );
}

