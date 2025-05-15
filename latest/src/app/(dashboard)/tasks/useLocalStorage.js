'use client';

import React from 'react';
import { useState, useEffect } from 'react';

// A simple utility for working with localStorage
const useLocalStorage = (key, initialValue) => {
  // Get from local storage then parse stored json or return initialValue
  const getStoredValue = () => {
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading from localStorage", error);
      return initialValue;
    }
  };
  
  // State to store our value
  const [storedValue, setStoredValue] = useState(getStoredValue);
  
  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error("Error writing to localStorage", error);
    }
  };
  
  return [storedValue, setValue];
};

// Utility for task-related localStorage operations
export const useTaskStorage = () => {
  // Get task-specific data
  const getTaskData = (taskId) => {
    try {
      const data = localStorage.getItem(`task_${taskId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting task data from localStorage', error);
      return null;
    }
  };
  
  // Save task-specific data
  const saveTaskData = (taskId, data) => {
    try {
      localStorage.setItem(`task_${taskId}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving task data to localStorage', error);
    }
  };
  
  // Get attachments
  const getAttachments = (taskId) => {
    try {
      const attachments = localStorage.getItem(`attachments_${taskId}`);
      return attachments ? JSON.parse(attachments) : [];
    } catch (error) {
      console.error('Error getting attachments from localStorage', error);
      return [];
    }
  };
  
  // Save attachments
  const saveAttachments = (taskId, attachments) => {
    try {
      localStorage.setItem(`attachments_${taskId}`, JSON.stringify(attachments));
    } catch (error) {
      console.error('Error saving attachments to localStorage', error);
    }
  };
  
  // Get subtasks
  const getSubtasks = (taskId) => {
    try {
      const subtasks = localStorage.getItem(`subtasks_${taskId}`);
      return subtasks ? JSON.parse(subtasks) : [];
    } catch (error) {
      console.error('Error getting subtasks from localStorage', error);
      return [];
    }
  };
  
  // Save subtasks
  const saveSubtasks = (taskId, subtasks) => {
    try {
      localStorage.setItem(`subtasks_${taskId}`, JSON.stringify(subtasks));
    } catch (error) {
      console.error('Error saving subtasks to localStorage', error);
    }
  };
  
  return {
    getTaskData,
    saveTaskData,
    getAttachments,
    saveAttachments,
    getSubtasks,
    saveSubtasks
  };
};

export default useLocalStorage;