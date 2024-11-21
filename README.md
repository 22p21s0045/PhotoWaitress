# PhotoWaitress

## Overview

This platform is designed to automate the workflow for photographers who find it tedious to manually add presets, export raw files, and manage the entire post-processing routine. Our platform streamlines the process by automatically applying presets to raw images, handling exports, and organizing the workflow, saving photographers valuable time and effort. 

With this automation, photographers can focus more on their creative work and less on repetitive tasks, ensuring a faster and more efficient image processing pipeline. Whether it's adding exposure adjustments exporting files in various formats, this platform takes care of it all, leaving the photographer with more time to focus on their art.


## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 20 or higher)
- [npm](https://www.npmjs.com/) (usually installed along with Node.js)

# System Requirements

| Feature            | Supported OS      |
|--------------------|-------------------|
| Platform           | Windows Only 🖥️  |
| macOS Support      | In Development 🍏  |
| Linux Support      | Not Supported 🚫   |

**Note:** The platform is currently supported only on Windows 🖥️. macOS support is under development 🍏, and Linux is not supported 🚫 at the moment. Updates will be provided as development progresses.




## Installation

Follow these steps to set up the project:

1. Clone the repository:

    ```bash
    git clone https://github.com/22p21s0045/PhotoWaitress.git
    ```

2. Navigate to the project directory:

    ```bash
    cd PhotoWaitress
    ```

3. Install the necessary dependencies:

    ```bash
    npm install
    ```

    This will install all required packages specified in the `package.json` file.

## Setup
## Step 1: Run Setup

After installing dependencies, run the following command to complete any necessary setup for your project:

```bash
npm setup
```

## Step 2: Install RawTherapee

RawTherapee is available for Windows, macOS, and Linux. Follow the instructions for your operating system:

### For Windows
1. Download the installer from the [RawTherapee website](https://rawtherapee.com/downloads/).
2. Run the installer and follow the on-screen instructions.

### For macOS
1. Install RawTherapee via [Homebrew](https://brew.sh/):
   
```bash
   brew install rawtherapee
```

# How to Use ?

Follow the steps below to automate the processing of your raw image files.

## Steps

1. **Add Image to Input Folder**
   - Place your raw image files in the `./img/input` directory.

2. **Run the Processing Command**
   - Open your terminal and navigate to the project directory.
   - Run the following command to start processing:
     ```bash
     npm start
     ```

3. **Optional: Add Preset for RawTherapee**
   - If you want to use a custom preset, place the `.pp3` preset file in the `./img/presets` directory.
   - Open the `main.js` file and update the preset path to point to your new preset file.

4. **Output Files**
   - After the processing is complete, the output will be saved in the `./archives` folder.
   - The processed files will be stored as a ZIP archive.

---

Once you've completed these steps, your raw images will be processed based on the configurations and presets you've set.


