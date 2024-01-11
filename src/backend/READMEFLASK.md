# Flask Development Setup and Usage Guide

Welcome to Flask development! This comprehensive guide will take you through the process of setting up a virtual environment and running your Flask application smoothly. Let's get started on your Flask journey.

## Initialize Your Virtual Environment
### (Only if you haven't set up the virtual environment)

1. Open your terminal or command prompt.

2. Navigate to your project directory.

3. Create a virtual environment named "env" using Python's built-in venv module:

    ```bash
    python -m venv env
    ```

4. Activate the virtual environment (Windows):

    ```bash
    env\Scripts\activate
    ```

## Install Dependencies

1. Make sure your virtual environment is activated (you should see "(env)" in your terminal prompt).

2. Install project dependencies from the requirements.txt file using pip:

    ```bash
    pip install -r requirements.txt
    ```

## Run Your Flask Application

1. Confirm that your virtual environment is still activated (you should see "(env)" in your terminal prompt).

2. Run your Flask application:

    ```bash
    flask run --debug
    ```

    This command will start your Flask app, and you will see output indicating that the server is running. By default, it will be accessible at http://127.0.0.1:5000/.

3. Open your web browser and navigate to the URL mentioned in the output to access your Flask application.

## Deactivate Your Virtual Environment

When you've completed your Flask development session, it's a good practice to deactivate the virtual environment:

1. Simply run the following command:

    ```bash
    deactivate
    ```

    This will return you to your system's global Python environment.

That's it! You've successfully set up a virtual environment for your Flask project, installed the necessary dependencies, and run your Flask application. Enjoy your journey with Flask!
