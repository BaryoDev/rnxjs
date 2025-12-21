# FileUpload

A powerful file upload component with drag & drop support, file validation, preview, and async upload.

## Installation

Already included in rnxJS v0.4.0+

## Basic Usage

```javascript
import { FileUpload } from '@arnelirobles/rnxjs';

const upload = FileUpload({
    label: 'Upload Images',
    accept: ['.jpg', '.png', '.gif'],
    maxSize: 5242880, // 5MB
    multiple: true,
    onchange: (files) => console.log('Files:', files)
});

document.getElementById('app').appendChild(upload);
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | `'Upload Files'` | Input label |
| `accept` | Array | `[]` | Accepted file extensions/types |
| `maxSize` | number | null | Maximum file size in bytes |
| `maxFiles` | number | null | Maximum number of files |
| `multiple` | boolean | `false` | Allow multiple file selection |
| `preview` | boolean | `true` | Show file list preview |
| `onchange` | Function | null | Callback on file selection: `(files) => {}` |
| `onupload` | Function | null | Callback after upload: `(files) => {}` |
| `className` | string | `''` | Additional CSS classes |

## Methods

```javascript
const upload = FileUpload({ /* ... */ });

// Get selected files
const files = upload.getFiles();

// Clear all files
upload.clearFiles();

// Upload files to server
upload.upload('/api/upload')
    .then(response => console.log(response))
    .catch(error => console.error(error));
```

## Features

- **Drag & Drop**: Click or drag files into the zone
- **File Validation**: Type and size restrictions
- **Preview**: View selected files with icons and sizes
- **Multiple Uploads**: Select single or multiple files
- **Error Handling**: User-friendly error messages
- **Progress Feedback**: Loading states and status
- **Accessible**: Keyboard navigation support

## Examples

### Image Upload

```javascript
FileUpload({
    label: 'Profile Picture',
    accept: ['.jpg', '.jpeg', '.png'],
    maxSize: 2097152, // 2MB
    multiple: false,
    onchange: (files) => {
        if (files.length > 0) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('preview').src = e.target.result;
            };
            reader.readAsDataURL(files[0]);
        }
    }
})
```

### Document Upload

```javascript
FileUpload({
    label: 'Upload Documents',
    accept: ['.pdf', '.doc', '.docx'],
    maxSize: 10485760, // 10MB
    maxFiles: 5,
    multiple: true,
    onchange: (files) => {
        console.log(`${files.length} documents selected`);
    }
})
```

### With Server Upload

```javascript
const upload = FileUpload({
    label: 'Upload Files',
    multiple: true,
    onupload: (files) => {
        alert(`Uploaded ${files.length} files successfully!`);
    }
});

document.getElementById('uploadBtn').addEventListener('click', async () => {
    try {
        const response = await upload.upload('/api/upload');
        console.log('Upload response:', response);
    } catch (error) {
        console.error('Upload failed:', error);
    }
});
```

## Styling

```css
.file-upload-zone {
    border: 2px dashed #ccc;
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

.file-upload-zone.drag-over {
    border-color: #0b57d0;
    background-color: #f0f7ff;
}

.file-list {
    margin-top: 1rem;
}
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE 11 with polyfills
- Mobile browsers

## Related Components

- [Input](../Input/) - Basic file input
- [Modal](../Modal/) - File upload modal
- [ProgressBar](../ProgressBar/) - Upload progress

