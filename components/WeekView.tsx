import React, { useState, useEffect, useMemo } from 'react';
import { Activity } from '../types';
import { useNotifications } from './NotificationProvider';
import { FormField, FormFieldType, getFormConfig, saveFormConfig } from '../services/formConfigService';
import Modal from './icons/LoaderIcon';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import DragHandleIcon from './icons/DragHandleIcon';

interface ActivityFormProps {
  onSubmit: (activity: Omit<Activity, 'id'>) => void;
  isEditMode?: boolean;
  activityToEdit?: Activity;
  onCancel?: () => void;
  submittedActivity?: Activity | null;
  onClearSubmitted?: () => void;
  onNavigateToResults?: () => void;
  onEditNewActivity?: (activity: Activity) => void;
  isAdmin?: boolean;
}

const generateInitialData = (config: FormField[]): Omit<Activity, 'id'> => {
  const data: Partial<Activity> = {};
  config.forEach(field => {
    switch (field.type) {
      case 'number': data[field.id] = 0; break;
      case 'select': data[field.id] = field.options?.[0] || ''; break;
      default: data[field.id] = '';
    }
  });
  if (!data.status) data.status = 'Planned';
  return data as Omit<Activity, 'id'>;
};

const ActivityForm: React.FC<ActivityFormProps> = ({ onSubmit, isEditMode = false, activityToEdit, onCancel, submittedActivity, onClearSubmitted, onNavigateToResults, onEditNewActivity, isAdmin = false }) => {
  const [formConfig, setFormConfig] = useState<FormField[]>([]);
  const [formData, setFormData] = useState<Omit<Activity, 'id'>>({});
  const { addNotification } = useNotifications();
  
  const [isFormEditMode, setIsFormEditMode] = useState(false);
  const [editedConfig, setEditedConfig] = useState<FormField[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);

  useEffect(() => {
    const config = getFormConfig();
    setFormConfig(config);
    const initialData = generateInitialData(config);
    if (isEditMode && activityToEdit) {
      setFormData({ ...initialData, ...activityToEdit });
    } else {
      setFormData(initialData);
    }
  }, [isEditMode, activityToEdit]);
  
  const sortedFormConfig = useMemo(() => [...formConfig].sort((a, b) => a.order - b.order), [formConfig]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isNumber = type === 'number';
    setFormData(prev => ({ ...prev, [name]: isNumber && value !== '' ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.startDate || !formData.endDate) {
        addNotification('Please fill in Title, Start Date, and End Date.', 'warning');
        return;
    }
    onSubmit(formData);
  };

  const handleAddNew = () => {
    if (onClearSubmitted) onClearSubmitted();
    setFormData(generateInitialData(formConfig));
  };
  
  const handleEditSubmitted = () => {
    if (submittedActivity && onEditNewActivity) onEditNewActivity(submittedActivity);
  };

  // Admin Form Editor handlers
  const handleEnterEditMode = () => {
    setEditedConfig(JSON.parse(JSON.stringify(sortedFormConfig)));
    setIsFormEditMode(true);
  };

  const handleCancelEditMode = () => setIsFormEditMode(false);

  const handleSaveEditMode = () => {
    saveFormConfig(editedConfig);
    setFormConfig(editedConfig);
    setIsFormEditMode(false);
    addNotification('Form layout saved successfully!', 'success');
  };

  const handleRemoveField = (fieldId: string) => {
    setEditedConfig(prev => prev.filter(f => f.id !== fieldId));
  };

  const handleAddField = (newFieldData: { label: string; type: FormFieldType; required: boolean }) => {
    const newId = newFieldData.label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (editedConfig.some(f => f.id === newId)) {
      addNotification(`Field with ID '${newId}' already exists. Please choose a different label.`, 'error');
      return;
    }
    const newField: FormField = {
      ...newFieldData, id: `custom_${newId}`, order: editedConfig.length + 1, isDefault: false,
    };
    setEditedConfig(prev => [...prev, newField]);
    setIsFieldModalOpen(false);
  };

  // Drag and Drop handlers
  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragEnter = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const newConfig = [...editedConfig];
    const [removed] = newConfig.splice(draggedIndex, 1);
    newConfig.splice(index, 0, removed);
    setDraggedIndex(index);
    setEditedConfig(newConfig);
  };
  const handleDragEnd = () => setDraggedIndex(null);

  // Reusable component for dynamic fields
  const DynamicField: React.FC<{field: FormField, value: any}> = ({ field, value }) => {
    const commonProps = { id: field.id, name: field.id, value: String(value ?? ''), onChange: handleChange, required: field.required, className: "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500" };
    switch (field.type) {
      case 'textarea': return <textarea {...commonProps} rows={4} />;
      case 'select': return ( <select {...commonProps} value={value}>{field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select> );
      default: return <input {...commonProps} type={field.type} />;
    }
  };

  // Special view after submitting a new activity
  if (submittedActivity && !isEditMode) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Activity Added!</h2>
        <p className="mb-6">Your activity "{submittedActivity.title}" has been successfully submitted.</p>
        <div className="flex flex-wrap justify-center gap-4">
            <button onClick={onNavigateToResults} className="px-6 py-2 rounded-md text-sm font-medium text-white bg-sky-600 hover:bg-sky-700">View All Activities</button>
            <button onClick={handleEditSubmitted} className="px-6 py-2 rounded-md text-sm font-medium border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700">Edit This Activity</button>
            <button onClick={handleAddNew} className="px-6 py-2 rounded-md text-sm font-medium border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700">Add Another Activity</button>
        </div>
      </div>
    );
  }

  // Admin Form Editor View
  if (isFormEditMode) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Edit Form Fields</h2>
            <div className="flex gap-4">
                <button onClick={handleCancelEditMode} className="px-4 py-2 rounded-md text-sm font-medium border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700">Cancel</button>
                <button onClick={handleSaveEditMode} className="px-6 py-2 rounded-md text-sm font-medium text-white bg-sky-600 hover:bg-sky-700">Save Layout</button>
            </div>
        </div>
        <div className="space-y-3">
            {editedConfig.map((field, index) => (
                <div key={field.id} draggable onDragStart={() => handleDragStart(index)} onDragEnter={() => handleDragEnter(index)} onDragEnd={handleDragEnd} onDragOver={e => e.preventDefault()} className={`flex items-center gap-3 p-3 rounded-lg border bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 ${draggedIndex === index ? 'opacity-50' : ''}`}>
                    <button className="cursor-move text-slate-400 dark:text-slate-500"><DragHandleIcon className="w-6 h-6" /></button>
                    <div className="flex-grow font-medium text-slate-700 dark:text-slate-200">{field.label} <span className="text-xs text-slate-400">({field.type}{field.required ? ', required' : ''})</span></div>
                    {!field.isDefault && (
                        <button onClick={() => handleRemoveField(field.id)} className="p-1 text-slate-400 hover:text-red-500" aria-label="Remove field"><TrashIcon className="w-5 h-5" /></button>
                    )}
                </div>
            ))}
        </div>
        <button onClick={() => setIsFieldModalOpen(true)} className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium border-2 border-dashed border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400">
            <PlusIcon className="w-5 h-5" /> Add New Field
        </button>
        {isFieldModalOpen && <AddFieldModal onSave={handleAddField} onCancel={() => setIsFieldModalOpen(false)} />}
      </div>
    );
  }

  // Standard Form View
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg relative">
      <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">{isEditMode ? 'Edit Activity' : 'Add New Activity'}</h2>
      {isAdmin && !isEditMode && (
          <button onClick={handleEnterEditMode} className="absolute top-6 right-6 px-3 py-1.5 text-xs font-medium border rounded-md hover:bg-slate-50 dark:hover:bg-slate-700">Edit Form</button>
      )}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedFormConfig.map(field => (
          <div key={field.id} className={field.type === 'textarea' || ['title', 'notes'].includes(field.id) ? 'md:col-span-2 lg:col-span-3' : ''}>
             <label htmlFor={field.id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">{field.label}</label>
             <DynamicField field={field} value={formData[field.id]} />
          </div>
        ))}
        <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-4 mt-4">
            {isEditMode && onCancel && <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md text-sm font-medium border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700">Cancel</button>}
            <button type="submit" className="px-6 py-2 rounded-md text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-800">
                {isEditMode ? 'Save Changes' : 'Submit Activity'}
            </button>
        </div>
      </form>
    </div>
  );
};

// Internal component for the Add Field modal
const AddFieldModal: React.FC<{onSave: (data: {label: string, type: FormFieldType, required: boolean}) => void, onCancel: () => void}> = ({onSave, onCancel}) => {
  const [label, setLabel] = useState('');
  const [type, setType] = useState<FormFieldType>('text');
  const [required, setRequired] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (label.trim()) {
      onSave({ label, type, required });
    }
  };

  return (
    <Modal title="Add New Field" onClose={onCancel}>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label htmlFor="field-label" className="block text-sm font-medium">Field Label</label>
          <input id="field-label" type="text" value={label} onChange={e => setLabel(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
        </div>
        <div>
          <label htmlFor="field-type" className="block text-sm font-medium">Field Type</label>
          <select id="field-type" value={type} onChange={e => setType(e.target.value as FormFieldType)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md">
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="time">Time</option>
            <option value="textarea">Text Area</option>
          </select>
        </div>
        <div className="flex items-center">
          <input id="field-required" type="checkbox" checked={required} onChange={e => setRequired(e.target.checked)} className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-sky-600 focus:ring-sky-500" />
          <label htmlFor="field-required" className="ml-2 block text-sm">Make this field required</label>
        </div>
        <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md text-sm font-medium border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-md text-sm font-medium text-white bg-sky-600 hover:bg-sky-700">Add Field</button>
        </div>
      </form>
    </Modal>
  )
};

export default ActivityForm;