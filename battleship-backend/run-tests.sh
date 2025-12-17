#!/bin/bash

# Battleship Game Test Runner
# This script compiles and runs the game test program

echo "======================================================"
echo "  Battleship Game Logic Test Runner"
echo "======================================================"
echo ""

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "❌ Error: Maven is not installed or not in PATH"
    echo "Please install Maven to run the tests"
    exit 1
fi

echo "🔨 Compiling project..."
mvn clean compile -q

if [ $? -ne 0 ]; then
    echo "❌ Compilation failed!"
    exit 1
fi

echo "✓ Compilation successful"
echo ""

echo "🎮 Running game tests..."
echo ""

mvn exec:java -Dexec.mainClass="com.battleship.GameTestProgram" -q

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ All tests passed successfully!"
    exit 0
else
    echo ""
    echo "❌ Some tests failed. Please check the output above."
    exit 1
fi
