#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Version
VERSION="1.0.0"

# Print header
print_header() {
    echo -e "${BLUE}=========================================${NC}"
    echo -e "${BLUE}    Calendar API & Ghost Management     ${NC}"
    echo -e "${BLUE}=========================================${NC}"
}

# Print help
show_help() {
    print_header
    echo -e "\n${GREEN}Usage:${NC} ./app.sh [command]"
    echo -e "\n${GREEN}Commands:${NC}"
    echo -e "  ${YELLOW}start${NC}   - Start both Node.js and Ghost services"
    echo -e "  ${YELLOW}stop${NC}    - Stop both Node.js and Ghost services"
    echo -e "  ${YELLOW}status${NC}  - Show status of both services"
    echo -e "\n${GREEN}Version:${NC} $VERSION"
}

# Check if Ghost is installed
check_ghost() {
    if ! command -v ghost &> /dev/null; then
        echo -e "${YELLOW}Ghost CLI not found. Installing...${NC}"
        if ! sudo npm install -g ghost-cli; then
            echo -e "${RED}Failed to install Ghost CLI. Please run: sudo npm install -g ghost-cli${NC}"
            exit 1
        fi
    fi
}

# Start services
start_services() {
    print_header
    echo -e "\n${GREEN}Starting services...${NC}"
    
    # Start Ghost
    if ghost status &> /dev/null; then
        echo -e "${GREEN}✓ Ghost is already running${NC}"
    else
        echo -e "${YELLOW}Starting Ghost...${NC}"
        if ! ghost start; then
            echo -e "${RED}✗ Failed to start Ghost. Please check Ghost installation.${NC}"
            exit 1
        fi
        echo -e "${GREEN}✓ Ghost started successfully${NC}"
    fi

    # Start Node.js
    echo -e "${YELLOW}Starting Node.js application...${NC}"
    npm start &
    NODE_PID=$!
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Node.js started successfully (PID: $NODE_PID)${NC}"
    else
        echo -e "${RED}✗ Failed to start Node.js application${NC}"
        exit 1
    fi
}

# Stop services
stop_services() {
    print_header
    echo -e "\n${GREEN}Stopping services...${NC}"
    
    # Stop Ghost
    if ghost status &> /dev/null; then
        echo -e "${YELLOW}Stopping Ghost...${NC}"
        if ! ghost stop; then
            echo -e "${RED}✗ Failed to stop Ghost${NC}"
        else
            echo -e "${GREEN}✓ Ghost stopped successfully${NC}"
        fi
    else
        echo -e "${GREEN}✓ Ghost is not running${NC}"
    fi

    # Stop Node.js
    NODE_PID=$(pgrep -f "node app.js")
    if [ ! -z "$NODE_PID" ]; then
        echo -e "${YELLOW}Stopping Node.js (PID: $NODE_PID)...${NC}"
        if ! kill $NODE_PID; then
            echo -e "${RED}✗ Failed to stop Node.js${NC}"
        else
            echo -e "${GREEN}✓ Node.js stopped successfully${NC}"
        fi
    else
        echo -e "${GREEN}✓ Node.js is not running${NC}"
    fi
}

# Show status
show_status() {
    print_header
    echo -e "\n${GREEN}Service Status:${NC}"
    
    # Ghost status
    echo -e "\n${BLUE}Ghost:${NC}"
    if ghost status &> /dev/null; then
        echo -e "${GREEN}✓ Running${NC}"
        ghost status | grep "URL" | sed 's/^/  /'
    else
        echo -e "${RED}✗ Not running${NC}"
    fi

    # Node.js status
    echo -e "\n${BLUE}Node.js:${NC}"
    NODE_PID=$(pgrep -f "node app.js")
    if [ ! -z "$NODE_PID" ]; then
        echo -e "${GREEN}✓ Running (PID: $NODE_PID)${NC}"
        echo -e "  Port: 3000 (default)"
    else
        echo -e "${RED}✗ Not running${NC}"
    fi
}

# Check if running with sudo
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}Please do not run this script as root/sudo${NC}"
    exit 1
fi

# Main script logic
case "$1" in
    "start")
        check_ghost
        start_services
        ;;
    "stop")
        stop_services
        ;;
    "status")
        show_status
        ;;
    *)
        show_help
        exit 1
        ;;
esac 