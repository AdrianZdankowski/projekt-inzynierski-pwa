import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

export const CardBox = styled(Box)(() => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: 24,
    justifyContent: 'center',
    maxWidth: '1000px',
    margin: '0 auto',
    backgroundColor: 'linear-gradient(135deg, #ffffff, #f0f7ff)'
}));