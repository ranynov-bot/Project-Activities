import { ActivityStatus } from '../types';

export type FormFieldType = 'text' | 'number' | 'date' | 'time' | 'textarea' | 'select';

export interface FormField {
  id: string;
  label: string;
  type: FormFieldType;
  options?: string[] | ActivityStatus[];
  required: boolean;
  order: number;
  isDefault: boolean;
}

const CONFIG_STORAGE_KEY = 'activity-form-config';

const STATUS_OPTIONS: ActivityStatus[] = ["Planned", "In Progress", "Completed", "Cancelled"];

const DEFAULT_CONFIG: FormField[] = [
  { id: 'title', label: 'Activity Title', type: 'text', required: true, order: 1, isDefault: true },
  { id: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, required: true, order: 2, isDefault: true },
  { id: 'participants', label: 'Number of Participants', type: 'number', required: false, order: 3, isDefault: true },
  { id: 'women', label: 'Number of Women', type: 'number', required: false, order: 4, isDefault: true },
  { id: 'location', label: 'Location', type: 'text', required: false, order: 5, isDefault: true },
  { id: 'venueCost', label: 'Venue Cost ($)', type: 'number', required: false, order: 6, isDefault: true },
  { id: 'startDate', label: 'Start Date', type: 'date', required: true, order: 7, isDefault: true },
  { id: 'endDate', label: 'End Date', type: 'date', required: true, order: 8, isDefault: true },
  { id: 'startTime', label: 'Start Time', type: 'time', required: false, order: 9, isDefault: true },
  { id: 'endTime', label: 'End Time', type: 'time', required: false, order: 10, isDefault: true },
  { id: 'organizedBy', label: 'Organized By', type: 'text', required: false, order: 11, isDefault: true },
  { id: 'notes', label: 'Notes', type: 'textarea', required: false, order: 12, isDefault: true },
];

export function getFormConfig(): FormField[] {
  try {
    const data = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (data) {
      const savedConfig = JSON.parse(data) as FormField[];
      const defaultConfigMap = new Map(DEFAULT_CONFIG.map(f => [f.id, f]));
      const savedConfigMap = new Map(savedConfig.map(f => [f.id, f]));

      const mergedConfig = DEFAULT_CONFIG.map(defaultField => {
        const savedField = savedConfigMap.get(defaultField.id);
        return savedField ? { ...defaultField, ...savedField, isDefault: true } : defaultField;
      });
      
      savedConfig.forEach(savedField => {
        if (!defaultConfigMap.has(savedField.id)) {
          mergedConfig.push(savedField);
        }
      });

      return mergedConfig.sort((a, b) => a.order - b.order);
    }
  } catch (error) {
    console.error("Failed to load form config from localStorage", error);
  }
  
  saveFormConfig(DEFAULT_CONFIG);
  return DEFAULT_CONFIG;
}

export function saveFormConfig(config: FormField[]): void {
  try {
    const orderedConfig = config.map((field, index) => ({ ...field, order: index + 1 }));
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(orderedConfig));
  } catch (error) {
    console.error("Failed to save form config to localStorage", error);
  }
}
