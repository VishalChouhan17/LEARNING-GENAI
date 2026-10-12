from dotenv import load_dotenv
from openai import OpenAI
load_dotenv()
 
 
client=OpenAI()
text="My name is vishal"

response=client.embeddings.create(
input=text,
model="text-embedding-3-small"
       
       
)

print("embeddings",response.data[0].embedding)