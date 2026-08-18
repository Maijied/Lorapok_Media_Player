from setuptools import setup, find_packages

setup(
    name="lorapok",
    version="1.5.0",
    packages=find_packages(),
    install_requires=[
        "requests>=2.25.0",
        "click>=8.0.0",
    ],
    entry_points={
        "console_scripts": [
            "lorapok = lorapok.cli:main",
        ],
    },
)
