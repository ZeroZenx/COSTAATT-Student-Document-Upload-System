import { Link } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';
import { UserGroupIcon, ClipboardDocumentListIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

export default function Admin() {
    return (
        <AppLayout>
            <div className="px-4 py-6 sm:px-0">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
                        Staff
                        <span className="block text-primary-600">Administrative Portal</span>
                    </h1>
                    <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                        Access administrative dashboards to manage student submissions and document processing.
                    </p>
                </div>

                {/* Staff Access Section */}
                <div className="mt-12 bg-gray-50 rounded-lg p-8">
                    <div className="text-center mb-8">
                        <UserGroupIcon className="mx-auto h-12 w-12 text-primary-600 mb-4" />
                        <h3 className="text-2xl font-medium text-gray-900 mb-4">Staff Access</h3>
                        <p className="text-lg text-gray-600 mb-6">
                            Authorized staff can access administrative dashboards to manage submissions.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto">
                        {/* Admissions Dashboard */}
                        <div className="card hover:shadow-lg transition-shadow duration-300">
                            <div className="card-body text-center">
                                <div className="flex justify-center mb-4">
                                    <AcademicCapIcon className="h-12 w-12 text-primary-600" />
                                </div>
                                <h4 className="text-xl font-medium text-gray-900 mb-2">
                                    Admissions Dashboard
                                </h4>
                                <p className="text-sm text-gray-600 mb-6">
                                    Manage student admissions submissions, view documents, and track processing status.
                                </p>
                                
                                <Link
                                    href="/admin/admissions"
                                    className="btn-primary w-full justify-center"
                                >
                                    Access Admissions Dashboard
                                </Link>
                            </div>
                        </div>

                        {/* Registry Dashboard */}
                        <div className="card hover:shadow-lg transition-shadow duration-300">
                            <div className="card-body text-center">
                                <div className="flex justify-center mb-4">
                                    <ClipboardDocumentListIcon className="h-12 w-12 text-secondary-600" />
                                </div>
                                <h4 className="text-xl font-medium text-gray-900 mb-2">
                                    Registry Dashboard
                                </h4>
                                <p className="text-sm text-gray-600 mb-6">
                                    Manage course registration submissions and student enrollment documents.
                                </p>
                                
                                <Link
                                    href="/admin/registry"
                                    className="btn-secondary w-full justify-center"
                                >
                                    Access Registry Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
                    <div className="text-center">
                        <div className="bg-primary-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <svg className="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">View Submissions</h3>
                        <p className="text-sm text-gray-600">
                            Browse and search through all student submissions with detailed filtering options.
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="bg-secondary-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <svg className="h-8 w-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Download Documents</h3>
                        <p className="text-sm text-gray-600">
                            Securely download and access all uploaded documents with proper validation.
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Export Reports</h3>
                        <p className="text-sm text-gray-600">
                            Generate CSV reports for data analysis and administrative tracking.
                        </p>
                        <div className="mt-4 space-y-2">
                            <Link
                                href="/admin/admissions/report"
                                className="block text-sm text-primary-600 hover:text-primary-500"
                            >
                                📊 Admissions Reports
                            </Link>
                            <Link
                                href="/admin/registry/report"
                                className="block text-sm text-secondary-600 hover:text-secondary-500"
                            >
                                📈 Registry Reports
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Support section */}
                <div className="mt-12 text-center">
                    <p className="text-sm text-gray-500">
                        Need help? Contact us at{' '}
                        <a href="mailto:admissions@costaatt.edu.tt" className="text-primary-600 hover:text-primary-500">
                            admissions@costaatt.edu.tt
                        </a>
                        {' '}or{' '}
                        <a href="mailto:registry@costaatt.edu.tt" className="text-primary-600 hover:text-primary-500">
                            registry@costaatt.edu.tt
                        </a>
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
