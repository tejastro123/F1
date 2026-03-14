import os
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.chains import RetrievalQA
from langchain_anthropic import ChatAnthropic
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv

load_dotenv()

F1_SYSTEM_PROMPT = """
You are an F1 expert assistant. Use the following pieces of retrieved context to answer the question.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Context: {context}
Question: {question}
Answer:"""

class F1RAGPipeline:
    def __init__(self, persist_directory: str = "ml/nlp/vector_store"):
        self.persist_directory = persist_directory
        self.embedder = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        self.vectorstore = Chroma(
            persist_directory=self.persist_directory,
            embedding_function=self.embedder
        )
        
        # Initialize LLM (Requires ANTHROPIC_API_KEY in .env)
        self.llm = ChatAnthropic(
            model="claude-3-5-sonnet-20240620",
            temperature=0,
            max_tokens=1024,
            timeout=None,
            max_retries=2,
        )
        
        self.chain = self._build_chain()

    def _build_chain(self):
        prompt = PromptTemplate(
            template=F1_SYSTEM_PROMPT, 
            input_variables=["context", "question"]
        )
        return RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=self.vectorstore.as_retriever(search_kwargs={"k": 5}),
            chain_type_kwargs={"prompt": prompt}
        )

    def ingest_documents(self, texts: list):
        """Adds new documents to the vector store."""
        print(f"Ingesting {len(texts)} documents...")
        self.vectorstore.add_texts(texts)
        self.vectorstore.persist()

    def query(self, question: str) -> str:
        """Runs the RAG chain for a given question."""
        try:
            response = self.chain.run(question)
            return response
        except Exception as e:
            return f"Error querying RAG system: {str(e)}"

if __name__ == "__main__":
    # Example usage / seeding
    rag = F1RAGPipeline()
    sample_texts = [
        "F1 2026 regulations focus on increased electrical power and sustainable fuels.",
        "Max Verstappen is the lead driver for Red Bull Racing.",
        "The Monaco Grand Prix is known for its tight streets and difficulty in overtaking."
    ]
    rag.ingest_documents(sample_texts)
    print("Query result:", rag.query("What do the 2026 regulations focus on?"))
