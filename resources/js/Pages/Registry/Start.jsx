import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';

export default function Start() {
    console.log('Registry Start page loading...');
    
    const [insuranceReady, setInsuranceReady] = useState('');
    const [fundingStatus, setFundingStatus] = useState('');
    const [paymentTermsReady, setPaymentTermsReady] = useState('');
    const [loading, setLoading] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        student_id: '',
        email: '',
        first_name: '',
        last_name: '',
        academic_year: '',
        semester: '',
        funding_status: '',
        insurance_form: null,
        gate_application: null,
        payment_terms_form: null,
    });

    const handleFileChange = (fieldName, file) => {
        setData(fieldName, file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitting with data:', data);
        setLoading(true);
        
        // Store student ID in localStorage for chatbot
        if (data.student_id) {
            localStorage.setItem('student_id', data.student_id);
        }
        
        post('/student-docs/registry/start', {
            forceFormData: true, // Important for file uploads
            onSuccess: () => {
                console.log('Form submission successful');
                setLoading(false);
            },
            onError: (errors) => {
                console.error('Registry form errors:', errors);
                setLoading(false);
            }
        });
    };

    const showInsuranceUpload = insuranceReady === 'yes';
    const showGateUpload = fundingStatus === 'gate';
    const showPaymentUpload = paymentTermsReady === 'no';

    return (
        <AppLayout>
            <div className="max-w-3xl mx-auto">
                <div className="card">
                    <div className="card-header">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Student Information - Registry / Bursar
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Please provide your personal and academic information to begin the document submission process.
                        </p>
                        
                        {/* Form Instructions */}
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h3 className="text-sm font-semibold text-yellow-800 mb-2">
                                📋 Form Instructions:
                            </h3>
                            <ul className="text-sm text-yellow-700 space-y-1">
                                <li>Please provide your personal and academic information below</li>
                                <li>Document uploads will be handled in the next step</li>
                                <li>All fields marked with * are required</li>
                            </ul>
                            
                            <div className="mt-3 pt-3 border-t border-yellow-300">
                                <h4 className="text-sm font-semibold text-yellow-800 mb-2">
                                    📄 Required Documents:
                                </h4>
                                <ul className="text-sm text-yellow-700 space-y-1">
                                    <li>• Insurance Form – must be submitted once per academic year</li>
                                    <li>• GATE Application – must be submitted every semester of registration</li>
                                    <li>• Payment Terms & Conditions – required every semester</li>
                                </ul>
                            </div>
                        </div>
                        
                        {/* Back to Home Button */}
                        <div className="mt-4">
                            <a
                                href="/"
                                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Home
                            </a>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="card-body space-y-6">
                        {/* Personal Information */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                            
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="student_id" className="form-label">
                                        Student ID *
                                    </label>
                                    <input
                                        type="text"
                                        id="student_id"
                                        value={data.student_id}
                                        onChange={(e) => setData('student_id', e.target.value)}
                                        className="form-input"
                                        placeholder="Enter your student ID"
                                        required
                                    />
                                    {errors.student_id && <p className="form-error">{errors.student_id}</p>}
                                </div>

                                <div>
                                    <label htmlFor="email" className="form-label">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="form-input"
                                        placeholder="Enter your email address"
                                        required
                                    />
                                    {errors.email && <p className="form-error">{errors.email}</p>}
                                </div>

                                <div>
                                    <label htmlFor="first_name" className="form-label">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="first_name"
                                        value={data.first_name}
                                        onChange={(e) => setData('first_name', e.target.value)}
                                        className="form-input"
                                        placeholder="Enter your first name"
                                        required
                                    />
                                    {errors.first_name && <p className="form-error">{errors.first_name}</p>}
                                </div>

                                <div>
                                    <label htmlFor="last_name" className="form-label">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="last_name"
                                        value={data.last_name}
                                        onChange={(e) => setData('last_name', e.target.value)}
                                        className="form-input"
                                        placeholder="Enter your last name"
                                        required
                                    />
                                    {errors.last_name && <p className="form-error">{errors.last_name}</p>}
                                </div>

                                <div>
                                    <label htmlFor="academic_year" className="form-label">
                                        Academic Year *
                                    </label>
                                    <select
                                        id="academic_year"
                                        value={data.academic_year}
                                        onChange={(e) => setData('academic_year', e.target.value)}
                                        className="form-select"
                                        required
                                    >
                                        <option value="">Select Academic Year</option>
                                        <option value="2025-2026">2025–2026</option>
                                        <option value="2026-2027">2026–2027</option>
                                    </select>
                                    {errors.academic_year && <p className="form-error">{errors.academic_year}</p>}
                                </div>

                                <div>
                                    <label htmlFor="semester" className="form-label">
                                        Semester *
                                    </label>
                                    <select
                                        id="semester"
                                        value={data.semester}
                                        onChange={(e) => setData('semester', e.target.value)}
                                        className="form-select"
                                        required
                                    >
                                        <option value="">Select Semester</option>
                                        <option value="Semester I">Semester I</option>
                                        <option value="Semester II">Semester II</option>
                                    </select>
                                    {errors.semester && <p className="form-error">{errors.semester}</p>}
                                </div>

                                <div>
                                    <label htmlFor="funding_status" className="form-label">
                                        Funding Status *
                                    </label>
                                    <select
                                        id="funding_status"
                                        value={data.funding_status}
                                        onChange={(e) => setData('funding_status', e.target.value)}
                                        className="form-select"
                                        required
                                    >
                                        <option value="">Select Funding Status</option>
                                        <option value="self-funded">Self-funded</option>
                                        <option value="seeking GATE funding">Seeking GATE funding</option>
                                        <option value="sponsored by organization/private sponsor">Sponsored by organization/private sponsor</option>
                                    </select>
                                    {errors.funding_status && <p className="form-error">{errors.funding_status}</p>}
                                </div>
                            </div>
                        </div>


                        {/* Insurance Form Section */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Insurance Form Section</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Do you need to submit an Insurance Form for this academic year?
                            </p>
                            <div className="space-y-3">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="insuranceReady"
                                        value="yes"
                                        checked={insuranceReady === 'yes'}
                                        onChange={(e) => setInsuranceReady(e.target.value)}
                                        className="form-radio"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Yes, I need to submit an Insurance Form</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="insuranceReady"
                                        value="no"
                                        checked={insuranceReady === 'no'}
                                        onChange={(e) => setInsuranceReady(e.target.value)}
                                        className="form-radio"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">No, I have already submitted or do not need one</span>
                                </label>
                            </div>

                            {showInsuranceUpload && (
                                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <label htmlFor="insurance_form" className="form-label">
                                        Upload Insurance Form (PDF only, max 10MB)
                                    </label>
                                    <input
                                        type="file"
                                        id="insurance_form"
                                        accept=".pdf"
                                        onChange={(e) => handleFileChange('insurance_form', e.target.files[0])}
                                        className="form-input"
                                    />
                                    {errors.insurance_form && <p className="form-error">{errors.insurance_form}</p>}
                                </div>
                            )}
                        </div>

                        {/* GATE Application Section */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">GATE Application Section</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Are you applying for or have GATE funding?
                            </p>
                            <div className="space-y-3">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="fundingStatus"
                                        value="gate"
                                        checked={fundingStatus === 'gate'}
                                        onChange={(e) => setFundingStatus(e.target.value)}
                                        className="form-radio"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Yes, I am applying for or have GATE funding</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="fundingStatus"
                                        value="self"
                                        checked={fundingStatus === 'self'}
                                        onChange={(e) => setFundingStatus(e.target.value)}
                                        className="form-radio"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">No, I am self-funded</span>
                                </label>
                            </div>

                            {showGateUpload && (
                                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <label htmlFor="gate_application" className="form-label">
                                        Upload GATE Application Documents (PDF only, max 10MB)
                                    </label>
                                    <input
                                        type="file"
                                        id="gate_application"
                                        accept=".pdf"
                                        onChange={(e) => handleFileChange('gate_application', e.target.files[0])}
                                        className="form-input"
                                    />
                                    {errors.gate_application && <p className="form-error">{errors.gate_application}</p>}
                                </div>
                            )}
                        </div>

                        {/* Payment Terms and Conditions Section */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Terms and Conditions Section</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Have you previously submitted the Payment Terms and Conditions Form?
                            </p>
                            <div className="space-y-3">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="paymentTermsReady"
                                        value="yes"
                                        checked={paymentTermsReady === 'yes'}
                                        onChange={(e) => setPaymentTermsReady(e.target.value)}
                                        className="form-radio"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Yes, I have already submitted this form</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="paymentTermsReady"
                                        value="no"
                                        checked={paymentTermsReady === 'no'}
                                        onChange={(e) => setPaymentTermsReady(e.target.value)}
                                        className="form-radio"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">No, I need to submit this form</span>
                                </label>
                            </div>

                            {showPaymentUpload && (
                                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <label htmlFor="payment_terms_form" className="form-label">
                                        Upload Payment Terms and Conditions Form (PDF only, max 10MB)
                                    </label>
                                    <input
                                        type="file"
                                        id="payment_terms_form"
                                        accept=".pdf"
                                        onChange={(e) => handleFileChange('payment_terms_form', e.target.files[0])}
                                        className="form-input"
                                    />
                                    {errors.payment_terms_form && <p className="form-error">{errors.payment_terms_form}</p>}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing || loading}
                                className="btn-primary"
                            >
                                {processing || loading ? 'Submitting...' : 'Submit Documents'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}