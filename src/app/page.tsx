"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Activity, Zap, Settings, Wallet, ArrowUpRight, Target, BarChart3, Clock, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"

// Mock data interfaces
interface Token {
  symbol: string
  name: string
  price: number
  change24h: number
  momentumScore: number
  trend: "Very Bullish" | "Building" | "Fading" | "Bearish"
  chains: string[]
}

interface Position {
  id: string
  token: string
  chain: string
  symbol: string
  entryPrice: number
  currentPrice: number
  pnl: number
  size: number
  pnlPercentage: number
}

interface PriceData {
  chain: string
  symbol: string
  price: number
  change: number
}

interface TradeExecution {
  id: string
  time: string
  token: string
  chains: string
  status: "pending" | "executing" | "completed" | "failed"
  pnl: number
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
  { symbol: "SOL", name: "Solana", price: 98.5, change24h: -2.1, momentumScore: 45, trend: "Fading", chains: ["SOL"] },
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
]

const mockPositions: Position[] = [
  {
    id: "1",
    token: "BTC",
    chain: "Ethereum",
    symbol: "wBTC",
    entryPrice: 41200,
    currentPrice: 43250,
    pnl: 2050,
    size: 0.5,
    pnlPercentage: 4.97,
  },
  {
    id: "2",
    token: "ETH",
    chain: "Polygon",
    symbol: "ETH",
    entryPrice: 2580,
    currentPrice: 2650,
    pnl: 70,
    size: 2.0,
    pnlPercentage: 2.71,
  },
  {
    id: "3",
    token: "MATIC",
    chain: "Ethereum",
    symbol: "MATIC",
    entryPrice: 0.78,
    currentPrice: 0.85,
    pnl: 350,
    size: 5000,
    pnlPercentage: 8.97,
  },
]

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
}

const mockExecutions: TradeExecution[] = [
  { id: "1", time: "14:32:15", token: "BTC", chains: "ETH→BSC", status: "completed", pnl: 125 },
  { id: "2", time: "14:28:42", token: "MATIC", chains: "ETH→MATIC", status: "executing", pnl: 0 },
  { id: "3", time: "14:25:18", token: "ETH", chains: "MATIC→ARB", status: "pending", pnl: 0 },
  { id: "4", time: "14:20:33", token: "SOL", chains: "SOL", status: "failed", pnl: -45 },
]

const chainIcons: { [key: string]: string } = {
  Ethereum: "🔷",
  BSC: "🟡",
  Polygon: "🟣",
  Solana: "🌟",
  Arbitrum: "🔵",
  Optimism: "🔴",
  Avalanche: "🔺",
}

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case "Very Bullish":
      return "🚀"
    case "Building":
      return "📈"
    case "Fading":
      return "⚡"
    case "Bearish":
      return "📉"
    default:
      return "📊"
  }
}

const getTrendColor = (trend: string) => {
  switch (trend) {
    case "Very Bullish":
      return "text-green-400"
    case "Building":
      return "text-blue-400"
    case "Fading":
      return "text-yellow-400"
    case "Bearish":
      return "text-red-400"
    default:
      return "text-gray-400"
  }
}

export default function MomentumSurferDashboard() {
  const [momentumThreshold, setMomentumThreshold] = useState([5])
  const [surfMode, setSurfMode] = useState(false)
  const [selectedToken, setSelectedToken] = useState("BTC")
  const [isConnected, setIsConnected] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const filteredTokens = mockTokens.filter((token) => token.momentumScore >= momentumThreshold[0] * 10)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-30"
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-gray-800/50 backdrop-blur-xl bg-black/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.h1
                className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                Multi-Chain Momentum Surfer 🏄‍♂️
              </motion.h1>
              <Badge variant="outline" className="border-green-500 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                LIVE
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400 font-mono">{currentTime.toLocaleTimeString()}</div>
              <div className="flex items-center space-x-2">
                <Wallet className="w-4 h-4" />
                <span className={`text-sm ${isConnected ? "text-green-400" : "text-red-400"}`}>
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6 relative z-10">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* Section 1 - Live Momentum Scanner */}
          <Card className="xl:col-span-2 bg-black/40 border-gray-800/50 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-cyan-400 flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Live Momentum Scanner
                </CardTitle>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">Threshold:</span>
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
                    <span className="text-sm text-cyan-400 font-mono">{momentumThreshold[0]}%</span>
                  </div>
                  <Button
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                    size="sm"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    DETECT NOW
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredTokens.map((token, index) => (
                  <motion.div
                    key={token.symbol}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <Card className="bg-gray-900/50 border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 backdrop-blur-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-lg">{token.symbol}</span>
                            <div className="flex space-x-1">
                              {token.chains.map((chain) => (
                                <span key={chain} className="text-xs">
                                  {chainIcons[chain] || "⚪"}
                                </span>
                              ))}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={`${
                              token.change24h >= 3
                                ? "border-green-500 text-green-400"
                                : token.change24h <= -3
                                  ? "border-red-500 text-red-400"
                                  : "border-gray-500 text-gray-400"
                            }`}
                          >
                            {token.change24h >= 0 ? "+" : ""}
                            {token.change24h.toFixed(1)}%
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Price</span>
                            <span className="font-mono text-white">${token.price.toLocaleString()}</span>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400 text-sm">Momentum</span>
                              <span className="font-mono text-cyan-400">{token.momentumScore}/100</span>
                            </div>
                            <Progress value={token.momentumScore} className="h-2 bg-gray-800" />
                          </div>

                          <div className="flex items-center justify-between">
                            <span className={`text-sm flex items-center ${getTrendColor(token.trend)}`}>
                              <span className="mr-1">{getTrendIcon(token.trend)}</span>
                              {token.trend}
                            </span>
                          </div>
                        </div>

                        {token.momentumScore >= 80 && (
                          <motion.div
                            className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Section 2 - Cross-Chain Positions Tracker */}
          <Card className="bg-black/40 border-gray-800/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-purple-400 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Cross-Chain Positions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockPositions.map((position) => (
                  <motion.div
                    key={position.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 border border-gray-700/50 hover:border-gray-600/50 transition-all"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold">{position.token}</span>
                        <span className="text-xs text-gray-400">{chainIcons[position.chain]}</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        <div className="font-mono">${position.entryPrice.toLocaleString()}</div>
                        <div className="text-xs">Entry</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-mono">${position.currentPrice.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">Current</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className={`font-mono ${position.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {position.pnl >= 0 ? "+" : ""}${position.pnl.toFixed(0)}
                        </div>
                        <div className={`text-xs ${position.pnlPercentage >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {position.pnlPercentage >= 0 ? "+" : ""}
                          {position.pnlPercentage.toFixed(2)}%
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="text-xs bg-transparent">
                          Close
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Section 3 - Cross-Chain Price Comparison */}
          <Card className="bg-black/40 border-gray-800/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-yellow-400 flex items-center">
                <ArrowUpRight className="w-5 h-5 mr-2" />
                Price Arbitrage Scanner
              </CardTitle>
              <div className="flex space-x-2">
                {Object.keys(mockPriceComparison).map((token) => (
                  <Button
                    key={token}
                    size="sm"
                    variant={selectedToken === token ? "default" : "outline"}
                    onClick={() => setSelectedToken(token)}
                    className="text-xs"
                  >
                    {token}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockPriceComparison[selectedToken]?.map((price, index) => {
                  const minPrice = Math.min(...mockPriceComparison[selectedToken].map((p) => p.price))
                  const maxPrice = Math.max(...mockPriceComparison[selectedToken].map((p) => p.price))
                  const arbitrageOpportunity = ((maxPrice - minPrice) / minPrice) * 100
                  const isArbitrage = arbitrageOpportunity > 1

                  return (
                    <motion.div
                      key={index}
                      className={`p-3 rounded-lg border transition-all ${
                        isArbitrage && (price.price === minPrice || price.price === maxPrice)
                          ? "bg-yellow-900/20 border-yellow-500/50 shadow-yellow-500/20 shadow-lg"
                          : "bg-gray-900/50 border-gray-700/50"
                      }`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{chainIcons[price.chain]}</span>
                          <span className="font-medium">{price.chain}</span>
                          <span className="text-sm text-gray-400">{price.symbol}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="font-mono">${price.price.toLocaleString()}</div>
                            <div className={`text-xs ${price.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                              {price.change >= 0 ? "+" : ""}
                              {price.change.toFixed(2)}%
                            </div>
                          </div>
                          {isArbitrage && price.price === minPrice && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs">
                              Buy Here
                            </Button>
                          )}
                          {isArbitrage && price.price === maxPrice && (
                            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-xs">
                              Sell Here
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
          {/* Section 4 - Execution Timeline */}
          <Card className="bg-black/40 border-gray-800/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-green-400 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Execution Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockExecutions.map((execution) => (
                  <motion.div
                    key={execution.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 border border-gray-700/50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          execution.status === "completed"
                            ? "bg-green-400"
                            : execution.status === "executing"
                              ? "bg-blue-400 animate-pulse"
                              : execution.status === "pending"
                                ? "bg-yellow-400"
                                : "bg-red-400"
                        }`}
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-sm text-gray-400">{execution.time}</span>
                          <span className="font-medium">{execution.token}</span>
                          <span className="text-sm text-gray-400">{execution.chains}</span>
                        </div>
                        <div className="text-xs text-gray-500 capitalize">{execution.status}</div>
                      </div>
                    </div>
                    {execution.pnl !== 0 && (
                      <div className={`font-mono text-sm ${execution.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {execution.pnl >= 0 ? "+" : ""}${execution.pnl}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="bg-black/40 border-gray-800/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-cyan-400 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-gray-900/50">
                  <div className="text-2xl font-bold text-green-400">$12,450</div>
                  <div className="text-sm text-gray-400">Portfolio Value</div>
                  <div className="text-xs text-green-400">+8.3%</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-gray-900/50">
                  <div className="text-2xl font-bold text-cyan-400">$1,240</div>
                  <div className="text-sm text-gray-400">Today's P&L</div>
                  <div className="text-xs text-cyan-400">+11.2%</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-gray-900/50">
                  <div className="text-2xl font-bold text-purple-400">73%</div>
                  <div className="text-sm text-gray-400">Win Rate</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-gray-900/50">
                  <div className="text-2xl font-bold text-yellow-400">42</div>
                  <div className="text-sm text-gray-400">Trades Today</div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-gray-900/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Surf Mode</span>
                  <Switch checked={surfMode} onCheckedChange={setSurfMode} />
                </div>
                <div className="text-xs text-gray-500">Auto-execute trades when momentum detected</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Floating Action Button */}
      <motion.div className="fixed bottom-8 right-8 z-20" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Button
          size="lg"
          className="rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 shadow-lg shadow-cyan-500/25"
        >
          <Zap className="w-5 h-5 mr-2" />
          DETECT MOMENTUM NOW
        </Button>
      </motion.div>
    </div>
  )
}
