/**
 * FileUpload Component for rnxJS - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Drag & drop file upload with preview and validation.
 */

import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml } from '../../utils/security.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

/**
 * Create a file upload component with drag & drop support
 *
 * @param {Object} options - Configuration options
 * @param {string} options.label - Input label
 * @param {Array} options.accept - Accepted file types (e.g., ['.jpg', '.png'])
 * @param {number} options.maxSize - Maximum file size in bytes
 * @param {number} options.maxFiles - Maximum number of files
 * @param {boolean} options.multiple - Allow multiple files (default: false)
 * @param {boolean} options.preview - Show file preview (default: true)
 * @param {Function} options.onchange - Change callback: (files) => {}
 * @param {Function} options.onupload - Upload callback: (files) => {}
 * @param {string} options.className - Additional CSS classes
 * @returns {HTMLElement} FileUpload component
 *
 * @example
 * const upload = FileUpload({
 *   label: 'Upload Image',
 *   accept: ['.jpg', '.png', '.gif'],
 *   maxSize: 5242880, // 5MB
 *   multiple: true,
 *   onchange: (files) => console.log(files)
 * });
 */
export function FileUpload({
    label = 'Upload Files',
    accept = [],
    maxSize = null,
    maxFiles = null,
    multiple = false,
    preview = true,
    allowEmpty = true,
    onchange,
    onupload,
    className = ''
} = {}) {
    let selectedFiles = [];

    /**
     * Validate file, returns array of error messages
     */
    const validateFile = (file) => {
        const errors = [];

        if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
            errors.push('Invalid file name');
        }

        if (maxSize && file.size > maxSize) {
            errors.push(`File size exceeds maximum (${formatBytes(maxSize)})`);
        }

        if (accept.length > 0) {
            const extension = '.' + file.name.split('.').pop().toLowerCase();
            if (!accept.includes(extension) && !accept.includes(file.type)) {
                errors.push(`File type not allowed: ${extension}`);
            }
        }

        if (allowEmpty === false && file.size === 0) {
            errors.push('File is empty');
        }

        return errors;
    };

    /**
     * Format bytes to human-readable
     */
    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    /**
     * Add files with validation, returns { added, errors }
     */
    const addFiles = (files) => {
        const fileArray = Array.from(files);
        const added = [];
        const errors = [];

        for (const file of fileArray) {
            const fileErrors = validateFile(file);
            if (fileErrors.length > 0) {
                errors.push(...fileErrors);
            } else {
                added.push(file);
            }
        }

        if (maxFiles && selectedFiles.length + added.length > maxFiles) {
            errors.push(`Maximum ${maxFiles} files allowed`);
            added.length = Math.max(0, maxFiles - selectedFiles.length);
        }

        selectedFiles = [...selectedFiles, ...added];
        component.setState({ selectedFiles });

        if (onchange) {
            onchange(selectedFiles);
        }

        return { added, errors };
    };

    /**
     * Handle file selection from input/drop
     */
    const handleFiles = (files) => {
        const { errors } = addFiles(files);
        if (errors.length > 0) {
            alert(errors.join('\n'));
        }
    };

    /**
     * Remove file
     */
    const removeFile = (index) => {
        selectedFiles.splice(index, 1);
        component.setState({ selectedFiles });

        if (onchange) {
            onchange(selectedFiles);
        }
    };

    /**
     * Get file icon
     */
    const getFileIcon = (file) => {
        const type = file.type;
        if (type.startsWith('image/')) return '🖼️';
        if (type.startsWith('video/')) return '🎬';
        if (type.startsWith('audio/')) return '🎵';
        if (type.includes('pdf')) return '📄';
        if (type.includes('word')) return '📝';
        if (type.includes('sheet')) return '📊';
        return '📃';
    };

    /**
     * Template function
     */
    const template = () => {
        // Resolve classes from active theme
        const wrapperClass = cn(resolveClasses('fileupload'), 'file-upload-wrapper', className);
        const zoneClass = cn(resolvePartClasses('fileupload', 'zone'), 'file-upload');

        return `
            <div class="${wrapperClass}" data-ref="wrapper">
                ${label ? `<label class="form-label">${escapeHtml(label)}</label>` : ''}

                <div class="${zoneClass}" data-ref="dropZone">
                    <div class="file-upload-text">
                        <p class="upload-main">Drag and drop files here</p>
                        <p class="upload-sub">or select files below</p>
                    </div>
                    <button type="button" class="file-upload-button" data-ref="browseButton">
                        Choose Files
                    </button>
                    ${accept.length > 0 ? `
                        <p class="upload-hint text-muted small">
                            Accepted: ${escapeHtml(accept.join(', '))}
                        </p>
                    ` : ''}
                    ${maxSize ? `
                        <p class="upload-hint text-muted small">
                            Max size: ${escapeHtml(formatBytes(maxSize))}
                        </p>
                    ` : ''}
                    <input type="file" id="fileInput" style="display: none;"
                           ${multiple ? 'multiple' : ''}
                           data-ref="input" />
                </div>

                <div class="file-upload-list mt-3" ${selectedFiles.length === 0 ? 'style="display: none;"' : ''}>
                    ${selectedFiles.map((file, index) => `
                        <div class="file-upload-item d-flex align-items-center justify-content-between">
                            <div class="d-flex align-items-center">
                                <span class="file-upload-item-icon me-2">${getFileIcon(file)}</span>
                                <div>
                                    <div class="file-upload-item-name">${escapeHtml(file.name)}</div>
                                    <small class="file-upload-item-size text-muted">${escapeHtml(formatBytes(file.size))}</small>
                                </div>
                            </div>
                            <button type="button" class="file-upload-item-remove btn btn-sm btn-danger" data-index="${index}">
                                &times;
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    };

    // Create component
    const component = createComponent(template, {
        selectedFiles
    });

    /**
     * Setup event listeners
     */
    component.useEffect((el) => {
        const dropZone = el.querySelector('[data-ref="dropZone"]');
        const input = el.querySelector('[data-ref="input"]');

        // Click to browse
        dropZone.addEventListener('click', () => {
            input.click();
        });

        // File input change
        input.addEventListener('change', (e) => {
            handleFiles(e.target.files);
            input.value = ''; // Reset input
        });

        // Drag enter
        dropZone.addEventListener('dragenter', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('drag-over');
        });

        // Drag over
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('drag-over');
        });

        // Drag leave
        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('drag-over');
        });

        // Drop
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('drag-over');
            handleFiles(e.dataTransfer.files);
        });

        // Remove file buttons
        el.querySelectorAll('.file-upload-item-remove').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                removeFile(index);
            });
        });
    });

    // Export methods
    component.addFiles = addFiles;
    component.getFiles = () => selectedFiles;
    component.clearFiles = () => {
        selectedFiles = [];
        component.setState({ selectedFiles });
    };
    component.upload = async (url) => {
        if (selectedFiles.length === 0) {
            throw new Error('No files selected');
        }

        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append('files', file);
        });

        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }

        if (onupload) {
            onupload(selectedFiles);
        }

        return response.json();
    };

    return component;
}
