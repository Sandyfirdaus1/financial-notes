"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"];

interface Expense {
  id: number;
  name: string;
  amount: number;
  category: string;
  date: string;
  accountType: "cash" | "atm";
}

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [amountDisplay, setAmountDisplay] = useState("");
  const [category, setCategory] = useState("makanan");
  const [date, setDate] = useState("");
  const [showForm, setShowForm] = useState(false);
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [selectedDate, setSelectedDate] = useState<string>(todayString);
  const [accountType, setAccountType] = useState<"cash" | "atm">("cash");
  const [cashBalance, setCashBalance] = useState("");
  const [atmBalance, setAtmBalance] = useState("");
  const [cashBalanceDisplay, setCashBalanceDisplay] = useState("");
  const [atmBalanceDisplay, setAtmBalanceDisplay] = useState("");
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const savedExpenses = localStorage.getItem("expenses");
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
    const savedCashBalance = localStorage.getItem("cashBalance");
    if (savedCashBalance) {
      setCashBalance(savedCashBalance);
      setCashBalanceDisplay(formatRupiah(savedCashBalance));
    }
    const savedAtmBalance = localStorage.getItem("atmBalance");
    if (savedAtmBalance) {
      setAtmBalance(savedAtmBalance);
      setAtmBalanceDisplay(formatRupiah(savedAtmBalance));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("cashBalance", cashBalance);
  }, [cashBalance]);

  useEffect(() => {
    localStorage.setItem("atmBalance", atmBalance);
  }, [atmBalance]);

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !date) return;

    const newExpense: Expense = {
      id: Date.now(),
      name,
      amount: parseFloat(amount),
      category,
      date,
      accountType,
    };

    setExpenses([...expenses, newExpense]);
    setName("");
    setAmount("");
    setAmountDisplay("");
    setDate("");
    setAccountType("cash");
    setShowForm(false);
  };

  const formatRupiah = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers === "") return "";
    return new Intl.NumberFormat("id-ID").format(parseInt(numbers, 10));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setAmount(value);
    setAmountDisplay(formatRupiah(value));
  };

  const deleteExpense = (id: number) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const cashTotal = expenses.filter(e => e.accountType === "cash").reduce((sum, expense) => sum + expense.amount, 0);
  const atmTotal = expenses.filter(e => e.accountType === "atm").reduce((sum, expense) => sum + expense.amount, 0);
  const remainingCash = cashBalance ? parseFloat(cashBalance) - cashTotal : 0;
  const remainingAtm = atmBalance ? parseFloat(atmBalance) - atmTotal : 0;

  const handleBalanceUpdate = () => {
    setShowBalanceModal(true);
  };

  const saveBalances = () => {
    setShowBalanceModal(false);
  };

  const handleDeleteAll = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAll = () => {
    setExpenses([]);
    setShowDeleteModal(false);
  };

  const groupExpensesByDate = (expenses: Expense[]) => {
    const grouped: Record<string, Expense[]> = {};
    expenses.forEach((expense) => {
      if (!grouped[expense.date]) {
        grouped[expense.date] = [];
      }
      grouped[expense.date].push(expense);
    });
    return grouped;
  };

  const filteredExpenses = selectedDate
    ? expenses.filter((expense) => expense.date === selectedDate)
    : expenses;

  const groupedExpenses = groupExpensesByDate(
    filteredExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  );

  const categoryConfig: Record<string, { color: string; bg: string; icon: string }> = {
    makanan: {
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-900/30",
      icon: "🍽️",
    },
    transportasi: {
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/30",
      icon: "🚗",
    },
    hiburan: {
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-900/30",
      icon: "🎮",
    },
    belanja: {
      color: "text-pink-600 dark:text-pink-400",
      bg: "bg-pink-50 dark:bg-pink-900/30",
      icon: "🛍️",
    },
    tagihan: {
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-900/30",
      icon: "📄",
    },
    kesehatan: {
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/30",
      icon: "💊",
    },
    lainnya: {
      color: "text-gray-600 dark:text-gray-400",
      bg: "bg-gray-50 dark:bg-gray-900/30",
      icon: "📦",
    },
  };

  const getCategoryStats = () => {
    const stats: Record<string, number> = {};
    expenses.forEach((expense) => {
      stats[expense.category] = (stats[expense.category] || 0) + expense.amount;
    });
    return stats;
  };

  const categoryStats = getCategoryStats();

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl mb-4 shadow-lg shadow-teal-500/30">
              <span className="text-3xl">💰</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
              Financial Records
            </h1>
            <p className="text-purple-200 text-lg">
              Kelola keuangan Anda dengan mudah dan cerdas
            </p>
          </div>

          {/* Mobile Form - Show only on mobile */}
          <div className="lg:hidden mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span>➕</span> Tambah Pengeluaran
              </h2>
              <form onSubmit={addExpense} className="space-y-5">
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Nama Pengeluaran
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Contoh: Makan siang"
                    required
                  />
                </div>
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Jumlah (Rp)
                  </label>
                  <input
                    type="text"
                    value={amountDisplay}
                    onChange={handleAmountChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Contoh: 50.000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value="makanan" className="bg-slate-900">🍽️ Makanan</option>
                    <option value="transportasi" className="bg-slate-900">🚗 Transportasi</option>
                    <option value="hiburan" className="bg-slate-900">🎮 Hiburan</option>
                    <option value="belanja" className="bg-slate-900">🛍️ Belanja</option>
                    <option value="tagihan" className="bg-slate-900">📄 Tagihan</option>
                    <option value="kesehatan" className="bg-slate-900">💊 Kesehatan</option>
                    <option value="lainnya" className="bg-slate-900">📦 Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Tipe Akun
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setAccountType("cash")}
                      className={`flex-1 py-3 px-4 rounded-xl transition-all duration-200 ${
                        accountType === "cash"
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                          : "bg-white/10 text-purple-200 hover:bg-white/20"
                      }`}
                    >
                      💵 Cash
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType("atm")}
                      className={`flex-1 py-3 px-4 rounded-xl transition-all duration-200 ${
                        accountType === "atm"
                          ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                          : "bg-white/10 text-purple-200 hover:bg-white/20"
                      }`}
                    >
                      💳 ATM/Bank
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg transform hover:scale-[1.02]"
                >
                  Tambah Pengeluaran
                </button>
              </form>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-purple-200 text-sm font-medium">Total Cash</span>
                <span className="text-2xl">💵</span>
              </div>
              <p className="text-3xl font-bold text-white">
                Rp {cashTotal.toLocaleString("id-ID")}
              </p>
              <p className="text-green-300 text-sm mt-2">{expenses.filter(e => e.accountType === "cash").length} transaksi</p>
              {cashBalance && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-purple-300 text-xs">Saldo: Rp {parseFloat(cashBalance).toLocaleString("id-ID")}</p>
                  <p className={`${remainingCash >= 0 ? "text-green-400" : "text-red-400"} text-xs font-semibold`}>
                    Sisa: Rp {remainingCash.toLocaleString("id-ID")}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-purple-200 text-sm font-medium">Total ATM/Bank</span>
                <span className="text-2xl">💳</span>
              </div>
              <p className="text-3xl font-bold text-white">
                Rp {atmTotal.toLocaleString("id-ID")}
              </p>
              <p className="text-blue-300 text-sm mt-2">{expenses.filter(e => e.accountType === "atm").length} transaksi</p>
              {atmBalance && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-purple-300 text-xs">Saldo: Rp {parseFloat(atmBalance).toLocaleString("id-ID")}</p>
                  <p className={`${remainingAtm >= 0 ? "text-green-400" : "text-red-400"} text-xs font-semibold`}>
                    Sisa: Rp {remainingAtm.toLocaleString("id-ID")}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-purple-200 text-sm font-medium">Total Keseluruhan</span>
                <span className="text-2xl">💸</span>
              </div>
              <p className="text-3xl font-bold text-white">
                Rp {totalAmount.toLocaleString("id-ID")}
              </p>
              <p className="text-purple-300 text-sm mt-2">{expenses.length} transaksi</p>
            </div>
          </div>

          {/* Update Balance Button */}
          <div className="mb-8">
            <button
              onClick={handleBalanceUpdate}
              className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
            >
              💰 Update Saldo
            </button>
          </div>

          {/* Category Breakdown */}
          {Object.keys(categoryStats).length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-xl mb-8">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span>📈</span> Grafik
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={Object.entries(categoryStats).map(([cat, amount]) => ({
                        name: cat,
                        value: amount,
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(categoryStats).map(([cat, amount], index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "8px",
                      }}
                      itemStyle={{ color: "#fff" }}
                      formatter={(value: any) => `Rp ${Number(value).toLocaleString("id-ID")}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(categoryStats).map(([cat, amount]) => (
                    <div key={cat} className={`rounded-2xl p-4 ${categoryConfig[cat]?.bg} border border-white/10`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{categoryConfig[cat]?.icon}</span>
                        <span className={`text-sm font-medium capitalize ${categoryConfig[cat]?.color}`}>{cat}</span>
                      </div>
                      <p className={`text-xl font-bold ${categoryConfig[cat]?.color}`}>
                        Rp {amount.toLocaleString("id-ID")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form - Show only on desktop */}
            <div className="lg:col-span-1 hidden lg:block">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-xl sticky top-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span>➕</span> Tambah Pengeluaran
                </h2>
                <form onSubmit={addExpense} className="space-y-5">
                  <div>
                    <label className="block text-purple-200 text-sm font-medium mb-2">
                      Nama Pengeluaran
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Contoh: Makan siang"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-purple-200 text-sm font-medium mb-2">
                      Jumlah (Rp)
                    </label>
                    <input
                      type="text"
                      value={amountDisplay}
                      onChange={handleAmountChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Contoh: 50.000"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-purple-200 text-sm font-medium mb-2">
                      Kategori
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="makanan" className="bg-slate-900">🍽️ Makanan</option>
                      <option value="transportasi" className="bg-slate-900">🚗 Transportasi</option>
                      <option value="hiburan" className="bg-slate-900">🎮 Hiburan</option>
                      <option value="belanja" className="bg-slate-900">🛍️ Belanja</option>
                      <option value="tagihan" className="bg-slate-900">📄 Tagihan</option>
                      <option value="kesehatan" className="bg-slate-900">💊 Kesehatan</option>
                      <option value="lainnya" className="bg-slate-900">📦 Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-purple-200 text-sm font-medium mb-2">
                      Tanggal
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-purple-200 text-sm font-medium mb-2">
                      Tipe Akun
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setAccountType("cash")}
                        className={`flex-1 py-3 px-4 rounded-xl transition-all duration-200 ${
                          accountType === "cash"
                            ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                            : "bg-white/10 text-purple-200 hover:bg-white/20"
                        }`}
                      >
                        💵 Cash
                      </button>
                      <button
                        type="button"
                        onClick={() => setAccountType("atm")}
                        className={`flex-1 py-3 px-4 rounded-xl transition-all duration-200 ${
                          accountType === "atm"
                            ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                            : "bg-white/10 text-purple-200 hover:bg-white/20"
                        }`}
                      >
                        💳 ATM/Bank
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg transform hover:scale-[1.02]"
                  >
                    Tambah Pengeluaran
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column - List - Order 2 on mobile, normal on desktop */}
            <div className="lg:col-span-2 order-2 lg:order-none">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>📋</span> Riwayat Pengeluaran
                  </h2>
                  {expenses.length > 0 && (
                    <button
                      onClick={handleDeleteAll}
                      className="text-sm text-red-400 hover:text-red-300 transition-colors"
                    >
                      Hapus Semua
                    </button>
                  )}
                </div>

                {/* Calendar Filter */}
                <div className="mb-6">
                  <div className="flex items-center gap-4">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                    {selectedDate && (
                      <button
                        onClick={() => setSelectedDate("")}
                        className="text-sm text-purple-300 hover:text-white transition-colors"
                      >
                        Reset Filter
                      </button>
                    )}
                  </div>
                </div>

                {filteredExpenses.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 rounded-full mb-6">
                      <span className="text-5xl">📭</span>
                    </div>
                    <p className="text-purple-200 text-lg mb-2">
                      {selectedDate ? "Tidak ada pengeluaran di tanggal ini" : "Belum ada pengeluaran"}
                    </p>
                    <p className="text-purple-300/70 text-sm">
                      {selectedDate ? "Pilih tanggal lain" : "Mulai tambahkan pengeluaran pertama Anda!"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedExpenses).map(([date, dateExpenses]) => (
                      <div key={date}>
                        <h3 className="text-lg font-semibold text-purple-200 mb-3 flex items-center gap-2">
                          <span>📅</span>
                          {new Date(date).toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </h3>
                        <div className="space-y-3">
                          {dateExpenses.map((expense) => (
                        <div
                          key={expense.id}
                          className="group flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${categoryConfig[expense.category]?.bg}`}>
                              {categoryConfig[expense.category]?.icon}
                            </div>
                            <div>
                              <h3 className="font-semibold text-white text-lg">
                                {expense.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${categoryConfig[expense.category]?.bg} ${categoryConfig[expense.category]?.color}`}>
                                  {expense.category}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${expense.accountType === "cash" ? "bg-green-500/20 text-green-300" : "bg-blue-500/20 text-blue-300"}`}>
                                  {expense.accountType === "cash" ? "💵 Cash" : "💳 ATM"}
                                </span>
                                <span className="text-purple-300/70 text-sm">
                                  {new Date(expense.date).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="text-xl font-bold text-white">
                              Rp {expense.amount.toLocaleString("id-ID")}
                            </p>
                            <button
                              onClick={() => deleteExpense(expense.id)}
                              className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-all duration-200"
                              title="Hapus"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Balance Modal */}
        {showBalanceModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-3xl p-6 border border-white/20 shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>💰</span> Update Saldo
                </h2>
                <button
                  onClick={() => setShowBalanceModal(false)}
                  className="text-purple-300 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Saldo Cash (Rp)
                  </label>
                  <input
                    type="text"
                    value={cashBalanceDisplay}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setCashBalance(value);
                      setCashBalanceDisplay(formatRupiah(value));
                    }}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Contoh: 1.000.000"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Saldo ATM/Bank (Rp)
                  </label>
                  <input
                    type="text"
                    value={atmBalanceDisplay}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setAtmBalance(value);
                      setAtmBalanceDisplay(formatRupiah(value));
                    }}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Contoh: 5.000.000"
                  />
                </div>
                <button
                  onClick={saveBalances}
                  className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-3xl p-6 border border-white/20 shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>⚠️</span> Konfirmasi Hapus
                </h2>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-purple-300 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-purple-200 text-center">
                  Apakah Anda yakin ingin menghapus semua pengeluaran? Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                  >
                    Batal
                  </button>
                  <button
                    onClick={confirmDeleteAll}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-red-500/30"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
