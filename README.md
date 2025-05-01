# Calendar API with Ghost Integration

A Node.js-based Calendar API with Ghost CMS integration, featuring a simple admin form interface. This project provides a robust backend for calendar management with the added benefit of Ghost's content management capabilities.

## 🚀 Technologies

### Core Technologies
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **Ghost** - Headless CMS for content management

### Dependencies
- **bcrypt** (v5.1.1) - Password hashing
- **bcryptjs** (v3.0.2) - Password hashing (alternative)
- **body-parser** (v1.20.3) - Request body parsing
- **express** (v4.21.2) - Web framework
- **fs-extra** (v11.3.0) - Enhanced file system operations

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Ghost CLI (installed automatically by the script)
- Git

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/calendar-api-node-mvp.git
cd calendar-api-node-mvp
```

2. Install dependencies:
```bash
npm install
```

## 🚀 Usage

The project includes a service management script (`app.sh`) that handles both the Node.js application and Ghost CMS. The script provides three main commands: `start`, `stop`, and `status`.

### Windows Setup

1. **Using Git Bash (Recommended)**
   - Install [Git for Windows](https://git-scm.com/download/win)
   - Open Git Bash in the project directory
   - Make the script executable:
     ```bash
     chmod +x app.sh
     ```
   - Run the script:
     ```bash
     ./app.sh [command]
     ```

2. **Using WSL (Windows Subsystem for Linux)**
   - Install [WSL](https://docs.microsoft.com/en-us/windows/wsl/install)
   - Open WSL terminal
   - Navigate to the project directory
   - Make the script executable:
     ```bash
     chmod +x app.sh
     ```
   - Run the script:
     ```bash
     ./app.sh [command]
     ```

### macOS Setup

1. Open Terminal
2. Navigate to the project directory
3. Make the script executable:
   ```bash
   chmod +x app.sh
   ```
4. Run the script:
   ```bash
   ./app.sh [command]
   ```

### Linux Setup

1. Open Terminal
2. Navigate to the project directory
3. Make the script executable:
   ```bash
   chmod +x app.sh
   ```
4. Run the script:
   ```bash
   ./app.sh [command]
   ```

## 📝 Available Commands

### Start Services
```bash
./app.sh start
```
This command:
- Checks for Ghost CLI installation
- Starts Ghost CMS if not running
- Launches the Node.js application
- Displays status messages for each service

### Stop Services
```bash
./app.sh stop
```
This command:
- Gracefully stops Ghost CMS
- Terminates the Node.js application
- Confirms service termination

### Check Status
```bash
./app.sh status
```
This command displays:
- Ghost CMS status and URL
- Node.js application status and PID
- Port information

### Show Help
```bash
./app.sh help
# or any invalid command
```
Displays usage instructions and available commands.

## 🔧 Troubleshooting

### Common Issues

1. **Permission Denied**
   - Ensure the script is executable:
     ```bash
     chmod +x app.sh
     ```

2. **Ghost CLI Not Found**
   - The script will attempt to install Ghost CLI automatically
   - If it fails, install manually:
     ```bash
     npm install -g ghost-cli
     ```

3. **Port Conflicts**
   - Default ports:
     - Node.js: 3000
     - Ghost: 2368
   - Ensure these ports are available

### Windows-Specific Issues

1. **Line Ending Problems**
   - Configure Git to handle line endings:
     ```bash
     git config --global core.autocrlf true
     ```

2. **Script Execution Policy**
   - If using PowerShell, you might need to adjust execution policy:
     ```powershell
     Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
     ```

## 📚 API Documentation

The Calendar API provides the following endpoints:

- `GET /api/events` - List all events
- `POST /api/events` - Create a new event
- `GET /api/events/:id` - Get a specific event
- `PUT /api/events/:id` - Update an event
- `DELETE /api/events/:id` - Delete an event

Detailed API documentation is available in the `/docs` directory.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Ghost CMS team for their excellent documentation
- Express.js community for their support 