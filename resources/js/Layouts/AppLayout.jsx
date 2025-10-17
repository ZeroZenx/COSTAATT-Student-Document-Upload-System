import { Head } from '@inertiajs/react';
import StudentServicesDigitalEmployee from '../Components/Chatbot/StudentServicesDigitalEmployee';

export default function AppLayout({ children }) {

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="COSTAATT Student Document Upload System" />
            

            {/* Main content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <p className="text-base text-gray-500">
                            &copy; {new Date().getFullYear()} College of Science, Technology and Applied Arts of Trinidad and Tobago
                        </p>
                        <p className="text-base text-gray-500">
                            Student Document Upload System v1.0.0
                        </p>
                        <p className="mt-2 text-sm text-gray-400">
                            Powered by the Technology Services Department.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Student Services Digital Employee Chatbot */}
            <StudentServicesDigitalEmployee />
        </div>
    );
}
