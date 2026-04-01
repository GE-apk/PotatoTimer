import { useState, useEffect, useRef } from "react"

// ── 主题定义 ──────────────────────────────────────────────
const THEMES = {
  cream: {
    name: "Cream Latte",
    bg: "#FDF6EE",
    card: "#FFF8F2",
    accent: "#C8845A",
    accentLight: "#F2D9C8",
    text: "#5C3A22",
    textMuted: "#B08060",
    ring: "#E8A880",
    font: "'Fraunces', serif",
    fontMono: "'DM Mono', monospace",
  },
  macaron: {
    name: "Macaron",
    bg: "#F2EEFF",
    card: "#FAF8FF",
    accent: "#7F77DD",
    accentLight: "#DDD9FF",
    text: "#2D2560",
    textMuted: "#9B94CC",
    ring: "#AFA9EC",
    font: "'Playfair Display', serif",
    fontMono: "'DM Mono', monospace",
  },
  forest: {
    name: "Healing Forest",
    bg: "#EEF6F0",
    card: "#F6FBF7",
    accent: "#3B7D52",
    accentLight: "#C2E0CC",
    text: "#1A3D28",
    textMuted: "#6A9E7F",
    ring: "#8FC4A2",
    font: "'Lora', serif",
    fontMono: "'DM Mono', monospace",
  },
  pixel: {
    name: "Cyber Pop",
    bg: "#0F0F1E",
    card: "#1A1A2E",
    accent: "#FF6BC1",
    accentLight: "#2D1F3D",
    text: "#F0E6FF",
    textMuted: "#9B7FBB",
    ring: "#FF6BC1",
    font: "'Space Grotesk', sans-serif",
    fontMono: "'Space Mono', monospace",
  },
}

// ── 格式化时间 ─────────────────────────────────────────────
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
}

// ── 主组件 ────────────────────────────────────────────────
export default function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("pomodoro-tasks")
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "Concentrate", duration: 25 * 60 },
      { id: 2, name: "Break", duration: 5 * 60 },
    ]
  })
  const [isRunning, setIsRunning] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(tasks[0]?.duration ?? 25 * 60)
  const [newTaskName, setNewTaskName] = useState("")
  const [newTaskDuration, setNewTaskDuration] = useState(25)
  const [themeKey, setThemeKey] = useState(() => {
    return localStorage.getItem("pomodoro-theme") ?? "cream"
  })  
  const [showTasks, setShowTasks] = useState(false)
  const [miniMode, setMiniMode] = useState(false)
  const [showThemes, setShowThemes] = useState(false)
  const [muted, setMuted] = useState(false)
  const [soundType, setSoundType] = useState("ding")
  const [customAudio, setCustomAudio] = useState(null)
  const playDing = () => {
    if (muted) return
    
    if (customAudio) {
      customAudio.currentTime = 0
      customAudio.play()
      return
    }

    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    if (soundType === "ding") {
      osc.frequency.value = 880
      osc.type = "sine"
      gain.gain.setValueAtTime(0.5, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 1.2)
    } else if (soundType === "bell") {
      osc.frequency.value = 528
      osc.type = "triangle"
      gain.gain.setValueAtTime(0.4, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 2)
    } else if (soundType === "pop") {
      osc.frequency.value = 300
      osc.type = "sine"
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.15)
    }
}
  const currentIndexRef = useRef(0)
  const tasksRef = useRef(tasks)
  useEffect(() => { tasksRef.current = tasks }, [tasks])

  // ── 计时逻辑 ──────────────────────────────────────────
  useEffect(() => {
    if (!isRunning) return
    if (timeLeft === 0) {
        playDing() // 加这行
      const nextIndex = (currentIndexRef.current + 1) % tasksRef.current.length
      currentIndexRef.current = nextIndex
      setCurrentIndex(nextIndex)
      setTimeLeft(tasksRef.current[nextIndex].duration)
      return
    }
    if (window.electronAPI) {
      window.electronAPI.updateTray({
      time: formatTime(timeLeft),
      task: tasks[currentIndex]?.name ?? ""
    })
  }
    const timer = setTimeout(() => setTimeLeft((p) => p - 1), 1000)
    return () => clearTimeout(timer)
  }, [isRunning, timeLeft])
  //显示时间任务
  useEffect(() => {
    document.title = `🥔 ${formatTime(timeLeft)} ${tasks[currentIndex]?.name ?? ""}`
  }, [timeLeft, currentIndex, tasks])
  //同步存储
  useEffect(() => {
    localStorage.setItem("pomodoro-tasks", JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem("pomodoro-theme", themeKey)
  }, [themeKey])

  // ── 操作函数 ──────────────────────────────────────────
  const handleDelete = (id) => {
    setTasks((prev) => {
      const next = prev.filter((t) => t.id !== id)
      if (next.length === 0) {
        setIsRunning(false)
        setCurrentIndex(0)
        currentIndexRef.current = 0
        setTimeLeft(25 * 60)
      } else {
        setTimeLeft(next[0].duration)
        setCurrentIndex(0)
        currentIndexRef.current = 0
      }
      return next
    })
  }

  const handleReset = () => {
    setIsRunning(false)
    setTimeLeft(tasksRef.current[currentIndexRef.current]?.duration ?? 25 * 60)
  }

  const handleAddTask = () => {
    if (!newTaskName) return
    setTasks((prev) => {
      const newTask = { id: Date.now(), name: newTaskName, duration: newTaskDuration * 60 }
      const next = [...prev, newTask]
      if (next.length === 1) {
        setTimeLeft(newTask.duration)
        setCurrentIndex(0)
        currentIndexRef.current = 0
      }
      return next
    })
    setNewTaskName("")
    setNewTaskDuration(25)
  }

  // ── 主题 & 样式 ───────────────────────────────────────
  const t = THEMES[themeKey]
  const progress = tasks[currentIndex]
    ? 1 - timeLeft / tasks[currentIndex].duration
    : 0
  const circumference = 2 * Math.PI * 54
  const strokeDash = circumference * progress

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=Playfair+Display:wght@400;700&family=Lora:wght@400;600&family=Space+Grotesk:wght@400;600;700&family=DM+Mono:wght@400;500&family=Space+Mono:wght@400;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${t.bg}; transition: background 0.4s; }
    .wrap {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: ${t.bg};
      transition: background 0.4s;
    }
    .card {
      background: ${t.card};
      border-radius: 28px;
      padding: ${miniMode ? "1.2rem 1.5rem" : "2.5rem"};
      width: ${miniMode ? "220px" : "360px"};
      box-shadow: 0 4px 40px ${t.accent}18;
      transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      border: 1.5px solid ${t.accentLight};
      position: relative;
    }
    .top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: ${miniMode ? "0.8rem" : "1.8rem"};
    }
    .theme-name {
      font-family: ${t.font};
      font-size: 13px;
      color: ${t.textMuted};
      letter-spacing: 0.03em;
    }
    .icon-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: ${t.textMuted};
      font-size: 16px;
      padding: 4px 6px;
      border-radius: 8px;
      transition: background 0.15s, color 0.15s;
      line-height: 1;
    }
    .icon-btn:hover { background: ${t.accentLight}; color: ${t.accent}; }
    .clock-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: ${miniMode ? "0.5rem" : "1rem"};
      margin-bottom: ${miniMode ? "0.8rem" : "1.6rem"};
    }
    .ring { position: relative; width: ${miniMode ? "90px" : "140px"}; height: ${miniMode ? "90px" : "140px"}; }
    .ring svg { transform: rotate(-90deg); }
    .ring-time {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .time-display {
      font-family: ${t.fontMono};
      font-size: ${miniMode ? "22px" : "36px"};
      font-weight: 700;
      color: ${t.text};
      letter-spacing: -0.02em;
      line-height: 1;
    }
    .task-label {
      font-family: ${t.font};
      font-size: ${miniMode ? "11px" : "13px"};
      color: ${t.textMuted};
      margin-top: 2px;
    }
    .btn-row {
      display: flex;
      gap: 10px;
      justify-content: center;
    }
    .btn-main {
      font-family: ${t.font};
      font-size: ${miniMode ? "13px" : "15px"};
      font-weight: 600;
      padding: ${miniMode ? "7px 20px" : "10px 32px"};
      border-radius: 50px;
      border: none;
      cursor: pointer;
      background: ${t.accent};
      color: #fff;
      transition: transform 0.15s, box-shadow 0.15s;
      box-shadow: 0 2px 12px ${t.accent}44;
    }
    .btn-main:hover { transform: scale(1.04); box-shadow: 0 4px 20px ${t.accent}66; }
    .btn-main:active { transform: scale(0.97); }
    .btn-secondary {
      font-family: ${t.font};
      font-size: ${miniMode ? "13px" : "15px"};
      padding: ${miniMode ? "7px 14px" : "10px 18px"};
      border-radius: 50px;
      border: 1.5px solid ${t.accentLight};
      cursor: pointer;
      background: transparent;
      color: ${t.textMuted};
      transition: background 0.15s, color 0.15s;
    }
    .btn-secondary:hover { background: ${t.accentLight}; color: ${t.text}; }
    .divider { height: 1px; background: ${t.accentLight}; margin: 1.4rem 0; }
    .tasks-section { animation: slideDown 0.2s ease; }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
    .task-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      border-radius: 12px;
      margin-bottom: 6px;
      background: ${t.accentLight}55;
      font-family: ${t.font};
      font-size: 14px;
      color: ${t.text};
      transition: background 0.15s;
    }
    .task-item.active { background: ${t.accentLight}; font-weight: 600; }
    .task-del {
      background: none;
      border: none;
      cursor: pointer;
      color: ${t.textMuted};
      font-size: 14px;
      padding: 2px 6px;
      border-radius: 6px;
      transition: background 0.15s, color 0.15s;
    }
    .task-del:hover { background: #ff6b6b22; color: #ff6b6b; }
    .add-row {
      display: flex;
      gap: 8px;
      margin-top: 10px;
    }
    .input-text {
      flex: 1;
      font-family: ${t.font};
      font-size: 13px;
      padding: 8px 12px;
      border-radius: 10px;
      border: 1.5px solid ${t.accentLight};
      background: ${t.bg};
      color: ${t.text};
      outline: none;
      transition: border-color 0.15s;
    }
    .input-text:focus { border-color: ${t.accent}; }
    .input-text::placeholder { color: ${t.textMuted}; }
    .input-num {
      width: 56px;
      font-family: ${t.fontMono};
      font-size: 13px;
      padding: 8px 8px;
      border-radius: 10px;
      border: 1.5px solid ${t.accentLight};
      background: ${t.bg};
      color: ${t.text};
      outline: none;
      text-align: center;
      transition: border-color 0.15s;
    }
    .input-num:focus { border-color: ${t.accent}; }
    .btn-add {
      font-size: 18px;
      padding: 0 12px;
      border-radius: 10px;
      border: none;
      background: ${t.accent};
      color: #fff;
      cursor: pointer;
      transition: transform 0.15s;
    }
    .btn-add:hover { transform: scale(1.08); }
    .theme-picker {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 10px;
      animation: slideDown 0.2s ease;
    }
    .theme-opt {
      padding: 8px 12px;
      border-radius: 12px;
      border: 1.5px solid transparent;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.15s;
      text-align: center;
    }
    .theme-opt:hover { transform: scale(1.03); }
    .dots-row {
      display: flex;
      gap: 6px;
      justify-content: center;
      margin-top: ${miniMode ? "0.6rem" : "1rem"};
    }
    .dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: ${t.accentLight};
      transition: background 0.2s, transform 0.2s;
    }
    .dot.active { background: ${t.accent}; transform: scale(1.3); }
  `

  const themeColors = {
    cream: { bg: "#FDF6EE", accent: "#C8845A", text: "#5C3A22" },
    macaron: { bg: "#F2EEFF", accent: "#7F77DD", text: "#2D2560" },
    forest: { bg: "#EEF6F0", accent: "#3B7D52", text: "#1A3D28" },
    pixel: { bg: "#0F0F1E", accent: "#FF6BC1", text: "#F0E6FF" },
  }

  return (
    <>
      <style>{css}</style>
      <div className="wrap">
        <div className="card">
          {/* 顶部栏 */}
          <div className="top-row">
            <span className="theme-name">{t.name}</span>
            <div style={{ display: "flex", gap: "4px" }}>
              <button className="icon-btn" onClick={() => { setShowThemes(!showThemes); setShowTasks(false) }} title="Switch Theme">🎨</button>
              <button className="icon-btn" onClick={() => { setShowTasks(!showTasks); setShowThemes(false) }} title="ToDoList">📋</button>
              <button className="icon-btn" onClick={() => setMiniMode(!miniMode)} title="MiniMode">{miniMode ? "⛶" : "⊡"}</button>
              <button className="icon-btn" onClick={() => setMuted(!muted)} title="Silent">{muted ? "🔇" : "🔔"}</button>
            </div>
          </div>

          {/* 主题选择器 */}
          {showThemes && (
            <>
              <div className="theme-picker">
                {Object.entries(THEMES).map(([key, th]) => (
                  <button
                    key={key}
                    className="theme-opt"
                    style={{
                      background: themeColors[key].bg,
                      color: themeColors[key].text,
                      borderColor: themeKey === key ? themeColors[key].accent : "transparent",
                      boxShadow: themeKey === key ? `0 0 0 2px ${themeColors[key].accent}` : "none",
                    }}
                    onClick={() => { setThemeKey(key); setShowThemes(false) }}
                  >
                    {th.name}
                  </button>
                ))}
              </div>
              <div className="divider" />
            </>
          )}

          {/* 时钟 */}
          <div className="clock-wrap">
            <div className="ring">
              <svg width={miniMode ? 90 : 140} height={miniMode ? 90 : 140} viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke={t.accentLight} strokeWidth="6" />
                <circle
                  cx="60" cy="60" r="54"
                  fill="none"
                  stroke={t.ring}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${strokeDash} ${circumference}`}
                  style={{ transition: "stroke-dasharray 0.5s ease" }}
                />
              </svg>
              <div className="ring-time">
                <span className="time-display">{formatTime(timeLeft)}</span>
                {!miniMode && <span className="task-label">{tasks[currentIndex]?.name ?? "—"}</span>}
              </div>
            </div>
            {miniMode && (
              <span className="task-label">{tasks[currentIndex]?.name ?? "—"}</span>
            )}
          </div>

          {/* 进度点 */}
          {tasks.length > 1 && (
            <div className="dots-row">
              {tasks.map((_, i) => (
                <div key={i} className={`dot${i === currentIndex ? " active" : ""}`} />
              ))}
            </div>
          )}

          {/* 按钮 */}
          {!miniMode && (
            <div className="btn-row" style={{ marginTop: "1.2rem" }}>
              <button className="btn-main" onClick={() => setIsRunning(!isRunning)}>
                {isRunning ? "Stop" : "Start"}
              </button>
              <button className="btn-secondary" onClick={handleReset}>Reset</button>
            </div>
          )}

          {/* 迷你模式按钮 */}
          {miniMode && (
            <div className="btn-row">
              <button className="btn-main" onClick={() => setIsRunning(!isRunning)}>
                {isRunning ? "⏸" : "▶"}
              </button>
              <button className="btn-secondary" onClick={handleReset}>↺</button>
            </div>
          )}

          {/* 任务列表 */}
          {showTasks && !miniMode && (
            <>
              <div className="divider" />
              <div className="tasks-section">
                {tasks.map((task, index) => (
                  <div key={task.id} className={`task-item${index === currentIndex ? " active" : ""}`}>
                    <span>{task.name} · {task.duration / 60}min</span>
                    <button className="task-del" onClick={() => handleDelete(task.id)}>✕</button>
                  </div>
                ))}
                <div className="add-row">
                  <input
                    className="input-text"
                    type="text"
                    placeholder="ToDo"
                    value={newTaskName}
                    onChange={e => setNewTaskName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAddTask()}
                  />
                  <input
                    className="input-num"
                    type="number"
                    min="1"
                    value={newTaskDuration}
                    onChange={e => setNewTaskDuration(Number(e.target.value))}
                  />
                  <button className="btn-add" onClick={handleAddTask}>+</button>
                </div>
              </div>
            </>
          )}
          {/* 选择音效 */}
          <div className="divider" />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", gap: "6px" }}>
              {["ding", "bell", "pop"].map(s => (
                <button
                  key={s}
                  className="btn-secondary"
                  style={{
                    flex: 1,
                    fontSize: "12px",
                    padding: "6px 0",
                    background: soundType === s ? t.accentLight : "transparent",
                    color: soundType === s ? t.accent : t.textMuted,
                  }}
                  onClick={() => { setSoundType(s); setCustomAudio(null); playDing() }}
                >
                  {s === "ding" ? "Ding" : s === "bell" ? "Bell" : "Pop"}
                </button>
              ))}
            </div>
            <input
              type="file"
              accept="audio/*"
              style={{ fontSize: "12px", color: t.textMuted, fontFamily: t.font }}
              onChange={e => {
                const file = e.target.files[0]
                if (!file) return
                const audio = new Audio(URL.createObjectURL(file))
                setCustomAudio(audio)
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}