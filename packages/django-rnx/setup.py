"""Setup configuration for django-rnx package."""
from setuptools import setup, find_packages

with open('README.md', 'r', encoding='utf-8') as f:
    long_description = f.read()

setup(
    name='django-rnx',
    version='1.0.0',
    description='Django template tags for rnxJS reactive components',
    long_description=long_description,
    long_description_content_type='text/markdown',
    author='Arnel Irobles',
    author_email='arnel@arnelirobles.com',
    url='https://github.com/arnelirobles/rnxjs',
    license='MPL-2.0',
    packages=find_packages(exclude=['tests', 'example_app']),
    python_requires='>=3.8',
    install_requires=[
        'Django>=3.2',
    ],
    extras_require={
        'dev': [
            'pytest>=7.0',
            'pytest-django>=4.5',
            'pytest-cov>=4.0',
        ],
    },
    classifiers=[
        'Development Status :: 5 - Production/Stable',
        'Environment :: Web Environment',
        'Framework :: Django',
        'Framework :: Django :: 3.2',
        'Framework :: Django :: 4.0',
        'Framework :: Django :: 4.1',
        'Framework :: Django :: 4.2',
        'Framework :: Django :: 5.0',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: Mozilla Public License 2.0 (MPL 2.0)',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
        'Programming Language :: Python :: 3.11',
        'Programming Language :: Python :: 3.12',
        'Topic :: Internet :: WWW/HTTP',
        'Topic :: Internet :: WWW/HTTP :: Dynamic Content',
        'Topic :: Software Development :: Libraries :: Application Frameworks',
        'Topic :: Software Development :: Libraries :: Python Modules',
    ],
    keywords='django rnxjs reactive components template-tags',
    project_urls={
        'Documentation': 'https://github.com/arnelirobles/rnxjs/tree/main/packages/django-rnx',
        'Source Code': 'https://github.com/arnelirobles/rnxjs',
        'Issue Tracker': 'https://github.com/arnelirobles/rnxjs/issues',
        'Changelog': 'https://github.com/arnelirobles/rnxjs/releases',
    },
)
