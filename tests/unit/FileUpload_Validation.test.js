/**
 * Tests for FileUpload validation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FileUpload } from '../../components/FileUpload/FileUpload.js';

describe('FileUpload Validation', () => {
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

    it('should reject files exceeding max size', (done) => {
        const maxSize = 1024 * 100; // 100KB
        const upload = FileUpload({
            maxSize: maxSize
        });

        container.appendChild(upload);

        setTimeout(() => {
            const largeFile = new File(
                ['x'.repeat(maxSize + 1000)],
                'large.bin',
                { type: 'application/octet-stream' }
            );

            const result = upload.addFiles([largeFile]);

            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors[0]).toMatch(/size|exceeds/i);

            done();
        }, 50);
    });

    it('should reject files with disallowed types', (done) => {
        const upload = FileUpload({
            accept: ['.jpg', '.png']
        });

        container.appendChild(upload);

        setTimeout(() => {
            const exeFile = new File(['MZ'], 'malware.exe', { type: 'application/exe' });
            const result = upload.addFiles([exeFile]);

            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors[0]).toMatch(/type|allowed/i);

            done();
        }, 50);
    });

    it('should accept files with correct types', (done) => {
        const upload = FileUpload({
            accept: ['.jpg', '.png']
        });

        container.appendChild(upload);

        setTimeout(() => {
            const jpgFile = new File(['content'], 'image.jpg', { type: 'image/jpeg' });
            const result = upload.addFiles([jpgFile]);

            expect(result.errors.length).toBe(0);
            expect(result.added.length).toBe(1);

            done();
        }, 50);
    });

    it('should enforce max file count', (done) => {
        const upload = FileUpload({
            maxFiles: 2
        });

        container.appendChild(upload);

        setTimeout(() => {
            const file1 = new File(['content'], 'file1.txt', { type: 'text/plain' });
            const file2 = new File(['content'], 'file2.txt', { type: 'text/plain' });
            const file3 = new File(['content'], 'file3.txt', { type: 'text/plain' });

            upload.addFiles([file1, file2]);
            const result = upload.addFiles([file3]);

            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors[0]).toMatch(/maximum|count/i);

            done();
        }, 50);
    });

    it('should validate file names for path traversal', (done) => {
        const upload = FileUpload();

        container.appendChild(upload);

        setTimeout(() => {
            const maliciousFile = new File(['content'], '../../../etc/passwd', { type: 'text/plain' });
            const result = upload.addFiles([maliciousFile]);

            // Should either reject or sanitize
            const files = upload.getFiles();
            const fileName = files[0]?.name || '';
            expect(fileName).not.toContain('..');

            done();
        }, 50);
    });

    it('should reject empty files if configured', (done) => {
        const upload = FileUpload({
            allowEmpty: false
        });

        container.appendChild(upload);

        setTimeout(() => {
            const emptyFile = new File([], 'empty.txt', { type: 'text/plain' });
            const result = upload.addFiles([emptyFile]);

            expect(result.errors.length).toBeGreaterThan(0);

            done();
        }, 50);
    });

    it('should handle multiple validation errors', (done) => {
        const upload = FileUpload({
            maxSize: 1000,
            accept: ['.jpg'],
            maxFiles: 1
        });

        container.appendChild(upload);

        setTimeout(() => {
            const file1 = new File(
                ['x'.repeat(2000)],
                'large.exe',
                { type: 'application/exe' }
            );
            const file2 = new File(['content'], 'image.jpg', { type: 'image/jpeg' });

            const result1 = upload.addFiles([file1]);
            expect(result1.errors.length).toBeGreaterThan(1);

            const result2 = upload.addFiles([file2]);
            expect(result2.errors.length).toBeGreaterThan(0);

            done();
        }, 50);
    });
});
