import spacy
import joblib

nlp = spacy.load("en_core_web_sm")

features = joblib.load("model_features.pkl")

def extract_symptoms(text: str) -> list[int]:
    """
    Takes a sentence like 'I have a fever and headache'
    and returns a 377-length binary vector matching the model's features.
    """
    doc = nlp(text.lower())
    
    tokens = set()
    for token in doc:
        tokens.add(token.text)
        tokens.add(token.lemma_)
    
    # Build the binary vector
    vector = []
    for feature in features:
        feature_words = set(feature.lower().replace("_", " ").split())
        match = any(word in tokens for word in feature_words)
        vector.append(1 if match else 0)
    
    return vector