import requests

def get_model_response(message):
    response = requests.post(
        "http://localhost:5000/generate",
        json={"message": message}
    )
    return response.json()["response"]

# Example usage
user_message = "Write poetry on physics"
response = get_model_response(user_message)
print(response) 