import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { useState } from 'react';
import { 
    MagnifyingGlassIcon, 
    DocumentArrowDownIcon, 
    EyeIcon,
    FunnelIcon,
    XMarkIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

export default function AdmissionsDashboard({ submissions, filters, currentFilters }) {
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState(currentFilters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/admissions', { search: searchTerm }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleFilterChange = (filterName, value) => {
        const newFilters = { ...currentFilters, [filterName]: value };
        router.get('/admin/admissions', newFilters, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        router.get('/admin/admissions', {}, {
            preserveState: true,
            replace: true,
        });
    };

    const exportCsv = () => {
        const params = new URLSearchParams(currentFilters);
        window.open(`/admin/admissions/export?${params.toString()}`, '_blank');
    };

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
        return filters.statuses[status] || status;
    };

    const handleDelete = (submissionId, studentName) => {
        if (confirm(`Are you sure you want to delete the submission for ${studentName}? This action cannot be undone.`)) {
            router.delete(`/admin/admissions/delete/${submissionId}`, {
                onSuccess: () => {
                    console.log('Submission deleted successfully');
                },
                onError: (errors) => {
                    console.error('Error deleting submission:', errors);
                    alert('Error deleting submission. Please try again.');
                }
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Admissions Admin Dashboard" />
            
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Admissions Dashboard</h1>
                            <p className="mt-2 text-gray-600">
                                Manage and review student admissions document submissions
                            </p>
                        </div>
                        <Link
                            href="/admin/terms"
                            className="btn btn-outline"
                        >
                            Manage Terms
                        </Link>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="card mb-6">
                    <div className="card-body">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            {/* Search */}
                            <form onSubmit={handleSearch} className="flex-1 max-w-md">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by student ID, name, email, or programme..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="form-input pl-10"
                                    />
                                </div>
                            </form>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="btn-outline flex items-center gap-2"
                                >
                                    <FunnelIcon className="h-4 w-4" />
                                    Filters
                                </button>
                                <button
                                    onClick={exportCsv}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    <DocumentArrowDownIcon className="h-4 w-4" />
                                    Export CSV
                                </button>
                            </div>
                        </div>

                        {/* Advanced Filters */}
                        {showFilters && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <label className="form-label">Intake Term</label>
                                        <select
                                            value={currentFilters.intake_term || ''}
                                            onChange={(e) => handleFilterChange('intake_term', e.target.value)}
                                            className="form-input"
                                        >
                                            <option value="">All Terms</option>
                                            {filters.intakeTerms.map((term) => (
                                                <option key={term} value={term}>{term}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="form-label">Status</label>
                                        <select
                                            value={currentFilters.status || ''}
                                            onChange={(e) => handleFilterChange('status', e.target.value)}
                                            className="form-input"
                                        >
                                            <option value="">All Statuses</option>
                                            {Object.entries(filters.statuses).map(([key, value]) => (
                                                <option key={key} value={key}>{value}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="form-label">Funding Type</label>
                                        <select
                                            value={currentFilters.funding_type || ''}
                                            onChange={(e) => handleFilterChange('funding_type', e.target.value)}
                                            className="form-input"
                                        >
                                            <option value="">All Types</option>
                                            {Object.entries(filters.fundingTypes).map(([key, value]) => (
                                                <option key={key} value={key}>{value}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="form-label">Campus</label>
                                        <select
                                            value={currentFilters.campus || ''}
                                            onChange={(e) => handleFilterChange('campus', e.target.value)}
                                            className="form-input"
                                        >
                                            <option value="">All Campuses</option>
                                            {filters.campuses.map((campus) => (
                                                <option key={campus} value={campus}>{campus}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={clearFilters}
                                        className="btn-outline flex items-center gap-2"
                                    >
                                        <XMarkIcon className="h-4 w-4" />
                                        Clear Filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Submissions Table */}
                <div className="card">
                    <div className="card-body p-0">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Student
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Programme
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Campus
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Funding
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Documents
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Submitted
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {submissions.data.map((submission) => (
                                        <tr key={submission.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {submission.first_name} {submission.last_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {submission.student_id}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {submission.email}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{submission.programme}</div>
                                                <div className="text-sm text-gray-500">{submission.intake_term}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {submission.campus}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {filters.fundingTypes[submission.funding_type]}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`badge ${getStatusBadgeClass(submission.status)}`}>
                                                    {getStatusDisplay(submission.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {submission.documents_count} files
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(submission.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-3">
                                                    <Link
                                                        href={`/admin/admissions/view/${submission.id}`}
                                                        className="text-primary-600 hover:text-primary-900 flex items-center gap-1"
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                        View
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(submission.id, `${submission.first_name} ${submission.last_name}`)}
                                                        className="text-red-600 hover:text-red-900 flex items-center gap-1"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {submissions.links && (
                            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing {submissions.from} to {submissions.to} of {submissions.total} results
                                    </div>
                                    <div className="flex space-x-2">
                                        {submissions.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-3 py-2 text-sm rounded-md ${
                                                    link.active
                                                        ? 'bg-primary-600 text-white'
                                                        : link.url
                                                        ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
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
