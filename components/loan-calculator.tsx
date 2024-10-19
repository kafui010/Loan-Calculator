"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarIcon } from "lucide-react"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export function LoanCalculatorComponent() {
  const [income, setIncome] = useState<number | string>("")
  const [interestRate, setInterestRate] = useState<number>(22)
  const [loanTenor, setLoanTenor] = useState<number | string>("")
  const [calculationResult, setCalculationResult] = useState<{
    loanAmount: number;
    monthlyPayment: number;
  } | null>(null)

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-GH', { maximumFractionDigits: 2 })
  }

  const calculateLoan = () => {
    if (!income || !loanTenor) {
      toast.error("Please fill in all fields", { position: "top-center" })
      return
    }

    const incomeNum = Number(income)
    const loanTenorNum = Number(loanTenor)

    if (isNaN(incomeNum) || isNaN(loanTenorNum)) {
      toast.error("Please enter valid numbers", { position: "top-center" })
      return
    }

    if (loanTenorNum <= 0 || loanTenorNum > 360) {
      toast.error("Loan tenor must be between 1 and 360 months", { position: "top-center" })
      return
    }

    const monthlyInterestRate = interestRate / 100 / 12
    const loanAmount = (incomeNum * 0.4 * (1 - Math.pow(1 + monthlyInterestRate, -loanTenorNum))) / monthlyInterestRate
    const monthlyPayment = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTenorNum)) / (Math.pow(1 + monthlyInterestRate, loanTenorNum) - 1)

    setCalculationResult({
      loanAmount: Math.round(loanAmount),
      monthlyPayment: Number(monthlyPayment.toFixed(2)),
    })
  }

  const generateBreakdown = () => {
    if (!calculationResult) return []

    let remaining = calculationResult.loanAmount
    let monthlyPayment = calculationResult.monthlyPayment
    const breakdown = []

    for (let i = 1; i <= Number(loanTenor); i++) {
      // Vary the monthly payment slightly
      const paymentVariation = (Math.random() - 0.5) * 0.1 * monthlyPayment // +/- 5%
      const actualPayment = Math.max(0, monthlyPayment + paymentVariation)

      const interest = remaining * (interestRate / 100 / 12)
      const principal = Math.min(actualPayment, remaining + interest) - interest
      remaining = Math.max(0, remaining - principal)

      breakdown.push({
        month: i,
        amountPaid: formatNumber(actualPayment),
        interestPaid: formatNumber(interest),
        remainingAmount: formatNumber(remaining),
      })

      if (remaining <= 0) break
    }

    return breakdown
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-800">Ghana Loan Calculator</h1>
        <div className="space-y-6">
          <div>
            <label htmlFor="income" className="block text-sm font-medium text-gray-700 mb-1">Net Monthly Salary (GHS)</label>
            <div className="relative">
              <Input
                id="income"
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="pl-3"
                placeholder="Enter your monthly salary"
              />
            </div>
          </div>
          <div>
            <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 mb-1">Interest Rate</label>
            <div className="relative">
              <Slider
                id="interestRate"
                value={[interestRate]}
                onValueChange={(value) => setInterestRate(value[0])}
                max={50}
                step={0.1}
                className="mt-2"
              />
              <div className="text-center mt-2">{interestRate.toFixed(1)}</div>
            </div>
          </div>
          <div>
            <label htmlFor="loanTenor" className="block text-sm font-medium text-gray-700 mb-1">Loan Tenor (months)</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                id="loanTenor"
                type="number"
                value={loanTenor}
                onChange={(e) => setLoanTenor(e.target.value)}
                className="pl-10"
                placeholder="Enter loan duration in months"
              />
            </div>
          </div>
          <Button onClick={calculateLoan} className="w-full bg-blue-600 hover:bg-blue-700">Calculate Loan</Button>
        </div>

        {calculationResult && (
          <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-200 rounded-lg">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">YOUR ESTIMATED RESULTS</h2>
            <div className="text-lg text-gray-700 space-y-2">
              <p>You can borrow up to <span className="font-bold text-green-600">GHS {formatNumber(calculationResult.loanAmount)}</span></p>
              <p>With your stated net income of <span className="font-bold">GHS {formatNumber(Number(income))}</span> a month, and at an interest rate of <span className="font-bold">{interestRate.toFixed(1)}</span></p>
              <p>With these estimations, you can expect to make payment installments of about <span className="font-bold text-blue-600">GHS {formatNumber(calculationResult.monthlyPayment)}</span> monthly over {loanTenor} months</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="mt-4 bg-purple-600 hover:bg-purple-700">View Breakdown</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-purple-800">Loan Repayment Breakdown</DialogTitle>
                  <DialogDescription>
                    <div className="max-h-[60vh] overflow-auto mt-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-purple-700">Month</TableHead>
                            <TableHead className="text-green-700">Amount Paid</TableHead>
                            <TableHead className="text-red-700">Interest Paid</TableHead>
                            <TableHead className="text-blue-700">Remaining Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {generateBreakdown().map((row) => (
                            <TableRow key={row.month}>
                              <TableCell className="font-medium">{row.month}</TableCell>
                              <TableCell>{row.amountPaid}</TableCell>
                              <TableCell>{row.interestPaid}</TableCell>
                              <TableCell>{row.remainingAmount}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  )
}