
const FileListComponent = () => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center'}}>
            <table style={{ padding: 20, border: '1px solid black', textAlign: 'center', marginTop: 20, color: 'white' }}>
                <thead>
                    <tr>
                        <th>Indeks</th>
                        <th>Nazwa pliku</th>
                        <th>Rozmiar</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1.</td>
                        <td>ja.png</td>
                        <td>12 MB</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default FileListComponent;