FROM python

WORKDIR /C270_Project_Team_5/tic-tac-toe

RUN pip install flask mysql-connector-python prometheus-client

COPY ./static ./static/
COPY ./templates ./templates/
COPY ./app.py ./app.py

EXPOSE 3306

ENV FLASK_DEBUG=0

CMD ["python", "-c", "from app import app; app.run(host='0.0.0.0', port=3306, debug=False)"]
