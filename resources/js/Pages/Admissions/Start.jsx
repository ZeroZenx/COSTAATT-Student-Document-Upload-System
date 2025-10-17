import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';

export default function Start() {
    console.log('Admissions Start page loading...');
    const [programmes, setProgrammes] = useState([]);
    const [intakeTerms, setIntakeTerms] = useState([]);
    const [campuses, setCampuses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [checklist, setChecklist] = useState([]);
    const [showChecklist, setShowChecklist] = useState(false);
    const [selectedProgramme, setSelectedProgramme] = useState('');
    
    // Post-COMPASS programmes list
    const postCompassProgrammes = [
        'AAS General Nursing',
        'AAS Psychiatric Nursing',
        'AAS Medical Laboratory Technology',
        'AAS Occupational Safety and Health',
        'AAS Environmental Health',
        'AS Biology',
        'AAS Business Administration',
        'AS Management Studies for the Protective Services',
        'AAS Information Technology',
        'AAS Library and Information Studies',
        'AA Literatures in English',
        'AA Film and Video Production',
        'AA Performing Arts: Music',
        'AAS Graphic Design (on hold, advertising BA)',
        'AAS Advertising and Promotions',
        'AA Journalism',
        'AAS Journalism and Public Relations',
        'AA Spanish',
        'AAS Spanish for Business',
        'AAS in Criminal Justice',
        'AA Psychology',
        'AAS Social Work',
        'AS Mathematics',
        'AAS CAT Reporting',
        'AAS in IT – Webpage Development',
        'BSc General Nursing',
        'BSc Psychiatric Nursing',
        'BSc Medical Laboratory Technology',
        'BSc Radiography',
        'BSc Occupational Safety and Health',
        'BSc Environmental Health',
        'BA Accounting',
        'BBA Management and Entrepreneurship',
        'BBA Human Resource Management',
        'BBA Marketing',
        'BSc Information Technology',
        'BSc Networking',
        'BSc Library and Information Science',
        'BA Mass Communication',
        'BA Graphic Design',
        'BA Criminal Justice',
        'BSc Psychology',
        'BSW Social Work',
        'BA in Early Childhood Care and Education',
        'BASC in IT – Webpage Development'
    ];
    
    // Required documents mapping
    const getRequiredDocs = (programme, nationality) => {
        let baseDocs = {};
        
        if (programme.includes('Nursing')) {
            baseDocs = {
                "General Nursing (AAS, BSc)": ["Academic Certificates", "Two Character References", "Police Certificate", "Nursing Council Permit"],
                "Psychiatric Nursing (AAS, BSc)": ["Academic Certificates", "Two Character References", "Police Certificate", "Nursing Council Permit"]
            };
        } else if (programme.includes('Early Childhood')) {
            baseDocs = {
                "Early Childhood Care and Education (BA)": ["Academic Certificates", "Two Character References"]
            };
        } else {
            baseDocs = {
                "Medical Laboratory Technology (AAS, BSc)": ["Academic Certificates", "Police Certificate"],
                "Medical Ultrasound (AdvDip)": ["Academic Certificates", "Police Certificate"],
                "Radiography (BSc)": ["Academic Certificates", "Police Certificate"],
                "Environmental Health (AAS, BSc)": ["Academic Certificates", "Police Certificate"],
                "Occupational Safety and Health (AAS, BSc)": ["Academic Certificates", "Police Certificate"],
                "Social Work (BSW)": ["Academic Certificates", "Police Certificate"]
            };
        }
        
        // Add nationality-specific documents for TT Nationals
        if (nationality === 'TT National') {
            Object.keys(baseDocs).forEach(key => {
                if (key === programme) {
                    baseDocs[key] = ["TT National ID", ...baseDocs[key]];
                    // Add birth certificate for TT Nationals only
                    if (!baseDocs[key].includes("Birth Certificate")) {
                        baseDocs[key].splice(1, 0, "Birth Certificate");
                    }
                }
            });
        }
        
        return baseDocs[programme] || [];
    };
    
    const { data, setData, post, processing, errors } = useForm({
        student_id: '',
        email: '',
        first_name: '',
        last_name: '',
        dob: '',
        programme: '',
        post_compass_programme: '',
        intake_term: '',
        campus: '',
        nationality: '',
        funding_type: 'SELF',
    });

    const loadProgrammes = async () => {
        // Use hardcoded data for now
        console.log('Loading programmes with hardcoded data...');
        const programmesList = [
            'COMPASS',
            'Early Childhood Care and Education (BA)',
            'Medical Laboratory Technology (AAS, BSc)',
            'Medical Ultrasound (AdvDip)',
            'Radiography (BSc)',
            'Environmental Health (AAS, BSc)',
            'Occupational Safety and Health (AAS, BSc)',
            'Social Work (BSW)',
            'General Nursing (AAS, BSc)',
            'Psychiatric Nursing (AAS, BSc)',
        ];
        console.log('Programmes list:', programmesList);
        setProgrammes(programmesList);
    };

    const loadIntakeTerms = async () => {
        // Use hardcoded data for now
        setIntakeTerms([
            'September 2024',
            'January 2025',
            'May 2025',
            'September 2025',
        ]);
    };

    const loadCampuses = async () => {
        // Use hardcoded data for now
        setCampuses([
            'Port of Spain Campus',
            'San Fernando Campus',
            'Tobago Campus',
            'Chaguanas Campus',
        ]);
    };

    const loadChecklist = async () => {
        if (!data.programme || !data.intake_term || !data.campus || !data.funding_type || !data.nationality) {
            setShowChecklist(false);
            return;
        }

        try {
            console.log('Loading checklist for:', data.programme, data.nationality);
            // Use the new function to get required documents based on nationality
            let requiredDocs = getRequiredDocs(data.programme, data.nationality);
            let optionalDocs = [];

            setChecklist({ required: requiredDocs, optional: optionalDocs });
            setShowChecklist(true);
        } catch (error) {
            console.error('Error loading checklist:', error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitting with data:', data);
        setLoading(true);
        
        // Store student ID in localStorage for chatbot
        if (data.student_id) {
            localStorage.setItem('student_id', data.student_id);
        }
        
        post('/student-docs/admissions/start', {
            onSuccess: (page) => {
                console.log('Form submission successful:', page);
                setLoading(false);
            },
            onError: (errors) => {
                console.error('Admissions form errors:', errors);
                setLoading(false);
            }
        });
    };

    // Load data on component mount
    useEffect(() => {
        loadProgrammes();
        loadIntakeTerms();
        loadCampuses();
    }, []);

    // Debug programmes state
    useEffect(() => {
        console.log('Programmes state updated:', programmes);
    }, [programmes]);

    // Load checklist when form data changes
    useEffect(() => {
        loadChecklist();
    }, [data.programme, data.intake_term, data.campus, data.funding_type, data.nationality]);

    return (
        <AppLayout>
            <div className="max-w-3xl mx-auto">
                <div className="card">
                    <div className="card-header">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Student Information - Admissions Applicant Information
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Please provide your personal and academic information to begin the document submission process.
                        </p>
                        
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
                                        Student ID
                                    </label>
                                    <input
                                        type="text"
                                        id="student_id"
                                        value={data.student_id}
                                        onChange={(e) => setData('student_id', e.target.value)}
                                        className="form-input"
                                        placeholder="Enter your student ID (optional)"
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
                                    <label htmlFor="dob" className="form-label">
                                        Date of Birth *
                                    </label>
                                    <input
                                        type="date"
                                        id="dob"
                                        value={data.dob}
                                        onChange={(e) => setData('dob', e.target.value)}
                                        className="form-input"
                                        required
                                    />
                                    {errors.dob && <p className="form-error">{errors.dob}</p>}
                                </div>

                                <div>
                                    <label htmlFor="nationality" className="form-label">
                                        Nationality *
                                    </label>
                                    <select
                                        id="nationality"
                                        value={data.nationality}
                                        onChange={(e) => setData('nationality', e.target.value)}
                                        className="form-input"
                                        required
                                    >
                                        <option value="">Select Nationality</option>
                                        <option value="TT National">TT National</option>
                                        <option value="CARICOM National">CARICOM National</option>
                                        <option value="International">International</option>
                                    </select>
                                    {errors.nationality && <p className="form-error">{errors.nationality}</p>}
                                </div>

                            </div>
                        </div>

                        {/* Academic Information */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Information</h3>
                            
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="programme" className="form-label">
                                        Programme *
                                    </label>
                                    <select
                                        id="programme"
                                        value={data.programme}
                                        onChange={(e) => {
                                            setData('programme', e.target.value);
                                            setSelectedProgramme(e.target.value);
                                        }}
                                        className="form-input"
                                        required
                                    >
                                        <option value="">Select a programme</option>
                                        {programmes.map((programme) => {
                                            console.log('Rendering programme option:', programme);
                                            return (
                                                <option key={programme} value={programme}>
                                                    {programme}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    {errors.programme && <p className="form-error">{errors.programme}</p>}
                                    
                                    {/* Dynamic Required Documents List */}
                                    {selectedProgramme && getRequiredDocs(selectedProgramme, data.nationality).length > 0 && (
                                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <h4 className="text-sm font-semibold text-blue-800 mb-2">
                                                📋 Required Documents for {selectedProgramme}:
                                            </h4>
                                            <ul className="text-sm text-blue-700 space-y-1">
                                                {getRequiredDocs(selectedProgramme, data.nationality).map((doc, i) => (
                                                    <li key={i} className="flex items-center">
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                                        {doc}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    
                                    {/* Post-COMPASS Programme Selection - Only show when COMPASS is selected */}
                                    {data.programme === 'COMPASS' && (
                                        <div className="mt-4">
                                            <label htmlFor="post_compass_programme" className="form-label">
                                                Intended Post-COMPASS Programme *
                                            </label>
                                            <select
                                                id="post_compass_programme"
                                                value={data.post_compass_programme}
                                                onChange={(e) => setData('post_compass_programme', e.target.value)}
                                                className="form-input"
                                                required
                                            >
                                                <option value="">Select intended programme</option>
                                                {postCompassProgrammes.map((programme) => (
                                                    <option key={programme} value={programme}>
                                                        {programme}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.post_compass_programme && <p className="form-error">{errors.post_compass_programme}</p>}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="intake_term" className="form-label">
                                        Intake Term *
                                    </label>
                                    <select
                                        id="intake_term"
                                        value={data.intake_term}
                                        onChange={(e) => setData('intake_term', e.target.value)}
                                        className="form-input"
                                        required
                                    >
                                        <option value="">Select intake term</option>
                                        {intakeTerms.map((term) => (
                                            <option key={term} value={term}>
                                                {term}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.intake_term && <p className="form-error">{errors.intake_term}</p>}
                                </div>

                                <div>
                                    <label htmlFor="campus" className="form-label">
                                        Campus *
                                    </label>
                                    <select
                                        id="campus"
                                        value={data.campus}
                                        onChange={(e) => setData('campus', e.target.value)}
                                        className="form-input"
                                        required
                                    >
                                        <option value="">Select campus</option>
                                        {campuses.map((campus) => (
                                            <option key={campus} value={campus}>
                                                {campus}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.campus && <p className="form-error">{errors.campus}</p>}
                                </div>

                                <div>
                                    <label htmlFor="funding_type" className="form-label">
                                        Funding Type *
                                    </label>
                                    <select
                                        id="funding_type"
                                        value={data.funding_type}
                                        onChange={(e) => setData('funding_type', e.target.value)}
                                        className="form-input"
                                        required
                                    >
                                        <option value="SELF">Self-Funded</option>
                                        <option value="GATE">GATE</option>
                                    </select>
                                    {errors.funding_type && <p className="form-error">{errors.funding_type}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Document Checklist */}
                        {showChecklist && (
                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                                    📋 Required Documents for {data.programme}
                                </h3>
                                <div className="space-y-2">
                                    {checklist.required && checklist.required.map((doc, index) => (
                                        <div key={index} className="flex items-center text-sm text-blue-800">
                                            <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            {doc}
                                        </div>
                                    ))}
                                </div>
                                {checklist.optional && checklist.optional.length > 0 && (
                                    <div className="mt-3">
                                        <h4 className="text-sm font-medium text-blue-800 mb-2">Optional Documents:</h4>
                                        <div className="space-y-1">
                                            {checklist.optional.map((doc, index) => (
                                                <div key={index} className="flex items-center text-sm text-blue-700">
                                                    <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    {doc}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing || loading}
                                className="btn-primary"
                            >
                                {processing || loading ? 'Processing...' : 'Continue to Document Upload'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
