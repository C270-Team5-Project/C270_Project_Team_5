FROM python
RUN pip install flask
COPY  ./static /C270_Project_Team_5/tic-tac-toe/static/
COPY  ./templates /C270_Project_Team_5/tic-tac-toe/templates/
COPY  app.py /C270_Project_Team_5/tic-tac-toe/
EXPOSE 5000
CMD python3 /C270_Project_Team_5/tic-tac-toe/app.py
