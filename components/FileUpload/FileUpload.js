/**
 * FileUpload Component for rnxJS
 * Drag & drop file upload with preview and validation
 */

import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml } from '../../utils/security.js';

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
    onchange,
    onupload,
    className = ''
}) {
    let selectedFiles = [];
    let isDragOver = false;

    /**
     * Validate file
     */
    const validateFile = (file) => {
        if (maxSize && file.size > maxSize) {
            return `File size exceeds maximum (${formatBytes(maxSize)})`;
        }

        if (accept.length > 0) {
            const extension = '.' + file.name.split('.').pop().toLowerCase();
            if (!accept.includes(extension) && !accept.includes(file.type)) {
                return `File type not allowed: ${extension}`;
            }
        }

        return null;
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
     * Handle file selection
     */
    const handleFiles = (files) => {
        const fileArray = Array.from(files);
        const validFiles = [];
        const errors = [];

        for (const file of fileArray) {
            const error = validateFile(file);
            if (error) {
                errors.push(`${file.name}: ${error}`);
            } else {
                validFiles.push(file);
            }
        }

        if (maxFiles && validFiles.length + selectedFiles.length > maxFiles) {
            errors.push(`Maximum ${maxFiles} files allowed`);
        }

        if (!multiple) {
            selectedFiles = [validFiles[0]];
        } else {
            selectedFiles = [...selectedFiles, ...validFiles];
        }

        if (errors.length > 0) {
            alert(errors.join('\n'));
        }

        component.setState({ selectedFiles });

        if (onchange) {
            onchange(selectedFiles);
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
        if (type.startsWith('image/')) return 'bi-image';
        if (type.startsWith('video/')) return 'bi-play-circle';
        if (type.includes('pdf')) return 'bi-file-pdf';
        if (type.includes('word')) return 'bi-file-word';
        if (type.includes('sheet')) return 'bi-file-spreadsheet';
        return 'bi-file-earmark';
    };

    /**
     * Template function
     */
    const template = () => {
        return `
            <div class="file-upload-wrapper ${className}" data-ref="wrapper">
                ${label ? `<label class="form-label">${escapeHtml(label)}</label>` : ''}

                <div class="file-upload-zone ${isDragOver ? 'drag-over' : ''}" data-ref="dropZone">
                    <div class="upload-icon mb-3">
                        <i class="bi bi-cloud-arrow-up"></i>
                    </div>
                    <div class="upload-text">
                        <p class="upload-main">Drag and drop files here</p>
                        <p class="upload-sub">or <span class="upload-link">browse</span> to select</p>
                    </div>
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

                ${selectedFiles.length > 0 ? `
                    <div class="file-list mt-3">
                        <h6 class="mb-3">${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''} selected</h6>
                        <ul class="list-group">
                            ${selectedFiles.map((file, index) => `
                                <li class="list-group-item d-flex align-items-center justify-content-between">
                                    <div class="d-flex align-items-center">
                                        <i class="bi ${getFileIcon(file)} me-2"></i>
                                        <div>
                                            <div class="file-name">${escapeHtml(file.name)}</div>
                                            <small class="text-muted">${escapeHtml(formatBytes(file.size))}</small>
                                        </div>
                                    </div>
                                    <button type="button" class="btn btn-sm btn-danger file-remove" data-index="${index}">
                                        <i class="bi bi-x"></i>
                                    </button>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
    };

    // Create component
    const component = createComponent(template, {
        selectedFiles,
        isDragOver
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

        // Drag over
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            isDragOver = true;
            component.setState({ isDragOver });
        });

        // Drag leave
        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            isDragOver = false;
            component.setState({ isDragOver });
        });

        // Drop
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            isDragOver = false;
            component.setState({ isDragOver });
            handleFiles(e.dataTransfer.files);
        });

        // Remove file buttons
        el.querySelectorAll('.file-remove').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                removeFile(index);
            });
        });
    });

    // Export methods
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
