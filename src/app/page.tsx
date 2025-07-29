"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Settings, Wallet, Target, Loader2 } from "lucide-react";
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
  ],
  ETH: [
    { chain: "Ethereum", symbol: "ETH", price: 2650, change: 0 },
    { chain: "Polygon", symbol: "ETH", price: 2648, change: -0.08 },
    { chain: "Arbitrum", symbol: "ETH", price: 2652, change: 0.08 },
  ],
};

const mockExecutions: TradeExecution[] = [
  {
    id: "1",
    time: "14:32:15",
    token: "BTC",
    chains: "ETH→BSC",
    status: "completed",
    pnl: 125,
  },
  {
    id: "2",
    time: "14:28:42",
    token: "MATIC",
    chains: "ETH→MATIC",
    status: "executing",
    pnl: 0,
  },
  {
    id: "3",
    time: "14:25:18",
    token: "ETH",
    chains: "MATIC→ARB",
    status: "pending",
    pnl: 0,
  },
  {
    id: "4",
    time: "14:20:33",
    token: "SOL",
    chains: "SOL",
    status: "failed",
    pnl: -45,
  },
];

const getTrendColor = (trend: string) => {
  switch (trend) {
    case "Very Bullish":
      return "text-[#0ea5e9]";
    case "Building":
      return "text-[#0ea5e9]";
    case "Fading":
      return "text-[#ff4444]";
    case "Bearish":
      return "text-[#ff4444]";
    default:
      return "text-[#a0a0a0]";
  }
};

// Simple line chart component
const SimpleLineChart = () => {
  const data = [100, 120, 115, 140, 135, 160, 155, 180, 175, 200, 195, 220];
  const max = Math.max(...data);
  const min = Math.min(...data);

  return (
    <div className="h-24 w-full relative">
      <svg className="w-full h-full" viewBox="0 0 300 100">
        <polyline
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="2"
          points={data
            .map((value, index) => {
              const x = (index / (data.length - 1)) * 300;
              const y = 100 - ((value - min) / (max - min)) * 80;
              return `${x},${y}`;
            })
            .join(" ")}
        />
      </svg>
    </div>
  );
};

// Loading skeleton component
const TokenSkeleton = () => (
  <Card className="bg-[#1a1a1a] border-[#333333]">
    <CardContent className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-6 w-16 bg-[#333333] rounded animate-pulse" />
          <div className="h-5 w-12 bg-[#333333] rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-4 w-8 bg-[#333333] rounded animate-pulse" />
            <div className="h-4 w-20 bg-[#333333] rounded animate-pulse" />
          </div>
          <div className="h-2 w-full bg-[#333333] rounded animate-pulse" />
          <div className="h-4 w-24 bg-[#333333] rounded animate-pulse" />
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

  useEffect(() => {
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-[#333333] bg-[#0a0a0a]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">
                Multi-Chain Momentum Surfer
              </h1>
              <Badge
                variant="outline"
                className="border-[#0ea5e9] text-[#0ea5e9]"
              >
                <div className="w-2 h-2 bg-[#0ea5e9] rounded-full mr-2 animate-pulse" />
                LIVE
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-[#a0a0a0] font-mono">
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="flex items-center space-x-2">
                <Wallet className="w-4 h-4" />
                <span
                  className={`text-sm ${
                    isConnected ? "text-[#0ea5e9]" : "text-[#ff4444]"
                  }`}
                >
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-[#a0a0a0] hover:text-white border-[#333333]"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 gap-6 mb-6">
          {/* Section 1 - Momentum Scanner */}
          <Card className="bg-[#1a1a1a] border-[#333333]">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium text-white">
                  Momentum Scanner
                </CardTitle>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-[#a0a0a0] font-semibold">
                      Threshold:
                    </span>
                    <div className="w-32">
                      <Slider
                        value={momentumThreshold}
                        onValueChange={setMomentumThreshold}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <span className="text-sm text-[#0ea5e9] font-mono font-bold">
                      {momentumThreshold[0]}%
                    </span>
                  </div>
                  <Button
                    className="bg-[#0ea5e9] hover:bg-[#0284c7] text-black font-bold"
                    size="sm"
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
                        <Target className="w-4 h-4 mr-2" />
                        DETECT MOMENTUM
                      </>
                    )}
                  </Button>
                </div>
              </div>
              {isScanning && (
                <div className="text-[#a0a0a0] text-sm font-mono">
                  Analyzing market data{scanningDots}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <AnimatePresence mode="wait">
                  {isScanning
                    ? // Show skeleton loading states
                      [...Array(8)].map((_, index) => (
                        <TokenSkeleton key={`skeleton-${index}`} />
                      ))
                    : // Show actual token data
                      filteredTokens.map((token, index) => (
                        <motion.div
                          key={token.symbol}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="bg-[#1a1a1a] border-[#333333] hover:border-[#555555] transition-colors">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold text-lg text-white">
                                    {token.symbol}
                                  </span>
                                  <div className="text-xs text-[#a0a0a0]">
                                    {token.chains.length} chains
                                  </div>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={`${
                                    token.change24h >= 3
                                      ? "border-[#0ea5e9] text-[#0ea5e9]"
                                      : token.change24h <= -3
                                      ? "border-[#ff4444] text-[#ff4444]"
                                      : "border-[#333333] text-[#a0a0a0]"
                                  }`}
                                >
                                  {token.change24h >= 0 ? "+" : ""}
                                  {token.change24h.toFixed(1)}%
                                </Badge>
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-[#a0a0a0] text-sm font-semibold">
                                    Price
                                  </span>
                                  <span className="font-mono text-white font-bold">
                                    ${token.price.toLocaleString()}
                                  </span>
                                </div>

                                <div className="space-y-1">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[#a0a0a0] text-sm font-semibold">
                                      Momentum
                                    </span>
                                    <span className="font-mono text-[#0ea5e9] font-bold">
                                      {token.momentumScore}/100
                                    </span>
                                  </div>
                                  <Progress
                                    value={token.momentumScore}
                                    className="h-2 bg-[#333333]"
                                  />
                                </div>

                                <div className="flex items-center justify-between">
                                  <span
                                    className={`text-sm font-semibold ${getTrendColor(
                                      token.trend
                                    )}`}
                                  >
                                    {token.trend}
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

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Section 3 - Cross-Chain Prices */}
          <Card className="bg-[#1a1a1a] border-[#333333]">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-white">
                Cross-Chain Prices
              </CardTitle>
              <div className="flex space-x-2">
                {Object.keys(mockPriceComparison).map((token) => (
                  <Button
                    key={token}
                    size="sm"
                    variant={selectedToken === token ? "default" : "outline"}
                    onClick={() => setSelectedToken(token)}
                    className={`text-xs font-semibold ${
                      selectedToken === token
                        ? "bg-[#0ea5e9] text-black hover:bg-[#0284c7]"
                        : "bg-transparent border-[#333333] text-[#a0a0a0] hover:text-white"
                    }`}
                  >
                    {token}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
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
                      className={`p-3 rounded-lg border transition-all ${
                        isArbitrage &&
                        (price.price === minPrice || price.price === maxPrice)
                          ? "bg-[#0a0a0a] border-[#0ea5e9]"
                          : "bg-[#0a0a0a] border-[#333333]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-white">
                            {price.chain}
                          </span>
                          <span className="text-sm text-[#a0a0a0]">
                            {price.symbol}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="font-mono font-bold text-white">
                              ${price.price.toLocaleString()}
                            </div>
                            <div
                              className={`text-xs font-semibold ${
                                price.change >= 0
                                  ? "text-[#0ea5e9]"
                                  : "text-[#ff4444]"
                              }`}
                            >
                              {price.change >= 0 ? "+" : ""}
                              {price.change.toFixed(2)}%
                            </div>
                          </div>
                          {isArbitrage && price.price === minPrice && (
                            <Button
                              size="sm"
                              className="bg-[#0ea5e9] hover:bg-[#0284c7] text-black text-xs font-bold"
                            >
                              Buy Here
                            </Button>
                          )}
                          {isArbitrage && price.price === maxPrice && (
                            <Button
                              size="sm"
                              className="bg-[#ff4444] hover:bg-[#cc3333] text-white text-xs font-bold"
                            >
                              Sell Here
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

          {/* Performance Metrics - Full Width */}
          <Card className="bg-[#1a1a1a] border-[#333333]">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-white">
                Surfing Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 rounded-lg bg-[#0a0a0a] border border-[#333333]">
                  <div className="text-2xl font-black text-[#0ea5e9]">
                    $1,240
                  </div>
                  <div className="text-sm text-[#a0a0a0] font-semibold">
                    Today's P&L
                  </div>
                  <div className="text-xs text-[#0ea5e9] font-bold">+11.2%</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-[#0a0a0a] border border-[#333333]">
                  <div className="text-2xl font-black text-white">12</div>
                  <div className="text-sm text-[#a0a0a0] font-semibold">
                    Momentum Trades
                  </div>
                  <div className="text-xs text-[#a0a0a0] font-bold">Today</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-[#0a0a0a] border border-[#333333]">
                  <div className="text-2xl font-black text-white">24m</div>
                  <div className="text-sm text-[#a0a0a0] font-semibold">
                    Avg Surf Time
                  </div>
                </div>
                <div className="text-center p-3 rounded-lg bg-[#0a0a0a] border border-[#333333]">
                  <div className="text-2xl font-black text-white">BSC</div>
                  <div className="text-sm text-[#a0a0a0] font-semibold">
                    Best Chain
                  </div>
                  <div className="text-xs text-[#0ea5e9] font-bold">+$340</div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#0a0a0a] border border-[#333333] mb-4">
                <div className="text-sm text-[#a0a0a0] font-semibold mb-3">
                  Account Growth
                </div>
                <SimpleLineChart />
              </div>

              <div className="p-3 rounded-lg bg-[#0a0a0a] border border-[#333333]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#a0a0a0] font-semibold">
                    Surf Mode
                  </span>
                  <Switch checked={surfMode} onCheckedChange={setSurfMode} />
                </div>
                <div className="text-xs text-[#a0a0a0] mb-3">
                  Auto-execute when momentum &gt;5% detected
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#a0a0a0] font-semibold">
                      Risk Level:
                    </span>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-6 px-2 bg-transparent border-[#333333] text-[#a0a0a0]"
                      >
                        Low
                      </Button>
                      <Button
                        size="sm"
                        className="text-xs h-6 px-2 bg-[#0ea5e9] text-black font-bold"
                      >
                        Medium
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-6 px-2 bg-transparent border-[#333333] text-[#a0a0a0]"
                      >
                        High
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#a0a0a0] font-semibold">
                      Max Per Surf:
                    </span>
                    <span className="text-xs text-white font-mono font-bold">
                      $500
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 mt-6">
          {/* Section 4 - Trade Log */}
          <Card className="bg-[#1a1a1a] border-[#333333]">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-white">
                Trade Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockExecutions.map((execution) => (
                  <div
                    key={execution.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0a] border border-[#333333]"
                  >
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-sm text-[#a0a0a0] font-semibold">
                            {execution.time}
                          </span>
                          <span className="font-semibold text-white">
                            {execution.token}
                          </span>
                          <span className="text-sm text-[#a0a0a0]">
                            {execution.chains}
                          </span>
                        </div>
                        <div className="text-xs text-[#a0a0a0] capitalize font-semibold">
                          {execution.status}
                        </div>
                      </div>
                    </div>
                    {execution.pnl !== 0 && (
                      <div
                        className={`font-mono text-sm font-bold ${
                          execution.pnl >= 0
                            ? "text-[#0ea5e9]"
                            : "text-[#ff4444]"
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
      <div className="fixed bottom-8 right-8 z-20">
        <Button
          size="lg"
          className="rounded-full bg-[#0ea5e9] hover:bg-[#0284c7] text-black font-black shadow-lg"
          onClick={handleMomentumScan}
          disabled={isScanning}
        >
          {isScanning ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              SCANNING...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              DETECT MOMENTUM NOW
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
