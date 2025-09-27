import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

export const MenuItemBox = styled(Box)(() => ({
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    width: 20,
    height: 20,
    borderRadius: '50%',
    color: 'white'
}));