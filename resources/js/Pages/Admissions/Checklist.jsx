import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { CheckCircleIcon, AcademicCapIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function Checklist({ submission }) {
    const [checklist, setChecklist] = useState([]);
    const [uploading, setUploading] = useState({});
    const [loading, setLoading] = useState(true);

    const { post, processing } = useForm();

    useEffect(() => {
        loadChecklist();
    }, []);

    const loadChecklist = async () => {
        try {
            const nationality = encodeURIComponent(submission.nationality || '');
            const url = `/api-checklist/ADMISSIONS/${encodeURIComponent(submission.programme)}/${encodeURIComponent(submission.intake_term)}/${encodeURIComponent(submission.campus)}/${submission.funding_type}/${nationality}`;
            console.log('Loading checklist from URL:', url);
            console.log('Submission data:', submission);
            console.log('Nationality:', submission.nationality);
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Checklist data received:', data);
            console.log('Number of documents after nationality filtering:', data.length);
            setChecklist(data);
        } catch (error) {
            console.error('Error loading checklist:', error);
            // Show a fallback message if API fails
            setChecklist([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (docType, file) => {
        if (!file) return;

        // Validate file type
        if (file.type !== 'application/pdf') {
            alert('Please upload only PDF files.');
            return;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB.');
            return;
        }

        setUploading(prev => ({ ...prev, [docType]: true }));

        const formData = new FormData();
        formData.append('document', file);

        try {
            const response = await fetch(`/student-docs/admissions/document/${submission.id}/${docType}/upload`, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
            });

            if (response.ok) {
                // Show success message
                alert('✅ Document uploaded successfully! A confirmation email has been sent to your registered email address.');
                // Reload the submission to get updated documents
                window.location.reload();
            } else {
                const errorText = await response.text();
                alert(`❌ Upload failed: ${errorText || 'Please try again.'}`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(prev => ({ ...prev, [docType]: false }));
        }
    };

    const handleSubmit = () => {
        const requiredDocs = checklist.filter(doc => doc.required);
        const uploadedRequiredDocs = submission.documents.map(doc => doc.doc_type);
        const missingRequired = requiredDocs.filter(doc => !uploadedRequiredDocs.includes(doc.doc_type));

        if (missingRequired.length > 0) {
            alert(`Please upload all required documents: ${missingRequired.map(doc => doc.display_name).join(', ')}`);
            return;
        }

        post(`/student-docs/admissions/submit/${submission.id}`);
    };

    const getDocumentStatus = (docType) => {
        const uploaded = submission.documents.find(doc => doc.doc_type === docType);
        return uploaded ? 'uploaded' : 'missing';
    };

    const isRequiredComplete = () => {
        const requiredDocs = checklist.filter(doc => doc.required);
        const uploadedRequiredDocs = submission.documents.map(doc => doc.doc_type);
        return requiredDocs.every(doc => uploadedRequiredDocs.includes(doc.doc_type));
    };

    const handleFinalizeSubmission = async () => {
        if (!window.confirm('Are you sure you want to finalize your submission? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch('/api/admissions/finalize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify({
                    student_id: submission.student_id
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(`✅ Submission finalized successfully!\n\nReference Number: ${data.reference || 'N/A'}\n\nCheck your email for confirmation.`);
                // Redirect to confirmation page
                window.location.href = `/student-docs/admissions/confirmation/${submission.id}`;
            } else {
                const errorMessage = data.message || 'Unknown error occurred';
                alert(`⚠️ Error finalizing submission:\n\n${errorMessage}`);
                
                if (data.missing_documents) {
                    alert(`Missing required documents:\n${data.missing_documents.join(', ')}`);
                }
            }
        } catch (error) {
            console.error('Finalization error:', error);
            alert('⚠️ Network error. Please check your connection and try again.');
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="px-4 py-6 sm:px-0">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading document checklist...</p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="px-4 py-6 sm:px-0">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="bg-primary-100 rounded-full p-3 w-16 h-16 flex items-center justify-center">
                                <AcademicCapIcon className="h-8 w-8 text-primary-600" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Admissions Document Upload
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Upload your required documents for new student admissions
                        </p>
                    </div>

                    {/* Student Info */}
                    <div className="card mb-6">
                        <div className="card-body">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Student Information</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium">Name:</span> {submission.first_name} {submission.last_name}
                                </div>
                                <div>
                                    <span className="font-medium">Student ID:</span> {submission.student_id || 'Not provided'}
                                </div>
                                <div>
                                    <span className="font-medium">Programme:</span> {submission.programme}
                                </div>
                                <div>
                                    <span className="font-medium">Nationality:</span> {submission.nationality}
                                </div>
                                <div>
                                    <span className="font-medium">Intake Term:</span> {submission.intake_term}
                                </div>
                                <div>
                                    <span className="font-medium">Campus:</span> {submission.campus}
                                </div>
                                <div>
                                    <span className="font-medium">Reference:</span> {submission.reference}
                                </div>
                            </div>
                            
                            {/* Document Requirements Notice */}
                            {submission.nationality && submission.nationality !== 'TT National' && (
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>Notice:</strong> As a {submission.nationality}, certain documents like TT National ID and Birth Certificate are not required for your application.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Document Checklist */}
                    <div className="card">
                        <div className="card-body">
                            <h3 className="text-lg font-medium text-gray-900 mb-6">Required Documents</h3>
                            
                            <div className="space-y-4">
                                {checklist.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 mb-2">No documents found for this programme and nationality combination.</p>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Programme: {submission.programme}<br/>
                                            Nationality: {submission.nationality}<br/>
                                            Campus: {submission.campus}<br/>
                                            Intake Term: {submission.intake_term}
                                        </p>
                                        <p className="text-sm text-gray-500">Please contact the admissions office if you believe this is an error.</p>
                                        <p className="text-xs text-gray-400 mt-2">Debug URL: /api-checklist/ADMISSIONS/{encodeURIComponent(submission.programme)}/{encodeURIComponent(submission.intake_term)}/{encodeURIComponent(submission.campus)}/{submission.funding_type}/{encodeURIComponent(submission.nationality || '')}</p>
                                    </div>
                                ) : (
                                    checklist.map((doc) => {
                                    const status = getDocumentStatus(doc.doc_type);
                                    const isUploading = uploading[doc.doc_type];

                                    return (
                                        <div key={doc.doc_type} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    {status === 'uploaded' ? (
                                                        <CheckCircleIcon className="h-6 w-6 text-green-600" />
                                                    ) : doc.required ? (
                                                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                                                    ) : (
                                                        <div className="h-6 w-6 rounded-full border-2 border-gray-300"></div>
                                                    )}
                                                    
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">
                                                            {doc.display_name}
                                                            {doc.required && <span className="text-red-600 ml-1">*</span>}
                                                        </h4>
                                                        <p className="text-sm text-gray-600">
                                                            {status === 'uploaded' ? 'Document uploaded' : 
                                                             doc.required ? 'Required document' : 'Optional document'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    {status === 'uploaded' && (
                                                        <a
                                                            href={`/student-docs/admissions/document/${submission.id}/${submission.documents.find(d => d.doc_type === doc.doc_type)?.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                                                        >
                                                            View Document
                                                        </a>
                                                    )}
                                                    
                                                    <input
                                                        type="file"
                                                        accept=".pdf"
                                                        onChange={(e) => handleFileUpload(doc.doc_type, e.target.files[0])}
                                                        disabled={isUploading}
                                                        className="hidden"
                                                        id={`file-${doc.doc_type}`}
                                                    />
                                                    
                                                    <label
                                                        htmlFor={`file-${doc.doc_type}`}
                                                        className={`btn ${status === 'uploaded' ? 'btn-outline' : 'btn-primary'} ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                    >
                                                        {isUploading ? 'Uploading...' : 
                                                         status === 'uploaded' ? 'Replace' : 'Upload'}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                                )}
                            </div>

                            {/* Submit Buttons */}
                            <div className="mt-8 flex justify-end space-x-4">
                                <button
                                    onClick={handleSubmit}
                                    disabled={processing || !isRequiredComplete()}
                                    className={`btn ${isRequiredComplete() ? 'btn-primary' : 'btn-outline opacity-50 cursor-not-allowed'}`}
                                >
                                    {processing ? 'Submitting...' : 'Submit Documents'}
                                </button>
                                
                                {isRequiredComplete() && (
                                    <button
                                        onClick={handleFinalizeSubmission}
                                        disabled={processing}
                                        className="btn bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        {processing ? 'Finalizing...' : 'Submit All Documents'}
                                    </button>
                                )}
                            </div>

                            {!isRequiredComplete() && (
                                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex">
                                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                                        <div className="ml-3">
                                            <p className="text-sm text-yellow-800">
                                                Please upload all required documents before submitting.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="mt-6 bg-gray-50 rounded-lg p-6">
                        <h4 className="font-medium text-gray-900 mb-2">Upload Instructions</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• All documents must be in PDF format</li>
                            <li>• Maximum file size: 10MB per document</li>
                            <li>• Ensure documents are clear and readable</li>
                            <li>• Required documents are marked with a red asterisk (*)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}