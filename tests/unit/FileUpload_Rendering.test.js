/**
 * Tests for FileUpload rendering
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FileUpload } from '../../components/FileUpload/FileUpload.js';

describe('FileUpload Rendering', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        if (container && container.parentNode) {
            document.body.removeChild(container);
        }
    });

    it('should render upload area with text and button', async () => {
        const upload = FileUpload({
            accept: ['.jpg', '.png']
        });

        container.appendChild(upload);

        await new Promise(resolve => setTimeout(resolve, 50));
        const uploadArea = container.querySelector('.file-upload');
        expect(uploadArea).not.toBeNull();

        const text = container.querySelector('.file-upload-text');
        expect(text).not.toBeNull();

        const button = container.querySelector('.file-upload-button');
        expect(button).not.toBeNull();
        expect(button.textContent).toContain('Choose');

    });

    it('should display drag-over class when dragging files', async () => {
        const upload = FileUpload();
        container.appendChild(upload);

        await new Promise(resolve => setTimeout(resolve, 50));
        const uploadArea = container.querySelector('.file-upload');

        const dragEnterEvent = new DragEvent('dragenter', {
            bubbles: true,
            cancelable: true
        });
        uploadArea.dispatchEvent(dragEnterEvent);

        await new Promise(resolve => setTimeout(resolve, 50));
        expect(uploadArea.classList.contains('drag-over')).toBe(true);
    });

    it('should remove drag-over class when leaving', async () => {
        const upload = FileUpload();
        container.appendChild(upload);

        await new Promise(resolve => setTimeout(resolve, 50));
        const uploadArea = container.querySelector('.file-upload');

        uploadArea.classList.add('drag-over');

        const dragLeaveEvent = new DragEvent('dragleave', {
            bubbles: true,
            cancelable: true
        });
        uploadArea.dispatchEvent(dragLeaveEvent);

        await new Promise(resolve => setTimeout(resolve, 50));
        expect(uploadArea.classList.contains('drag-over')).toBe(false);
    });

    it('should render file list when files are added', async () => {
        const upload = FileUpload();
        container.appendChild(upload);

        await new Promise(resolve => setTimeout(resolve, 50));
        const file1 = new File(['content'], 'test.pdf', { type: 'application/pdf' });
        const file2 = new File(['content'], 'image.jpg', { type: 'image/jpeg' });

        upload.addFiles([file1, file2]);

        await new Promise(resolve => setTimeout(resolve, 50));
        const fileList = container.querySelector('.file-upload-list');
        expect(fileList).not.toBeNull();

        const items = container.querySelectorAll('.file-upload-item');
        expect(items.length).toBe(2);

    });

    it('should display file icons based on type', async () => {
        const upload = FileUpload();
        container.appendChild(upload);

        await new Promise(resolve => setTimeout(resolve, 50));
        const pdfFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });
        upload.addFiles([pdfFile]);

        await new Promise(resolve => setTimeout(resolve, 50));
        const icon = container.querySelector('.file-upload-item-icon');
        expect(icon).not.toBeNull();
        expect(icon.textContent).toMatch(/📄|📃/);

    });

    it('should display file size in readable format', async () => {
        const upload = FileUpload();
        container.appendChild(upload);

        await new Promise(resolve => setTimeout(resolve, 50));
        const file = new File(['x'.repeat(1024 * 5)], 'large.bin', { type: 'application/octet-stream' });
        upload.addFiles([file]);

        await new Promise(resolve => setTimeout(resolve, 50));
        const sizeText = container.querySelector('.file-upload-item-size');
        expect(sizeText).not.toBeNull();
        expect(sizeText.textContent).toMatch(/KB|MB/);

    });

    it('should render remove button for each file', async () => {
        const upload = FileUpload();
        container.appendChild(upload);

        await new Promise(resolve => setTimeout(resolve, 50));
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        upload.addFiles([file]);

        await new Promise(resolve => setTimeout(resolve, 50));
        const removeBtn = container.querySelector('.file-upload-item-remove');
        expect(removeBtn).not.toBeNull();

    });

    it('should hide file list when empty', async () => {
        const upload = FileUpload();
        container.appendChild(upload);

        await new Promise(resolve => setTimeout(resolve, 50));
        const fileList = container.querySelector('.file-upload-list');
        const initialDisplay = fileList.style.display;

        expect(initialDisplay === 'none' || !initialDisplay).toBe(true);

    });
});
