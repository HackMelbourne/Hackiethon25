import { useState, useEffect } from "react";
import axios from "axios";

const USD_TO_AUD_CONVERSION = 1.59; {/* As at 30/03/25 */}


{/* Fetch prices of crypto by entry */}
function usePriceManager(startingInvestments) {
  const [updatedInvestments, setUpdatedInvestments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPrices = async () => {
      setIsLoading(true);

      try {
        const cryptoInvestments = startingInvestments.filter(
          (inv) => inv.type === "Crypto"
        );
        const stockInvestments = startingInvestments.filter(
          (inv) => inv.type === "Stock"
        );
        if (cryptoInvestments.length === 0 && stockInvestments.length === 0) {
          setUpdatedInvestments(startingInvestments);
          return;
        }

        const updatedCrypto = await fetchCryptoPrices(
          cryptoInvestments,
          startingInvestments
        );

        const updatedStock = await fetchStockPrices(
          stockInvestments,
          updatedCrypto
        );

        setUpdatedInvestments(updatedStock);
      } catch (error) {
        console.error("Couldn't get prices!", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrices();
  }, [startingInvestments]);

  return [updatedInvestments, isLoading];
}

async function fetchCryptoPrices(cryptoInvestments, startingInvestments) {
  try {
    const allCryptoIds = cryptoInvestments.map((inv) => inv.entry).join(",");

    const res = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${allCryptoIds}&vs_currencies=aud`
    );

    const updatedInv = startingInvestments.map((inv) => {
      if (inv.type !== "Crypto") return inv;

      const coinEntry = inv.entry.toLowerCase();
      return {
        ...inv,
        amount:
          (res.data[coinEntry]?.aud * Number(inv.equity)).toFixed(2) ||
          "Not a coin!",
      };
    });

    return updatedInv;
  } catch (error) {
    console.error("Couldn't get coin!", error);
    return startingInvestments;
  }
}

async function fetchStockPrices(stockInvestments, startingInvestments) {
  try {
    const stockPriceResults = await Promise.all(
      stockInvestments.map(async (inv) => {
        const reqUrl = encodeURIComponent(
          `https://query1.finance.yahoo.com/v8/finance/chart/${inv.entry}`
        );
        const res = await axios.get("https://corsproxy.io/?url=" + reqUrl);
        const audConvertedPrice =
          res.data.chart?.result?.[0]?.meta?.regularMarketPrice *
          USD_TO_AUD_CONVERSION;

        return {
          id: inv.id,
          amount: audConvertedPrice ?? null,
        };
      })
    );

    const updatedInv = startingInvestments.map((inv) => {
      if (inv.type !== "Stock") return inv;

      const result = stockPriceResults.find((res) => res.id === inv.id);

      if (!result || result.price === null) {
        return {
          ...inv,
          amount: "Price unavailable",
        };
      } else {
        return {
          ...inv,
          amount: (result.amount * (Number(inv.equity) || 0)).toFixed(2),
        };
      }
    });

    return updatedInv;
  } catch (error) {
    console.error("Couldn't get stock!", error);
    return startingInvestments;
  }
}

export default usePriceManager;
