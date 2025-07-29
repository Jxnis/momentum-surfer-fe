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
    chains: "ETH->BSC",
    status: "completed",
    pnl: 125,
  },
  {
    id: "2",
    time: "14:28:42",
    token: "MATIC",
    chains: "ETH->MATIC",
    status: "executing",
    pnl: 0,
  },
  {
    id: "3",
    time: "14:25:18",
    token: "ETH",
    chains: "MATIC->ARB",
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
      return "text-[#00ff00]";
    case "Building":
      return "text-[#00ff00]";
    case "Fading":
      return "text-[#ff0000]";
    case "Bearish":
      return "text-[#ff0000]";
    default:
      return "text-black";
  }
};

// Simple 8-bit style line chart component
const RetroLineChart = () => {
  const data = [100, 120, 115, 140, 135, 160, 155, 180, 175, 200, 195, 220];
  const max = Math.max(...data);
  const min = Math.min(...data);

  return (
    <div className="h-16 w-full relative border border-black">
      <svg className="w-full h-full" viewBox="0 0 300 64">
        <polyline
          fill="none"
          stroke="#00ff00"
          strokeWidth="1"
          points={data
            .map((value, index) => {
              const x = (index / (data.length - 1)) * 298 + 1;
              const y = 63 - ((value - min) / (max - min)) * 62;
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
  <Card className="bg-[#f5f5f0] border border-black rounded-none">
    <CardContent className="p-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-4 w-12 bg-black/20 animate-pulse" />
          <div className="h-3 w-8 bg-black/20 animate-pulse" />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <div className="h-3 w-6 bg-black/20 animate-pulse" />
            <div className="h-3 w-16 bg-black/20 animate-pulse" />
          </div>
          <div className="h-2 w-full bg-black/20 animate-pulse" />
          <div className="h-3 w-20 bg-black/20 animate-pulse" />
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
    <div className="min-h-screen bg-[#f5f5f0] text-black font-mono text-xs">
      {/* Header */}
      <header className="border-b border-black bg-[#f5f5f0]">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-sm font-bold text-black">
                MULTI-CHAIN MOMENTUM SURFER
              </h1>
              <Badge
                variant="outline"
                className="border-black text-black bg-[#f5f5f0] rounded-none text-xs"
              >
                <div className="w-1 h-1 bg-[#00ff00] mr-1 animate-pulse" />
                LIVE
              </Badge>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-xs text-black">
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="flex items-center space-x-1">
                <Wallet className="w-3 h-3" />
                <span
                  className={`text-xs ${
                    isConnected ? "text-[#00ff00]" : "text-[#ff0000]"
                  }`}
                >
                  {isConnected ? "CONNECTED" : "DISCONNECTED"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-black hover:bg-black/10 border border-black rounded-none p-1"
              >
                <Settings className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4">
        {/* Divider Line */}
        <div className="w-full h-px bg-black mb-4" />

        <div className="grid grid-cols-1 gap-4 mb-4">
          {/* Section 1 - Momentum Scanner */}
          <Card className="bg-[#f5f5f0] border border-black rounded-none">
            <CardHeader className="pb-2 border-b border-black">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-black">
                  MOMENTUM SCANNER
                </CardTitle>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-black">THRESHOLD:</span>
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
                    <span className="text-xs text-[#00ff00] font-bold">
                      {momentumThreshold[0]}%
                    </span>
                  </div>
                  <Button
                    className="bg-[#f5f5f0] hover:bg-black/10 text-black font-bold border border-black rounded-none text-xs px-2 py-1"
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
                <div className="text-black text-xs">
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
                        <TokenSkeleton key={`skeleton-${index}`} />
                      ))
                    : // Show actual token data
                      filteredTokens.map((token, index) => (
                        <motion.div
                          key={token.symbol}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className="bg-[#f5f5f0] border border-black rounded-none hover:bg-black/5 transition-colors">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold text-sm text-black">
                                    {token.symbol}
                                  </span>
                                  <div className="text-xs text-black">
                                    {token.chains.length}CH
                                  </div>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={`rounded-none text-xs border ${
                                    token.change24h >= 3
                                      ? "border-[#00ff00] text-[#00ff00]"
                                      : token.change24h <= -3
                                      ? "border-[#ff0000] text-[#ff0000]"
                                      : "border-black text-black"
                                  } bg-[#f5f5f0]`}
                                >
                                  {token.change24h >= 0 ? "+" : ""}
                                  {token.change24h.toFixed(1)}%
                                </Badge>
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-black text-xs">
                                    PRICE
                                  </span>
                                  <span className="text-black font-bold text-xs">
                                    ${token.price.toLocaleString()}
                                  </span>
                                </div>

                                <div className="space-y-1">
                                  <div className="flex justify-between items-center">
                                    <span className="text-black text-xs">
                                      MOMENTUM
                                    </span>
                                    <span className="text-[#00ff00] font-bold text-xs">
                                      {token.momentumScore}/100
                                    </span>
                                  </div>
                                  <Progress
                                    value={token.momentumScore}
                                    className="h-2 bg-[#f5f5f0] border border-black rounded-none"
                                  />
                                </div>

                                <div className="flex items-center justify-between">
                                  <span
                                    className={`text-xs font-bold ${getTrendColor(
                                      token.trend
                                    )}`}
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
        <div className="w-full h-px bg-black mb-4" />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Section 3 - Cross-Chain Prices */}
          <Card className="bg-[#f5f5f0] border border-black rounded-none">
            <CardHeader className="border-b border-black pb-2">
              <CardTitle className="text-sm font-bold text-black">
                CROSS-CHAIN PRICES
              </CardTitle>
              <div className="flex space-x-1">
                {Object.keys(mockPriceComparison).map((token) => (
                  <Button
                    key={token}
                    size="sm"
                    variant={selectedToken === token ? "default" : "outline"}
                    onClick={() => setSelectedToken(token)}
                    className={`text-xs font-bold rounded-none border border-black ${
                      selectedToken === token
                        ? "bg-black text-[#f5f5f0] hover:bg-black/80"
                        : "bg-[#f5f5f0] text-black hover:bg-black/10"
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
                          ? "bg-[#f5f5f0] border-[#00ff00] border-2"
                          : "bg-[#f5f5f0] border-black"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-black text-xs">
                            {price.chain.toUpperCase()}
                          </span>
                          <span className="text-xs text-black">
                            {price.symbol}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <div className="text-black font-bold text-xs">
                              ${price.price.toLocaleString()}
                            </div>
                            <div
                              className={`text-xs font-bold ${
                                price.change >= 0
                                  ? "text-[#00ff00]"
                                  : "text-[#ff0000]"
                              }`}
                            >
                              {price.change >= 0 ? "+" : ""}
                              {price.change.toFixed(2)}%
                            </div>
                          </div>
                          {isArbitrage && price.price === minPrice && (
                            <Button
                              size="sm"
                              className="bg-[#00ff00] hover:bg-[#00cc00] text-black text-xs font-bold border border-black rounded-none px-2 py-1"
                            >
                              BUY
                            </Button>
                          )}
                          {isArbitrage && price.price === maxPrice && (
                            <Button
                              size="sm"
                              className="bg-[#ff0000] hover:bg-[#cc0000] text-white text-xs font-bold border border-black rounded-none px-2 py-1"
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
          <Card className="bg-[#f5f5f0] border border-black rounded-none">
            <CardHeader className="border-b border-black pb-2">
              <CardTitle className="text-sm font-bold text-black">
                SURFING METRICS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="text-center p-2 border border-black">
                  <div className="text-lg font-bold text-[#00ff00]">$1240</div>
                  <div className="text-xs text-black">TODAY P&L</div>
                  <div className="text-xs text-[#00ff00] font-bold">+11.2%</div>
                </div>
                <div className="text-center p-2 border border-black">
                  <div className="text-lg font-bold text-black">12</div>
                  <div className="text-xs text-black">TRADES</div>
                  <div className="text-xs text-black">TODAY</div>
                </div>
                <div className="text-center p-2 border border-black">
                  <div className="text-lg font-bold text-black">24M</div>
                  <div className="text-xs text-black">AVG TIME</div>
                </div>
                <div className="text-center p-2 border border-black">
                  <div className="text-lg font-bold text-black">BSC</div>
                  <div className="text-xs text-black">BEST CHAIN</div>
                  <div className="text-xs text-[#00ff00] font-bold">+$340</div>
                </div>
              </div>

              <div className="p-2 border border-black mb-3">
                <div className="text-xs text-black font-bold mb-2">
                  ACCOUNT GROWTH
                </div>
                <RetroLineChart />
              </div>

              <div className="p-2 border border-black">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-black font-bold">
                    SURF MODE
                  </span>
                  <Switch checked={surfMode} onCheckedChange={setSurfMode} />
                </div>
                <div className="text-xs text-black mb-2">
                  AUTO-EXECUTE WHEN MOMENTUM &gt;5%
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-black font-bold">RISK:</span>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-5 px-1 bg-[#f5f5f0] border-black text-black rounded-none"
                      >
                        LOW
                      </Button>
                      <Button
                        size="sm"
                        className="text-xs h-5 px-1 bg-black text-[#f5f5f0] font-bold rounded-none"
                      >
                        MED
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-5 px-1 bg-[#f5f5f0] border-black text-black rounded-none"
                      >
                        HIGH
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-black font-bold">
                      MAX PER SURF:
                    </span>
                    <span className="text-xs text-black font-bold">$500</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Divider Line */}
        <div className="w-full h-px bg-black my-4" />

        <div className="grid grid-cols-1 gap-4">
          {/* Section 4 - Trade Log */}
          <Card className="bg-[#f5f5f0] border border-black rounded-none">
            <CardHeader className="border-b border-black pb-2">
              <CardTitle className="text-sm font-bold text-black">
                TRADE LOG
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-1">
                {mockExecutions.map((execution) => (
                  <div
                    key={execution.id}
                    className="flex items-center justify-between p-2 border border-black bg-[#f5f5f0]"
                  >
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-black font-bold">
                            {execution.time}
                          </span>
                          <span className="font-bold text-black text-xs">
                            {execution.token}
                          </span>
                          <span className="text-xs text-black">
                            {execution.chains}
                          </span>
                        </div>
                        <div className="text-xs text-black font-bold">
                          {execution.status.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    {execution.pnl !== 0 && (
                      <div
                        className={`text-xs font-bold ${
                          execution.pnl >= 0
                            ? "text-[#00ff00]"
                            : "text-[#ff0000]"
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
          className="bg-[#f5f5f0] hover:bg-black/10 text-black font-bold border-2 border-black rounded-none shadow-none"
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
