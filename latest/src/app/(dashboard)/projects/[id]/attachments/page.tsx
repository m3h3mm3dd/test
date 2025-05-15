'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';

// Icons
import {
  ArrowLeft,
  FileText,
  FileImage,
  FileSpreadsheet,
  FileCode,
  FilePdf,
  FileArchive,
  FileAudio,
  FileVideo,
  File,
  Download,
  Trash2,
  ExternalLink,
  Search,
  XCircle,
  Filter,
  UploadCloud,
  FolderOpen,
  FileUp,
  Plus,
} from 'lucide-react';

// Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from "@/components/ui/skeleton";
import { v4 as uuidv4 } from 'uuid';

// File type to icon mapping
const fileTypeIcons = {
  "image": <FileImage className="h-10 w-10 text-blue-500" />,
  "pdf": <FilePdf className="h-10 w-10 text-red-500" />,
  "spreadsheet": <FileSpreadsheet className="h-10 w-10 text-green-500" />,
  "document": <FileText className="h-10 w-10 text-indigo-500" />,
  "code": <FileCode className="h-10 w-10 text-purple-500" />,
  "archive": <FileArchive className="h-10 w-10 text-amber-500" />,
  "audio": <FileAudio className="h-10 w-10 text-pink-500" />,
  "video": <FileVideo className="h-10 w-10 text-cyan-500" />,
  "default": <File className="h-10 w-10 text-gray-500" />,
};

// File sources for labeling
const fileSources = {
  "resource": { name: "Resources", color: "bg-blue-500/10 text-blue-500" },
  "resourcePlan": { name: "Resource Plan", color: "bg-indigo-500/10 text-indigo-500" },
  "task": { name: "Tasks", color: "bg-green-500/10 text-green-500" },
  "risk": { name: "Risks", color: "bg-amber-500/10 text-amber-500" },
  "scope": { name: "Scope", color: "bg-purple-500/10 text-purple-500" },
  "project": { name: "Project", color: "bg-gray-500/10 text-gray-500" },
};

// Helper to determine file type icon
const getFileTypeIcon = (fileType) => {
  if (!fileType) return fileTypeIcons.default;
  
  if (fileType.includes('image')) return fileTypeIcons.image;
  if (fileType.includes('pdf')) return fileTypeIcons.pdf;
  if (fileType.includes('excel') || fileType.includes('spreadsheet') || fileType.includes('csv')) return fileTypeIcons.spreadsheet;
  if (fileType.includes('word') || fileType.includes('doc')) return fileTypeIcons.document;
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar')) return fileTypeIcons.archive;
  if (fileType.includes('audio')) return fileTypeIcons.audio;
  if (fileType.includes('video')) return fileTypeIcons.video;
  if (fileType.includes('code') || fileType.includes('json') || fileType.includes('html') || fileType.includes('css') || fileType.includes('javascript')) return fileTypeIcons.code;
  
  return fileTypeIcons.default;
};

// Attachment interface for type safety
interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  sourceId: string;
  sourceName: string;
  sourceType: string;
  createdAt: string;
}

export default function FilesPage() {
  const { id: projectId } = useParams();
  const router = useRouter();
  
  const [files, setFiles] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<Attachment | null>(null);
  
  // Fetch all attachments from various localStorage locations
  useEffect(() => {
    setLoading(true);
    
    // Small delay to simulate loading
    const timer = setTimeout(() => {
      const allFiles: Attachment[] = [];
      
      try {
        // Get resources and their attachments
        const storedResources = localStorage.getItem(`project_${projectId}_resources`);
        if (storedResources) {
          const resources = JSON.parse(storedResources);
          resources.forEach(resource => {
            if (resource.Attachments && Array.isArray(resource.Attachments)) {
              const resourceFiles = resource.Attachments.map(attachment => ({
                ...attachment,
                sourceId: resource.Id,
                sourceName: resource.Name,
                sourceType: 'resource',
                createdAt: attachment.createdAt || new Date().toISOString(),
              }));
              allFiles.push(...resourceFiles);
            }
          });
        }
        
        // Get resource plan attachments
        const storedResourcePlan = localStorage.getItem(`project_${projectId}_resource_plan`);
        if (storedResourcePlan) {
          const resourcePlan = JSON.parse(storedResourcePlan);
          if (resourcePlan.Attachments && Array.isArray(resourcePlan.Attachments)) {
            const planFiles = resourcePlan.Attachments.map(attachment => ({
              ...attachment,
              sourceId: resourcePlan.Id,
              sourceName: "Resource Plan",
              sourceType: 'resourcePlan',
              createdAt: attachment.createdAt || new Date().toISOString(),
            }));
            allFiles.push(...planFiles);
          }
        }
        
        // Get task attachments (assuming similar structure)
        const storedTasks = localStorage.getItem(`project_${projectId}_tasks`);
        if (storedTasks) {
          const tasks = JSON.parse(storedTasks);
          tasks.forEach(task => {
            if (task.Attachments && Array.isArray(task.Attachments)) {
              const taskFiles = task.Attachments.map(attachment => ({
                ...attachment,
                sourceId: task.Id,
                sourceName: task.Title,
                sourceType: 'task',
                createdAt: attachment.createdAt || new Date().toISOString(),
              }));
              allFiles.push(...taskFiles);
            }
          });
        }
        
        // Get risk attachments (assuming similar structure)
        const storedRisks = localStorage.getItem(`project_${projectId}_risks`);
        if (storedRisks) {
          const risks = JSON.parse(storedRisks);
          risks.forEach(risk => {
            if (risk.Attachments && Array.isArray(risk.Attachments)) {
              const riskFiles = risk.Attachments.map(attachment => ({
                ...attachment,
                sourceId: risk.Id,
                sourceName: risk.Title,
                sourceType: 'risk',
                createdAt: attachment.createdAt || new Date().toISOString(),
              }));
              allFiles.push(...riskFiles);
            }
          });
        }
        
        // Get project attachments
        const storedProjectFiles = localStorage.getItem(`project_${projectId}_files`);
        if (storedProjectFiles) {
          const projectFiles = JSON.parse(storedProjectFiles).map(attachment => ({
            ...attachment,
            sourceId: projectId,
            sourceName: "Project Files",
            sourceType: 'project',
            createdAt: attachment.createdAt || new Date().toISOString(),
          }));
          allFiles.push(...projectFiles);
        }
        
        // Sort files by created date (newest first)
        allFiles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setFiles(allFiles);
      } catch (error) {
        console.error("Error loading files:", error);
        toast.error("Failed to load attachments");
      } finally {
        setLoading(false);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [projectId]);
  
  // Filter files based on search and type filter
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === 'all') {
      return matchesSearch;
    }
    
    return file.sourceType === activeFilter && matchesSearch;
  });
  
  // Handle file upload
  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    if (uploadedFiles.length === 0) return;
    
    try {
      // Create attachment objects
      const newAttachments = uploadedFiles.map(file => ({
        id: uuidv4(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        sourceId: projectId,
        sourceName: "Project Files",
        sourceType: 'project',
        createdAt: new Date().toISOString(),
      }));
      
      // Get existing project files or initialize empty array
      const storedProjectFiles = localStorage.getItem(`project_${projectId}_files`);
      const projectFiles = storedProjectFiles ? JSON.parse(storedProjectFiles) : [];
      
      // Add new attachments
      const updatedFiles = [...projectFiles, ...newAttachments];
      
      // Save back to localStorage
      localStorage.setItem(`project_${projectId}_files`, JSON.stringify(updatedFiles));
      
      // Update state
      setFiles(prev => [...prev, ...newAttachments]);
      setShowUploadDialog(false);
      
      toast.success(`Added ${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''}`);
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Failed to upload files");
    }
  };
  
  // Handle file deletion
  const handleDeleteFile = () => {
    if (!selectedFile) return;
    
    try {
      // Determine which localStorage key to update based on sourceType
      let storageKey = '';
      let updateFunction = null;
      
      switch (selectedFile.sourceType) {
        case 'resource':
          storageKey = `project_${projectId}_resources`;
          updateFunction = (resources) => {
            const resourceIndex = resources.findIndex(r => r.Id === selectedFile.sourceId);
            if (resourceIndex !== -1) {
              resources[resourceIndex].Attachments = resources[resourceIndex].Attachments.filter(
                a => a.id !== selectedFile.id
              );
            }
            return resources;
          };
          break;
        
        case 'resourcePlan':
          storageKey = `project_${projectId}_resource_plan`;
          updateFunction = (plan) => {
            plan.Attachments = plan.Attachments.filter(a => a.id !== selectedFile.id);
            return plan;
          };
          break;
        
        case 'task':
          storageKey = `project_${projectId}_tasks`;
          updateFunction = (tasks) => {
            const taskIndex = tasks.findIndex(t => t.Id === selectedFile.sourceId);
            if (taskIndex !== -1) {
              tasks[taskIndex].Attachments = tasks[taskIndex].Attachments.filter(
                a => a.id !== selectedFile.id
              );
            }
            return tasks;
          };
          break;
        
        case 'risk':
          storageKey = `project_${projectId}_risks`;
          updateFunction = (risks) => {
            const riskIndex = risks.findIndex(r => r.Id === selectedFile.sourceId);
            if (riskIndex !== -1) {
              risks[riskIndex].Attachments = risks[riskIndex].Attachments.filter(
                a => a.id !== selectedFile.id
              );
            }
            return risks;
          };
          break;
        
        case 'project':
          storageKey = `project_${projectId}_files`;
          updateFunction = (files) => {
            return files.filter(f => f.id !== selectedFile.id);
          };
          break;
          
        default:
          throw new Error("Unknown source type");
      }
      
      // Update localStorage
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        const data = JSON.parse(storedData);
        const updatedData = updateFunction(data);
        localStorage.setItem(storageKey, JSON.stringify(updatedData));
      }
      
      // Update state
      setFiles(prev => prev.filter(f => f.id !== selectedFile.id));
      setSelectedFile(null);
      setShowDeleteDialog(false);
      
      toast.success("File deleted successfully");
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file");
      setShowDeleteDialog(false);
    }
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => router.push(`/projects/${projectId}`)}
                className="p-1 rounded-full hover:bg-muted transition-colors"
              >
                <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              <h2 className="text-sm font-medium text-muted-foreground">Project Files</h2>
            </div>
            <h1 className="text-2xl font-semibold">File Management</h1>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-grow max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search files..."
                className="pl-9 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="absolute right-2.5 top-2.5"
                  onClick={() => setSearchTerm('')}
                >
                  <XCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" /> 
                  <span className="hidden sm:inline">Filter</span>
                  {activeFilter !== 'all' && <span className="text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 ml-1">1</span>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem 
                  className={cn(activeFilter === 'all' && "bg-muted")}
                  onClick={() => setActiveFilter('all')}
                >
                  All Files
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className={cn(activeFilter === 'resource' && "bg-muted")}
                  onClick={() => setActiveFilter('resource')}
                >
                  Resource Files
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={cn(activeFilter === 'resourcePlan' && "bg-muted")}
                  onClick={() => setActiveFilter('resourcePlan')}
                >
                  Resource Plan Files
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={cn(activeFilter === 'task' && "bg-muted")}
                  onClick={() => setActiveFilter('task')}
                >
                  Task Files
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={cn(activeFilter === 'risk' && "bg-muted")}
                  onClick={() => setActiveFilter('risk')}
                >
                  Risk Files
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={cn(activeFilter === 'project' && "bg-muted")}
                  onClick={() => setActiveFilter('project')}
                >
                  Project Files
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              onClick={() => setShowUploadDialog(true)}
              className="gap-1"
            >
              <UploadCloud className="h-4 w-4" /> Upload Files
            </Button>
          </div>
        </div>

        {/* File tabs and content */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <Tabs defaultValue="all" className="w-full">
            <div className="border-b border-border px-4">
              <TabsList className="p-0 bg-transparent gap-2">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4 py-3"
                >
                  All Files
                </TabsTrigger>
                <TabsTrigger 
                  value="images" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4 py-3"
                >
                  Images
                </TabsTrigger>
                <TabsTrigger 
                  value="documents" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4 py-3"
                >
                  Documents
                </TabsTrigger>
                <TabsTrigger 
                  value="other" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4 py-3"
                >
                  Other
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Files content */}
            <div className="p-6">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-muted/50 rounded-lg p-4 animate-pulse">
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 bg-muted rounded"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-5 bg-muted rounded w-2/3"></div>
                          <div className="h-4 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredFiles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFiles.map(file => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-muted/50 rounded-lg p-4 hover:bg-muted transition-colors group"
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          {file.type && file.type.includes('image') ? (
                            <div className="w-12 h-12 rounded bg-primary/10 overflow-hidden">
                              <img
                                src={file.url}
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 flex items-center justify-center">
                              {getFileTypeIcon(file.type)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate" title={file.name}>
                            {file.name}
                          </h3>
                          <div className="flex items-center text-xs text-muted-foreground gap-1">
                            <span>{formatFileSize(file.size)}</span>
                            <span className="h-1 w-1 rounded-full bg-muted-foreground"></span>
                            <span>{format(new Date(file.createdAt), 'MMM d, yyyy')}</span>
                          </div>
                          
                          <div className="mt-2 flex justify-between items-center">
                            <div className={cn(
                              "text-xs px-2 py-1 rounded",
                              fileSources[file.sourceType]?.color || "bg-gray-500/10 text-gray-500"
                            )}>
                              {fileSources[file.sourceType]?.name || "Other"}
                            </div>
                            
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                variant="ghost" 
                                size="xs"
                                onClick={() => window.open(file.url, '_blank')}
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="xs"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                onClick={() => {
                                  setSelectedFile(file);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyFilesState
                  projectId={projectId}
                  searchTerm={searchTerm}
                  activeFilter={activeFilter}
                  onUpload={() => setShowUploadDialog(true)}
                />
              )}
            </div>
          </Tabs>
        </div>
      </div>
      
      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription>
              Add files to your project.
            </DialogDescription>
          </DialogHeader>
          
          <div className="border border-dashed border-border rounded-lg p-8 text-center">
            <FileUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="mb-4 text-muted-foreground">
              Drag & drop files or <label htmlFor="file-upload" className="text-primary cursor-pointer hover:underline">browse</label>
            </p>
            <Input
              id="file-upload"
              type="file"
              className="hidden"
              multiple
              onChange={handleFileUpload}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('file-upload').click()}
            >
              <Plus className="h-4 w-4 mr-2" /> Select Files
            </Button>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this file? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedFile && (
            <div className="bg-muted/50 p-4 rounded-lg mb-4">
              <div className="flex items-center gap-3">
                {selectedFile.type && selectedFile.type.includes('image') ? (
                  <div className="w-10 h-10 rounded bg-primary/10 overflow-hidden">
                    <img
                      src={selectedFile.url}
                      alt={selectedFile.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 flex items-center justify-center">
                    {getFileTypeIcon(selectedFile.type)}
                  </div>
                )}
                <div>
                  <div className="font-semibold">{selectedFile.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)} • {fileSources[selectedFile.sourceType]?.name || "Other"}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteFile}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Empty state component
function EmptyFilesState({ projectId, searchTerm, activeFilter, onUpload }) {
  if (searchTerm || activeFilter !== 'all') {
    return (
      <div className="text-center py-16">
        <XCircle className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">No matching files found</h3>
        <p className="text-muted-foreground mt-1 mb-4">
          Try adjusting your search or filters to find what you're looking for
        </p>
      </div>
    );
  }
  
  return (
    <div className="text-center py-16">
      <FolderOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
      <h3 className="text-lg font-semibold">No files added yet</h3>
      <p className="text-muted-foreground mt-1 mb-4">
        Upload files or add attachments to resources, tasks, or risks
      </p>
      <Button onClick={onUpload}>
        <UploadCloud className="h-4 w-4 mr-2" /> Upload Files
      </Button>
    </div>
  );
}