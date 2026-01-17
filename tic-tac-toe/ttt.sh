#!/bin/bash

mkdir tempdir
mkdir tempdir/templates
mkdir tempdir/static

cp app.py tempdir/.
cp -r templates/* tempdir/templates/.
cp -r static/* tempdir/static/.

echo "FROM python" > tempdir/Dockerfile
echo "RUN pip install flask" >> tempdir/Dockerfile
echo "COPY  ./static /C270_Project_Team_5/tic-tac-toe/static/" >> tempdir/Dockerfile
echo "COPY  ./templates /C270_Project_Team_5/tic-tac-toe/templates/" >> tempdir/Dockerfile
echo "COPY  app.py /C270_Project_Team_5/tic-tac-toe/" >> tempdir/Dockerfile

echo "EXPOSE 5000" >> tempdir/Dockerfile

echo "CMD python3 /C270_Project_Team_5/tic-tac-toe/app.py" >> tempdir/Dockerfile

cd tempdir
docker build -t tttapp .

docker run -t -d -p 5000:5000 --name tictactoeapp tttapp

docker ps -a

