import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

export const DragDropBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  height: 600,
  boxShadow: theme.shadows[24],
  padding: 0,
  outline: 'none',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));