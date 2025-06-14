import { useState } from "react";
import { Button, Container } from "@mui/material";
import DocumentDialog from "../components/DocumentDialog";

const TXTExamplePage = () => {
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    
    const docxFile = "/test.txt";

    return (
        <>
            <Container maxWidth="sm">
                <Button
                    variant="contained"
                    onClick={handleOpen}
                    sx={{ mt: 4, display: "block", mx: "auto" }}
                >
                    Otwórz DOCX
                </Button>
            </Container>

            <DocumentDialog
                open={open}
                onClose={handleClose}
                filePath={docxFile}
                title="Przykładowy dokument TXT"
            />
        </>
    );
};

export default TXTExamplePage;
