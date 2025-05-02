# 📅 Calendar API with Ghost Integration

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.x-brightgreen)](https://nodejs.org/)
[![License: Unreleased](https://img.shields.io/badge/license-unreleased-lightgrey)]()
[![Status](https://img.shields.io/badge/status-in%20development-yellow)]()

A **Node.js-based Calendar API** integrated with **Ghost CMS**, featuring a simple admin form interface. This project provides a robust backend for calendar and event management, enhanced by Ghost's content management capabilities.

---

## 🧭 Related Repositories

- **[`@petcom/calendar-api-node-mvp`](https://github.com/petcom/calendar-api-node-mvp)** – *This repository:* Backend calendar API MVP  
- **[`@mittingphx/sonar-az`](https://github.com/mittingphx/sonar-az)** – Replit-generated frontend public website

---

## 🚀 Technologies

### Core Stack
- **Node.js** – JavaScript runtime environment  
- **Express.js** – Web application framework  
- **Ghost** – Headless CMS for managing event content  

### Notable Dependencies
- **bcrypt** (`v5.1.1`) – Secure password hashing  
- **bcryptjs** (`v3.0.2`) – JavaScript-based alternative to bcrypt  
- **body-parser** (`v1.20.3`) – Middleware to parse incoming request bodies  
- **express** (`v4.21.2`) – Routing and middleware  
- **fs-extra** (`v11.3.0`) – Extended file system utilities  

---

## 📋 Prerequisites

- **Node.js** `v14+`  
- **npm** `v6+`  
- **Git**  
- **Ghost CLI** (auto-installed by the script)

---

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/petcom/calendar-api-node-mvp.git
cd calendar-api-node-mvp
```

2. Install dependencies:
```bash
npm install
```

## 🚀 Usage

The project includes a service management script (`app.sh`) that handles both the Node.js application and Ghost CMS. The script provides three main commands: `start`, `stop`, and `status`.


### Windows Setup

**Using WSL (Windows Subsystem for Linux)**
```bash
chmod +x app.sh
./app.sh [command]
```

### macOS Setup

```bash
chmod +x app.sh
./app.sh [command]
```

### Linux Setup

```bash
chmod +x app.sh
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

This project is not currently released for anyuse.  It is a private project under developmnt.

## 👥 Authors

- Adam Petty - @petcom
- Scott Mitting – @mittingphx

## 🙏 Acknowledgments

- Ghost CMS team for their excellent documentation
- Express.js community for their support

  
