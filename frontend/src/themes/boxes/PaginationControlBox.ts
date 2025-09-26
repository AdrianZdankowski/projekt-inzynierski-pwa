import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

export const PaginationControlBox = styled(Box)(() => ({
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
    padding: '40px 0',
    position: 'relative'
}));