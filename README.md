# C270_Project_Team_5
# Tic Tac Toe – DevOps Project

Simple Tic Tac Toe web app used to demonstrate:
- GitHub version control
- Automated testing
- CI/CD using GitHub Actions
- DevOps best practices

How to Run Code 
- Ensure that you are in the 'C270_Project_Team_5\tic-tac-toe' directory for convenience
- Install flask (python -m pip install flask)
- Run 'python app.py' 
- Ignore the warning, and the app should be running on 'http://127.0.0.1:5000'
- If it says so otherwise, let team know JIC. 

How to Push Changes 
- open terminal
- go to repo folder path
- Run : git add .
- Run : git commit -m "commit message"
- Run : git checkout -b new-branch-name
- Run : git push origin new-branch-name 
- click on link in terminal saying "Create a pull request for 'new-branch-name' on GitHub by visiting:"
- click create pull request
- wait for all checks to pass
- when all checks passed, click merge pull request and confirm merge
- delete branch to keep branches clean

How to run app in Background:
- cd tic-tac-toe
- docker stack rm [previous-stack-name]
- wait for a few secs first
- docker stack deploy -c stack.yml [new-stack-name]
- preview if this is running by either checking in docker desktop, or running 'docker stack ls' 
- MAKE SURE NOT TO RUN OUTSIDE OF TIC-TAC-TOE FOLDER!
n