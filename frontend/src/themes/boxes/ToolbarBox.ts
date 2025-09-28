import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

export const ToolbarBox = styled(Box)(() => ({
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 32,
    padding: '0 20px'
}));