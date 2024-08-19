import requests
import random
import time

def get_random_data(min_value=40, max_value=450):
    return random.randint(min_value, max_value)

def push_random_data_to_api():
    base_url = "http://localhost:4000/backend/insertHindalcoData"
    params = {
        f"s{i}": get_random_data() for i in range(1, 13)
    }
    
    response = requests.get(base_url, params=params)
    
    if response.status_code == 200:
        print("Data pushed successfully!")
    else:
        print(f"Failed to push data. Status code: {response.status_code}")

if __name__ == "__main__":
    while True:
        push_random_data_to_api()
        time.sleep(0.01)
