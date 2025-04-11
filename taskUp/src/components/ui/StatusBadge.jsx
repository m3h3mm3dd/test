import React from 'react';
import { Clock, CheckCircle, Circle, AlertTriangle, XCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import styles from '../../styles/iosStyles';

/**
 * StatusBadge component for displaying task/project status
 * 
 * @param {string} status - Status string ('not started', 'in progress', 'completed', 'delayed', 'blocked')
 * @param {string} size - Badge size (sm, md, lg)
 * @param {boolean} withIcon - Whether to show status icon
 * @param {boolean} pill - Whether to use more rounded corners
 */
const StatusBadge = ({
  status,
  size = 'md',
  withIcon = true,
  pill = true,
  className = '',
  ...rest
}) => {
  const { darkMode } = useTheme();
  
  // Normalize status string
  const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '') || 'notstarted';
  
  // Get status config
  const getStatusConfig = () => {
    switch (normalizedStatus) {
      case 'inprogress':
        return {
          bg: darkMode ? styles.statusStyles.inProgress.darkBg : styles.statusStyles.inProgress.bg,
          text: darkMode ? styles.statusStyles.inProgress.darkText : styles.statusStyles.inProgress.text,
          label: 'In Progress',
          icon: <Clock size="1em" className="inline-block" />
        };
      case 'completed':
        return {
          bg: darkMode ? styles.statusStyles.completed.darkBg : styles.statusStyles.completed.bg,
          text: darkMode ? styles.statusStyles.completed.darkText : styles.statusStyles.completed.text,
          label: 'Completed',
          icon: <CheckCircle size="1em" className="inline-block" />
        };
      case 'delayed':
        return {
          bg: darkMode ? styles.statusStyles.delayed.darkBg : styles.statusStyles.delayed.bg,
          text: darkMode ? styles.statusStyles.delayed.darkText : styles.statusStyles.delayed.text,
          label: 'Delayed',
          icon: <AlertTriangle size="1em" className="inline-block" />
        };
      case 'blocked':
        return {
          bg: darkMode ? styles.statusStyles.blocked.darkBg : styles.statusStyles.blocked.bg,
          text: darkMode ? styles.statusStyles.blocked.darkText : styles.statusStyles.blocked.text,
          label: 'Blocked',
          icon: <XCircle size="1em" className="inline-block" />
        };
      case 'notstarted':
      default:
        return {
          bg: darkMode ? styles.statusStyles.notStarted.darkBg : styles.statusStyles.notStarted.bg,
          text: darkMode ? styles.statusStyles.notStarted.darkText : styles.statusStyles.notStarted.text,
          label: 'Not Started',
          icon: <Circle size="1em" className="inline-block" />
        };
    }
  };
  
  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-0.5';
      case 'lg':
        return 'text-sm px-3 py-1.5';
      case 'md':
      default:
        return 'text-xs px-2.5 py-1';
    }
  };
  
  const statusConfig = getStatusConfig();
  
  return (
    <span
      className={`
        inline-flex items-center justify-center font-medium
        ${pill ? 'rounded-full' : 'rounded-md'}
        ${getSizeClasses()}
        ${className}
      `}
      style={{
        backgroundColor: statusConfig.bg,
        color: statusConfig.text
      }}
      {...rest}
    >
      {withIcon && (
        <span className="mr-1">{statusConfig.icon}</span>
      )}
      {statusConfig.label}
    </span>
  );
};

export default StatusBadge;