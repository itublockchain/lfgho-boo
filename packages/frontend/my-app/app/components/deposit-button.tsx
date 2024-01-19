import React, { useState } from "react";


const DepositButton = () => {
  const [open, setOpen] = useState(false);
    return (
        <div>
      <button className="bg-black px-4 py-2 rounded text-white"
      onClick={() => setOpen(true)}>
        <a href="/deposit">Deposit</a>
      </button></div>
    )
}

export default DepositButton;