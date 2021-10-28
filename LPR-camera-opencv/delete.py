from typing import Text
from numpy import number
import requests
import json


#x = requests.delete('https://beta-api-car-check.herokuapp.com/api/posts/609ffe1eb3d3f4000401b673')

x = requests.get('https://beta-api-car-check.herokuapp.com/api/posts')
data = json.loads(x.text)
count = data["count"]
for i in range(count) : 
    http = 'https://beta-api-car-check.herokuapp.com/api/posts/{num}'.format(num = data["carDoc"][i]["_id"])
    x = requests.delete(http)
    print('http is '+http)
    print('Number '+ data["carDoc"][i]["_id"]+' deleted')
print("All deleted")

#print(x.text)