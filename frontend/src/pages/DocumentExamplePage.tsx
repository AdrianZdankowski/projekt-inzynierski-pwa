import { useState } from "react";
//import "@cyntler/react-doc-viewer/dist/index.css";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { Dialog, DialogTitle, DialogContent, Button, Container } from '@mui/material';
import testFile from '/sample-file.pdf';


const DocumentExamplePage = () => {
    const [open, setOpen] = useState(false);

    const documents = [{
        uri: testFile
    }];

    return (
    <>
    <Container maxWidth="sm">
        <Button 
        variant="contained" 
        onClick={() => setOpen(true)}
        sx={{ mt: 4 , display: 'block', mx: 'auto'}}
        >
        Otwórz PDF
        </Button>
    </Container>

    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Podgląd dokumentu</DialogTitle>
            <DialogContent dividers style={{ height: '80vh' }}>
                <DocViewer
                        documents={documents}
                        pluginRenderers={DocViewerRenderers}
                        style={{ height: "100%" }}
                    />
            </DialogContent>
    </Dialog> 
    </>
);
}

export default DocumentExamplePage;