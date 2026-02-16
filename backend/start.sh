#!/bin/bash
echo "============================================"
echo "  EcoCred Vision Backend - Setup & Start"
echo "============================================"
echo ""

cd "$(dirname "$0")"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 not found. Install Python 3.10+ first."
    exit 1
fi

# Create venv if not exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

echo ""
echo "Starting EcoCred Vision Backend on http://localhost:8000 ..."
echo "API docs available at http://localhost:8000/docs"
echo ""
python main.py
