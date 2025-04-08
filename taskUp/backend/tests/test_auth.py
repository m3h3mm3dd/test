# taskUp/backend/tests/test_auth.py
def test_register_user(client):
    """Test user registration"""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "Email": "newuser@example.com",
            "FirstName": "New",
            "LastName": "User",
            "Password": "Password123"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["Email"] == "newuser@example.com"
    assert "Id" in data
    assert "PasswordHash" not in data

def test_login_user(client, test_user):
    """Test user login and token generation"""
    response = client.post(
        "/api/v1/auth/token",
        json={
            "Email": "test@example.com",
            "Password": "Password123"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "user_id" in data

def test_login_invalid_credentials(client, test_user):
    """Test login with invalid credentials"""
    response = client.post(
        "/api/v1/auth/token",
        json={
            "Email": "test@example.com",
            "Password": "WrongPassword"
        }
    )
    
    assert response.status_code == 401
    data = response.json()
    assert "detail" in data

def test_get_current_user(client, token):
    """Test getting current user information"""
    response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["Email"] == "test@example.com"
    assert data["FirstName"] == "Test"
    assert data["LastName"] == "User"