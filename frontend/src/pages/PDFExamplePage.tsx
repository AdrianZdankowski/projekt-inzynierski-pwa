import { useState } from "react";
import { Button, Container } from "@mui/material";
import sampleFile from "/sample-file.pdf";
import DocumentDialog from "../components/DocumentDialog";
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

const PDFExamplePage = () => {
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <>
            <Container maxWidth="sm">
                <Button
                    variant="contained"
                    onClick={handleOpen}
                    sx={{ mt: 4, display: "block", mx: "auto" }}
                >
                    Otwórz PDF
                </Button>
            </Container>

            <DocumentDialog
                open={open}
                onClose={handleClose}
                filePath={sampleFile}
                title="Przykładowy dokument PDF"
            />
        </>
    );
};

export default PDFExamplePage;
