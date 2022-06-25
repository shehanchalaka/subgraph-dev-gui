import { ReactNode, useEffect, useState } from "react";

interface Props {
  open: boolean;
  onClose?: () => void;
  onSave?: (...args: any) => void;
  defaultName?: string;
}

const Modal = ({ open, onClose, onSave, defaultName }: Props) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (defaultName) setName(defaultName);
  }, [defaultName]);

  if (!open) return null;

  return (
    <div className="absolute w-full h-full flex items-center justify-center">
      <div
        className="absolute h-full w-full bg-gray-900 bg-opacity-10 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative p-4 rounded-lg min-w-[600px] bg-gray-700">
        <div className="text-xl">Settings</div>

        <div className="mt-4">
          <label className="text-sm">Subgraph name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-2 py-1 mt-1 rounded-lg bg-gray-800 outline-none focus:ring-1 ring-green-500"
          />
        </div>

        <div className="flex flex-row mt-6 space-x-3">
          <button
            className="flex-1 p-1 bg-gray-400 rounded-lg hover:bg-gray-500"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="flex-1 p-1 bg-green-500 rounded-lg hover:bg-green-600"
            onClick={() => onSave?.({ name })}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
