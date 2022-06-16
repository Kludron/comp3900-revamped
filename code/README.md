# COMP3900_f1v3guy5

Setup 
- pip install pipenv
- pipenv shell
    If experiencing issues:
        Solution 1:
        First, remove your current version of virtualenv: pip uninstall virtualenv
        Then, remove your current version of pipenv: pip uninstall pipenv
        When you are asked Proceed (y/n)? just enter y. This will give you a clean slate.
        Finally, you can once again install pipenv and its dependencies: pip install pipenv

    Solution 2
        python -m pipenv

    Solution 3
    set PATH=%PATH%; set PATH=%PATH%; 'C:\Users\Natha\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.9_qbz5n2kfra8p0\LocalCache\local-packages\Python39\Scripts'  

    Solution 4
        Accidentally removed pipfile
        pipenv --rm
        then restart the whole process
- pip install psycopg2-binary flask flask-sqlalchemy
- exit

