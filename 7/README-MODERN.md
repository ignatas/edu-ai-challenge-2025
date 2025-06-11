# 🌊 Sea Battle CLI Game - Colorful Modern Edition ⚓

A stunning, colorful, modern ES6+ battleship game with beautiful visual effects, comprehensive test coverage, and an immersive gaming experience!

![Version](https://img.shields.io/badge/version-2.0.0-brightgreen)
![Tests](https://img.shields.io/badge/tests-128%20passing-success)
![Coverage](https://img.shields.io/badge/coverage-75%25-brightgreen)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-blue)

## ✨ What's New in Version 2.0 - Colorful Edition

### 🎨 Beautiful Visual Enhancements

- **🌈 Full Color Support**: ANSI color codes for cross-platform beautiful output
- **🎯 Dynamic Game Boards**: Color-coded water (cyan), ships (bright blue), hits (red), misses (dim)
- **⚡ Epic Combat Effects**: Dramatic hit/miss/sunk messages with emojis and effects
- **🏆 Victory Celebrations**: Spectacular win/lose animations with fireworks
- **📊 Live Battle Stats**: Real-time colorful ship count displays
- **🎆 Loading Animations**: Spinning battle preparation sequences
- **🚢 ASCII Art**: Occasional ship artwork for dramatic flair

### 🖼️ Visual Features

```
🌊 OPPONENT BOARD 🌊           🚢 YOUR BOARD 🚢
═══════════════════════════════════════════════════
  0 1 2 3 4 5 6 7 8 9       0 1 2 3 4 5 6 7 8 9
0 ~ ~ ~ X ~ ~ ~ ~ ~ ~     0 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
1 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~     1 ~ S S S ~ ~ ~ ~ ~ ~
2 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~     2 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

💥 CPU SCORED A HIT at 34! 💥
🎯 DIRECT HIT! 🎯
🔥 ENEMY SHIP DESTROYED! 🔥
```

### 🚀 Modern JavaScript Features

- **ES6+ Classes**: Object-oriented design with proper encapsulation
- **ES6 Modules**: Clean import/export system for better code organization
- **let/const**: Block-scoped variables instead of var
- **Arrow Functions**: Modern function syntax where appropriate
- **Template Literals**: Enhanced string formatting with colors
- **Destructuring**: Clean object/array destructuring
- **Async/Await**: Promise-based input handling
- **Static Methods**: Efficient utility functions

### 🏗️ Enhanced Architecture

- **Colors Utility**: Centralized ANSI color management system
- **Separation of Concerns**: Game logic, display, input handling, and AI in separate modules
- **No Global Variables**: All state properly encapsulated in classes
- **Modular Design**: Each component has a single responsibility
- **Enhanced Error Handling**: Comprehensive try/catch blocks with colored error messages
- **Test Coverage**: 128 comprehensive tests with 75%+ coverage

## 📁 File Structure

```
📦 seabattle.js/
├── 🎨 Colors.js              # ANSI color utility for beautiful output
├── 🎮 seabattle-modern.js    # Colorful entry point with startup banner
├── 📊 GameDisplay.js         # Enhanced visual output with colors & animations
├── 🎯 Game.js               # Main game controller with loading effects
├── 🤖 CPUPlayer.js          # AI opponent with dramatic attack messages
├── 👤 Player.js             # Human player with colorful ship deployment
├── 🚢 Board.js              # Grid management with enhanced visuals
├── ⚓ Ship.js                # Ship mechanics (100% test coverage)
├── ⌨️  InputHandler.js       # Promise-based input with validation
├── 🧪 *.test.js             # 128 comprehensive tests (all passing)
├── ⚙️  jest.config.js        # Test configuration with coverage thresholds
├── 📋 package.json          # Dependencies & npm scripts
└── 📖 README-MODERN.md      # This enhanced documentation
```

## 🎮 Gameplay Features

The core game mechanics remain exactly the same as classic Battleship:

### 🎯 Game Rules

- **10x10 grid** battleship arena
- **3 ships** of 3 units each per player
- **Turn-based** coordinate input (e.g., `00`, `34`, `99`)
- **Standard Battleship mechanics**: Hit, Miss, Sunk detection

### 🎨 Visual Symbols

- `🌊 ~` Water (cyan) - Unknown ocean territory
- `⚓ S` Your Ships (bright blue & bold) - Your fleet positions
- `💥 X` Direct Hits (bright red & bold) - Successful attacks
- `💧 O` Missed Shots (dim white) - Splashes in empty water

### 🤖 Intelligent CPU Opponent

- **Hunt Mode**: Random search patterns for enemy ships
- **Target Mode**: Focused attacks around confirmed hits
- **Dramatic Messages**: Epic attack announcements and results

## 🚀 How to Run

### ⚠️ Important: Navigate to Project Directory First!

```bash
# Make sure you're in the correct directory
cd seabattle.js/

# Then run the game
npm start
```

### 🎮 Running the Colorful Modern Version

```bash
# Method 1: Using npm script (recommended)
npm start

# Method 2: Direct node execution
node seabattle-modern.js

# Method 3: Running with specific Node flags
node --experimental-vm-modules seabattle-modern.js
```

### 🎲 Legacy Version (Original)

```bash
npm run legacy
# or
node seabattle.js
```

## 🧪 Testing & Quality

### 📊 Test Coverage Metrics

- **128 Tests Total** - All passing ✅
- **74.92% Statement Coverage**
- **76.59% Branch Coverage**
- **85.93% Function Coverage**
- **75.37% Line Coverage**

### 🏆 Perfect Coverage Components

- **Ship.js**: 100% coverage across all metrics
- **Player.js**: 100% coverage across all metrics
- **Board.js**: 98.76% statement coverage
- **GameDisplay.js**: 82.43% with comprehensive visual testing

### 🧪 Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npx jest GameDisplay.test.js
```

## 🎨 Color Features

### 🌈 Enhanced Visual Experience

- **Startup Banner**: Rainbow-colored welcome with wave animations
- **Dynamic Boards**: Color-coded game state visualization
- **Combat Effects**: Dramatic hit/miss/sunk animations
- **Status Messages**: Color-coded success/warning/error feedback
- **Loading Animations**: Spinning progress indicators
- **ASCII Art**: Occasional decorative ship artwork

### 🎯 Game-Specific Colors

```javascript
// Water effects
🌊 Calm seas (cyan)

// Ship visualization
⚓ Your fleet (bright blue & bold)

// Combat results
💥 Direct hits (bright red & bold)
💧 Near misses (dim white)
🔥 Ship destroyed (red & bold)

// Status messages
✅ Success (bright green)
⚠️  Warnings (bright yellow)
❌ Errors (bright red)
ℹ️  Information (bright cyan)
```

## ⚙️ Technical Requirements

- **Node.js 14.0.0+** (for ES6 module support)
- **Terminal with ANSI color support** (most modern terminals)
- **Windows/macOS/Linux** compatible

## 🚀 Performance Features

- **Efficient Rendering**: Optimized color code generation
- **Memory Management**: Proper cleanup and resource handling
- **Fast Startup**: Quick game initialization with loading effects
- **Responsive Input**: Promise-based input handling
- **Error Recovery**: Graceful error handling with helpful messages

## 🎯 Development Features

### 🧪 Comprehensive Testing

- **Unit Tests**: Individual component testing
- **Integration Tests**: Full game scenario testing
- **Error Handling Tests**: Exception and edge case coverage
- **Visual Output Tests**: Color and formatting validation

### 🔧 Development Scripts

```bash
# Development
npm run dev          # Development mode with watch
npm run test:watch   # Test watch mode
npm run lint         # Code linting (if configured)

# Testing
npm test             # Run all tests
npm run test:coverage # Coverage report
npm run test:verbose  # Detailed test output

# Production
npm start            # Run the colorful game
npm run legacy       # Run original version
```

## 🎊 Game Experience Highlights

### 🎮 Startup Experience

1. **Rainbow Welcome Banner** with wave effects
2. **Loading Animation** for battle preparation
3. **Ship Deployment** with anchor confirmations
4. **Battle Stations** ready message

### ⚔️ Combat Experience

1. **Captain's Targeting** prompt with crosshair emoji
2. **CPU Attack Announcements** with lightning effects
3. **Hit Confirmations** with explosion effects
4. **Ship Destruction** with dramatic sinking messages
5. **Victory Celebration** or defeat notifications

### 📊 Enhanced Feedback

- **Real-time Battle Stats** showing ship counts
- **Color-coded Error Messages** for invalid inputs
- **Progressive Game State** visualization
- **Dramatic Turn Transitions** with separators

---

## 🏆 Epic Sea Battle Awaits!

Prepare for an **immersive naval combat experience** with stunning visuals, intelligent AI opponents, and dramatic battle effects!

```
🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊
    ⚓ WELCOME TO SEA BATTLE - MODERN EDITION ⚓
🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊
    A beautiful, modern JavaScript battleship experience
    Built with ES6+ classes, modules, and async/await
🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊
```

**Ready to command your fleet, Admiral?** ⚓🚢💥
