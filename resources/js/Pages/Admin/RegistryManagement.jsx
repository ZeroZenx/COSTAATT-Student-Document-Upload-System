import { Head, Link, router, useForm } from '@inertiajs/react';
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

export default function RegistryManagement({ type, title, data }) {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const { data: createData, setData: setCreateData, post: createPost, processing: creating, reset: resetCreate } = useForm({
        name: '',
        start_date: '',
        end_date: '',
        is_active: true,
        is_current: false,
        description: '',
        sort_order: 0,
        short_name: '', // For semesters only
    });

    const { data: editData, setData: setEditData, put: editPut, processing: updating, reset: resetEdit } = useForm({
        name: '',
        start_date: '',
        end_date: '',
        is_active: true,
        is_current: false,
        description: '',
        sort_order: 0,
        short_name: '', // For semesters only
    });

    const handleCreate = (e) => {
        e.preventDefault();
        const routeName = type === 'academic-years' ? 'admin.registry.academic-years.store' : 'admin.registry.semesters.store';
        createPost(route(routeName), {
            onSuccess: () => {
                setShowCreateForm(false);
                resetCreate();
            },
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        const routeName = type === 'academic-years' ? 'admin.registry.academic-years.update' : 'admin.registry.semesters.update';
        editPut(route(routeName, editingItem.id), {
            onSuccess: () => {
                setEditingItem(null);
                resetEdit();
            },
        });
    };

    const handleDelete = (item) => {
        if (confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
            const routeName = type === 'academic-years' ? 'admin.registry.academic-years.destroy' : 'admin.registry.semesters.destroy';
            router.delete(route(routeName, item.id));
        }
    };

    const handleToggleActive = (item) => {
        const routeName = type === 'academic-years' ? 'admin.registry.academic-years.toggle-active' : 'admin.registry.semesters.toggle-active';
        router.post(route(routeName, item.id));
    };

    const handleSetCurrent = (item) => {
        const routeName = type === 'academic-years' ? 'admin.registry.academic-years.set-current' : 'admin.registry.semesters.set-current';
        router.post(route(routeName, item.id));
    };

    const startEdit = (item) => {
        setEditingItem(item);
        setEditData({
            name: item.name,
            start_date: item.start_date || '',
            end_date: item.end_date || '',
            is_active: item.is_active,
            is_current: item.is_current,
            description: item.description || '',
            sort_order: item.sort_order,
            short_name: item.short_name || '',
        });
    };

    const cancelEdit = () => {
        setEditingItem(null);
        resetEdit();
    };

    const getStatusBadgeClass = (item) => {
        if (item.is_current) return 'badge-success';
        if (item.is_active) return 'badge-info';
        return 'badge-error';
    };

    const getStatusText = (item) => {
        if (item.is_current) return 'Current';
        if (item.is_active) return 'Active';
        return 'Inactive';
    };

    const getBackUrl = () => {
        return type === 'academic-years' ? '/admin/registry' : '/admin/registry';
    };

    const getOtherTypeUrl = () => {
        return type === 'academic-years' ? '/admin/registry/semesters' : '/admin/registry/academic-years';
    };

    const getOtherTypeTitle = () => {
        return type === 'academic-years' ? 'Manage Semesters' : 'Manage Academic Years';
    };

    return (
        <AppLayout>
            <Head title={title} />
            
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                            <p className="mt-2 text-gray-600">
                                Manage {type === 'academic-years' ? 'academic years' : 'semesters'} for student registry
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <Link
                                href={getOtherTypeUrl()}
                                className="btn btn-outline"
                            >
                                {getOtherTypeTitle()}
                            </Link>
                            <Link
                                href={getBackUrl()}
                                className="btn btn-secondary"
                            >
                                Back to Registry Dashboard
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Create Form */}
                {showCreateForm && (
                    <div className="card mb-6">
                        <div className="card-header">
                            <h3 className="text-lg font-semibold">Add New {type === 'academic-years' ? 'Academic Year' : 'Semester'}</h3>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleCreate}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="form-label">Name *</label>
                                        <input
                                            type="text"
                                            value={createData.name}
                                            onChange={(e) => setCreateData('name', e.target.value)}
                                            className="form-input"
                                            placeholder={type === 'academic-years' ? 'e.g., 2025-2026' : 'e.g., Semester I'}
                                            required
                                        />
                                    </div>
                                    {type === 'semesters' && (
                                        <div>
                                            <label className="form-label">Short Name</label>
                                            <input
                                                type="text"
                                                value={createData.short_name}
                                                onChange={(e) => setCreateData('short_name', e.target.value)}
                                                className="form-input"
                                                placeholder="e.g., S1, S2"
                                                maxLength="10"
                                            />
                                        </div>
                                    )}
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
                                            placeholder="Optional description"
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
                                                <span className="ml-2">Current {type === 'academic-years' ? 'Academic Year' : 'Semester'}</span>
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
                                        {creating ? 'Creating...' : `Create ${type === 'academic-years' ? 'Academic Year' : 'Semester'}`}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Data List */}
                <div className="card">
                    <div className="card-header">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">
                                {type === 'academic-years' ? 'Academic Years' : 'Semesters'} ({data.length})
                            </h3>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="btn btn-primary"
                            >
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Add {type === 'academic-years' ? 'Academic Year' : 'Semester'}
                            </button>
                        </div>
                    </div>
                    <div className="card-body p-0">
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        {type === 'semesters' && <th>Short Name</th>}
                                        <th>Date Range</th>
                                        <th>Status</th>
                                        <th>Submissions</th>
                                        <th>Sort Order</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                {editingItem?.id === item.id ? (
                                                    <input
                                                        type="text"
                                                        value={editData.name}
                                                        onChange={(e) => setEditData('name', e.target.value)}
                                                        className="form-input"
                                                        required
                                                    />
                                                ) : (
                                                    <div>
                                                        <div className="font-medium">{item.name}</div>
                                                        {item.description && (
                                                            <div className="text-sm text-gray-500">{item.description}</div>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            {type === 'semesters' && (
                                                <td>
                                                    {editingItem?.id === item.id ? (
                                                        <input
                                                            type="text"
                                                            value={editData.short_name}
                                                            onChange={(e) => setEditData('short_name', e.target.value)}
                                                            className="form-input w-20"
                                                            maxLength="10"
                                                        />
                                                    ) : (
                                                        <span className="text-sm text-gray-600">{item.short_name || '-'}</span>
                                                    )}
                                                </td>
                                            )}
                                            <td>
                                                {editingItem?.id === item.id ? (
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
                                                        {item.start_date && item.end_date ? (
                                                            <>
                                                                {new Date(item.start_date).toLocaleDateString()} - {' '}
                                                                {new Date(item.end_date).toLocaleDateString()}
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-400">No dates set</span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                {editingItem?.id === item.id ? (
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
                                                    <span className={`badge ${getStatusBadgeClass(item)}`}>
                                                        {getStatusText(item)}
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <span className="text-sm text-gray-600">
                                                    {item.submissions_count || 0} submissions
                                                </span>
                                            </td>
                                            <td>
                                                {editingItem?.id === item.id ? (
                                                    <input
                                                        type="number"
                                                        value={editData.sort_order}
                                                        onChange={(e) => setEditData('sort_order', parseInt(e.target.value) || 0)}
                                                        className="form-input w-20"
                                                        min="0"
                                                    />
                                                ) : (
                                                    <span className="text-sm">{item.sort_order}</span>
                                                )}
                                            </td>
                                            <td>
                                                {editingItem?.id === item.id ? (
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
                                                            onClick={() => startEdit(item)}
                                                            className="btn btn-sm btn-ghost"
                                                            title="Edit"
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleActive(item)}
                                                            className="btn btn-sm btn-ghost"
                                                            title={item.is_active ? 'Deactivate' : 'Activate'}
                                                        >
                                                            {item.is_active ? (
                                                                <EyeSlashIcon className="h-4 w-4" />
                                                            ) : (
                                                                <EyeIcon className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                        {!item.is_current && (
                                                            <button
                                                                onClick={() => handleSetCurrent(item)}
                                                                className="btn btn-sm btn-ghost"
                                                                title={`Set as current ${type === 'academic-years' ? 'academic year' : 'semester'}`}
                                                            >
                                                                <StarIcon className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(item)}
                                                            className="btn btn-sm btn-ghost text-red-600 hover:text-red-700"
                                                            title="Delete"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {data.length === 0 && (
                                        <tr>
                                            <td colSpan={type === 'semesters' ? '7' : '6'} className="text-center py-8 text-gray-500">
                                                No {type === 'academic-years' ? 'academic years' : 'semesters'} found. Click "Add" to create your first one.
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
