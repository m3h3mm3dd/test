import React, { useState, useRef } from 'react';
import { Upload, X, File, FileText, Image, Film, Music, Archive, Code } from 'lucide-react';
import Button from './Button';
import Progress from './Progress';
import styles from '../../styles/iosStyles';

/**
 * iOS-style file upload component
 * 
 * @param {function} onUpload - Function called with uploaded file(s)
 * @param {boolean} multiple - Whether to allow multiple file selection
 * @param {string} accept - Accepted file types (MIME types)
 * @param {number} maxSize - Maximum file size in bytes
 * @param {number} maxFiles - Maximum number of files (for multiple)
 * @param {string} label - Label text
 * @param {string} helperText - Helper text
 * @param {string} errorMessage - Error message
 * @param {boolean} disabled - Whether the upload is disabled
 * @param {boolean} showPreview - Whether to show file preview
 * @param {boolean} dragDrop - Whether to enable drag and drop
 */
const FileUpload = ({
  onUpload,
  multiple = false,
  accept,
  maxSize,
  maxFiles = 5,
  label = 'Upload File',
  helperText,
  errorMessage,
  disabled = false,
  showPreview = true,
  dragDrop = true,
  className = '',
  ...rest
}) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);
  
  // Handle file selection via button click
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    validateAndProcessFiles(selectedFiles);
  };
  
  // Handle file selection via drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    const droppedFiles = Array.from(e.dataTransfer.files || []);
    validateAndProcessFiles(droppedFiles);
  };
  
  // Validate and process files
  const validateAndProcessFiles = (selectedFiles) => {
    // Clear previous error
    setError('');
    
    // Check if files exceed max number limit
    if (multiple && maxFiles && selectedFiles.length + files.length > maxFiles) {
      setError(`You can upload a maximum of ${maxFiles} files`);
      return;
    }
    
    // Process each file
    const validFiles = selectedFiles.filter(file => {
      // Check file type
      if (accept && !isFileTypeAccepted(file, accept)) {
        setError(`File type not accepted: ${file.name}`);
        return false;
      }
      
      // Check file size
      if (maxSize && file.size > maxSize) {
        setError(`File size exceeds ${formatBytes(maxSize)}: ${file.name}`);
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length > 0) {
      // Add preview URLs
      const newFiles = validFiles.map(file => ({
        file,
        id: generateFileId(file),
        preview: showPreview ? URL.createObjectURL(file) : null,
        name: file.name,
        size: file.size,
        type: file.type
      }));
      
      // Update files state
      if (multiple) {
        setFiles(prevFiles => [...prevFiles, ...newFiles]);
      } else {
        // Release previous preview URLs
        files.forEach(file => {
          if (file.preview) URL.revokeObjectURL(file.preview);
        });
        setFiles(newFiles.slice(0, 1));
      }
      
      // Start mock upload progress
      simulateFileUpload(newFiles);
      
      // Call onUpload callback
      if (onUpload) {
        onUpload(multiple ? newFiles.map(f => f.file) : newFiles[0].file);
      }
    }
  };
  
  // Simulate file upload
  const simulateFileUpload = (newFiles) => {
    newFiles.forEach(file => {
      setUploadProgress(prev => ({
        ...prev,
        [file.id]: 0
      }));
      
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const currentProgress = prev[file.id] || 0;
          
          if (currentProgress >= 100) {
            clearInterval(interval);
            return prev;
          }
          
          const increment = Math.floor(Math.random() * 10) + 5;
          const newProgress = Math.min(currentProgress + increment, 100);
          
          return {
            ...prev,
            [file.id]: newProgress
          };
        });
      }, 300);
    });
  };
  
  // Remove file
  const removeFile = (fileId) => {
    setFiles(prevFiles => {
      const fileToRemove = prevFiles.find(f => f.id === fileId);
      
      // Release preview URL
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      
      return prevFiles.filter(f => f.id !== fileId);
    });
    
    // Remove from progress
    setUploadProgress(prev => {
      const { [fileId]: _, ...rest } = prev;
      return rest;
    });
  };
  
  // Generate unique file ID
  const generateFileId = (file) => {
    return `${file.name}-${file.size}-${Date.now()}`;
  };
  
  // Check if file type is accepted
  const isFileTypeAccepted = (file, acceptString) => {
    if (!acceptString) return true;
    
    const acceptedTypes = acceptString.split(',').map(type => type.trim());
    const fileType = file.type;
    const fileExtension = `.${file.name.split('.').pop()}`;
    
    return acceptedTypes.some(type => {
      // Handle mime types with wildcards (e.g., image/*)
      if (type.endsWith('/*')) {
        const typeCategory = type.split('/')[0];
        return fileType.startsWith(`${typeCategory}/`);
      }
      
      // Handle specific types
      return type === fileType || type === fileExtension;
    });
  };
  
  // Format bytes to human-readable size
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  // Get file icon based on mime type
  const getFileIcon = (mimeType, fileName) => {
    if (!mimeType && fileName) {
      // Try to guess from extension
      const extension = fileName.split('.').pop().toLowerCase();
      
      if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
        return <Image size={24} />;
      } else if (['mp4', 'webm', 'avi', 'mov'].includes(extension)) {
        return <Film size={24} />;
      } else if (['mp3', 'wav', 'ogg'].includes(extension)) {
        return <Music size={24} />;
      } else if (['zip', 'rar', 'tar', 'gz'].includes(extension)) {
        return <Archive size={24} />;
      } else if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'xml'].includes(extension)) {
        return <Code size={24} />;
      } else if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension)) {
        return <FileText size={24} />;
      }
    }
    
    if (mimeType) {
      if (mimeType.startsWith('image/')) {
        return <Image size={24} />;
      } else if (mimeType.startsWith('video/')) {
        return <Film size={24} />;
      } else if (mimeType.startsWith('audio/')) {
        return <Music size={24} />;
      } else if (['application/zip', 'application/x-rar-compressed', 'application/x-tar'].includes(mimeType)) {
        return <Archive size={24} />;
      } else if (['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(mimeType)) {
        return <FileText size={24} />;
      } else if (['application/javascript', 'text/html', 'text/css', 'application/json'].includes(mimeType)) {
        return <Code size={24} />;
      }
    }
    
    return <File size={24} />;
  };
  
  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!disabled && dragDrop) {
      setIsDragging(true);
    }
  };
  
  // Handle drag leave
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  // Handle click on dropzone
  const handleDropzoneClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };
  
  return (
    <div className={`${className}`} {...rest}>
      {/* File input (hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        disabled={disabled}
        className="hidden"
        onChange={handleFileSelect}
      />
      
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      
      {/* Drag & drop zone */}
      {dragDrop ? (
        <div
          className={`mt-1 relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 transition-colors ${
            isDragging 
              ? 'border-blue-400 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={handleDropzoneClick}
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 mb-4">
            <Upload size={24} />
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isDragging ? 'Drop files here' : 'Drag and drop files here, or click to browse'}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {multiple 
              ? `You can upload up to ${maxFiles} files` 
              : 'You can upload one file'
            }
            {maxSize && ` (max ${formatBytes(maxSize)} each)`}
          </p>
          {accept && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Accepted file types: {accept}
            </p>
          )}
        </div>
      ) : (
        <Button
          variant="secondary"
          leftIcon={<Upload size={16} />}
          onClick={handleDropzoneClick}
          disabled={disabled}
          fullWidth
          className="mt-1"
        >
          Browse Files
        </Button>
      )}
      
      {/* Helper or error text */}
      {error ? (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : errorMessage ? (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      ) : helperText ? (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      ) : null}
      
      {/* File preview */}
      {files.length > 0 && (
        <div className="mt-4 space-y-3">
          {files.map((file) => (
            <div 
              key={file.id} 
              className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              {/* Preview thumbnail for images */}
              {file.preview && file.type.startsWith('image/') ? (
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-white dark:bg-gray-700 flex-shrink-0">
                  <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 text-gray-500 dark:text-gray-400">
                  {getFileIcon(file.type, file.name)}
                </div>
              )}
              
              {/* File info */}
              <div className="ml-3 flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{file.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatBytes(file.size)}
                </div>
                
                {/* Upload progress */}
                {uploadProgress[file.id] !== undefined && uploadProgress[file.id] < 100 && (
                  <div className="mt-1">
                    <Progress 
                      value={uploadProgress[file.id]} 
                      size="xs" 
                      color="primary" 
                      animated 
                    />
                  </div>
                )}
              </div>
              
              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(file.id);
                }}
                className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                aria-label="Remove file"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;