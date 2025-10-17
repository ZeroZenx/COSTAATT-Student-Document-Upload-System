# COSTAATT Student Document Upload System

A modern web application built with Laravel and React for students to submit required documents for admissions and registry processes at The College of Science, Technology and Applied Arts of Trinidad and Tobago (COSTAATT).

## Features

- **Dual Portal System**: Separate portals for Admissions and Registry document submissions
- **Dynamic Document Requirements**: Document requirements vary by programme, intake term, campus, and funding type
- **Secure File Upload**: PDF-only uploads with size validation and organized storage
- **Email Notifications**: Automated confirmation emails using Microsoft Graph API
- **Modern UI**: Responsive design built with React, Inertia.js, and Tailwind CSS
- **Reference Tracking**: Unique reference numbers for each submission
- **Status Management**: Track submission status from in-progress to completed

## Technology Stack

### Backend
- **Laravel 10.x** - PHP framework
- **SQLite** - Database
- **Microsoft Graph API** - Email service
- **Inertia.js** - Modern monolith approach

### Frontend
- **React 18.2.0** - JavaScript library
- **Inertia.js 0.11.1** - Client-side routing
- **Tailwind CSS 3.3.5** - Styling framework
- **Heroicons** - Icon library
- **Vite 4.4.5** - Build tool

## Prerequisites

### Windows Setup Requirements
- **Windows 11** (or Windows 10)
- **Node.js 18.x+** - Download from [nodejs.org](https://nodejs.org/)
- **PHP 8.1+** - Download from [php.net](https://www.php.net/downloads.php) or use XAMPP
- **Composer** - Download from [getcomposer.org](https://getcomposer.org/download/)
- **Git** - Download from [git-scm.com](https://git-scm.com/download/win)

### Recommended Setup
- **XAMPP** - Includes PHP, Apache, MySQL, and phpMyAdmin
- **Windows Terminal** - For better command line experience

## Quick Start (Windows)

1. **Clone or extract the project files to:**
   ```
   C:\COSTAATT\Student Document Upload System\
   ```

2. **Run the setup script:**
   ```cmd
   setup-windows.bat
   ```

3. **Build the frontend:**
   ```cmd
   npm run build
   ```

4. **Start the development server:**
   ```cmd
   php artisan serve
   ```

5. **Open your browser and navigate to:**
   ```
   http://localhost:8000
   ```

## Manual Setup

If you prefer to set up manually or the automated script fails:

### 1. Install Dependencies
```cmd
composer install
npm install
```

### 2. Environment Configuration
```cmd
copy .env.example .env
php artisan key:generate
```

Edit `.env` file with your configuration:
```env
APP_NAME="COSTAATT Student Document Upload System"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite
DB_DATABASE=C:\COSTAATT\Student Document Upload System\database\database.sqlite

LOCAL_STORAGE_ROOT=C:\COSTAATT\Uploaded Files\OneDrive - The College of Science, Technology and Applied Arts of Trinidad and Tobago\Admissions
```

### 3. Database Setup
```cmd
type nul > database\database.sqlite
php artisan migrate
php artisan db:seed
```

### 4. Storage Setup
```cmd
php artisan storage:link
```

Create upload directories:
```cmd
mkdir "C:\COSTAATT\Uploaded Files"
mkdir "C:\COSTAATT\Uploaded Files\OneDrive - The College of Science, Technology and Applied Arts of Trinidad and Tobago"
mkdir "C:\COSTAATT\Uploaded Files\OneDrive - The College of Science, Technology and Applied Arts of Trinidad and Tobago\Admissions"
```

### 5. Build Frontend
```cmd
npm run build
```

### 6. Start Server
```cmd
php artisan serve
```

## Project Structure

```
├── app/
│   ├── Http/Controllers/          # Application controllers
│   ├── Models/                    # Eloquent models
│   └── Services/                  # Business logic services
├── config/                        # Configuration files
├── database/
│   ├── migrations/                # Database migrations
│   └── seeders/                   # Database seeders
├── resources/
│   ├── js/                        # React components and pages
│   ├── css/                       # Stylesheets
│   └── views/                     # Blade templates
├── routes/                        # Route definitions
├── storage/                       # File storage
└── public/                        # Public assets
```

## Usage

### For Students

1. **Access the System**: Visit `http://localhost:8000`
2. **Choose Portal**: Select either Admissions or Registry
3. **Enter Information**: Fill out the student information form
4. **Upload Documents**: Upload required PDF documents
5. **Submit**: Review and submit your application
6. **Confirmation**: Receive email confirmation with reference number

### Document Requirements

#### Admissions Documents
- Birth Certificate (Required)
- National ID Card (Required)
- Passport Photo (Required)
- Academic Transcripts (Required)
- Character Reference (Required)
- Medical Certificate (Required)
- GATE Approval Letter (Required if GATE funding)
- Police Certificate of Character (Optional)
- Registration Form (Optional)
- Fee Payment Receipt (Optional)
- Course Schedule (Optional)
- Student ID Card (Optional)

#### Registry Documents
- Registration Form (Required)
- Fee Payment Receipt (Required)
- Course Schedule (Optional)
- Student ID Card (Optional)

## Configuration

### Microsoft Graph Email (Optional)
To enable email notifications, configure Microsoft Graph API:

```env
GRAPH_TENANT_ID=your_tenant_id
GRAPH_CLIENT_ID=your_client_id
GRAPH_CLIENT_SECRET=your_client_secret
GRAPH_SENDER_UPN=your_sender_email
```

### File Storage
Files are stored in organized directory structure:
```
ADMISSIONS/{year}/{student_id}/{doc_type}/{timestamp-uuid}.pdf
REGISTRY/{year}/{student_id}/{doc_type}/{timestamp-uuid}.pdf
```

## Development

### Running in Development Mode
```cmd
# Terminal 1: Laravel server
php artisan serve

# Terminal 2: Vite dev server (optional)
npm run dev
```

### Building for Production
```cmd
npm run build
deploy-windows-production.bat
```

## API Endpoints

### Web Routes
- `GET /` - Home page
- `GET /student-docs/admissions/start` - Admissions portal
- `GET /student-docs/registry/start` - Registry portal

### API Routes
- `GET /api/programmes` - Get available programmes
- `GET /api/intake-terms` - Get intake terms
- `GET /api/campuses` - Get campuses
- `GET /api/checklist/{programme}/{intakeTerm}/{campus}/{fundingType}` - Get document requirements

## Troubleshooting

### Common Issues

1. **Composer Issues**
   ```cmd
   composer install --ignore-platform-reqs
   ```

2. **Node.js Issues**
   ```cmd
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Permission Issues**
   ```cmd
   icacls "C:\COSTAATT" /grant Users:F /T
   ```

4. **Database Issues**
   ```cmd
   php artisan migrate:fresh --seed
   ```

### Validation Script
Run the validation script to check your setup:
```cmd
validate-windows-setup.bat
```

## Security Features

- **CSRF Protection**: All forms protected with CSRF tokens
- **File Validation**: Strict PDF validation and size limits
- **Input Sanitization**: All user inputs validated and sanitized
- **Secure Storage**: Files stored with unique names and organized structure
- **SQL Injection Protection**: Using Eloquent ORM

## Support

For technical support or issues:
- Check Laravel logs in `storage/logs/`
- Verify all dependencies are installed correctly
- Ensure file permissions are set properly
- Contact the IT Department

## License

This project is proprietary software of The College of Science, Technology and Applied Arts of Trinidad and Tobago (COSTAATT).

## Contributing

This is an internal COSTAATT system. For modifications or enhancements, contact the IT Department.

---

**Note**: This system is designed for internal use at COSTAATT. Ensure proper security measures are in place before deploying to production.
