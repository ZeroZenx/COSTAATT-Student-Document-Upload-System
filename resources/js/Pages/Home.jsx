import { Link } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';
import { DocumentTextIcon, AcademicCapIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

export default function Home() {
    return (
        <AppLayout>
            <div className="px-4 py-6 sm:px-0">
                {/* Hero section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
                        Student Document
                        <span className="block text-teal-600">Upload System</span>
                    </h1>
                    <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                        Submit your required documents for admissions or registry processes at COSTAATT.
                        Fast, secure, and easy to use.
                    </p>
                </div>

                {/* Department portals */}
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2">
                    {/* Admissions Portal */}
                    <div className="card hover:shadow-lg transition-shadow duration-300 flex flex-col">
                        <div className="card-body flex flex-col flex-grow text-center">
                            <div className="flex justify-center mb-4">
                                <div className="bg-teal-100 rounded-full p-3 w-16 h-16 flex items-center justify-center">
                                    <AcademicCapIcon className="h-8 w-8 text-teal-600" />
                                </div>
                            </div>
                            
                            <h3 className="text-xl font-medium text-gray-900 mb-2">
                                Admissions Portal
                            </h3>
                            
                            <p className="text-sm text-gray-600 mb-6 flex-grow">
                                Submit your application documents for new student admissions. Upload required certificates, transcripts, and supporting documents.
                            </p>

                            <div className="mt-auto">
                                <Link
                                    href="/student-docs/admissions/start"
                                    className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors w-full justify-center inline-flex items-center"
                                >
                                    Start Admissions Process
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Registry / Bursar Portal */}
                    <div className="card hover:shadow-lg transition-shadow duration-300 flex flex-col">
                        <div className="card-body flex flex-col flex-grow text-center">
                            <div className="flex justify-center mb-4">
                                <div className="bg-blue-100 rounded-full p-3 w-16 h-16 flex items-center justify-center">
                                    <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
                                </div>
                            </div>
                            
                            <h3 className="text-xl font-medium text-gray-900 mb-2">
                                Registry / Bursar Portal
                            </h3>
                            
                            <p className="text-sm text-gray-600 mb-6 flex-grow">
                                Submit documents for current students including course registration, transcript requests, and academic records.
                            </p>

                            <div className="mt-auto">
                                <Link
                                    href="/student-docs/registry/start"
                                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors w-full justify-center inline-flex items-center"
                                >
                                    Start Registry Process
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Information section */}
                <div className="mt-12 bg-teal-50 rounded-lg p-6">
                    <div className="flex items-start">
                        <DocumentTextIcon className="h-6 w-6 text-teal-600 mt-1" />
                        <div className="ml-3">
                            <h3 className="text-lg font-medium text-teal-900">
                                Important Information
                            </h3>
                            <div className="mt-2 text-sm text-teal-700">
                                <ul className="space-y-2">
                                    <li>• All documents must be in PDF format</li>
                                    <li>• Maximum file size: 10MB per document</li>
                                    <li>• You will receive a confirmation email upon successful submission</li>
                                    <li>• Keep your reference number for future correspondence</li>
                                    <li>• Contact the respective department if you have any questions</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Support section */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        Need help? Contact us at{' '}
                        <a href="mailto:admissions@costaatt.edu.tt" className="text-teal-600 hover:text-teal-500">
                            admissions@costaatt.edu.tt
                        </a>
                        {' '}or{' '}
                        <a href="mailto:registry@costaatt.edu.tt" className="text-teal-600 hover:text-teal-500">
                            registry@costaatt.edu.tt
                        </a>
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
