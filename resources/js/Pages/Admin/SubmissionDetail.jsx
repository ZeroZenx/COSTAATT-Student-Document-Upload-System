import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { 
    DocumentArrowDownIcon, 
    ArrowLeftIcon,
    EnvelopeIcon,
    CalendarIcon,
    UserIcon,
    AcademicCapIcon,
    MapPinIcon
} from '@heroicons/react/24/outline';

export default function SubmissionDetail({ submission, department }) {
    const [isUpdating, setIsUpdating] = useState(false);
    
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'IN_PROGRESS':
                return 'badge-warning';
            case 'SUBMITTED':
                return 'badge-info';
            case 'PROCESSING':
                return 'badge-warning';
            case 'COMPLETED':
                return 'badge-success';
            default:
                return 'badge-error';
        }
    };

    const getStatusDisplay = (status) => {
        const statusMap = {
            'IN_PROGRESS': 'In Progress',
            'SUBMITTED': 'Submitted',
            'PROCESSING': 'Processing',
            'COMPLETED': 'Completed',
        };
        return statusMap[status] || status;
    };

    const downloadDocument = (documentId) => {
        window.open(`/admin/${department}/download/${documentId}`, '_blank');
    };

    const updateStatus = (newStatus) => {
        if (newStatus === submission.status) {
            return; // Don't update if status is the same
        }
        
        setIsUpdating(true);
        
        router.post(`/admin/${department}/update-status/${submission.id}`, {
            status: newStatus
        }, {
            preserveScroll: true,
            preserveState: false, // This will refresh the page data
            onSuccess: () => {
                setIsUpdating(false);
                console.log('Status updated successfully to:', newStatus);
            },
            onError: (errors) => {
                setIsUpdating(false);
                console.error('Error updating status:', errors);
                alert('Error updating status. Please try again.');
            }
        });
    };

    return (
        <AppLayout>
            <Head title={`${submission.first_name} ${submission.last_name} - ${department.charAt(0).toUpperCase() + department.slice(1)} Submission`} />
            
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/admin/${department}`}
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-1" />
                        Back to {department.charAt(0).toUpperCase() + department.slice(1)} Dashboard
                    </Link>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {submission.first_name} {submission.last_name}
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Student ID: {submission.student_id} | Reference: {submission.reference}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`badge ${getStatusBadgeClass(submission.status)} text-lg px-4 py-2`}>
                                {getStatusDisplay(submission.status)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Student Information */}
                    <div className="lg:col-span-2">
                        <div className="card mb-6">
                            <div className="card-header">
                                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                    <UserIcon className="h-5 w-5 mr-2" />
                                    Student Information
                                </h2>
                            </div>
                            <div className="card-body">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Student ID</label>
                                        <p className="text-lg text-gray-900">{submission.student_id}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Email</label>
                                        <p className="text-lg text-gray-900">{submission.email}</p>
                                    </div>
                                    {submission.dob && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                                            <p className="text-lg text-gray-900">
                                                {new Date(submission.dob).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Funding Type</label>
                                        <p className="text-lg text-gray-900">
                                            {submission.funding_type === 'GATE' ? 'GATE' : 'Self-Funded'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card mb-6">
                            <div className="card-header">
                                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                    <AcademicCapIcon className="h-5 w-5 mr-2" />
                                    Academic Information
                                </h2>
                            </div>
                            <div className="card-body">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Programme</label>
                                        <p className="text-lg text-gray-900">{submission.programme}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Intake Term</label>
                                        <p className="text-lg text-gray-900">{submission.intake_term}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Campus</label>
                                        <p className="text-lg text-gray-900 flex items-center">
                                            <MapPinIcon className="h-4 w-4 mr-1" />
                                            {submission.campus}
                                        </p>
                                    </div>
                                    {submission.academic_year && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Academic Year</label>
                                            <p className="text-lg text-gray-900">{submission.academic_year}</p>
                                        </div>
                                    )}
                                    {submission.semester && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Semester</label>
                                            <p className="text-lg text-gray-900">{submission.semester}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                    <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                                    Uploaded Documents ({submission.documents.length})
                                </h2>
                            </div>
                            <div className="card-body">
                                {submission.documents.length > 0 ? (
                                    <div className="space-y-4">
                                        {submission.documents.map((document) => (
                                            <div key={document.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0">
                                                        <DocumentArrowDownIcon className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <h3 className="text-sm font-medium text-gray-900">
                                                            {document.doc_type_display}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">
                                                            {document.original_name} • {document.formatted_size}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            Uploaded: {new Date(document.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => downloadDocument(document.id)}
                                                    className="btn-primary flex items-center gap-2"
                                                >
                                                    <DocumentArrowDownIcon className="h-4 w-4" />
                                                    Download
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">No documents uploaded yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status Update */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="text-lg font-semibold text-gray-900">Update Status</h3>
                            </div>
                            <div className="card-body">
                                <div className="space-y-2">
                                    {['IN_PROGRESS', 'SUBMITTED', 'PROCESSING', 'COMPLETED'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => updateStatus(status)}
                                            disabled={isUpdating}
                                            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                                isUpdating 
                                                    ? 'cursor-not-allowed opacity-50'
                                                    : 'cursor-pointer hover:shadow-sm'
                                            } ${
                                                submission.status === status
                                                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-300 shadow-sm'
                                                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                            }`}
                                        >
                                            {isUpdating ? (
                                                <span className="flex items-center">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                                    Updating...
                                                </span>
                                            ) : (
                                                getStatusDisplay(status)
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Submission Details */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <CalendarIcon className="h-5 w-5 mr-2" />
                                    Submission Details
                                </h3>
                            </div>
                            <div className="card-body">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Reference Number</label>
                                        <p className="text-lg font-mono text-gray-900">{submission.reference}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Submission Date</label>
                                        <p className="text-lg text-gray-900">
                                            {new Date(submission.created_at).toLocaleDateString()} at {new Date(submission.created_at).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Last Updated</label>
                                        <p className="text-lg text-gray-900">
                                            {new Date(submission.updated_at).toLocaleDateString()} at {new Date(submission.updated_at).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <EnvelopeIcon className="h-5 w-5 mr-2" />
                                    Contact
                                </h3>
                            </div>
                            <div className="card-body">
                                <div className="space-y-2">
                                    <a
                                        href={`mailto:${submission.email}`}
                                        className="block text-sm text-primary-600 hover:text-primary-800"
                                    >
                                        {submission.email}
                                    </a>
                                    <p className="text-sm text-gray-500">
                                        Department: {department.charAt(0).toUpperCase() + department.slice(1)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                            </div>
                            <div className="card-body">
                                <div className="space-y-3">
                                    <button
                                        onClick={() => window.open(`/admin/${department}/export?search=${submission.student_id}`, '_blank')}
                                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200 text-left font-medium"
                                    >
                                        📊 Export Student Data
                                    </button>
                                    <a
                                        href={`mailto:${submission.email}?subject=Regarding your ${department} submission - ${submission.reference}&body=Dear ${submission.first_name} ${submission.last_name},%0D%0A%0D%0AThis email is regarding your ${department} submission with reference number ${submission.reference}.%0D%0A%0D%0APlease let us know if you have any questions.%0D%0A%0D%0ABest regards,%0D%0A${department.charAt(0).toUpperCase() + department.slice(1)} Department`}
                                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200 text-center font-medium block"
                                    >
                                        ✉️ Send Email
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
