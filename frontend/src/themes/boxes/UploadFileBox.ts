import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

interface UploadFileBoxProps {
  selectedFile?: boolean;
  isDragOver?: boolean;
}

export const UploadFileBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'selectedFile' && prop !== 'isDragOver'
})<UploadFileBoxProps>(({ theme, selectedFile, isDragOver }) => ({
  border: `2px dashed ${selectedFile ? '#ccc' : isDragOver ? '#1976d2' : '#ccc'}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: 'center',
  marginBottom: theme.spacing(2),
  backgroundColor: selectedFile ? '#f0f0f0' : isDragOver ? '#e3f2fd' : 'white',
  transition: 'all 0.2s ease-in-out',
  transform: selectedFile ? 'scale(1)' : isDragOver ? 'scale(1.02)' : 'scale(1)',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  opacity: selectedFile ? 0.6 : 1,
  pointerEvents: selectedFile ? 'none' : 'auto',
  '&:hover': selectedFile
    ? {}
    : {
        borderColor: '#1976d2',
        backgroundColor: '#f8f9fa',
      },
}));
