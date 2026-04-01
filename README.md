# React + Vite

# 自转番茄钟 · Rotation Pomodoro

> 接受了 Claude 的建议，做了一个可循环的番茄钟。  
> Built with Claude's help — a looping Pomodoro timer for wandering minds.

通过短暂的专注与放松交替，配合可爱的主题界面，帮助缓解注意力缺失带来的困扰。当然，如果你只是想做单独的任务循环，也完全可以使用。
我不确定这是否有效。但至少我想做一点东西所以我做了这个。

A gentle productivity tool that alternates between focus and rest with cute themes. Works great for ADHD brains — or anyone who just wants a pretty timer.
I don't konw if it works,but I want to do something for myself

---

## ✨ 功能 · Features

- 🔁 **可循环任务列表** — 自定义任意数量的任务，时间到自动跳转循环  
  Custom task routines that loop automatically
- 🎨 **四套主题** — 奶油拿铁 / 马卡龙梦 / 治愈森林 / 赛博元气，随时切换  
  Four themes: Cream Latte / Macaron Dream / Healing Forest / Cyber Pop
- 🔔 **声音提醒** — 内置三种提示音，支持上传本地音频  
  Built-in sounds + custom audio upload
- 🔇 **一键静音** — 安静模式随时开关  
  One-click mute
- ⊡ **迷你模式** — 缩小只显示时间和任务名，不打扰工作流  
  Mini mode shows only the time and task name
- 💾 **本地存储** — 刷新不丢失任务和主题偏好  
  Tasks and theme preference saved locally
- 🖥️ **桌面程序** — 基于 Electron 打包，支持 macOS / Windows  
  Desktop app via Electron for macOS and Windows

---

## 🚀 安装运行 · Getting Started

```bash
# 克隆项目
git clone https://github.com/yourname/rotation-pomodoro.git
cd rotation-pomodoro

# 安装依赖
npm install

# 网页开发模式
npm run dev

# 桌面程序模式（需同时开启 dev）
npm run dev        # 终端一
npm run electron   # 终端二
```

---

## 📦 打包 · Build

```bash
# 打包 macOS dmg
npm run build:mac

# 打包 Windows exe
npm run build:win
```

---

## 🛠️ 技术栈 · Tech Stack

- **前端** React + Vite
- **桌面** Electron
- **样式** 纯 CSS-in-JS，无 UI 库
- **存储** localStorage

---

## 🙏 致谢 · Credits

感谢 Claude Pro 的协助，17 美元很划算。  
时钟逻辑出了不少 bug，但UI很漂亮。

*Thanks to Claude Pro for the assistance. $17 well spent.*  
*The logic had its moments, but the UI turned out beautiful.*

---

## 📄 License

MIT