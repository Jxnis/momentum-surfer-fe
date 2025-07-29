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
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";

// Mock data interfaces
interface Token {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  momentumScore: number;
  trend: "Very Bullish" | "Building" | "Fading" | "Bearish";
  chains: string[];
  hasSurfOpportunity?: boolean;
}

interface MomentumData {
  chain: string;
  symbol: string;
  momentum: number;
  status: string;
  lag: number;
}

interface TradeExecution {
  id: string;
  time: string;
  token: string;
  chains: string;
  status: "pending" | "executing" | "completed" | "failed";
  pnl: number;
  startTime?: number;
}

interface ActivePosition {
  id: string;
  token: string;
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  entryTime: Date;
  chains: string[];
  targetProfit: number;
  stopLoss: number;
  timeLimit: number; // hours
  status: "entering" | "monitoring" | "exiting" | "completed";
  unrealizedPnL: number;
  percentageGain: number;
}

interface ExitStrategy {
  profitTarget: number; // percentage
  stopLoss: number; // percentage
  timeLimit: number; // hours
  momentumFade: number; // percentage threshold
}

interface SurfProgress {
  stage: "initiated" | "scanning" | "executing" | "spreading" | "completed";
  message: string;
  progress: number;
}

// Risk level mappings
const RISK_MULTIPLIERS = {
  LOW: 0.15, // 10-25%
  MED: 0.35, // 25-50%
  HIGH: 0.6, // 50-75%
};

// Token variants for different chains
const TOKEN_VARIANTS: { [key: string]: string[] } = {
  BTC: ["wBTC", "BTCB", "Portal BTC"],
  ETH: ["ETH", "wETH", "ETH"],
  SOL: ["SOL", "Wrapped SOL", "SOL"],
  MATIC: ["MATIC", "MATIC", "MATIC"],
  AVAX: ["AVAX", "WAVAX", "AVAX"],
  BNB: ["BNB", "BNB", "WBNB"],
  ADA: ["ADA", "ADA", "ADA"],
  DOT: ["DOT", "DOT", "DOT"],
};

// Exit strategies by token risk profile
const EXIT_STRATEGIES: { [key: string]: ExitStrategy } = {
  BTC: { profitTarget: 15, stopLoss: 8, timeLimit: 24, momentumFade: 3 },
  ETH: { profitTarget: 12, stopLoss: 6, timeLimit: 18, momentumFade: 3 },
  SOL: { profitTarget: 20, stopLoss: 10, timeLimit: 12, momentumFade: 4 },
  MATIC: { profitTarget: 18, stopLoss: 9, timeLimit: 16, momentumFade: 4 },
  AVAX: { profitTarget: 16, stopLoss: 8, timeLimit: 20, momentumFade: 3 },
  BNB: { profitTarget: 14, stopLoss: 7, timeLimit: 22, momentumFade: 3 },
  ADA: { profitTarget: 17, stopLoss: 9, timeLimit: 18, momentumFade: 4 },
  DOT: { profitTarget: 15, stopLoss: 8, timeLimit: 20, momentumFade: 3 },
};

// Mock data
const mockTokens: Token[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 43250,
    change24h: 5.2,
    momentumScore: 87,
    trend: "Very Bullish",
    chains: ["ETH", "BSC", "SOL"],
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

const mockMomentumTracking: { [key: string]: MomentumData[] } = {
  BTC: [
    {
      chain: "Ethereum",
      symbol: "wBTC",
      momentum: 8.2,
      status: "SOURCE",
      lag: 0,
    },
    {
      chain: "BSC",
      symbol: "BTCB",
      momentum: 3.1,
      status: "CATCHING UP",
      lag: 2,
    },
    {
      chain: "Polygon",
      symbol: "wBTC",
      momentum: 6.5,
      status: "FOLLOWING",
      lag: 1,
    },
    {
      chain: "Avalanche",
      symbol: "BTC.b",
      momentum: 1.8,
      status: "LAGGING",
      lag: 5,
    },
    {
      chain: "Arbitrum",
      symbol: "wBTC",
      momentum: 4.2,
      status: "SPREADING",
      lag: 3,
    },
    {
      chain: "Solana",
      symbol: "BTC",
      momentum: 0.5,
      status: "SLEEPING",
      lag: 8,
    },
  ],
  ETH: [
    {
      chain: "Ethereum",
      symbol: "ETH",
      momentum: 6.1,
      status: "SOURCE",
      lag: 0,
    },
    {
      chain: "Polygon",
      symbol: "ETH",
      momentum: 2.8,
      status: "CATCHING UP",
      lag: 3,
    },
    {
      chain: "Arbitrum",
      symbol: "ETH",
      momentum: 4.5,
      status: "FOLLOWING",
      lag: 1,
    },
    {
      chain: "Optimism",
      symbol: "ETH",
      momentum: 3.2,
      status: "SPREADING",
      lag: 2,
    },
    { chain: "BSC", symbol: "ETH", momentum: 1.9, status: "LAGGING", lag: 4 },
    {
      chain: "Avalanche",
      symbol: "WETH.e",
      momentum: 1.1,
      status: "SLEEPING",
      lag: 6,
    },
  ],
  MATIC: [
    {
      chain: "Polygon",
      symbol: "MATIC",
      momentum: 9.3,
      status: "SOURCE",
      lag: 0,
    },
    {
      chain: "Ethereum",
      symbol: "MATIC",
      momentum: 4.7,
      status: "CATCHING UP",
      lag: 2,
    },
    { chain: "BSC", symbol: "MATIC", momentum: 2.4, status: "LAGGING", lag: 4 },
    {
      chain: "Avalanche",
      symbol: "MATIC",
      momentum: 1.2,
      status: "SLEEPING",
      lag: 6,
    },
  ],
};

const initialExecutions: TradeExecution[] = [
  {
    id: "1",
    time: "14:32",
    token: "BTC",
    chains: "4-CHAINS",
    status: "completed",
    pnl: 125,
  },
  {
    id: "2",
    time: "14:28",
    token: "MATIC",
    chains: "3-CHAINS",
    status: "executing",
    pnl: 0,
    startTime: Date.now() - 45000,
  },
  {
    id: "3",
    time: "14:25",
    token: "ETH",
    chains: "2-CHAINS",
    status: "pending",
    pnl: 0,
  },
  {
    id: "4",
    time: "14:20",
    token: "SOL",
    chains: "1-CHAIN",
    status: "failed",
    pnl: -45,
  },
  {
    id: "5",
    time: "14:18",
    token: "AVAX",
    chains: "2-CHAINS",
    status: "completed",
    pnl: 89,
  },
];

// Mock active positions for demonstration
const initialActivePositions: ActivePosition[] = [
  {
    id: "pos_1",
    token: "BTC",
    entryPrice: 43180,
    currentPrice: 43950,
    quantity: 0.025,
    entryTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    chains: ["ETH", "BSC", "SOL"],
    targetProfit: 15,
    stopLoss: 8,
    timeLimit: 24,
    status: "monitoring",
    unrealizedPnL: 19.25,
    percentageGain: 1.78,
  },
];

// Helper functions
const calculatePositionPnL = (
  position: ActivePosition
): { unrealizedPnL: number; percentageGain: number } => {
  const entryValue = position.entryPrice * position.quantity;
  const currentValue = position.currentPrice * position.quantity;
  const unrealizedPnL = currentValue - entryValue;
  const percentageGain = (unrealizedPnL / entryValue) * 100;

  return {
    unrealizedPnL: Math.round(unrealizedPnL),
    percentageGain: Math.round(percentageGain * 100) / 100,
  };
};

const shouldExitPosition = (
  position: ActivePosition,
  currentMomentum: number
): boolean => {
  const strategy = EXIT_STRATEGIES[position.token];
  const timeElapsed =
    (Date.now() - position.entryTime.getTime()) / (1000 * 60 * 60); // hours

  return (
    position.percentageGain >= strategy.profitTarget ||
    position.percentageGain <= -strategy.stopLoss ||
    timeElapsed >= strategy.timeLimit ||
    currentMomentum < strategy.momentumFade
  );
};

const getTrendColor = (trend: string, isDark: boolean) => {
  switch (trend) {
    case "Very Bullish":
    case "Building":
      return isDark ? "text-green-400" : "text-[#228B22]";
    case "Fading":
    case "Bearish":
      return "text-red-500";
    default:
      return isDark ? "text-[#F6F2E4]" : "text-black";
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

// Realistic account growth chart with month legends
const RealisticAccountChart = ({
  isDark,
  totalBalance,
}: {
  isDark: boolean;
  totalBalance: number;
}) => {
  // More realistic 12-month growth data with volatility
  const monthlyData = [
    { month: "Jan", value: 1000 },
    { month: "Feb", value: 1080 },
    { month: "Mar", value: 1050 },
    { month: "Apr", value: 1180 },
    { month: "May", value: 1150 },
    { month: "Jun", value: 1280 },
    { month: "Jul", value: 1220 },
    { month: "Aug", value: 1350 },
    { month: "Sep", value: 1320 },
    { month: "Oct", value: 1480 },
    { month: "Nov", value: 1450 },
    { month: "Dec", value: totalBalance },
  ];

  const max = Math.max(...monthlyData.map((d) => d.value));
  const min = Math.min(...monthlyData.map((d) => d.value));

  return (
    <div className="space-y-2">
      {/* Portfolio overview */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <div
            className={`text-sm font-bold ${
              isDark ? "text-green-400" : "text-[#228B22]"
            }`}
            style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: "12px",
            }}
          >
            ${totalBalance.toLocaleString()}
          </div>
          <div
            className={`text-xs ${isDark ? "text-[#F6F2E4]" : "text-black"}`}
          >
            TOTAL PORTFOLIO
          </div>
        </div>
        <div className="text-right">
          <div
            className={`text-xs ${
              isDark ? "text-green-400" : "text-[#228B22]"
            } font-bold`}
          >
            +${(totalBalance - 1000).toLocaleString()}
          </div>
          <div
            className={`text-xs ${isDark ? "text-[#F6F2E4]" : "text-black"}`}
          >
            ALL TIME P&L
          </div>
        </div>
      </div>

      {/* Chart */}
      <div
        className={`h-32 w-full relative ${
          isDark ? "bg-black" : "bg-[#F6F2E4]"
        }`}
      >
        <svg className="w-full h-full" viewBox="0 0 400 128">
          {/* Chart line */}
          <polyline
            fill="none"
            stroke={isDark ? "#22c55e" : "#228B22"}
            strokeWidth="2"
            points={monthlyData
              .map((point, index) => {
                const x = (index / (monthlyData.length - 1)) * 380 + 10;
                const y = 100 - ((point.value - min) / (max - min)) * 80;
                return `${x},${y}`;
              })
              .join(" ")}
          />

          {/* Grid lines */}
          <line
            x1="10"
            y1="25"
            x2="390"
            y2="25"
            stroke={isDark ? "#F6F2E4" : "black"}
            strokeWidth="0.5"
            opacity="0.2"
          />
          <line
            x1="10"
            y1="50"
            x2="390"
            y2="50"
            stroke={isDark ? "#F6F2E4" : "black"}
            strokeWidth="0.5"
            opacity="0.2"
          />
          <line
            x1="10"
            y1="75"
            x2="390"
            y2="75"
            stroke={isDark ? "#F6F2E4" : "black"}
            strokeWidth="0.5"
            opacity="0.2"
          />
        </svg>
      </div>

      {/* Month legends */}
      <div className="flex justify-between text-xs px-2">
        {monthlyData.slice(-6).map((point, index) => (
          <span
            key={point.month}
            className={`${isDark ? "text-[#F6F2E4]" : "text-black"} opacity-70`}
          >
            {point.month}
          </span>
        ))}
      </div>
    </div>
  );
};

// Loading skeleton component
const TokenSkeleton = ({ isDark }: { isDark: boolean }) => (
  <Card
    className={`${isDark ? "bg-black" : "bg-[#F6F2E4]"} ${
      isDark ? "border-[#F6F2E4]" : "border-black"
    } rounded-none`}
  >
    <CardContent className="p-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div
            className={`h-4 w-12 ${
              isDark ? "bg-[#F6F2E4]/20" : "bg-black/20"
            } animate-pulse`}
          />
          <div
            className={`h-3 w-8 ${
              isDark ? "bg-[#F6F2E4]/20" : "bg-black/20"
            } animate-pulse`}
          />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <div
              className={`h-3 w-6 ${
                isDark ? "bg-[#F6F2E4]/20" : "bg-black/20"
              } animate-pulse`}
            />
            <div
              className={`h-3 w-16 ${
                isDark ? "bg-[#F6F2E4]/20" : "bg-black/20"
              } animate-pulse`}
            />
          </div>
          <div
            className={`h-2 w-full ${
              isDark ? "bg-[#F6F2E4]/20" : "bg-black/20"
            } animate-pulse`}
          />
          <div
            className={`h-3 w-20 ${
              isDark ? "bg-[#F6F2E4]/20" : "bg-black/20"
            } animate-pulse`}
          />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Enhanced Surf Modal with dynamic token variants and exit strategy
const SurfModal = ({
  isOpen,
  onClose,
  token,
  isDark,
  onConfirm,
  balance,
  riskLevel,
  momentumScore,
}: {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  isDark: boolean;
  onConfirm: (amount: number) => void;
  balance: number;
  riskLevel: keyof typeof RISK_MULTIPLIERS;
  momentumScore: number;
}) => {
  if (!isOpen) return null;

  // Intelligent surf amount calculation
  const riskMultiplier = RISK_MULTIPLIERS[riskLevel];
  const momentumMultiplier = momentumScore / 100;
  const calculatedAmount = Math.round(
    balance * riskMultiplier * momentumMultiplier
  );
  const percentageOfBalance = Math.round((calculatedAmount / balance) * 100);

  // Get exit strategy for this token
  const exitStrategy = EXIT_STRATEGIES[token] || EXIT_STRATEGIES.BTC;

  // Get dynamic token variants
  const tokenVariants = TOKEN_VARIANTS[token] || [token, token, token];

  const bgClass = isDark ? "bg-black" : "bg-[#F6F2E4]";
  const textClass = isDark ? "text-[#F6F2E4]" : "text-black";
  const borderClass = isDark ? "border-[#F6F2E4]" : "border-black";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`${bgClass} ${borderClass} border-2 p-6 max-w-md w-full mx-4 font-mono`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2
            className={`${textClass} font-bold text-lg`}
            style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: "14px",
            }}
          >
            {token} MOMENTUM DETECTED!
          </h2>
          <Button
            onClick={onClose}
            className={`${textClass} hover:bg-red-500 p-1 border-none bg-transparent`}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className={`${textClass} space-y-4 text-xs`}>
          <p>
            ENTER POSITION: BUY {token} ON ALL CHAINS WITH $
            {calculatedAmount.toLocaleString()}?
          </p>

          <div className="space-y-2">
            <p className="font-bold">ENTRY STRATEGY:</p>
            <div className={`border ${borderClass} p-3 space-y-2`}>
              <div className="flex justify-between">
                <span>MOMENTUM SCORE:</span>
                <span className="text-green-500 font-bold">
                  {momentumScore}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>POSITION SIZE:</span>
                <span className="font-bold">
                  ${calculatedAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>% OF BALANCE:</span>
                <span className="text-green-500 font-bold">
                  {percentageOfBalance}%
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-bold">EXIT CONDITIONS:</p>
            <div className={`border ${borderClass} p-3 space-y-1`}>
              <div className="flex justify-between">
                <span>TARGET PROFIT:</span>
                <span className="text-green-500 font-bold">
                  +{exitStrategy.profitTarget}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>STOP LOSS:</span>
                <span className="text-red-500 font-bold">
                  -{exitStrategy.stopLoss}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>TIME LIMIT:</span>
                <span className="font-bold">{exitStrategy.timeLimit}H</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-bold">PURCHASE TARGETS:</p>
            <div className="grid grid-cols-3 gap-2">
              {tokenVariants.map((variant, index) => (
                <div
                  key={index}
                  className={`border ${borderClass} p-2 text-center`}
                >
                  {variant}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button
              onClick={() => onConfirm(calculatedAmount)}
              className="flex-1 bg-green-500 hover:bg-green-600 text-black font-bold border border-black rounded-none text-xs"
            >
              ENTER POSITION
            </Button>
            <Button
              onClick={onClose}
              className={`flex-1 ${bgClass} ${textClass} ${borderClass} hover:bg-red-500 hover:text-white rounded-none text-xs`}
            >
              CANCEL
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Position Monitoring Modal (replaces the instant progress modal)
const PositionModal = ({
  isOpen,
  position,
  isDark,
  onClose,
  onExit,
}: {
  isOpen: boolean;
  position: ActivePosition | null;
  isDark: boolean;
  onClose: () => void;
  onExit: (positionId: string) => void;
}) => {
  if (!isOpen || !position) return null;

  const bgClass = isDark ? "bg-black" : "bg-[#F6F2E4]";
  const textClass = isDark ? "text-[#F6F2E4]" : "text-black";
  const borderClass = isDark ? "border-[#F6F2E4]" : "border-black";

  const timeHeld = Math.floor(
    (Date.now() - position.entryTime.getTime()) / (1000 * 60 * 60 * 1000)
  );
  const timeRemaining = Math.max(0, position.timeLimit - timeHeld);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${bgClass} ${borderClass} border-2 p-6 max-w-md w-full mx-4 font-mono`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2
            className={`${textClass} font-bold text-lg`}
            style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: "14px",
            }}
          >
            MONITORING {position.token} POSITION
          </h2>
          <Button
            onClick={onClose}
            className={`${textClass} hover:bg-red-500 p-1 border-none bg-transparent`}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className={`${textClass} space-y-4 text-xs`}>
          <div className="space-y-2">
            <p className="font-bold">CURRENT STATUS:</p>
            <div className={`border ${borderClass} p-3 space-y-2`}>
              <div className="flex justify-between">
                <span>ENTRY PRICE:</span>
                <span className="font-bold">
                  ${position.entryPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>CURRENT PRICE:</span>
                <span className="font-bold">
                  ${position.currentPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>UNREALIZED P&L:</span>
                <span
                  className={`font-bold ${
                    position.unrealizedPnL >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {position.unrealizedPnL >= 0 ? "+" : ""}$
                  {position.unrealizedPnL}
                </span>
              </div>
              <div className="flex justify-between">
                <span>PERCENTAGE GAIN:</span>
                <span
                  className={`font-bold ${
                    position.percentageGain >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {position.percentageGain >= 0 ? "+" : ""}
                  {position.percentageGain}%
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-bold">MOMENTUM STATUS:</p>
            <div className={`border ${borderClass} p-3 space-y-1`}>
              <div className="flex justify-between">
                <span>TIME HELD:</span>
                <span className="font-bold">
                  {timeHeld}H{" "}
                  {Math.floor(
                    (Date.now() - position.entryTime.getTime()) / (1000 * 60)
                  ) % 60}
                  M
                </span>
              </div>
              <div className="flex justify-between">
                <span>TIME REMAINING:</span>
                <span className="font-bold">{timeRemaining}H</span>
              </div>
              <div className="flex justify-between">
                <span>STATUS:</span>
                <span className="text-green-500 font-bold">
                  MOMENTUM SPREADING
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button
              onClick={() => onExit(position.id)}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold border border-black rounded-none text-xs"
            >
              EXIT POSITION NOW
            </Button>
            <Button
              onClick={onClose}
              className={`flex-1 ${bgClass} ${textClass} ${borderClass} hover:bg-gray-500 hover:text-white rounded-none text-xs`}
            >
              KEEP MONITORING
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

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
  const [tokensWithOpportunities, setTokensWithOpportunities] =
    useState<Token[]>(mockTokens);
  const [scanningStep, setScanningStep] = useState(0);
  const [showSurfModal, setShowSurfModal] = useState(false);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [selectedSurfToken, setSelectedSurfToken] = useState("");
  const [selectedMomentumScore, setSelectedMomentumScore] = useState(0);
  const [selectedPosition, setSelectedPosition] =
    useState<ActivePosition | null>(null);
  const [tradeExecutions, setTradeExecutions] =
    useState<TradeExecution[]>(initialExecutions);
  const [activePositions, setActivePositions] = useState<ActivePosition[]>(
    initialActivePositions
  );
  const [accountBalance, setAccountBalance] = useState(2350);
  const [riskLevel, setRiskLevel] =
    useState<keyof typeof RISK_MULTIPLIERS>("MED");
  const [continuousMonitoring, setContinuousMonitoring] = useState(false);
  const [lastOpportunityCheck, setLastOpportunityCheck] = useState(new Date());

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Continuous background monitoring for opportunities
  useEffect(() => {
    if (surfMode && continuousMonitoring) {
      const monitoringInterval = setInterval(() => {
        // Check for new momentum opportunities
        const highMomentumTokens = mockTokens.filter(
          (token) =>
            token.momentumScore >= momentumThreshold[0] * 10 &&
            !activePositions.some((pos) => pos.token === token.symbol)
        );

        if (highMomentumTokens.length > 0) {
          // Auto-detect new opportunities
          setLastOpportunityCheck(new Date());

          // For demo: randomly trigger opportunity notifications
          if (Math.random() > 0.7) {
            const opportunity = highMomentumTokens[0];
            setSelectedSurfToken(opportunity.symbol);
            setSelectedMomentumScore(opportunity.momentumScore);
            setShowSurfModal(true);
          }
        }
      }, 30000); // Check every 30 seconds

      return () => clearInterval(monitoringInterval);
    }
  }, [surfMode, continuousMonitoring, momentumThreshold, activePositions]);

  // Position monitoring and exit condition checking
  useEffect(() => {
    const positionTimer = setInterval(() => {
      setActivePositions((prev) =>
        prev.map((position) => {
          // Simulate price movements
          const priceChange = (Math.random() - 0.5) * 0.02; // ±1% random movement
          const newPrice = position.currentPrice * (1 + priceChange);

          // Calculate current P&L
          const { unrealizedPnL, percentageGain } = calculatePositionPnL({
            ...position,
            currentPrice: newPrice,
          });

          const updatedPosition = {
            ...position,
            currentPrice: newPrice,
            unrealizedPnL,
            percentageGain,
          };

          // Check exit conditions
          const currentMomentum =
            mockMomentumTracking[position.token]?.[0]?.momentum || 0;

          if (shouldExitPosition(updatedPosition, currentMomentum)) {
            // Auto-exit position
            setTimeout(() => {
              handlePositionExit(position.id, true);
            }, 1000);
          }

          return updatedPosition;
        })
      );
    }, 5000); // Update every 5 seconds

    return () => clearInterval(positionTimer);
  }, [activePositions]);

  // Enhanced scanning animation
  useEffect(() => {
    if (isScanning) {
      const dotsTimer = setInterval(() => {
        setScanningDots((prev) => {
          if (prev === "...") return "";
          return prev + ".";
        });
      }, 400);

      const stepTimer = setInterval(() => {
        setScanningStep((prev) => (prev + 1) % 6);
      }, 800);

      return () => {
        clearInterval(dotsTimer);
        clearInterval(stepTimer);
      };
    }
  }, [isScanning]);

  // Background trade execution completion
  useEffect(() => {
    const timer = setInterval(() => {
      setTradeExecutions((prev) =>
        prev.map((trade) => {
          if (trade.status === "executing" && trade.startTime) {
            const elapsed = Date.now() - trade.startTime;
            if (elapsed > 90000) {
              // Complete trade entry (not final profit)
              return { ...trade, status: "completed", pnl: 0 };
            }
          }
          return trade;
        })
      );
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const handleMomentumScan = () => {
    setIsScanning(true);
    setScanningStep(0);
    setTimeout(() => {
      const updatedTokens = tokensWithOpportunities.map((token) => ({
        ...token,
        hasSurfOpportunity: token.momentumScore >= momentumThreshold[0] * 10,
      }));
      setTokensWithOpportunities(updatedTokens);
      setIsScanning(false);
      setScanningDots("");
      setScanningStep(0);

      // Enable continuous monitoring after first scan
      setContinuousMonitoring(true);
    }, 5000);
  };

  const handleSurf = (tokenSymbol: string) => {
    const token = tokensWithOpportunities.find((t) => t.symbol === tokenSymbol);
    setSelectedSurfToken(tokenSymbol);
    setSelectedMomentumScore(token?.momentumScore || 0);
    setShowSurfModal(true);
  };

  const handleSurfConfirm = (amount: number) => {
    setShowSurfModal(false);

    // Create new active position
    const token = tokensWithOpportunities.find(
      (t) => t.symbol === selectedSurfToken
    );
    if (!token) return;

    const exitStrategy =
      EXIT_STRATEGIES[selectedSurfToken] || EXIT_STRATEGIES.BTC;
    const chainCount = Math.floor(Math.random() * 3) + 2;

    const newPosition: ActivePosition = {
      id: `pos_${Date.now()}`,
      token: selectedSurfToken,
      entryPrice: token.price,
      currentPrice: token.price,
      quantity: amount / token.price,
      entryTime: new Date(),
      chains: token.chains.slice(0, chainCount),
      targetProfit: exitStrategy.profitTarget,
      stopLoss: exitStrategy.stopLoss,
      timeLimit: exitStrategy.timeLimit,
      status: "entering",
      unrealizedPnL: 0,
      percentageGain: 0,
    };

    setActivePositions((prev) => [...prev, newPosition]);
    setAccountBalance((prev) => prev - amount);

    // Add trade execution entry
    const newTrade: TradeExecution = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString().slice(0, 5),
      token: selectedSurfToken,
      chains: `${chainCount}-CHAINS`,
      status: "executing",
      pnl: 0,
      startTime: Date.now(),
    };

    setTradeExecutions((prev) => [newTrade, ...prev]);

    // Update position status to monitoring after entry
    setTimeout(() => {
      setActivePositions((prev) =>
        prev.map((pos) =>
          pos.id === newPosition.id ? { ...pos, status: "monitoring" } : pos
        )
      );
    }, 3000);

    // Remove surf opportunity
    setTokensWithOpportunities((prev) =>
      prev.map((token) =>
        token.symbol === selectedSurfToken
          ? { ...token, hasSurfOpportunity: false }
          : token
      )
    );
  };

  const handlePositionClick = (position: ActivePosition) => {
    setSelectedPosition(position);
    setShowPositionModal(true);
  };

  const handlePositionExit = (
    positionId: string,
    autoExit: boolean = false
  ) => {
    const position = activePositions.find((p) => p.id === positionId);
    if (!position) return;

    // Close position and realize P&L
    setAccountBalance((prev) => prev + position.unrealizedPnL);

    // Update trade log with final result
    const finalTrade: TradeExecution = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString().slice(0, 5),
      token: position.token,
      chains: `${position.chains.length}-CHAINS`,
      status: "completed",
      pnl: position.unrealizedPnL,
    };

    setTradeExecutions((prev) => [finalTrade, ...prev]);

    // Remove position
    setActivePositions((prev) => prev.filter((p) => p.id !== positionId));

    if (!autoExit) {
      setShowPositionModal(false);
    }
  };

  const filteredTokens = tokensWithOpportunities.filter(
    (token) => token.momentumScore >= momentumThreshold[0] * 10
  );

  // Calculate total unrealized P&L
  const totalUnrealizedPnL = activePositions.reduce(
    (sum, pos) => sum + pos.unrealizedPnL,
    0
  );
  const todaysPnL = accountBalance + totalUnrealizedPnL - 2000;

  // Define classes based on theme
  const bgClass = isDark ? "bg-black" : "bg-[#F6F2E4]";
  const cardBgClass = isDark ? "bg-black" : "bg-[#F6F2E4]";
  const textClass = isDark ? "text-[#F6F2E4]" : "text-black";
  const borderClass = isDark ? "border-[#F6F2E4]" : "border-black";
  const successClass = isDark ? "text-green-400" : "text-[#228B22]";
  const hoverClass = isDark ? "hover:bg-[#F6F2E4]/10" : "hover:bg-black/10";

  const getScanningText = () => {
    const steps = [
      "SCANNING MARKETS FOR MOMENTUM PATTERNS",
      "ANALYZING CHAIN VELOCITY AND SPREAD",
      "CALCULATING BTC... ETH... SOL MOMENTUM",
      "DETECTING PUMP PROPAGATION WAVES",
      "EVALUATING SURF WAVE STRENGTH",
      "FINALIZING MOMENTUM SURF TARGETS",
    ];
    return steps[scanningStep] + scanningDots;
  };

  return (
    <div
      className={`min-h-screen ${bgClass} ${textClass} font-mono text-xs transition-colors`}
    >
      {/* Header */}
      <header className={`${bgClass}`}>
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
                {continuousMonitoring ? "MONITORING" : "LIVE"}
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
        {/* Active Positions Section */}
        {activePositions.length > 0 && (
          <div className="grid grid-cols-1 gap-4 mb-4">
            <Card className={`${cardBgClass} ${borderClass} rounded-none`}>
              <CardHeader className={`pb-2 border-b ${borderClass}`}>
                <CardTitle className={`text-sm font-bold ${textClass}`}>
                  ACTIVE POSITIONS ({activePositions.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-2">
                  {activePositions.map((position) => (
                    <div
                      key={position.id}
                      onClick={() => handlePositionClick(position)}
                      className={`p-3 border ${borderClass} ${hoverClass} cursor-pointer transition-all`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className={`font-bold ${textClass}`}>
                            {position.token}
                          </span>
                          <span className={`text-xs ${textClass}`}>
                            ${position.entryPrice.toLocaleString()} → $
                            {position.currentPrice.toLocaleString()}
                          </span>
                          <span className={`text-xs ${textClass}`}>
                            {position.chains.length} CHAINS
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div
                              className={`text-xs font-bold ${
                                position.unrealizedPnL >= 0
                                  ? successClass
                                  : "text-red-500"
                              }`}
                            >
                              {position.unrealizedPnL >= 0 ? "+" : ""}$
                              {position.unrealizedPnL}
                            </div>
                            <div
                              className={`text-xs ${
                                position.percentageGain >= 0
                                  ? successClass
                                  : "text-red-500"
                              }`}
                            >
                              {position.percentageGain >= 0 ? "+" : ""}
                              {position.percentageGain}%
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={`rounded-none text-xs ${borderClass} ${textClass} ${cardBgClass}`}
                          >
                            {position.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Momentum Scanner */}
        <div className="grid grid-cols-1 gap-4 mb-4">
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
                <div className={`${successClass} text-xs mt-2 font-bold`}>
                  ▶ {getScanningText()}
                </div>
              )}
              {continuousMonitoring && !isScanning && (
                <div className={`${textClass} text-xs mt-2`}>
                  CONTINUOUS MONITORING ACTIVE - LAST CHECK:{" "}
                  {lastOpportunityCheck.toLocaleTimeString()}
                </div>
              )}
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <AnimatePresence mode="wait">
                  {isScanning
                    ? [...Array(8)].map((_, index) => (
                        <TokenSkeleton
                          key={`skeleton-${index}`}
                          isDark={isDark}
                        />
                      ))
                    : filteredTokens.map((token, index) => (
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
                                    className={`text-xs font-bold ${getTrendColor(
                                      token.trend,
                                      isDark
                                    )}`}
                                  >
                                    {token.trend.toUpperCase()}
                                  </span>
                                  {token.hasSurfOpportunity &&
                                    !activePositions.some(
                                      (pos) => pos.token === token.symbol
                                    ) && (
                                      <Button
                                        size="sm"
                                        onClick={() => handleSurf(token.symbol)}
                                        className="bg-green-500 hover:bg-green-600 text-black font-bold rounded-none text-xs px-2 py-1 h-6"
                                      >
                                        SURF
                                      </Button>
                                    )}
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

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Momentum Wave Tracker */}
          <Card className={`${cardBgClass} ${borderClass} rounded-none`}>
            <CardHeader className={`border-b ${borderClass} pb-2`}>
              <CardTitle className={`text-sm font-bold ${textClass}`}>
                MOMENTUM WAVE TRACKER
              </CardTitle>
              <div className="flex space-x-1">
                {Object.keys(mockMomentumTracking).map((token) => (
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
                {mockMomentumTracking[selectedToken]?.map((momentum, index) => {
                  const isSource = momentum.status === "SOURCE";
                  const isActive = momentum.momentum > 2;

                  return (
                    <div
                      key={index}
                      className={`p-2 border transition-all ${
                        isSource
                          ? `${cardBgClass} border-green-500 border-2`
                          : `${cardBgClass} ${borderClass}`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold ${textClass} text-xs`}>
                            {momentum.chain.toUpperCase()}
                          </span>
                          <span className={`text-xs ${textClass}`}>
                            {momentum.symbol}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <div className={`${textClass} font-bold text-xs`}>
                              +{momentum.momentum.toFixed(1)}%
                            </div>
                            <div
                              className={`text-xs font-bold ${
                                isActive
                                  ? isDark
                                    ? "text-green-400"
                                    : "text-[#228B22]"
                                  : "text-orange-500"
                              }`}
                            >
                              {momentum.status}
                            </div>
                          </div>
                          <div
                            className={`text-xs ${textClass} w-8 text-right`}
                          >
                            {momentum.lag}s
                          </div>
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
                    className={`text-lg font-bold ${
                      todaysPnL >= 0 ? successClass : "text-red-500"
                    }`}
                    style={{
                      fontFamily: '"Press Start 2P", monospace',
                      fontSize: "16px",
                    }}
                  >
                    {todaysPnL >= 0 ? "+" : ""}${todaysPnL.toLocaleString()}
                  </div>
                  <div className={`text-xs ${textClass}`}>TODAY P&L</div>
                  <div
                    className={`text-xs ${
                      todaysPnL >= 0 ? successClass : "text-red-500"
                    } font-bold`}
                  >
                    {todaysPnL >= 0 ? "+" : ""}
                    {((todaysPnL / 2000) * 100).toFixed(1)}%
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
                    {
                      tradeExecutions.filter((t) => t.status === "completed")
                        .length
                    }
                  </div>
                  <div className={`text-xs ${textClass}`}>COMPLETED</div>
                  <div className={`text-xs ${textClass}`}>SURFS</div>
                </div>
                <div className={`text-center p-2 border ${borderClass}`}>
                  <div
                    className={`text-lg font-bold ${textClass}`}
                    style={{
                      fontFamily: '"Press Start 2P", monospace',
                      fontSize: "16px",
                    }}
                  >
                    {activePositions.length}
                  </div>
                  <div className={`text-xs ${textClass}`}>ACTIVE</div>
                  <div className={`text-xs ${textClass}`}>POSITIONS</div>
                </div>
                <div className={`text-center p-2 border ${borderClass}`}>
                  <div
                    className={`text-lg font-bold ${
                      totalUnrealizedPnL >= 0 ? successClass : "text-red-500"
                    }`}
                    style={{
                      fontFamily: '"Press Start 2P", monospace',
                      fontSize: "16px",
                    }}
                  >
                    {totalUnrealizedPnL >= 0 ? "+" : ""}$
                    {Math.round(totalUnrealizedPnL)}
                  </div>
                  <div className={`text-xs ${textClass}`}>UNREALIZED</div>
                  <div className={`text-xs ${textClass}`}>P&L</div>
                </div>
              </div>

              <div className={`p-2 border ${borderClass} mb-3`}>
                <div className={`text-xs ${textClass} font-bold mb-2`}>
                  ACCOUNT GROWTH
                </div>
                <RealisticAccountChart
                  isDark={isDark}
                  totalBalance={accountBalance + totalUnrealizedPnL}
                />
              </div>

              <div className={`p-2 border ${borderClass}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs ${textClass} font-bold`}>
                    SURF MODE
                  </span>
                  <Switch checked={surfMode} onCheckedChange={setSurfMode} />
                </div>
                <div className={`text-xs ${textClass} mb-2`}>
                  AUTO-EXECUTE WHEN MOMENTUM &gt;{momentumThreshold[0] * 10}%
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${textClass} font-bold`}>
                      RISK:
                    </span>
                    <div className="flex space-x-1">
                      {(["LOW", "MED", "HIGH"] as const).map((level) => (
                        <Button
                          key={level}
                          size="sm"
                          variant={riskLevel === level ? "default" : "outline"}
                          onClick={() => setRiskLevel(level)}
                          className={`text-xs h-5 px-1 rounded-none ${
                            riskLevel === level
                              ? `${
                                  isDark
                                    ? "bg-[#F6F2E4] text-black"
                                    : "bg-black text-[#F6F2E4]"
                                } font-bold`
                              : `${cardBgClass} ${borderClass} ${textClass}`
                          }`}
                        >
                          {level}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${textClass} font-bold`}>
                      BALANCE:
                    </span>
                    <span className={`text-xs ${textClass} font-bold`}>
                      ${accountBalance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 mt-4">
          {/* Trade Log */}
          <Card className={`${cardBgClass} ${borderClass} rounded-none`}>
            <CardHeader className={`border-b ${borderClass} pb-2`}>
              <CardTitle className={`text-sm font-bold ${textClass}`}>
                TRADE LOG
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-1">
                {tradeExecutions.slice(0, 8).map((execution) => (
                  <div
                    key={execution.id}
                    className={`flex items-center justify-between py-1 px-2 border-b ${
                      isDark ? "border-[#F6F2E4]/20" : "border-black/20"
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
              {continuousMonitoring ? "SCAN NOW" : "START MONITORING"}
            </>
          )}
        </Button>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showSurfModal && (
          <SurfModal
            isOpen={showSurfModal}
            onClose={() => setShowSurfModal(false)}
            token={selectedSurfToken}
            isDark={isDark}
            onConfirm={handleSurfConfirm}
            balance={accountBalance}
            riskLevel={riskLevel}
            momentumScore={selectedMomentumScore}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPositionModal && (
          <PositionModal
            isOpen={showPositionModal}
            position={selectedPosition}
            isDark={isDark}
            onClose={() => setShowPositionModal(false)}
            onExit={handlePositionExit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
