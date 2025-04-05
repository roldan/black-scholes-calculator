"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function BlackScholesCalculator() {
  // State for input values
  const [stockPrice, setStockPrice] = useState<number>(100)
  const [strikePrice, setStrikePrice] = useState<number>(100)
  const [daysToExpiry, setDaysToExpiry] = useState<number>(365)
  const [riskFreeRate, setRiskFreeRate] = useState<number>(5) // 5%
  const [volatility, setVolatility] = useState<number>(20) // 20%

  // State for results
  const [callPrice, setCallPrice] = useState<number | null>(null)
  const [putPrice, setPutPrice] = useState<number | null>(null)

  // State for Greeks
  const [callGreeks, setCallGreeks] = useState<{
    delta: number
    gamma: number
    theta: number
    vega: number
    rho: number
  } | null>(null)

  const [putGreeks, setPutGreeks] = useState<{
    delta: number
    gamma: number
    theta: number
    vega: number
    rho: number
  } | null>(null)

  // Black-Scholes calculation
  const calculateBlackScholes = () => {
    // Standard normal cumulative distribution function
    const cdf = (x: number): number => {
      const t = 1 / (1 + 0.2316419 * Math.abs(x))
      const d = 0.3989423 * Math.exp((-x * x) / 2)
      let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
      if (x > 0) p = 1 - p
      return p
    }

    // Standard normal probability density function
    const pdf = (x: number): number => {
      return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x)
    }

    // Convert days to years
    const timeToExpiryYears = daysToExpiry / 365

    // Black-Scholes formula parameters
    const S = stockPrice
    const K = strikePrice
    const T = timeToExpiryYears
    const r = riskFreeRate / 100 // Convert from percentage to decimal
    const sigma = volatility / 100 // Convert from percentage to decimal

    // Calculate d1 and d2
    const d1 = (Math.log(S / K) + (r + (sigma * sigma) / 2) * T) / (sigma * Math.sqrt(T))
    const d2 = d1 - sigma * Math.sqrt(T)

    // Calculate call and put prices
    const call = S * cdf(d1) - K * Math.exp(-r * T) * cdf(d2)
    const put = K * Math.exp(-r * T) * cdf(-d2) - S * cdf(-d1)

    // Calculate Greeks for call option
    const callDelta = cdf(d1)
    const putDelta = callDelta - 1

    // Gamma is the same for both call and put
    const gamma = pdf(d1) / (S * sigma * Math.sqrt(T))

    // Theta (divided by 365 to get daily theta)
    const callTheta = ((-S * pdf(d1) * sigma) / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * cdf(d2)) / 365
    const putTheta = ((-S * pdf(d1) * sigma) / (2 * Math.sqrt(T)) + r * K * Math.exp(-r * T) * cdf(-d2)) / 365

    // Vega (for 1% change in volatility)
    const vega = (S * Math.sqrt(T) * pdf(d1)) / 100

    // Rho (for 1% change in interest rate)
    const callRho = (K * T * Math.exp(-r * T) * cdf(d2)) / 100
    const putRho = (-K * T * Math.exp(-r * T) * cdf(-d2)) / 100

    // Set results
    setCallPrice(call)
    setPutPrice(put)

    // Set Greeks
    setCallGreeks({
      delta: callDelta,
      gamma: gamma,
      theta: callTheta,
      vega: vega,
      rho: callRho,
    })

    setPutGreeks({
      delta: putDelta,
      gamma: gamma,
      theta: putTheta,
      vega: vega,
      rho: putRho,
    })
  }

  // Helper function to render Greek values
  const renderGreekValue = (value: number | undefined) => {
    if (value === undefined) return "-"
    return value.toFixed(4)
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Black-Scholes Calculator</CardTitle>
          <CardDescription>Calculate option prices and Greeks using the Black-Scholes model</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Parameters */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Parameters</h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="stockPrice">Stock Price (S)</Label>
                  <Input
                    id="stockPrice"
                    type="number"
                    value={stockPrice}
                    onChange={(e) => setStockPrice(Number.parseFloat(e.target.value))}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="strikePrice">Strike Price (K)</Label>
                  <Input
                    id="strikePrice"
                    type="number"
                    value={strikePrice}
                    onChange={(e) => setStrikePrice(Number.parseFloat(e.target.value))}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="daysToExpiry">Time to Expiry (days)</Label>
                  <Input
                    id="daysToExpiry"
                    type="number"
                    value={daysToExpiry}
                    onChange={(e) => setDaysToExpiry(Number.parseFloat(e.target.value))}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="riskFreeRate">Risk-Free Rate (%)</Label>
                  <div className="relative">
                    <Input
                      id="riskFreeRate"
                      type="number"
                      step="0.1"
                      value={riskFreeRate}
                      onChange={(e) => setRiskFreeRate(Number.parseFloat(e.target.value))}
                      className="pr-6"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="volatility">Volatility (%)</Label>
                  <div className="relative">
                    <Input
                      id="volatility"
                      type="number"
                      step="0.1"
                      value={volatility}
                      onChange={(e) => setVolatility(Number.parseFloat(e.target.value))}
                      className="pr-6"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                </div>

                <Button className="mt-2" onClick={calculateBlackScholes}>
                  Calculate
                </Button>
              </div>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Results</h3>
              {callPrice !== null && putPrice !== null && callGreeks !== null && putGreeks !== null ? (
                <div className="border rounded-lg p-4">
                  {/* Prices */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center py-2 bg-slate-50 rounded-md">
                      <div className="text-sm font-medium mb-1">Call Price</div>
                      <div className="text-2xl font-bold">{callPrice.toFixed(4)}</div>
                    </div>
                    <div className="text-center py-2 bg-slate-50 rounded-md">
                      <div className="text-sm font-medium mb-1">Put Price</div>
                      <div className="text-2xl font-bold">{putPrice.toFixed(4)}</div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Greeks Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-left font-medium p-2">Greek</th>
                          <th className="text-right font-medium p-2">Call</th>
                          <th className="text-right font-medium p-2">Put</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-2">Delta</td>
                          <td className="text-right p-2">{renderGreekValue(callGreeks.delta)}</td>
                          <td className="text-right p-2">{renderGreekValue(putGreeks.delta)}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2">Gamma</td>
                          <td className="text-right p-2">{renderGreekValue(callGreeks.gamma)}</td>
                          <td className="text-right p-2">{renderGreekValue(putGreeks.gamma)}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2">Theta</td>
                          <td className="text-right p-2">{renderGreekValue(callGreeks.theta)}</td>
                          <td className="text-right p-2">{renderGreekValue(putGreeks.theta)}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2">Vega</td>
                          <td className="text-right p-2">{renderGreekValue(callGreeks.vega)}</td>
                          <td className="text-right p-2">{renderGreekValue(putGreeks.vega)}</td>
                        </tr>
                        <tr>
                          <td className="p-2">Rho</td>
                          <td className="text-right p-2">{renderGreekValue(callGreeks.rho)}</td>
                          <td className="text-right p-2">{renderGreekValue(putGreeks.rho)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-6 h-[calc(100%-2rem)] flex flex-col justify-center">
                  <div className="text-center text-muted-foreground">
                    Enter parameters and click Calculate to see option prices and Greeks
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

