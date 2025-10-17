import { Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { CheckCircleIcon, DocumentTextIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function Confirmation({ submission }) {
    // Safely handle missing properties
    const fullName = submission?.full_name || `${submission?.first_name || ''} ${submission?.last_name || ''}`.trim();
    const fundingTypeDisplay = submission?.funding_type_display || submission?.funding_type || 'Unknown';
    
    if (!submission) {
        return (
            <AppLayout>
                <div className="max-w-3xl mx-auto">
                    <div className="card">
                        <div className="card-body text-center">
                            <h1 className="text-2xl font-bold text-red-600">Error</h1>
                            <p className="text-gray-600">No submission data received.</p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }
    
    return (
        <AppLayout>
            <div className="max-w-3xl mx-auto">
                <div className="card">
                    <div className="card-body text-center">
                        {/* Success Icon */}
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-6">
                            <CheckCircleIcon className="h-6 w-6 text-green-600" />
                        </div>

                        {/* Success Message */}
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Registration Submitted Successfully!
                        </h1>
                        
                        <p className="text-lg text-gray-600 mb-8">
                            Your registry information has been received and is being processed.
                        </p>

                        {/* Reference Number */}
                        <div className="bg-gray-50 rounded-lg p-6 mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                Your Reference Number
                            </h2>
                            <div className="text-3xl font-mono font-bold text-primary-600 mb-2">
                                {submission.reference}
                            </div>
                            <p className="text-sm text-gray-500">
                                Please save this reference number for your records
                            </p>
                        </div>

                        {/* Student Information Summary */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 text-left">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Registration Details</h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Student Name:</span>
                                    <p className="text-sm text-gray-900">{fullName}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Student ID:</span>
                                    <p className="text-sm text-gray-900">{submission.student_id}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Programme:</span>
                                    <p className="text-sm text-gray-900">{submission.programme}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Academic Year:</span>
                                    <p className="text-sm text-gray-900">{submission.academic_year}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Semester:</span>
                                    <p className="text-sm text-gray-900">{submission.semester}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Funding Type:</span>
                                    <p className="text-sm text-gray-900">{fundingTypeDisplay}</p>
                                </div>
                            </div>
                        </div>

                        {/* Uploaded Documents */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 text-left">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <DocumentTextIcon className="h-5 w-5 mr-2" />
                                Uploaded Documents
                            </h3>
                            {submission.documents && submission.documents.length > 0 ? (
                                <div className="space-y-2">
                                    {submission.documents.map((document) => {
                                        const displayName = document.doc_type_display || document.doc_type || 'Unknown Document';
                                        const displaySize = document.formatted_size || (document.size ? `${(document.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown Size');
                                        
                                        return (
                                            <div key={document.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                                <span className="text-sm text-gray-900">
                                                    {displayName}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {displaySize}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No documents were uploaded with this submission.</p>
                            )}
                        </div>

                        {/* Next Steps */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                            <h3 className="text-lg font-medium text-blue-900 mb-4">What Happens Next?</h3>
                            <div className="text-sm text-blue-800 space-y-2">
                                <p>• You will receive a confirmation email at {submission.email || 'your registered email'}</p>
                                <p>• The Registry team will review your registration information</p>
                                <p>• You will be contacted if additional information is required</p>
                                <p>• Processing typically takes 3-5 business days</p>
                                <p>• Your student status will be updated in the system</p>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-gray-50 rounded-lg p-6 mb-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center justify-center">
                                <EnvelopeIcon className="h-5 w-5 mr-2" />
                                Contact Information
                            </h3>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p><strong>Registry Department:</strong></p>
                                <p>Email: <a href="mailto:registry@costaatt.edu.tt" className="text-primary-600 hover:text-primary-500">registry@costaatt.edu.tt</a></p>
                                <p>Phone: (868) 625-5030 ext. 201</p>
                                <p>Hours: Monday - Friday, 8:00 AM - 4:00 PM</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/"
                                className="btn-outline"
                            >
                                Return to Home
                            </Link>
                            <button
                                onClick={() => window.print()}
                                className="btn-primary"
                            >
                                Print Confirmation
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}