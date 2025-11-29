import { PictureAsPdf, Description, TableChart, Slideshow, Image, VideoFile, 
  AudioFile, InsertDriveFile } from '@mui/icons-material';

export const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.startsWith('video/')) return VideoFile;
  if (mimeType.startsWith('audio/')) return AudioFile;
  if (mimeType.includes('pdf')) return PictureAsPdf;
  if (mimeType.includes('word')) return Description;
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return TableChart;
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return Slideshow;
  return InsertDriveFile;
};

export const getFileTypeColor = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return '#4CAF50';
  if (mimeType.startsWith('video/')) return '#FF9800';
  if (mimeType.startsWith('audio/')) return '#9C27B0';
  if (mimeType.includes('pdf')) return '#F44336';
  if (mimeType.includes('word')) return '#2196F3';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '#107C41';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '#FF9800';
  return '#757575';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (dateString: string, t: (key: string, options?: any) => string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return t('date.updatedToday');
  if (diffDays === 2) return t('date.updatedYesterday');
  if (diffDays <= 7) return t('date.updatedDaysAgo', { days: diffDays - 1 });
  return date.toLocaleDateString();
};
