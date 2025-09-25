import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
                            
export const UserIconBox = styled(Box)(() => ({
    width: 32,
    height: 32,
    borderRadius: '50%',
    backgroundColor: '#2e7d32',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: 'bold'
}));