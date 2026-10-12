import tiktoken
 
 #tokenization
encoder=tiktoken.encoding_for_model("gpt-5o")
print("vocab",encoder.n_vocab);


text="this is my house"
print("encoder",encoder.encode(text));