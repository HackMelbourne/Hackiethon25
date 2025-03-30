import { useState, useEffect } from "react";
import "./networth.css";
import InvestmentModal from "./InvestmentModal";
import bankIcon from "./assets-networth/bank.png";
import cryptoIcon from "./assets-networth/crypto.png";
import stockIcon from "./assets-networth/stock.png";
import editIcon from "./assets-networth/edit.png";
import trashIcon from "./assets-networth/trash.png";
import crossIcon from "./assets-networth/cross.png";
import usePriceManager from "./PriceManager";

const DEFAULT_INVESTMENTS = [
  {
    id: 1,
    entry: "VOO",
    date: new Date(2025, 2, 14),
    type: "Stock",
    equity: "1.3",
    amount: "",
  },
  {
    id: 2,
    date: new Date(2025, 2, 16),
    type: "Crypto",
    entry: "Bitcoin",
    equity: "1.2",
    amount: "",
  },
  {
    id: 3,
    date: new Date(2025, 3, 11),
    entry: "Westpac Savings",
    type: "Savings",
    description: "Wage from job",
    amount: "11000",
    rate: "5",
  },
];

const MAX_NETWORTH_LEN = 14;

const NetWorth = () => {
  const [netWorth, setNetWorth] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [investmentType, setInvestmentType] = useState("");
  const [investments, setInvestments] = useState(DEFAULT_INVESTMENTS);
  const [isEditMode, setIsEditMode] = useState(false);
  const [updatedInvestments, isLoading] = usePriceManager(investments);

  const handleClick = (type) => {
    setInvestmentType(type);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (newInvestment) => {
    setInvestments((prevInvestments) => [...prevInvestments, newInvestment]);
  };

  const handleDeleteInvestment = (id) => {
    setInvestments(
      updatedInvestments.filter((investment) => investment.id !== id)
    );
  };

  const toggleEditMode = () => setIsEditMode(!isEditMode);

  {
    /* Calculate the total value of investments (networth) */
  }
  useEffect(() => {
    const newTotal = updatedInvestments.reduce(
      (sum, investment) => sum + Number(investment.amount),
      0
    );
    const formattedTotal = Intl.NumberFormat("en-US", { maximumFractionDigits: 2}).format(newTotal);
    
    setNetWorth(formattedTotal);
  }, [updatedInvestments]);

  return (
    <div className="widget-container-networth relative w-[30rem] bg-black px-[1rem] py-[1rem] rounded-xl border border-neutral-500 space-y-[1rem] shadow-2xl">
      {/* Main networth view */}
      <div className="flex flex-col justify-center items-center w-full bg-gradient-to-tr from-black via-gray-900 to-blue-900 shadow-2xl border-gray-900 border-[0.001px] rounded-xl p-6">
        <p className="text-sm font-extralight text-gray-300">Your Stack</p>
        <p
          className={`font-medium text-center text-neutral-100 mt-1 ${
            netWorth.length > MAX_NETWORTH_LEN ? "text-2xl" : "text-5xl"
          }`}
        >
          {netWorth.length < MAX_NETWORTH_LEN
            ? `$${netWorth}`
            : "I am awed by your riches..."}
        </p>

        {/* Change buttons */}
        <div className="flex justify-center items-center w-full gap-10 text-neutral-50 mt-8">
          {/* Bank account import */}
          <div className="flex flex-col justify-center items-center gap-1">
            <button
              className="cursor-pointer bg-gradient-to-tr from-black via-gray-900 to-green-900 rounded-xl p-2 transition transform hover:scale-105 hover:-translate-y-1 duration-200 ease-in-out"
              onClick={() => handleClick("Savings")}
            >
              <img
                src={bankIcon}
                alt="Bank Icon"
                width={512}
                height={512}
                className="w-[2.5rem] h-[2.5rem]"
              />
            </button>
            <p className="font-light text-xs">Savings</p>
          </div>

          {/* Crypto import */}
          <div className="flex flex-col justify-center items-center gap-1">
            <button
              className="cursor-pointer bg-gradient-to-tr from-black via-gray-900 to-purple-900 rounded-xl p-2 transition transform hover:scale-105 hover:-translate-y-1 duration-200 ease-in-out"
              onClick={() => handleClick("Crypto")}
            >
              <img
                src={cryptoIcon}
                alt="Crypto Icon"
                width={512}
                height={512}
                className="w-[2.5rem] h-[2.5rem]"
              />
            </button>
            <p className="font-light text-xs">Crypto</p>
          </div>

          {/* Stock import */}
          <div className="flex flex-col justify-center items-center gap-1">
            <button
              className="cursor-pointer bg-gradient-to-tr from-black via-gray-900 to-orange-900 rounded-xl p-2 transition transform hover:scale-105 hover:-translate-y-1 duration-200 ease-in-out"
              onClick={() => handleClick("Stock")}
            >
              <img
                src={stockIcon}
                alt="Stock Icon"
                width={512}
                height={512}
                className="w-[2.5rem] h-[2.5rem]"
              />
            </button>
            <p className="font-light text-xs">Stock</p>
          </div>

          <InvestmentModal
            isOpen={isModalOpen}
            type={investmentType}
            submitFunction={handleFormSubmit}
            onClose={() => {
              setIsModalOpen(false);
              setInvestmentType("");
            }}
          />
        </div>
      </div>

      {/* Portfolio list view */}
      <div className="flex flex-col w-full">
        <div className="flex justify-between items-start w-full">
          <p className="font-medium text-sm text-neutral-50">Portfolio</p>
          <button
            onClick={() => toggleEditMode()}
            className="transition transform hover:scale-105 duration-150 ease-in-out cursor-pointer"
          >
            <img
              src={isEditMode ? crossIcon : editIcon}
              alt="Edit icon"
              width={512}
              height={512}
              className="w-[20px]"
            />
          </button>
        </div>

        <div className="max-h-[15rem] flex flex-col justify-center items-start w-full mt-3 gap-2 overflow-y-scroll scrollbar scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent px-3 pt-3 scrollbar-minimal">
          {isLoading ? (
            <div>Loading your stack...</div>
          ) : (
            updatedInvestments.map((investment) => (
              <div
                key={investment.id}
                className="flex justify-between items-center w-full text-white"
              >
                {investment.type === "Savings" && (
                  <SavingsEntry investment={investment} />
                )}
                {investment.type === "Crypto" && (
                  <CryptoEntry investment={investment} />
                )}
                {investment.type === "Stock" && (
                  <StockEntry investment={investment} />
                )}

                <div className="flex justify-center items-center">
                  {isEditMode && (
                    <button
                      onClick={() => handleDeleteInvestment(investment.id)}
                      className="cursor-pointer ml-3"
                    >
                      <img
                        src={trashIcon}
                        alt="Delete icon"
                        width={512}
                        height={512}
                        className="w-[20px]"
                      />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const SavingsEntry = ({ investment }) => {
  return (
    <div className="flex justify-between items-center w-full text-white ">
      <div className="flex justify-start items-center w-full gap-5">
        <div className="flex gap-5">
          <div className="bg-gradient-to-tr from-black via-gray-900 to-green-900 rounded-xl p-1">
            <img
              src={bankIcon}
              alt="Bank icon"
              height={512}
              width={512}
              className="w-[2rem]"
            />
          </div>
        </div>

        <div className="w-[4.5rem] flex flex-col justify-center items-start">
          <p className="text-xs font-light text-stone-400">
            {investment.date.toLocaleDateString()}
          </p>
          <p
            className={
              investment.description ? "max-w-[4.5rem] break-words" : ""
            }
          >
            {investment.entry}
          </p>
        </div>

        <p className="max-w-[50%] border-l border-white pl-3 text-sm font-light overflow-hidden">
          {investment.description}
        </p>
      </div>
      
      <div className="flex flex-col justify-center items-end">
        <p className="text-end text-xs font-light text-stone-400">
          {investment.rate ? `${investment.rate}% p.a` : ""}
        </p>
        <p>{`$${Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
        Number(investment.amount))}`}</p>
      </div>
    </div>
  );
};

const CryptoEntry = ({ investment }) => {
  return (
    <div className="flex justify-between items-center w-full text-white ">
      <div className="flex justify-start items-center w-full gap-5">
        <div className="flex gap-5">
          <div className="bg-gradient-to-tr from-black via-gray-900 to-purple-900 rounded-xl p-1">
            <img
              src={cryptoIcon}
              alt="Crypto Icon"
              width={512}
              height={512}
              className="w-[2rem]"
            />
          </div>
        </div>

        <div className="w-[4.5rem] flex flex-col justify-center items-start">
          <p className="text-xs font-light text-stone-400">
            {investment.date.toLocaleDateString()}
          </p>
          <p className="max-w-[4.5rem]">{investment.entry}</p>
        </div>

        <p className="max-w-[50%] border-l border-white pl-3 text-sm font-light overflow-hidden">
          {`${investment.equity} coins`}
        </p>
      </div>

      <div className="flex flex-col justify-start items-center">
        <p>{`$${Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
        Number(investment.amount))}`}</p>
      </div>
    </div>
  );
};

const StockEntry = ({ investment }) => {
  return (
    <div className="flex justify-between items-center w-full text-white ">
      <div className="flex justify-start items-center w-full gap-5">
        <div className="flex gap-5">
          <div className="bg-gradient-to-tr from-black via-gray-900 to-orange-900 rounded-xl p-1">
            <img
              src={stockIcon}
              alt="Stock Icon"
              width={512}
              height={512}
              className="w-[2rem]"
            />
          </div>
        </div>

        <div className="w-[4.5rem] flex flex-col justify-center items-start">
          <p className="text-xs font-light text-stone-400">
            {investment.date.toLocaleDateString()}
          </p>
          <p className="max-w-[4.5rem] break-words">{investment.entry}</p>
        </div>

        <p className="max-w-[50%] border-l border-white pl-3 text-sm font-light overflow-hidden">
          {`${investment.equity} shares`}
        </p>
      </div>

      <div className="flex flex-col justify-start items-center">
        <p>{`$${Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
        Number(investment.amount))}`}</p>
      </div>
    </div>
  );
};

export default NetWorth;
