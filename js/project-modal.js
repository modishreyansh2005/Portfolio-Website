/**
 * Interactive Project Architecture Deep-Dive Modal for Shreyansh Modi
 * Displays real-world system diagrams, technical specifications, and reproducible code implementations.
 */

const projectDetailsData = {
  'proj-agentic': {
    title: 'Agentic AI Customer Support System',
    category: 'Autonomous Multi-Agent AI & RAG Workflows',
    specs: {
      framework: 'LangChain + Python + FastAPI',
      models: 'GPT-4o-mini / LLaMA-3 with Function Calling',
      retrieval: 'Hybrid Vector Search + BM25 Reranker',
      automation: 'Automated Ticket Classification & Response',
      latency: '< 850ms average turnaround'
    },
    diagram: [
      { step: '01', title: 'Intent Classification Agent', desc: 'Analyzes inbound user queries and extracts semantic intent, urgency, and category.' },
      { step: '02', title: 'Information Retrieval (RAG)', desc: 'Queries knowledge vector base using dense embeddings to extract accurate context.' },
      { step: '03', title: 'Action & API Execution Agent', desc: 'Triggers backend API integrations for account lookups, order tracking, and resolution actions.' },
      { step: '04', title: 'Response Synthesis & Verification', desc: 'Synthesizes empathetic, fact-checked responses strictly grounded on verified documentation.' }
    ],
    code: `# Agentic AI Customer Support Workflow (LangChain & Python)
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.vectorstores import Chroma
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2)

# Multi-Agent Tools
@tool
def query_knowledge_base(query: str) -> str:
    """Retrieve relevant organizational policies and technical docs."""
    retriever = Chroma(persist_directory="./chroma_db").as_retriever(k=4)
    docs = retriever.invoke(query)
    return "\\n".join([d.page_content for d in docs])

tools = [query_knowledge_base, execute_ticket_escalation]
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an autonomous customer support agent. Ground all replies strictly on verified facts."),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}")
])

agent = create_tool_calling_agent(llm, tools, prompt)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
`
  },
  'proj-rag': {
    title: 'PDF RAG Chatbot: Multi-Document Question-Answering',
    category: 'Retrieval-Augmented Generation & Vector Embeddings',
    specs: {
      pipeline: 'LangChain + ChromaDB / FAISS',
      embeddings: 'HuggingFace all-MiniLM-L6-v2',
      parsing: 'PyPDF2 / PDFMiner recursive chunking',
      interface: 'Streamlit / FastAPI Web App',
      accuracy: 'Zero-hallucination constraint'
    },
    diagram: [
      { step: '01', title: 'Document Parsing & Chunking', desc: 'Recursive character text splitting with 800-token chunk size and 150-token overlap.' },
      { step: '02', title: 'Dense Vector Embeddings', desc: 'Generates 384-dimensional semantic embeddings indexed in local vector storage.' },
      { step: '03', title: 'Top-K Cosine Retrieval', desc: 'Computes cosine similarity between user query vector and document chunk vectors.' },
      { step: '04', title: 'Context-Aware Answer Generation', desc: 'Feeds retrieved chunks into LLM prompt with strict citation verification.' }
    ],
    code: `# Multi-Document PDF RAG Pipeline (LangChain & Python)
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

# 1. Chunking and Parsing
text_splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=150)
docs = text_splitter.split_documents(loaded_pdf_pages)

# 2. Embedding Generation
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vector_db = FAISS.from_documents(docs, embeddings)

# 3. Retrieval
def query_pdf(question: str):
    retriever = vector_db.as_retriever(search_kwargs={"k": 4})
    context = retriever.invoke(question)
    return context
`
  },
  'proj-house': {
    title: 'House Price Prediction Regression System',
    category: 'Supervised Machine Learning & Predictive Analytics',
    specs: {
      algorithm: 'Random Forest & Gradient Boosting Regressor',
      libraries: 'Scikit-learn, Pandas, NumPy, Matplotlib',
      metric: 'R² Score: 0.892, RMSE: 0.124',
      preprocessing: 'One-Hot Encoding, MinMax Scaling, Outlier Capping',
      deployment: 'FastAPI REST Endpoint'
    },
    diagram: [
      { step: '01', title: 'Exploratory Data Analysis', desc: 'Identified skewed distributions, correlations, and missing value patterns.' },
      { step: '02', title: 'Feature Engineering', desc: 'Constructed interaction features (price/sqft, total rooms/bathrooms, proximity score).' },
      { step: '03', title: 'Cross-Validated Model Search', desc: 'Evaluated Linear Regression, Ridge, Random Forest, and XGBoost using K-Fold CV.' },
      { step: '04', title: 'Model Evaluation & Export', desc: 'Serialized top-performing pipeline with Joblib for sub-millisecond REST inference.' }
    ],
    code: `# House Price Prediction Pipeline (Scikit-learn & Python)
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer

# Column transformer for heterogeneous features
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), ['sqft', 'bedrooms', 'bathrooms', 'age']),
        ('cat', OneHotEncoder(drop='first'), ['location', 'property_type'])
    ]
)

model_pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(n_estimators=200, max_depth=12, random_state=42))
])

# Fit and evaluate
model_pipeline.fit(X_train, y_train)
r2_score = model_pipeline.score(X_test, y_test)
print(f"Model R^2 Score: {r2_score:.4f}")
`
  },
  'proj-gmb': {
    title: 'GMB Pro: AI Review Management & Magic QR',
    category: 'Enterprise AI & Google Business Profile Automation',
    specs: {
      company: 'Trentium Solution',
      tech: 'Python, FastAPI, OpenAI API, QR Engine',
      impact: 'Automated 80%+ review response workflows',
      features: 'Context-aware review generation & Magic QR scan',
      scale: 'Active production usage'
    },
    diagram: [
      { step: '01', title: 'Review Ingestion', desc: 'Ingests real-time Google Business Profile client reviews via webhook.' },
      { step: '02', title: 'Sentiment & Tone Analysis', desc: 'Classifies review sentiment (positive, neutral, negative) and identifies specific feedback points.' },
      { step: '03', title: 'Dynamic Reply Generation', desc: 'Crafts personalized, professional replies that respect brand voice guidelines.' },
      { step: '04', title: 'Magic QR Generation', desc: 'Generates branded smart QR codes that direct happy customers to leave rapid 5-star reviews.' }
    ],
    code: `# GMB Pro Review Generation Module
import openai

def generate_gmb_reply(review_text: str, rating: int, business_name: str) -> str:
    prompt = f"""
    You are an automated brand manager for {business_name}.
    Customer Review (Rating: {rating}/5 stars): "{review_text}"
    
    Generate a warm, professional, and personalized reply acknowledging the customer's specific remarks.
    """
    response = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=150
    )
    return response.choices[0].message.content
`
  }
};

function initProjectModal() {
  const modal = document.getElementById('project-modal');
  const modalClose = document.getElementById('modal-close-btn');
  const modalBackdrop = document.getElementById('modal-backdrop');

  if (!modal) return;

  function openModal(projectId) {
    const data = projectDetailsData[projectId];
    if (!data) return;

    document.getElementById('modal-title').textContent = data.title;
    document.getElementById('modal-category').textContent = data.category;

    // Specs
    const specsContainer = document.getElementById('modal-specs-list');
    if (specsContainer) {
      specsContainer.innerHTML = Object.entries(data.specs).map(([key, val]) => `
        <div class="modal-spec-item">
          <span class="spec-k">${key.toUpperCase()}:</span>
          <span class="spec-v">${val}</span>
        </div>
      `).join('');
    }

    // Diagram
    const diagramContainer = document.getElementById('modal-diagram-list');
    if (diagramContainer) {
      diagramContainer.innerHTML = data.diagram.map(item => `
        <div class="modal-diagram-step">
          <span class="step-num">${item.step}</span>
          <div class="step-content">
            <h5>${item.title}</h5>
            <p>${item.desc}</p>
          </div>
        </div>
      `).join('');
    }

    // Code
    const codeEl = document.getElementById('modal-code-snippet');
    if (codeEl) {
      codeEl.textContent = data.code;
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (window.classicalAudio) window.classicalAudio.playChime(659.25);
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    if (window.classicalAudio) window.classicalAudio.playTick(600);
  }

  // Trigger buttons
  document.querySelectorAll('[data-inspect-project]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const projId = btn.getAttribute('data-inspect-project');
      openModal(projId);
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // Copy Code Button
  const copyCodeBtn = document.getElementById('btn-copy-modal-code');
  if (copyCodeBtn) {
    copyCodeBtn.addEventListener('click', () => {
      const code = document.getElementById('modal-code-snippet').textContent;
      navigator.clipboard.writeText(code).then(() => {
        copyCodeBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        setTimeout(() => {
          copyCodeBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy Code';
        }, 2000);
      });
    });
  }
}

window.addEventListener('DOMContentLoaded', initProjectModal);
