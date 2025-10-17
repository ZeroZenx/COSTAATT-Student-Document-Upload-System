import React, { useState } from "react";
import { Link, router, useForm } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";
import { 
    DocumentTextIcon, 
    UserGroupIcon, 
    CheckCircleIcon, 
    ClockIcon,
    ArrowDownTrayIcon,
    MagnifyingGlassIcon,
    FunnelIcon
} from "@heroicons/react/24/outline";

export default function AdmissionsReport({ submissions, summary, filters, currentFilters }) {
    const [showFilters, setShowFilters] = useState(false);
    
    const { data, setData, get } = useForm({
        search: currentFilters.search || '',
        programme: currentFilters.programme || '',
        status: currentFilters.status || '',
        nationality: currentFilters.nationality || '',
    });

    const handleFilterChange = (key, value) => {
        setData(key, value);
        // Apply filters immediately
        get('/admin/admissions/report', {
            preserveState: true,
            preserveScroll: true,
            data: {
                ...data,
                [key]: value
            }
        });
    };

    const handleSearch = () => {
        get('/admin/admissions/report', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (data.search) params.append('search', data.search);
        if (data.programme) params.append('programme', data.programme);
        if (data.status) params.append('status', data.status);
        if (data.nationality) params.append('nationality', data.nationality);
        
        window.open(`/admin/admissions/report/export?${params.toString()}`, '_blank');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-100 text-green-800';
            case 'SUBMITTED':
                return 'bg-blue-100 text-blue-800';
            case 'IN_PROGRESS':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'COMPLETED':
                return <CheckCircleIcon className="h-4 w-4" />;
            case 'SUBMITTED':
                return <ClockIcon className="h-4 w-4" />;
            default:
                return <ClockIcon className="h-4 w-4" />;
        }
    };

    return (
        <AppLayout>
            <div className="px-4 py-6 sm:px-0">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Admissions Document Upload Report
                                </h1>
                                <p className="mt-2 text-gray-600">
                                    Track and monitor student document uploads for admissions
                                </p>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="btn-outline flex items-center"
                                >
                                    <FunnelIcon className="h-4 w-4 mr-2" />
                                    Filters
                                </button>
                                <button
                                    onClick={handleExport}
                                    className="btn-primary flex items-center"
                                >
                                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                                    Export CSV
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <UserGroupIcon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Total Students
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {summary.totalStudents}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <DocumentTextIcon className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Total Documents
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {summary.totalDocs}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <DocumentTextIcon className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Avg Docs/Student
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {summary.avgDocs}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <CheckCircleIcon className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Verified
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {summary.verified}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <ClockIcon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Submitted
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {summary.submitted}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    {showFilters && (
                        <div className="bg-white shadow rounded-lg mb-6">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {/* Search */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Search
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Student ID, Name, or Email..."
                                                className="form-input pl-10"
                                                value={data.search}
                                                onChange={(e) => setData('search', e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                            />
                                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                                        </div>
                                    </div>

                                    {/* Programme Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Programme
                                        </label>
                                        <select
                                            className="form-select"
                                            value={data.programme}
                                            onChange={(e) => handleFilterChange('programme', e.target.value)}
                                        >
                                            <option value="">All Programmes</option>
                                            {filters.programmes.map((programme) => (
                                                <option key={programme} value={programme}>
                                                    {programme}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Status Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            className="form-select"
                                            value={data.status}
                                            onChange={(e) => handleFilterChange('status', e.target.value)}
                                        >
                                            <option value="">All Statuses</option>
                                            {filters.statuses.map((status) => (
                                                <option key={status} value={status}>
                                                    {status.replace('_', ' ')}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Nationality Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nationality
                                        </label>
                                        <select
                                            className="form-select"
                                            value={data.nationality}
                                            onChange={(e) => handleFilterChange('nationality', e.target.value)}
                                        >
                                            <option value="">All Nationalities</option>
                                            {filters.nationalities.map((nationality) => (
                                                <option key={nationality} value={nationality}>
                                                    {nationality}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results Table */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Student Submissions ({submissions.total} total)
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                Document upload status for admissions students
                            </p>
                        </div>
                        <ul className="divide-y divide-gray-200">
                            {submissions.data.length === 0 ? (
                                <li className="px-4 py-5 sm:px-6">
                                    <div className="text-center py-8">
                                        <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No submissions found</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Try adjusting your filters or search criteria.
                                        </p>
                                    </div>
                                </li>
                            ) : (
                                submissions.data.map((submission) => (
                                    <li key={submission.id} className="px-4 py-5 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0">
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <span className="text-sm font-medium text-blue-600">
                                                                {submission.student_id.slice(-2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {submission.first_name} {submission.last_name}
                                                        </p>
                                                        <p className="text-sm text-gray-500 truncate">
                                                            {submission.student_id} • {submission.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {submission.programme}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {submission.nationality}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="text-center">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {submission.documents_count}
                                                    </p>
                                                    <p className="text-xs text-gray-500">Documents</p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                                                        {getStatusIcon(submission.status)}
                                                        <span className="ml-1">{submission.status.replace('_', ' ')}</span>
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(submission.updated_at).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {new Date(submission.updated_at).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <Link
                                                        href={`/admin/admissions/view/${submission.id}`}
                                                        className="btn-outline text-xs"
                                                    >
                                                        View Details
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>

                        {/* Pagination */}
                        {submissions.last_page > 1 && (
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    {submissions.prev_page_url && (
                                        <Link
                                            href={submissions.prev_page_url}
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            Previous
                                        </Link>
                                    )}
                                    {submissions.next_page_url && (
                                        <Link
                                            href={submissions.next_page_url}
                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            Next
                                        </Link>
                                    )}
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Showing <span className="font-medium">{submissions.from}</span> to{' '}
                                            <span className="font-medium">{submissions.to}</span> of{' '}
                                            <span className="font-medium">{submissions.total}</span> results
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            {submissions.prev_page_url && (
                                                <Link
                                                    href={submissions.prev_page_url}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                                >
                                                    Previous
                                                </Link>
                                            )}
                                            {submissions.next_page_url && (
                                                <Link
                                                    href={submissions.next_page_url}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                                >
                                                    Next
                                                </Link>
                                            )}
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
