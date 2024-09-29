import os
import tiktoken
import spacy
from nltk.corpus import stopwords

from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate

# Set your OpenAI API key securely (for testing only)
os.environ["OPENAI_API_KEY"] = ""

# Initialize tiktoken encoding and spaCy NLP
enc = tiktoken.get_encoding("o200k_base")
enc = tiktoken.encoding_for_model("gpt-4o")
nlp = spacy.load('en_core_web_sm')

# Define the prompt template for code simplification
template = """
You take code and output the absolute shortest version possible while retaining the same functionality.
You aggressively minimize the code by:
- Renaming variables to be as short as possible (e.g., 'a', 'b')
- Removing all comments and unnecessary spaces
- Inlining as many functions as possible
- Removing or combining unnecessary variables and operations
- Simplifying conditional logic, loops, and function calls
- Making use of advanced techniques such as list comprehensions, lambda functions, and ternary operators
- Removing redundancy or code that doesn't affect functionality

The goal is to make the code as compact as possible, aggressively reducing any unneeded content, while ensuring the core functionality remains intact.

make sure that the code length is at most half
Original Code:
{code}

Aggressively Simplified Code:
"""

prompt = PromptTemplate(
    input_variables=["code"],
    template=template,
)

# Initialize the OpenAI model (gpt-3.5-turbo)
llm = ChatOpenAI(model="gpt-3.5-turbo")

# Function to shorten code
# Function to shorten code
def shorten_code(code_input):
    # Use prompt template and LLM to process the input
    prompt_text = prompt.format_prompt(code=code_input).to_string()
    result = llm.invoke(prompt_text)  # Use invoke instead of calling llm directly
    simplified_code = result.content.strip()  # Access the content directly
    return simplified_code


# Function to write the result to a .txt file
def write_to_file(filename, content):
    with open(filename, 'w') as file:
        file.write(content)

# Function to process code using spaCy for lemmatization and stopword removal
def preprocess_code(code):
    # Tokenize, lemmatize, and remove stopwords
    stop_words = nlp.Defaults.stop_words
    doc = nlp(code)
    cleaned_code = " ".join([token.lemma_ for token in doc if token.text not in stop_words])
    return cleaned_code

# Function to calculate token usage and reduction percentage
def calculate_token_reduction(original_code, simplified_code):
    orig_tokens = enc.encode(original_code)
    new_tokens = enc.encode(simplified_code)
    
    orig_token_count = len(orig_tokens)
    new_token_count = len(new_tokens)
    
    print(f"Original token count: {orig_token_count}")
    print(f"Simplified token count: {new_token_count}")
    
    reduction = (orig_token_count - new_token_count) / orig_token_count * 100
    print(f"Percentage reduction in token count: {reduction:.2f}%")
    return reduction

# Example usage
if __name__ == "__main__":
    # Replace the input with a string directly in the code
    code_input = """
#include <iostream>
#include <cmath>
#include <vector>
#include <random>
#include <algorithm> // For std::max

// Function to calculate the cumulative normal distribution
double norm_cdf(double value) {
    return 0.5 * std::erfc(-value * std::sqrt(0.5));
}

// Black-Scholes Formula for European Option (Call and Put)
double black_scholes(bool isCall, double S, double K, double r, double T, double sigma) {
    double d1 = (log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrt(T));
    double d2 = d1 - sigma * sqrt(T);

    if (isCall) {
        return S * norm_cdf(d1) - K * exp(-r * T) * norm_cdf(d2);
    } else {
        return K * exp(-r * T) * norm_cdf(-d2) - S * norm_cdf(-d1);
    }
}

// Binomial Option Pricing Model
double binomial_option_pricing(bool isCall, int steps, double S, double K, double r, double T, double sigma) {
    double dt = T / steps;                     
    double u = exp(sigma * sqrt(dt));          
    double d = 1 / u;                          
    double p = (exp(r * dt) - d) / (u - d);    
    std::vector<double> prices(steps + 1);     

    for (int i = 0; i <= steps; i++) {
        prices[i] = S * pow(u, steps - i) * pow(d, i);
        double payoff = isCall ? std::max(0.0, prices[i] - K) : std::max(0.0, K - prices[i]);
        prices[i] = payoff;
    }

    for (int j = steps - 1; j >= 0; j--) {
        for (int i = 0; i <= j; i++) {
            prices[i] = (p * prices[i] + (1 - p) * prices[i + 1]) * exp(-r * dt);
        }
    }

    return prices[0];
}

// Monte Carlo Simulation for European Option Pricing (Call and Put)
double monte_carlo_option(bool isCall, int num_simulations, double S, double K, double r, double T, double sigma) {
    std::random_device rd; 
    std::mt19937 gen(rd());
    std::normal_distribution<> d(0, 1);

    std::vector<double> payoffs;

    for (int i = 0; i < num_simulations; ++i) {
        double Z = d(gen);
        double stock_price_at_maturity = S * exp((r - 0.5 * sigma * sigma) * T + sigma * sqrt(T) * Z);
        double payoff = isCall ? std::max(stock_price_at_maturity - K, 0.0) : std::max(K - stock_price_at_maturity, 0.0);
        payoffs.push_back(payoff);
    }

    double average_payoff = std::accumulate(payoffs.begin(), payoffs.end(), 0.0) / num_simulations;
    return exp(-r * T) * average_payoff;
}

int main() {
    std::cout << "Hello! I'm your friendly option pricing bot 🤖\n";
    std::cout << "Which model would you like to use today? (Type 'Black-Scholes', 'Binomial', or 'Monte Carlo')\n";
    std::string model;
    std::getline(std::cin, model);

    std::cout << "Do you want to price a Call or a Put option? (Type 'Call' or 'Put')\n";
    std::string optionType;
    std::getline(std::cin, optionType);
    bool isCall = (optionType == "Call");

    double S, K, r, T, sigma;
    std::cout << "Enter the current stock price (S): ";
    std::cin >> S;
    std::cout << "Enter the strike price (K): ";
    std::cin >> K;
    std::cout << "Enter the risk-free rate (r) as a decimal (e.g., 0.05 for 5%): ";
    std::cin >> r;
    std::cout << "Enter the time to expiration in years (T): ";
    std::cin >> T;
    std::cout << "Enter the volatility of the stock as a decimal (sigma): ";
    std::cin >> sigma;

    double price = 0.0;
    if (model == "Black-Scholes") {
        price = black_scholes(isCall, S, K, r, T, sigma);
        std::cout << "According to the Black-Scholes model, the " << optionType << " option price is: $" << price << "\n";
    } else if (model == "Binomial") {
        int steps;
        std::cout << "Enter the number of steps for the binomial model: ";
        std::cin >> steps;
        price = binomial_option_pricing(isCall, steps, S, K, r, T, sigma);
        std::cout << "According to the Binomial model, the " << optionType << " option price is: $" << price << "\n";
    } else if (model == "Monte Carlo") {
        int simulations;
        std::cout << "Enter the number of simulations for the Monte Carlo model: ";
        std::cin >> simulations;
        price = monte_carlo_option(isCall, simulations, S, K, r, T, sigma);
        std::cout << "According to the Monte Carlo model, the " << optionType << " option price is: $" << price << "\n";
    } else {
        std::cout << "Oops! It seems like you entered an unsupported model. Please try again.\n";
    }

    std::cout << "Thank you for using the Option Pricing Bot! Have a great day! 😊\n";
    return 0;
}
    """
    
    # Simplify the code
    simplified_code = shorten_code(code_input)
    
    # Save the result to a file
    output_file = "simplified_code.txt"
    write_to_file(output_file, simplified_code)
    
    # Token usage and reduction calculation
    calculate_token_reduction(code_input, simplified_code)
    
    print(f"Simplified code has been written to {output_file}")
