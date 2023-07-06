FROM python:3

WORKDIR /app
COPY ./src/backend /app

RUN pip install -r requirements.txt

CMD ["python", "src/test.py"]
