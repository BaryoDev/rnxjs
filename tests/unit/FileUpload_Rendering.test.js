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

    it('should render upload area with text and button', (done) => {
        const upload = FileUpload({
            accept: ['.jpg', '.png']
        });

        container.appendChild(upload);

        setTimeout(() => {
            const uploadArea = container.querySelector('.file-upload');
            expect(uploadArea).not.toBeNull();

            const text = container.querySelector('.file-upload-text');
            expect(text).not.toBeNull();

            const button = container.querySelector('.file-upload-button');
            expect(button).not.toBeNull();
            expect(button.textContent).toContain('Choose');

            done();
        }, 50);
    });

    it('should display drag-over class when dragging files', (done) => {
        const upload = FileUpload();
        container.appendChild(upload);

        setTimeout(() => {
            const uploadArea = container.querySelector('.file-upload');

            const dragEnterEvent = new DragEvent('dragenter', {
                bubbles: true,
                cancelable: true
            });
            uploadArea.dispatchEvent(dragEnterEvent);

            setTimeout(() => {
                expect(uploadArea.classList.contains('drag-over')).toBe(true);
                done();
            }, 50);
        }, 50);
    });

    it('should remove drag-over class when leaving', (done) => {
        const upload = FileUpload();
        container.appendChild(upload);

        setTimeout(() => {
            const uploadArea = container.querySelector('.file-upload');

            uploadArea.classList.add('drag-over');

            const dragLeaveEvent = new DragEvent('dragleave', {
                bubbles: true,
                cancelable: true
            });
            uploadArea.dispatchEvent(dragLeaveEvent);

            setTimeout(() => {
                expect(uploadArea.classList.contains('drag-over')).toBe(false);
                done();
            }, 50);
        }, 50);
    });

    it('should render file list when files are added', (done) => {
        const upload = FileUpload();
        container.appendChild(upload);

        setTimeout(() => {
            const file1 = new File(['content'], 'test.pdf', { type: 'application/pdf' });
            const file2 = new File(['content'], 'image.jpg', { type: 'image/jpeg' });

            upload.addFiles([file1, file2]);

            setTimeout(() => {
                const fileList = container.querySelector('.file-upload-list');
                expect(fileList).not.toBeNull();

                const items = container.querySelectorAll('.file-upload-item');
                expect(items.length).toBe(2);

                done();
            }, 50);
        }, 50);
    });

    it('should display file icons based on type', (done) => {
        const upload = FileUpload();
        container.appendChild(upload);

        setTimeout(() => {
            const pdfFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });
            upload.addFiles([pdfFile]);

            setTimeout(() => {
                const icon = container.querySelector('.file-upload-item-icon');
                expect(icon).not.toBeNull();
                expect(icon.textContent).toMatch(/📄|📃/);

                done();
            }, 50);
        }, 50);
    });

    it('should display file size in readable format', (done) => {
        const upload = FileUpload();
        container.appendChild(upload);

        setTimeout(() => {
            const file = new File(['x'.repeat(1024 * 5)], 'large.bin', { type: 'application/octet-stream' });
            upload.addFiles([file]);

            setTimeout(() => {
                const sizeText = container.querySelector('.file-upload-item-size');
                expect(sizeText).not.toBeNull();
                expect(sizeText.textContent).toMatch(/KB|MB/);

                done();
            }, 50);
        }, 50);
    });

    it('should render remove button for each file', (done) => {
        const upload = FileUpload();
        container.appendChild(upload);

        setTimeout(() => {
            const file = new File(['content'], 'test.txt', { type: 'text/plain' });
            upload.addFiles([file]);

            setTimeout(() => {
                const removeBtn = container.querySelector('.file-upload-item-remove');
                expect(removeBtn).not.toBeNull();

                done();
            }, 50);
        }, 50);
    });

    it('should hide file list when empty', (done) => {
        const upload = FileUpload();
        container.appendChild(upload);

        setTimeout(() => {
            const fileList = container.querySelector('.file-upload-list');
            const initialDisplay = fileList.style.display;

            expect(initialDisplay === 'none' || !initialDisplay).toBe(true);

            done();
        }, 50);
    });
});
