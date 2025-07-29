"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Settings,
  Wallet,
  Target,
  Loader2,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";

// Mock data interfaces (keeping the same)
interface Token {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  momentumScore: number;
  trend: "Very Bullish" | "Building" | "Fading" | "Bearish";
  chains: string[];
}

interface PriceData {
  chain: string;
  symbol: string;
  price: number;
  change: number;
}

interface TradeExecution {
  id: string;
  time: string;
  token: string;
  chains: string;
  status: "pending" | "executing" | "completed" | "failed";
  pnl: number;
}

// Mock data
const mockTokens: Token[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 43250,
    change24h: 5.2,
    momentumScore: 87,
    trend: "Very Bullish",
    chains: ["ETH", "BSC", "MATIC"],
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: 2650,
    change24h: 3.8,
    momentumScore: 72,
    trend: "Building",
    chains: ["ETH", "MATIC", "ARB"],
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: 98.5,
    change24h: -2.1,
    momentumScore: 45,
    trend: "Fading",
    chains: ["SOL"],
  },
  {
    symbol: "MATIC",
    name: "Polygon",
    price: 0.85,
    change24h: 8.3,
    momentumScore: 91,
    trend: "Very Bullish",
    chains: ["ETH", "MATIC"],
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    price: 38.2,
    change24h: 1.2,
    momentumScore: 58,
    trend: "Building",
    chains: ["AVAX", "ETH"],
  },
  {
    symbol: "BNB",
    name: "BNB",
    price: 315,
    change24h: -4.5,
    momentumScore: 32,
    trend: "Bearish",
    chains: ["BSC", "ETH"],
  },
  {
    symbol: "ADA",
    name: "Cardano",
    price: 0.48,
    change24h: 2.8,
    momentumScore: 63,
    trend: "Building",
    chains: ["ADA"],
  },
  {
    symbol: "DOT",
    name: "Polkadot",
    price: 7.2,
    change24h: -1.8,
    momentumScore: 41,
    trend: "Fading",
    chains: ["DOT", "ETH"],
  },
];

const mockPriceComparison: { [key: string]: PriceData[] } = {
  BTC: [
    { chain: "Ethereum", symbol: "wBTC", price: 43250, change: 0 },
    { chain: "BSC", symbol: "BTCB", price: 43180, change: -0.16 },
    { chain: "Polygon", symbol: "wBTC", price: 43290, change: 0.09 },
    { chain: "Avalanche", symbol: "BTC.b", price: 43195, change: -0.13 },
    { chain: "Arbitrum", symbol: "wBTC", price: 43275, change: 0.06 },
    { chain: "Optimism", symbol: "wBTC", price: 43240, change: -0.02 },
  ],
  ETH: [
    { chain: "Ethereum", symbol: "ETH", price: 2650, change: 0 },
    { chain: "Polygon", symbol: "ETH", price: 2648, change: -0.08 },
    { chain: "Arbitrum", symbol: "ETH", price: 2652, change: 0.08 },
    { chain: "Optimism", symbol: "ETH", price: 2651, change: 0.04 },
    { chain: "BSC", symbol: "ETH", price: 2645, change: -0.19 },
    { chain: "Avalanche", symbol: "WETH.e", price: 2654, change: 0.15 },
  ],
  MATIC: [
    { chain: "Polygon", symbol: "MATIC", price: 0.85, change: 0 },
    { chain: "Ethereum", symbol: "MATIC", price: 0.847, change: -0.35 },
    { chain: "BSC", symbol: "MATIC", price: 0.852, change: 0.24 },
    { chain: "Avalanche", symbol: "MATIC", price: 0.849, change: -0.12 },
  ],
};

const mockExecutions: TradeExecution[] = [
  {
    id: "1",
    time: "14:32",
    token: "BTC",
    chains: "ETH→BSC",
    status: "completed",
    pnl: 125,
  },
  {
    id: "2",
    time: "14:28",
    token: "MATIC",
    chains: "ETH→MATIC",
    status: "executing",
    pnl: 0,
  },
  {
    id: "3",
    time: "14:25",
    token: "ETH",
    chains: "MATIC→ARB",
    status: "pending",
    pnl: 0,
  },
  {
    id: "4",
    time: "14:20",
    token: "SOL",
    chains: "SOL",
    status: "failed",
    pnl: -45,
  },
  {
    id: "5",
    time: "14:18",
    token: "AVAX",
    chains: "ETH→AVAX",
    status: "completed",
    pnl: 89,
  },
  {
    id: "6",
    time: "14:15",
    token: "BTC",
    chains: "BSC→ETH",
    status: "completed",
    pnl: 156,
  },
  {
    id: "7",
    time: "14:12",
    token: "MATIC",
    chains: "MATIC→ETH",
    status: "completed",
    pnl: 73,
  },
  {
    id: "8",
    time: "14:08",
    token: "ETH",
    chains: "ARB→OPT",
    status: "failed",
    pnl: -28,
  },
];

const getTrendColor = (trend: string) => {
  switch (trend) {
    case "Very Bullish":
      return "text-[var(--success)]";
    case "Building":
      return "text-[var(--success)]";
    case "Fading":
      return "text-[#ff0000]";
    case "Bearish":
      return "text-[#ff0000]";
    default:
      return "text-black dark:text-white";
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return "[DONE]";
    case "executing":
      return "[EXEC]";
    case "pending":
      return "[WAIT]";
    case "failed":
      return "[FAIL]";
    default:
      return "[????]";
  }
};

// Improved line chart component
const RetroLineChart = () => {
  const data = [
    100, 125, 118, 145, 152, 168, 162, 185, 178, 195, 208, 225, 218, 240, 235,
    258, 265, 280,
  ];
  const max = Math.max(...data);
  const min = Math.min(...data);

  return (
    <div className="h-20 w-full relative border border-black dark:border-white bg-[#F6F2E4] dark:bg-[#2a2a2a]">
      <svg className="w-full h-full" viewBox="0 0 400 80">
        <polyline
          fill="none"
          stroke="var(--chart-line)"
          strokeWidth="2"
          points={data
            .map((value, index) => {
              const x = (index / (data.length - 1)) * 398 + 1;
              const y = 78 - ((value - min) / (max - min)) * 76;
              return `${x},${y}`;
            })
            .join(" ")}
        />
        {/* Add some grid lines */}
        <line
          x1="0"
          y1="20"
          x2="400"
          y2="20"
          stroke="var(--border)"
          strokeWidth="0.5"
          opacity="0.3"
        />
        <line
          x1="0"
          y1="40"
          x2="400"
          y2="40"
          stroke="var(--border)"
          strokeWidth="0.5"
          opacity="0.3"
        />
        <line
          x1="0"
          y1="60"
          x2="400"
          y2="60"
          stroke="var(--border)"
          strokeWidth="0.5"
          opacity="0.3"
        />
      </svg>
    </div>
  );
};

// Loading skeleton component
const TokenSkeleton = () => (
  <Card className="bg-[#F6F2E4] dark:bg-[#2a2a2a] border border-black dark:border-white rounded-none">
    <CardContent className="p-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-4 w-12 bg-black/20 dark:bg-white/20 animate-pulse" />
          <div className="h-3 w-8 bg-black/20 dark:bg-white/20 animate-pulse" />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <div className="h-3 w-6 bg-black/20 dark:bg-white/20 animate-pulse" />
            <div className="h-3 w-16 bg-black/20 dark:bg-white/20 animate-pulse" />
          </div>
          <div className="h-2 w-full bg-black/20 dark:bg-white/20 animate-pulse" />
          <div className="h-3 w-20 bg-black/20 dark:bg-white/20 animate-pulse" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function MomentumSurferDashboard() {
  const [momentumThreshold, setMomentumThreshold] = useState([5]);
  const [surfMode, setSurfMode] = useState(false);
  const [selectedToken, setSelectedToken] = useState("BTC");
  const [isConnected, setIsConnected] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isScanning, setIsScanning] = useState(false);
  const [scanningDots, setScanningDots] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Scanning dots animation
  useEffect(() => {
    if (isScanning) {
      const dotsTimer = setInterval(() => {
        setScanningDots((prev) => {
          if (prev === "...") return "";
          return prev + ".";
        });
      }, 500);
      return () => clearInterval(dotsTimer);
    }
  }, [isScanning]);

  const handleMomentumScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanningDots("");
    }, 2500);
  };

  const filteredTokens = mockTokens.filter(
    (token) => token.momentumScore >= momentumThreshold[0] * 10
  );

  // Define classes based on theme
  const bgClass = isDark ? "bg-black" : "bg-[#F6F2E4]";
  const cardBgClass = isDark ? "bg-black" : "bg-[#F6F2E4]";
  const textClass = isDark ? "text-[#F6F2E4]" : "text-black";
  const borderClass = isDark ? "border-[#F6F2E4]" : "border-black";
  const successClass = isDark ? "text-green-400" : "text-[#228B22]";
  const hoverClass = isDark ? "hover:bg-[#F6F2E4]/10" : "hover:bg-black/10";

  return (
    <div
      className={`min-h-screen ${bgClass} ${textClass} font-mono text-xs transition-colors`}
    >
      {/* Header */}
      <header className={`border-b ${borderClass} ${bgClass}`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1
                className={`text-sm font-bold ${textClass}`}
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: "14px",
                  letterSpacing: "2px",
                }}
              >
                MULTI-CHAIN MOMENTUM SURFER
              </h1>
              <Badge
                variant="outline"
                className={`${borderClass} ${textClass} ${cardBgClass} rounded-none text-xs`}
              >
                <div
                  className={`w-1 h-1 ${successClass.replace(
                    "text-",
                    "bg-"
                  )} mr-1 animate-pulse`}
                />
                LIVE
              </Badge>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className={`${textClass} ${hoverClass} ${borderClass} rounded-none p-1 h-6 w-6`}
                onClick={() => setIsDark(!isDark)}
              >
                {isDark ? (
                  <Sun className="w-3 h-3" />
                ) : (
                  <Moon className="w-3 h-3" />
                )}
              </Button>
              <div className={`text-xs ${textClass}`}>
                {isMounted ? currentTime.toLocaleTimeString() : "--:--:--"}
              </div>
              <div className="flex items-center space-x-1">
                <Wallet className="w-3 h-3" />
                <span
                  className={`text-xs ${
                    isConnected ? successClass : "text-red-500"
                  }`}
                >
                  {isConnected ? "CONNECTED" : "DISCONNECTED"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className={`${textClass} ${hoverClass} ${borderClass} rounded-none p-1`}
              >
                <Settings className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4">
        {/* Divider Line */}
        <div
          className={`w-full h-px ${borderClass.replace(
            "border-",
            "bg-"
          )} mb-4`}
        />

        <div className="grid grid-cols-1 gap-4 mb-4">
          {/* Section 1 - Momentum Scanner */}
          <Card className={`${cardBgClass} ${borderClass} rounded-none`}>
            <CardHeader className={`pb-2 border-b ${borderClass}`}>
              <div className="flex items-center justify-between">
                <CardTitle className={`text-sm font-bold ${textClass}`}>
                  MOMENTUM SCANNER
                </CardTitle>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs ${textClass}`}>THRESHOLD:</span>
                    <div className="w-24">
                      <Slider
                        value={momentumThreshold}
                        onValueChange={setMomentumThreshold}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <span className={`text-xs ${successClass} font-bold`}>
                      {momentumThreshold[0]}%
                    </span>
                  </div>
                  <Button
                    className={`${cardBgClass} ${hoverClass} ${textClass} font-bold border ${borderClass} rounded-none text-xs px-2 py-1`}
                    size="sm"
                    onClick={handleMomentumScan}
                    disabled={isScanning}
                  >
                    {isScanning ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        SCANNING...
                      </>
                    ) : (
                      <>
                        <Target className="w-3 h-3 mr-1" />
                        DETECT
                      </>
                    )}
                  </Button>
                </div>
              </div>
              {isScanning && (
                <div className={`${textClass} text-xs`}>
                  ANALYZING MARKET DATA{scanningDots}
                </div>
              )}
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <AnimatePresence mode="wait">
                  {isScanning
                    ? // Show skeleton loading states
                      [...Array(8)].map((_, index) => (
                        <Card
                          key={`skeleton-${index}`}
                          className={`${cardBgClass} ${borderClass} rounded-none`}
                        >
                          <CardContent className="p-3">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div
                                  className={`h-4 w-12 ${
                                    isDark ? "bg-white/20" : "bg-black/20"
                                  } animate-pulse`}
                                />
                                <div
                                  className={`h-3 w-8 ${
                                    isDark ? "bg-white/20" : "bg-black/20"
                                  } animate-pulse`}
                                />
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <div
                                    className={`h-3 w-6 ${
                                      isDark ? "bg-white/20" : "bg-black/20"
                                    } animate-pulse`}
                                  />
                                  <div
                                    className={`h-3 w-16 ${
                                      isDark ? "bg-white/20" : "bg-black/20"
                                    } animate-pulse`}
                                  />
                                </div>
                                <div
                                  className={`h-2 w-full ${
                                    isDark ? "bg-white/20" : "bg-black/20"
                                  } animate-pulse`}
                                />
                                <div
                                  className={`h-3 w-20 ${
                                    isDark ? "bg-white/20" : "bg-black/20"
                                  } animate-pulse`}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    : // Show actual token data
                      filteredTokens.map((token, index) => (
                        <motion.div
                          key={token.symbol}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card
                            className={`${cardBgClass} ${borderClass} rounded-none ${hoverClass} transition-colors`}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <span
                                    className={`font-bold text-sm ${textClass}`}
                                  >
                                    {token.symbol}
                                  </span>
                                  <div className={`text-xs ${textClass}`}>
                                    {token.chains.length}CH
                                  </div>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={`rounded-none text-xs border ${
                                    token.change24h >= 3
                                      ? `border-green-500 ${
                                          isDark
                                            ? "text-green-400"
                                            : "text-[#228B22]"
                                        }`
                                      : token.change24h <= -3
                                      ? "border-red-500 text-red-500"
                                      : `${borderClass} ${textClass}`
                                  } ${cardBgClass}`}
                                >
                                  {token.change24h >= 0 ? "+" : ""}
                                  {token.change24h.toFixed(1)}%
                                </Badge>
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className={`${textClass} text-xs`}>
                                    PRICE
                                  </span>
                                  <span
                                    className={`${textClass} font-bold text-xs`}
                                  >
                                    ${token.price.toLocaleString()}
                                  </span>
                                </div>

                                <div className="space-y-1">
                                  <div className="flex justify-between items-center">
                                    <span className={`${textClass} text-xs`}>
                                      MOMENTUM
                                    </span>
                                    <span
                                      className={`${successClass} font-bold text-xs`}
                                    >
                                      {token.momentumScore}/100
                                    </span>
                                  </div>
                                  <Progress
                                    value={token.momentumScore}
                                    className={`h-2 ${cardBgClass} ${borderClass} rounded-none`}
                                  />
                                </div>

                                <div className="flex items-center justify-between">
                                  <span
                                    className={`text-xs font-bold ${
                                      token.trend === "Very Bullish" ||
                                      token.trend === "Building"
                                        ? successClass
                                        : "text-red-500"
                                    }`}
                                  >
                                    {token.trend.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Divider Line */}
        <div
          className={`w-full h-px ${borderClass.replace(
            "border-",
            "bg-"
          )} mb-4`}
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Section 3 - Cross-Chain Prices */}
          <Card className={`${cardBgClass} ${borderClass} rounded-none`}>
            <CardHeader className={`border-b ${borderClass} pb-2`}>
              <CardTitle className={`text-sm font-bold ${textClass}`}>
                CROSS-CHAIN PRICES
              </CardTitle>
              <div className="flex space-x-1">
                {Object.keys(mockPriceComparison).map((token) => (
                  <Button
                    key={token}
                    size="sm"
                    variant={selectedToken === token ? "default" : "outline"}
                    onClick={() => setSelectedToken(token)}
                    className={`text-xs font-bold rounded-none border ${borderClass} ${
                      selectedToken === token
                        ? `${
                            isDark
                              ? "bg-[#F6F2E4] text-black"
                              : "bg-black text-[#F6F2E4]"
                          } ${
                            isDark
                              ? "hover:bg-[#F6F2E4]/80"
                              : "hover:bg-black/80"
                          }`
                        : `${cardBgClass} ${textClass} ${hoverClass}`
                    }`}
                  >
                    {token}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2">
                {mockPriceComparison[selectedToken]?.map((price, index) => {
                  const minPrice = Math.min(
                    ...mockPriceComparison[selectedToken].map((p) => p.price)
                  );
                  const maxPrice = Math.max(
                    ...mockPriceComparison[selectedToken].map((p) => p.price)
                  );
                  const arbitrageOpportunity =
                    ((maxPrice - minPrice) / minPrice) * 100;
                  const isArbitrage = arbitrageOpportunity > 1;

                  return (
                    <div
                      key={index}
                      className={`p-2 border transition-all ${
                        isArbitrage &&
                        (price.price === minPrice || price.price === maxPrice)
                          ? `${cardBgClass} border-green-500 border-2`
                          : `${cardBgClass} ${borderClass}`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold ${textClass} text-xs`}>
                            {price.chain.toUpperCase()}
                          </span>
                          <span className={`text-xs ${textClass}`}>
                            {price.symbol}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <div className={`${textClass} font-bold text-xs`}>
                              ${price.price.toLocaleString()}
                            </div>
                            <div
                              className={`text-xs font-bold ${
                                price.change >= 0
                                  ? successClass
                                  : "text-red-500"
                              }`}
                            >
                              {price.change >= 0 ? "+" : ""}
                              {price.change.toFixed(2)}%
                            </div>
                          </div>
                          {isArbitrage && price.price === minPrice && (
                            <Button
                              size="sm"
                              className={`${
                                isDark
                                  ? "bg-green-400 text-black"
                                  : "bg-[#228B22] text-[#F6F2E4]"
                              } hover:opacity-80 text-xs font-bold ${borderClass} rounded-none px-2 py-1`}
                            >
                              BUY
                            </Button>
                          )}
                          {isArbitrage && price.price === maxPrice && (
                            <Button
                              size="sm"
                              className={`bg-red-500 hover:bg-red-600 text-[#F6F2E4] text-xs font-bold ${borderClass} rounded-none px-2 py-1`}
                            >
                              SELL
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className={`${cardBgClass} ${borderClass} rounded-none`}>
            <CardHeader className={`border-b ${borderClass} pb-2`}>
              <CardTitle className={`text-sm font-bold ${textClass}`}>
                SURFING METRICS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className={`text-center p-2 border ${borderClass}`}>
                  <div
                    className={`text-lg font-bold ${successClass}`}
                    style={{
                      fontFamily: '"Press Start 2P", monospace',
                      fontSize: "16px",
                    }}
                  >
                    $1240
                  </div>
                  <div className={`text-xs ${textClass}`}>TODAY P&L</div>
                  <div className={`text-xs ${successClass} font-bold`}>
                    +11.2%
                  </div>
                </div>
                <div className={`text-center p-2 border ${borderClass}`}>
                  <div
                    className={`text-lg font-bold ${textClass}`}
                    style={{
                      fontFamily: '"Press Start 2P", monospace',
                      fontSize: "16px",
                    }}
                  >
                    12
                  </div>
                  <div className={`text-xs ${textClass}`}>TRADES</div>
                  <div className={`text-xs ${textClass}`}>TODAY</div>
                </div>
                <div className={`text-center p-2 border ${borderClass}`}>
                  <div
                    className={`text-lg font-bold ${textClass}`}
                    style={{
                      fontFamily: '"Press Start 2P", monospace',
                      fontSize: "16px",
                    }}
                  >
                    24M
                  </div>
                  <div className={`text-xs ${textClass}`}>AVG TIME</div>
                </div>
                <div className={`text-center p-2 border ${borderClass}`}>
                  <div className={`text-lg font-bold ${textClass}`}>BSC</div>
                  <div className={`text-xs ${textClass}`}>BEST CHAIN</div>
                  <div className={`text-xs ${successClass} font-bold`}>
                    +$340
                  </div>
                </div>
              </div>

              <div className={`p-2 border ${borderClass} mb-3`}>
                <div className={`text-xs ${textClass} font-bold mb-2`}>
                  ACCOUNT GROWTH
                </div>
                <div
                  className={`h-20 w-full relative border ${borderClass} ${cardBgClass}`}
                >
                  <svg className="w-full h-full" viewBox="0 0 400 80">
                    <polyline
                      fill="none"
                      stroke={isDark ? "#22c55e" : "#228B22"}
                      strokeWidth="2"
                      points="1,78 23,65 45,70 67,55 89,50 111,42 133,45 155,35 177,40 199,32 221,28 243,25 265,30 287,20 309,22 331,15 353,12 377,8"
                    />
                    <line
                      x1="0"
                      y1="20"
                      x2="400"
                      y2="20"
                      stroke={isDark ? "white" : "black"}
                      strokeWidth="0.5"
                      opacity="0.3"
                    />
                    <line
                      x1="0"
                      y1="40"
                      x2="400"
                      y2="40"
                      stroke={isDark ? "white" : "black"}
                      strokeWidth="0.5"
                      opacity="0.3"
                    />
                    <line
                      x1="0"
                      y1="60"
                      x2="400"
                      y2="60"
                      stroke={isDark ? "white" : "black"}
                      strokeWidth="0.5"
                      opacity="0.3"
                    />
                  </svg>
                </div>
              </div>

              <div className={`p-2 border ${borderClass}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs ${textClass} font-bold`}>
                    SURF MODE
                  </span>
                  <Switch checked={surfMode} onCheckedChange={setSurfMode} />
                </div>
                <div className={`text-xs ${textClass} mb-2`}>
                  AUTO-EXECUTE WHEN MOMENTUM &gt;5%
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${textClass} font-bold`}>
                      RISK:
                    </span>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className={`text-xs h-5 px-1 ${cardBgClass} ${borderClass} ${textClass} rounded-none`}
                      >
                        LOW
                      </Button>
                      <Button
                        size="sm"
                        className={`text-xs h-5 px-1 ${
                          isDark
                            ? "bg-[#F6F2E4] text-black"
                            : "bg-black text-[#F6F2E4]"
                        } font-bold rounded-none`}
                      >
                        MED
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={`text-xs h-5 px-1 ${cardBgClass} ${borderClass} ${textClass} rounded-none`}
                      >
                        HIGH
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${textClass} font-bold`}>
                      MAX PER SURF:
                    </span>
                    <span className={`text-xs ${textClass} font-bold`}>
                      $500
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Divider Line */}
        <div
          className={`w-full h-px ${borderClass.replace(
            "border-",
            "bg-"
          )} my-4`}
        />

        <div className="grid grid-cols-1 gap-4">
          {/* Section 4 - Trade Log */}
          <Card className={`${cardBgClass} ${borderClass} rounded-none`}>
            <CardHeader className={`border-b ${borderClass} pb-2`}>
              <CardTitle className={`text-sm font-bold ${textClass}`}>
                TRADE LOG
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-1">
                {mockExecutions.map((execution) => (
                  <div
                    key={execution.id}
                    className={`flex items-center justify-between py-1 px-2 border-b ${
                      isDark ? "border-white/20" : "border-black/20"
                    } ${cardBgClass} text-xs`}
                  >
                    <div className="flex items-center space-x-2 flex-1">
                      <span className={`${textClass} font-bold w-12`}>
                        {execution.time}
                      </span>
                      <span className={`font-bold ${textClass} w-12`}>
                        {execution.token}
                      </span>
                      <span className={`${textClass} w-20`}>
                        {execution.chains}
                      </span>
                      <span
                        className={`font-bold w-16 ${
                          execution.status === "completed"
                            ? successClass
                            : execution.status === "failed"
                            ? "text-red-500"
                            : execution.status === "executing"
                            ? "text-orange-500"
                            : textClass
                        }`}
                      >
                        {getStatusBadge(execution.status)}
                      </span>
                    </div>
                    {execution.pnl !== 0 && (
                      <div
                        className={`text-xs font-bold ${
                          execution.pnl >= 0 ? successClass : "text-red-500"
                        }`}
                      >
                        {execution.pnl >= 0 ? "+" : ""}${execution.pnl}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-20">
        <Button
          size="lg"
          className={`${cardBgClass} ${hoverClass} ${textClass} font-bold border-2 ${borderClass} rounded-none shadow-none`}
          onClick={handleMomentumScan}
          disabled={isScanning}
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              SCANNING...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              DETECT NOW
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
