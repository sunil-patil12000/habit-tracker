"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

// Types
interface Habit {
  id: string
  name: string
  icon: string
  goal: number
  unit: string
  streak: number
  completed: boolean
  progress: number
  history: number[]
  color: string
}

interface User {
  name: string
  avatar: string
  joinDate: string
  longestStreak: number
}

// Mock Data
const initialHabits: Habit[] = [
  {
    id: "1",
    name: "Drink Water",
    icon: "💧",
    goal: 8,
    unit: "glasses",
    streak: 5,
    completed: false,
    progress: 0,
    history: [6, 8, 7, 8, 8, 7, 8],
    color: "from-cyan-500 to-blue-500",
  },
  {
    id: "2",
    name: "Sleep",
    icon: "😴",
    goal: 8,
    unit: "hours",
    streak: 3,
    completed: false,
    progress: 0,
    history: [7, 6.5, 8, 7.5, 8, 7, 6],
    color: "from-violet-500 to-purple-500",
  },
  {
    id: "3",
    name: "Exercise",
    icon: "🏃",
    goal: 30,
    unit: "minutes",
    streak: 2,
    completed: false,
    progress: 0,
    history: [20, 30, 0, 45, 30, 20, 30],
    color: "from-rose-500 to-orange-500",
  },
  {
    id: "4",
    name: "Meditation",
    icon: "🧘",
    goal: 10,
    unit: "minutes",
    streak: 7,
    completed: false,
    progress: 0,
    history: [10, 10, 15, 10, 10, 10, 10],
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "5",
    name: "Limit Screen Time",
    icon: "📱",
    goal: 120,
    unit: "minutes",
    streak: 0,
    completed: false,
    progress: 0,
    history: [180, 150, 120, 200, 140, 130, 160],
    color: "from-fuchsia-500 to-pink-500",
  },
]

const mockUser: User = {
  name: "Alex Johnson",
  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  joinDate: "2023-01-15",
  longestStreak: 14,
}

// Weekly labels
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

// Motivational messages based on streak
const getMotivationalMessage = (streak: number) => {
  if (streak === 0) return { message: "Let's start a streak today!", emoji: "🚀" }
  if (streak < 3) return { message: "Great start! Keep going!", emoji: "👍" }
  if (streak < 7) return { message: "You're on fire!", emoji: "🔥" }
  if (streak < 14) return { message: "Impressive dedication!", emoji: "💪" }
  return { message: "You're unstoppable!", emoji: "🏆" }
}

// Chart colors
const chartColors = ["#6366f1", "#ec4899", "#f97316", "#10b981", "#8b5cf6"]

export default function HabitTrackerApp() {
  // Client-side only rendering
  const [isClient, setIsClient] = useState(false)
  
  // State
  const [habits, setHabits] = useState<Habit[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [notification, setNotification] = useState<string | null>(null)
  const [user, setUser] = useState<User>(mockUser)
  const [scrolled, setScrolled] = useState(false)

  const settingsRef = useRef<HTMLDivElement>(null)

  // Initialize data on client-side only
  useEffect(() => {
    setIsClient(true)
    setHabits(initialHabits)
  }, [])

  // Calculate total streaks
  const totalStreaks = habits.reduce((sum, habit) => sum + habit.streak, 0)

  // Handle scroll for navbar effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Handle habit progress update
  const updateHabitProgress = (id: string, progress: number) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) =>
        habit.id === id
          ? {
              ...habit,
              progress,
              completed: progress >= habit.goal,
              streak: progress >= habit.goal ? habit.streak + (habit.completed ? 0 : 1) : habit.streak,
            }
          : habit,
      ),
    )

    // Show notification for completed habits
    const habit = habits.find((h) => h.id === id)
    if (habit && !habit.completed && progress >= habit.goal) {
      setNotification(`Great job! You've completed your ${habit.name.toLowerCase()} goal!`)
      setTimeout(() => setNotification(null), 3000)
    }
  }

  // Handle habit edit in settings
  const saveHabitSettings = () => {
    if (editingHabit) {
      setHabits((prevHabits) => prevHabits.map((habit) => (habit.id === editingHabit.id ? editingHabit : habit)))
      setEditingHabit(null)
    }
  }

  // Close settings when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Prepare chart data
  const getChartData = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId)
    if (!habit) return []

    return habit.history.map((value, index) => ({
      day: weekDays[index],
      value,
    }))
  }

  // Get all habits chart data
  const getAllHabitsChartData = () => {
    return weekDays.map((day, index) => {
      const data: any = { day }
      habits.forEach((habit) => {
        data[habit.name] = habit.history[index]
      })
      return data
    })
  }

  // Get completion percentage
  const getCompletionPercentage = () => {
    const completed = habits.filter((h) => h.completed).length
    return Math.round((completed / (habits.length || 1)) * 100)
  }

  // Show a loading state if we're not on the client yet
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-purple-950/20 dark:to-blue-950/20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading habit tracker...</p>
        </div>
      </div>
    )
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-purple-950/20 dark:to-blue-950/20 text-slate-800 dark:text-slate-100 font-sans">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/20 dark:bg-purple-600/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300/20 dark:bg-yellow-600/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-40 left-20 w-72 h-72 bg-pink-300/20 dark:bg-pink-600/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-300/20 dark:bg-blue-600/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-6000"></div>
        </div>
      </div>

      {/* Navbar */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg"
            : "bg-white dark:bg-slate-900 shadow-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <motion.div
                className="flex-shrink-0 flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-2xl font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  Habit
                </span>
                <span className="text-2xl font-bold ml-1">Tracker</span>
              </motion.div>
            </div>

            {/* Desktop menu */}
            <div className="hidden sm:flex sm:items-center sm:space-x-4">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTab === "dashboard"
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTab === "analytics"
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors duration-200"
              >
                Settings
              </button>
              <div className="ml-3 relative">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <button className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                    <div className="relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur opacity-75"></div>
                      <img
                        className="relative h-8 w-8 rounded-full object-cover border-2 border-white dark:border-slate-800"
                        src={user.avatar || "/placeholder.svg"}
                        alt="User avatar"
                      />
                    </div>
                  </button>
                </motion.div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <motion.button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 focus:outline-none"
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  className={`${showMobileMenu ? "hidden" : "block"} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg
                  className={`${showMobileMenu ? "block" : "hidden"} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              className="sm:hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                <button
                  onClick={() => {
                    setActiveTab("dashboard")
                    setShowMobileMenu(false)
                  }}
                  className={`block px-4 py-2 rounded-full text-base font-medium w-full text-left ${
                    activeTab === "dashboard"
                      ? "bg-indigo-50 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    setActiveTab("analytics")
                    setShowMobileMenu(false)
                  }}
                  className={`block px-4 py-2 rounded-full text-base font-medium w-full text-left ${
                    activeTab === "analytics"
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  Analytics
                </button>
                <button
                  onClick={() => {
                    setShowSettings(true)
                    setShowMobileMenu(false)
                  }}
                  className="block px-4 py-2 rounded-full text-base font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 w-full text-left"
                >
                  Settings
                </button>
              </div>
              <div className="pt-4 pb-3 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur opacity-75"></div>
                      <img
                        className="relative h-10 w-10 rounded-full object-cover border-2 border-white dark:border-slate-800"
                        src={user.avatar || "/placeholder.svg"}
                        alt="User avatar"
                      />
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-slate-800 dark:text-slate-200">{user.name}</div>
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Member since {new Date(user.joinDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className="fixed top-20 right-4 z-50 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center"
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <span className="text-xl mr-2">✅</span>
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative z-10">
        {/* Landing Section - Only show if it's the first visit */}
        {activeTab === "dashboard" && (
          <>
            <motion.section className="py-12 md:py-20" initial="hidden" animate="visible" variants={containerVariants}>
              <div className="max-w-3xl mx-auto text-center">
                <motion.div variants={itemVariants}>
                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                    Welcome back,{" "}
                    <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                      {user.name.split(" ")[0]}
                    </span>
                  </h1>
                  <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                    Track your habits, build consistency, and achieve your goals.
                  </p>
                </motion.div>

                <motion.div
                  className="flex justify-center mb-12"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full blur opacity-75 animate-pulse"></div>
                    <img
                      src={user.avatar || "/placeholder.svg"}
                      alt="User avatar"
                      className="relative h-28 w-28 rounded-full object-cover border-4 border-white dark:border-slate-800"
                    />
                  </div>
                </motion.div>

                <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12" variants={containerVariants}>
                  <motion.div
                    className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 dark:border-slate-700/50 p-6 hover:shadow-2xl transition-all duration-300 overflow-hidden relative group"
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                      {habits.length}
                    </div>
                    <div className="text-slate-600 dark:text-slate-300 font-medium">Active Habits</div>
                  </motion.div>

                  <motion.div
                    className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 dark:border-slate-700/50 p-6 hover:shadow-2xl transition-all duration-300 overflow-hidden relative group"
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                      {totalStreaks}
                    </div>
                    <div className="text-slate-600 dark:text-slate-300 font-medium">Total Streaks</div>
                  </motion.div>

                  <motion.div
                    className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 dark:border-slate-700/50 p-6 hover:shadow-2xl transition-all duration-300 overflow-hidden relative group"
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-2">
                      {user.longestStreak}
                    </div>
                    <div className="text-slate-600 dark:text-slate-300 font-medium">Longest Streak</div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.section>

            {/* Daily Habit Check-in Panel */}
            <motion.section
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <span className="mr-2 text-2xl">📝</span>Today's Habits
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {habits.map((habit, index) => (
                  <motion.div
                    key={habit.id}
                    className={`bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 dark:border-slate-700/50 p-6 overflow-hidden relative group hover:shadow-2xl transition-all duration-300 ${
                      habit.completed ? "border-l-4 border-green-500 dark:border-green-400" : ""
                    }`}
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { delay: 0.1 * index, duration: 0.5 },
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {habit.completed && (
                      <div className="absolute top-0 right-0 w-20 h-20">
                        <div className="absolute transform rotate-45 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-1 right-[-35px] top-[32px] w-[170px] text-center text-xs">
                          COMPLETED
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-500/10 dark:to-pink-500/10 mr-3">
                          <span className="text-2xl">{habit.icon}</span>
                        </div>
                        <h3 className="text-lg font-semibold">{habit.name}</h3>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700">
                          {habit.progress}/{habit.goal} {habit.unit}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor={`progress-${habit.id}`}
                        className="text-sm text-slate-600 dark:text-slate-300 mb-1 block font-medium"
                      >
                        Progress
                      </label>
                      <div className="flex items-center">
                        <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden dark:bg-slate-700">
                          <motion.div
                            className={`absolute top-0 left-0 h-full bg-gradient-to-r ${habit.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(habit.progress / (habit.goal * 2)) * 100}%` }}
                            transition={{ duration: 0.5 }}
                          ></motion.div>
                          <input
                            id={`progress-${habit.id}`}
                            type="range"
                            min="0"
                            max={habit.goal * 2}
                            value={habit.progress}
                            onChange={(e) => updateHabitProgress(habit.id, Number.parseInt(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                        <span className="ml-3 text-lg font-medium min-w-[2rem] text-center">{habit.progress}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300 mr-1">Streak:</span>
                        <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center">
                          <span className="mr-1">🔥</span>
                          {habit.streak} {habit.streak === 1 ? "day" : "days"}
                        </span>
                      </div>

                      {habit.streak > 0 && (
                        <div className="text-sm text-slate-600 dark:text-slate-300 flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700">
                          <span className="mr-1">{getMotivationalMessage(habit.streak).emoji}</span>
                          <span>{getMotivationalMessage(habit.streak).message}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Add New Habit Button */}
              <motion.button
                className="mt-6 flex items-center justify-center w-full md:w-auto px-6 py-3 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mr-2">➕</span>
                Add New Habit
              </motion.button>
            </motion.section>

            {/* Weekly Progress */}
            <motion.section
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <span className="mr-2 text-2xl">📊</span>Weekly Progress
              </h2>
              <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 dark:border-slate-700/50 p-6 hover:shadow-2xl transition-all duration-300">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getAllHabitsChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          borderRadius: "0.75rem",
                          border: "none",
                          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                          padding: "12px",
                        }}
                      />
                      {habits.map((habit, index) => (
                        <Bar
                          key={habit.id}
                          dataKey={habit.name}
                          stackId="a"
                          fill={chartColors[index % chartColors.length]}
                          radius={[4, 4, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.section>

            {/* Streak Summary */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <span className="mr-2 text-2xl">🔥</span>Streak Summary
              </h2>
              <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 dark:border-slate-700/50 p-6 hover:shadow-2xl transition-all duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Completion Rate</h3>
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-3 uppercase rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm">
                            Today
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-purple-600 dark:text-purple-400">
                            {getCompletionPercentage()}%
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-purple-100 dark:bg-purple-900/30">
                        <motion.div
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${getCompletionPercentage()}%` }}
                          transition={{ duration: 1, delay: 0.8 }}
                        ></motion.div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-md font-medium mb-3">Top Performing Habits</h4>
                      <ul className="space-y-3">
                        {habits
                          .sort((a, b) => b.streak - a.streak)
                          .slice(0, 3)
                          .map((habit, index) => (
                            <motion.li
                              key={habit.id}
                              className="flex items-center p-3 rounded-xl bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-700/50 border border-white/50 dark:border-slate-700/30 shadow-sm"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{
                                opacity: 1,
                                x: 0,
                                transition: { delay: 0.1 * index + 1, duration: 0.5 },
                              }}
                              whileHover={{ x: 5 }}
                            >
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-500/10 dark:to-pink-500/10 mr-3">
                                <span className="text-xl">{habit.icon}</span>
                              </div>
                              <span className="text-slate-800 dark:text-slate-200 font-medium">{habit.name}</span>
                              <span className="ml-auto text-amber-600 dark:text-amber-400 font-medium flex items-center">
                                <span className="mr-1">🔥</span>
                                {habit.streak} {habit.streak === 1 ? "day" : "days"}
                              </span>
                            </motion.li>
                          ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Motivation</h3>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-5 mb-4 border border-purple-100/50 dark:border-purple-800/30 shadow-sm">
                      <p className="text-slate-700 dark:text-slate-300 italic">
                        "Habits are the compound interest of self-improvement. The same way that money multiplies
                        through compound interest, the effects of your habits multiply as you repeat them."
                      </p>
                      <p className="text-right text-slate-600 dark:text-slate-400 mt-2 font-medium">— James Clear</p>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-md font-medium mb-3">Your Stats</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <motion.div
                          className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-emerald-100/50 dark:border-emerald-800/30 shadow-sm"
                          whileHover={{ y: -5 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          <div className="text-emerald-600 dark:text-emerald-400 text-xl font-bold">{totalStreaks}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Total Streaks</div>
                        </motion.div>
                        <motion.div
                          className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-amber-100/50 dark:border-amber-800/30 shadow-sm"
                          whileHover={{ y: -5 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          <div className="text-amber-600 dark:text-amber-400 text-xl font-bold">
                            {user.longestStreak}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Longest Streak</div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          </>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="py-12"
          >
            <h1 className="text-3xl font-bold mb-8 flex items-center">
              <span className="mr-3 text-3xl">📈</span>Analytics
            </h1>

            <div className="grid grid-cols-1 gap-8">
              {habits.map((habit, index) => (
                <motion.div
                  key={habit.id}
                  className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 dark:border-slate-700/50 p-6 overflow-hidden group hover:shadow-2xl transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-500/10 dark:to-pink-500/10 mr-3">
                      <span className="text-2xl">{habit.icon}</span>
                    </div>
                    {habit.name} Analytics
                  </h3>

                  <div className="h-64 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getChartData(habit.id)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            borderRadius: "0.75rem",
                            border: "none",
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                            padding: "12px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={chartColors[index % chartColors.length]}
                          strokeWidth={3}
                          dot={{ r: 6, strokeWidth: 2, fill: "#fff" }}
                          activeDot={{ r: 8, strokeWidth: 0 }}
                          name={habit.name}
                        />
                        <Line
                          type="monotone"
                          dataKey="goal"
                          stroke="#10b981"
                          strokeDasharray="5 5"
                          strokeWidth={2}
                          name="Goal"
                          data={weekDays.map((day) => ({ day, goal: habit.goal }))}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-700/50 p-4 rounded-xl border border-white/50 dark:border-slate-700/30 shadow-sm"
                      whileHover={{ y: -3 }}
                    >
                      <div className="text-sm text-slate-500 dark:text-slate-400">Average</div>
                      <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                        {(habit.history.reduce((a, b) => a + b, 0) / habit.history.length).toFixed(1)} {habit.unit}
                      </div>
                    </motion.div>
                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-700/50 p-4 rounded-xl border border-white/50 dark:border-slate-700/30 shadow-sm"
                      whileHover={{ y: -3 }}
                    >
                      <div className="text-sm text-slate-500 dark:text-slate-400">Best Day</div>
                      <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                        {Math.max(...habit.history)} {habit.unit}
                      </div>
                    </motion.div>
                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-700/50 p-4 rounded-xl border border-white/50 dark:border-slate-700/30 shadow-sm"
                      whileHover={{ y: -3 }}
                    >
                      <div className="text-sm text-slate-500 dark:text-slate-400">Completion Rate</div>
                      <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                        {Math.round(
                          (habit.history.filter((val) => val >= habit.goal).length / habit.history.length) * 100,
                        )}
                        %
                      </div>
                    </motion.div>
                  </div>

                  <div className="mt-4 p-4 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl border border-white/50 dark:border-slate-700/30 shadow-sm">
                    <h4 className="text-md font-medium mb-2">Weekly Insights</h4>
                    <p className="text-slate-600 dark:text-slate-300">
                      {habit.history.filter((val) => val >= habit.goal).length >= 5
                        ? `Great job maintaining your ${habit.name.toLowerCase()} habit! You've met your goal ${habit.history.filter((val) => val >= habit.goal).length} out of 7 days.`
                        : `You've met your ${habit.name.toLowerCase()} goal ${habit.history.filter((val) => val >= habit.goal).length} out of 7 days. Keep working on consistency!`}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/50 dark:border-slate-700/50"
              ref={settingsRef}
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Settings
                  </h2>
                  <motion.button
                    onClick={() => setShowSettings(false)}
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">Habit Goals</h3>
                  <div className="space-y-4">
                    {habits.map((habit, index) => (
                      <motion.div
                        key={habit.id}
                        className="border-b border-slate-200 dark:border-slate-700 pb-4"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          transition: { delay: 0.05 * index, duration: 0.5 },
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-500/10 dark:to-pink-500/10 mr-3">
                              <span className="text-xl">{habit.icon}</span>
                            </div>
                            <span className="font-medium">{habit.name}</span>
                          </div>
                          <motion.button
                            onClick={() => setEditingHabit(habit)}
                            className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium px-3 py-1 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Edit
                          </motion.button>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-300 ml-11">
                          Goal: {habit.goal} {habit.unit} per day
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">Account</h3>
                  <div className="flex items-center mb-4 p-4 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl border border-white/50 dark:border-slate-700/30 shadow-sm">
                    <div className="relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur opacity-75"></div>
                      <img
                        src={user.avatar || "/placeholder.svg"}
                        alt="User avatar"
                        className="relative h-12 w-12 rounded-full mr-4 object-cover border-2 border-white dark:border-slate-800"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        Member since {new Date(user.joinDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <motion.button
                    onClick={() => setShowSettings(false)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Habit Modal */}
      <AnimatePresence>
        {editingHabit && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full border border-white/50 dark:border-slate-700/50"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Edit Habit
                  </h2>
                  <motion.button
                    onClick={() => setEditingHabit(null)}
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Habit Name
                    </label>
                    <input
                      type="text"
                      value={editingHabit.name}
                      onChange={(e) => setEditingHabit({ ...editingHabit, name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Icon</label>
                    <input
                      type="text"
                      value={editingHabit.icon}
                      onChange={(e) => setEditingHabit({ ...editingHabit, icon: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Daily Goal
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        value={editingHabit.goal}
                        onChange={(e) => setEditingHabit({ ...editingHabit, goal: Number.parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-l-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700 dark:text-white"
                      />
                      <input
                        type="text"
                        value={editingHabit.unit}
                        onChange={(e) => setEditingHabit({ ...editingHabit, unit: e.target.value })}
                        className="w-32 px-4 py-2 border border-slate-300 dark:border-slate-600 border-l-0 rounded-r-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700 dark:text-white"
                        placeholder="unit"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6 space-x-3">
                  <motion.button
                    onClick={() => setEditingHabit(null)}
                    className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-medium py-2 px-5 rounded-full"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={saveHabitSettings}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 px-5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Save Changes
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-md mt-auto border-t border-white/20 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between py-6">
            <div className="flex items-center mb-4 sm:mb-0">
              <span className="text-xl font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Habit
              </span>
              <span className="text-xl font-bold ml-1">Tracker</span>
            </div>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-sm text-slate-600 hover:text-purple-600 dark:text-slate-300 dark:hover:text-purple-400 transition-colors duration-300"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-sm text-slate-600 hover:text-purple-600 dark:text-slate-300 dark:hover:text-purple-400 transition-colors duration-300"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-sm text-slate-600 hover:text-purple-600 dark:text-slate-300 dark:hover:text-purple-400 transition-colors duration-300"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
