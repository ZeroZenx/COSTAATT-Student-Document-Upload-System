import { Head, Link, router, useForm } from '@inertiajs/inertia-react';
import AppLayout from '../../Layouts/AppLayout';
import { useState } from 'react';
import { 
    PlusIcon, 
    PencilIcon, 
    TrashIcon,
    EyeIcon,
    EyeSlashIcon,
    StarIcon,
    ArrowUpIcon,
    ArrowDownIcon
} from '@heroicons/react/24/outline';

export default function TermManagement({ terms }) {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingTerm, setEditingTerm] = useState(null);
    const [sorting, setSorting] = useState(false);

    const { data: createData, setData: setCreateData, post: createPost, processing: creating, reset: resetCreate } = useForm({
        name: '',
        start_date: '',
        end_date: '',
        is_active: true,
        is_current: false,
        description: '',
        sort_order: 0,
    });

    const { data: editData, setData: setEditData, put: editPut, processing: updating, reset: resetEdit } = useForm({
        name: '',
        start_date: '',
        end_date: '',
        is_active: true,
        is_current: false,
        description: '',
        sort_order: 0,
    });

    const handleCreate = (e) => {
        e.preventDefault();
        createPost('/admin/terms', {
            onSuccess: () => {
                setShowCreateForm(false);
                resetCreate();
            },
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        editPut(`/admin/terms/${editingTerm.id}`, {
            onSuccess: () => {
                setEditingTerm(null);
                resetEdit();
            },
        });
    };

    const handleDelete = (term) => {
        if (confirm(`Are you sure you want to delete "${term.name}"? This action cannot be undone.`)) {
            router.delete(`/admin/terms/${term.id}`);
        }
    };

    const handleToggleActive = (term) => {
        router.post(`/admin/terms/${term.id}/toggle-active`);
    };

    const handleSetCurrent = (term) => {
        router.post(`/admin/terms/${term.id}/set-current`);
    };

    const startEdit = (term) => {
        setEditingTerm(term);
        setEditData({
            name: term.name,
            start_date: term.start_date || '',
            end_date: term.end_date || '',
            is_active: term.is_active,
            is_current: term.is_current,
            description: term.description || '',
            sort_order: term.sort_order,
        });
    };

    const cancelEdit = () => {
        setEditingTerm(null);
        resetEdit();
    };

    const moveTerm = (term, direction) => {
        const currentIndex = terms.findIndex(t => t.id === term.id);
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        
        if (newIndex >= 0 && newIndex < terms.length) {
            const newTerms = [...terms];
            [newTerms[currentIndex], newTerms[newIndex]] = [newTerms[newIndex], newTerms[currentIndex]];
            
            // Update sort orders
            const updatedTerms = newTerms.map((t, index) => ({
                id: t.id,
                sort_order: index
            }));
            
            router.post('/admin/terms/sort-order', {
                terms: updatedTerms
            });
        }
    };

    const getStatusBadgeClass = (term) => {
        if (term.is_current) return 'badge-success';
        if (term.is_active) return 'badge-info';
        return 'badge-error';
    };

    const getStatusText = (term) => {
        if (term.is_current) return 'Current';
        if (term.is_active) return 'Active';
        return 'Inactive';
    };

    return (
        <AppLayout>
            <Head title="Term Management" />
            
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Term Management</h1>
                            <p className="mt-2 text-gray-600">
                                Manage intake terms for student admissions
                            </p>
                        </div>
                        <Link
                            href="/admin/admissions"
                            className="btn btn-secondary"
                        >
                            Back to Admissions Dashboard
                        </Link>
                    </div>
                </div>

                {/* Create Term Form */}
                {showCreateForm && (
                    <div className="card mb-6">
                        <div className="card-header">
                            <h3 className="text-lg font-semibold">Add New Term</h3>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleCreate}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="form-label">Term Name *</label>
                                        <input
                                            type="text"
                                            value={createData.name}
                                            onChange={(e) => setCreateData('name', e.target.value)}
                                            className="form-input"
                                            placeholder="e.g., September 2025"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">Sort Order</label>
                                        <input
                                            type="number"
                                            value={createData.sort_order}
                                            onChange={(e) => setCreateData('sort_order', parseInt(e.target.value) || 0)}
                                            className="form-input"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">Start Date</label>
                                        <input
                                            type="date"
                                            value={createData.start_date}
                                            onChange={(e) => setCreateData('start_date', e.target.value)}
                                            className="form-input"
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">End Date</label>
                                        <input
                                            type="date"
                                            value={createData.end_date}
                                            onChange={(e) => setCreateData('end_date', e.target.value)}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            value={createData.description}
                                            onChange={(e) => setCreateData('description', e.target.value)}
                                            className="form-input"
                                            rows="3"
                                            placeholder="Optional description for this term"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <div className="flex items-center space-x-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={createData.is_active}
                                                    onChange={(e) => setCreateData('is_active', e.target.checked)}
                                                    className="form-checkbox"
                                                />
                                                <span className="ml-2">Active</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={createData.is_current}
                                                    onChange={(e) => setCreateData('is_current', e.target.checked)}
                                                    className="form-checkbox"
                                                />
                                                <span className="ml-2">Current Term</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateForm(false)}
                                        className="btn btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="btn btn-primary"
                                    >
                                        {creating ? 'Creating...' : 'Create Term'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Terms List */}
                <div className="card">
                    <div className="card-header">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">
                                Terms ({terms.length})
                            </h3>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="btn btn-primary"
                            >
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Add Term
                            </button>
                        </div>
                    </div>
                    <div className="card-body p-0">
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Date Range</th>
                                        <th>Status</th>
                                        <th>Submissions</th>
                                        <th>Sort Order</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {terms.map((term) => (
                                        <tr key={term.id}>
                                            <td>
                                                {editingTerm?.id === term.id ? (
                                                    <input
                                                        type="text"
                                                        value={editData.name}
                                                        onChange={(e) => setEditData('name', e.target.value)}
                                                        className="form-input"
                                                        required
                                                    />
                                                ) : (
                                                    <div>
                                                        <div className="font-medium">{term.name}</div>
                                                        {term.description && (
                                                            <div className="text-sm text-gray-500">{term.description}</div>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                {editingTerm?.id === term.id ? (
                                                    <div className="space-y-2">
                                                        <input
                                                            type="date"
                                                            value={editData.start_date}
                                                            onChange={(e) => setEditData('start_date', e.target.value)}
                                                            className="form-input"
                                                        />
                                                        <input
                                                            type="date"
                                                            value={editData.end_date}
                                                            onChange={(e) => setEditData('end_date', e.target.value)}
                                                            className="form-input"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="text-sm">
                                                        {term.start_date && term.end_date ? (
                                                            <>
                                                                {new Date(term.start_date).toLocaleDateString()} - {' '}
                                                                {new Date(term.end_date).toLocaleDateString()}
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-400">No dates set</span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                {editingTerm?.id === term.id ? (
                                                    <div className="space-y-2">
                                                        <label className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={editData.is_active}
                                                                onChange={(e) => setEditData('is_active', e.target.checked)}
                                                                className="form-checkbox"
                                                            />
                                                            <span className="ml-2 text-sm">Active</span>
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={editData.is_current}
                                                                onChange={(e) => setEditData('is_current', e.target.checked)}
                                                                className="form-checkbox"
                                                            />
                                                            <span className="ml-2 text-sm">Current</span>
                                                        </label>
                                                    </div>
                                                ) : (
                                                    <span className={`badge ${getStatusBadgeClass(term)}`}>
                                                        {getStatusText(term)}
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <span className="text-sm text-gray-600">
                                                    {term.submissions_count || 0} submissions
                                                </span>
                                            </td>
                                            <td>
                                                {editingTerm?.id === term.id ? (
                                                    <input
                                                        type="number"
                                                        value={editData.sort_order}
                                                        onChange={(e) => setEditData('sort_order', parseInt(e.target.value) || 0)}
                                                        className="form-input w-20"
                                                        min="0"
                                                    />
                                                ) : (
                                                    <div className="flex items-center space-x-1">
                                                        <button
                                                            onClick={() => moveTerm(term, 'up')}
                                                            disabled={terms.indexOf(term) === 0}
                                                            className="btn btn-sm btn-ghost p-1"
                                                            title="Move up"
                                                        >
                                                            <ArrowUpIcon className="h-4 w-4" />
                                                        </button>
                                                        <span className="text-sm">{term.sort_order}</span>
                                                        <button
                                                            onClick={() => moveTerm(term, 'down')}
                                                            disabled={terms.indexOf(term) === terms.length - 1}
                                                            className="btn btn-sm btn-ghost p-1"
                                                            title="Move down"
                                                        >
                                                            <ArrowDownIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                {editingTerm?.id === term.id ? (
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={handleEdit}
                                                            disabled={updating}
                                                            className="btn btn-sm btn-primary"
                                                        >
                                                            {updating ? 'Saving...' : 'Save'}
                                                        </button>
                                                        <button
                                                            onClick={cancelEdit}
                                                            className="btn btn-sm btn-secondary"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex space-x-1">
                                                        <button
                                                            onClick={() => startEdit(term)}
                                                            className="btn btn-sm btn-ghost"
                                                            title="Edit term"
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleActive(term)}
                                                            className="btn btn-sm btn-ghost"
                                                            title={term.is_active ? 'Deactivate' : 'Activate'}
                                                        >
                                                            {term.is_active ? (
                                                                <EyeSlashIcon className="h-4 w-4" />
                                                            ) : (
                                                                <EyeIcon className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                        {!term.is_current && (
                                                            <button
                                                                onClick={() => handleSetCurrent(term)}
                                                                className="btn btn-sm btn-ghost"
                                                                title="Set as current term"
                                                            >
                                                                <StarIcon className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(term)}
                                                            className="btn btn-sm btn-ghost text-red-600 hover:text-red-700"
                                                            title="Delete term"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {terms.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="text-center py-8 text-gray-500">
                                                No terms found. Click "Add Term" to create your first term.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
