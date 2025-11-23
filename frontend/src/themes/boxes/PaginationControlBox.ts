import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

export const PaginationControlBox = styled(Box)(() => ({
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
    paddingTop: '40px',
    paddingBottom: 0,
    position: 'relative'
}));