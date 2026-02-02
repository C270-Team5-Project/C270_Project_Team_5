# Jun Kai
import pytest
from flask import Flask
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_home(client):
    rv = client.get('/')
    assert rv.status_code == 200
    assert b'Tic-Tac-Toe' in rv.data or b'Tic Tac Toe' in rv.data  # Check for title

def test_home_content(client):
    rv = client.get('/')
    assert b'<title>Tic Tac Toe</title>' in rv.data
    assert b'<h1>Tic Tac Toe</h1>' in rv.data
    assert b'<div id="board">' in rv.data

def test_app_imports():
    """Test that all necessary modules can be imported"""
    assert Flask is not None

def test_app_creation():
    """Test that the app can be created without errors"""
    test_app = Flask(__name__)
    assert test_app is not None

def test_404(client):
    rv = client.get('/nonexistent')
    assert rv.status_code == 404