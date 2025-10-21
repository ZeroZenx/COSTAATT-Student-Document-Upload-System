import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { PlusIcon, PencilIcon, TrashIcon, AcademicCapIcon, DocumentTextIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function ProgrammeManagement({ programmes: initialProgrammes, availableDocTypes }) {
    const [programmes, setProgrammes] = useState(initialProgrammes);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDocumentsModal, setShowDocumentsModal] = useState(false);
    const [selectedProgramme, setSelectedProgramme] = useState(null);
    const [programmeDocuments, setProgrammeDocuments] = useState([]);
    const [loadingDocuments, setLoadingDocuments] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        department: 'ADMISSIONS',
        active: true,
        sort_order: 0,
    });

    const [documentFormData, setDocumentFormData] = useState({
        doc_type: '',
        required: true,
        sort_order: 0,
    });

    const handleAddProgramme = () => {
        router.post('/admin/programmes', formData, {
            onSuccess: () => {
                setShowAddModal(false);
                setFormData({
                    name: '',
                    code: '',
                    description: '',
                    department: 'ADMISSIONS',
                    active: true,
                    sort_order: 0,
                });
            },
            onError: (errors) => {
                console.error('Error adding programme:', errors);
                alert('Error adding programme. Please check the form and try again.');
            }
        });
    };

    const handleEditProgramme = () => {
        if (!selectedProgramme) return;

        router.put(`/admin/programmes/${selectedProgramme.id}`, formData, {
            onSuccess: () => {
                setShowEditModal(false);
                setSelectedProgramme(null);
                setFormData({
                    name: '',
                    code: '',
                    description: '',
                    department: 'ADMISSIONS',
                    active: true,
                    sort_order: 0,
                });
            },
            onError: (errors) => {
                console.error('Error updating programme:', errors);
                alert('Error updating programme. Please check the form and try again.');
            }
        });
    };

    const handleDeleteProgramme = (programme) => {
        if (confirm(`Are you sure you want to delete "${programme.name}"? This will also delete all associated document requirements.`)) {
            router.delete(`/admin/programmes/${programme.id}`, {
                onSuccess: () => {
                    console.log('Programme deleted successfully');
                },
                onError: (errors) => {
                    console.error('Error deleting programme:', errors);
                    alert('Error deleting programme. Please try again.');
                }
            });
        }
    };

    const handleToggleActive = (programme) => {
        router.post(`/admin/programmes/${programme.id}/toggle-active`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                console.log('Programme status toggled');
            }
        });
    };

    const openEditModal = (programme) => {
        setSelectedProgramme(programme);
        setFormData({
            name: programme.name,
            code: programme.code || '',
            description: programme.description || '',
            department: programme.department,
            active: programme.active,
            sort_order: programme.sort_order,
        });
        setShowEditModal(true);
    };

    const loadProgrammeDocuments = async (programme) => {
        setLoadingDocuments(true);
        try {
            const response = await fetch(`/admin/programmes/${programme.id}/documents`);
            const data = await response.json();
            if (data.success) {
                setProgrammeDocuments(data.documents);
            }
        } catch (error) {
            console.error('Error loading documents:', error);
            alert('Error loading documents. Please try again.');
        } finally {
            setLoadingDocuments(false);
        }
    };

    const openDocumentsModal = (programme) => {
        setSelectedProgramme(programme);
        setShowDocumentsModal(true);
        loadProgrammeDocuments(programme);
    };

    const handleAddDocument = async () => {
        if (!selectedProgramme || !documentFormData.doc_type) return;

        try {
            const response = await fetch(`/admin/programmes/${selectedProgramme.id}/documents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify(documentFormData),
            });

            const data = await response.json();

            if (data.success) {
                alert(data.message);
                loadProgrammeDocuments(selectedProgramme);
                setDocumentFormData({
                    doc_type: '',
                    required: true,
                    sort_order: 0,
                });
            } else {
                alert(data.message || 'Error adding document');
            }
        } catch (error) {
            console.error('Error adding document:', error);
            alert('Error adding document. Please try again.');
        }
    };

    const handleRemoveDocument = async (document) => {
        if (!confirm(`Are you sure you want to remove "${document.display_name}" from this programme?`)) {
            return;
        }

        try {
            const response = await fetch(`/admin/programmes/${selectedProgramme.id}/documents/${document.id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
            });

            const data = await response.json();

            if (data.success) {
                alert(data.message);
                loadProgrammeDocuments(selectedProgramme);
            } else {
                alert(data.message || 'Error removing document');
            }
        } catch (error) {
            console.error('Error removing document:', error);
            alert('Error removing document. Please try again.');
        }
    };

    const handleToggleRequired = async (document) => {
        try {
            const response = await fetch(`/admin/programmes/${selectedProgramme.id}/documents/${document.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify({
                    required: !document.required,
                    sort_order: document.sort_order,
                }),
            });

            const data = await response.json();

            if (data.success) {
                loadProgrammeDocuments(selectedProgramme);
            } else {
                alert(data.message || 'Error updating document');
            }
        } catch (error) {
            console.error('Error updating document:', error);
            alert('Error updating document. Please try again.');
        }
    };

    return (
        <>
            <Head title="Programme Management" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Programme Management</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Manage programmes and their document requirements
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                href="/admin"
                                className="btn btn-outline"
                            >
                                ← Back to Admin
                            </Link>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="btn btn-primary flex items-center gap-2"
                            >
                                <PlusIcon className="h-5 w-5" />
                                Add Programme
                            </button>
                        </div>
                    </div>

                    {/* Programmes Table */}
                    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Programme Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Code
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Department
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Documents
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Sort Order
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {programmes.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                                <AcademicCapIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                                                <p>No programmes found. Click "Add Programme" to create one.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        programmes.map((programme) => (
                                            <tr key={programme.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{programme.name}</div>
                                                    {programme.description && (
                                                        <div className="text-xs text-gray-500 mt-1">{programme.description}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {programme.code || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        programme.department === 'ADMISSIONS' 
                                                            ? 'bg-blue-100 text-blue-800' 
                                                            : 'bg-purple-100 text-purple-800'
                                                    }`}>
                                                        {programme.department}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <button
                                                        onClick={() => openDocumentsModal(programme)}
                                                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                                                    >
                                                        <DocumentTextIcon className="h-4 w-4" />
                                                        {programme.documents_count} docs ({programme.required_documents_count} required)
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleToggleActive(programme)}
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            programme.active
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}
                                                    >
                                                        {programme.active ? 'Active' : 'Inactive'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {programme.sort_order}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button
                                                            onClick={() => openEditModal(programme)}
                                                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProgramme(programme)}
                                                            className="text-red-600 hover:text-red-900 flex items-center gap-1"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Programme Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Programme</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Programme Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="e.g., General Nursing (AAS, BSc)"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Programme Code</label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({...formData, code: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="e.g., GN-AAS"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Optional description of the programme"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Department *</label>
                                    <select
                                        value={formData.department}
                                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="ADMISSIONS">Admissions</option>
                                        <option value="REGISTRY">Registry</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                                        <input
                                            type="number"
                                            value={formData.sort_order}
                                            onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value)})}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            min="0"
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.active}
                                                onChange={(e) => setFormData({...formData, active: e.target.checked})}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Active</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="btn btn-outline"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddProgramme}
                                    className="btn btn-primary"
                                    disabled={!formData.name}
                                >
                                    Add Programme
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Programme Modal */}
            {showEditModal && selectedProgramme && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Programme</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Programme Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Programme Code</label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({...formData, code: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Department *</label>
                                    <select
                                        value={formData.department}
                                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="ADMISSIONS">Admissions</option>
                                        <option value="REGISTRY">Registry</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                                        <input
                                            type="number"
                                            value={formData.sort_order}
                                            onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value)})}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            min="0"
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.active}
                                                onChange={(e) => setFormData({...formData, active: e.target.checked})}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Active</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedProgramme(null);
                                    }}
                                    className="btn btn-outline"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEditProgramme}
                                    className="btn btn-primary"
                                    disabled={!formData.name}
                                >
                                    Update Programme
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Manage Documents Modal */}
            {showDocumentsModal && selectedProgramme && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Document Requirements</h3>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Managing documents for: <strong>{selectedProgramme.name}</strong>
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowDocumentsModal(false);
                                        setSelectedProgramme(null);
                                        setProgrammeDocuments([]);
                                    }}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <XCircleIcon className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Add Document Form */}
                            <div className="bg-blue-50 p-4 rounded-lg mb-6">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Add Document Requirement</h4>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="col-span-2">
                                        <select
                                            value={documentFormData.doc_type}
                                            onChange={(e) => setDocumentFormData({...documentFormData, doc_type: e.target.value})}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                        >
                                            <option value="">Select a document type...</option>
                                            {availableDocTypes.map((docType) => (
                                                <option key={docType.value} value={docType.value}>
                                                    {docType.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={documentFormData.required}
                                                onChange={(e) => setDocumentFormData({...documentFormData, required: e.target.checked})}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Required</span>
                                        </label>
                                        <button
                                            onClick={handleAddDocument}
                                            disabled={!documentFormData.doc_type}
                                            className="btn btn-primary btn-sm"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Documents List */}
                            {loadingDocuments ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="mt-2 text-sm text-gray-500">Loading documents...</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                                        Current Document Requirements ({programmeDocuments.length})
                                    </h4>
                                    
                                    {programmeDocuments.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                                            <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-500">No documents added yet. Add document requirements above.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            {programmeDocuments.map((doc) => (
                                                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                                                    <div className="flex items-center gap-3">
                                                        {doc.required ? (
                                                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                                        ) : (
                                                            <XCircleIcon className="h-5 w-5 text-gray-400" />
                                                        )}
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{doc.display_name}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {doc.required ? 'Required' : 'Optional'} • Sort: {doc.sort_order}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleToggleRequired(doc)}
                                                            className="text-xs text-blue-600 hover:text-blue-900"
                                                        >
                                                            Toggle {doc.required ? 'Optional' : 'Required'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemoveDocument(doc)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => {
                                        setShowDocumentsModal(false);
                                        setSelectedProgramme(null);
                                        setProgrammeDocuments([]);
                                    }}
                                    className="btn btn-outline"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

