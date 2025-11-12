import { Activity } from '../types';

const STORAGE_KEY = 'project-activities';

export function getActivities(): Activity[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load activities from localStorage", error);
    return [];
  }
}

export function saveActivities(activities: Activity[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  // FIX: Added curly braces to the catch block for correct syntax.
  } catch (error) {
    console.error("Failed to save activities to localStorage", error);
  }
}
